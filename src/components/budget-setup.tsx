import { Ionicons } from '@expo/vector-icons';
import { getCategoryByNameOrId, getCurrencySymbol } from '@/features/expenses/types';
import { useBudgets } from '@/hooks/useBudgets';
import { budgetRepository } from '@/services/budgetRepository';
import { useSettingsStore } from '@/store/settingsStore';
import { useTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useColorScheme,
} from 'react-native';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface BudgetSetupProps {
  onDone?: () => void | Promise<void>;
  onBack?: () => void;
}

interface BudgetRow {
  id: string;       // category id (e.g. 'dining')
  dbId?: string;    // budget record id in DB (if loaded from existing)
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgLight: string;
  bgDark: string;
  amount: string;   // text input value
}

const CUSTOM_COLORS = [
  { color: '#3369F6', bgLight: '#EEF3FF', bgDark: '#1E293B' },
  { color: '#7C3AED', bgLight: '#F3EEFF', bgDark: '#2D1B4E' },
  { color: '#059669', bgLight: '#ECFDF5', bgDark: '#1B3A24' },
  { color: '#E37400', bgLight: '#FEF3E2', bgDark: '#3E2A00' },
  { color: '#D93025', bgLight: '#FCE8E6', bgDark: '#3C1E1E' },
  { color: '#5F6368', bgLight: '#F1F3F4', bgDark: '#303134' },
];

const CUSTOM_ICONS: (keyof typeof Ionicons.glyphMap)[] = [
  'barbell-outline', 'heart-outline', 'medkit-outline',
  'restaurant-outline', 'cafe-outline', 'pizza-outline',
  'card-outline', 'cash-outline', 'wallet-outline', 'briefcase-outline',
  'car-outline', 'airplane-outline', 'bicycle-outline',
  'film-outline', 'game-controller-outline', 'musical-notes-outline', 'gift-outline',
  'bag-outline', 'shirt-outline', 'school-outline',
  'home-outline', 'bulb-outline', 'water-outline', 'construct-outline',
];

const DEFAULT_ROWS: BudgetRow[] = [
  { id: 'dining',    label: 'Food & Dining',  icon: 'restaurant-outline', color: '#D56B2D', bgLight: '#FDF2E9', bgDark: '#3E2516', amount: '' },
  { id: 'transport', label: 'Transport',      icon: 'car-outline',        color: '#5F6368', bgLight: '#F1F3F4', bgDark: '#303134', amount: '' },
  { id: 'shopping',  label: 'Shopping',       icon: 'cart-outline',       color: '#E37400', bgLight: '#FEF3E2', bgDark: '#3E2A00', amount: '' },
  { id: 'health',    label: 'Health',         icon: 'barbell-outline',    color: '#8430D9', bgLight: '#F3E8FD', bgDark: '#2D1B4E', amount: '' },
];

