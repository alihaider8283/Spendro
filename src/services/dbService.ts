import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get the active SQLite database instance
 */
export const getDb = (): SQLite.SQLiteDatabase => {
  if (!db) {
    db = SQLite.openDatabaseSync('spendro.db');
  }
  return db;
};

/**
 * Initialize SQLite database tables and setup PRAGMAs
 */
export const initDb = async (): Promise<void> => {
  const database = getDb();
  
  // Enable foreign keys
  await database.execAsync('PRAGMA foreign_keys = ON;');
  
  // Create tables
  await database.execAsync(`
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      amount REAL NOT NULL,
      category TEXT NOT NULL,
      description TEXT,
      method TEXT,
      transactionDate INTEGER NOT NULL,
      source TEXT NOT NULL CHECK(source IN ('manual', 'voice', 'receipt_scan')),
      receiptUrl TEXT,
      syncStatus TEXT NOT NULL CHECK(syncStatus IN ('pending', 'synced', 'deleted')),
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      amount REAL NOT NULL,
      month TEXT NOT NULL, -- format YYYY-MM
      syncStatus TEXT NOT NULL CHECK(syncStatus IN ('pending', 'synced', 'deleted')),
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS monthly_stats (
      month TEXT PRIMARY KEY, -- format YYYY-MM
      income REAL NOT NULL DEFAULT 0.0,
      expense REAL NOT NULL DEFAULT 0.0
    );
  `);
};

/**
 * Recalculate monthly statistics for a given month and store them in monthly_stats
 * @param monthStr format: YYYY-MM
 */
export const recalculateMonthlyStats = async (monthStr: string): Promise<void> => {
  const database = getDb();
  
  // Compute start and end timestamps for the month in local timezone
  const [year, month] = monthStr.split('-').map(Number);
  const startTimestamp = new Date(year, month - 1, 1).getTime();
  const endTimestamp = new Date(year, month, 1).getTime() - 1;

  const result = await database.getFirstAsync<{ income: number | null; expense: number | null }>(
    `SELECT 
       SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
       SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
     FROM transactions 
     WHERE transactionDate >= ? AND transactionDate <= ?
       AND syncStatus != 'deleted'`,
    [startTimestamp, endTimestamp]
  );

  const totalIncome = result?.income ?? 0.0;
  const totalExpense = result?.expense ?? 0.0;

  // Upsert the results into monthly_stats
  await database.runAsync(
    `INSERT INTO monthly_stats (month, income, expense) 
     VALUES (?, ?, ?) 
     ON CONFLICT(month) 
     DO UPDATE SET income = excluded.income, expense = excluded.expense`,
    [monthStr, totalIncome, totalExpense]
  );
};

/**
 * Helper to get month string (YYYY-MM) from a timestamp
 */
export const getMonthStrFromTimestamp = (timestamp: number): string => {
  const dateObj = new Date(timestamp);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};
