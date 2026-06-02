import { OnboardingScreen } from '@/components/onboarding-screen';
import { Colors, Spacing } from '@/constants/theme';
import { getOnboardingComplete, setOnboardingComplete } from '@/services/onboardingService';
import { useAuthStore } from '@/store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider, type ErrorBoundaryProps } from 'expo-router';
import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { useCallback, useEffect, useState, type ComponentProps } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type TabIconName = ComponentProps<typeof Ionicons>['name'];

type TabBarItemProps = {
  icon: TabIconName;
  label: string;
  activeColor: string;
  inactiveColor: string;
};

function TabBarItem({
  icon,
  label,
  activeColor,
  inactiveColor,
  isFocused,
  ...props
}: TabBarItemProps & TabTriggerSlotProps) {
  const color = isFocused ? activeColor : inactiveColor;

  return (
    <Pressable {...props} style={styles.tabTrigger}>
      <View style={styles.tabItem}>
        <Ionicons name={icon} size={25} color={color} />
        <Text style={[styles.tabLabel, { color }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const primaryColor = '#208AEF';
  const inactiveTabColor = '#73717D';
  
  const { isAuthenticated, isLoading: authLoading, initializeAuth } = useAuthStore();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean | null>(null);

  // Initialize auth state
  useEffect(() => {
    void initializeAuth();
  }, [initializeAuth]);

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

  return (
    <ThemeProvider value={scheme === 'dark' ? DarkTheme : DefaultTheme}>
      {authLoading || hasCompletedOnboarding === null ? (
        <SafeAreaView
          style={[styles.loadingScreen, { backgroundColor: colors.background }]}
          edges={['bottom', 'left', 'right', 'top']}>
          <ActivityIndicator color={primaryColor} size="large" />
        </SafeAreaView>
      ) : !isAuthenticated ? (
        <Stack screenOptions={{ headerShown: false }} />
      ) : !hasCompletedOnboarding ? (
        <OnboardingScreen onDone={handleOnboardingDone} />
      ) : (
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['bottom']}>
          <Tabs>
            <TabSlot style={styles.tabSlot} />
            <TabList style={[styles.tabBar, { backgroundColor: colors.backgroundElement }]}>            
              <TabTrigger name="index" href="/" asChild>
                <TabBarItem
                  icon="home-outline"
                  label="Home"
                  activeColor={primaryColor}
                  inactiveColor={inactiveTabColor}
                />
              </TabTrigger>
              <TabTrigger name="scan" href="/scan" asChild>
                <TabBarItem
                  icon="camera-outline"
                  label="Scan"
                  activeColor={primaryColor}
                  inactiveColor={inactiveTabColor}
                />
              </TabTrigger>
              <TabTrigger name="analytics" href="/analytics" asChild>
                <TabBarItem
                  icon="bar-chart-outline"
                  label="Analytics"
                  activeColor={primaryColor}
                  inactiveColor={inactiveTabColor}
                />
              </TabTrigger>
              <TabTrigger name="budget" href="/budget" asChild>
                <TabBarItem
                  icon="alert-circle-outline"
                  label="Budget"
                  activeColor={primaryColor}
                  inactiveColor={inactiveTabColor}
                />
              </TabTrigger>
              <TabTrigger name="settings" href="/settings" asChild>
                <TabBarItem
                  icon="settings-outline"
                  label="Settings"
                  activeColor={primaryColor}
                  inactiveColor={inactiveTabColor}
                />
              </TabTrigger>
            </TabList>
          </Tabs>
        </SafeAreaView>
      )}
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  tabSlot: {
    flex: 1,
  },
  loadingScreen: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  tabBar: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Spacing.two,
    paddingBottom: Spacing.one,
    paddingHorizontal: Spacing.two,
  },
  tabTrigger: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.one,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    minHeight: 54,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '400',
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
