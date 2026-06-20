import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { getCategoryByNameOrId, getCurrencySymbol } from '@/features/expenses/types';
import { useStats, useTransactions } from '@/hooks/useTransactions';
import { useSettingsStore } from '@/store/settingsStore';

function getCurrentMonthStr(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getMonthRange(monthStr: string): { start: number; end: number } {
  const [y, m] = monthStr.split('-').map(Number);
  return {
    start: new Date(y, m - 1, 1).getTime(),
    end: new Date(y, m, 1).getTime() - 1,
  };
}

function formatMonthLabel(monthStr: string): string {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

export default function AnalyticsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { currency } = useSettingsStore();
  const currencySymbol = getCurrencySymbol(currency);

  const currentMonth = getCurrentMonthStr();
  const { data: transactions = [] } = useTransactions();
  const { data: stats = [] } = useStats();

  const { start, end } = getMonthRange(currentMonth);

  const monthExpenses = transactions.filter(
    t => t.type === 'expense' && t.transactionDate >= start && t.transactionDate <= end
  );

  const categoryTotals: Record<string, number> = {};
  for (const t of monthExpenses) {
    categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + t.amount;
  }

  const totalExpense = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
  const sortedCategories = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);

  const currentStats = stats.find(s => s.month === currentMonth);
  const totalIncome = currentStats?.income ?? 0;
  const balance = totalIncome - totalExpense;

  const last6Stats = stats.slice(0, 6);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Analytics</Text>

        <View style={[styles.summaryCard, { backgroundColor: '#3369F6' }]}>
          <View style={styles.summaryRow}>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Income</Text>
              <Text style={styles.summaryAmount}>
                {currencySymbol}{totalIncome.toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Expenses</Text>
              <Text style={styles.summaryAmount}>
                {currencySymbol}{totalExpense.toFixed(2)}
              </Text>
            </View>
          </View>
          <View style={styles.balanceRow}>
            <Text style={styles.balanceLabel}>Net Balance</Text>
            <Text style={styles.balanceAmount}>
              {balance >= 0 ? '+' : ''}{currencySymbol}{Math.abs(balance).toFixed(2)}
            </Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>This Month by Category</Text>
          {sortedCategories.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No expenses this month
            </Text>
          ) : (
            sortedCategories.map(([categoryId, amount]) => {
              const category = getCategoryByNameOrId(categoryId);
              const percent = totalExpense > 0 ? amount / totalExpense : 0;
              const percentDisplay = Math.round(percent * 100);
              return (
                <View key={categoryId} style={styles.categoryRow}>
                  <View style={styles.categoryHeader}>
                    <Text style={[styles.categoryName, { color: colors.text }]}>
                      {category.label}
                    </Text>
                    <Text style={[styles.categoryAmount, { color: colors.text }]}>
                      {currencySymbol}{amount.toFixed(2)}
                    </Text>
                  </View>
                  <View style={[styles.barTrack, { backgroundColor: colors.background }]}>
                    <View
                      style={[
                        styles.barFill,
                        { width: `${percentDisplay}%`, backgroundColor: category.color },
                      ]}
                    />
                  </View>
                  <Text style={[styles.categoryPercent, { color: colors.textSecondary }]}>
                    {percentDisplay}%
                  </Text>
                </View>
              );
            })
          )}
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly History</Text>
          {last6Stats.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
              No history yet
            </Text>
          ) : (
            last6Stats.map((stat) => {
              const net = stat.income - stat.expense;
              return (
                <View key={stat.month} style={styles.historyRow}>
                  <Text style={[styles.historyMonth, { color: colors.text }]}>
                    {formatMonthLabel(stat.month)}
                  </Text>
                  <View style={styles.historyAmounts}>
                    <Text style={[styles.historyIncome]}>
                      +{currencySymbol}{stat.income.toFixed(0)}
                    </Text>
                    <Text style={[styles.historyExpense]}>
                      -{currencySymbol}{stat.expense.toFixed(0)}
                    </Text>
                    <Text style={[styles.historyNet, { color: net >= 0 ? '#137333' : '#D93025' }]}>
                      {net >= 0 ? '+' : '-'}{currencySymbol}{Math.abs(net).toFixed(0)}
                    </Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Spacing.four,
  },
  summaryCard: {
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.one,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: '800',
    color: '#ffffff',
  },
  summaryDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.25)',
    marginHorizontal: Spacing.three,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: Spacing.three,
  },
  balanceLabel: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
  },
  balanceAmount: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
  },
  sectionCard: {
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: Spacing.three,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
  categoryRow: {
    marginBottom: Spacing.three,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.one,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: '700',
  },
  barTrack: {
    height: 6,
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: Spacing.one,
  },
  barFill: {
    height: '100%',
    borderRadius: 6,
  },
  categoryPercent: {
    fontSize: 12,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128,128,128,0.2)',
  },
  historyMonth: {
    fontSize: 15,
    fontWeight: '700',
    width: 56,
  },
  historyAmounts: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  historyIncome: {
    fontSize: 13,
    color: '#137333',
    fontWeight: '600',
  },
  historyExpense: {
    fontSize: 13,
    color: '#D93025',
    fontWeight: '600',
  },
  historyNet: {
    fontSize: 13,
    fontWeight: '700',
    width: 72,
    textAlign: 'right',
  },
});
