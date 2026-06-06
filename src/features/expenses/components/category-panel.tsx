import { Ionicons } from '@expo/vector-icons';
import React, { useCallback } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useColorScheme,
  View,
} from 'react-native';
import { Colors, Spacing } from '@/constants/theme';
import { CATEGORIES, Category } from '@/features/expenses/types';

interface CategoryPanelProps {
  selectedId: string;
  onSelect: (cat: Category) => void;
  onClose: () => void;
}

export function CategoryPanel({ selectedId, onSelect, onClose }: CategoryPanelProps) {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  const renderItem = useCallback(
    (cat: Category) => {
      const isSelected = cat.id === selectedId;
      const bgColor = isDark ? cat.bgDark : cat.bgLight;

      return (
        <View key={cat.id} style={styles.cellWrapper}>
          <Pressable
            style={({ pressed }) => [
              styles.cell,
              { backgroundColor: isDark ? colors.backgroundElement : '#F8F9FC' },
              isSelected && [
                styles.cellSelected,
                { borderColor: cat.color, backgroundColor: isDark ? cat.bgDark : cat.bgLight },
              ],
              pressed && styles.cellPressed,
            ]}
            onPress={() => onSelect(cat)}
            accessibilityRole="button"
            accessibilityLabel={cat.label}
          >
            <View style={[styles.iconWrap, { backgroundColor: bgColor }]}>
              <Ionicons name={cat.icon} size={22} color={cat.color} />
            </View>
            <Text
              style={[
                styles.cellLabel,
                { color: isSelected ? cat.color : colors.text },
                isSelected && styles.cellLabelSelected,
              ]}
              numberOfLines={2}
            >
              {cat.label}
            </Text>
            {isSelected && (
              <View style={[styles.checkBadge, { backgroundColor: cat.color }]}>
                <Ionicons name="checkmark" size={9} color="#fff" />
              </View>
            )}
          </Pressable>
        </View>
      );
    },
    [selectedId, isDark, colors, onSelect],
  );

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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Category</Text>
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

      {/* Grid — 3 columns via flexWrap */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.grid}
        keyboardShouldPersistTaps="handled"
      >
        {CATEGORIES.map(renderItem)}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderTopWidth: 1,
    paddingTop: 10,
    paddingBottom: Spacing.three,
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
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.two,
    paddingBottom: Spacing.two,
  },
  cellWrapper: {
    width: '33.33%',
    padding: 5,
  },
  cell: {
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
  },
  cellSelected: {
    borderWidth: 2,
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
    lineHeight: 14,
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
    alignItems: 'center',
    justifyContent: 'center',
  },
});
