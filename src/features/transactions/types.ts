import { Ionicons } from '@expo/vector-icons';

export interface Transaction {
  id: string;
  title: string;
  category: string;
  amount: number; // negative for expense, positive for income
  date: Date;
  icon: keyof typeof Ionicons.glyphMap;
  iconBgLight: string;
  iconBgDark: string;
  iconColor: string;
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
