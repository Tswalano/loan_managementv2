import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { startOfMonth, endOfMonth, format } from 'date-fns';

interface TransactionData {
    month: string;
    income: number;
    expense: number;
    loanPayment: number;
    loanDisbursement: number;
    total: number;
}

interface LoanMetrics {
    totalActiveLoans: number;
    totalLoanAmount: number;
    totalInterest: number;
    totalRemainingBalance: number;
}

interface TypeBreakdown {
    type: string;
    amount: number;
    count: number;
}

export interface TransactionMetrics {
    monthlyData: TransactionData[];
    typeBreakdown: TypeBreakdown[];
    loanMetrics: LoanMetrics;
    loanTrends: {
        month: string;
        disbursements: number;
        payments: number;
        interest: number;
        activeLoans: number;
    }[];
}

export function useTransactionMetrics() {
    const [metrics, setMetrics] = useState<TransactionMetrics>({
        monthlyData: [],
        typeBreakdown: [],
        loanMetrics: {
            totalActiveLoans: 0,
            totalLoanAmount: 0,
            totalInterest: 0,
            totalRemainingBalance: 0
        },
        loanTrends: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchMetrics() {
            try {
                setLoading(true);
                
                // Get the date range for the last 6 months
                const endDate = endOfMonth(new Date());
                const startDate = startOfMonth(new Date(new Date().setMonth(endDate.getMonth() - 5)));

                // Fetch monthly transaction data
                const { data: monthlyTransactions, error: transactionError } = await supabase
                    .from('transactions')
                    .select('date, type, amount, isLoanPayment, isLoanDisbursement')
                    .gte('date', startDate.toISOString())
                    .lte('date', endDate.toISOString())
                    .order('date', { ascending: true });

                if (transactionError) throw transactionError;

                // Fetch active loans data
                const { data: activeLoans, error: loansError } = await supabase
                    .from('loans')
                    .select('*')
                    .eq('status', 'ACTIVE');

                if (loansError) throw loansError;

                // Fetch loan trends
                const { data: monthlyLoans, error: trendError } = await supabase
                    .from('loans')
                    .select('*')
                    .gte('createdAt', startDate.toISOString())
                    .order('createdAt', { ascending: true });

                if (trendError) throw trendError;

                // Process metrics
                const monthlyMetrics = processMonthlyData(monthlyTransactions);
                const typeBreakdown = processTypeBreakdown(monthlyTransactions);
                const loanMetrics = processLoanMetrics(activeLoans);
                const loanTrends = processLoanTrends(monthlyLoans, monthlyTransactions);

                setMetrics({
                    monthlyData: monthlyMetrics,
                    typeBreakdown,
                    loanMetrics,
                    loanTrends
                });
                
            } catch (error) {
                setError(error as Error);
                console.error('Error fetching metrics:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchMetrics();
    }, []);

    return { metrics, loading, error };
}

function processMonthlyData(data: any[]): TransactionData[] {
    const monthlyMap = new Map<string, TransactionData>();

    // Initialize the last 6 months
    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = format(date, 'MMM yyyy');
        monthlyMap.set(monthKey, {
            month: monthKey,
            income: 0,
            expense: 0,
            loanPayment: 0,
            loanDisbursement: 0,
            total: 0
        });
    }

    // Process the data
    data.forEach(transaction => {
        const monthKey = format(new Date(transaction.date), 'MMM yyyy');
        if (monthlyMap.has(monthKey)) {
            const monthData = monthlyMap.get(monthKey)!;
            const amount = Number(transaction.amount);

            switch (transaction.type) {
                case 'INCOME':
                    monthData.income += amount;
                    break;
                case 'EXPENSE':
                    monthData.expense += amount;
                    break;
                case 'LOAN_PAYMENT':
                    monthData.loanPayment += amount;
                    break;
                case 'LOAN_DISBURSEMENT':
                    monthData.loanDisbursement += amount;
                    break;
            }
            monthData.total += amount;
        }
    });

    return Array.from(monthlyMap.values())
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}

function processTypeBreakdown(data: any[]): TypeBreakdown[] {
    const typeMap = new Map<string, TypeBreakdown>();

    ['INCOME', 'EXPENSE', 'LOAN_PAYMENT', 'LOAN_DISBURSEMENT'].forEach(type => {
        typeMap.set(type, { type, amount: 0, count: 0 });
    });

    data.forEach(transaction => {
        const typeData = typeMap.get(transaction.type)!;
        typeData.amount += Number(transaction.amount);
        typeData.count += 1;
    });

    return Array.from(typeMap.values())
        .sort((a, b) => b.amount - a.amount);
}

function processLoanMetrics(loans: any[]): LoanMetrics {
    return {
        totalActiveLoans: loans.length,
        totalLoanAmount: loans.reduce((sum, loan) => sum + Number(loan.amount), 0),
        totalInterest: loans.reduce((sum, loan) => sum + Number(loan.totalInterest), 0),
        totalRemainingBalance: loans.reduce((sum, loan) => sum + Number(loan.remainingBalance), 0)
    };
}

function processLoanTrends(loans: any[], transactions: any[]) {
    const monthlyMap = new Map();

    // Initialize months
    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = format(date, 'MMM yyyy');
        monthlyMap.set(monthKey, {
            month: monthKey,
            disbursements: 0,
            payments: 0,
            interest: 0,
            activeLoans: 0
        });
    }

    // Process loans
    loans.forEach(loan => {
        const monthKey = format(new Date(loan.createdAt), 'MMM yyyy');
        if (monthlyMap.has(monthKey)) {
            const monthData = monthlyMap.get(monthKey);
            monthData.disbursements += Number(loan.amount);
            monthData.interest += Number(loan.totalInterest);
            monthData.activeLoans += loan.status === 'ACTIVE' ? 1 : 0;
        }
    });

    // Process payments
    transactions.forEach(transaction => {
        if (transaction.type === 'LOAN_PAYMENT') {
            const monthKey = format(new Date(transaction.date), 'MMM yyyy');
            if (monthlyMap.has(monthKey)) {
                const monthData = monthlyMap.get(monthKey);
                monthData.payments += Number(transaction.amount);
            }
        }
    });

    return Array.from(monthlyMap.values())
        .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
}