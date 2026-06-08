import { Ionicons } from '@expo/vector-icons';

export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  method: string;
  transactionDate: number; // millisecond timestamp
  source: 'manual' | 'voice' | 'receipt_scan';
  receiptUrl: string | null;
  syncStatus: 'pending' | 'synced' | 'deleted';
  createdAt: number;
  updatedAt: number;

  // UI compatibility fields (computed or optional)
  title: string;
  currency: string;
  merchant?: string | null;
}

export interface InsightCard {
  id: string;
  type: 'insight';
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
}

export type ListItem = { type: 'transaction'; data: Transaction } | { type: 'insight'; data: InsightCard };
