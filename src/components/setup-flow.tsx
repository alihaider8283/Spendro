import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Spacing } from '@/constants/theme';
import { CURRENCIES, getCurrencySymbol } from '@/features/expenses/types';
import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/settingsStore';
import BudgetSetup from './budget-setup';

interface SetupFlowProps {
  onDone?: () => void | Promise<void>;
}

function StepDots({ active, theme }: { active: 1 | 2 | 3; theme: ReturnType<typeof useTheme> }) {
  return (
    <View style={styles.stepRow}>
      {[1, 2, 3].map((step) => (
        <View
          key={step}
          style={[
            styles.stepDot,
            {
              backgroundColor: step === active ? theme.primary : theme.backgroundElement,
              width: step === active ? 24 : 8,
            },
          ]}
        />
      ))}
    </View>
  );
}

export default function SetupFlow({ onDone }: SetupFlowProps) {
  const [selected, setSelected] = useState('USD');
  const [income, setIncome] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const { setCurrency, setMonthlyIncome } = useSettingsStore();
  const theme = useTheme();

  const handleCurrencyContinue = () => {
    setCurrency(selected);
    setStep(2);
  };

  const handleIncomeContinue = () => {
    setMonthlyIncome(parseFloat(income) || 0);
    setStep(3);
  };

  if (step === 3) {
    return (
      <BudgetSetup
        onBack={() => setStep(2)}
        onDone={onDone}
      />
    );
  }

  if (step === 2) {
    const symbol = getCurrencySymbol(selected);
    return (
      <ThemedView style={styles.screen}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.brandIcon, { backgroundColor: theme.primary }]}>
            <Ionicons name="sparkles-outline" size={17} color="#FFF" />
          </View>
          <ThemedText style={styles.brandText}>Spendro</ThemedText>
          <View style={styles.flex1} />
          <StepDots active={2} theme={theme} />
        </View>

        {/* Title */}
        <View style={styles.titleBlock}>
          <ThemedText style={styles.title}>Monthly income</ThemedText>
          <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
            Optional — helps us show you a clearer picture of your budget
          </ThemedText>
        </View>

        <View style={[styles.incomeInputWrap, { backgroundColor: theme.backgroundElement }]}>
          <ThemedText style={styles.incomeSymbol}>{symbol}</ThemedText>
          <TextInput
            style={[styles.incomeInput, { color: theme.text }]}
            value={income}
            onChangeText={(val) => setIncome(val.replace(/[^0-9.]/g, ''))}
            keyboardType="decimal-pad"
            placeholder="0"
            placeholderTextColor={theme.textSecondary}
            returnKeyType="done"
            autoFocus
          />
        </View>

        <View style={styles.flex1} />

        {/* Footer */}
        <View style={[styles.footer, { borderTopColor: theme.backgroundElement }]}>
          <Pressable
            style={({ pressed }) => [
              styles.btn,
              { backgroundColor: theme.primary },
              pressed && { opacity: 0.85 },
            ]}
            onPress={handleIncomeContinue}
          >
            <ThemedText style={styles.btnText}>Continue</ThemedText>
            <Ionicons name="arrow-forward" size={20} color="#FFF" />
          </Pressable>
          <Pressable onPress={handleIncomeContinue}>
            <ThemedText style={[styles.note, { color: theme.textSecondary }]}>
              Skip for now
            </ThemedText>
          </Pressable>
        </View>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.screen}>
      {/* Header */}
      <View style={styles.header}>
        <View style={[styles.brandIcon, { backgroundColor: theme.primary }]}>
          <Ionicons name="sparkles-outline" size={17} color="#FFF" />
        </View>
        <ThemedText style={styles.brandText}>Spendro</ThemedText>
        <View style={styles.flex1} />
        <StepDots active={1} theme={theme} />
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
                { backgroundColor: active ? theme.primary : theme.backgroundElement },
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
                  <Ionicons name="checkmark" size={11} color={theme.primary} />
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
            { backgroundColor: theme.primary },
            pressed && { opacity: 0.85 },
          ]}
          onPress={handleCurrencyContinue}
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

  incomeInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
    marginBottom: Spacing.four,
  },
  incomeSymbol: {
    fontSize: 32,
    fontWeight: '800',
    marginRight: Spacing.two,
  },
  incomeInput: {
    flex: 1,
    fontSize: 32,
    fontWeight: '800',
    padding: 0,
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
