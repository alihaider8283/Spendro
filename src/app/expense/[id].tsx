import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
    Alert,
    Image,
    Pressable,
    ScrollView,
    StyleSheet,
    useColorScheme,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { Colors, Spacing } from '@/constants/theme';
import { getCategoryByNameOrId, getCurrencySymbol } from '@/features/expenses/types';
import { Transaction } from '@/features/transactions/types';
import { useTheme } from '@/hooks/use-theme';
import { useDeleteTransaction } from '@/hooks/useTransactions';
import { transactionRepository } from '@/services/transactionRepository';

export default function TransactionDetailScreen() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const router = useRouter();
    const scheme = useColorScheme();
    const theme = useTheme();
    const colors = Colors[scheme === 'dark' ? 'dark' : 'light'];

    const [transaction, setTransaction] = useState<Transaction | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            loadTransaction(id);
        }
    }, [id]);

    const loadTransaction = async (transactionId: string) => {
        try {
            setLoading(true);
            const trans = await transactionRepository.getById(transactionId);
            setTransaction(trans || null);
        } catch (error) {
            console.error('Error loading transaction:', error);
            Alert.alert('Error', 'Failed to load transaction details');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTransaction = () => {
        Alert.alert('Delete Transaction', 'Are you sure you want to delete this transaction?', [
            { text: 'Cancel', onPress: () => { } },
            {
                text: 'Delete',
                onPress: async () => {
                    try {
                        if (transaction?.id) {
                            await deleteMutation.mutateAsync(transaction.id);
                            router.back();
                        }
                    } catch (error) {
                        console.error('Error deleting transaction:', error);
                        Alert.alert('Error', 'Failed to delete transaction');
                    }
                },
                style: 'destructive',
            },
        ]);
    };

    const deleteMutation = useDeleteTransaction();

    const handleEditTransaction = () => {
        if (transaction?.id) {
            router.push(`/expense/add?id=${transaction.id}`);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ThemedText>Loading...</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    if (!transaction) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
                <View style={styles.loadingContainer}>
                    <ThemedText>Transaction not found</ThemedText>
                </View>
            </SafeAreaView>
        );
    }

    const isExpense = transaction.type === 'expense';
    const category = getCategoryByNameOrId(transaction.category);
    const currencySymbol = getCurrencySymbol(transaction.currency);
    const amountSign = isExpense ? '-' : '+';

    const transDate = new Date(transaction.transactionDate);
    const formattedDate = transDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    const formattedTime = transDate.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
            {/* Header */}
            <View style={[styles.header, { borderBottomColor: colors.backgroundElement }]}>
                <Pressable onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={28} color={colors.text} />
                </Pressable>
                <ThemedText type="title" style={styles.headerTitle}>
                    Transaction Detail
                </ThemedText>
                <Pressable onPress={() => Alert.alert('More options')}>
                    <Ionicons name="ellipsis-vertical" size={24} color={colors.text} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                {/* Header Card with Amount */}
                <View style={[styles.amountCard, { backgroundColor: theme.primary}]}>
                    <ThemedText style={[styles.merchantName, { color: '#FFFFFF' }]}>
                        {transaction.merchant || transaction.title}
                    </ThemedText>

                    <View style={styles.amountContainer}>
                        <ThemedText style={[styles.amount, { color: '#FFFFFF' }]}>
                            {amountSign}
                            {currencySymbol}
                            {transaction.amount.toFixed(2)}
                        </ThemedText>
                    </View>

                    <View style={styles.amountCardBottom}>
                        <View style={styles.categoryBadge}>
                            <Ionicons name={category.icon} size={14} color="white" />
                            <ThemedText style={styles.categoryBadgeText}>{transaction.category}</ThemedText>
                        </View>
                        <ThemedText style={[styles.dateTime, { color: '#FFFFFF' }]}>
                            {formattedDate} · {formattedTime}
                        </ThemedText>
                    </View>
                </View>

                {/* Details Section */}
                <View style={[styles.detailsCard, {
                    backgroundColor: scheme === 'dark' ? colors.backgroundElement : '#FAFAFA',
                    borderColor: scheme === 'dark' ? '#333333' : '#F0F0F0',
                }]}>
                    {/* Payment Method */}
                    <View style={[styles.detailRow, { borderBottomColor: scheme === 'dark' ? '#333333' : '#EEEEEE' }]}>
                        <View style={styles.detailLabel}>
                            <View style={[styles.iconBackground, { backgroundColor: scheme === 'dark' ? '#2A2A2A' : '#F0F0F0' }]}>
                                <Ionicons name="card" size={18} color="#999999" />
                            </View>
                            <ThemedText style={styles.label}>Payment Method</ThemedText>
                        </View>
                        <ThemedText style={styles.detailValue}>{transaction.method || 'Not specified'}</ThemedText>
                    </View>

                    {/* Category */}
                    <View style={[styles.detailRow, { borderBottomColor: scheme === 'dark' ? '#333333' : '#EEEEEE' }]}>
                        <View style={styles.detailLabel}>
                            <View style={[styles.iconBackground, { backgroundColor: scheme === 'dark' ? '#2A2A2A' : '#F0F0F0' }]}>
                                <Ionicons name="pricetag" size={18} color="#999999" />
                            </View>
                            <ThemedText style={styles.label}>Category</ThemedText>
                        </View>
                        <ThemedText style={[styles.detailValue, { color: '#1E88E5' }]}>
                            {transaction.category}
                        </ThemedText>
                    </View>

                    {/* Note */}
                    <View style={styles.detailRow}>
                        <View style={styles.detailLabel}>
                            <View style={[styles.iconBackground, { backgroundColor: scheme === 'dark' ? '#2A2A2A' : '#F0F0F0' }]}>
                                <Ionicons name="document-text" size={18} color="#999999" />
                            </View>
                            <ThemedText style={styles.label}>Note</ThemedText>
                        </View>
                        <ThemedText style={styles.detailValue}>{transaction.description || 'No note'}</ThemedText>
                    </View>
                </View>

                {/* Receipt Section */}
                {transaction.receiptUrl && (
                    <View style={styles.receiptSection}>
                        <View style={styles.receiptHeader}>
                            <ThemedText type="subtitle">Receipt</ThemedText>
                            {/* AI Scanned badge disabled for current phase
                            <View style={styles.aiScannedBadge}>
                                <Ionicons name="sparkles" size={12} color="#1E88E5" />
                                <ThemedText style={styles.aiScannedText}>AI Scanned</ThemedText>
                            </View>
                            */}
                        </View>

                        <Image
                            source={{ uri: transaction.receiptUrl }}
                            style={styles.receiptImage}
                            resizeMode="cover"
                        />

                        <View style={styles.receiptButtonContainer}>
                            <Pressable
                                style={[styles.receiptButton, {
                                    borderColor: scheme === 'dark' ? '#444444' : '#E0E0E0',
                                    backgroundColor: scheme === 'dark' ? '#1F1F1F' : '#F5F5F5',
                                }]}
                            >
                                <Ionicons name="document-text-outline" size={18} color={colors.text} />
                                <ThemedText style={[styles.receiptButtonText, { color: colors.text }]}>View Full</ThemedText>
                            </Pressable>
                            <Pressable style={[styles.replaceImageButton, { backgroundColor: '#1E88E5' }]}>
                                <Ionicons name="camera" size={18} color="white" />
                                <ThemedText style={styles.replaceImageButtonText}>Replace Image</ThemedText>
                            </Pressable>
                        </View>
                    </View>
                )}

                {/* Delete Button */}
                <Pressable style={styles.deleteButton} onPress={handleDeleteTransaction}>
                    <Ionicons name="trash" size={18} color="#EF4444" />
                    <ThemedText style={styles.deleteButtonText}>Delete Transaction</ThemedText>
                </Pressable>

                {/* Edit Button */}
                <Pressable style={styles.editButton} onPress={handleEditTransaction}>
                    <Ionicons name="pencil" size={18} color="white" />
                    <ThemedText style={styles.editButtonText}>Edit Transaction</ThemedText>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.three,  // 16
        paddingVertical: Spacing.three,    // 16
        borderBottomWidth: 0,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollContent: {
        paddingHorizontal: Spacing.three,  // 16
        paddingVertical: Spacing.four,     // 24
        gap: Spacing.four,                 // 24
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },

    // Amount Card
    amountCard: {
        borderRadius: 16,
        padding: Spacing.four,             // 24
        gap: Spacing.three,                // 16
        marginTop: Spacing.two,            // 8
    },
    merchantName: {
        fontSize: 16,
        fontWeight: '600',
    },
    amountContainer: {
        alignItems: 'flex-start',
    },
    amount: {
        fontSize: 36,
        fontWeight: 'bold',
        paddingVertical: Spacing.two,       // 8
    },
    amountCardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: Spacing.one,            // 4
    },
    categoryBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: Spacing.three,  // 16
        paddingVertical: Spacing.two,      // 8
        borderRadius: 16,
        gap: Spacing.one,                  // 4
    },
    categoryBadgeText: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500',
    },
    dateTime: {
        fontSize: 12,
    },

    // Details Section
    detailsCard: {
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0F0F0',
        backgroundColor: '#FAFAFA',
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.three,    // 16
        paddingHorizontal: Spacing.three,  // 16
        borderBottomWidth: 1,
    },
    detailLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.two,                  // 8
        flex: 1,
    },
    iconBackground: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
    },
    label: {
        fontSize: 14,
        color: '#999999',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        textAlign: 'right',
        flex: 1,
    },

    // Receipt Section
    receiptSection: {
        gap: Spacing.three,                // 16
        marginTop: Spacing.two,            // 8
    },
    receiptHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    aiScannedBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.one,                  // 4
    },
    aiScannedText: {
        fontSize: 12,
        color: '#1E88E5',
        fontWeight: '500',
    },
    receiptImage: {
        width: '100%',
        height: 200,
        borderRadius: 12,
        overflow: 'hidden',
    },
    receiptButtonContainer: {
        flexDirection: 'row',
        gap: Spacing.three,                // 16
    },
    receiptButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.three,    // 16
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        gap: Spacing.two,                  // 8
        backgroundColor: '#F5F5F5',
    },
    receiptButtonText: {
        fontSize: 14,
        fontWeight: '500',
    },
    replaceImageButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.three,    // 16
        borderRadius: 8,
        gap: Spacing.two,                  // 8
        backgroundColor: '#1E88E5',
    },
    replaceImageButtonText: {
        fontSize: 14,
        fontWeight: '500',
        color: 'white',
    },

    // Action Buttons
    deleteButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.three,    // 16
        borderRadius: 8,
        gap: Spacing.two,                  // 8
        backgroundColor: '#FFE5E5',
    },
    deleteButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#EF4444',
    },
    editButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: Spacing.three,    // 16
        borderRadius: 8,
        gap: Spacing.two,                  // 8
        marginBottom: Spacing.four,        // 24
        backgroundColor: '#1E88E5',
    },
    editButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: 'white',
    },
});