import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  ToastAndroid,
  useColorScheme,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { AmountKeypad } from '@/features/expenses/components/amount-keypad';
import { CategoryPanel } from '@/features/expenses/components/category-panel';
import { PaymentMethodPanel } from '@/features/expenses/components/payment-method-panel';
import {
  Category,
  CURRENCIES,
  getCategoryByNameOrId,
  PAYMENT_METHODS,
  PaymentMethod,
  TransactionType,
} from '@/features/expenses/types';
import { useAddTransaction, useUpdateTransaction } from '@/hooks/useTransactions';
import { transactionRepository } from '@/services/transactionRepository';
import DateTimePicker from '@expo/ui/community/datetime-picker';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

type ActivePanel = 'keypad' | 'category' | 'payment' | 'note' | null;

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function formatDate(date: Date): string {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const day = days[date.getDay()];
  const yr = date.getFullYear();
  const hh = date.getHours() % 12 || 12;
  const mm = String(date.getMinutes()).padStart(2, '0');
  const ampm = date.getHours() < 12 ? 'am' : 'pm';
  return `${date.getDate()}/${String(date.getMonth() + 1).padStart(2, '0')}/${yr} (${day}) ${hh}:${mm} ${ampm}`;
}

function formatDateOnly(date: Date): string {
  const yr = date.getFullYear();
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}/${yr}`;
}

function formatTimeOnly(date: Date): string {
  const hh = date.getHours() % 12 || 12;
  const min = String(date.getMinutes()).padStart(2, '0');
  const ampm = date.getHours() < 12 ? 'am' : 'pm';
  return `${hh}:${min} ${ampm}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Screen
// ─────────────────────────────────────────────────────────────────────────────

