import { ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { CategoryDonutChart } from '@/features/expenses/components/category-donut-chart';
import { IncomeExpenseTrendChart } from '@/features/expenses/components/income-expense-trend-chart';
import { getCurrencySymbol } from '@/features/expenses/types';
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

  const totalExpense = monthExpenses.reduce((sum, t) => sum + t.amount, 0);

  const currentStats = stats.find(s => s.month === currentMonth);
  const totalIncome = currentStats?.income ?? 0;
  const balance = totalIncome - totalExpense;

  const last6Stats = stats.slice(0, 6);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[styles.pageTitle, { color: colors.text }]}>Analytics</Text>

        <View style={[styles.summaryCard, { backgroundColor: colors.primary }]}>
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
          <CategoryDonutChart
            transactions={transactions}
            month={currentMonth}
            currencySymbol={currencySymbol}
            textColor={colors.text}
            textSecondaryColor={colors.textSecondary}
            surfaceColor={colors.backgroundElement}
          />
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundElement }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Monthly History</Text>
          <IncomeExpenseTrendChart
            stats={last6Stats}
            incomeColor={colors.primary}
            expenseColor="#D93025"
            textColor={colors.text}
            textSecondaryColor={colors.textSecondary}
          />
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
});
