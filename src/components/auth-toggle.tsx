import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';
import { Pressable, StyleSheet } from 'react-native';

interface AuthToggleProps {
    activeTab: 'login' | 'signup';
    onTabChange: (tab: 'login' | 'signup') => void;
}

export function AuthToggle({ activeTab, onTabChange }: AuthToggleProps) {
    const theme = useTheme();
    return (
        <ThemedView style={styles.tabsContainer}>
            <Pressable
                style={[styles.tab, activeTab === 'login' && { borderBottomColor: theme.primary }]}
                onPress={() => onTabChange('login')}
            >
                <ThemedText
                    type={activeTab === 'login' ? 'smallBold' : 'small'}
                    themeColor={activeTab === 'login' ? 'textSecondary' : 'text'}
                    style={[activeTab === 'login' && { color: theme.primary }]}
                >
                    Log In
                </ThemedText>
            </Pressable>
            <Pressable
                style={[styles.tab, activeTab === 'signup' && { borderBottomColor: theme.primary }]}
                onPress={() => onTabChange('signup')}
            >
                <ThemedText
                    type={activeTab === 'signup' ? 'smallBold' : 'small'}
                    themeColor={activeTab === 'signup' ? 'textSecondary' : 'text'}
                    style={[activeTab === 'signup' && { color: theme.primary }]}
                >
                    Sign Up
                </ThemedText>
            </Pressable>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    tabsContainer: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        marginBottom: 24,
        gap: 12,
    },
    tab: {
        flex: 1,
        paddingVertical: 12,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
        alignItems: 'center',
    },
});
