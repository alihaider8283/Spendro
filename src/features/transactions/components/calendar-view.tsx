import React from 'react';
import { StyleSheet, View, Pressable, ScrollView, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { Transaction } from '../types';

interface CalendarViewProps {
  calendarDays: { dayNumber: number | null; dateString: string }[];
  selectedCalendarDate: string;
  setSelectedCalendarDate: (dateStr: string) => void;
  selectedDateTransactions: Transaction[];
  dailyTotalMap: { [key: string]: number };
}

export function CalendarView({
  calendarDays,
  selectedCalendarDate,
  setSelectedCalendarDate,
  selectedDateTransactions,
  dailyTotalMap,
}: CalendarViewProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.calendarScroll} showsVerticalScrollIndicator={false}>
      {/* Weekday headers */}
      <View style={styles.weekdayRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
          <ThemedText key={i} style={styles.weekdayLabel} themeColor="textSecondary">
            {day}
          </ThemedText>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.calendarGrid}>
        {calendarDays.map((item, idx) => {
          const isSelected = item.dateString === selectedCalendarDate;
          const hasTransaction = item.dateString && dailyTotalMap[item.dateString] > 0;
          const totalAmount = item.dateString ? dailyTotalMap[item.dateString] : 0;

          return (
            <Pressable
              key={idx}
              style={[
                styles.calendarCell,
                !item.dayNumber && styles.calendarCellEmpty,
                isSelected && { backgroundColor: '#3369F6' },
              ]}
              disabled={!item.dayNumber}
              onPress={() => item.dateString && setSelectedCalendarDate(item.dateString)}
            >
              {item.dayNumber && (
                <>
                  <ThemedText
                    style={[
                      styles.calendarCellNumber,
                      { color: isSelected ? '#ffffff' : theme.text },
                      !item.dayNumber && { color: 'transparent' },
                    ]}
                  >
                    {item.dayNumber}
                  </ThemedText>
                  {hasTransaction && (
                    <ThemedText
                      style={[
                        styles.calendarCellPrice,
                        { color: isSelected ? '#ffffff' : '#D56B2D' },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      -${Math.round(totalAmount)}
                    </ThemedText>
                  )}
                </>
              )}
            </Pressable>
          );
        })}
      </View>

      {/* Details for Selected Day */}
      <View style={styles.dayDetailsContainer}>
        <View style={styles.dayDetailsHeader}>
          <ThemedText style={styles.dayDetailsTitle}>
            {new Date(selectedCalendarDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </ThemedText>
          <ThemedText style={styles.dayDetailsSum}>
            {selectedDateTransactions.length > 0
              ? `-$${selectedDateTransactions
                  .reduce((sum, t) => sum + (t.amount < 0 ? Math.abs(t.amount) : 0), 0)
                  .toFixed(2)}`
              : '$0.00'}
          </ThemedText>
        </View>

        {selectedDateTransactions.length === 0 ? (
          <ThemedText style={styles.noTransactionsForDay} themeColor="textSecondary">
            No transactions for this day.
          </ThemedText>
        ) : (
          selectedDateTransactions.map(trans => {
            const sign = trans.amount < 0 ? '-' : '+';
            const amountStr = `${sign}$${Math.abs(trans.amount).toFixed(2)}`;
            const isExpense = trans.amount < 0;

            return (
              <Pressable
                key={trans.id}
                style={({ pressed }) => [
                  styles.transactionCard,
                  {
                    backgroundColor: theme.background,
                    borderColor: scheme === 'dark' ? theme.backgroundElement : '#E5E7EB',
                  },
                  pressed && styles.cardPressed,
                ]}
                onPress={() => router.push(`/expense/${trans.id}`)}
              >
                <View
                  style={[
                    styles.iconWrapper,
                    {
                      backgroundColor: scheme === 'dark' ? trans.iconBgDark : trans.iconBgLight,
                    },
                  ]}
                >
                  <Ionicons name={trans.icon} size={22} color={trans.iconColor} />
                </View>
                <View style={styles.textContainer}>
                  <ThemedText style={styles.cardTitle}>{trans.title}</ThemedText>
                  <ThemedText style={styles.cardSubtitle} themeColor="textSecondary">
                    {trans.category}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[
                    styles.cardAmount,
                    { color: isExpense ? theme.text : '#137333' },
                  ]}
                >
                  {amountStr}
                </ThemedText>
              </Pressable>
            );
          })
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  calendarScroll: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: Spacing.two,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E5E7EB',
    marginBottom: Spacing.two,
  },
  weekdayLabel: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: Spacing.four,
  },
  calendarCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    marginVertical: 2,
    padding: 2,
  },
  calendarCellEmpty: {
    backgroundColor: 'transparent',
  },
  calendarCellNumber: {
    fontSize: 14,
    fontWeight: '600',
  },
  calendarCellPrice: {
    fontSize: 9,
    fontWeight: '700',
    marginTop: 2,
  },
  dayDetailsContainer: {
    marginTop: Spacing.two,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    paddingTop: Spacing.three,
  },
  dayDetailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  dayDetailsTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  dayDetailsSum: {
    fontSize: 18,
    fontWeight: '800',
    color: '#D56B2D',
  },
  noTransactionsForDay: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: Spacing.four,
  },
  transactionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardPressed: {
    opacity: 0.9,
  },
  iconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  textContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  cardSubtitle: {
    fontSize: 13,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'right',
  },
});
