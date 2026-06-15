import { getDb } from './dbService';
import { triggerSync } from './syncEngine';
import { generateId } from './transactionRepository';

export interface Budget {
  id: string;
  category: string;
  amount: number;
  month: string; // format: YYYY-MM
  syncStatus: 'pending' | 'synced' | 'deleted';
  createdAt: number;
  updatedAt: number;
}

export const budgetRepository = {
  /**
   * Fetch all active budgets (exclude soft-deleted ones)
   */
  getAll: async (): Promise<Budget[]> => {
    const db = getDb();
    const rows = await db.getAllAsync<Budget>(
      `SELECT * FROM budgets WHERE syncStatus != 'deleted' ORDER BY month DESC`
    );
    return rows;
  },

  /**
   * Fetch all budgets (including soft-deleted ones) for sync service
   */
  getAllRaw: async (): Promise<Budget[]> => {
    const db = getDb();
    const rows = await db.getAllAsync<Budget>(`SELECT * FROM budgets`);
    return rows;
  },

  /**
   * Fetch a single budget by ID
   */
  getById: async (id: string): Promise<Budget | null> => {
    const db = getDb();
    const row = await db.getFirstAsync<Budget>(
      `SELECT * FROM budgets WHERE id = ? AND syncStatus != 'deleted'`,
      [id]
    );
    return row || null;
  },

  /**
   * Create or update a budget locally
   */
  save: async (budget: Omit<Budget, 'syncStatus' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<Budget> => {
    const db = getDb();
    const now = Date.now();
    
    let existing: Budget | null = null;
    if (budget.id) {
      existing = await budgetRepository.getById(budget.id);
    }

    const savedBudget: Budget = {
      id: budget.id || generateId('bg'),
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      syncStatus: 'pending',
      createdAt: existing ? existing.createdAt : now,
      updatedAt: now,
    };

    await db.runAsync(
      `INSERT INTO budgets (id, category, amount, month, syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) 
       DO UPDATE SET 
         category = excluded.category,
         amount = excluded.amount,
         month = excluded.month,
         syncStatus = excluded.syncStatus,
         updatedAt = excluded.updatedAt`,
      [
        savedBudget.id,
        savedBudget.category,
        savedBudget.amount,
        savedBudget.month,
        savedBudget.syncStatus,
        savedBudget.createdAt,
        savedBudget.updatedAt,
      ]
    );

    // Asynchronously trigger sync engine
    triggerSync().catch((err) => console.error('Sync trigger error in save budget:', err));

    return savedBudget;
  },

  /**
   * Soft-delete a budget locally
   */
  delete: async (id: string): Promise<void> => {
    const db = getDb();
    const existing = await budgetRepository.getById(id);
    if (!existing) {
      return; // Already deleted or doesn't exist
    }

    const now = Date.now();
    await db.runAsync(
      `UPDATE budgets 
       SET syncStatus = 'deleted', updatedAt = ?
       WHERE id = ?`,
      [now, id]
    );

    // Asynchronously trigger sync engine
    triggerSync().catch((err) => console.error('Sync trigger error in delete budget:', err));
  },

  /**
   * Direct database sync method (used by sync engine to apply cloud writes or mark synced)
   */
  applySyncWrite: async (budget: Budget): Promise<void> => {
    const db = getDb();
    await db.runAsync(
      `INSERT INTO budgets (id, category, amount, month, syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) 
       DO UPDATE SET 
         category = excluded.category,
         amount = excluded.amount,
         month = excluded.month,
         syncStatus = excluded.syncStatus,
         createdAt = excluded.createdAt,
         updatedAt = excluded.updatedAt`,
      [
        budget.id,
        budget.category,
        budget.amount,
        budget.month,
        budget.syncStatus,
        budget.createdAt,
        budget.updatedAt,
      ]
    );
  },

  /**
   * Completely remove a record from SQLite (used after successful deletion in the cloud)
   */
  hardDelete: async (id: string): Promise<void> => {
    const db = getDb();
    await db.runAsync(`DELETE FROM budgets WHERE id = ?`, [id]);
  },

  /**
   * Fetch all active budgets for a specific month (YYYY-MM)
   */
  getForMonth: async (month: string): Promise<Budget[]> => {
    const db = getDb();
    const rows = await db.getAllAsync<Budget>(
      `SELECT * FROM budgets WHERE month = ? AND syncStatus != 'deleted' ORDER BY createdAt ASC`,
      [month]
    );
    return rows;
  },

  /**
   * Get the most recently updated set of budgets to use as the default template.
   * Groups by the month that has the highest updatedAt timestamp and returns
   * all budgets for that month.
   */
  getLatestDefaults: async (): Promise<Budget[]> => {
    const db = getDb();
    // Find the month with the most-recently updated budget entry
    const latestRow = await db.getFirstAsync<{ month: string }>(
      `SELECT month FROM budgets WHERE syncStatus != 'deleted' ORDER BY updatedAt DESC LIMIT 1`
    );
    if (!latestRow) return [];
    const rows = await db.getAllAsync<Budget>(
      `SELECT * FROM budgets WHERE month = ? AND syncStatus != 'deleted' ORDER BY createdAt ASC`,
      [latestRow.month]
    );
    return rows;
  },

  /**
   * Ensure the given month has budgets. If it doesn't, clone the latest
   * default budgets into that month and return them. If it already has
   * budgets, just return them. Safe to call multiple times — idempotent.
   */
  ensureMonthBudgets: async (month: string): Promise<Budget[]> => {
    const existing = await budgetRepository.getForMonth(month);
    if (existing.length > 0) return existing;

    const defaults = await budgetRepository.getLatestDefaults();
    if (defaults.length === 0) return []; // No defaults configured yet

    const now = Date.now();
    const cloned: Budget[] = defaults.map((d) => ({
      id: generateId('bg'),
      category: d.category,
      amount: d.amount,
      month,
      syncStatus: 'pending' as const,
      createdAt: now,
      updatedAt: now,
    }));

    const db = getDb();
    for (const b of cloned) {
      await db.runAsync(
        `INSERT INTO budgets (id, category, amount, month, syncStatus, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [b.id, b.category, b.amount, b.month, b.syncStatus, b.createdAt, b.updatedAt]
      );
    }

    // Trigger sync for the new records (non-blocking)
    triggerSync().catch((err) => console.error('Sync trigger error in ensureMonthBudgets:', err));

    return cloned;
  },
};
