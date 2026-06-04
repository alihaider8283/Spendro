import { AuthTextInput } from '@/components/auth-text-input';
import { AuthToggle } from '@/components/auth-toggle';
import { Button } from '@/components/button';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { validateEmail, validatePassword } from '@/utils/validation';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useColorScheme } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AuthScreen() {
    const scheme = useColorScheme();
    const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];
    const { login, signup, isLoading } = useAuthStore();

    const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeToTerms, setAgreeToTerms] = useState(false);
    const [error, setError] = useState('');

    // Field-specific validation errors
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [fullNameError, setFullNameError] = useState('');

    const handleTabChange = (tab: 'login' | 'signup') => {
        setActiveTab(tab);
        setEmailError('');
        setPasswordError('');
        setFullNameError('');
        setError('');
    };

    const handleLogin = async () => {
        try {
            setError('');
            setEmailError('');
            setPasswordError('');

            let hasError = false;

            if (!email.trim()) {
                setEmailError('Email is required');
                hasError = true;
            } else if (!validateEmail(email)) {
                setEmailError('Please enter a valid email address');
                hasError = true;
            }

            if (!password) {
                setPasswordError('Password is required');
                hasError = true;
            }

            if (hasError) {
                return;
            }

            await login(email.trim(), password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };

    const handleSignup = async () => {
        try {
            setError('');
            setFullNameError('');
            setEmailError('');
            setPasswordError('');

            let hasError = false;

            if (!fullName.trim()) {
                setFullNameError('Full name is required');
                hasError = true;
            } else if (fullName.trim().length < 2) {
                setFullNameError('Name must be at least 2 characters');
                hasError = true;
            }

            if (!email.trim()) {
                setEmailError('Email is required');
                hasError = true;
            } else if (!validateEmail(email)) {
                setEmailError('Please enter a valid email address');
                hasError = true;
            }

            if (!password) {
                setPasswordError('Password is required');
                hasError = true;
            } else if (!validatePassword(password)) {
                setPasswordError('Password must be at least 8 characters');
                hasError = true;
            }

            if (!agreeToTerms) {
                setError('Please agree to terms and conditions');
                hasError = true;
            }

            if (hasError) {
                return;
            }

            await signup(email.trim(), password, fullName.trim());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Signup failed');
        }
    };

    return (
        <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top', 'left', 'right']}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                {/* Header */}
                <ThemedView style={styles.headerContainer}>
                    <ThemedView style={[styles.logo, { backgroundColor: '#208AEF' }]}>
                        <Ionicons name="star" size={48} color="#ffffff" />
                    </ThemedView>
                    <ThemedText type="title" style={styles.appTitle}>
                        Spendro
                    </ThemedText>
                    <ThemedText type="small" themeColor="textSecondary">
                        {activeTab === 'login' ? 'Smart Expense Tracker AI' : 'Start tracking smarter with Spendro'}
                    </ThemedText>
                </ThemedView>

                {/* Toggle Tabs */}
                <AuthToggle activeTab={activeTab} onTabChange={handleTabChange} />

                {/* Error Message */}
                {error ? (
                    <ThemedView style={[styles.errorContainer, { backgroundColor: colors.backgroundElement }]}>
                        <ThemedText style={[styles.errorText, { color: '#EF4444' }]}>
                            {error}
                        </ThemedText>
                    </ThemedView>
                ) : null}

                {/* Login Form */}
                {activeTab === 'login' && (
                    <>
                        <AuthTextInput
                            label="Email"
                            iconName="mail-outline"
                            placeholder="you@email.com"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (emailError) setEmailError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={emailError}
                        />

                        <AuthTextInput
                            label="Password"
                            iconName="lock-closed-outline"
                            placeholder="Enter password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) setPasswordError('');
                            }}
                            secureTextEntry={!showPassword}
                            showPasswordToggle
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                            error={passwordError}
                        />

                        {/* Forgot Password */}
                        <Pressable style={styles.forgotPasswordContainer}>
                            <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
                        </Pressable>

                        {/* Login Button */}
                        <Button
                            title="Log In"
                            onPress={handleLogin}
                            isLoading={isLoading}
                            style={{ marginBottom: 24 }}
                        />
                    </>
                )}

                {/* Signup Form */}
                {activeTab === 'signup' && (
                    <>
                        <AuthTextInput
                            label="Full Name"
                            iconName="person-outline"
                            placeholder="John Doe"
                            value={fullName}
                            onChangeText={(text) => {
                                setFullName(text);
                                if (fullNameError) setFullNameError('');
                            }}
                            autoCapitalize="words"
                            error={fullNameError}
                        />

                        <AuthTextInput
                            label="Email"
                            iconName="mail-outline"
                            placeholder="you@email.com"
                            value={email}
                            onChangeText={(text) => {
                                setEmail(text);
                                if (emailError) setEmailError('');
                            }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            error={emailError}
                        />

                        <AuthTextInput
                            label="Password"
                            iconName="lock-closed-outline"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={(text) => {
                                setPassword(text);
                                if (passwordError) setPasswordError('');
                            }}
                            secureTextEntry={!showPassword}
                            showPasswordToggle
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                            helperText="Must be at least 8 characters"
                            error={passwordError}
                        />

                        {/* Terms Checkbox */}
                        <ThemedView style={styles.checkboxContainer}>
                            <Pressable
                                onPress={() => setAgreeToTerms(!agreeToTerms)}
                                style={[
                                    styles.checkbox,
                                    { backgroundColor: agreeToTerms ? '#208AEF' : colors.backgroundElement },
                                ]}
                            >
                                {agreeToTerms && <Ionicons name="checkmark" size={16} color="#fff" />}
                            </Pressable>
                            <ThemedText type="small">
                                I agree to the{' '}
                                <ThemedText type="smallBold" style={styles.link}>
                                    Terms & Conditions
                                </ThemedText>
                            </ThemedText>
                        </ThemedView>

                        {/* Signup Button */}
                        <Button
                            title="Sign Up"
                            onPress={handleSignup}
                            isLoading={isLoading}
                            style={{ marginBottom: 24 }}
                        />
                    </>
                )}

                {/* Divider */}
                <ThemedView style={styles.dividerContainer}>
                    <ThemedView style={[styles.divider, { backgroundColor: colors.backgroundElement }]} />
                    <ThemedText type="small" themeColor="textSecondary" style={styles.dividerText}>
                        or continue with
                    </ThemedText>
                    <ThemedView style={[styles.divider, { backgroundColor: colors.backgroundElement }]} />
                </ThemedView>

                {/* Social Buttons */}
                <Button
                    title="🔍 Continue with Google"
                    variant="outline"
                    style={{ marginBottom: 12 }}
                />

                <Button
                    title="🍎 Continue with Apple"
                    variant="outline"
                    style={{ marginBottom: 12 }}
                />
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
        paddingTop: Spacing.four,
        paddingBottom: Spacing.six,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: 32,
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    appTitle: {
        marginBottom: 8,
    },
    errorContainer: {
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    errorText: {
        fontSize: 14,
        fontWeight: '500',
    },
    forgotPasswordContainer: {
        marginBottom: 24,
    },
    forgotPasswordText: {
        color: '#208AEF',
        fontSize: 14,
        fontWeight: '500',
    },
    primaryButton: {
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
        gap: 12,
    },
    divider: {
        flex: 1,
        height: 1,
    },
    dividerText: {
        fontWeight: '500',
    },
    socialButton: {
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        alignItems: 'center',
        marginBottom: 12,
    },
    checkboxContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
        gap: 8,
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    link: {
        color: '#208AEF',
    },
});
