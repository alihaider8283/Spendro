import { useState } from 'react';
import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { CURRENCIES, getCurrencySymbol } from '@/features/expenses/types';
import { triggerSync } from '@/services/syncEngine';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const primaryColor = colors.primary;
  const router = useRouter();

  // Auth Store details
  const { user, logout, isAuthenticated, updateName } = useAuthStore();

  // Settings Store details
  const {
    themeMode,
    aiAutoCategorization,
    notifications,
    currency,
    cloudBackup,
    monthlyIncome,
    setThemeMode,
    setAiAutoCategorization,
    setNotifications,
    setCurrency,
    setCloudBackup,
    setMonthlyIncome,
  } = useSettingsStore();

  // Modal state
  const [showCurrencyModal, setShowCurrencyModal] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [editIncome, setEditIncome] = useState('');

  const activeCurrency = CURRENCIES.find((c) => c.code === currency) ?? CURRENCIES[0];

  const openIncomeModal = () => {
    setEditIncome(monthlyIncome > 0 ? String(monthlyIncome) : '');
    setShowIncomeModal(true);
  };

  const handleSaveIncome = () => {
    setMonthlyIncome(parseFloat(editIncome) || 0);
    setShowIncomeModal(false);
  };

  const handleSaveName = async () => {
    const trimmed = editName.trim();
    if (!trimmed || editSaving) return;
    setEditSaving(true);
    try {
      await updateName(trimmed);
      setShowEditProfile(false);
    } catch {
      Alert.alert('Error', 'Could not update your name. Please try again.');
    } finally {
      setEditSaving(false);
    }
  };

  // Generate initials for the profile picture placeholder
  const getInitials = (name?: string) => {
    if (!name) return 'S';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out of Spendro?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
            } catch (error) {
              console.error('Failed to log out:', error);
              Alert.alert('Error', 'An error occurred while logging out. Please try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const toggleDarkMode = (value: boolean) => {
    setThemeMode(value ? 'dark' : 'light');
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <ThemedText type="subtitle" style={styles.headerTitle}>
          Settings
        </ThemedText>
        <Pressable
          style={[styles.iconButton, { backgroundColor: colors.backgroundElement }]}
          android_ripple={{ color: colors.backgroundSelected, borderless: true }}
        >
          <Ionicons name="notifications-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <Pressable
          onPress={() => {
            if (!isAuthenticated) {
              router.push('/(auth)/auth');
            } else {
              setEditName(user?.name ?? '');
              setShowEditProfile(true);
            }
          }}
          style={[styles.profileCard, { backgroundColor: colors.backgroundElement }]}
          android_ripple={{ color: colors.backgroundSelected }}
        >
          <View style={[styles.profileAvatar, { backgroundColor: isAuthenticated ? primaryColor : '#73717D' }]}>
            <ThemedText style={styles.avatarText}>
              {isAuthenticated ? getInitials(user?.name) : 'G'}
            </ThemedText>
          </View>
          <View style={styles.profileDetails}>
            <ThemedText style={styles.profileName}>
              {isAuthenticated ? (user?.name || 'User') : 'Guest User'}
            </ThemedText>
            <ThemedText style={[styles.profileEmail, { color: colors.textSecondary }]}>
              {isAuthenticated ? (user?.email || 'user@spendro.com') : 'Log in to sync your data & insights'}
            </ThemedText>
            {isAuthenticated ? (
              <View style={[styles.premiumBadge, { backgroundColor: theme === 'dark' ? '#1A2F4C' : '#EBF3FF' }]}>
                <Ionicons name="sparkles" size={12} color={theme === 'dark' ? '#3A96FF' : colors.primary} style={styles.premiumIcon} />
                <ThemedText style={[styles.premiumText, { color: theme === 'dark' ? '#3A96FF' : colors.primary }]}>
                  Premium
                </ThemedText>
              </View>
            ) : (
              <View style={[styles.premiumBadge, { backgroundColor: theme === 'dark' ? '#2d1a12' : '#fffbeb' }]}>
                <Ionicons name="cloud-offline-outline" size={12} color={theme === 'dark' ? '#ff9b3a' : '#d97706'} style={styles.premiumIcon} />
                <ThemedText style={[styles.premiumText, { color: theme === 'dark' ? '#ff9b3a' : '#d97706' }]}>
                  Local Mode
                </ThemedText>
              </View>
            )}
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
        </Pressable>


        {/* PREFERENCES SECTION */}
        <View style={styles.sectionContainer}>
          <ThemedText style={[styles.sectionHeader, { color: colors.textSecondary }]}>
            PREFERENCES
          </ThemedText>
          <View style={[styles.listContainer, { backgroundColor: colors.backgroundElement }]}>
            {/* AI Auto-Categorization (disabled for current phase)
            <View style={styles.listItemWithSub}>
              <View style={styles.listItemLeft}>
                <View style={[styles.itemIconContainer, { backgroundColor: theme === 'dark' ? '#1A2F4C' : '#EBF3FF' }]}>
                  <Ionicons name="sparkles-outline" size={20} color={primaryColor} />
                </View>
                <View style={styles.itemTextWithSub}>
                  <ThemedText style={styles.listItemText}>AI Auto-Categorization</ThemedText>
                  <ThemedText style={[styles.listItemSubText, { color: colors.textSecondary }]}>
                    Smart expense sorting
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={aiAutoCategorization}
                onValueChange={setAiAutoCategorization}
                trackColor={{ false: '#D1D5DB', true: primaryColor }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.backgroundSelected}
              />
            </View>
            */}

            <View style={[styles.divider, { backgroundColor: colors.background }]} />

            {/* Notifications */}
            <View style={styles.listItemWithSub}>
              <View style={styles.listItemLeft}>
                <View style={[styles.itemIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="notifications-outline" size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.itemTextWithSub}>
                  <ThemedText style={styles.listItemText}>Notifications</ThemedText>
                  <ThemedText style={[styles.listItemSubText, { color: colors.textSecondary }]}>
                    Budget alerts & reminders
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#D1D5DB', true: primaryColor }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.backgroundSelected}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.background }]} />

            {/* Dark Mode */}
            <View style={styles.listItemWithSub}>
              <View style={styles.listItemLeft}>
                <View style={[styles.itemIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="moon-outline" size={20} color={colors.textSecondary} />
                </View>
                <View style={styles.itemTextWithSub}>
                  <ThemedText style={styles.listItemText}>Dark Mode</ThemedText>
                  <ThemedText style={[styles.listItemSubText, { color: colors.textSecondary }]}>
                    Easier on the eyes
                  </ThemedText>
                </View>
              </View>
              <Switch
                value={themeMode === 'dark'}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#D1D5DB', true: primaryColor }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.backgroundSelected}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: colors.background }]} />

            {/* Currency */}
            <Pressable
              onPress={() => setShowCurrencyModal(true)}
              style={({ pressed }) => [styles.listItem, pressed && { backgroundColor: colors.backgroundSelected }]}
            >
              <View style={styles.listItemLeft}>
                <View style={[styles.itemIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="cash-outline" size={20} color={colors.textSecondary} />
                </View>
                <ThemedText style={styles.listItemText}>Currency</ThemedText>
              </View>
              <View style={styles.listItemRight}>
                <ThemedText style={[styles.badgeText, { color: colors.textSecondary }]}>
                  {currency} ({activeCurrency.symbol})
                </ThemedText>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </View>
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.background }]} />

            {/* Monthly Income */}
            <Pressable
              onPress={openIncomeModal}
              style={({ pressed }) => [styles.listItem, pressed && { backgroundColor: colors.backgroundSelected }]}
            >
              <View style={styles.listItemLeft}>
                <View style={[styles.itemIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="trending-up-outline" size={20} color={colors.textSecondary} />
                </View>
                <ThemedText style={styles.listItemText}>Monthly Income</ThemedText>
              </View>
              <View style={styles.listItemRight}>
                <ThemedText style={[styles.badgeText, { color: colors.textSecondary }]}>
                  {monthlyIncome > 0
                    ? `${getCurrencySymbol(currency)}${monthlyIncome.toLocaleString()}`
                    : 'Not set'}
                </ThemedText>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </View>
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.background }]} />

            {/* Cloud Backup */}
            <View style={styles.listItemWithSub}>
              <View style={styles.listItemLeft}>
                <View style={[styles.itemIconContainer, { backgroundColor: theme === 'dark' ? '#1E3A3A' : '#E6F4EA' }]}>
                  <Ionicons name="cloud-upload-outline" size={20} color={theme === 'dark' ? '#34D399' : '#10B981'} />
                </View>
                <View style={styles.itemTextWithSub}>
                  <ThemedText style={styles.listItemText}>Cloud Backup</ThemedText>
                  <ThemedText style={[styles.listItemSubText, { color: colors.textSecondary }]}>
                    {!isAuthenticated ? 'Log in to enable backup' : 'Sync local data to Firestore'}
                  </ThemedText>
                </View>
              </View>
              <Switch
                disabled={!isAuthenticated}
                value={cloudBackup}
                onValueChange={(val) => {
                  setCloudBackup(val);
                  if (val) {
                    triggerSync().catch(console.error);
                  }
                }}
                trackColor={{ false: '#D1D5DB', true: primaryColor }}
                thumbColor="#FFFFFF"
                ios_backgroundColor={colors.backgroundSelected}
              />
            </View>

            {isAuthenticated && cloudBackup && (
              <>
                <View style={[styles.divider, { backgroundColor: colors.background }]} />
                <Pressable
                  onPress={async () => {
                    try {
                      await triggerSync();
                      Alert.alert('Sync Complete', 'Your local data is now synchronized with the cloud.');
                    } catch (err) {
                      Alert.alert('Sync Failed', 'Could not sync. Please check your network connection.');
                    }
                  }}
                  style={({ pressed }) => [styles.listItem, pressed && { backgroundColor: colors.backgroundSelected }]}
                >
                  <View style={styles.listItemLeft}>
                    <View style={[styles.itemIconContainer, { backgroundColor: colors.background }]}>
                      <Ionicons name="sync-outline" size={20} color={colors.textSecondary} />
                    </View>
                    <ThemedText style={styles.listItemText}>Sync Now</ThemedText>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
                </Pressable>
              </>
            )}

            <View style={[styles.divider, { backgroundColor: colors.background }]} />

            {/* Privacy & Security */}
            <Pressable
              style={({ pressed }) => [styles.listItem, pressed && { backgroundColor: colors.backgroundSelected }]}
            >
              <View style={styles.listItemLeft}>
                <View style={[styles.itemIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="shield-checkmark-outline" size={20} color={colors.textSecondary} />
                </View>
                <ThemedText style={styles.listItemText}>Privacy & Security</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.background }]} />

            {/* Help Center */}
            <Pressable
              style={({ pressed }) => [styles.listItem, pressed && { backgroundColor: colors.backgroundSelected }]}
            >
              <View style={styles.listItemLeft}>
                <View style={[styles.itemIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="help-circle-outline" size={20} color={colors.textSecondary} />
                </View>
                <ThemedText style={styles.listItemText}>Help Center</ThemedText>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
            </Pressable>

            <View style={[styles.divider, { backgroundColor: colors.background }]} />

            {/* About Spendro */}
            <Pressable
              style={({ pressed }) => [styles.listItem, pressed && { backgroundColor: colors.backgroundSelected }]}
            >
              <View style={styles.listItemLeft}>
                <View style={[styles.itemIconContainer, { backgroundColor: colors.background }]}>
                  <Ionicons name="information-circle-outline" size={20} color={colors.textSecondary} />
                </View>
                <ThemedText style={styles.listItemText}>About Spendro</ThemedText>
              </View>
              <View style={styles.listItemRight}>
                <ThemedText style={[styles.badgeText, { color: colors.textSecondary }]}>v1.0.0</ThemedText>
                <Ionicons name="chevron-forward" size={18} color={colors.textSecondary} />
              </View>
            </Pressable>
          </View>
        </View>

        {/* LOGOUT / LOGIN BUTTON */}
        {isAuthenticated ? (
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              { borderColor: colors.backgroundSelected },
              pressed && { backgroundColor: theme === 'dark' ? '#2d1414' : '#fef2f2' },
            ]}
          >
            <Ionicons name="log-out-outline" size={20} color="#EF4444" style={styles.logoutIcon} />
            <ThemedText style={styles.logoutText}>Log Out</ThemedText>
          </Pressable>
        ) : (
          <Pressable
            onPress={() => router.push('/(auth)/auth')}
            style={({ pressed }) => [
              styles.loginButton,
              { backgroundColor: primaryColor },
              pressed && { opacity: 0.8 },
            ]}
          >
            <Ionicons name="log-in-outline" size={20} color="#FFFFFF" style={styles.logoutIcon} />
            <ThemedText style={styles.loginButtonText}>Log In / Sign Up</ThemedText>
          </Pressable>
        )}
      </ScrollView>

      {/* ── Currency Picker Modal ── */}
      <Modal
        visible={showCurrencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyModal(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowCurrencyModal(false)} />
        <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
          {/* Handle */}
          <View style={[styles.modalHandle, { backgroundColor: colors.backgroundElement }]} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Currency</ThemedText>
            <Pressable
              onPress={() => setShowCurrencyModal(false)}
              style={[styles.modalCloseBtn, { backgroundColor: colors.backgroundElement }]}
              hitSlop={8}
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          <FlatList
            data={CURRENCIES}
            keyExtractor={(item) => item.code}
            numColumns={2}
            columnWrapperStyle={styles.currencyRow}
            contentContainerStyle={styles.currencyGrid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const active = item.code === currency;
              return (
                <Pressable
                  onPress={() => {
                    setCurrency(item.code);
                    setShowCurrencyModal(false);
                  }}
                  style={({ pressed }) => [
                    styles.currencyCard,
                    { backgroundColor: active ? primaryColor : colors.backgroundElement },
                    pressed && !active && { opacity: 0.75 },
                  ]}
                >
                  <ThemedText style={[styles.currencySymbol, { color: active ? '#FFF' : colors.text }]}>
                    {item.symbol}
                  </ThemedText>
                  <ThemedText style={[styles.currencyCode, { color: active ? '#FFF' : colors.text }]}>
                    {item.code}
                  </ThemedText>
                  <ThemedText style={[styles.currencyName, { color: active ? 'rgba(255,255,255,0.7)' : colors.textSecondary }]}>
                    {item.name}
                  </ThemedText>
                  {active && (
                    <View style={styles.currencyCheck}>
                      <Ionicons name="checkmark" size={11} color={primaryColor} />
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>

      {/* ── Monthly Income Modal ── */}
      <Modal
        visible={showIncomeModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowIncomeModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlayFull}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowIncomeModal(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHandle, { backgroundColor: colors.backgroundElement }]} />

            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Monthly Income</ThemedText>
              <Pressable
                onPress={() => setShowIncomeModal(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.backgroundElement }]}
                hitSlop={8}
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </Pressable>
            </View>

            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Expected income per month
            </ThemedText>
            <TextInput
              value={editIncome}
              onChangeText={(val) => setEditIncome(val.replace(/[^0-9.]/g, ''))}
              placeholder="0"
              placeholderTextColor={colors.textSecondary}
              keyboardType="decimal-pad"
              returnKeyType="done"
              onSubmitEditing={handleSaveIncome}
              style={[
                styles.editInput,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.backgroundSelected,
                },
              ]}
            />

            <Pressable
              onPress={handleSaveIncome}
              style={({ pressed }) => [
                styles.editSaveBtn,
                { backgroundColor: primaryColor },
                pressed && { opacity: 0.6 },
              ]}
            >
              <ThemedText style={styles.editSaveBtnText}>Save</ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* ── Edit Profile Modal ── */}
      <Modal
        visible={showEditProfile}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditProfile(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlayFull}
        >
          <Pressable style={styles.modalOverlay} onPress={() => setShowEditProfile(false)} />
          <View style={[styles.modalSheet, { backgroundColor: colors.background }]}>
            {/* Handle */}
            <View style={[styles.modalHandle, { backgroundColor: colors.backgroundElement }]} />

            {/* Header */}
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Edit Profile</ThemedText>
              <Pressable
                onPress={() => setShowEditProfile(false)}
                style={[styles.modalCloseBtn, { backgroundColor: colors.backgroundElement }]}
                hitSlop={8}
              >
                <Ionicons name="close" size={18} color={colors.text} />
              </Pressable>
            </View>

            {/* Avatar preview */}
            <View style={styles.editAvatarRow}>
              <View style={[styles.editAvatar, { backgroundColor: primaryColor }]}>
                <ThemedText style={styles.editAvatarText}>
                  {editName.trim().charAt(0).toUpperCase() || 'S'}
                </ThemedText>
              </View>
            </View>

            {/* Name input */}
            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Display Name
            </ThemedText>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              placeholder="Your name"
              placeholderTextColor={colors.textSecondary}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={handleSaveName}
              style={[
                styles.editInput,
                {
                  backgroundColor: colors.backgroundElement,
                  color: colors.text,
                  borderColor: colors.backgroundSelected,
                },
              ]}
            />

            {/* Email (read-only) */}
            <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>
              Email
            </ThemedText>
            <View style={[styles.editInputReadOnly, { backgroundColor: colors.backgroundElement, borderColor: colors.backgroundSelected }]}>
              <ThemedText style={{ color: colors.textSecondary, fontSize: 15 }}>
                {user?.email ?? ''}
              </ThemedText>
            </View>
            <ThemedText style={[styles.editNote, { color: colors.textSecondary }]}>
              Email cannot be changed here.
            </ThemedText>

            {/* Save */}
            <Pressable
              onPress={handleSaveName}
              disabled={editSaving || !editName.trim()}
              style={({ pressed }) => [
                styles.editSaveBtn,
                { backgroundColor: primaryColor },
                (pressed || editSaving || !editName.trim()) && { opacity: 0.6 },
              ]}
            >
              <ThemedText style={styles.editSaveBtnText}>
                {editSaving ? 'Saving…' : 'Save Changes'}
              </ThemedText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerTitle: {
    fontWeight: '800',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: Spacing.six,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    padding: Spacing.four,
    marginBottom: Spacing.four,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: {
        elevation: 2,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
    }),
  },
  profileAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  profileDetails: {
    flex: 1,
    marginLeft: Spacing.three,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
  },
  profileEmail: {
    fontSize: 14,
    marginTop: Spacing.half,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 99,
    paddingHorizontal: Spacing.two,
    paddingVertical: Spacing.half,
    marginTop: Spacing.one,
  },
  premiumIcon: {
    marginRight: 4,
  },
  premiumText: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionContainer: {
    marginBottom: Spacing.four,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: Spacing.two,
    paddingLeft: Spacing.two,
    letterSpacing: 0.5,
  },
  listContainer: {
    borderRadius: 24,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
      android: {
        elevation: 1,
      },
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
      },
    }),
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three + 2,
    paddingHorizontal: Spacing.four,
  },
  listItemWithSub: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.three,
    paddingHorizontal: Spacing.four,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.three,
  },
  listItemText: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemTextWithSub: {
    flexDirection: 'column',
    flex: 1,
  },
  listItemSubText: {
    fontSize: 12,
    marginTop: 2,
  },
  listItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.four,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: 20,
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
    marginBottom: Spacing.six,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    paddingVertical: Spacing.three,
    marginTop: Spacing.two,
    marginBottom: Spacing.six,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  logoutIcon: {
    marginRight: Spacing.two,
  },
  logoutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '700',
  },

  // ── Shared modal ──
  modalOverlayFull: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.four,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Currency modal ──
  currencyGrid: {
    paddingBottom: Spacing.three,
  },
  currencyRow: {
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  currencyCard: {
    flex: 1,
    borderRadius: 18,
    padding: Spacing.three,
    minHeight: 100,
    justifyContent: 'flex-end',
    position: 'relative',
  },
  currencySymbol: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 2,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '700',
  },
  currencyName: {
    fontSize: 11,
    marginTop: 2,
  },
  currencyCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ── Edit profile modal ──
  editAvatarRow: {
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  editAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editAvatarText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  editInput: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    fontSize: 15,
    marginBottom: Spacing.three,
  },
  editInputReadOnly: {
    height: 50,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    justifyContent: 'center',
    marginBottom: 6,
  },
  editNote: {
    fontSize: 12,
    marginBottom: Spacing.four,
  },
  editSaveBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.two,
  },
  editSaveBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
