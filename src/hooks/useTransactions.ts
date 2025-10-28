import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { BACKEND_API_URL } from '@/lib/utils/consts';
import useUserSession from './useUserSession';

// -----------------------------
// Type definitions
// -----------------------------
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
    bankBalance: number;
    loanTrends: {
        month: string;
        disbursements: number;
        payments: number;
        interest: number;
        activeLoans: number;
    }[];
}

// -----------------------------
// Processing utilities
// -----------------------------

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
            total: 0,
        });
    }

    // Process transactions by month
    data.forEach((tx) => {
        const monthKey = format(new Date(tx.date), 'MMM yyyy');
        const monthData = monthlyMap.get(monthKey);
        if (!monthData) return;

        const amount = Number(tx.amount);
        switch (tx.type) {
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
    });

    return Array.from(monthlyMap.values()).sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );
}

function processTypeBreakdown(data: any[]): TypeBreakdown[] {
    const typeMap = new Map<string, TypeBreakdown>();

    ['INCOME', 'EXPENSE', 'LOAN_PAYMENT', 'LOAN_DISBURSEMENT'].forEach((type) =>
        typeMap.set(type, { type, amount: 0, count: 0 })
    );

    data.forEach((tx) => {
        const typeData = typeMap.get(tx.type);
        if (typeData) {
            typeData.amount += Number(tx.amount);
            typeData.count += 1;
        }
    });

    return Array.from(typeMap.values()).sort((a, b) => b.amount - a.amount);
}

function processLoanMetrics(loans: any[]): LoanMetrics {
    return {
        totalActiveLoans: loans.filter((l) => l.status === 'ACTIVE').length,
        totalLoanAmount: loans.reduce(
            (sum, loan) => sum + Number(loan.principalAmount || loan.amount || 0),
            0
        ),
        totalInterest: loans.reduce(
            (sum, loan) => sum + Number(loan.totalInterest || 0),
            0
        ),
        totalRemainingBalance: loans.reduce(
            (sum, loan) => sum + Number(loan.outstandingBalance || loan.remainingBalance || 0),
            0
        ),
    };
}

function processLoanTrends(loans: any[], transactions: any[]) {
    const monthlyMap = new Map<string, any>();

    // Initialize last 6 months
    for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = format(date, 'MMM yyyy');
        monthlyMap.set(monthKey, {
            month: monthKey,
            disbursements: 0,
            payments: 0,
            interest: 0,
            activeLoans: 0,
        });
    }

    loans.forEach((loan) => {
        const monthKey = format(new Date(loan.createdAt), 'MMM yyyy');
        const monthData = monthlyMap.get(monthKey);
        if (monthData) {
            monthData.disbursements += Number(loan.principalAmount || loan.amount || 0);
            monthData.interest += Number(loan.totalInterest || 0);
            monthData.activeLoans += loan.status === 'ACTIVE' ? 1 : 0;
        }
    });

    transactions.forEach((tx) => {
        if (tx.type === 'LOAN_PAYMENT') {
            const monthKey = format(new Date(tx.date), 'MMM yyyy');
            const monthData = monthlyMap.get(monthKey);
            if (monthData) monthData.payments += Number(tx.amount);
        }
    });

    return Array.from(monthlyMap.values()).sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
    );
}

// -----------------------------
// Data Fetcher (aligned with your API)
// -----------------------------
const fetchTransactionMetrics = async (userId: string): Promise<TransactionMetrics> => {
    const token = sessionStorage.getItem('authToken');
    if (!token) throw new Error('Not authenticated');

    const headers = {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
    };

    // Fetch all in parallel using existing endpoints
    const [txRes, loansRes, balancesRes] = await Promise.all([
        fetch(`${BACKEND_API_URL}/transactions/${userId}`, { headers }),
        fetch(`${BACKEND_API_URL}/loans/${userId}`, { headers }),
        fetch(`${BACKEND_API_URL}/balances/${userId}`, { headers }),
    ]);

    if (!txRes.ok || !loansRes.ok || !balancesRes.ok) {
        throw new Error('Failed to fetch one or more metrics endpoints');
    }

    const [transactions, loans, balances] = await Promise.all([
        txRes.json(),
        loansRes.json(),
        balancesRes.json(),
    ]);

    console.log('Fetched transactions:', transactions);
    console.log('Fetched loans:', loans);
    console.log('Fetched balances:', balances);

    // Process metrics
    const monthlyData = processMonthlyData(transactions);
    const typeBreakdown = processTypeBreakdown(transactions);
    const loanMetrics = processLoanMetrics(loans);
    const loanTrends = processLoanTrends(loans, transactions);
    const bankBalance = balances.reduce(
        (sum: number, b: any) => sum + Number(b.balance || b.currentBalance || 0),
        0
    );

    return {
        monthlyData,
        typeBreakdown,
        loanMetrics,
        loanTrends,
        bankBalance,
    };
};

// -----------------------------
// React Query Hook
// -----------------------------
export function useTransactionMetrics() {
    const { user } = useUserSession();

    const {
        data: metrics,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['transactionMetrics', user?.id],
        queryFn: () => fetchTransactionMetrics(user!.id),
        enabled: !!user,
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
    });

    return {
        metrics,
        isLoading,
        error: error as Error | null,
        refetchMetrics: refetch,
    };
}