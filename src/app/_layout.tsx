import { OnboardingScreen } from '@/components/onboarding-screen';
import { Colors } from '@/constants/theme';
import { getOnboardingComplete, setOnboardingComplete } from '@/services/onboardingService';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { DarkTheme, DefaultTheme, Redirect, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

enableScreens();

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const primaryColor = '#208AEF';

  const { isAuthenticated, initializeAuth } = useAuthStore();
  const { loadSettings } = useSettingsStore();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  // Initialize auth and settings state
  useEffect(() => {
    void initializeAuth();
    void loadSettings();
  }, [loadSettings, initializeAuth]);

  // Load onboarding status
  useEffect(() => {
    let isMounted = true;

    async function loadOnboardingStatus() {
      try {
        const isComplete = await getOnboardingComplete();
        if (isMounted) {
          setHasCompletedOnboarding(isComplete);
        }
      } catch {
        if (isMounted) {
          setHasCompletedOnboarding(false);
        }
      }
    }

    void loadOnboardingStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOnboardingDone = useCallback(async () => {
    await setOnboardingComplete();
    setHasCompletedOnboarding(true);
  }, []);

  if (hasCompletedOnboarding === null) {
    return (
      <SafeAreaView
        style={[styles.loadingScreen, { backgroundColor: colors.background }]}
        edges={['bottom', 'left', 'right', 'top']}>
        <ActivityIndicator color={primaryColor} size="large" />
      </SafeAreaView>
    );
  }

  if (!hasCompletedOnboarding) {
    return (
      <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
        <OnboardingScreen onDone={handleOnboardingDone} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen
          name="expense/add"
          options={{
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
      {/* Redirect to tabs if authenticated */}
      {isAuthenticated && <Redirect href="/(tabs)" />}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
});

export function ErrorBoundary({ error }: ErrorBoundaryProps) {
  return (
    <SafeAreaView style={errorStyles.errorContainer}>
      <View style={errorStyles.errorContent}>
        <Text style={errorStyles.errorTitle}>Oops!</Text>
        <Text style={errorStyles.errorMessage}>Something went wrong.</Text>
        <Text style={errorStyles.errorDetails}>{error?.message}</Text>
      </View>
    </SafeAreaView>
  );
}

const errorStyles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  errorContent: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});