export default function BudgetSetup({ onDone, onBack }: BudgetSetupProps) {
  const theme = useTheme();
  const router = useRouter();
  const scheme = useColorScheme();
  const currency = useSettingsStore(s => s.currency);
  const symbol = getCurrencySymbol(currency);

  const [rows, setRows] = useState<BudgetRow[]>(DEFAULT_ROWS);
  const [deletedDbIds, setDeletedDbIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [customLabel, setCustomLabel] = useState('');
  const [customColorIdx, setCustomColorIdx] = useState(0);
  const [customIconIdx, setCustomIconIdx] = useState(0);

  const { data: existingBudgets, isLoading } = useBudgets();

  // Load existing budgets if available
  useEffect(() => {
    if (isLoading || !existingBudgets) return;
    if (existingBudgets.length === 0) {
      setRows(DEFAULT_ROWS);
      return;
    }
    const loaded: BudgetRow[] = existingBudgets.map(b => {
      const cat = getCategoryByNameOrId(b.category);
      return {
        id: b.category,
        dbId: b.id,
        label: cat.label,
        icon: cat.icon,
        color: cat.color,
        bgLight: cat.bgLight,
        bgDark: cat.bgDark,
        amount: b.amount > 0 ? String(b.amount) : '',
      };
    });
    setRows(loaded);
  }, [existingBudgets, isLoading]);

  const total = useMemo(
    () => rows.reduce((s, r) => s + (parseFloat(r.amount) || 0), 0),
    [rows]
  );

  const updateAmount = (idx: number, val: string) => {
    const raw = val.replace(/[^0-9.]/g, '');
    setRows(prev => prev.map((r, i) => i === idx ? { ...r, amount: raw } : r));
  };

  const removeRow = (idx: number) => {
    const row = rows[idx];
    if (row.dbId) setDeletedDbIds(prev => [...prev, row.dbId!]);
    setRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleAddCustom = () => {
    const label = customLabel.trim();
    if (!label) return;
    const col = CUSTOM_COLORS[customColorIdx];
    const newRow: BudgetRow = {
      id: `custom_${Date.now()}`,
      label,
      icon: CUSTOM_ICONS[customIconIdx],
      color: col.color,
      bgLight: col.bgLight,
      bgDark: col.bgDark,
      amount: '',
    };
    setRows(prev => [...prev, newRow]);
    setCustomLabel('');
    setCustomColorIdx(0);
    setCustomIconIdx(0);
    setShowModal(false);
  };

  const onStart = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const now = new Date();
      const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

      await Promise.all(deletedDbIds.map(id => budgetRepository.delete(id)));

      await Promise.all(
        rows
          .filter(r => (parseFloat(r.amount) || 0) > 0)
          .map(r =>
            budgetRepository.save({
              id: r.dbId,
              category: r.id,
              amount: parseFloat(r.amount),
              month,
            })
          )
      );

      if (onDone) await onDone();
      else router.replace('/(tabs)');
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  const isDark = scheme === 'dark';

  return (
    <ThemedView style={styles.screen}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable
            onPress={handleBack}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
          >
            <Ionicons name="arrow-back" size={22} color={theme.text} />
          </Pressable>
          <View style={styles.flex1} />
          {/* Step indicator */}
          <View style={styles.stepRow}>
            <View style={[styles.stepDot, { backgroundColor: theme.backgroundElement }]} />
            <View style={[styles.stepDot, { backgroundColor: '#3369F6', width: 24 }]} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Title */}
          <View style={styles.titleBlock}>
            <ThemedText style={styles.title}>Set your budget</ThemedText>
            <ThemedText style={[styles.subtitle, { color: theme.textSecondary }]}>
              Enter how much you'd like to spend per category each month.
            </ThemedText>
          </View>

          {/* Total card */}
          <View style={[styles.totalCard, { backgroundColor: '#3369F6' }]}>
            <View style={styles.totalDecor1} />
            <View style={styles.totalDecor2} />
            <ThemedText style={styles.totalLabel}>TOTAL MONTHLY BUDGET</ThemedText>
            <ThemedText style={styles.totalAmount}>
              {symbol}{total > 0 ? total.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : '0'}
            </ThemedText>
            <ThemedText style={styles.totalNote}>
              {rows.filter(r => (parseFloat(r.amount) || 0) > 0).length} categories set
            </ThemedText>
          </View>

          {/* Category rows */}
          <ThemedText style={[styles.sectionLabel, { color: theme.textSecondary }]}>
            CATEGORIES
          </ThemedText>

          {rows.map((row, idx) => (
            <View
              key={`${row.id}-${idx}`}
              style={[
                styles.rowCard,
                {
                  backgroundColor: theme.backgroundElement,
                  borderLeftColor: row.color,
                },
              ]}
            >
              {/* Icon */}
              <View
                style={[
                  styles.catIcon,
                  { backgroundColor: isDark ? row.bgDark : row.bgLight },
                ]}
              >
                <Ionicons name={row.icon} size={20} color={row.color} />
              </View>

              {/* Label */}
              <ThemedText style={styles.catLabel} numberOfLines={1}>
                {row.label}
              </ThemedText>

              {/* Amount input */}
              <View style={[styles.inputWrap, { backgroundColor: theme.background }]}>
                <ThemedText style={[styles.inputSymbol, { color: theme.textSecondary }]}>
                  {symbol}
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: theme.text }]}
                  value={row.amount}
                  onChangeText={val => updateAmount(idx, val)}
                  keyboardType="decimal-pad"
                  placeholder="0"
                  placeholderTextColor={theme.textSecondary}
                  returnKeyType="done"
                />
              </View>

              {/* Delete */}
              <Pressable
                onPress={() => removeRow(idx)}
                hitSlop={8}
                style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.5 }]}
              >
                <Ionicons name="close-circle-outline" size={20} color={theme.textSecondary} />
              </Pressable>
            </View>
          ))}

          {/* Add category */}
          <Pressable
            onPress={() => setShowModal(true)}
            style={({ pressed }) => [
              styles.addBtn,
              {
                borderColor: isDark ? '#3F3F46' : '#D1D5DB',
                backgroundColor: 'transparent',
              },
              pressed && { opacity: 0.7 },
            ]}
          >
            <Ionicons name="add-circle-outline" size={20} color="#3369F6" />
            <ThemedText style={[styles.addBtnText, { color: '#3369F6' }]}>
              Add Category
            </ThemedText>
          </Pressable>

          {/* Start button */}
          <Pressable
            onPress={onStart}
            disabled={saving}
            style={({ pressed }) => [
              styles.startBtn,
              { backgroundColor: '#3369F6' },
              (pressed || saving) && { opacity: 0.8 },
            ]}
          >
            <ThemedText style={styles.startBtnText}>
              {saving ? 'Saving…' : 'Start Tracking'}
            </ThemedText>
            {!saving && <Ionicons name="checkmark" size={20} color="#FFF" />}
          </Pressable>

          <ThemedText style={[styles.skipNote, { color: theme.textSecondary }]}>
            You can adjust budgets anytime from the Budget tab
          </ThemedText>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Add Custom Category Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <ThemedView style={styles.modal}>
          {/* Modal header */}
          <View style={[styles.modalHeader, { borderBottomColor: theme.backgroundElement }]}>
            <Pressable
              onPress={() => setShowModal(false)}
              hitSlop={12}
              style={({ pressed }) => pressed && { opacity: 0.6 }}
            >
              <Ionicons name="close" size={24} color={theme.text} />
            </Pressable>
            <ThemedText style={styles.modalTitle}>New Category</ThemedText>
            <Pressable
              onPress={handleAddCustom}
              style={({ pressed }) => [pressed && { opacity: 0.6 }]}
            >
              <ThemedText style={[styles.modalDone, { color: '#3369F6', opacity: customLabel.trim() ? 1 : 0.4 }]}>
                Add
              </ThemedText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalContent} showsVerticalScrollIndicator={false}>
            {/* Preview */}
            <View
              style={[
                styles.preview,
                { backgroundColor: isDark ? CUSTOM_COLORS[customColorIdx].bgDark : CUSTOM_COLORS[customColorIdx].bgLight },
              ]}
            >
              <View style={[styles.previewIcon, { backgroundColor: CUSTOM_COLORS[customColorIdx].color }]}>
                <Ionicons name={CUSTOM_ICONS[customIconIdx]} size={28} color="#FFF" />
              </View>
              <ThemedText style={[styles.previewLabel, { color: CUSTOM_COLORS[customColorIdx].color }]}>
                {customLabel.trim() || 'Category Name'}
              </ThemedText>
            </View>

            {/* Name input */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary }]}>NAME</ThemedText>
            <View style={[styles.nameInputWrap, { backgroundColor: theme.backgroundElement }]}>
              <TextInput
                style={[styles.nameInput, { color: theme.text }]}
                placeholder="e.g., Gym, Gifts, Pet Care"
                placeholderTextColor={theme.textSecondary}
                value={customLabel}
                onChangeText={setCustomLabel}
                autoFocus
                returnKeyType="done"
              />
            </View>

            {/* Color picker */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary }]}>COLOR</ThemedText>
            <View style={styles.colorRow}>
              {CUSTOM_COLORS.map((c, i) => (
                <Pressable
                  key={i}
                  onPress={() => setCustomColorIdx(i)}
                  style={[
                    styles.colorCircle,
                    { backgroundColor: c.color },
                    customColorIdx === i && styles.colorCircleActive,
                  ]}
                >
                  {customColorIdx === i && (
                    <Ionicons name="checkmark" size={16} color="#FFF" />
                  )}
                </Pressable>
              ))}
            </View>

            {/* Icon picker */}
            <ThemedText style={[styles.formLabel, { color: theme.textSecondary }]}>ICON</ThemedText>
            <View style={styles.iconGrid}>
              {CUSTOM_ICONS.map((icon, i) => {
                const active = customIconIdx === i;
                return (
                  <Pressable
                    key={icon}
                    onPress={() => setCustomIconIdx(i)}
                    style={[
                      styles.iconOption,
                      {
                        backgroundColor: active
                          ? CUSTOM_COLORS[customColorIdx].color
                          : theme.backgroundElement,
                      },
                    ]}
                  >
                    <Ionicons
                      name={icon}
                      size={22}
                      color={active ? '#FFF' : theme.textSecondary}
                    />
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  flex1: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    marginBottom: Spacing.two,
  },
  backBtn: {
    padding: Spacing.one,
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

  // Content
  content: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 60,
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

  // Total card
  totalCard: {
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#3369F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 6,
  },
  totalDecor1: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.08)',
    top: -50,
    right: -30,
  },
  totalDecor2: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.06)',
    bottom: -20,
    left: 20,
  },
  totalLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },
  totalAmount: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
    marginBottom: Spacing.two,
  },
  totalNote: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 13,
  },

  // Section label
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
  },

  // Category row
  rowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderLeftWidth: 3,
    padding: Spacing.three,
    marginBottom: Spacing.two,
    gap: Spacing.two,
  },
  catIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  catLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.one,
    width: 100,
  },
  inputSymbol: {
    fontSize: 14,
    marginRight: 2,
  },
  input: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    padding: 0,
    textAlign: 'right',
  },
  deleteBtn: {
    padding: Spacing.one,
  },

  // Add button
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: Spacing.three,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    marginBottom: Spacing.four,
    marginTop: Spacing.one,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Start button
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 54,
    borderRadius: 16,
    marginBottom: Spacing.three,
    shadowColor: '#3369F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  startBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  skipNote: {
    fontSize: 13,
    textAlign: 'center',
    marginBottom: Spacing.four,
  },

  // Modal
  modal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    borderBottomWidth: 1,
    marginTop: Platform.OS === 'ios' ? 0 : Spacing.three,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  modalDone: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalContent: {
    padding: Spacing.four,
    paddingBottom: 60,
  },
  preview: {
    borderRadius: 20,
    padding: Spacing.four,
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  previewIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  previewLabel: {
    fontSize: 18,
    fontWeight: '700',
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.two,
    marginTop: Spacing.three,
  },
  nameInputWrap: {
    borderRadius: 14,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  nameInput: {
    fontSize: 16,
    fontWeight: '500',
    padding: 0,
  },
  colorRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  colorCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  colorCircleActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    transform: [{ scale: 1.1 }],
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  iconOption: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