export default function AddExpenseScreen() {
  const router = useRouter();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const isDark = scheme === 'dark';

  // ── Form state ──────────────────────────────────────────────────────────
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('0');
  const [currency, setCurrency] = useState<string>('PKR');
  const [note, setNote] = useState<string>('');
  const [date, setDate] = useState<Date>(new Date());
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod | null>(null);
  const [loadingTransaction, setLoadingTransaction] = useState<boolean>(false);

  // ── Panel flow state ─────────────────────────────────────────────────────
  // Starts on 'keypad' so the keypad is immediately visible when screen opens
  const [activePanel, setActivePanel] = useState<ActivePanel>('keypad');

  // ── Determine next required panel based on form state ───────────────────
  const getNextRequiredPanel = useCallback((): ActivePanel => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0) return 'keypad';
    if (!selectedCategory?.id) return 'category';
    if (!selectedPayment?.id) return 'payment';
    // if(!note) return 'note'
    return null;
  }, [amount, selectedCategory?.id, selectedPayment?.id]);

  // ── Date/time picker state & handlers ──────────────────────────────────
  const [showPicker, setShowPicker] = useState<boolean>(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');

  const loadTransaction = useCallback(async (transactionId: string) => {
    try {
      setLoadingTransaction(true);
      const transaction = await transactionRepository.getById(transactionId);
      if (!transaction) {
        Alert.alert('Not found', 'Transaction not found for editing.');
        return;
      }
      setType(transaction.type);
      setAmount(transaction.amount.toString());
      setCurrency(transaction.currency || 'PKR');
      setNote(transaction.description || '');
      setDate(new Date(transaction.transactionDate));
      setSelectedCategory(getCategoryByNameOrId(transaction.category));
      setSelectedPayment(
        PAYMENT_METHODS.find((method) => method.id === transaction.method) || null,
      );
    } catch (error) {
      console.error('Failed to load transaction for edit:', error);
      Alert.alert('Error', 'Unable to load transaction for editing.');
    } finally {
      setLoadingTransaction(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      loadTransaction(id);
    }
  }, [id, loadTransaction]);

  const openDatePicker = useCallback(() => {
    setPickerMode('date');
    setShowPicker(true);
  }, []);

  const openTimePicker = useCallback(() => {
    setPickerMode('time');
    setShowPicker(true);
  }, []);

  const onPickerValueChange = useCallback((event: any, selected?: Date) => {
    if (selected) setDate(selected);
    setShowPicker(false);
    const next = getNextRequiredPanel();
    setActivePanel(next);
  }, [getNextRequiredPanel]);

  // ── Derived ─────────────────────────────────────────────────────────────
  const currencySymbol = useMemo(
    () => CURRENCIES.find((c) => c.code === currency)?.symbol ?? currency,
    [currency],
  );

  const displayAmount = useMemo(() => {
    if (!amount || amount === '0') return '0.00';
    const parsed = parseFloat(amount);
    if (isNaN(parsed)) return '0.00';
    return parsed.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [amount]);

  const aiSuggestion = useMemo(() => {
    const num = parseFloat(amount) || 0;
    if (num > 1000) return 'Based on your history, this seems like a monthly recurring expense.';
    if (num > 500) return 'Your spending in this category is trending higher this month.';
    return 'Based on your history, this might be a regular daily expense.';
  }, [amount]);

  const isExpense = type === 'expense';
  const headerBg = isExpense ? '#3369F6' : '#137333';
  const categoryBg = isDark ? selectedCategory?.bgDark : selectedCategory?.bgLight;

  // ── Keypad handlers ──────────────────────────────────────────────────────
  const handleKeyPress = useCallback((key: string) => {
    setAmount((prev) => {
      if (key === '.' && prev.includes('.')) return prev;
      if (key === '-') return prev;
      const current = prev === '0' ? '' : prev;
      const next = current + key;
      return next || '0';
    });
  }, []);

  const handleBackspace = useCallback(() => {
    setAmount((prev) => {
      if (prev.length <= 1) return '0';
      return prev.slice(0, -1);
    });
  }, []);

  const handleCurrencyChange = useCallback(() => {
    setCurrency((prev) => {
      const idx = CURRENCIES.findIndex((c) => c.code === prev);
      return CURRENCIES[(idx + 1) % CURRENCIES.length].code;
    });
  }, []);

  // ── Panel flow handlers ──────────────────────────────────────────────────

  /** Keypad "Done" → move to next required panel */
  const handleKeypadDone = useCallback(() => {
    const nextPanel = getNextRequiredPanel();
    setActivePanel(nextPanel);
  }, [getNextRequiredPanel]);

  /** Category selected → move to next required panel */
  const handleCategorySelect = useCallback((cat: Category) => {
    setSelectedCategory(cat);
    // Check if payment is needed
    if (!selectedPayment?.id) {
      setActivePanel('payment');
    } else {
      setActivePanel(null);
    }
  }, [selectedPayment?.id]);

  /** Payment selected → close all panels (null = ready to save) */
  const handlePaymentSelect = useCallback((method: PaymentMethod) => {
    setSelectedPayment(method);
    setActivePanel(null);
  }, []);

  /** Tapping a form row while keypad is open → switch to that panel */
  const handleCategoryRowPress = useCallback(() => {
    setActivePanel('category');
  }, []);

  const handlePaymentRowPress = useCallback(() => {
    setActivePanel('payment');
  }, []);

  /** Tapping the amount card goes back to keypad */
  const handleAmountCardPress = useCallback(() => {
    setActivePanel('keypad');
  }, []);

  /** Panel close (✕) → move to next required panel or null */
  const handlePanelClose = useCallback(() => {
    setActivePanel(null);
  }, []);

  /** Final save — persist to SQLite */
  const addTransaction = useAddTransaction();
  const updateTransaction = useUpdateTransaction();

  const handleSave = useCallback(async () => {
    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount <= 0 || !selectedCategory || !selectedPayment) {
      handleKeypadDone();
      ToastAndroid.show('Please enter required fields', ToastAndroid.TOP);
      return;
    }

    const payload = {
      type,
      amount: parsedAmount,
      category: selectedCategory.label,
      description: note.trim() || selectedCategory.label,
      method: selectedPayment.id || '',
      transactionDate: date.getTime(),
      source: 'manual' as const,
      receiptUrl: null,
      // UI display fields
      title: note.trim() || selectedCategory.label,
      currency,
      merchant: null,
    };

    try {
      if (isEditing && id) {
        await updateTransaction.mutateAsync({ id, updates: payload });
        router.push('/(tabs)/transactions')
      } else {
        await addTransaction.mutateAsync(payload);
        router.back();
      }
    } catch (err) {
      console.error('Failed to save transaction:', err);
      Alert.alert('Error', 'Failed to save transaction. Please try again.');
    }
  }, [addTransaction, amount, type, selectedCategory, note, selectedPayment, date, currency, router, isEditing, id, updateTransaction]);

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  if (isEditing && loadingTransaction) {
    return (
      <SafeAreaView
        style={[styles.screen, { backgroundColor: colors.background }]}
        edges={['top', 'left', 'right']}
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <ThemedText style={styles.loadingText}>Loading transaction...</ThemedText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: colors.background }]}
      edges={['top', 'left', 'right']}
    >
      {/* ── Top Bar ── */}
      <View style={styles.topBar}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>

        <ThemedText style={styles.topBarTitle}>{isEditing ? 'Edit Transaction' : 'Add Transaction'}</ThemedText>

        <Pressable
          style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel="More options"
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </Pressable>
      </View>

      {/* ── Amount Card (tappable → re-opens keypad) ── */}
      <Pressable
        style={[
          styles.amountCard,
          { backgroundColor: headerBg },
          activePanel === 'keypad' && styles.amountCardActive,
        ]}
        onPress={handleAmountCardPress}
        accessibilityRole="button"
        accessibilityLabel="Tap to edit amount"
      >
        {/* Date row */}
        <View style={styles.amountCardTop}>
          <View style={styles.dateRow}>
            <Pressable onPress={openDatePicker} accessibilityRole="button" accessibilityLabel="Edit date">
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="calendar-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={styles.dateText}>{formatDateOnly(date)}</Text>
              </View>
            </Pressable>

            <Pressable onPress={openTimePicker} accessibilityRole="button" accessibilityLabel="Edit time" style={{ marginLeft: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="time-outline" size={13} color="rgba(255,255,255,0.8)" />
                <Text style={[styles.dateText, { marginLeft: 6 }]}>{formatTimeOnly(date)}</Text>
              </View>
            </Pressable>
          </View>
          <Pressable onPress={() => setDate(new Date())} accessibilityRole="button" accessibilityLabel="Reset date">
            <Ionicons name="refresh-outline" size={16} color="rgba(255,255,255,0.7)" />
          </Pressable>
        </View>

        {/* Expense / Income type pills */}
        <View style={styles.typePills}>
          <Pressable
            style={[styles.typePill, isExpense && styles.typePillActive]}
            onPress={() => setType('expense')}
            accessibilityRole="button"
            accessibilityLabel="Expense"
          >
            <Text style={[styles.typePillText, isExpense && styles.typePillTextActive]}>
              Expense
            </Text>
          </Pressable>
          <Pressable
            style={[styles.typePill, !isExpense && styles.typePillActive]}
            onPress={() => setType('income')}
            accessibilityRole="button"
            accessibilityLabel="Income"
          >
            <Text style={[styles.typePillText, !isExpense && styles.typePillTextActive]}>
              Income
            </Text>
          </Pressable>
        </View>

        {/* Amount display */}
        <Text style={styles.amountLabel}>Total Amount</Text>
        <Text style={styles.amountValue} numberOfLines={1} adjustsFontSizeToFit>
          {currencySymbol} {displayAmount}
        </Text>

        {/* Subtle edit hint when keypad is hidden */}
        {activePanel !== 'keypad' && (
          <View style={styles.editHint}>
            <Ionicons name="pencil" size={11} color="rgba(255,255,255,0.6)" />
            <Text style={styles.editHintText}>Tap to edit</Text>
          </View>
        )}
      </Pressable>

      {/* ── Form Card ── */}
      <View
        style={[
          styles.formCard,
          {
            backgroundColor: isDark ? colors.backgroundElement : '#ffffff',
            shadowColor: isDark ? 'transparent' : '#000',
          },
        ]}
      >
        {/* Category row */}
        <Pressable
          style={({ pressed }) => [
            styles.formRow,
            { borderBottomColor: isDark ? colors.background : '#F0F1F7' },
            activePanel === 'category' && [
              styles.formRowActive,
              { borderLeftColor: selectedCategory?.color || '#9CA3AF' },
            ],
            !selectedCategory && { opacity: 0.6 },
            pressed && { opacity: 0.75 },
          ]}
          onPress={handleCategoryRowPress}
          accessibilityRole="button"
          accessibilityLabel="Select category"
        >
          <View
            style={[
              styles.rowIconWrap,
              {
                backgroundColor: categoryBg || (isDark ? colors.background : '#F3F4F8'),
              },
            ]}
          >
            <Ionicons
              name={selectedCategory?.icon || 'pricetag-outline'}
              size={20}
              color={selectedCategory?.color || colors.textSecondary}
            />
          </View>
          <View style={styles.rowContent}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>Category</Text>
            <Text
              style={[
                styles.rowValue,
                {
                  color: selectedCategory ? colors.text : colors.textSecondary,
                  fontWeight: selectedCategory ? '600' : '500',
                },
              ]}
            >
              {selectedCategory?.label || 'Select Category'}
            </Text>
          </View>
          <Ionicons
            name={activePanel === 'category' ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={
              activePanel === 'category' ? selectedCategory?.color || '#9CA3AF' : colors.textSecondary
            }
          />
        </Pressable>

        {/* Payment method row */}
        <Pressable
          style={({ pressed }) => [
            styles.formRow,
            { borderBottomColor: isDark ? colors.background : '#F0F1F7' },
            activePanel === 'payment' && [styles.formRowActive, { borderLeftColor: '#3369F6' }],
            !selectedPayment && { opacity: 0.6 },
            pressed && { opacity: 0.75 },
          ]}
          onPress={handlePaymentRowPress}
          accessibilityRole="button"
          accessibilityLabel="Select payment method"
        >
          <View
            style={[
              styles.rowIconWrap,
              { backgroundColor: isDark ? colors.background : '#E8F0FE' },
            ]}
          >
            <Ionicons
              name={selectedPayment?.icon || 'wallet-outline'}
              size={20}
              color={selectedPayment ? '#3369F6' : colors.textSecondary}
            />
          </View>
          <View style={styles.rowContent}>
            <Text style={[styles.rowLabel, { color: colors.textSecondary }]}>
              Payment Method
            </Text>
            <Text
              style={[
                styles.rowValue,
                {
                  color: selectedPayment ? colors.text : colors.textSecondary,
                  fontWeight: selectedPayment ? '600' : '500',
                },
              ]}
            >
              {selectedPayment?.label || 'Select Payment Method'}
            </Text>
          </View>
          <Ionicons
            name={activePanel === 'payment' ? 'chevron-up' : 'chevron-down'}
            size={18}
            color={activePanel === 'payment' ? '#3369F6' : colors.textSecondary}
          />
        </Pressable>

        {/* Note row */}
        <View style={[styles.formRow, styles.noteRow]}>
          <View
            style={[
              styles.rowIconWrap,
              { backgroundColor: isDark ? colors.background : '#F3F4F8' },
            ]}
          >
            <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
          </View>
          <TextInput
            style={[styles.noteInput, { color: colors.text }]}
            placeholder="Add a note or description..."
            placeholderTextColor={colors.textSecondary}
            value={note}
            onChangeText={setNote}
            multiline={false}
            returnKeyType="done"
            accessibilityLabel="Note input"
          />
          <Pressable
            style={({ pressed }) => [styles.cameraBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Scan receipt"
          >
            <Ionicons name="camera-outline" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      {/* ── AI Hint (only when keypad is open) ── */}
      {/* {activePanel === 'keypad' && (
        <View
          style={[
            styles.aiHintCard,
            { backgroundColor: isDark ? '#1A2845' : '#EBF2FF' },
          ]}
        >
          <Text style={[styles.aiHintTitle, { color: '#3369F6' }]}>✦ Smart Categorization</Text>
          <Text style={[styles.aiHintBody, { color: isDark ? '#8FB3F5' : '#4A7FDE' }]}>
            {aiSuggestion}
          </Text>
        </View>
      )} */}


      <View style={styles.saveArea}>
        <Pressable
          style={({ pressed }) => [
            styles.saveButton,
            { backgroundColor: headerBg },
            pressed && styles.saveButtonPressed,
            (addTransaction.isPending || updateTransaction.isPending) && { opacity: 0.7 },
          ]}
          onPress={handleSave}
          disabled={addTransaction.isPending || updateTransaction.isPending}
          accessibilityRole="button"
          accessibilityLabel="Save transaction"
        >
          {addTransaction.isPending || updateTransaction.isPending ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="checkmark-circle-outline" size={20} color="#fff" />
          )}
          <Text style={styles.saveButtonText}>
            {addTransaction.isPending || updateTransaction.isPending
              ? isEditing
                ? 'Updating...'
                : 'Saving...'
              : isEditing
                ? 'Update Transaction'
                : 'Save Transaction'}
          </Text>
        </Pressable>
      </View>


      {showPicker && (
        <DateTimePicker
          value={date}
          onValueChange={(event, selectedDate) => onPickerValueChange(event, selectedDate)}
          mode={pickerMode}
          display='compact'
          is24Hour={false}
          onDismiss={() => { setShowPicker(false) }}
        />
      )}

      {/* ── Bottom Panel Area ── */}
      <View style={styles.panelArea}>
        {activePanel === 'keypad' && (
          <AmountKeypad
            amount={amount}
            currency={currency}
            onPress={handleKeyPress}
            onBackspace={handleBackspace}
            onDone={handleKeypadDone}
            onClose={handlePanelClose}
            onCurrencyChange={handleCurrencyChange}
          />
        )}

        {activePanel === 'category' && (
          <CategoryPanel
            selectedId={selectedCategory?.id || ''}
            onSelect={handleCategorySelect}
            onClose={handlePanelClose}
          />
        )}

        {activePanel === 'payment' && (
          <PaymentMethodPanel
            selectedId={selectedPayment?.id || ''}
            onSelect={handlePaymentSelect}
            onClose={handlePanelClose}
          />
        )}


      </View>
    </SafeAreaView>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Styles
// ─────────────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },

  // ── TopBar ─────────────────────────────────────────────────────────────
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.two,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: 18,
    fontWeight: '700',
  },

  // ── Amount card ────────────────────────────────────────────────────────
  amountCard: {
    marginHorizontal: Spacing.four,
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    ...Platform.select({
      ios: {
        shadowColor: '#1a4ccc',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  amountCardActive: {
    // Subtle ring when keypad is open
    ...Platform.select({
      ios: {
        shadowOpacity: 0.45,
        shadowRadius: 16,
      },
      android: { elevation: 12 },
    }),
  },
  amountCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.two,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    fontWeight: '500',
  },
  typePills: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: 12,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  typePillActive: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderColor: '#ffffff',
  },
  typePillText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 12,
    fontWeight: '600',
  },
  typePillTextActive: {
    color: '#ffffff',
  },
  amountLabel: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 3,
  },
  amountValue: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  editHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  editHintText: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 11,
    fontWeight: '500',
  },

  // ── Form card ──────────────────────────────────────────────────────────
  formCard: {
    marginHorizontal: Spacing.four,
    borderRadius: 20,
    marginBottom: Spacing.two,
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    borderLeftColor: 'transparent',
  },
  formRowActive: {
    borderLeftWidth: 3,
  },
  noteRow: {
    borderBottomWidth: 0,
  },
  rowIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  rowContent: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 11,
    fontWeight: '500',
    marginBottom: 2,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  noteInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    paddingVertical: 4,
  },
  cameraBtn: {
    padding: 4,
    marginLeft: Spacing.two,
  },

  // ── AI hint ────────────────────────────────────────────────────────────
  aiHintCard: {
    marginHorizontal: Spacing.four,
    borderRadius: 14,
    padding: 12,
    marginBottom: Spacing.two,
    borderWidth: 1,
    borderColor: 'rgba(51,105,246,0.16)',
  },
  aiHintTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 3,
  },
  aiHintBody: {
    fontSize: 12,
    lineHeight: 17,
  },

  // ── Panel area (flex: 1 → always pushes to bottom) ─────────────────────
  panelArea: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  // ── Save button (shown when activePanel === null) ──────────────────────
  saveArea: {
    padding: Spacing.four,
    paddingBottom: Spacing.three,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.two,
    borderRadius: 18,
    paddingVertical: 17,
    ...Platform.select({
      ios: {
        shadowColor: '#1a4ccc',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  saveButtonPressed: {
    opacity: 0.87,
    transform: [{ scale: 0.98 }],
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '600',
  },
});
