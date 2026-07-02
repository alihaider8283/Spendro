import { Ionicons } from '@expo/vector-icons';

export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgLight: string;
  bgDark: string;
  type: TransactionType;
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

export const EXPENSE_CATEGORIES: Category[] = [
  {
    id: 'dining',
    label: 'Dining & Food',
    icon: 'restaurant-outline',
    color: '#D56B2D',
    bgLight: '#FDF2E9',
    bgDark: '#3E2516',
    type: 'expense',
  },
  {
    id: 'groceries',
    label: 'Groceries',
    icon: 'basket-outline',
    color: '#137333',
    bgLight: '#E6F4EA',
    bgDark: '#1B3A24',
    type: 'expense',
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: 'car-outline',
    color: '#5F6368',
    bgLight: '#F1F3F4',
    bgDark: '#303134',
    type: 'expense',
  },
  {
    id: 'utilities',
    label: 'Utilities',
    icon: 'flash-outline',
    color: '#1A73E8',
    bgLight: '#E8F0FE',
    bgDark: '#1A365D',
    type: 'expense',
  },
  {
    id: 'entertainment',
    label: 'Entertainment',
    icon: 'film-outline',
    color: '#D93025',
    bgLight: '#FCE8E6',
    bgDark: '#3C1E1E',
    type: 'expense',
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: 'cart-outline',
    color: '#E37400',
    bgLight: '#FEF3E2',
    bgDark: '#3E2A00',
    type: 'expense',
  },
  {
    id: 'health',
    label: 'Health & Fitness',
    icon: 'barbell-outline',
    color: '#8430D9',
    bgLight: '#F3E8FD',
    bgDark: '#2D1B4E',
    type: 'expense',
  },
  {
    id: 'education',
    label: 'Education',
    icon: 'book-outline',
    color: '#0F9D58',
    bgLight: '#E6F4EA',
    bgDark: '#1B3A24',
    type: 'expense',
  },
  {
    id: 'travel',
    label: 'Travel',
    icon: 'airplane-outline',
    color: '#1A73E8',
    bgLight: '#E8F0FE',
    bgDark: '#1A365D',
    type: 'expense',
  },
  {
    id: 'subscriptions',
    label: 'Subscriptions',
    icon: 'repeat-outline',
    color: '#E84393',
    bgLight: '#FDE8F3',
    bgDark: '#3C1428',
    type: 'expense',
  },
  {
    id: 'other',
    label: 'Other',
    icon: 'ellipsis-horizontal-outline',
    color: '#5F6368',
    bgLight: '#F1F3F4',
    bgDark: '#303134',
    type: 'expense',
  },
];

export const INCOME_CATEGORIES: Category[] = [
  {
    id: 'salary',
    label: 'Salary',
    icon: 'cash-outline',
    color: '#137333',
    bgLight: '#E6F4EA',
    bgDark: '#1B3A24',
    type: 'income',
  },
  {
    id: 'freelance',
    label: 'Freelance',
    icon: 'laptop-outline',
    color: '#1A73E8',
    bgLight: '#E8F0FE',
    bgDark: '#1A365D',
    type: 'income',
  },
  {
    id: 'business',
    label: 'Business',
    icon: 'briefcase-outline',
    color: '#8430D9',
    bgLight: '#F3E8FD',
    bgDark: '#2D1B4E',
    type: 'income',
  },
  {
    id: 'investment',
    label: 'Investment',
    icon: 'trending-up-outline',
    color: '#059669',
    bgLight: '#ECFDF5',
    bgDark: '#1B3A24',
    type: 'income',
  },
  {
    id: 'gift',
    label: 'Gift',
    icon: 'gift-outline',
    color: '#E84393',
    bgLight: '#FDE8F3',
    bgDark: '#3C1428',
    type: 'income',
  },
  {
    id: 'rental',
    label: 'Rental',
    icon: 'home-outline',
    color: '#D56B2D',
    bgLight: '#FDF2E9',
    bgDark: '#3E2516',
    type: 'income',
  },
  {
    id: 'income',
    label: 'Other Income',
    icon: 'ellipsis-horizontal-outline',
    color: '#5F6368',
    bgLight: '#F1F3F4',
    bgDark: '#303134',
    type: 'income',
  },
];

