// src/pages/dashboard/index.tsx
// import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Loader2 } from 'lucide-react';
import EmptyMessageCard from '@/components/cards/empty-card';
import LoanTableRecords from '@/components/loans/loan-table';
import { api, useFinanceData } from '@/lib/api';
import { DashboardCharts } from '@/components/dashboard/Charts';
// import ErrorComponent from '@/components/error/error-component';
import { ApiResponse, LoanPaymentRequest, Transaction } from '@/types';

export default function DashboardPage() {
    const {
        isLoading: balanceLoading,
        loans,
        balances,
    } = useFinanceData();

    // const [isAlertOpen, setIsAlertOpen] = useState(false);
    // const [error, setError] = useState<string | null>(null);

    const loading = balanceLoading

    const handleLoanPayment = async (payment: LoanPaymentRequest): Promise<ApiResponse<{ transaction: Transaction }>> => {
        try {
            const result = await api.recordLoanPayment(payment.toBalanceId, {
                amount: payment.amount.toString(),
                toBalanceId: payment.toBalanceId,
                description: payment.description,
            });

            console.log("Loan payment recorded:", result);

            return result;
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment failed'
            };
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Dashboard Overview
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Track your lending performance and metrics
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        size="sm"
                        variant="outline"
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Filter by Date
                    </Button>
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <TrendingUp className="h-4 w-4 mr-2" />
                        Generate Report
                    </Button>
                </div>
            </div>

            {/* Charts */}
            <DashboardCharts />

            {/* Loan Table */}
            {loans && loans.length > 0 ? (
                <LoanTableRecords
                    loans={loans}
                    loading={loading}
                    refreshLoans={async () => {
                        // Data will refresh automatically via React Query
                    }}
                    handleLoanPayment={handleLoanPayment}
                    balances={balances}
                />
            ) : (
                <EmptyMessageCard
                    title='Loan'
                    message='No loans found. Start by creating a new loan.'
                    onCreate={() => { }}
                />
            )}

            {/* {error && (
                <ErrorComponent
                    isOpen={isAlertOpen}
                    onClose={() => setIsAlertOpen(false)}
                    title="Error occurred"
                    message={error}
                />
            )} */}
        </div>
    );
}