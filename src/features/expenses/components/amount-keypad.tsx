import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { CURRENCIES } from '@/features/expenses/types';

interface AmountKeypadProps {
  amount: string;
  currency: string;
  onPress: (key: string) => void;
  onBackspace: () => void;
  onDone: () => void;
  onCurrencyChange: () => void;
}

export function AmountKeypad({
  currency,
  onPress,
  onBackspace,
  onDone,
  onCurrencyChange,
}: AmountKeypadProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const currencySymbol = CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency;
  // Show the next currency in the list as the secondary chip
  const currencyIdx = CURRENCIES.findIndex((c) => c.code === currency);
  const nextCurrency = CURRENCIES[(currencyIdx + 1) % CURRENCIES.length];

  const renderNumKey = useCallback(
    (key: string) => (
      <Pressable
        key={key}
        style={({ pressed }) => [styles.keyButton, pressed && styles.keyPressed]}
        onPress={() => onPress(key)}
        accessibilityRole="button"
        accessibilityLabel={`Keypad ${key}`}
      >
        <Text style={[styles.keyText, { color: colors.text }]}>{key}</Text>
      </Pressable>
    ),
    [colors.text, onPress],
  );

  const renderIconKey = useCallback(
    (
      name: React.ComponentProps<typeof Ionicons>['name'],
      onPressKey: () => void,
      label: string,
    ) => (
      <Pressable
        style={({ pressed }) => [styles.keyButton, pressed && styles.keyPressed]}
        onPress={onPressKey}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Ionicons name={name} size={22} color={colors.text} />
      </Pressable>
    ),
    [colors.text],
  );

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: isDark ? '#2E3135' : '#E8E8EE',
        },
      ]}
    >
      {/* ── Currency Selector Row ── */}
      <View style={styles.currencyRow}>
        <View style={styles.currencyChips}>
          {/* Active currency chip */}
          <Pressable
            style={[styles.currencyChip, styles.currencyChipActive]}
            onPress={onCurrencyChange}
            accessibilityRole="button"
            accessibilityLabel={`Selected currency ${currency}`}
          >
            <Text style={styles.currencyChipActiveText}>{currencySymbol}</Text>
          </Pressable>
          {/* Secondary currency chip */}
          <Pressable
            style={[
              styles.currencyChip,
              { backgroundColor: colors.backgroundElement },
            ]}
            onPress={onCurrencyChange}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${nextCurrency.code}`}
          >
            <Text style={[styles.currencyChipText, { color: colors.text }]}>
              {nextCurrency.symbol}
            </Text>
          </Pressable>
        </View>

        {/* Globe + close icons */}
        <View style={styles.currencyActions}>
          <Pressable
            style={({ pressed }) => [
              styles.actionCircle,
              { backgroundColor: colors.backgroundElement },
              pressed && { opacity: 0.6 },
            ]}
            onPress={onCurrencyChange}
            accessibilityRole="button"
            accessibilityLabel="Open currency options"
          >
            <Ionicons name="globe-outline" size={20} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* ── Keypad Grid ── */}
      {/* Row 1: 1  2  3  ⌫ */}
      <View style={styles.keyRow}>
        {renderNumKey('1')}
        {renderNumKey('2')}
        {renderNumKey('3')}
        {renderIconKey('backspace-outline', onBackspace, 'Backspace')}
      </View>

      {/* Row 2: 4  5  6  − */}
      <View style={styles.keyRow}>
        {renderNumKey('4')}
        {renderNumKey('5')}
        {renderNumKey('6')}
        <Pressable
          style={({ pressed }) => [styles.keyButton, pressed && styles.keyPressed]}
          accessibilityRole="button"
          accessibilityLabel="Minus"
          onPress={() => onPress('-')}
        >
          <Text style={[styles.keyText, styles.keyTextSymbol, { color: colors.text }]}>
            −
          </Text>
        </Pressable>
      </View>

      {/* Row 3: 7  8  9  ⊟ */}
      <View style={styles.keyRow}>
        {renderNumKey('7')}
        {renderNumKey('8')}
        {renderNumKey('9')}
        {renderIconKey('calculator-outline', () => {}, 'Calculator')}
      </View>

      {/* Row 4: 0  .  [spacer]  Done */}
      <View style={styles.keyRow}>
        {renderNumKey('0')}
        {renderNumKey('.')}
        {/* Empty spacer cell */}
        <View style={styles.keyButton} />
        {/* Done button */}
        <Pressable
          style={({ pressed }) => [
            styles.doneButton,
            pressed && styles.doneButtonPressed,
          ]}
          onPress={onDone}
          accessibilityRole="button"
          accessibilityLabel="Done"
        >
          <Text style={styles.doneButtonText}>Done</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  // Currency row
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.three,
    paddingHorizontal: Spacing.two,
  },
  currencyChips: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  currencyChip: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 48,
  },
  currencyChipActive: {
    backgroundColor: '#3369F6',
  },
  currencyChipActiveText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 14,
  },
  currencyChipText: {
    fontWeight: '600',
    fontSize: 14,
  },
  currencyActions: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  actionCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Key grid
  keyRow: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  keyButton: {
    flex: 1,
    height: 58,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    margin: 3,
  },
  keyPressed: {
    backgroundColor: 'rgba(51,105,246,0.12)',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '400',
  },
  keyTextSymbol: {
    fontSize: 26,
  },
  // Done button
  doneButton: {
    flex: 1,
    height: 58,
    backgroundColor: '#3369F6',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 3,
  },
  doneButtonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  doneButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
});
