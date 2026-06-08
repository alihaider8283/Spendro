import { AppState, AppStateStatus } from 'react-native';
import { getDb } from './dbService';
import { transactionRepository, Transaction } from './transactionRepository';
import { budgetRepository, Budget } from './budgetRepository';
import { firestoreBackupService } from './firestoreBackupService';
import { useAuthStore } from '../store/authStore';
import { useSettingsStore } from '../store/settingsStore';

let isSyncing = false;
let syncInterval: ReturnType<typeof setInterval> | null = null;
let lastSyncedTime: number = 0;

/**
 * Check if a sync is currently in progress
 */
export const isSyncInProgress = (): boolean => isSyncing;

/**
 * Get the last successful sync epoch timestamp
 */
export const getLastSyncedTime = (): number => lastSyncedTime;

/**
 * Triggers the sync engine to process background synchronization
 */
export const triggerSync = async (): Promise<void> => {
  if (isSyncing) {
    console.log('[SyncEngine] Sync already in progress, skipping.');
    return;
  }

  const authState = useAuthStore.getState();
  const settingsState = useSettingsStore.getState();

  // Sync requirements: User must be logged in and Cloud Backup must be enabled
  if (!authState.isAuthenticated || !authState.user || !settingsState.cloudBackup) {
    console.log('[SyncEngine] Sync conditions not met (User logged in: ' + authState.isAuthenticated + ', Cloud Backup: ' + settingsState.cloudBackup + '). Skipping.');
    return;
  }

  const userId = authState.user.id;
  isSyncing = true;

  try {
    console.log('[SyncEngine] Sync started for user:', userId);
    const database = getDb();

    // ─────────────────────────────────────────────────────────
    // PHASE 1: PROCESS DELETED RECORDS
    // ─────────────────────────────────────────────────────────
    
    // Fetch local transactions that are marked as 'deleted'
    const deletedTransactions = await database.getAllAsync<{ id: string }>(
      `SELECT id FROM transactions WHERE syncStatus = 'deleted'`
    );
    
    if (deletedTransactions.length > 0) {
      console.log(`[SyncEngine] Deleting ${deletedTransactions.length} transactions from Firestore...`);
      const deletedTxIds = deletedTransactions.map((t) => t.id);
      await firestoreBackupService.deleteTransactionsBatch(userId, deletedTxIds);
      // Hard delete from SQLite after successful Firestore deletion
      for (const id of deletedTxIds) {
        await transactionRepository.hardDelete(id);
      }
    }

    // Fetch local budgets that are marked as 'deleted'
    const deletedBudgets = await database.getAllAsync<{ id: string }>(
      `SELECT id FROM budgets WHERE syncStatus = 'deleted'`
    );
    
    if (deletedBudgets.length > 0) {
      console.log(`[SyncEngine] Deleting ${deletedBudgets.length} budgets from Firestore...`);
      const deletedBgIds = deletedBudgets.map((b) => b.id);
      await firestoreBackupService.deleteBudgetsBatch(userId, deletedBgIds);
      // Hard delete from SQLite after successful Firestore deletion
      for (const id of deletedBgIds) {
        await budgetRepository.hardDelete(id);
      }
    }

    // ─────────────────────────────────────────────────────────
    // PHASE 2: PUSH PENDING CHANGES & RESOLVE CONFLICTS
    // ─────────────────────────────────────────────────────────

    // Fetch cloud documents to compare timestamps
    console.log('[SyncEngine] Fetching Firestore records for reconciliation...');
    const cloudTransactions = await firestoreBackupService.fetchTransactions(userId);
    const cloudBudgets = await firestoreBackupService.fetchBudgets(userId);

    const cloudTxMap = new Map<string, Omit<Transaction, 'syncStatus'>>();
    cloudTransactions.forEach((tx) => cloudTxMap.set(tx.id, tx));

    const cloudBgMap = new Map<string, Omit<Budget, 'syncStatus'>>();
    cloudBudgets.forEach((bg) => cloudBgMap.set(bg.id, bg));

    // Resolve transactions pending push
    const pendingTransactions = await database.getAllAsync<Transaction>(
      `SELECT * FROM transactions WHERE syncStatus = 'pending'`
    );
    
    const transactionsToUpload: Transaction[] = [];

    for (const localTx of pendingTransactions) {
      const cloudTx = cloudTxMap.get(localTx.id);
      
      if (!cloudTx) {
        // Document does not exist in Firestore, prepare for upload
        transactionsToUpload.push(localTx);
      } else {
        // Conflict resolution: Latest updatedAt wins
        if (localTx.updatedAt > cloudTx.updatedAt) {
          transactionsToUpload.push(localTx);
        } else {
          // Cloud version is newer, overwrite local SQLite record
          const mergedTx: Transaction = {
            ...localTx,
            ...cloudTx,
            syncStatus: 'synced',
          };
          await transactionRepository.applySyncWrite(mergedTx);
        }
      }
    }

    if (transactionsToUpload.length > 0) {
      console.log(`[SyncEngine] Uploading ${transactionsToUpload.length} pending transactions to Firestore...`);
      await firestoreBackupService.uploadTransactionsBatch(userId, transactionsToUpload);
      // Mark successfully uploaded records as synced
      for (const tx of transactionsToUpload) {
        await database.runAsync(
          `UPDATE transactions SET syncStatus = 'synced' WHERE id = ?`,
          [tx.id]
        );
      }
    }

    // Resolve budgets pending push
    const pendingBudgets = await database.getAllAsync<Budget>(
      `SELECT * FROM budgets WHERE syncStatus = 'pending'`
    );

    const budgetsToUpload: Budget[] = [];

    for (const localBg of pendingBudgets) {
      const cloudBg = cloudBgMap.get(localBg.id);

      if (!cloudBg) {
        budgetsToUpload.push(localBg);
      } else {
        // Conflict resolution: Latest updatedAt wins
        if (localBg.updatedAt > cloudBg.updatedAt) {
          budgetsToUpload.push(localBg);
        } else {
          // Cloud version is newer, overwrite local SQLite record
          const mergedBg: Budget = {
            ...localBg,
            ...cloudBg,
            syncStatus: 'synced',
          };
          await budgetRepository.applySyncWrite(mergedBg);
        }
      }
    }

    if (budgetsToUpload.length > 0) {
      console.log(`[SyncEngine] Uploading ${budgetsToUpload.length} pending budgets to Firestore...`);
      await firestoreBackupService.uploadBudgetsBatch(userId, budgetsToUpload);
      for (const bg of budgetsToUpload) {
        await database.runAsync(
          `UPDATE budgets SET syncStatus = 'synced' WHERE id = ?`,
          [bg.id]
        );
      }
    }

    // ─────────────────────────────────────────────────────────
    // PHASE 3: PULL CLOUD CHANGES (incremental update to SQLite)
    // ─────────────────────────────────────────────────────────
    
    // Retrieve fresh local records (including soft-deleted)
    const localTxs = await transactionRepository.getAllRaw();
    const localTxMap = new Map<string, Transaction>();
    localTxs.forEach((tx) => localTxMap.set(tx.id, tx));

    const localBgs = await budgetRepository.getAllRaw();
    const localBgMap = new Map<string, Budget>();
    localBgs.forEach((bg) => localBgMap.set(bg.id, bg));

    // Apply cloud updates for transactions
    for (const cloudTx of cloudTransactions) {
      const localTx = localTxMap.get(cloudTx.id);
      
      if (!localTx) {
        // Document does not exist locally (inserted on another device)
        const newTx: Transaction = {
          ...cloudTx,
          syncStatus: 'synced',
        };
        await transactionRepository.applySyncWrite(newTx);
      } else {
        // If locally marked as synced and cloud is newer, pull update
        if (localTx.syncStatus === 'synced' && cloudTx.updatedAt > localTx.updatedAt) {
          const updatedTx: Transaction = {
            ...localTx,
            ...cloudTx,
            syncStatus: 'synced',
          };
          await transactionRepository.applySyncWrite(updatedTx);
        }
      }
    }

    // Apply cloud updates for budgets
    for (const cloudBg of cloudBudgets) {
      const localBg = localBgMap.get(cloudBg.id);

      if (!localBg) {
        const newBg: Budget = {
          ...cloudBg,
          syncStatus: 'synced',
        };
        await budgetRepository.applySyncWrite(newBg);
      } else {
        if (localBg.syncStatus === 'synced' && cloudBg.updatedAt > localBg.updatedAt) {
          const updatedBg: Budget = {
            ...localBg,
            ...cloudBg,
            syncStatus: 'synced',
          };
          await budgetRepository.applySyncWrite(updatedBg);
        }
      }
    }

    lastSyncedTime = Date.now();
    console.log('[SyncEngine] Synchronization completed successfully at:', new Date(lastSyncedTime).toLocaleTimeString());
  } catch (error) {
    console.error('[SyncEngine] Synchronization failed with error:', error);
  } finally {
    isSyncing = false;
  }
};

