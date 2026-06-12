import { Colors } from '@/constants/theme';
import { CATEGORIES } from '@/features/expenses/types';
import { useTheme } from '@/hooks/use-theme';
import { budgetRepository } from '@/services/budgetRepository';
import { Host, Slider } from '@expo/ui';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { Button } from './button';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

// Available colors for custom categories
const CUSTOM_COLORS = [
  { color: '#EF4444', bgLight: '#FEE2E2', bgDark: '#7F1D1D' }, // Red
  { color: '#F97316', bgLight: '#FFEDD5', bgDark: '#7C2D12' }, // Orange
  { color: '#EAB308', bgLight: '#FEF08A', bgDark: '#713F12' }, // Yellow
  { color: '#22C55E', bgLight: '#DCFCE7', bgDark: '#166534' }, // Green
  { color: '#14B8A6', bgLight: '#CCFBF1', bgDark: '#134E4A' }, // Teal
  { color: '#0EA5E9', bgLight: '#E0F2FE', bgDark: '#082F49' }, // Sky Blue
  { color: '#6366F1', bgLight: '#E0E7FF', bgDark: '#312E81' }, // Indigo
  { color: '#A855F7', bgLight: '#F3E8FF', bgDark: '#581C87' }, // Purple
  { color: '#EC4899', bgLight: '#FCE7F3', bgDark: '#831843' }, // Pink
  { color: '#8B5CF6', bgLight: '#F5F3FF', bgDark: '#4C1D95' }, // Violet
];

// Available icons for custom categories
const CUSTOM_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'heart-outline',
  'star-outline',
  'bookmark-outline',
  'flag-outline',
  'home-outline',
  'briefcase-outline',
  'gift-outline',
  'cube-outline',
  'diamond-outline',
  'leaf-outline',
  'pizza-outline',
  'game-controller-outline',
  'bulb-outline',
  'bicycle-outline',
  'watch-outline',
  'flower-outline',
];

interface BudgetSetupProps {
  onDone?: () => void | Promise<void>;
}

interface CustomCategoryForm {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgLight: string;
  bgDark: string;
}

