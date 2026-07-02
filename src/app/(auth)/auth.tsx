import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  useColorScheme,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePassword } from '@/utils/validation';

export default function AuthScreen() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const PRIMARY = colors.primary;
  const router = useRouter();

  const { login, signup, loginWithGoogle, isLoading } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [error, setError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleTabChange = (tab: 'login' | 'signup') => {
    setActiveTab(tab);
    setError('');
    setEmailError('');
    setPasswordError('');
    setFullNameError('');
  };

  const handleLogin = async () => {
    setError('');
    setEmailError('');
    setPasswordError('');
    let hasError = false;
    if (!email.trim()) { setEmailError('Email is required'); hasError = true; }
    else if (!validateEmail(email)) { setEmailError('Enter a valid email address'); hasError = true; }
    if (!password) { setPasswordError('Password is required'); hasError = true; }
    if (hasError) return;
    try {
      await login(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    }
  };

  const handleSignup = async () => {
    setError('');
    setFullNameError('');
    setEmailError('');
    setPasswordError('');
    let hasError = false;
    if (!fullName.trim()) { setFullNameError('Full name is required'); hasError = true; }
    else if (fullName.trim().length < 2) { setFullNameError('Name must be at least 2 characters'); hasError = true; }
    if (!email.trim()) { setEmailError('Email is required'); hasError = true; }
    else if (!validateEmail(email)) { setEmailError('Enter a valid email address'); hasError = true; }
    if (!password) { setPasswordError('Password is required'); hasError = true; }
    else if (!validatePassword(password)) { setPasswordError('Password must be at least 8 characters'); hasError = true; }
    if (!agreeToTerms) { setError('Please agree to the Terms & Conditions to continue'); hasError = true; }
    if (hasError) return;
    try {
      await signup(email.trim(), password, fullName.trim());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed. Please try again.');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setGoogleLoading(true);
      await loginWithGoogle();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google sign-in failed';
      if (!msg.toLowerCase().includes('cancel')) {
        setError(msg);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputBg = colors.backgroundElement;
  const inputBorder = colors.backgroundSelected;

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Top bar ── */}
          <View style={styles.topBar}>
            <View style={styles.brandRow}>
              <View style={[styles.brandIcon, { backgroundColor: PRIMARY }]}>
                <Ionicons name="sparkles-outline" size={16} color="#FFF" />
              </View>
              <ThemedText style={styles.brandText}>Spendro</ThemedText>
            </View>
            <Pressable
              onPress={() => router.replace('/(tabs)')}
              hitSlop={12}
              style={[styles.closeBtn, { backgroundColor: colors.backgroundElement }]}
              accessibilityRole="button"
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={18} color={colors.text} />
            </Pressable>
          </View>

          {/* ── Hero ── */}
          <View style={styles.hero}>
            <ThemedText style={styles.heroTitle}>
              {activeTab === 'login' ? 'Welcome back' : 'Create account'}
            </ThemedText>
            <ThemedText style={[styles.heroSub, { color: colors.textSecondary }]}>
              {activeTab === 'login'
                ? 'Sign in to access your expenses and budgets'
                : 'Start tracking your spending with Spendro'}
            </ThemedText>
          </View>

          {/* ── Pill tab switcher ── */}
          <View style={[styles.tabPill, { backgroundColor: colors.backgroundElement }]}>
            {(['login', 'signup'] as const).map((tab) => (
              <Pressable
                key={tab}
                onPress={() => handleTabChange(tab)}
                style={[
                  styles.tabSegment,
                  activeTab === tab && [
                    styles.tabSegmentActive,
                    { backgroundColor: colors.background },
                  ],
                ]}
              >
                <ThemedText
                  style={[
                    styles.tabLabel,
                    { color: activeTab === tab ? colors.text : colors.textSecondary },
                    activeTab === tab && styles.tabLabelActive,
                  ]}
                >
                  {tab === 'login' ? 'Log In' : 'Sign Up'}
                </ThemedText>
              </Pressable>
            ))}
          </View>

          {/* ── Error banner ── */}
          {!!error && (
            <View style={[styles.errorBanner, { backgroundColor: theme === 'dark' ? '#2d1414' : '#fef2f2' }]}>
              <Ionicons name="alert-circle-outline" size={16} color="#EF4444" style={{ marginRight: 8 }} />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {/* ── Form ── */}
          {activeTab === 'login' ? (
            <View style={styles.form}>
              {/* Email */}
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Email</ThemedText>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: emailError ? '#EF4444' : inputBorder }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="you@email.com"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={(t) => { setEmail(t); if (emailError) setEmailError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {!!emailError && <ThemedText style={styles.fieldError}>{emailError}</ThemedText>}

              {/* Password */}
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary, marginTop: Spacing.three }]}>Password</ThemedText>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: passwordError ? '#EF4444' : inputBorder }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Enter your password"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(t) => { setPassword(t); if (passwordError) setPasswordError(''); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
              {!!passwordError && <ThemedText style={styles.fieldError}>{passwordError}</ThemedText>}

              {/* Forgot */}
              <Pressable style={styles.forgotRow}>
                <ThemedText style={[styles.forgotText, { color: PRIMARY }]}>Forgot password?</ThemedText>
              </Pressable>

              {/* Submit */}
              <Pressable
                onPress={handleLogin}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: PRIMARY },
                  (pressed || isLoading) && { opacity: 0.75 },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={styles.primaryBtnText}>Log In</ThemedText>
                )}
              </Pressable>
            </View>
          ) : (
            <View style={styles.form}>
              {/* Full Name */}
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary }]}>Full Name</ThemedText>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: fullNameError ? '#EF4444' : inputBorder }]}>
                <Ionicons name="person-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="John Doe"
                  placeholderTextColor={colors.textSecondary}
                  value={fullName}
                  onChangeText={(t) => { setFullName(t); if (fullNameError) setFullNameError(''); }}
                  autoCapitalize="words"
                />
              </View>
              {!!fullNameError && <ThemedText style={styles.fieldError}>{fullNameError}</ThemedText>}

              {/* Email */}
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary, marginTop: Spacing.three }]}>Email</ThemedText>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: emailError ? '#EF4444' : inputBorder }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="you@email.com"
                  placeholderTextColor={colors.textSecondary}
                  value={email}
                  onChangeText={(t) => { setEmail(t); if (emailError) setEmailError(''); }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
              {!!emailError && <ThemedText style={styles.fieldError}>{emailError}</ThemedText>}

              {/* Password */}
              <ThemedText style={[styles.inputLabel, { color: colors.textSecondary, marginTop: Spacing.three }]}>Password</ThemedText>
              <View style={[styles.inputRow, { backgroundColor: inputBg, borderColor: passwordError ? '#EF4444' : inputBorder }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} />
                <TextInput
                  style={[styles.textInput, { color: colors.text }]}
                  placeholder="Create a password (8+ chars)"
                  placeholderTextColor={colors.textSecondary}
                  value={password}
                  onChangeText={(t) => { setPassword(t); if (passwordError) setPasswordError(''); }}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
                  <Ionicons
                    name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                    size={18}
                    color={colors.textSecondary}
                  />
                </Pressable>
              </View>
              {!!passwordError && <ThemedText style={styles.fieldError}>{passwordError}</ThemedText>}

              {/* Terms */}
              <Pressable
                onPress={() => setAgreeToTerms(!agreeToTerms)}
                style={styles.termsRow}
              >
                <View style={[
                  styles.checkbox,
                  { backgroundColor: agreeToTerms ? PRIMARY : inputBg, borderColor: agreeToTerms ? PRIMARY : inputBorder },
                ]}>
                  {agreeToTerms && <Ionicons name="checkmark" size={13} color="#FFF" />}
                </View>
                <ThemedText style={[styles.termsText, { color: colors.textSecondary }]}>
                  I agree to the{' '}
                  <ThemedText style={{ color: PRIMARY, fontWeight: '600' }}>
                    Terms & Conditions
                  </ThemedText>
                </ThemedText>
              </Pressable>

              {/* Submit */}
              <Pressable
                onPress={handleSignup}
                disabled={isLoading}
                style={({ pressed }) => [
                  styles.primaryBtn,
                  { backgroundColor: PRIMARY },
                  (pressed || isLoading) && { opacity: 0.75 },
                ]}
              >
                {isLoading ? (
                  <ActivityIndicator color="#FFF" />
                ) : (
                  <ThemedText style={styles.primaryBtnText}>Create Account</ThemedText>
                )}
              </Pressable>
            </View>
          )}

          {/* ── Divider ── */}
          <View style={styles.dividerRow}>
            <View style={[styles.dividerLine, { backgroundColor: colors.backgroundElement }]} />
            <ThemedText style={[styles.dividerLabel, { color: colors.textSecondary }]}>
              or continue with
            </ThemedText>
            <View style={[styles.dividerLine, { backgroundColor: colors.backgroundElement }]} />
          </View>

          {/* ── Google button ── */}
          <Pressable
            onPress={handleGoogleSignIn}
            disabled={googleLoading || isLoading}
            style={({ pressed }) => [
              styles.socialBtn,
              {
                backgroundColor: colors.backgroundElement,
                borderColor: colors.backgroundSelected,
              },
              (pressed || googleLoading) && { opacity: 0.75 },
            ]}
          >
            {googleLoading ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <>
                <Ionicons name="logo-google" size={20} color="#EA4335" />
                <ThemedText style={styles.socialBtnText}>Continue with Google</ThemedText>
              </>
            )}
          </Pressable>

          {/* ── Guest link ── */}
          <Pressable
            onPress={() => router.replace('/(tabs)')}
            style={styles.guestRow}
            accessibilityRole="button"
          >
            <ThemedText style={[styles.guestText, { color: colors.textSecondary }]}>
              Continue as Guest
            </ThemedText>
            <Ionicons name="arrow-forward" size={14} color={colors.textSecondary} style={{ marginLeft: 4 }} />
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.six,
  },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.three,
    marginBottom: Spacing.four,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandText: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Hero
  hero: {
    marginBottom: Spacing.four,
  },
  heroTitle: {
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.6,
    marginBottom: Spacing.one,
  },
  heroSub: {
    fontSize: 15,
    lineHeight: 22,
  },

  // Pill tab switcher
  tabPill: {
    flexDirection: 'row',
    borderRadius: 16,
    padding: 4,
    marginBottom: Spacing.four,
  },
  tabSegment: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 13,
    alignItems: 'center',
  },
  tabSegmentActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  tabLabelActive: {
    fontWeight: '700',
  },

  // Error
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: Spacing.three,
    paddingVertical: 10,
    marginBottom: Spacing.three,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    flex: 1,
    fontWeight: '500',
  },

  // Form
  form: {
    marginBottom: Spacing.three,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: Spacing.three,
    height: 52,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
  },
  fieldError: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
  },
  forgotRow: {
    alignSelf: 'flex-end',
    paddingVertical: Spacing.two,
    marginBottom: Spacing.two,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600',
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: Spacing.three,
    marginBottom: Spacing.three,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },

  // Primary CTA
  primaryBtn: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3369F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 10,
    elevation: 5,
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Divider
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: Spacing.three,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerLabel: {
    fontSize: 13,
    fontWeight: '500',
  },

  // Social
  socialBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    height: 52,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: Spacing.three,
  },
  socialBtnText: {
    fontSize: 15,
    fontWeight: '600',
  },

  // Guest
  guestRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.three,
    marginTop: Spacing.one,
  },
  guestText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
