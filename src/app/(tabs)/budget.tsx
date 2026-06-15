import { Ionicons } from '@expo/vector-icons';
import { useMemo } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  useColorScheme,
  View,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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
  return `${symbol} ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function BudgetScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const router = useRouter();
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
          iconBg: scheme === 'dark' ? category.bgDark : category.bgLight,
          iconColor: category.color,
          amount: budget.amount,
          spent: spentByCategory,
          progress,
          overBudget: spentByCategory > budget.amount,
        };
      }),
    [monthlyBudgets, monthExpenses, scheme]
  );

  const pageBgColor = scheme === 'dark' ? '#121212' : '#F8F9FA';
  const cardBgColor = scheme === 'dark' ? '#1E1E1E' : '#FFFFFF';
  const borderCardColor = scheme === 'dark' ? '#2D2D2D' : '#E2E8F0';

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: pageBgColor }]}> 
      <ScrollView contentContainerStyle={styles.page} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <ThemedText type="subtitle" style={[styles.pageTitle, { color: colors.text }]}>
            Budget
          </ThemedText>
          <TouchableOpacity style={styles.editLink} onPress={() => router.push('/budget-setup')} activeOpacity={0.7}>
            <ThemedText style={styles.editText}>
              Edit
            </ThemedText>
          </TouchableOpacity>
        </View>

        <ThemedView style={[styles.budgetCard, { backgroundColor: '#0B66E4' }]}>
          {/* Decorative background shapes */}
          <View style={styles.cardDecorativeContainer}>
            <View style={styles.cardDecorativeShape1} />
            <View style={styles.cardDecorativeShape2} />
          </View>

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
          <ThemedView style={[styles.emptyBudgetCard, { backgroundColor: cardBgColor, borderColor: borderCardColor, borderWidth: 1 }]}>
            <ThemedText themeColor="textSecondary">No budgets set for this month yet.</ThemedText>
          </ThemedView>
        ) : (
          budgetRows.map((row) => (
            <ThemedView key={row.id} style={[styles.categoryRow, { backgroundColor: cardBgColor, borderColor: borderCardColor, borderWidth: 1 }]}>
              <View style={styles.rowTop}>
                <View style={[styles.categoryIcon, { backgroundColor: row.iconBg }]}> 
                  <Ionicons name={row.icon} size={18} color={row.iconColor} style={{ textAlign: 'center' }} />
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

        <TouchableOpacity
          style={[styles.primaryButton, { backgroundColor: '#0B66E4' }]}
          onPress={() => router.push('/budget-setup')}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={18} color="white" />
          <ThemedText style={styles.primaryButtonText}>
            Add Category Budget
          </ThemedText>
        </TouchableOpacity>
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
    fontWeight: '850',
  },
  editLink: {
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  editText: {
    color: '#0B66E4',
    fontSize: 14,
    fontWeight: '700',
  },
  budgetCard: {
    borderRadius: 16,
    padding: Spacing.four,
    backgroundColor: '#0B66E4',
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardLabel: {
    color: '#E5EEFF',
    fontSize: 12,
    letterSpacing: 0.5,
  },
  cardAmount: {
    color: 'white',
    marginTop: Spacing.two,
    fontSize: 36,
    fontWeight: '800',
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
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    alignItems: 'center',
  },
  statPillText: {
    color: 'white',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '750',
    marginTop: 8,
  },
  emptyBudgetCard: {
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    alignItems: 'center',
  },
  categoryRow: {
    borderRadius: 16,
    padding: Spacing.four,
    borderWidth: 1,
    marginBottom: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.three,
    marginBottom: Spacing.three,
  },
  categoryIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
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
    fontWeight: '600',
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
    height: 54,
    borderRadius: 12,
    backgroundColor: '#0B66E4',
    shadowColor: '#0B66E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginTop: Spacing.four,
    marginBottom: Spacing.four,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  // Card decorative shapes
  cardDecorativeContainer: {
    position: 'absolute',
    right: -25,
    top: -25,
    width: 140,
    height: 140,
    opacity: 0.12,
  },
  cardDecorativeShape1: {
    position: 'absolute',
    right: 15,
    top: 25,
    width: 90,
    height: 110,
    borderRadius: 12,
    borderWidth: 5,
    borderColor: '#ffffff',
    transform: [{ rotate: '15deg' }],
  },
  cardDecorativeShape2: {
    position: 'absolute',
    right: -10,
    top: 35,
    width: 90,
    height: 110,
    borderRadius: 12,
    borderWidth: 5,
    borderColor: '#ffffff',
    transform: [{ rotate: '30deg' }],
  },
});
