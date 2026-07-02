import { Colors, Spacing } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { TabList, Tabs, TabSlot, TabTrigger, type TabTriggerSlotProps } from 'expo-router/ui';
import { type ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';
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
        <Ionicons name={isFocused ? (icon.replace('-outline', '') as TabIconName) : icon} size={25} color={color} />
        <Text style={[styles.tabLabel, { color, fontWeight: isFocused ? '600' : '400' }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

export default function TabsLayout() {
  const scheme = useColorScheme();
  const theme = scheme === 'dark' ? 'dark' : 'light';
  const colors = Colors[theme];
  const primaryColor = colors.primary;
  const inactiveTabColor = '#73717D';

  return (
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
          <TabTrigger name="transactions" href="/transactions" asChild>
            <TabBarItem
              icon="receipt-outline"
              label="Transactions"
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
  );
}

const styles = StyleSheet.create({
  tabSlot: {
    flex: 1,
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
  },
});
