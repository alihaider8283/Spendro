import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { PAYMENT_METHODS, PaymentMethod } from '@/features/expenses/types';

interface PaymentMethodPanelProps {
  selectedId: string;
  onSelect: (method: PaymentMethod) => void;
  onClose: () => void;
}

export function PaymentMethodPanel({ selectedId, onSelect, onClose }: PaymentMethodPanelProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          borderTopColor: isDark ? '#2E3135' : '#E4E6EF',
        },
      ]}
    >
      {/* Handle bar */}
      <View style={[styles.handle, { backgroundColor: isDark ? '#3E4147' : '#D8DAE5' }]} />

      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Payment Method</Text>
        <Pressable
          onPress={onClose}
          style={({ pressed }) => [
            styles.headerClose,
            { backgroundColor: colors.backgroundElement },
            pressed && { opacity: 0.6 },
          ]}
          accessibilityRole="button"
          accessibilityLabel="Close panel"
        >
          <Ionicons name="close" size={18} color={colors.text} />
        </Pressable>
      </View>

      {/* Payment method rows — 2 per row */}
      <View style={styles.grid}>
        {PAYMENT_METHODS.map((method) => {
          const isSelected = method.id === selectedId;
          return (
            <View key={method.id} style={styles.cellWrapper}>
              <Pressable
                style={({ pressed }) => [
                  styles.cell,
                  {
                    backgroundColor: isDark ? colors.backgroundElement : '#F8F9FC',
                    borderColor: isSelected ? '#3369F6' : 'transparent',
                  },
                  pressed && styles.cellPressed,
                ]}
                onPress={() => onSelect(method)}
                accessibilityRole="button"
                accessibilityLabel={method.label}
              >
                {/* Icon circle */}
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: isSelected ? '#3369F6' : isDark ? colors.background : '#E8F0FE' },
                  ]}
                >
                  <Ionicons
                    name={method.icon}
                    size={20}
                    color={isSelected ? '#ffffff' : '#3369F6'}
                  />
                </View>

                {/* Label */}
                <Text
                  style={[
                    styles.cellLabel,
                    { color: isSelected ? '#3369F6' : colors.text },
                    isSelected && styles.cellLabelSelected,
                  ]}
                  numberOfLines={1}
                >
                  {method.label}
                </Text>

                {/* Checkmark badge */}
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Ionicons name="checkmark" size={9} color="#fff" />
                  </View>
                )}
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: Spacing.four,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  headerClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // 3-column grid using flexWrap
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.two,
  },
  cellWrapper: {
    width: '33.33%',
    padding: 5,
  },
  cell: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 16,
    borderWidth: 2,
    position: 'relative',
  },
  cellPressed: {
    opacity: 0.72,
    transform: [{ scale: 0.96 }],
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  cellLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  cellLabelSelected: {
    fontWeight: '700',
  },
  checkBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#3369F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
