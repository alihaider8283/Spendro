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
import { ListItem } from '@/features/transactions/types';
import { useTransactions } from '@/hooks/useTransactions';

// Helper to format Date to string like "2026-06-06"
const formatDateString = (date: Date) => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};



export default function TransactionsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Fetch transactions exclusively from SQLite — no mock fallback
  const { data: transactions = [] } = useTransactions();

  // Interactivity States
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [activeTab, setActiveTab] = useState<'daily' | 'calendar'>('daily');
  const [searchActive, setSearchActive] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<string>(formatDateString(new Date()));

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
    return transactions.filter(t => {
      const tDate = new Date(t.transactionDate);
      const matchesMonth =
        tDate.getMonth() === currentDate.getMonth() &&
        tDate.getFullYear() === currentDate.getFullYear();

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
  }, [transactions, currentDate, searchQuery]);

  // Grouped Daily Transactions
  const groupedDailyItems = useMemo(() => {
    const groups: { [key: string]: ListItem[] } = {};

    filteredTransactions.forEach(t => {
      // Determine header name
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tDate = new Date(t.transactionDate);

      let groupKey = '';
      if (formatDateString(tDate) === formatDateString(today)) {
        groupKey = 'TODAY';
      } else if (formatDateString(tDate) === formatDateString(yesterday)) {
        groupKey = 'YESTERDAY';
      } else {
        groupKey = tDate.toLocaleString('en-US', { month: 'long', day: 'numeric' }).toUpperCase();
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }

      groups[groupKey].push({ type: 'transaction', data: t });
    });

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
    return transactions.filter(
      t => formatDateString(new Date(t.transactionDate)) === selectedCalendarDate
    );
  }, [transactions, selectedCalendarDate]);

  // Total daily expenditure map for the calendar cells
  const dailyTotalMap = useMemo(() => {
    const totals: { [key: string]: number } = {};
    transactions.forEach(t => {
      const dateStr = formatDateString(new Date(t.transactionDate));
      if (t.type === 'expense') {
        totals[dateStr] = (totals[dateStr] || 0) + t.amount;
      }
    });
    return totals;
  }, [transactions]);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header — matches Settings tab design */}
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.headerTitle}>Transactions</ThemedText>
        <Pressable
          style={({ pressed }) => [
            styles.iconButton,
            { backgroundColor: colors.backgroundElement },
            pressed && { opacity: 0.7 },
          ]}
          onPress={() => {
            setSearchActive(!searchActive);
            if (searchActive) setSearchQuery('');
          }}
          accessibilityRole="button"
          accessibilityLabel="Search transactions"
        >
          <Ionicons name={searchActive ? 'close' : 'search'} size={22} color={colors.text} />
        </Pressable>
      </View>

      {/* Month Navigator — below header */}
      <View style={styles.monthNavRow}>
        <Pressable onPress={handlePrevMonth} style={styles.arrowButton} accessibilityRole="button" accessibilityLabel="Previous month">
          <Ionicons name="chevron-back" size={18} color="#208AEF" />
        </Pressable>
        <ThemedText style={styles.monthText}>{monthLabel}</ThemedText>
        <Pressable onPress={handleNextMonth} style={styles.arrowButton} accessibilityRole="button" accessibilityLabel="Next month">
          <Ionicons name="chevron-forward" size={18} color="#208AEF" />
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
  // Header: matches Settings tab
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontWeight: '800',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Month navigator row below header
  monthNavRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    gap: Spacing.two,
  },
  arrowButton: {
    padding: Spacing.one,
  },
  monthText: {
    fontSize: 16,
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
