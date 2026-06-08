import { getDb, recalculateMonthlyStats, getMonthStrFromTimestamp } from './dbService';
import { triggerSync } from './syncEngine';
import { useSettingsStore } from '../store/settingsStore';

export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  method: string;
  transactionDate: number; // timestamp in ms
  source: 'manual' | 'voice' | 'receipt_scan';
  receiptUrl: string | null;
  syncStatus: 'pending' | 'synced' | 'deleted';
  createdAt: number;
  updatedAt: number;
  // Computed UI fields added by repository getAll() / getAllRaw() at runtime
  title?: string;
  currency?: string;
  merchant?: string | null;
}

export const generateId = (prefix: string = 'tx'): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let rand = '';
  for (let i = 0; i < 16; i++) {
    rand += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${Date.now()}_${rand}`;
};

export const transactionRepository = {
  /**
   * Fetch all active transactions (exclude soft-deleted ones)
   */
  getAll: async (): Promise<Transaction[]> => {
    const db = getDb();
    const rows = await db.getAllAsync<Transaction>(
      `SELECT * FROM transactions WHERE syncStatus != 'deleted' ORDER BY transactionDate DESC`
    );
    const globalCurrency = useSettingsStore.getState().currency || 'USD';
    return rows.map((r) => ({
      ...r,
      title: r.description || r.category,
      currency: globalCurrency,
    }));
  },

  /**
   * Fetch all transactions (including soft-deleted ones) for sync service
   */
  getAllRaw: async (): Promise<Transaction[]> => {
    const db = getDb();
    const rows = await db.getAllAsync<Transaction>(`SELECT * FROM transactions`);
    const globalCurrency = useSettingsStore.getState().currency || 'USD';
    return rows.map((r) => ({
      ...r,
      title: r.description || r.category,
      currency: globalCurrency,
    }));
  },

  /**
   * Fetch a single transaction by ID
   */
  getById: async (id: string): Promise<Transaction | null> => {
    const db = getDb();
    const row = await db.getFirstAsync<Transaction>(
      `SELECT * FROM transactions WHERE id = ? AND syncStatus != 'deleted'`,
      [id]
    );
    if (!row) return null;
    const globalCurrency = useSettingsStore.getState().currency || 'USD';
    return {
      ...row,
      title: row.description || row.category,
      currency: globalCurrency,
    };
  },

  /**
   * Insert a new transaction locally
   */
  create: async (tx: Omit<Transaction, 'id' | 'syncStatus' | 'createdAt' | 'updatedAt'>): Promise<Transaction> => {
    const db = getDb();
    const now = Date.now();
    const newTx: Transaction = {
      ...tx,
      id: generateId('tx'),
      syncStatus: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    await db.runAsync(
      `INSERT INTO transactions (id, type, amount, category, description, method, transactionDate, source, receiptUrl, syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newTx.id,
        newTx.type,
        newTx.amount,
        newTx.category,
        newTx.description,
        newTx.method,
        newTx.transactionDate,
        newTx.source,
        newTx.receiptUrl,
        newTx.syncStatus,
        newTx.createdAt,
        newTx.updatedAt,
      ]
    );

    // Recalculate stats for the month of this transaction
    const month = getMonthStrFromTimestamp(newTx.transactionDate);
    await recalculateMonthlyStats(month);

    // Asynchronously trigger sync engine
    triggerSync().catch((err) => console.error('Sync trigger error in create transaction:', err));

    return newTx;
  },

  /**
   * Update an existing transaction locally
   */
  update: async (id: string, updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>>): Promise<Transaction> => {
    const db = getDb();
    const existing = await transactionRepository.getById(id);
    if (!existing) {
      throw new Error(`Transaction with ID ${id} not found.`);
    }

    const originalMonth = getMonthStrFromTimestamp(existing.transactionDate);
    const now = Date.now();
    const updatedTx: Transaction = {
      ...existing,
      ...updates,
      syncStatus: 'pending',
      updatedAt: now,
    };

    await db.runAsync(
      `UPDATE transactions 
       SET type = ?, amount = ?, category = ?, description = ?, method = ?, transactionDate = ?, source = ?, receiptUrl = ?, syncStatus = ?, updatedAt = ?
       WHERE id = ?`,
      [
        updatedTx.type,
        updatedTx.amount,
        updatedTx.category,
        updatedTx.description,
        updatedTx.method,
        updatedTx.transactionDate,
        updatedTx.source,
        updatedTx.receiptUrl,
        updatedTx.syncStatus,
        updatedTx.updatedAt,
        id,
      ]
    );

    // Recalculate monthly stats (original month)
    await recalculateMonthlyStats(originalMonth);

    // Recalculate monthly stats (new month, if different)
    const newMonth = getMonthStrFromTimestamp(updatedTx.transactionDate);
    if (newMonth !== originalMonth) {
      await recalculateMonthlyStats(newMonth);
    }

    // Asynchronously trigger sync engine
    triggerSync().catch((err) => console.error('Sync trigger error in update transaction:', err));

    return updatedTx;
  },

  /**
   * Soft-delete a transaction locally (mark as deleted)
   */
  delete: async (id: string): Promise<void> => {
    const db = getDb();
    const existing = await transactionRepository.getById(id);
    if (!existing) {
      return; // Already deleted or doesn't exist
    }

    const month = getMonthStrFromTimestamp(existing.transactionDate);
    const now = Date.now();

    await db.runAsync(
      `UPDATE transactions 
       SET syncStatus = 'deleted', updatedAt = ?
       WHERE id = ?`,
      [now, id]
    );

    // Recalculate stats for the month (now excluding this transaction)
    await recalculateMonthlyStats(month);

    // Asynchronously trigger sync engine
    triggerSync().catch((err) => console.error('Sync trigger error in delete transaction:', err));
  },

  /**
   * Direct database sync method (used by sync engine to apply cloud writes or mark synced)
   */
  applySyncWrite: async (tx: Transaction): Promise<void> => {
    const db = getDb();
    await db.runAsync(
      `INSERT INTO transactions (id, type, amount, category, description, method, transactionDate, source, receiptUrl, syncStatus, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) 
       DO UPDATE SET 
         type = excluded.type,
         amount = excluded.amount,
         category = excluded.category,
         description = excluded.description,
         method = excluded.method,
         transactionDate = excluded.transactionDate,
         source = excluded.source,
         receiptUrl = excluded.receiptUrl,
         syncStatus = excluded.syncStatus,
         createdAt = excluded.createdAt,
         updatedAt = excluded.updatedAt`,
      [
        tx.id,
        tx.type,
        tx.amount,
        tx.category,
        tx.description,
        tx.method,
        tx.transactionDate,
        tx.source,
        tx.receiptUrl,
        tx.syncStatus,
        tx.createdAt,
        tx.updatedAt,
      ]
    );

    const month = getMonthStrFromTimestamp(tx.transactionDate);
    await recalculateMonthlyStats(month);
  },

  /**
   * Completely remove a record from SQLite (used after successful deletion in the cloud)
   */
  hardDelete: async (id: string): Promise<void> => {
    const db = getDb();
    await db.runAsync(`DELETE FROM transactions WHERE id = ?`, [id]);
  },

  /**
   * Fetch all stats records
   */
  getStats: async (): Promise<{ month: string; income: number; expense: number }[]> => {
    const db = getDb();
    return await db.getAllAsync<{ month: string; income: number; expense: number }>(
      `SELECT * FROM monthly_stats ORDER BY month DESC`
    );
  },

  /**
   * Fetch a single month's stats record
   */
  getStatsForMonth: async (monthStr: string): Promise<{ month: string; income: number; expense: number } | null> => {
    const db = getDb();
    const row = await db.getFirstAsync<{ month: string; income: number; expense: number }>(
      `SELECT * FROM monthly_stats WHERE month = ?`,
      [monthStr]
    );
    return row || null;
  }
};
