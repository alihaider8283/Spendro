import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import { FAB } from '@/components/floating-action-button';

const recentTransactions = [
  { id: '1', title: 'Starbucks', amount: '-$6.40', subtitle: 'Coffee' },
  { id: '2', title: 'Whole Foods', amount: '-$82.15', subtitle: 'Groceries · AI categorized' },
  { id: '3', title: 'Uber', amount: '-$18.90', subtitle: 'Transport · AI categorized' },
];

export default function HomeScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const { user, isAuthenticated } = useAuthStore();
  const router = useRouter();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>      
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.smallText, { color: colors.textSecondary }]}>
              {isAuthenticated ? 'Welcome back' : 'Good morning'}
            </Text>
            <Text style={[styles.title, { color: colors.text }]}>
              {isAuthenticated ? (user?.name || 'User') : 'Guest'}
            </Text>
          </View>
          <Pressable 
            onPress={() => !isAuthenticated && router.push('/(auth)/auth')}
            style={({ pressed }) => [
              styles.avatar, 
              { backgroundColor: colors.backgroundElement },
              pressed && !isAuthenticated && { opacity: 0.7 }
            ]}
            accessibilityRole={!isAuthenticated ? 'button' : undefined}
            accessibilityLabel={!isAuthenticated ? 'Log in or sign up' : undefined}
          > 
            <Text style={[styles.avatarText, { color: colors.text }]}>
              {isAuthenticated ? (user?.name?.[0] || 'U').toUpperCase() : 'G'}
            </Text>
          </Pressable>
        </View>

        <View style={[styles.card, { backgroundColor: '#3369F6' }]}> 
          <Text style={styles.cardLabel}>Total spent this month</Text>
          <Text style={styles.cardAmount}>$2,847.50</Text>
          <View style={styles.cardRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>+12% vs last month</Text>
            </View>
            <Text style={styles.cardSubText}>Budget $3,500</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={styles.progressFill} />
          </View>
        </View>

        <View style={styles.actionsRow}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: colors.backgroundElement }]}
            onPress={() => router.push('/expense/add')}
          >
            <Text style={[styles.actionButtonText, { color: colors.text }]}>+ Add Expense</Text>
          </Pressable>
          <Pressable style={[styles.actionButton, { backgroundColor: colors.backgroundElement }]}>
            <Text style={[styles.actionButtonText, { color: colors.text }]}>Scan Receipt</Text>
          </Pressable>
        </View>

        <View style={[styles.alertCard, { backgroundColor: colors.backgroundElement }]}> 
          <Text style={[styles.alertTitle, { color: colors.text }]}>Budget Alert</Text>
          <Text style={[styles.alertBody, { color: colors.textSecondary }]}>{"You've used 81% of your monthly budget. $652 remaining."}</Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundElement }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Spending Overview</Text>
          <View style={[styles.chartPlaceholder, { backgroundColor: colors.background }]}> 
            <Text style={[styles.chartLabel, { color: colors.textSecondary }]}>Last 6 months</Text>
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundElement }]}> 
          <Text style={[styles.sectionTitle, { color: colors.text }]}>AI Insights</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary }]}>Dining out increased 24% this month. Predicted total: $3,180 by month end.</Text>
          <Text style={[styles.bodyText, { color: colors.textSecondary, marginTop: Spacing.two }]}>Cutting subscriptions could save you $48/mo.</Text>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: colors.backgroundElement }]}> 
          <View style={styles.transactionsHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Transactions</Text>
            <Text style={[styles.linkText, { color: '#3369F6' }]}>See all</Text>
          </View>
          {recentTransactions.map((item) => (
            <View key={item.id} style={styles.transactionRow}>
              <View style={[styles.transactionIcon, { backgroundColor: colors.background }]}> 
                <Text style={{ color: '#3369F6' }}>{item.title[0]}</Text>
              </View>
              <View style={styles.transactionText}>
                <Text style={[styles.transactionTitle, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.transactionSubtitle, { color: colors.textSecondary }]}>{item.subtitle}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: colors.text }]}>{item.amount}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
      <FAB />
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  smallText: {
    fontSize: 14,
    marginBottom: Spacing.one,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '700',
  },
  card: {
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  cardLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: Spacing.two,
  },
  cardAmount: {
    fontSize: 36,
    fontWeight: '800',
    color: '#ffffff',
    marginBottom: Spacing.four,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.three,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
  },
  cardSubText: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 13,
  },
  progressBar: {
    width: '100%',
    height: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.25)',
    overflow: 'hidden',
  },
  progressFill: {
    width: '82%',
    height: '100%',
    backgroundColor: '#ffffff',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonText: {
    fontWeight: '700',
  },
  alertCard: {
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four,
  },
  alertTitle: {
    fontWeight: '800',
    fontSize: 16,
    marginBottom: Spacing.one,
  },
  alertBody: {
    fontSize: 14,
    lineHeight: 20,
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
  chartPlaceholder: {
    borderRadius: 18,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.7,
  },
  chartLabel: {
    fontSize: 14,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  transactionsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  linkText: {
    fontSize: 14,
    fontWeight: '700',
  },
  transactionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
  },
  transactionIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  transactionText: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  transactionSubtitle: {
    fontSize: 13,
    marginTop: Spacing.one,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: Spacing.three,
  },
});
