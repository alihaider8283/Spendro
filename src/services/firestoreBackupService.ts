import firestore from '@react-native-firebase/firestore';
import { Transaction } from './transactionRepository';
import { Budget } from './budgetRepository';

export const firestoreBackupService = {
  /**
   * Upload a single transaction to Firestore
   */
  uploadTransaction: async (userId: string, tx: Transaction): Promise<void> => {
    const docData = {
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      category: tx.category,
      description: tx.description || '',
      method: tx.method || '',
      transactionDate: tx.transactionDate,
      source: tx.source,
      receiptUrl: tx.receiptUrl,
      createdAt: tx.createdAt,
      updatedAt: tx.updatedAt,
    };

    await firestore()
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .doc(tx.id)
      .set(docData);
  },

  /**
   * Upload multiple transactions in a batch
   */
  uploadTransactionsBatch: async (userId: string, transactions: Transaction[]): Promise<void> => {
    if (transactions.length === 0) return;
    
    // Firestore batch size limit is 500 operations
    const chunks = [];
    for (let i = 0; i < transactions.length; i += 500) {
      chunks.push(transactions.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const batch = firestore().batch();
      chunk.forEach((tx) => {
        const ref = firestore()
          .collection('users')
          .doc(userId)
          .collection('transactions')
          .doc(tx.id);

        const docData = {
          id: tx.id,
          type: tx.type,
          amount: tx.amount,
          category: tx.category,
          description: tx.description || '',
          method: tx.method || '',
          transactionDate: tx.transactionDate,
          source: tx.source,
          receiptUrl: tx.receiptUrl,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
        };

        batch.set(ref, docData);
      });
      await batch.commit();
    }
  },

  /**
   * Delete a transaction from Firestore
   */
  deleteTransaction: async (userId: string, transactionId: string): Promise<void> => {
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .doc(transactionId)
      .delete();
  },

  /**
   * Delete multiple transactions in a batch
   */
  deleteTransactionsBatch: async (userId: string, transactionIds: string[]): Promise<void> => {
    if (transactionIds.length === 0) return;

    const chunks = [];
    for (let i = 0; i < transactionIds.length; i += 500) {
      chunks.push(transactionIds.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const batch = firestore().batch();
      chunk.forEach((id) => {
        const ref = firestore()
          .collection('users')
          .doc(userId)
          .collection('transactions')
          .doc(id);
        batch.delete(ref);
      });
      await batch.commit();
    }
  },

  /**
   * Upload a single budget to Firestore
   */
  uploadBudget: async (userId: string, budget: Budget): Promise<void> => {
    const docData = {
      id: budget.id,
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      createdAt: budget.createdAt,
      updatedAt: budget.updatedAt,
    };

    await firestore()
      .collection('users')
      .doc(userId)
      .collection('budgets')
      .doc(budget.id)
      .set(docData);
  },

  /**
   * Upload multiple budgets in a batch
   */
  uploadBudgetsBatch: async (userId: string, budgets: Budget[]): Promise<void> => {
    if (budgets.length === 0) return;

    const chunks = [];
    for (let i = 0; i < budgets.length; i += 500) {
      chunks.push(budgets.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const batch = firestore().batch();
      chunk.forEach((budget) => {
        const ref = firestore()
          .collection('users')
          .doc(userId)
          .collection('budgets')
          .doc(budget.id);

        const docData = {
          id: budget.id,
          category: budget.category,
          amount: budget.amount,
          month: budget.month,
          createdAt: budget.createdAt,
          updatedAt: budget.updatedAt,
        };

        batch.set(ref, docData);
      });
      await batch.commit();
    }
  },

  /**
   * Delete a budget from Firestore
   */
  deleteBudget: async (userId: string, budgetId: string): Promise<void> => {
    await firestore()
      .collection('users')
      .doc(userId)
      .collection('budgets')
      .doc(budgetId)
      .delete();
  },

  /**
   * Delete multiple budgets in a batch
   */
  deleteBudgetsBatch: async (userId: string, budgetIds: string[]): Promise<void> => {
    if (budgetIds.length === 0) return;

    const chunks = [];
    for (let i = 0; i < budgetIds.length; i += 500) {
      chunks.push(budgetIds.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const batch = firestore().batch();
      chunk.forEach((id) => {
        const ref = firestore()
          .collection('users')
          .doc(userId)
          .collection('budgets')
          .doc(id);
        batch.delete(ref);
      });
      await batch.commit();
    }
  },

  /**
   * Fetch all transactions from Firestore
   */
  fetchTransactions: async (userId: string): Promise<Omit<Transaction, 'syncStatus'>[]> => {
    const snapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('transactions')
      .get();
      
    return snapshot.docs.map(doc => doc.data() as Omit<Transaction, 'syncStatus'>);
  },

  /**
   * Fetch all budgets from Firestore
   */
  fetchBudgets: async (userId: string): Promise<Omit<Budget, 'syncStatus'>[]> => {
    const snapshot = await firestore()
      .collection('users')
      .doc(userId)
      .collection('budgets')
      .get();
      
    return snapshot.docs.map(doc => doc.data() as Omit<Budget, 'syncStatus'>);
  }
};
