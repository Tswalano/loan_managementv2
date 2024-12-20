// src/components/dashboard/utils.ts
import { Loan, Transaction } from '@/types';

interface MonthlyData {
    month: string;
    disbursements: number;
    collections: number;
    profit: number;
}

export const calculateLoanMetrics = (transactions: Loan[]) => {

    return {
        totalLoaned: transactions
            .reduce((sum, tx) => sum + Number(tx.amount || 0), 0),

        totalInterest: transactions
            .reduce((sum, tx) => sum + Number(tx.totalInterest || 0), 0),

        totalCollected: transactions
            .reduce((sum, tx) => sum + Number(tx.amount || 0), 0),

        activeLoans: transactions
            .filter(tx => tx.status === 'ACTIVE')
            .length,

        averageInterestRate: transactions
            .reduce((sum, tx, _, array) =>
                sum + (Number(tx.interestRate || 0) / (array.length || 1)), 0),

        totalOutstanding: transactions
            .reduce((sum, tx) => sum + Number(tx.remainingBalance || 0), 0),
    };
};

export const calculateMonthlyData = (transactions: Transaction[]): MonthlyData[] => {
    const monthlyMap = transactions.reduce((acc, tx) => {
        if (!tx.date) return acc;

        const date = new Date(tx.date);
        const monthIndex = date.getMonth();
        const monthName = date.toLocaleString("default", { month: "short" });

        if (!acc.has(monthIndex)) {
            acc.set(monthIndex, {
                month: monthName,
                disbursements: 0,
                collections: 0,
                profit: 0,
            });
        }

        const monthData = acc.get(monthIndex)!;

        if (tx.type === 'LOAN_DISBURSEMENT') {
            monthData.disbursements += Number(tx.amount || 0);
            monthData.profit += Number(tx.totalInterest || 0);
        } else if (tx.type === 'LOAN_PAYMENT') {
            monthData.collections += Number(tx.amount || 0);
        }

        return acc;
    }, new Map<number, MonthlyData>());

    return Array.from(monthlyMap.values());
};