/**
 * Initialize sync listeners on App launch, AppState transition, and Timer
 */
export const initializeSyncEngine = (): (() => void) => {
  console.log('[SyncEngine] Initializing background sync hooks...');

  // Trigger sync on app launch
  triggerSync().catch((err) => console.error('[SyncEngine] App launch sync failed:', err));

  // Trigger sync every 60 seconds
  if (syncInterval) {
    clearInterval(syncInterval);
  }
  
  syncInterval = setInterval(() => {
    console.log('[SyncEngine] 60-second periodic sync trigger.');
    triggerSync().catch((err) => console.error('[SyncEngine] Periodic sync failed:', err));
  }, 60000);

  // AppState change listener (e.g. app comes to foreground)
  const handleAppStateChange = (nextAppState: AppStateStatus) => {
    if (nextAppState === 'active') {
      console.log('[SyncEngine] App transition to foreground. Triggering sync...');
      triggerSync().catch((err) => console.error('[SyncEngine] App foreground sync failed:', err));
    }
  };

  const appStateSubscription = AppState.addEventListener('change', handleAppStateChange);

  // Return clean-up function to unsubscribe
  return () => {
    if (syncInterval) {
      clearInterval(syncInterval);
    }
    appStateSubscription.remove();
    console.log('[SyncEngine] background sync hooks removed.');
  };
};
