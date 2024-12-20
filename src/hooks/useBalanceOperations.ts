// src/hooks/useBalanceOperations.ts
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Balance, NewTransaction, Transaction, Loan, NewBalance } from "@/types";
import { generateReferenceNumber } from "../lib/utils/formatters";

export function useBalanceOperations() {
    const [balances, setBalances] = useState<Balance[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loans, setLoans] = useState<Loan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const createBalance = async (newBalance: NewBalance): Promise<Balance> => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('balances')
                .insert(newBalance)
                .select()
                .single();

            if (error) throw error;
            await fetchBalances(); // Refresh balances after creating new one
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error creating balance:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const fetchBalances = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data, error } = await supabase
                .from('balances')
                .select('*')
                .eq('userId', user.id)
                .eq('accountStatus', 'ACTIVE')
                .order('type');

            if (error) throw error;
            setBalances(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching balances:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTransactions = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .eq('userId', user.id)
                .order('date', { ascending: false });

            if (error) throw error;
            setTransactions(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching transactions:', err);
        } finally {
            setLoading(false);
        }
    };

    // New function to fetch loans
    const fetchLoans = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const { data, error } = await supabase
                .from('loans')
                .select(`
                        *,

                        balance:balances!inner(*),
                        transactions!loanId(*)
                    `)
                .eq('userId', user.id)
                .order('createdAt', { ascending: false });

            console.log('Fetched loans:', data);


            if (error) throw error;
            setLoans(data || []);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error fetching loans:', err);
        } finally {
            setLoading(false);
        }
    };

    // Function to disburse a new loan
    const disburseLoan = async ({
        amount,
        fromBalanceId,
        description
    }: {
        amount: number;
        fromBalanceId: string;
        description?: string;
    }) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const newTransaction: Omit<NewTransaction, 'userId'> = {
                amount: String(amount),
                type: 'LOAN_DISBURSEMENT',
                category: 'Loan Disbursement',
                description: description || `Loan disbursement`,
                reference: generateReferenceNumber('LOAN_DISBURSEMENT'),
                fromBalanceId,
                date: new Date(),
                isLoanDisbursement: true,
            };

            const { data, error } = await supabase
                .from('transactions')
                .insert({ ...newTransaction, userId: user.id })
                .select()
                .single();

            if (error) throw error;

            // Refresh all related data
            await Promise.all([fetchBalances(), fetchTransactions(), fetchLoans()]);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error disbursing loan:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Function to make a loan payment
    const recordLoanPayment = async ({
        amount,
        loanId,
        toBalanceId,
        description
    }: {
        amount: number;
        loanId: string;
        toBalanceId: string;
        description?: string;
    }) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            // First, verify the loan exists and get its details
            const { data: loan, error: loanError } = await supabase
                .from('loans')
                .select('*')
                .eq('id', loanId)
                .single();

            if (loanError) throw loanError;
            if (!loan) throw new Error('Loan not found');

            const newTransaction: Omit<NewTransaction, 'userId'> = {
                amount: String(amount),
                type: 'LOAN_PAYMENT',
                category: 'Loan Payment',
                description: description || `Loan payment for ${loan.borrowerName}`,
                reference: generateReferenceNumber('LOAN_PAYMENT'),
                toBalanceId,
                loanId,
                date: new Date(),
                isLoanPayment: true
            };

            const { data, error } = await supabase
                .from('transactions')
                .insert({ ...newTransaction, userId: user.id })
                .select()
                .single();

            if (error) throw error;

            // Refresh all related data
            await Promise.all([fetchBalances(), fetchTransactions(), fetchLoans()]);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error recording loan payment:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const recordTransaction = async (newTransaction: Omit<NewTransaction, 'userId'>) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            console.log("Creating transaction:", newTransaction);


            const { data, error } = await supabase
                .from('transactions')
                .insert({ ...newTransaction, userId: user.id })
                .select()
                .single();

            if (error) throw error;
            // Refresh both balances and transactions after recording transaction
            await Promise.all([fetchBalances(), fetchTransactions()]);
            return data;
        } catch (err) {
            if (err instanceof Error) {
                // Standard Error handling
                setError(err.message);
                console.error('Error recording transaction:', err.message);
            } else if (typeof err === 'object' && err !== null && 'code' in err && 'message' in err) {
                // Handle custom error type (e.g., API errors)
                const customError = err as { code: string; message: string };
                setError(customError.message);
                console.error(`Custom error [${customError.code}]:`, customError.message);
            } else {
                // Handle unknown error types
                setError('An unknown error occurred');
                console.error('Unknown error recording transaction:', err);
            }
            throw err; // Rethrow the error for higher-level handling
        } finally {
            setLoading(false);
        }
    };

    const recordExpense = async (transaction: NewTransaction) => {
        return recordTransaction({
            ...transaction
        });
    };

    const recordIncome = async (transaction: Omit<NewTransaction, 'type'>) => {
        return recordTransaction({
            ...transaction,
            type: 'INCOME'
        });
    };

    const transferBetweenAccounts = async (transfer: {
        amount: number;
        fromBalanceId: string;
        toBalanceId: string;
        description?: string;
    }) => {
        try {
            setLoading(true);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const transferTransaction: NewTransaction = {
                amount: String(transfer.amount),
                type: 'EXPENSE',
                category: 'Transfer',
                description: transfer.description,
                reference: generateReferenceNumber('EXPENSE'),
                fromBalanceId: transfer.fromBalanceId,
                toBalanceId: transfer.toBalanceId,
                date: new Date()
            };

            const { data, error } = await supabase
                .from('transactions')
                .insert(transferTransaction)
                .select()
                .single();

            if (error) throw error;
            await Promise.all([fetchBalances(), fetchTransactions()]);
            return data;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error transferring between accounts:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // delete balance
    const deleteBalance = async (balanceId: string) => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');
            const { error } = await supabase
                .from('balances')
                .delete()
                .eq('id', balanceId);
            if (error) throw error;
            await Promise.all([fetchBalances(), fetchTransactions()]);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            console.error('Error deleting balance:', err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    // Initialize data on mount
    useEffect(() => {
        Promise.all([fetchBalances(), fetchTransactions(), fetchLoans()]);
    }, []);

    // Return all the existing functions plus the new ones
    return {
        balances,
        transactions,
        loans,
        loading,
        error,
        setError,
        deleteBalance,
        fetchBalances,
        fetchTransactions,
        fetchLoans,
        createBalance,
        recordExpense,
        recordIncome,
        setLoading,
        recordTransaction,
        transferBetweenAccounts,
        disburseLoan,
        recordLoanPayment,
    };
}
