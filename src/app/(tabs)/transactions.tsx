import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';

import { FAB } from '@/components/floating-action-button';
import { CalendarView } from '@/features/transactions/components/calendar-view';
import { DailyList } from '@/features/transactions/components/daily-list';
import { ListItem, Transaction } from '@/features/transactions/types';

// Helper to format Date to string like "2026-06-06"
const formatDateString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

// Raw Mock Data for Transactions (spread across May, June, July 2026)
const MOCK_TRANSACTIONS: Transaction[] = [
  // June 2026
  {
    id: 't1',
    title: 'Starbucks',
    category: 'Dining & Drinks',
    amount: -12.50,
    date: new Date(2026, 5, 6), // June 6, 2026
    icon: 'cafe-outline',
    iconBgLight: '#E6F4EA',
    iconBgDark: '#1B3A24',
    iconColor: '#137333',
  },
  {
    id: 't2',
    title: 'Whole Foods',
    category: 'Groceries',
    amount: -84.22,
    date: new Date(2026, 5, 6),
    icon: 'basket-outline',
    iconBgLight: '#E6F4EA',
    iconBgDark: '#1B3A24',
    iconColor: '#137333',
  },
  {
    id: 't3',
    title: 'Uber',
    category: 'Transport',
    amount: -24.15,
    date: new Date(2026, 5, 5), // June 5, 2026
    icon: 'car-outline',
    iconBgLight: '#F1F3F4',
    iconBgDark: '#303134',
    iconColor: '#5F6368',
  },
  {
    id: 't4',
    title: 'Electric Bill',
    category: 'Utilities',
    amount: -142.00,
    date: new Date(2026, 5, 5),
    icon: 'flash-outline',
    iconBgLight: '#E8F0FE',
    iconBgDark: '#1A365D',
    iconColor: '#1A73E8',
  },
  {
    id: 't5',
    title: 'Netflix Premium',
    category: 'Entertainment',
    amount: -19.99,
    date: new Date(2026, 5, 15), // June 15, 2026
    icon: 'film-outline',
    iconBgLight: '#FDF2E9',
    iconBgDark: '#3E2516',
    iconColor: '#D56B2D',
  },
  {
    id: 't6',
    title: 'Salary Deposit',
    category: 'Income',
    amount: 3200.00,
    date: new Date(2026, 5, 1), // June 1, 2026
    icon: 'cash-outline',
    iconBgLight: '#E6F4EA',
    iconBgDark: '#1B3A24',
    iconColor: '#137333',
  },
  // May 2026
  {
    id: 't7',
    title: 'Amazon Shopping',
    category: 'Shopping',
    amount: -65.40,
    date: new Date(2026, 4, 18), // May 18, 2026
    icon: 'cart-outline',
    iconBgLight: '#FCE8E6',
    iconBgDark: '#3C1E1E',
    iconColor: '#D93025',
  },
  {
    id: 't8',
    title: 'Target',
    category: 'Shopping',
    amount: -32.18,
    date: new Date(2026, 4, 12),
    icon: 'cart-outline',
    iconBgLight: '#FCE8E6',
    iconBgDark: '#3C1E1E',
    iconColor: '#D93025',
  },
  // July 2026
  {
    id: 't9',
    title: 'Gym Membership',
    category: 'Health & Fitness',
    amount: -45.00,
    date: new Date(2026, 6, 2), // July 2, 2026
    icon: 'barbell-outline',
    iconBgLight: '#F3E8FD',
    iconBgDark: '#2D1B4E',
    iconColor: '#8430D9',
  },
];

// Insight Cards
const MOCK_INSIGHTS = [
  {
    id: 'i1',
    type: 'insight' as const,
    title: 'Financial Insight',
    description: 'Your Uber spending is 12% lower than last month. Great job managing commute costs!',
    icon: 'sparkles-outline' as const,
    color: '#1A73E8',
  },
];

