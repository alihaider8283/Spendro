import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { PieChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';
import { getCategoryByNameOrId } from '@/features/expenses/types';
import type { Transaction } from '@/features/transactions/types';

interface CategoryDonutChartProps {
  transactions: Transaction[];
  month: string; // 'YYYY-MM'
  currencySymbol: string;
  textColor: string;
  textSecondaryColor: string;
  surfaceColor: string;
}

function getMonthRange(monthStr: string): { start: number; end: number } {
  const [y, m] = monthStr.split('-').map(Number);
  return {
    start: new Date(y, m - 1, 1).getTime(),
    end: new Date(y, m, 1).getTime() - 1,
  };
}

export function CategoryDonutChart({
  transactions,
  month,
  currencySymbol,
  textColor,
  textSecondaryColor,
  surfaceColor,
}: CategoryDonutChartProps) {
  const { sortedCategories, totalExpense } = useMemo(() => {
    const { start, end } = getMonthRange(month);
    const monthExpenses = transactions.filter(
      (t) => t.type === 'expense' && t.transactionDate >= start && t.transactionDate <= end
    );
    const categoryTotals: Record<string, number> = {};
    for (const t of monthExpenses) {
      categoryTotals[t.category] = (categoryTotals[t.category] ?? 0) + t.amount;
    }
    const total = Object.values(categoryTotals).reduce((a, b) => a + b, 0);
    const sorted = Object.entries(categoryTotals).sort(([, a], [, b]) => b - a);
    return { sortedCategories: sorted, totalExpense: total };
  }, [transactions, month]);

  if (sortedCategories.length === 0) {
    return (
      <ThemedText style={[styles.emptyText, { color: textSecondaryColor }]}>
        No expenses this month
      </ThemedText>
    );
  }

  const pieData = sortedCategories.map(([categoryId, amount]) => {
    const category = getCategoryByNameOrId(categoryId);
    return { value: amount, color: category.color };
  });

  return (
    <View>
      <View style={styles.chartRow}>
        <PieChart
          data={pieData}
          donut
          radius={70}
          innerRadius={46}
          innerCircleColor={surfaceColor}
          centerLabelComponent={() => (
            <View style={styles.centerLabel}>
              <ThemedText style={[styles.centerAmount, { color: textColor }]} numberOfLines={1}>
                {currencySymbol}{totalExpense.toFixed(0)}
              </ThemedText>
              <ThemedText style={[styles.centerCaption, { color: textSecondaryColor }]}>
                Spent
              </ThemedText>
            </View>
          )}
        />
      </View>

      <View style={styles.legend}>
        {sortedCategories.map(([categoryId, amount]) => {
          const category = getCategoryByNameOrId(categoryId);
          const percent = totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0;
          return (
            <View key={categoryId} style={styles.legendRow}>
              <View style={[styles.legendDot, { backgroundColor: category.color }]} />
              <ThemedText style={[styles.legendLabel, { color: textColor }]} numberOfLines={1}>
                {category.label}
              </ThemedText>
              <ThemedText style={[styles.legendPercent, { color: textSecondaryColor }]}>
                {percent}%
              </ThemedText>
              <ThemedText style={[styles.legendAmount, { color: textColor }]}>
                {currencySymbol}{amount.toFixed(2)}
              </ThemedText>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
  chartRow: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  centerLabel: {
    alignItems: 'center',
  },
  centerAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  centerCaption: {
    fontSize: 11,
    marginTop: 2,
  },
  legend: {
    gap: Spacing.two,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
  },
  legendPercent: {
    fontSize: 12,
    width: 36,
    textAlign: 'right',
  },
  legendAmount: {
    fontSize: 14,
    fontWeight: '700',
    width: 80,
    textAlign: 'right',
  },
});
