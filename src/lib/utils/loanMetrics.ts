/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Loan } from '@/types';

export interface LoanMetrics {
    totalLoaned: number;
    totalInterest: number; // total interest amount (principal * interestRate/100)
    totalCollected: number; // totalPaid aggregated
    totalRemainingBalance: number;
    activeLoans: number;
    averageInterestRate: number; // percentage
}

export const calculateLoanMetrics = (loans: Loan[] = []): LoanMetrics => {
    let totalLoaned = 0;
    let totalInterest = 0;
    let totalCollected = 0;
    let totalRemainingBalance = 0;
    let interestRateSum = 0;
    let interestRateCount = 0;
    let activeLoans = 0;

    for (const loan of loans) {
        const principal = Number(loan.principalAmount ?? 0) || 0;
        // interestRate might be percent (e.g. "12.5") — treat as percent
        const interestRate = Number(loan.interestRate ?? 0) || 0;
        const totalPaid = Number(loan.totalPaid ?? 0) || 0;
        const outstanding = Number(loan.outstandingBalance ?? 0) || 0;

        totalLoaned += principal;
        // total interest amount (simple): principal * (interestRate / 100)
        totalInterest += principal * (interestRate / 100);
        totalCollected += totalPaid;
        totalRemainingBalance += outstanding;

        if (!isNaN(interestRate)) {
            interestRateSum += interestRate;
            interestRateCount += 1;
        }

        if (loan.status === 'ACTIVE' || loan.status === 'PENDING') {
            activeLoans += 1;
        }
    }

    const averageInterestRate = interestRateCount > 0 ? interestRateSum / interestRateCount : 0;

    return {
        totalLoaned,
        totalInterest,
        totalCollected,
        totalRemainingBalance,
        activeLoans,
        averageInterestRate,
    };
};
