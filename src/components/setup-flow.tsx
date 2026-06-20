import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/settingsStore';
import BudgetSetup from './budget-setup';

interface SetupFlowProps {
  onDone?: () => void | Promise<void>;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar',        symbol: '$'  },
  { code: 'EUR', name: 'Euro',             symbol: '€'  },
  { code: 'GBP', name: 'British Pound',    symbol: '£'  },
  { code: 'INR', name: 'Indian Rupee',     symbol: '₹'  },
  { code: 'JPY', name: 'Japanese Yen',     symbol: '¥'  },
  { code: 'AUD', name: 'Australian Dollar',symbol: 'A$' },
  { code: 'PKR', name: 'Pakistan Rupee',   symbol: '₨'  },
];

export default function SetupFlow({ onDone }: SetupFlowProps) {
  const [selected, setSelected] = useState('USD');
  const [step, setStep] = useState<1 | 2>(1);
  const { setCurrency } = useSettingsStore();
  const theme = useTheme();

  const handleContinue = () => {
    setCurrency(selected);
    setStep(2);
  };

  if (step === 2) {
    return (
      <BudgetSetup
        onBack={() => setStep(1)}
        onDone={onDone}
      />
    );
  }

  return (
    <ThemedView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.brandIcon, { backgroundColor: '#3369F6' }]}>
          <Ionicons name="sparkles-outline" size={17} color="#FFF" />
        </View>
        <ThemedText style={styles.brandText}>Spendro</ThemedText>
        <View style={styles.flex1} />
        <View style={styles.stepRow}>
          <View style={[styles.stepDot, { backgroundColor: '#3369F6', width: 24 }]} />
          <View style={[styles.stepDot, { backgroundColor: theme.backgroundElement }]} />
        </View>
      </View>

      {/* Title */}
      <View style={styles.titleBlock}>
        <ThemedText style={styles.title}>Pick your currency</ThemedText>
        <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
          Used for all your transactions and budgets
        </ThemedText>
      </View>

      {/* Currency grid */}
      <FlatList
        data={CURRENCIES}
        keyExtractor={item => item.code}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => {
          const active = item.code === selected;
          return (
            <Pressable
              onPress={() => setSelected(item.code)}
              style={({ pressed }) => [
                styles.card,
                { backgroundColor: active ? '#3369F6' : theme.backgroundElement },
                pressed && !active && { opacity: 0.75 },
              ]}
            >
              <ThemedText
                style={[styles.symbol, { color: active ? '#FFF' : theme.text }]}
              >
                {item.symbol}
              </ThemedText>
              <ThemedText
                style={[styles.code, { color: active ? '#FFF' : theme.text }]}
              >
                {item.code}
              </ThemedText>
              <ThemedText
                style={[styles.name, { color: active ? 'rgba(255,255,255,0.7)' : theme.textSecondary }]}
              >
                {item.name}
              </ThemedText>
              {active && (
                <View style={styles.checkBadge}>
                  <Ionicons name="checkmark" size={11} color="#3369F6" />
                </View>
              )}
            </Pressable>
          );
        }}
      />

      {/* Footer */}
      <View style={[styles.footer, { borderTopColor: theme.backgroundElement }]}>
        <Pressable
          style={({ pressed }) => [
            styles.btn,
            { backgroundColor: '#3369F6' },
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleContinue}
        >
          <ThemedText style={styles.btnText}>Continue</ThemedText>
          <Ionicons name="arrow-forward" size={20} color="#FFF" />
        </Pressable>
        <ThemedText style={[styles.note, { color: theme.textSecondary }]}>
          You can change this later in Settings
        </ThemedText>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  flex1: { flex: 1 },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingTop: Spacing.five,
    marginBottom: Spacing.four,
  },
  brandIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  stepRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  stepDot: {
    height: 8,
    width: 8,
    borderRadius: 4,
  },

  titleBlock: {
    marginBottom: Spacing.four,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },

  grid: {
    paddingBottom: Spacing.four,
  },
  row: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  card: {
    flex: 1,
    borderRadius: 20,
    padding: Spacing.three,
    minHeight: 110,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  symbol: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  code: {
    fontSize: 15,
    fontWeight: '700',
  },
  name: {
    fontSize: 12,
    marginTop: 2,
  },
  checkBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  footer: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.five,
  },
  btn: {
    height: 54,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: Spacing.three,
    shadowColor: '#3369F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  btnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  note: {
    fontSize: 13,
    textAlign: 'center',
  },
});
