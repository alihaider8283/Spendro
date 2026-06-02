import { StyleSheet, Text, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Colors, Spacing } from '@/constants/theme';

export default function SettingsScreen() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}> 
      <View style={styles.container}>
        <Text style={[styles.title, { color: colors.text }]}>Settings</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>Update your preferences, notifications, and app settings here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.four,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: Spacing.two,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
})
