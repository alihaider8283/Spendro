import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

export default function SignUpScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.headerContainer}>
          <View style={[styles.logo, { backgroundColor: '#208AEF' }]}>
            <Ionicons name="star" size={48} color="#ffffff" />
          </View>
          <Text style={[styles.appTitle, { color: colors.text }]}>SpendSmart</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Start tracking smarter with SpendSmart</Text>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <Pressable style={[styles.tab, styles.tabInactive]}>
            <Text style={[styles.tabInactiveText, { color: colors.text }]}>Log In</Text>
          </Pressable>
          <Pressable style={[styles.tab, styles.tabActive]}>
            <Text style={styles.tabActiveText}>Sign Up</Text>
          </Pressable>
        </View>

        {/* Full Name Field */}
        <View style={styles.formGroup}>
          <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
          <View style={[styles.inputContainer, { borderColor: colors.backgroundElement }]}>
            <Ionicons name="person-outline" size={20} color={colors.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="John Doe"
              placeholderTextColor={colors.textSecondary}
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          </View>
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
              placeholder="Create a password"
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
          <Text style={[styles.helperText, { color: colors.textSecondary }]}>Must be at least 8 characters</Text>
        </View>

        {/* Terms Checkbox */}
        <View style={styles.checkboxContainer}>
          <Pressable
            onPress={() => setAgreeToTerms(!agreeToTerms)}
            style={[styles.checkbox, { backgroundColor: agreeToTerms ? '#208AEF' : colors.backgroundElement }]}>
            {agreeToTerms && <Ionicons name="checkmark" size={14} color="#ffffff" />}
          </Pressable>
          <Text style={[styles.checkboxLabel, { color: colors.textSecondary }]}>I agree to the </Text>
          <Pressable>
            <Text style={styles.termsLink}>Terms of ServiceandPrivacy Policy</Text>
          </Pressable>
        </View>

        {/* Create Account Button */}
        <Pressable style={[styles.primaryButton, { backgroundColor: '#208AEF' }]}>
          <Text style={styles.primaryButtonText}>Create Account</Text>
        </Pressable>

        {/* Divider */}
        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: colors.backgroundElement }]} />
          <Text style={[styles.dividerText, { color: colors.textSecondary }]}>or continue with</Text>
          <View style={[styles.divider, { backgroundColor: colors.backgroundElement }]} />
        </View>

        {/* Social Buttons */}
        <View style={styles.socialButtonsRow}>
          <Pressable style={[styles.socialButton, styles.socialButtonHalf, { borderColor: colors.backgroundElement }]}>
            <Text style={[styles.socialButtonText, { color: colors.text }]}>Google</Text>
          </Pressable>
          <Pressable style={[styles.socialButton, styles.socialButtonHalf, { borderColor: colors.backgroundElement }]}>
            <Text style={[styles.socialButtonText, { color: colors.text }]}>🍎 Apple</Text>
          </Pressable>
        </View>

        {/* Bottom Tabs Navigation Preview */}
        <View style={[styles.tabsPreview, { borderTopColor: colors.backgroundElement }]}>
          <View style={styles.tabIcon}>
            <Ionicons name="home-outline" size={24} color="#208AEF" />
            <Text style={[styles.tabIconLabel, { color: '#208AEF' }]}>Home</Text>
          </View>
          <View style={styles.tabIcon}>
            <Ionicons name="camera-outline" size={24} color={colors.textSecondary} />
            <Text style={[styles.tabIconLabel, { color: colors.textSecondary }]}>Scan</Text>
          </View>
          <View style={styles.tabIcon}>
            <Ionicons name="bar-chart-outline" size={24} color={colors.textSecondary} />
            <Text style={[styles.tabIconLabel, { color: colors.textSecondary }]}>Analytics</Text>
          </View>
          <View style={styles.tabIcon}>
            <Ionicons name="wallet-outline" size={24} color={colors.textSecondary} />
            <Text style={[styles.tabIconLabel, { color: colors.textSecondary }]}>Budget</Text>
          </View>
          <View style={styles.tabIcon}>
            <Ionicons name="settings-outline" size={24} color={colors.textSecondary} />
            <Text style={[styles.tabIconLabel, { color: colors.textSecondary }]}>Settings</Text>
          </View>
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
    paddingBottom: Spacing.six,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.five,
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
    textAlign: 'center',
  },
  tabsContainer: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.five,
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
  helperText: {
    fontSize: 12,
    marginTop: Spacing.one,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    marginRight: Spacing.two,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxLabel: {
    fontSize: 13,
  },
  termsLink: {
    fontSize: 13,
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
  socialButtonsRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.six,
  },
  socialButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialButtonHalf: {
    flex: 1,
  },
  socialButtonText: {
    fontSize: 15,
    fontWeight: '700',
  },
  tabsPreview: {
    borderTopWidth: 1,
    paddingTop: Spacing.three,
    marginTop: Spacing.four,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabIcon: {
    alignItems: 'center',
    gap: Spacing.one,
  },
  tabIconLabel: {
    fontSize: 11,
    fontWeight: '600',
  },
});
