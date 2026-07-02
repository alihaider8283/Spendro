import { OnboardingScreen } from '@/components/onboarding-screen';
import SetupFlow from '@/components/setup-flow';
import { Colors } from '@/constants/theme';
import { initDb } from '@/services/dbService';
import { getFirstTimeSetupComplete, getOnboardingComplete, setFirstTimeSetupComplete, setOnboardingComplete } from '@/services/onboardingService';
import { initializeSyncEngine } from '@/services/syncEngine';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import * as Clarity from '@microsoft/react-native-clarity';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, DefaultTheme, Redirect, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';

enableScreens(true);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});


if (!__DEV__) {
  Clarity.initialize('x4bzw27rao', {
    logLevel: Clarity.LogLevel.Verbose, // Note: Use "LogLevel.Verbose" value while testing to debug initialization issues.
  });
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const primaryColor = colors.primary;

  useEffect(() => {
    setStatusBarStyle(scheme === 'dark' ? 'light' : 'dark', true);
  }, [scheme]);

  const { isAuthenticated, initializeAuth } = useAuthStore();
  const { loadSettings } = useSettingsStore();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);
  const [hasCompletedFirstTimeSetup, setHasCompletedFirstTimeSetup] = useState<boolean | null>(null);

  // Initialize SQLite database and sync engine
  useEffect(() => {
    let cleanupSync: (() => void) | null = null;

    async function bootstrap() {
      try {
        await initDb();
        cleanupSync = initializeSyncEngine();
      } catch (err) {
        console.error('Failed to bootstrap offline-first database:', err);
      }
    }

    bootstrap();

    return () => {
      if (cleanupSync) {
        cleanupSync();
      }
    };
  }, []);



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

  // Load first-time setup status after onboarding
  useEffect(() => {
    let isMounted = true;

    async function loadFirstTimeSetup() {
      try {
        if (!hasCompletedOnboarding) return;
        const isComplete = await getFirstTimeSetupComplete();
        if (isMounted) {
          setHasCompletedFirstTimeSetup(isComplete);
        }
      } catch {
        if (isMounted) {
          setHasCompletedFirstTimeSetup(false);
        }
      }
    }

    void loadFirstTimeSetup();

    return () => {
      isMounted = false;
    };
  }, [hasCompletedOnboarding]);

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
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <OnboardingScreen onDone={handleOnboardingDone} />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  if (hasCompletedFirstTimeSetup === null) {
    return (
      <SafeAreaView
        style={[styles.loadingScreen, { backgroundColor: colors.background }]}
        edges={['bottom', 'left', 'right', 'top']}>
        <ActivityIndicator color={primaryColor} size="large" />
      </SafeAreaView>
    );
  }

  if (!hasCompletedFirstTimeSetup) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
          <SetupFlow
            onDone={async () => {
              await setFirstTimeSetupComplete();
              setHasCompletedFirstTimeSetup(true);
            }}
          />
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
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