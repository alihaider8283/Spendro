import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { budgetRepository, Budget } from '@/services/budgetRepository';

/**
 * Hook to retrieve all active budgets
 */
export const useBudgets = () => {
  return useQuery<Budget[]>({
    queryKey: ['budgets'],
    queryFn: () => budgetRepository.getAll(),
  });
};

/**
 * Hook to create or update a budget
 */
export const useSaveBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (budget: Omit<Budget, 'syncStatus' | 'createdAt' | 'updatedAt'> & { id?: string }) =>
      budgetRepository.save(budget),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};

/**
 * Hook to delete a budget
 */
export const useDeleteBudget = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => budgetRepository.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
    },
  });
};
