import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { PAYMENT_METHODS, PaymentMethod } from '@/features/expenses/types';

interface PaymentMethodPickerProps {
  visible: boolean;
  selectedId: string;
  onSelect: (method: PaymentMethod) => void;
  onClose: () => void;
}

export function PaymentMethodPicker({
  visible,
  selectedId,
  onSelect,
  onClose,
}: PaymentMethodPickerProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={[styles.sheet, { backgroundColor: colors.background }]}>
        {/* Handle */}
        <View style={[styles.handle, { backgroundColor: colors.backgroundElement }]} />

        {/* Header */}
        <View style={styles.sheetHeader}>
          <ThemedText style={styles.sheetTitle}>Payment Method</ThemedText>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Close payment method picker"
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        {PAYMENT_METHODS.map((method, idx) => {
          const isSelected = method.id === selectedId;
          return (
            <Pressable
              key={method.id}
              style={({ pressed }) => [
                styles.methodRow,
                idx < PAYMENT_METHODS.length - 1 && [
                  styles.methodRowDivider,
                  { borderBottomColor: colors.backgroundElement },
                ],
                isSelected && { backgroundColor: colors.backgroundElement },
                pressed && { opacity: 0.7 },
              ]}
              onPress={() => onSelect(method)}
              accessibilityRole="button"
              accessibilityLabel={method.label}
            >
              <View style={[styles.methodIconWrap, { backgroundColor: isSelected ? colors.primary : colors.backgroundElement }]}>
                <Ionicons
                  name={method.icon}
                  size={20}
                  color={isSelected ? '#ffffff' : colors.text}
                />
              </View>
              <Text style={[styles.methodLabel, { color: colors.text }]}>{method.label}</Text>
              {isSelected && (
                <Ionicons name="checkmark-circle" size={22} color={colors.primary} />
              )}
            </Pressable>
          );
        })}
        <SafeAreaView edges={['bottom']} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 12,
    paddingBottom: Spacing.two,
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    marginBottom: Spacing.two,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: 14,
  },
  methodRowDivider: {
    borderBottomWidth: 1,
  },
  methodIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  methodLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
  },
});
