/* eslint-disable @typescript-eslint/no-explicit-any */
// src/components/dashboard/utils.ts
import { Transaction } from '@/types';

interface MonthlyData {
    month: string;
    disbursements: number;
    collections: number;
    profit: number;
}

type MaybeNumber = number | string | null | undefined;

function toNumber(v: MaybeNumber): number {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    const parsed = Number(String(v).replace(/,/g, '').trim());
    return Number.isFinite(parsed) ? parsed : 0;
}

/**
 * Calculate loan metrics from a list of loans.
 * Assumes loan.interestRate is either:
 *  - a percentage (e.g. 12 for 12%), OR
 *  - a decimal (e.g. 0.12). The function detects <= 1 and treats that as decimal.
 */
export const calculateLoanMetrics = (transactions: any[]) => {
    const totals = {
        totalLoaned: 0,
        totalInterest: 0,
        totalCollected: 0,
        activeLoans: 0,
        averageInterestRate: 0,
        totalOutstanding: 0,
    };

    if (!Array.isArray(transactions) || transactions.length === 0) {
        return totals;
    }

    let interestRateSum = 0;
    let interestRateCount = 0;

    for (const tx of transactions) {
        const principal = toNumber(tx.principalAmount);
        const rawRate = toNumber(tx.interestRate);
        const outstanding = toNumber(tx.outstandingBalance);

        // Normalize interestRate: if <= 1 assume decimal (0.12), else assume percent (12)
        const interestRateNormalized = rawRate === 0 ? 0 : (rawRate <= 1 ? rawRate : rawRate / 100);

        // Interest amount for the loan (simple principal * rate)
        const interestAmount = principal * interestRateNormalized;

        // Determine collected amount:
        // 1) prefer explicit collectedAmount or totalPaid
        // 2) else use principal - outstanding (if outstanding available)
        // 3) else 0
        const collectedExplicit = toNumber((tx as any).collectedAmount ?? (tx as any).totalPaid ?? undefined);
        const collected = collectedExplicit > 0
            ? collectedExplicit
            : (principal > 0 && outstanding > 0 ? Math.max(0, principal - outstanding) : 0);

        totals.totalLoaned += principal;
        totals.totalInterest += interestAmount;
        totals.totalCollected += collected;
        totals.totalOutstanding += outstanding;

        if (String(tx.status).toUpperCase() === 'ACTIVE') {
            totals.activeLoans += 1;
        }

        if (rawRate > 0) {
            interestRateSum += (rawRate <= 1 ? rawRate * 100 : rawRate); // keep rate in percent when summing
            interestRateCount += 1;
        }
    }

    totals.averageInterestRate = interestRateCount > 0 ? (interestRateSum / interestRateCount) : 0;

    // Round to 2 decimals for readability (optional)
    const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;
    return {
        totalLoaned: round2(totals.totalLoaned),
        totalInterest: round2(totals.totalInterest),
        totalCollected: round2(totals.totalCollected),
        activeLoans: totals.activeLoans,
        averageInterestRate: round2(totals.averageInterestRate),
        totalOutstanding: round2(totals.totalOutstanding),
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
            monthData.profit += Number(tx.amount || 0);
        } else if (tx.type === 'LOAN_PAYMENT') {
            monthData.collections += Number(tx.amount || 0);
        }

        return acc;
    }, new Map<number, MonthlyData>());

    return Array.from(monthlyMap.values());
};