import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

export default function LoginScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={[styles.logo, { backgroundColor: '#208AEF' }]}>
            <Ionicons name="star" size={48} color="#ffffff" />
          </View>
          <Text style={[styles.appTitle, { color: colors.text }]}>SpendSmart</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Smart Expense Tracker AI</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable style={[styles.tab, styles.tabActive]}>
            <Text style={styles.tabActiveText}>Log In</Text>
          </Pressable>
          <Pressable style={[styles.tab, styles.tabInactive]}>
            <Text style={[styles.tabInactiveText, { color: colors.text }]}>Sign Up</Text>
          </Pressable>
        </View>

        {/* Email Field */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Email</Text>
          <View style={[styles.inputContainer, { borderColor: colors.backgroundElement }]}>
            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="you@email.com"
              placeholderTextColor={colors.textSecondary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>

        {/* Password Field */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Password</Text>
          <View style={[styles.inputContainer, { borderColor: colors.backgroundElement }]}>
            <Ionicons name="lock-closed-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter password"
              placeholderTextColor={colors.textSecondary}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={colors.textSecondary}
              />
            </Pressable>
          </View>
        </View>

        {/* Forgot Password */}
        <Pressable style={styles.forgotPasswordContainer}>
          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
        </Pressable>

        {/* Log In Button */}
        <Pressable style={[styles.primaryButton, { backgroundColor: '#208AEF' }]}>
          <Text style={styles.primaryButtonText}>Log In</Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: colors.backgroundElement }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or continue with</Text>
          <View style={[styles.divider, { backgroundColor: colors.backgroundElement }]} />
        </View>

        {/* Social Buttons */}
        <Pressable style={[styles.socialButton, { borderColor: colors.backgroundElement }]}>
          <Text style={[styles.socialButtonText, { color: colors.text }]}>🔍 Continue with Google</Text>
        </Pressable>

        <Pressable style={[styles.socialButton, { borderColor: colors.backgroundElement }]}>
          <Text style={[styles.socialButtonText, { color: colors.text }]}>🍎 Continue with Apple</Text>
        </Pressable>

        {/* Sign Up Link */}
        <View style={styles.signUpContainer}>
          <Text style={[styles.signUpText, { color: colors.textSecondary }]}>Don't have an account? </Text>
          <Pressable>
            <Text style={styles.signUpLink}>Sign Up</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.six,
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.six,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.three,
    borderRadius: 999,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: '#208AEF',
  },
  tabInactive: {
    backgroundColor: '#F0F0F3',
  },
  tabActiveText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#ffffff',
  },
  tabInactiveText: {
    fontSize: 16,
    fontWeight: '700',
  },
  formGroup: {
    marginBottom: Spacing.four,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: Spacing.two,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  inputIcon: {
    marginRight: Spacing.two,
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 0,
  },
  eyeIcon: {
    padding: Spacing.one,
    marginLeft: Spacing.two,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.four,
  },
  forgotPasswordText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#208AEF',
  },
  primaryButton: {
    paddingVertical: Spacing.four,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
    gap: Spacing.three,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '600',
  },
  socialButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.two,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.four,
  },
  signUpText: {
    fontSize: 14,
  },
  signUpLink: {
    fontSize: 14,
    fontWeight: '700',
    color: '#208AEF',
  },
});
