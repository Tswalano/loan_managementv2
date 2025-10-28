import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { BACKEND_API_URL } from '@/lib/utils/consts';
import { Balance, NewTransaction, Transaction, Loan, NewBalance } from '@/types';
import { generateReferenceNumber } from '@/lib/utils/formatters';
import useUserSession from './useUserSession';

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('authToken');
    if (!token) throw new Error('No authentication token found');
    return {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };
};

export function useBalanceOperations() {
    const { user } = useUserSession();
    const queryClient = useQueryClient();

    // ---------------------------
    // Queries
    // ---------------------------

    const {
        data: balances = [],
        isLoading: balancesLoading,
        error: balancesError,
        refetch: refetchBalances,
    } = useQuery<Balance[]>({
        queryKey: ['balances', user?.id],
        queryFn: async () => {
            if (!user) throw new Error('User not found');
            const res = await fetch(`${BACKEND_API_URL}/balances/${user.id}`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Failed to fetch balances');
            return res.json();
        },
        enabled: !!user,
    });

    const {
        data: transactions = [],
        isLoading: transactionsLoading,
        error: transactionsError,
        refetch: refetchTransactions,
    } = useQuery<Transaction[]>({
        queryKey: ['transactions', user?.id],
        queryFn: async () => {
            if (!user) throw new Error('User not found');
            const res = await fetch(`${BACKEND_API_URL}/transactions/${user.id}`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Failed to fetch transactions');
            return res.json();
        },
        enabled: !!user,
    });

    const {
        data: loans = [],
        isLoading: loansLoading,
        error: loansError,
        refetch: refetchLoans,
    } = useQuery<Loan[]>({
        queryKey: ['loans', user?.id],
        queryFn: async () => {
            if (!user) throw new Error('User not found');
            const res = await fetch(`${BACKEND_API_URL}/loans/${user.id}`, {
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Failed to fetch loans');
            return res.json();
        },
        enabled: !!user,
    });

    // ---------------------------
    // Mutations
    // ---------------------------

    const createBalance = useMutation({
        mutationFn: async (newBalance: NewBalance) => {
            const res = await fetch(`${BACKEND_API_URL}/balances`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...newBalance, userId: user?.id }),
            });
            if (!res.ok) throw new Error('Failed to create balance');
            return res.json();
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['balances', user?.id] }),
    });

    const recordTransaction = useMutation({
        mutationFn: async (newTransaction: Omit<NewTransaction, 'userId'>) => {
            const res = await fetch(`${BACKEND_API_URL}/transactions`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify({ ...newTransaction, userId: user?.id }),
            });
            if (!res.ok) throw new Error('Failed to record transaction');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['balances', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['transactionMetrics', user?.id] });
        },
    });

    const disburseLoan = useMutation({
        mutationFn: async ({
            amount,
            fromBalanceId,
            description,
        }: {
            amount: number;
            fromBalanceId: string;
            description?: string;
        }) => {
            const payload = {
                userId: user?.id,
                amount,
                fromBalanceId,
                description,
            };
            const res = await fetch(`${BACKEND_API_URL}/loans/disburse`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to disburse loan');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['balances', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['loans', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['transactionMetrics', user?.id] });
        },
    });

    const recordLoanPayment = useMutation({
        mutationFn: async ({
            amount,
            loanId,
            toBalanceId,
            description,
        }: {
            amount: number;
            loanId: string;
            toBalanceId: string;
            description?: string;
        }) => {
            const payload = {
                userId: user?.id,
                amount,
                loanId,
                toBalanceId,
                description,
            };
            const res = await fetch(`${BACKEND_API_URL}/loans/payment`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to record loan payment');
            return res.json();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['balances', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['loans', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['transactionMetrics', user?.id] });
        },
    });

    const deleteBalance = useMutation({
        mutationFn: async (balanceId: string) => {
            const res = await fetch(`${BACKEND_API_URL}/balances/${balanceId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!res.ok) throw new Error('Failed to delete balance');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['balances', user?.id] });
        },
    });

    // ---------------------------
    // Derived helpers
    // ---------------------------

    const recordExpense = useCallback(
        (tx: NewTransaction) => recordTransaction.mutateAsync({ ...tx, type: 'EXPENSE' }),
        [recordTransaction]
    );

    const recordIncome = useCallback(
        (tx: Omit<NewTransaction, 'type'>) =>
            recordTransaction.mutateAsync({ ...tx, type: 'INCOME' }),
        [recordTransaction]
    );

    const transferBetweenAccounts = useCallback(
        async ({
            amount,
            fromBalanceId,
            toBalanceId,
            description,
        }: {
            amount: number;
            fromBalanceId: string;
            toBalanceId: string;
            description?: string;
        }) => {
            const tx: NewTransaction = {
                amount: String(amount),
                type: 'TRANSFER',
                category: 'Transfer',
                description,
                reference: generateReferenceNumber('TRANSFER'),
                fromBalanceId,
                toBalanceId,
                date: new Date(),
            };
            return recordTransaction.mutateAsync(tx);
        },
        [recordTransaction]
    );

    // ---------------------------
    // Return combined hook API
    // ---------------------------

    return {
        balances,
        transactions,
        loans,
        isLoading: balancesLoading || transactionsLoading || loansLoading,
        error: balancesError || transactionsError || loansError,
        refetchBalances,
        refetchTransactions,
        refetchLoans,
        createBalance,
        recordTransaction,
        recordExpense,
        recordIncome,
        transferBetweenAccounts,
        disburseLoan,
        recordLoanPayment,
        deleteBalance,
    };
}

export default useBalanceOperations;