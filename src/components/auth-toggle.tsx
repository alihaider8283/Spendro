import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Pressable, StyleSheet } from 'react-native';

interface AuthToggleProps {
    activeTab: 'login' | 'signup';
    onTabChange: (tab: 'login' | 'signup') => void;
}

export function AuthToggle({ activeTab, onTabChange }: AuthToggleProps) {
    return (
        <ThemedView style={styles.tabsContainer}>
            <Pressable
                style={[styles.tab, activeTab === 'login' && styles.tabActive]}
                onPress={() => onTabChange('login')}
            >
                <ThemedText
                    type={activeTab === 'login' ? 'smallBold' : 'small'}
                    themeColor={activeTab === 'login' ? 'textSecondary' : 'text'}
                    style={[activeTab === 'login' && { color: '#208AEF' }]}
                >
                    Log In
                </ThemedText>
            </Pressable>
            <Pressable
                style={[styles.tab, activeTab === 'signup' && styles.tabActive]}
                onPress={() => onTabChange('signup')}
            >
                <ThemedText
                    type={activeTab === 'signup' ? 'smallBold' : 'small'}
                    themeColor={activeTab === 'signup' ? 'textSecondary' : 'text'}
                    style={[activeTab === 'signup' && { color: '#208AEF' }]}
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
    tabActive: {
        borderBottomColor: '#208AEF',
    },
});
