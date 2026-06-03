import { AuthTextInput } from '@/components/auth-text-input';
import { AuthToggle } from '@/components/auth-toggle';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, useColorScheme } from 'react-native';
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

    const handleLogin = async () => {
        try {
            setError('');
            if (!email || !password) {
                setError('Please fill in all fields');
                return;
            }
            await login(email, password);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Login failed');
        }
    };

    const handleSignup = async () => {
        try {
            setError('');
            if (!fullName || !email || !password) {
                setError('Please fill in all fields');
                return;
            }
            if (!agreeToTerms) {
                setError('Please agree to terms and conditions');
                return;
            }
            await signup(email, password, fullName);
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
                <AuthToggle activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />

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
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <AuthTextInput
                            label="Password"
                            iconName="lock-closed-outline"
                            placeholder="Enter password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            showPasswordToggle
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                        />

                        {/* Forgot Password */}
                        <Pressable style={styles.forgotPasswordContainer}>
                            <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
                        </Pressable>

                        {/* Login Button */}
                        <Pressable
                            style={[styles.primaryButton, { backgroundColor: isLoading ? '#A0A0A0' : '#208AEF' }]}
                            onPress={handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <ThemedText style={styles.primaryButtonText}>Log In</ThemedText>
                            )}
                        </Pressable>
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
                            onChangeText={setFullName}
                            autoCapitalize="words"
                        />

                        <AuthTextInput
                            label="Email"
                            iconName="mail-outline"
                            placeholder="you@email.com"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <AuthTextInput
                            label="Password"
                            iconName="lock-closed-outline"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPassword}
                            showPasswordToggle
                            showPassword={showPassword}
                            onTogglePassword={() => setShowPassword(!showPassword)}
                            helperText="Must be at least 8 characters"
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
                        <Pressable
                            style={[styles.primaryButton, { backgroundColor: isLoading ? '#A0A0A0' : '#208AEF' }]}
                            onPress={handleSignup}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <ThemedText style={styles.primaryButtonText}>Sign Up</ThemedText>
                            )}
                        </Pressable>
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
                <Pressable style={[styles.socialButton, { borderColor: colors.backgroundElement }]}>
                    <ThemedText type="small">🔍 Continue with Google</ThemedText>
                </Pressable>

                <Pressable style={[styles.socialButton, { borderColor: colors.backgroundElement }]}>
                    <ThemedText type="small">🍎 Continue with Apple</ThemedText>
                </Pressable>
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
