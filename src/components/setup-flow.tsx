import { useTheme } from '@/hooks/use-theme';
import { useSettingsStore } from '@/store/settingsStore';
import { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import BudgetSetup from './budget-setup';
import { Button } from './button';
import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

interface SetupFlowProps {
    onDone?: () => void | Promise<void>;
}

const CURRENCIES = [
    { code: 'USD', name: 'United States Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound Sterling', symbol: '£' },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { code: 'AUD', name: 'Australian Dollar', symbol: '$' },
    { code: 'PKR', name: 'Pakistan Rupee', symbol: '₨' },
];

export default function SetupFlow({ onDone }: SetupFlowProps) {
    const [query, setQuery] = useState('');
    const [selected, setSelected] = useState('USD');
    const [budgetAmount, setBudgetAmount] = useState('');
    const [stage, setStage] = useState<'currency' | 'budget'>('currency');

    const { setCurrency } = useSettingsStore();
    const theme = useTheme();

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return CURRENCIES;
        return CURRENCIES.filter((c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q));
    }, [query]);

    const renderCurrency = ({ item }: { item: typeof CURRENCIES[number] }) => {
        const isSelected = item.code === selected;
        return (
            <TouchableOpacity
                style={[
                    styles.currencyRow,
                    { borderColor: theme.backgroundSelected, backgroundColor: theme.backgroundElement },
                ]}
                onPress={() => setSelected(item.code)}>
                <View style={[styles.avatar, { backgroundColor: theme.backgroundSelected }]}>
                    <ThemedText type="smallBold" style={styles.symbol}>{item.symbol}</ThemedText>
                </View>
                <View style={styles.currencyText}>
                    <ThemedText type="subtitle" style={styles.code}>{item.code}</ThemedText>
                    <ThemedText type="small" style={styles.name}>{item.name}</ThemedText>
                </View>
                <View style={styles.spacer} />
                <ThemedText type="smallBold" style={[styles.check, { color: isSelected ? '#208AEF' : theme.text }]}>
                    {isSelected ? '✓' : ''}
                </ThemedText>
            </TouchableOpacity>
        );
    };

    const onContinue = async () => {
        // Save selected currency and go to budget stage
        setCurrency(selected);
        setStage('budget');
    };

    // note: budget save moved to BudgetSetup component

    return (
        <ThemedView style={styles.container} type="background">
            {stage === 'currency' ? (
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.flex}>
                    <View style={styles.header}>
                        <ThemedText type="title" style={styles.title}>Select Primary Currency</ThemedText>
                        <ThemedText type="small" style={styles.small}>Choose the default currency for your transactions and budget tracking.</ThemedText>
                    </View>

                    <View style={styles.searchWrap}>
                        <TextInput
                            placeholder="Search currencies..."
                            value={query}
                            onChangeText={setQuery}
                            style={[styles.searchInput,
                                { borderColor: theme.backgroundSelected, backgroundColor: theme.background },
                            ]}
                        />
                    </View>

                    <FlatList
                        data={filtered}
                        renderItem={renderCurrency}
                        keyExtractor={(i) => i.code}
                        style={styles.list}
                        contentContainerStyle={{ paddingBottom: 24 }}
                    />

                    <View style={[styles.bottomArea, { borderTopColor: theme.backgroundSelected }]}>
                        <Button title="Continue" onPress={onContinue} />
                        <ThemedText type="small" style={[styles.note, { color: theme.textSecondary }]}>You can change your primary currency later in Settings.</ThemedText>
                    </View>
                </KeyboardAvoidingView>
            ) : (
                <BudgetSetup
                    onDone={async() => {
                        if (onDone) await onDone();
                    }}
                />
            )}
        </ThemedView>
    );
}

    const styles = StyleSheet.create({
        container: { flex: 1, paddingTop: 20, },
        flex: { flex: 1, padding: 20 },
        header: { marginBottom: 12 },
        searchWrap: { marginVertical: 10 },
        searchInput: {
            borderWidth: 1,
            borderColor: '#E6E9EE',
            borderRadius: 12,
            paddingVertical: 12,
            paddingHorizontal: 16,
            backgroundColor: '#fff',
        },
        list: { marginTop: 8 },
        currencyRow: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 14,
            borderWidth: 1,
            borderColor: '#E6E9EE',
            borderRadius: 12,
            marginBottom: 12,
            backgroundColor: '#fff',
        },
        avatar: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: '#EAF2FF',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 10,
        },
        title: {
            fontSize: 28,
            lineHeight: 34,
        },
        small: {
            fontSize: 13,
            lineHeight: 18,
        },
        symbol: {
            fontSize: 16,
            lineHeight: 18,
        },
        code: {
            fontSize: 16,
            lineHeight: 20,
        },
        name: {
            fontSize: 12,
            lineHeight: 16,
        },
        check: {
            fontSize: 14,
        },
        currencyText: { flexDirection: 'column' },
        spacer: { width: 8 },
        bottomArea: {
            paddingVertical: 12,
            borderTopWidth: 1,
            borderColor: '#f0f0f0',
            backgroundColor: 'transparent',
        },
        input: {
            borderWidth: 1,
            borderColor: '#E0E0E0',
            padding: 12,
            borderRadius: 8,
            marginTop: 12,
        },
        note: { marginTop: 12, textAlign: 'center' },
    });
