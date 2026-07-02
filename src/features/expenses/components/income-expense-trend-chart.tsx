import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { LineChart } from 'react-native-gifted-charts';

import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

interface MonthlyStat {
  month: string; // 'YYYY-MM'
  income: number;
  expense: number;
}

interface IncomeExpenseTrendChartProps {
  stats: MonthlyStat[];
  incomeColor: string;
  expenseColor: string;
  textColor: string;
  textSecondaryColor: string;
}

function formatMonthShort(monthStr: string): string {
  const [y, m] = monthStr.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString('en-US', { month: 'short' });
}

export function IncomeExpenseTrendChart({
  stats,
  incomeColor,
  expenseColor,
  textColor,
  textSecondaryColor,
}: IncomeExpenseTrendChartProps) {
  const chronological = useMemo(() => [...stats].slice(0, 6).reverse(), [stats]);

  if (chronological.length === 0) {
    return (
      <ThemedText style={[styles.emptyText, { color: textSecondaryColor }]}>
        No history yet
      </ThemedText>
    );
  }

  const incomeData = chronological.map((s) => ({ value: s.income, label: formatMonthShort(s.month) }));
  const expenseData = chronological.map((s) => ({ value: s.expense }));

  return (
    <View>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: incomeColor }]} />
          <ThemedText style={[styles.legendLabel, { color: textSecondaryColor }]}>Income</ThemedText>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: expenseColor }]} />
          <ThemedText style={[styles.legendLabel, { color: textSecondaryColor }]}>Expense</ThemedText>
        </View>
      </View>

      <LineChart
        data={incomeData}
        data2={expenseData}
        color1={incomeColor}
        color2={expenseColor}
        thickness={2}
        thickness2={2}
        curved
        areaChart
        startFillColor1={incomeColor}
        startFillColor2={expenseColor}
        startOpacity={0.15}
        endOpacity={0}
        height={140}
        noOfSections={4}
        hideRules
        hideDataPoints
        yAxisTextStyle={{ color: textSecondaryColor, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: textSecondaryColor, fontSize: 11 }}
        xAxisColor={textSecondaryColor}
        yAxisColor={textSecondaryColor}
        initialSpacing={16}
        spacing={44}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: Spacing.three,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.four,
    marginBottom: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendLabel: {
    fontSize: 12,
    fontWeight: '600',
  },
});