export default function BudgetSetup({ onDone }: BudgetSetupProps) {
  const theme = useTheme();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  // Filter to only expense/income categories, exclude 'income' category, limit to main ones for initial setup
  const budgetCategories = CATEGORIES.filter(c => c.id !== 'income').slice(0, 7);

  const [totalBudget, setTotalBudget] = useState('3500');
  const totalNumber = Number(totalBudget) || 0;

  const [allocations, setAllocations] = useState(() => {
    // initial splits based on example percentages
    return budgetCategories.map((c, i) => {
      const percentages = [23, 13, 17, 34, 8, 3, 2];
      const perc = percentages[i] ?? Math.floor(100 / budgetCategories.length);
      return { ...c, percent: perc };
    });
  });

  // Custom category modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [customCategoryForm, setCustomCategoryForm] = useState<CustomCategoryForm>({
    label: '',
    icon: 'heart-outline',
    color: CUSTOM_COLORS[0].color,
    bgLight: CUSTOM_COLORS[0].bgLight,
    bgDark: CUSTOM_COLORS[0].bgDark,
  });
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);

  const allocatedSum = useMemo(() => allocations.reduce((s, a) => s + a.percent, 0), [allocations]);

  const amounts = useMemo(
    () => allocations.map((a) => ({ ...a, amount: Math.round((a.percent / 100) * totalNumber) })),
    [allocations, totalNumber]
  );

  const handleSliderChange = (index: number, newPercent: number) => {
    const clampedPercent = Math.max(0, Math.min(100, newPercent));
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], percent: clampedPercent };
    setAllocations(newAllocations);
  };

  const handleAutoSplit = () => {
    const equalPercent = Math.floor(100 / budgetCategories.length);
    const remainder = 100 % budgetCategories.length;
    const newAllocations = budgetCategories.map((c, i) => ({
      ...c,
      percent: equalPercent + (i < remainder ? 1 : 0),
    }));
    setAllocations(newAllocations);
  };

  const handleColorSelect = (index: number) => {
    setSelectedColorIndex(index);
    const selectedColor = CUSTOM_COLORS[index];
    setCustomCategoryForm({
      ...customCategoryForm,
      color: selectedColor.color,
      bgLight: selectedColor.bgLight,
      bgDark: selectedColor.bgDark,
    });
  };

  const handleIconSelect = (index: number) => {
    setSelectedIconIndex(index);
    setCustomCategoryForm({
      ...customCategoryForm,
      icon: CUSTOM_ICONS[index],
    });
  };

  const handleAddCustomCategory = () => {
    if (!customCategoryForm.label.trim()) {
      alert('Please enter a category name');
      return;
    }

    const customId = `custom_${Date.now()}`;
    const newCategory = {
      id: customId,
      label: customCategoryForm.label.trim(),
      icon: customCategoryForm.icon,
      color: customCategoryForm.color,
      bgLight: customCategoryForm.bgLight,
      bgDark: customCategoryForm.bgDark,
      percent: 0,
    };

    // Add the new category to allocations
    setAllocations([...allocations, newCategory]);

    // Reset form and close modal
    setCustomCategoryForm({
      label: '',
      icon: 'heart-outline',
      color: CUSTOM_COLORS[0].color,
      bgLight: CUSTOM_COLORS[0].bgLight,
      bgDark: CUSTOM_COLORS[0].bgDark,
    });
    setSelectedColorIndex(0);
    setSelectedIconIndex(0);
    setShowAddCategoryModal(false);
  };

  const totalAllocated = amounts.reduce((s, a) => s + (a.amount || 0), 0);
  const remaining = Math.max(0, totalNumber - totalAllocated);

  const onStart = async () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Save each allocation as a budget record (category-level)
    await Promise.all(
      amounts.map((a) => budgetRepository.save({ id: a.id, category: a.id, amount: Math.round((a.amount || 0) * 100), month }))
    );

    // Navigate to main tabs or call onDone if provided
    if (onDone) {
      await onDone();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <ThemedView style={styles.container} type="background">
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
          <ThemedText type="title" style={styles.headerTitle}>
            Spendro
          </ThemedText>
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
        </View>

        <ThemedText type="title" style={styles.title}>
          Set Your Monthly Budget
        </ThemedText>
        <ThemedText type="small" style={styles.subtitle}>
          Take control of your finances by setting a clear spending goal.
        </ThemedText>

        {/* Editable Budget Card */}
        <View style={[styles.card, { backgroundColor: theme.primary }]}>
          <ThemedText type="smallBold" style={styles.cardLabel}>
            TOTAL MONTHLY BUDGET
          </ThemedText>
          <View style={styles.budgetInputContainer}>
            <ThemedText type="subtitle" style={styles.currencySymbol}>
              $
            </ThemedText>
            <TextInput
              style={[styles.budgetInput, { color: '#fff' }]}
              value={totalBudget}
              onChangeText={setTotalBudget}
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="number-pad"
            />
          </View>
          <ThemedText type="small" style={styles.recommendedText}>
            ✨ Recommended for your income
          </ThemedText>
        </View>

        {/* Allocate by Category Header with AUTO-SPLIT */}
        <View style={styles.sectionHeader}>
          <ThemedText type="smallBold" style={styles.sectionTitle}>
            Allocate by Category
          </ThemedText>
          <Pressable style={styles.autoSplitButton} onPress={handleAutoSplit}>
            <ThemedText type="small" style={styles.autoSplitText}>
              AUTO-SPLIT
            </ThemedText>
          </Pressable>
        </View>

        {/* Category Cards */}
        {amounts.map((cat, index) => (
          <View key={cat.id} style={[styles.catCard, { borderColor: colors.backgroundElement }]}>
            <View style={styles.catHeader}>
              <View
                style={[
                  styles.catIcon,
                  { backgroundColor: scheme === 'dark' ? cat.bgDark : cat.bgLight },
                ]}
              >
                <Ionicons name={cat.icon} size={24} color={cat.color} />
              </View>
              <ThemedText type="default" style={styles.catTitle}>
                {cat.label}
              </ThemedText>
              <View style={{ flex: 1 }} />
              <ThemedText type="smallBold" style={styles.catAmount}>
                ${(cat.amount || 0).toLocaleString()}
              </ThemedText>
            </View>

            {/* Slider */}
            <Host  style={styles.sliderContainer}>
              <Slider
                value={cat.percent}
                onValueChange={(value) => handleSliderChange(index, value)}
                min={0}
                max={100}
                step={1}
              />
            </Host>

            <View style={styles.catFooter}>
              <ThemedText type="small">
                {cat.percent}% of budget
              </ThemedText>
              <ThemedText type="small">
                Avg. ${Math.round(cat.amount || 0).toLocaleString()}
              </ThemedText>
            </View>
          </View>
        ))}

        <TouchableOpacity
          onPress={() => setShowAddCategoryModal(true)}
          style={[styles.addCategoryButton, { borderColor: colors.backgroundElement }]}
        >
          <Ionicons name="add" size={24} color={colors.text} />
          <ThemedText type="default" style={styles.addButtonText}>
            Add Custom Category
          </ThemedText>
        </TouchableOpacity>

        {/* Remaining to Allocate */}
        <View style={[styles.remaining, { borderColor: '#DC2626' }]}>
          <ThemedText type="smallBold">
            Remaining to Allocate
          </ThemedText>
          <ThemedText type="default" style={[styles.remainingAmount, { color: theme.primary }]}>
            ${remaining.toLocaleString()}
          </ThemedText>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Start Tracking" onPress={onStart} />
      </View>

      {/* Add Custom Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <ThemedView style={styles.modalContainer} type="background">
          <ScrollView contentContainerStyle={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowAddCategoryModal(false)}>
                <ThemedText type="smallBold" style={styles.closeButton}>
                  ✕
                </ThemedText>
              </Pressable>
              <ThemedText type="title" style={styles.modalTitle}>
                Add Custom Category
              </ThemedText>
              <View style={{ width: 20 }} />
            </View>

            {/* Category Name Input */}
            <View style={styles.formGroup}>
              <ThemedText type="smallBold" style={styles.formLabel}>
                Category Name
              </ThemedText>
              <TextInput
                style={[
                  styles.formInput,
                  {
                    color: colors.text,
                    borderColor: colors.backgroundElement,
                    backgroundColor: colors.backgroundElement,
                  },
                ]}
                placeholder="e.g., Pet Care"
                placeholderTextColor={colors.textSecondary}
                value={customCategoryForm.label}
                onChangeText={(text) =>
                  setCustomCategoryForm({ ...customCategoryForm, label: text })
                }
              />
            </View>

            {/* Icon Selector */}
            <View style={styles.formGroup}>
              <ThemedText type="smallBold" style={styles.formLabel}>
                Choose Icon
              </ThemedText>
              <View style={styles.iconGrid}>
                {CUSTOM_ICONS.map((icon, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleIconSelect(index)}
                    style={[
                      styles.iconOption,
                      selectedIconIndex === index && {
                        backgroundColor: theme.primary,
                        borderColor: theme.primary,
                      },
                    ]}
                  >
                    <Ionicons
                      name={icon}
                      size={32}
                      color={selectedIconIndex === index ? '#fff' : colors.text}
                    />
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Color Selector */}
            <View style={styles.formGroup}>
              <ThemedText type="smallBold" style={styles.formLabel}>
                Choose Color
              </ThemedText>
              <View style={styles.colorGrid}>
                {CUSTOM_COLORS.map((colorOption, index) => (
                  <Pressable
                    key={index}
                    onPress={() => handleColorSelect(index)}
                    style={[
                      styles.colorOption,
                      {
                        backgroundColor: colorOption.color,
                        borderWidth: selectedColorIndex === index ? 3 : 2,
                        borderColor:
                          selectedColorIndex === index ? '#000' : 'transparent',
                      },
                    ]}
                  />
                ))}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.formGroup}>
              <ThemedText type="smallBold" style={styles.formLabel}>
                Preview
              </ThemedText>
              <View
                style={[
                  styles.previewCard,
                  { borderColor: colors.backgroundElement },
                ]}
              >
                <View
                  style={[
                    styles.previewIcon,
                    {
                      backgroundColor:
                        scheme === 'dark'
                          ? customCategoryForm.bgDark
                          : customCategoryForm.bgLight,
                    },
                  ]}
                >
                  <Ionicons
                    name={customCategoryForm.icon}
                    size={32}
                    color={customCategoryForm.color}
                  />
                </View>
                <ThemedText type="default" style={styles.previewLabel}>
                  {customCategoryForm.label || 'Unnamed Category'}
                </ThemedText>
              </View>
            </View>
          </ScrollView>

          {/* Modal Footer Buttons */}
          <View style={styles.modalFooter}>
            <Pressable
              onPress={() => setShowAddCategoryModal(false)}
              style={[styles.modalButton, styles.cancelButton]}
            >
              <ThemedText type="smallBold">Cancel</ThemedText>
            </Pressable>
            <Pressable
              onPress={handleAddCustomCategory}
              style={[styles.modalButton, styles.addButton]}
            >
              <ThemedText type="smallBold" style={styles.addButtonModalText}>
                Add Category
              </ThemedText>
            </Pressable>
          </View>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 140 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 8,
  },
  subtitle: {
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
  },
  cardLabel: {
    color: '#fff',
    opacity: 0.9,
    marginBottom: 12,
    fontSize: 12,
    letterSpacing: 0.5,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currencySymbol: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '700',
    marginRight: 8,
  },
  budgetInput: {
    fontSize: 40,
    fontWeight: '700',
    flex: 1,
  },
  recommendedText: {
    color: '#fff',
    opacity: 0.85,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    marginTop: 8,
    fontSize: 16,
  },
  autoSplitButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  autoSplitText: {
    color: '#2563EB',
    fontWeight: '600',
    fontSize: 12,
  },
  catCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  catIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catTitle: {
    fontSize: 16,
    flex: 1,
  },
  catAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  sliderContainer: {
    marginVertical: 12,
  },
  catFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  addCategoryButton: {
    marginTop: 8,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    marginLeft: 8,
  },
  remaining: {
    marginTop: 12,
    marginBottom: 12,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingAmount: {
    fontWeight: '700',
    fontSize: 18,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 24,
    paddingHorizontal: 20,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 200,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  closeButton: {
    fontSize: 28,
    fontWeight: '400',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    marginBottom: 12,
    fontSize: 16,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  iconOption: {
    width: '23%',
    aspectRatio: 1,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 12,
  },
  previewCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  previewLabel: {
    fontSize: 16,
    flex: 1,
  },
  modalFooter: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingBottom: 24,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: '#ccc',
  },
  addButton: {
    backgroundColor: '#2563EB',
  },
  addButtonModalText: {
    color: '#fff',
  },
});
