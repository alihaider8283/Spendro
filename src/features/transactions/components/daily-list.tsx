import React from 'react';
import { StyleSheet, View, Pressable, ScrollView, useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { ThemedText } from '@/components/themed-text';
import { ListItem } from '../types';

interface DailyListProps {
  groupedDailyItems: { [key: string]: ListItem[] };
  monthLabel: string;
}

export function DailyList({ groupedDailyItems, monthLabel }: DailyListProps) {
  const router = useRouter();
  const scheme = useColorScheme();
  const theme = useTheme();

  return (
    <ScrollView contentContainerStyle={styles.dailyScroll} showsVerticalScrollIndicator={false}>
      {Object.keys(groupedDailyItems).length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color={theme.textSecondary} style={{ opacity: 0.5 }} />
          <ThemedText style={styles.emptyStateTitle}>No transactions</ThemedText>
          <ThemedText style={styles.emptyStateSub} themeColor="textSecondary">
            There are no transactions recorded for {monthLabel}.
          </ThemedText>
        </View>
      ) : (
        Object.keys(groupedDailyItems).map(groupKey => (
          <View key={groupKey} style={styles.sectionContainer}>
            <ThemedText style={styles.sectionHeader}>{groupKey}</ThemedText>
            {groupedDailyItems[groupKey].map((item, idx) => {
              if (item.type === 'transaction') {
                const trans = item.data;
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
              } else {
                const insight = item.data;
                return (
                  <View
                    key={insight.id}
                    style={[
                      styles.insightCard,
                      {
                        backgroundColor: scheme === 'dark' ? '#1A2E4C' : '#F4F8FD',
                        borderColor: scheme === 'dark' ? '#2A4E7F' : '#D2E3FC',
                      },
                    ]}
                  >
                    <Ionicons
                      name={insight.icon}
                      size={20}
                      color={insight.color}
                      style={styles.insightIcon}
                    />
                    <View style={styles.insightContent}>
                      <ThemedText
                        type="smallBold"
                        style={[styles.insightTitle, { color: insight.color }]}
                      >
                        {insight.title}
                      </ThemedText>
                      <ThemedText style={styles.insightDescription} themeColor="textSecondary">
                        {insight.description}
                      </ThemedText>
                    </View>
                  </View>
                );
              }
            })}
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  dailyScroll: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  sectionContainer: {
    marginBottom: Spacing.four,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
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
  insightCard: {
    flexDirection: 'row',
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.three,
    marginVertical: Spacing.one,
    marginBottom: Spacing.two,
  },
  insightIcon: {
    marginRight: Spacing.three,
    marginTop: 2,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  insightDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.six,
    gap: Spacing.two,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: Spacing.two,
  },
  emptyStateSub: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: Spacing.four,
  },
});
