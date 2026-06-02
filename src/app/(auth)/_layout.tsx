import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { useColorScheme } from 'react-native';

export default function AuthLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animationEnabled: true,
        }}
      >
        <Stack.Screen name="login" />
        <Stack.Screen name="signup" />
      </Stack>
    </ThemeProvider>
  );
}
