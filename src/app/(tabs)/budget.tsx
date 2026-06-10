import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { getCategoryByNameOrId, getCurrencySymbol } from '@/features/expenses/types';
import { useBudgets } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { useSettingsStore } from '@/store/settingsStore';

function formatMonthKey(timestamp: number) {
  const date = new Date(timestamp);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function formatCurrency(amount: number, symbol: string) {
  return `${symbol}${amount.toFixed(2)}`;
}

export default function BudgetScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const currency = useSettingsStore((state) => state.currency) || 'USD';
  const symbol = getCurrencySymbol(currency);

  const { data: budgets = [] } = useBudgets();
  const { data: transactions = [] } = useTransactions();

  const currentMonth = useMemo(
    () => `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
    []
  );

  const budgetsForMonth = useMemo(
    () => budgets.filter((budget) => budget.month === currentMonth),
    [budgets, currentMonth]
  );

  const monthlyBudgets = budgetsForMonth.length > 0 ? budgetsForMonth : budgets;

  const monthExpenses = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          tx.type === 'expense' && formatMonthKey(tx.transactionDate) === currentMonth
      ),
    [transactions, currentMonth]
  );

  const totalMonthlyBudget = useMemo(
    () => monthlyBudgets.reduce((sum, budget) => sum + budget.amount, 0),
    [monthlyBudgets]
  );

  const totalSpent = useMemo(
    () => monthExpenses.reduce((sum, tx) => sum + tx.amount, 0),
    [monthExpenses]
  );

  const totalRemaining = Math.max(totalMonthlyBudget - totalSpent, 0);
  const totalProgress = totalMonthlyBudget > 0 ? Math.min(totalSpent / totalMonthlyBudget, 1) : 0;

  const budgetRows = useMemo(
    () =>
      monthlyBudgets.map((budget) => {
        const category = getCategoryByNameOrId(budget.category);
        const spentByCategory = monthExpenses
          .filter((tx) => getCategoryByNameOrId(tx.category).id === category.id)
          .reduce((sum, tx) => sum + tx.amount, 0);
        const progress = budget.amount > 0 ? Math.min(spentByCategory / budget.amount, 1) : 0;
        return {
          id: budget.id,
          label: category.label,
          icon: category.icon,
          iconBg: category.bgLight,
          iconColor: category.color,
          amount: budget.amount,
          spent: spentByCategory,
          progress,
          overBudget: spentByCategory > budget.amount,
        };
      }),
    [monthlyBudgets, monthExpenses]
  );

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}> 
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <ThemedText type="subtitle" style={styles.pageTitle}>
            Budget
          </ThemedText>
          <Pressable style={styles.editLink}>
            <ThemedText type="smallBold" style={styles.editText}>
              Edit
            </ThemedText>
          </Pressable>
        </View>

        <ThemedView style={styles.budgetCard}>
          <View>
            <ThemedText type="smallBold" style={styles.cardLabel}>
              Monthly Budget
            </ThemedText>
            <ThemedText type="subtitle" style={styles.cardAmount}>
              {formatCurrency(totalMonthlyBudget, symbol)}
            </ThemedText>
          </View>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${totalProgress * 100}%` }]} />
          </View>

          <View style={styles.budgetStatsRow}>
            <View style={styles.statPill}>
              <ThemedText type="smallBold" style={styles.statPillText}>
                {formatCurrency(totalSpent, symbol)} spent
              </ThemedText>
            </View>
            <View style={styles.statPill}> 
              <ThemedText type="smallBold" style={styles.statPillText}>
                {formatCurrency(totalRemaining, symbol)} remaining
              </ThemedText>
            </View>
          </View>
        </ThemedView>

        <ThemedText type="smallBold" style={[styles.sectionTitle, { color: colors.text }]}>Category Budgets</ThemedText>

        {budgetRows.length === 0 ? (
          <ThemedView style={[styles.emptyBudgetCard, { backgroundColor: colors.backgroundElement }]}>
            <ThemedText themeColor="textSecondary">No budgets set for this month yet.</ThemedText>
          </ThemedView>
        ) : (
          budgetRows.map((row) => (
            <ThemedView key={row.id} style={[styles.categoryRow, { backgroundColor: colors.backgroundElement }]}>
              <View style={styles.rowTop}>
                <View style={[styles.categoryIcon, { backgroundColor: row.iconBg }]}> 
                  <Ionicons name={row.icon} size={18} color={row.iconColor} />
                </View>
                <View style={styles.categoryText}> 
                  <ThemedText style={styles.categoryLabel}>{row.label}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.categoryAmount}>
                    {formatCurrency(row.spent, symbol)} / {formatCurrency(row.amount, symbol)}
                  </ThemedText>
                </View>
                {row.overBudget && (
                  <View style={styles.overBudgetBadge}>
                    <ThemedText style={styles.overBudgetText}>Over budget</ThemedText>
                  </View>
                )}
              </View>
              <View style={styles.progressTrackSmall}>
                <View
                  style={[
                    styles.progressFillSmall,
                    {
                      width: `${row.progress * 100}%`,
                      backgroundColor: row.overBudget ? '#EF4444' : row.iconColor,
                    },
                  ]}
                />
              </View>
            </ThemedView>
          ))
        )}

        <Pressable style={styles.primaryButton}>
          <Ionicons name="add" size={18} color="white" />
          <ThemedText type="smallBold" style={styles.primaryButtonText}>
            Add Category Budget
          </ThemedText>
        </Pressable>

        <ThemedView style={[styles.suggestionsCard, { backgroundColor: colors.backgroundElement }]}>
          <View style={styles.suggestionsHeader}>
            <View style={styles.suggestionsTitleRow}>
              <Ionicons name="sparkles" size={18} color="#1E88E5" />
              <ThemedText type="smallBold" style={styles.suggestionsTitle}>
                AI Budget Suggestions
              </ThemedText>
            </View>
          </View>

          {[
            { text: 'Reduce dining by $200' },
            { text: 'Increase savings by $150' },
          ].map((item) => (
            <View key={item.text} style={styles.suggestionRow}>
              <ThemedText>{item.text}</ThemedText>
              <Pressable style={styles.applyButton}>
                <ThemedText type="smallBold" style={styles.applyButtonText}>
                  Apply
                </ThemedText>
              </Pressable>
            </View>
          ))}
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  page: {
    padding: Spacing.four,
    gap: Spacing.four,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: '800',
  },
  editLink: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  editText: {
    color: '#1E88E5',
    fontSize: 14,
  },
  budgetCard: {
    borderRadius: 24,
    padding: Spacing.four,
    backgroundColor: '#1E88E5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 6,
  },
  cardLabel: {
    color: '#E5EEFF',
    fontSize: 14,
  },
  cardAmount: {
    color: 'white',
    marginTop: Spacing.two,
  },
  progressTrack: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.35)',
    borderRadius: 999,
    marginTop: Spacing.four,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'white',
  },
  budgetStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.four,
    gap: Spacing.three,
  },
  statPill: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
  },
  statPillText: {
    color: 'white',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  emptyBudgetCard: {
    borderRadius: 18,
    padding: Spacing.four,
  },
  categoryRow: {
    borderRadius: 18,
    padding: Spacing.four,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginBottom: Spacing.two,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryText: {
    flex: 1,
    marginLeft: Spacing.three,
  },
  categoryLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  categoryAmount: {
    fontSize: 14,
    marginTop: Spacing.one,
  },
  overBudgetBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.one,
    borderRadius: 999,
  },
  overBudgetText: {
    color: '#B91C1C',
    fontSize: 12,
  },
  progressTrackSmall: {
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    borderRadius: 999,
  },
  primaryButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.four,
    borderRadius: 18,
    backgroundColor: '#1E88E5',
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 15,
  },
  suggestionsCard: {
    borderRadius: 24,
    padding: Spacing.four,
  },
  suggestionsHeader: {
    marginBottom: Spacing.four,
  },
  suggestionsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  suggestionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.three,
    borderRadius: 16,
    marginBottom: Spacing.three,
  },
  applyButton: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.four,
    borderRadius: 12,
    backgroundColor: '#E8F2FF',
  },
  applyButtonText: {
    color: '#1E88E5',
    fontSize: 14,
  },
});
