import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  FlatList,
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
import { CATEGORIES, Category } from '@/features/expenses/types';

interface CategoryPickerProps {
  visible: boolean;
  selectedId: string;
  onSelect: (category: Category) => void;
  onClose: () => void;
}

export function CategoryPicker({
  visible,
  selectedId,
  onSelect,
  onClose,
}: CategoryPickerProps) {
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
          <ThemedText style={styles.sheetTitle}>Select Category</ThemedText>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [styles.closeBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Close category picker"
          >
            <Ionicons name="close" size={22} color={colors.text} />
          </Pressable>
        </View>

        <FlatList
          data={CATEGORIES}
          keyExtractor={(item) => item.id}
          numColumns={3}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isSelected = item.id === selectedId;
            const bgColor = scheme === 'dark' ? item.bgDark : item.bgLight;
            return (
              <Pressable
                style={({ pressed }) => [
                  styles.categoryCell,
                  isSelected && [styles.categoryCellSelected, { borderColor: item.color }],
                  pressed && { opacity: 0.75 },
                ]}
                onPress={() => onSelect(item)}
                accessibilityRole="button"
                accessibilityLabel={item.label}
              >
                <View style={[styles.categoryIconWrap, { backgroundColor: bgColor }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <Text
                  style={[
                    styles.categoryLabel,
                    { color: isSelected ? item.color : colors.text },
                  ]}
                  numberOfLines={2}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
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
    maxHeight: '75%',
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
    marginBottom: Spacing.three,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  grid: {
    paddingHorizontal: Spacing.three,
    paddingBottom: Spacing.four,
  },
  categoryCell: {
    flex: 1,
    alignItems: 'center',
    margin: 6,
    padding: Spacing.two,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryCellSelected: {
    borderWidth: 2,
  },
  categoryIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  categoryLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
});
