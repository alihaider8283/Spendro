import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { transactionRepository } from '@/services/transactionRepository';
import type { Transaction } from '@/features/transactions/types';

/**
 * Hook to retrieve all active transactions.
 * Returns the richer UI Transaction type (with computed `title`, `currency`, `merchant`
 * fields added by the repository at runtime via `.map()`).
 */
export const useTransactions = () => {
  return useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: () => transactionRepository.getAll() as Promise<Transaction[]>,
  });
};

/**
 * Hook to add a new transaction
 */
export const useAddTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tx: Omit<Transaction, 'id' | 'syncStatus' | 'createdAt' | 'updatedAt'>) =>
      transactionRepository.create(tx),
    onSuccess: () => {
      // Invalidate both transactions list and statistics queries to trigger UI refresh
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

/**
 * Hook to update an existing transaction
 */
export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'syncStatus'>>;
    }) => transactionRepository.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

/**
 * Hook to delete a transaction
 */
export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => transactionRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['stats'] });
    },
  });
};

/**
 * Hook to retrieve all pre-calculated monthly stats records
 */
export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: () => transactionRepository.getStats(),
  });
};