export const CATEGORIES: Category[] = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'cash', label: 'Cash', icon: 'cash-outline' },
  { id: 'card', label: 'Credit Card', icon: 'card-outline' },
  { id: 'debit', label: 'Debit Card', icon: 'card-outline' },
  { id: 'transfer', label: 'Bank Transfer', icon: 'swap-horizontal-outline' },
  { id: 'wallet', label: 'Digital Wallet', icon: 'wallet-outline' },
  { id: 'upi', label: 'UPI', icon: 'phone-portrait-outline' },
];

export const CURRENCIES = [
  { code: 'PKR', symbol: 'Rs', name: 'Pakistani Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
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
    return CATEGORIES.find(c => c.id === 'dining') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('grocer') || norm.includes('market') || norm.includes('supermarket')) {
    return CATEGORIES.find(c => c.id === 'groceries') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('ride') || norm.includes('uber') || norm.includes('taxi') || norm.includes('car') || norm.includes('transport') || norm.includes('cab')) {
    return CATEGORIES.find(c => c.id === 'transport') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('bill') || norm.includes('utility') || norm.includes('electric') || norm.includes('water') || norm.includes('gas') || norm.includes('power')) {
    return CATEGORIES.find(c => c.id === 'utilities') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('netflix') || norm.includes('movie') || norm.includes('film') || norm.includes('entertainment') || norm.includes('show') || norm.includes('game') || norm.includes('spotify')) {
    return CATEGORIES.find(c => c.id === 'entertainment') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('shop') || norm.includes('amazon') || norm.includes('store') || norm.includes('cart') || norm.includes('target') || norm.includes('clothing')) {
    return CATEGORIES.find(c => c.id === 'shopping') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('gym') || norm.includes('health') || norm.includes('fit') || norm.includes('medical') || norm.includes('doctor') || norm.includes('pharmacy')) {
    return CATEGORIES.find(c => c.id === 'health') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('school') || norm.includes('book') || norm.includes('edu') || norm.includes('course') || norm.includes('university') || norm.includes('class')) {
    return CATEGORIES.find(c => c.id === 'education') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('flight') || norm.includes('travel') || norm.includes('hotel') || norm.includes('trip') || norm.includes('vacation')) {
    return CATEGORIES.find(c => c.id === 'travel') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('sub') || norm.includes('renew') || norm.includes('recurring')) {
    return CATEGORIES.find(c => c.id === 'subscriptions') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('salary') || norm.includes('paycheck') || norm.includes('wage')) {
    return CATEGORIES.find(c => c.id === 'salary') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('freelance') || norm.includes('gig') || norm.includes('contract')) {
    return CATEGORIES.find(c => c.id === 'freelance') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('business') || norm.includes('invoice')) {
    return CATEGORIES.find(c => c.id === 'business') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('invest') || norm.includes('dividend') || norm.includes('stock')) {
    return CATEGORIES.find(c => c.id === 'investment') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('gift')) {
    return CATEGORIES.find(c => c.id === 'gift') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('rent')) {
    return CATEGORIES.find(c => c.id === 'rental') || CATEGORIES.find(c => c.id === 'other')!;
  }
  if (norm.includes('income') || norm.includes('earn') || norm.includes('deposit')) {
    return CATEGORIES.find(c => c.id === 'income') || CATEGORIES.find(c => c.id === 'other')!;
  }

  // Fallback to other
  return CATEGORIES.find(c => c.id === 'other') || CATEGORIES[CATEGORIES.length - 1];
}

export function getCurrencySymbol(code: string): string {
  return CURRENCIES.find(c => c.code.toUpperCase() === code.toUpperCase())?.symbol ?? code;
}

