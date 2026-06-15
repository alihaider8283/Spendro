import { Colors } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useBudgets } from '@/hooks/useBudgets';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  View,
  Platform,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import Slider from '@react-native-community/slider';
import { getCurrencySymbol, getCategoryByNameOrId } from '@/features/expenses/types';
import { useSettingsStore } from '@/store/settingsStore';
import { budgetRepository } from '@/services/budgetRepository';
// Available colors for custom categories matching image 2
const CUSTOM_COLORS = [
  { color: '#0B66E4', bgLight: '#E6F0FF', bgDark: '#1E293B' }, // Dark Blue
  { color: '#A14F0D', bgLight: '#FFEDD5', bgDark: '#451A03' }, // Brown/Rust
  { color: '#475569', bgLight: '#F1F5F9', bgDark: '#1E293B' }, // Slate/Grey
  { color: '#0EA5E9', bgLight: '#E0F2FE', bgDark: '#075985' }, // Sky Blue
  { color: '#EA580C', bgLight: '#FFEDD5', bgDark: '#7C2D12' }, // Orange
  { color: '#94A3B8', bgLight: '#F1F5F9', bgDark: '#334155' }, // Light Grey/Blue
];

const CUSTOM_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  // Health & Sports
  'barbell-outline',
  'heart-outline',
  'medkit-outline',
  // Food & Dining
  'restaurant-outline',
  'cafe-outline',
  'pizza-outline',
  // Finance & Work
  'card-outline',
  'cash-outline',
  'wallet-outline',
  'briefcase-outline',
  // Auto & Travel
  'car-outline',
  'airplane-outline',
  'bicycle-outline',
  'gas-station-outline',
  // Entertainment & Fun
  'film-outline',
  'game-controller-outline',
  'musical-notes-outline',
  'gift-outline',
  // Shopping & Personal
  'bag-outline',
  'shirt-outline',
  'school-outline',
  // Utilities & Home
  'home-outline',
  'bulb-outline',
  'water-outline',
  'construct-outline',
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

interface BudgetAllocation {
  id: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgLight: string;
  bgDark: string;
  percent: number;
  avg: number;
}

// Initial 4 default categories — all start at 0%, user allocates manually
const DEFAULT_BUDGET_CATEGORIES: BudgetAllocation[] = [
  {
    id: 'dining',
    label: 'Food & Dining',
    icon: 'restaurant-outline',
    color: '#0B66E4',
    bgLight: '#E6F0FF',
    bgDark: '#1E293B',
    percent: 0,
    avg: 750,
  },
  {
    id: 'transport',
    label: 'Transport',
    icon: 'car-outline',
    color: '#10B981',
    bgLight: '#E6F9F0',
    bgDark: '#064E3B',
    percent: 0,
    avg: 400,
  },
  {
    id: 'shopping',
    label: 'Shopping',
    icon: 'bag-outline',
    color: '#EF4444',
    bgLight: '#FEE2E2',
    bgDark: '#7F1D1D',
    percent: 0,
    avg: 550,
  },
  {
    id: 'housing',
    label: 'Housing',
    icon: 'home-outline',
    color: '#F59E0B',
    bgLight: '#FEF3C7',
    bgDark: '#78350F',
    percent: 0,
    avg: 1200,
  },
];

