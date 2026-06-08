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

export function getCategoryByNameOrId(nameOrId: string): Category {
  if (!nameOrId) {
    return CATEGORIES.find(c => c.id === 'other') || CATEGORIES[CATEGORIES.length - 1];
  }
  const norm = nameOrId.toLowerCase().trim();
  
  // Try exact ID match
  let found = CATEGORIES.find(c => c.id.toLowerCase() === norm);
  if (found) return found;

  // Try exact label match
  found = CATEGORIES.find(c => c.label.toLowerCase() === norm);
  if (found) return found;

  // Try synonyms/partial matches
  if (norm.includes('food') || norm.includes('dining') || norm.includes('drink') || norm.includes('cafe') || norm.includes('restaurant') || norm.includes('mcdonald')) {
    return CATEGORIES.find(c => c.id === 'dining') || CATEGORIES[0];
  }
  if (norm.includes('grocer') || norm.includes('market') || norm.includes('supermarket')) {
    return CATEGORIES.find(c => c.id === 'groceries') || CATEGORIES[1];
  }
  if (norm.includes('ride') || norm.includes('uber') || norm.includes('taxi') || norm.includes('car') || norm.includes('transport') || norm.includes('cab')) {
    return CATEGORIES.find(c => c.id === 'transport') || CATEGORIES[2];
  }
  if (norm.includes('bill') || norm.includes('utility') || norm.includes('electric') || norm.includes('water') || norm.includes('gas') || norm.includes('power')) {
    return CATEGORIES.find(c => c.id === 'utilities') || CATEGORIES[3];
  }
  if (norm.includes('netflix') || norm.includes('movie') || norm.includes('film') || norm.includes('entertainment') || norm.includes('show') || norm.includes('game') || norm.includes('spotify')) {
    return CATEGORIES.find(c => c.id === 'entertainment') || CATEGORIES[4];
  }
  if (norm.includes('shop') || norm.includes('amazon') || norm.includes('store') || norm.includes('cart') || norm.includes('target') || norm.includes('clothing')) {
    return CATEGORIES.find(c => c.id === 'shopping') || CATEGORIES[5];
  }
  if (norm.includes('gym') || norm.includes('health') || norm.includes('fit') || norm.includes('medical') || norm.includes('doctor') || norm.includes('pharmacy')) {
    return CATEGORIES.find(c => c.id === 'health') || CATEGORIES[6];
  }
  if (norm.includes('school') || norm.includes('book') || norm.includes('edu') || norm.includes('course') || norm.includes('university') || norm.includes('class')) {
    return CATEGORIES.find(c => c.id === 'education') || CATEGORIES[7];
  }
  if (norm.includes('flight') || norm.includes('travel') || norm.includes('hotel') || norm.includes('trip') || norm.includes('vacation')) {
    return CATEGORIES.find(c => c.id === 'travel') || CATEGORIES[8];
  }
  if (norm.includes('sub') || norm.includes('renew') || norm.includes('recurring')) {
    return CATEGORIES.find(c => c.id === 'subscriptions') || CATEGORIES[9];
  }
  if (norm.includes('salary') || norm.includes('income') || norm.includes('earn') || norm.includes('paycheck') || norm.includes('deposit')) {
    return CATEGORIES.find(c => c.id === 'income') || CATEGORIES[10];
  }

  // Fallback to other
  return CATEGORIES.find(c => c.id === 'other') || CATEGORIES[CATEGORIES.length - 1];
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code.toUpperCase() === code.toUpperCase())?.symbol ?? code;
}

