import { Ionicons } from '@expo/vector-icons';

export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgLight: string;
  bgDark: string;
}

export interface PaymentMethod {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export interface ExpenseFormData {
  amount: string;
  type: TransactionType;
  categoryId: string;
  paymentMethodId: string;
  note: string;
  date: Date;
  currency: string;
}

export const CATEGORIES: Category[] = [
  {
    id: 'dining',
    label: 'Dining & Food',
    icon: 'restaurant-outline',
    color: '#D56B2D',
    bgLight: '#FDF2E9',
    bgDark: '#3E2516',
  },
  {
    id: 'groceries',
    label: 'Groceries',
    icon: 'basket-outline',
    color: '#137333',
    bgLight: '#E6F4EA',
    bgDark: '#1B3A24',
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: 'car-outline',
    color: '#5F6368',
    bgLight: '#F1F3F4',
    bgDark: '#303134',
  },
  {
    id: 'utilities',
    label: 'Utilities',
    icon: 'flash-outline',
    color: '#1A73E8',
    bgLight: '#E8F0FE',
    bgDark: '#1A365D',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: 'film-outline',
    color: '#D93025',
    bgLight: '#FCE8E6',
    bgDark: '#3C1E1E',
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: 'cart-outline',
    color: '#E37400',
    bgLight: '#FEF3E2',
    bgDark: '#3E2A00',
  },
  {
    id: 'health',
    label: 'Health & Fitness',
    icon: 'barbell-outline',
    color: '#8430D9',
    bgLight: '#F3E8FD',
    bgDark: '#2D1B4E',
  },
  {
    id: 'education',
    label: 'Education',
    icon: 'book-outline',
    color: '#0F9D58',
    bgLight: '#E6F4EA',
    bgDark: '#1B3A24',
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: 'airplane-outline',
    color: '#1A73E8',
    bgLight: '#E8F0FE',
    bgDark: '#1A365D',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: 'repeat-outline',
    color: '#E84393',
    bgLight: '#FDE8F3',
    bgDark: '#3C1428',
  },
  {
    id: 'income',
    label: 'Income',
    icon: 'cash-outline',
    color: '#137333',
    bgLight: '#E6F4EA',
    bgDark: '#1B3A24',
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'ellipsis-horizontal-outline',
    color: '#5F6368',
    bgLight: '#F1F3F4',
    bgDark: '#303134',
  },
];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', label: 'Cash', icon: 'cash-outline' },
  { id: 'card', label: 'Credit Card', icon: 'card-outline' },
  { id: 'debit', label: 'Debit Card', icon: 'card-outline' },
  { id: 'transfer', label: 'Bank Transfer', icon: 'swap-horizontal-outline' },
  { id: 'wallet', label: 'Digital Wallet', icon: 'wallet-outline' },
  { id: 'upi', label: 'UPI', icon: 'phone-portrait-outline' },
];

export const CURRENCIES = [
  { code: 'PKR', symbol: 'Rs' },
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'AED', symbol: 'د.إ' },
];