export default function BudgetSetup({ onDone }: BudgetSetupProps) {
  const theme = useTheme();
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const currency = useSettingsStore((s) => s.currency);
  const symbol = getCurrencySymbol(currency);

  const [totalBudget, setTotalBudget] = useState('');
  const totalNumber = Number(totalBudget) || 0;

  const { data: existingBudgets, isLoading } = useBudgets();
  const [allocations, setAllocations] = useState<BudgetAllocation[]>([]);
  const [deletedBudgetIds, setDeletedBudgetIds] = useState<string[]>([]);
  
  useEffect(() => {
    if (!existingBudgets || isLoading) return;
    
    if (existingBudgets.length > 0) {
      // Calculate total amount from existing budgets
      const sum = existingBudgets.reduce((acc, b) => acc + b.amount, 0);
      setTotalBudget((sum / 100).toString()); // amount is in cents locally? No, wait. In budgetRepository it's saved as `Math.round((a.amount || 0) * 100)`. So it's in cents in DB. Let me check budget-setup.tsx saving logic. Yes, `amount: Math.round((a.amount || 0) * 100)`.
      
      const loadedAllocations = existingBudgets.map(b => {
        const catInfo = DEFAULT_BUDGET_CATEGORIES.find(c => c.id === b.category) || {
          id: b.category,
          label: b.category,
          icon: 'list',
          color: '#0B66E4',
          bgLight: '#E6F0FF',
          bgDark: '#1E293B',
          avg: 0
        };
        const amountInDollars = b.amount / 100;
        return {
          ...catInfo,
          id: b.id, // Keep the actual budget DB ID for updating/deleting
          percent: sum > 0 ? (b.amount / sum) * 100 : 0
        } as BudgetAllocation;
      });
      setAllocations(loadedAllocations);
    } else {
      setAllocations(DEFAULT_BUDGET_CATEGORIES);
    }
  }, [existingBudgets, isLoading]);

  // Custom category modal state
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [customCategoryForm, setCustomCategoryForm] = useState<CustomCategoryForm>({
    label: '',
    icon: CUSTOM_ICONS[0],
    color: CUSTOM_COLORS[0].color,
    bgLight: CUSTOM_COLORS[0].bgLight,
    bgDark: CUSTOM_COLORS[0].bgDark,
  });
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [selectedIconIndex, setSelectedIconIndex] = useState(0);

  const amounts = useMemo(
    () =>
      allocations.map((a) => ({
        ...a,
        amount: Math.round((a.percent / 100) * totalNumber),
      })),
    [allocations, totalNumber]
  );

  const handleSliderChange = (index: number, newPercent: number) => {
    const newAllocations = [...allocations];
    newAllocations[index] = { ...newAllocations[index], percent: Math.max(0, newPercent) };
    setAllocations(newAllocations);
  };

  const handleDeleteCategory = (index: number) => {
    const catToRemove = allocations[index];
    if (catToRemove.id && !catToRemove.id.startsWith('custom_') && !DEFAULT_BUDGET_CATEGORIES.some(c => c.id === catToRemove.id)) {
        // Only push to deleted array if it's an existing budget from DB (not default, not unsaved custom)
        setDeletedBudgetIds(prev => [...prev, catToRemove.id]);
    } else if (existingBudgets?.some(b => b.id === catToRemove.id)) {
        setDeletedBudgetIds(prev => [...prev, catToRemove.id]);
    }

    const newAllocations = [...allocations];
    newAllocations.splice(index, 1);
    setAllocations(newAllocations);
  };

  const handleAutoSplit = () => {
    const count = allocations.length;
    if (count === 0) return;

    if (!totalNumber || totalNumber <= 0) {
      alert('Please enter your total monthly budget first.');
      return;
    }

    // Split the total budget amount equally — each gets 1/count of 100%
    const equalPercent = Math.floor(100 / count);
    const remainder = 100 % count;
    const newAllocations = allocations.map((c, i) => ({
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
    const label = customCategoryForm.label.trim();
    if (!label) {
      alert('Please enter a category name');
      return;
    }

    const customId = `custom_${Date.now()}`;
    const newCategory: BudgetAllocation = {
      id: customId,
      label: label,
      icon: customCategoryForm.icon,
      color: customCategoryForm.color,
      bgLight: customCategoryForm.bgLight,
      bgDark: customCategoryForm.bgDark,
      percent: 0,
      avg: 0,
    };

    // Add the new category to allocations
    setAllocations([...allocations, newCategory]);

    // Reset form and close modal
    setCustomCategoryForm({
      label: '',
      icon: CUSTOM_ICONS[0],
      color: CUSTOM_COLORS[0].color,
      bgLight: CUSTOM_COLORS[0].bgLight,
      bgDark: CUSTOM_COLORS[0].bgDark,
    });
    setSelectedColorIndex(0);
    setSelectedIconIndex(0);
    setShowAddCategoryModal(false);
  };

  const totalAllocated = amounts.reduce((s, a) => s + (a.amount || 0), 0);
  const remaining = totalNumber - totalAllocated;

  const onStart = async () => {
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    // Delete removed budgets
    await Promise.all(
      deletedBudgetIds.map(id => budgetRepository.delete(id))
    );

    // Save each allocation as a budget record (category-level)
    await Promise.all(
      amounts.map((a) => {
        const isExistingDbId = existingBudgets?.some(b => b.id === a.id);
        return budgetRepository.save({
          id: isExistingDbId ? a.id : undefined,
          category: isExistingDbId ? existingBudgets!.find(b => b.id === a.id)!.category : a.id,
          amount: Math.round((a.amount || 0) * 100),
          month,
        });
      })
    );

    // Navigate to main tabs or call onDone if provided
    if (onDone) {
      await onDone();
    } else {
      router.replace('/(tabs)');
    }
  };

  // Remaining budget banner style configuration
  const remainingStyles = useMemo(() => {
    const isDark = scheme === 'dark';
    if (remaining > 0) {
      return {
        bg: isDark ? '#2D220B' : '#FFF5F5',
        border: isDark ? '#543E12' : '#FCA5A5',
        text: isDark ? '#FBBF24' : '#B91C1C',
        dot: isDark ? '#F59E0B' : '#DC2626',
      };
    } else if (remaining === 0) {
      return {
        bg: isDark ? '#14221A' : '#F0FDF4',
        border: isDark ? '#1E3E2A' : '#BBF7D0',
        text: isDark ? '#4ADE80' : '#15803D',
        dot: isDark ? '#22C55E' : '#16A34A',
      };
    } else {
      return {
        bg: isDark ? '#271C1C' : '#FEF2F2',
        border: isDark ? '#4C1F1F' : '#FCA5A5',
        text: isDark ? '#F87171' : '#B91C1C',
        dot: isDark ? '#EF4444' : '#DC2626',
      };
    }
  }, [remaining, scheme]);

  const pageBgColor = scheme === 'dark' ? '#121212' : '#F8F9FA';
  const cardBgColor = scheme === 'dark' ? '#1E1E1E' : '#FFFFFF';
  const borderCardColor = scheme === 'dark' ? '#2D2D2D' : '#E2E8F0';

  return (
    <ThemedView style={[styles.container, { backgroundColor: pageBgColor }]} type="background">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} activeOpacity={0.7}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={[styles.headerTitle, { color: '#0B66E4' }]}>
            Spendro
          </ThemedText>
          <Ionicons name="help-circle-outline" size={24} color={colors.text} />
        </View>

        <ThemedText type="title" style={[styles.title, { color: colors.text }]}>
          Set Your Monthly Budget
        </ThemedText>
        <ThemedText type="small" style={[styles.subtitle, { color: colors.textSecondary }]}>
          Take control of your finances by setting a clear spending goal.
        </ThemedText>

        {/* Editable Budget Card */}
        <View style={[styles.card, { backgroundColor: '#0B66E4' }]}>
          {/* Decorative shapes resembling overlapping finance cards */}
          <View style={styles.cardDecorativeContainer}>
            <View style={styles.cardDecorativeShape1} />
            <View style={styles.cardDecorativeShape2} />
          </View>

          <ThemedText type="smallBold" style={styles.cardLabel}>
            TOTAL MONTHLY BUDGET
          </ThemedText>
          <View style={styles.budgetInputContainer}>
            <ThemedText style={styles.currencySymbol}>{symbol} </ThemedText>
            <TextInput
              style={styles.budgetInput}
              value={totalBudget ? Number(totalBudget).toLocaleString() : ''}
              onChangeText={(text) => {
                // Strip everything except digits before storing
                const raw = text.replace(/[^0-9]/g, '');
                setTotalBudget(raw);
              }}
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.5)"
              keyboardType="number-pad"
            />
          </View>
          <View style={styles.recommendedPill}>
            <Ionicons name="sparkles" size={14} color="#ffffff" style={{ marginRight: 6 }} />
            <ThemedText type="smallBold" style={styles.recommendedText}>
              Recommended for your income
            </ThemedText>
          </View>
        </View>

        {/* Remaining to Allocate — shown above categories */}
        <View
          style={[
            styles.remaining,
            {
              backgroundColor: remainingStyles.bg,
              borderColor: remainingStyles.border,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View style={[styles.remainingDot, { backgroundColor: remainingStyles.dot }]} />
            <ThemedText type="smallBold" style={{ color: remainingStyles.text }}>
              Remaining to Allocate
            </ThemedText>
          </View>
          <ThemedText style={[styles.remainingAmount, { color: remainingStyles.text }]}>
            {symbol} {remaining.toLocaleString()}
          </ThemedText>
        </View>

        {/* Allocate by Category Header */}
        <View style={styles.sectionHeader}>
          <ThemedText type="smallBold" style={[styles.sectionTitle, { color: colors.text }]}>
            Allocate by Category
          </ThemedText>
          <TouchableOpacity style={styles.autoSplitButton} onPress={handleAutoSplit} activeOpacity={0.7}>
            <ThemedText type="smallBold" style={styles.autoSplitText}>
              AUTO-SPLIT
            </ThemedText>
          </TouchableOpacity>
        </View>

        {/* Category Cards */}
        {amounts.map((cat, index) => (
          <View
            key={cat.id}
            style={[styles.catCard, { backgroundColor: cardBgColor, borderColor: borderCardColor }]}
          >
            <View style={styles.catHeader}>
              <View
                style={[
                  styles.catIcon,
                  { backgroundColor: scheme === 'dark' ? cat.bgDark : cat.bgLight },
                ]}
              >
                <Ionicons name={cat.icon} size={24} color={cat.color} style={{ textAlign: 'center' }} />
              </View>
              <ThemedText style={[styles.catTitle, { color: colors.text }]}>
                {cat.label}
              </ThemedText>
              <ThemedText style={[styles.catAmount, { color: colors.text }]}>
                {symbol} {(cat.amount || 0).toLocaleString()}
              </ThemedText>
              <TouchableOpacity onPress={() => handleDeleteCategory(index)} style={{ marginLeft: 8 }} activeOpacity={0.7}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>

            {/* Slider */}
            <View style={styles.sliderWrapper}>
              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={cat.percent}
                onValueChange={(value) => handleSliderChange(index, value)}
                minimumTrackTintColor="#E2E8F0"
                maximumTrackTintColor="#E2E8F0"
                thumbTintColor="#0B66E4"
              />
            </View>

            <View style={styles.catFooter}>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                {Math.round(cat.percent)}% of budget
              </ThemedText>
              <ThemedText type="small" style={{ color: colors.textSecondary }}>
                Avg. ${cat.avg.toLocaleString()}
              </ThemedText>
            </View>
          </View>
        ))}

        {/* Add Custom Category Button */}
        <TouchableOpacity
          onPress={() => setShowAddCategoryModal(true)}
          style={[
            styles.addCategoryButton,
            {
              borderColor: scheme === 'dark' ? '#3F3F46' : '#CBD5E1',
              backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
            },
          ]}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={colors.textSecondary} />
          <ThemedText style={[styles.addButtonText, { color: colors.textSecondary }]}>
            Add Custom Category
          </ThemedText>
        </TouchableOpacity>



        {/* Action Button at the bottom of list */}
        <TouchableOpacity
          style={[styles.startButton, { backgroundColor: '#0B66E4' }]}
          onPress={onStart}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.startButtonText}>Start Tracking</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      {/* Add Custom Category Modal */}
      <Modal
        visible={showAddCategoryModal}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowAddCategoryModal(false)}
      >
        <ThemedView style={[styles.modalContainer, { backgroundColor: pageBgColor }]} type="background">
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: borderCardColor }]}>
            <TouchableOpacity onPress={() => setShowAddCategoryModal(false)} style={styles.modalBackButton} activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color="#0B66E4" />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>
              Add Category
            </ThemedText>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Category Name Input */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>CATEGORY DETAILS</ThemedText>
              <View
                style={[
                  styles.formInputContainer,
                  {
                    borderColor: scheme === 'dark' ? '#3F3F46' : '#CBD5E1',
                    backgroundColor: scheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
                  },
                ]}
              >
                <TextInput
                  style={[styles.formInput, { color: colors.text }]}
                  placeholder="e.g., Gym, Gifts"
                  placeholderTextColor={scheme === 'dark' ? '#64748B' : '#94A3B8'}
                  value={customCategoryForm.label}
                  onChangeText={(text) =>
                    setCustomCategoryForm({ ...customCategoryForm, label: text })
                  }
                />
                <Ionicons
                  name="pencil"
                  size={20}
                  color={scheme === 'dark' ? '#64748B' : '#94A3B8'}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>

            {/* Icon Selector */}
            <View style={styles.formGroup}>
              <View style={styles.formSectionHeader}>
                <ThemedText style={styles.formLabel}>SELECT ICON</ThemedText>
                <TouchableOpacity activeOpacity={0.7}>
                  <ThemedText style={styles.viewAllText}>View All</ThemedText>
                </TouchableOpacity>
              </View>
              <View style={styles.iconGrid}>
                {CUSTOM_ICONS.map((icon, index) => {
                  const isSelected = selectedIconIndex === index;
                  return (
                    <TouchableOpacity
                      key={icon}
                      onPress={() => handleIconSelect(index)}
                      style={[
                        styles.iconOption,
                        {
                          backgroundColor: isSelected
                            ? '#0B66E4'
                            : scheme === 'dark'
                            ? '#27272A'
                            : '#F1F5F9',
                        },
                      ]}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={icon}
                        size={24}
                        color={isSelected ? '#FFFFFF' : scheme === 'dark' ? '#A1A1AA' : '#475569'}
                        style={{ textAlign: 'center' }}
                      />
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Color Selector */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>CATEGORY COLOR</ThemedText>
              <View style={styles.colorRow}>
                {CUSTOM_COLORS.map((colorOption, index) => {
                  const isSelected = selectedColorIndex === index;
                  return (
                    <View
                      key={index}
                      style={[
                        styles.colorCircleOuter,
                        isSelected && { borderColor: colorOption.color },
                      ]}
                    >
                      <TouchableOpacity
                        onPress={() => handleColorSelect(index)}
                        style={[styles.colorCircleInner, { backgroundColor: colorOption.color }]}
                        activeOpacity={0.8}
                      />
                    </View>
                  );
                })}
              </View>
            </View>

            {/* Preview */}
            <View style={styles.formGroup}>
              <ThemedText style={styles.formLabel}>PREVIEW</ThemedText>
              <ThemedView
                style={[
                  styles.previewCard,
                  {
                    borderColor: borderCardColor,
                    backgroundColor: cardBgColor,
                  },
                ]}
              >
                <View style={[styles.previewIconCircle, { backgroundColor: customCategoryForm.color }]}>
                  <Ionicons name={customCategoryForm.icon} size={24} color="#FFFFFF" style={{ textAlign: 'center' }} />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <ThemedText style={[styles.previewTitle, { color: colors.text }]}>
                    {customCategoryForm.label.trim() || 'Gifts'}
                  </ThemedText>
                  <ThemedText style={styles.previewSubtitle}>0 Transactions</ThemedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <ThemedText style={styles.previewBudgetLabel}>Budget</ThemedText>
                  <ThemedText style={[styles.previewBudgetValue, { color: colors.text }]}>{symbol} 0.00</ThemedText>
                </View>
              </ThemedView>
            </View>

            {/* Create Category Button */}
            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: '#0B66E4' }]}
              onPress={handleAddCustomCategory}
              activeOpacity={0.8}
            >
              <ThemedText style={styles.createButtonText}>Create Category</ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 20, paddingBottom: 60 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: Platform.OS === 'ios' ? 0 : 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 24,
    lineHeight: 20,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 28,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  cardLabel: {
    color: '#ffffff',
    opacity: 0.9,
    marginBottom: 8,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  budgetInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  currencySymbol: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '700',
    marginRight: 6,
  },
  budgetInput: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
    flex: 1,
    padding: 0,
  },
  recommendedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recommendedText: {
    color: '#ffffff',
    fontSize: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  autoSplitButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#E6F0FF',
  },
  autoSplitText: {
    color: '#0B66E4',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  catCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  catHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  catTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  catAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  sliderWrapper: {
    marginVertical: 10,
    height: 36,
    justifyContent: 'center',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  catFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  addCategoryButton: {
    marginTop: 6,
    marginBottom: 16,
    paddingVertical: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
  },
  remaining: {
    marginTop: 0,
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  remainingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  remainingAmount: {
    fontWeight: '700',
    fontSize: 18,
  },
  startButton: {
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0B66E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: Platform.OS === 'ios' ? 24 : 16,
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  // Budget card decorative shapes
  cardDecorativeContainer: {
    position: 'absolute',
    right: -25,
    top: -25,
    width: 140,
    height: 140,
    opacity: 0.12,
  },
  cardDecorativeShape1: {
    position: 'absolute',
    right: 15,
    top: 25,
    width: 90,
    height: 110,
    borderRadius: 12,
    borderWidth: 5,
    borderColor: '#ffffff',
    transform: [{ rotate: '15deg' }],
  },
  cardDecorativeShape2: {
    position: 'absolute',
    right: -10,
    top: 35,
    width: 90,
    height: 110,
    borderRadius: 12,
    borderWidth: 5,
    borderColor: '#ffffff',
    transform: [{ rotate: '30deg' }],
  },
  // Modal styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    marginTop: Platform.OS === 'ios' ? 44 : 12,
  },
  modalBackButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0B66E4',
    marginLeft: 12,
  },
  modalContent: {
    padding: 20,
    paddingBottom: 60,
  },
  formGroup: {
    marginBottom: 24,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  formSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  viewAllText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0B66E4',
  },
  formInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  formInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    fontWeight: '500',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'space-between',
  },
  iconOption: {
    width: '18%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  colorCircleOuter: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorCircleInner: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  previewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
  },
  previewIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewSubtitle: {
    fontSize: 14,
    color: '#64748B',
    marginTop: 2,
  },
  previewBudgetLabel: {
    fontSize: 12,
    color: '#64748B',
  },
  previewBudgetValue: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 2,
  },
  createButton: {
    height: 54,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#0B66E4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 40,
  },
  createButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
});