export default function TransactionsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Interactivity States
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 5, 1)); // Default: June 2026
  const [activeTab, setActiveTab] = useState<'daily' | 'calendar'>('daily');
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(formatDateString(new Date(2026, 5, 6)));

  // Navigation handlers
  const handlePrevMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() - 1);
      return newDate;
    });
  };

  const handleNextMonth = () => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + 1);
      return newDate;
    });
  };

  // Format month label (e.g. "Jun 2026")
  const monthLabel = useMemo(() => {
    return currentDate.toLocaleString('en-US', { month: 'short', year: 'numeric' });
  }, [currentDate]);

  // Filter transactions based on current selected month/year and search query
  const filteredTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(t => {
      const matchesMonth =
        t.date.getMonth() === currentDate.getMonth() &&
        t.date.getFullYear() === currentDate.getFullYear();

      if (!matchesMonth) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query) ||
          String(t.amount).includes(query)
        );
      }

      return true;
    });
  }, [currentDate, searchQuery]);

  // Grouped Daily Transactions
  const groupedDailyItems = useMemo(() => {
    const groups: { [key: string]: ListItem[] } = {};

    filteredTransactions.forEach(t => {
      // Determine header name
      const today = new Date(2026, 5, 6); // Mocked today
      const yesterday = new Date(2026, 5, 5); // Mocked yesterday

      let groupKey = '';
      if (formatDateString(t.date) === formatDateString(today)) {
        groupKey = 'TODAY';
      } else if (formatDateString(t.date) === formatDateString(yesterday)) {
        groupKey = 'YESTERDAY';
      } else {
        groupKey = t.date.toLocaleString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push({ type: 'transaction', data: t });
    });

    // Inject insight card for demonstration (under Yesterday, if Yesterday exists)
    const keys = Object.keys(groups);
    if (keys.includes('YESTERDAY')) {
      const yesterdayGroup = groups['YESTERDAY'];
      if (yesterdayGroup.length > 0) {
        yesterdayGroup.splice(1, 0, { type: 'insight', data: MOCK_INSIGHTS[0] });
      } else {
        yesterdayGroup.push({ type: 'insight', data: MOCK_INSIGHTS[0] });
      }
    }

    return groups;
  }, [filteredTransactions]);

  // Calendar calculations
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const days: { dayNumber: number | null; dateString: string }[] = [];

    // Adjust firstDayIndex to make Monday the first day (0: Mon, 6: Sun)
    const adjustedStart = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    for (let i = 0; i < adjustedStart; i++) {
      days.push({ dayNumber: null, dateString: '' });
    }

    for (let d = 1; d <= totalDays; d++) {
      const fullDate = new Date(year, month, d);
      days.push({
        dayNumber: d,
        dateString: formatDateString(fullDate),
      });
    }

    return days;
  }, [currentDate]);

  // Get selected day transactions
  const selectedDateTransactions = useMemo(() => {
    return MOCK_TRANSACTIONS.filter(
      t => formatDateString(t.date) === selectedCalendarDate
    );
  }, [selectedCalendarDate]);

  // Total daily expenditure map for the calendar cells
  const dailyTotalMap = useMemo(() => {
    const totals: { [key: string]: number } = {};
    MOCK_TRANSACTIONS.forEach(t => {
      const dateStr = formatDateString(t.date);
      if (t.amount < 0) {
        totals[dateStr] = (totals[dateStr] || 0) + Math.abs(t.amount);
      }
    });
    return totals;
  }, []);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header Container */}
      <View style={styles.header}>
        {/* Date Month Selector in top-left position */}
        <View style={styles.monthSelectorContainer}>
          <Pressable onPress={handlePrevMonth} style={styles.arrowButton} accessibilityRole="button" accessibilityLabel="Previous month">
            <Ionicons name="chevron-back" size={16} color="#3369F6" />
          </Pressable>
          <ThemedText style={styles.monthText}>{monthLabel}</ThemedText>
          <Pressable onPress={handleNextMonth} style={styles.arrowButton} accessibilityRole="button" accessibilityLabel="Next month">
            <Ionicons name="chevron-forward" size={16} color="#3369F6" />
          </Pressable>
        </View>

        {/* Search Toggle in top-right position */}
        <Pressable
          style={({ pressed }) => [
            styles.headerButton,
            styles.searchCircle,
            { backgroundColor: colors.backgroundElement },
            pressed && styles.headerButtonPressed,
          ]}
          onPress={() => {
            setSearchActive(!searchActive);
            if (searchActive) setSearchQuery('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Search transactions"
        >
          <Ionicons name={searchActive ? 'close' : 'search'} size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* Expandable Search Input */}
      {searchActive && (
        <View style={[styles.searchBarContainer, { backgroundColor: colors.background }]}>
          <View style={[styles.searchInputWrapper, { backgroundColor: colors.backgroundElement }]}>
            <Ionicons name="search" size={18} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search by name, category, amount..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')} style={styles.clearSearchButton} accessibilityRole="button" accessibilityLabel="Clear search">
                <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>
      )}

      {/* Segmented Control / Tabs */}
      <ThemedView style={styles.segmentedControlContainer}>
        <View style={[styles.segmentedControl, { backgroundColor: colors.backgroundElement }]}>
          <Pressable
            style={[
              styles.segmentButton,
              activeTab === 'daily' && [styles.segmentButtonActive, { backgroundColor: '#3369F6' }],
            ]}
            onPress={() => setActiveTab('daily')}
          >
            <ThemedText
              style={[
                styles.segmentText,
                activeTab === 'daily'
                  ? styles.segmentTextActive
                  : { color: colors.textSecondary },
              ]}
            >
              Daily
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.segmentButton,
              activeTab === 'calendar' && [styles.segmentButtonActive, { backgroundColor: '#3369F6' }],
            ]}
            onPress={() => setActiveTab('calendar')}
          >
            <ThemedText
              style={[
                styles.segmentText,
                activeTab === 'calendar'
                  ? styles.segmentTextActive
                  : { color: colors.textSecondary },
              ]}
            >
              Calendar
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      {/* Main Tab Views */}
      {activeTab === 'daily' ? (
        <DailyList groupedDailyItems={groupedDailyItems} monthLabel={monthLabel} />
      ) : (
        <CalendarView
          calendarDays={calendarDays}
          selectedCalendarDate={selectedCalendarDate}
          setSelectedCalendarDate={setSelectedCalendarDate}
          selectedDateTransactions={selectedDateTransactions}
          dailyTotalMap={dailyTotalMap}
        />
      )}
      <FAB />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerButtonPressed: {
    opacity: 0.7,
  },
  searchCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  monthSelectorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
  },
  arrowButton: {
    padding: Spacing.one,
  },
  monthText: {
    fontSize: 18,
    fontWeight: '700',
  },
  searchBarContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  searchInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    height: 44,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 8,
  },
  clearSearchButton: {
    padding: Spacing.half,
  },
  segmentedControlContainer: {
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.three,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 14,
    padding: 3,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  segmentButtonActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
});
