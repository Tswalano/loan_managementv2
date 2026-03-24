import { useMemo, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { Plus, Download, Calendar, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';
import { NewLoanDialog } from '@/components/loans/new-loan-dialog';
import LoanTableRecords from '@/components/loans/loan-table';
import { api, useCurrentUser } from '@/lib/api';
import { useFinanceData } from '@/lib/api';
import { CreateLoanRequest, Loan, LoanPaymentRequest } from '@/types';
import { calculateLoanMetrics } from '@/components/dashboard/utils';
import ErrorComponent from '@/components/error/error-component';
import { cn } from '@/lib/utils';
import { getActiveOrganization, resolveOrganizationPermissions } from '@/lib/permissions';

export default function LoanSummaryPage() {
    const { data: currentUserData } = useCurrentUser();
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        isLoading,
        loans,
        balances,
    } = useFinanceData();
    const activeOrganization = getActiveOrganization(currentUserData?.organizations);
    const permissions = activeOrganization
        ? resolveOrganizationPermissions(activeOrganization.role, activeOrganization.permissions)
        : null;
    const canManageLoans = Boolean(permissions?.canManageLoans);
    const canProcessLoanPayments = Boolean(permissions?.canManageTransactions);

    const metrics = useMemo(() => calculateLoanMetrics(loans), [loans]);

    const handleCreateLoan = async (lData: CreateLoanRequest) => {
        try {
            console.log("Creating loan transaction:", lData);
            await api.createLoan(lData);
            console.log("Loan expense created successfully");
            setIsNewLoanOpen(false);
        } catch (error) {
            console.error('Error creating loan:', error);
            setError(error instanceof Error ? error.message : 'Failed to create loan');
            setIsAlertOpen(true);
        }
    };

    async function handleLoanPayment(payment: LoanPaymentRequest) {
        try {
            console.log("Processing loan payment:", payment);
            const result = await api.recordLoanPayment(payment.loanId, {
                amount: payment.amount,
                toBalanceId: payment.toBalanceId,
                description: payment.description,
            });
            console.log("Loan payment result:", result);
            return result;
        } catch (error) {
            console.error('Error processing payment:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Payment failed'
            };
        }
    }

    const exportToExcel = () => {
        const wsData = [
            ['Borrower', 'Email', 'Phone', 'Principal', 'Interest Rate', 'Term (Months)', 'Status', 'Outstanding', 'Total Paid', 'Disbursed', 'Maturity'],
            ...loans.map((loan: Loan) => [
                loan.borrowerName,
                loan.borrowerEmail || '',
                loan.borrowerPhone || '',
                Number(loan.principalAmount),
                Number(loan.interestRate),
                Number(loan.termMonths),
                loan.status,
                Number(loan.outstandingBalance || '0'),
                Number(loan.totalPaid || '0'),
                loan.disbursementDate ? new Date(loan.disbursementDate).toLocaleDateString() : '',
                loan.maturityDate ? new Date(loan.maturityDate).toLocaleDateString() : '',
            ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [
            { wch: 24 },
            { wch: 28 },
            { wch: 18 },
            { wch: 14 },
            { wch: 14 },
            { wch: 14 },
            { wch: 14 },
            { wch: 16 },
            { wch: 14 },
            { wch: 14 },
            { wch: 14 },
        ];

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Loans');
        XLSX.writeFile(wb, `loans_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-emerald-600 dark:border-t-[#C4F546]" />
            </div>
        );
    }

    if (loans.length === 0) {
        return (
            <div className="space-y-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Loan Summary
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Get started by creating your first loan
                        </p>
                    </div>
                    {canManageLoans && (
                        <Button
                            onClick={() => setIsNewLoanOpen(true)}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Loan
                        </Button>
                    )}
                </div>

                <Card className={cn(
                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                )}>
                    <CardContent className="flex flex-col items-center justify-center py-16">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg">
                            <Plus className="h-10 w-10 text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                            No loans yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                            Start tracking your loans and manage borrowers efficiently with our powerful loan management system.
                        </p>
                        {canManageLoans && (
                            <Button
                                onClick={() => setIsNewLoanOpen(true)}
                                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Create Your First Loan
                            </Button>
                        )}
                    </CardContent>
                </Card>

                {canManageLoans && (
                    <NewLoanDialog
                        open={isNewLoanOpen}
                        onClose={() => setIsNewLoanOpen(false)}
                        onSubmit={handleCreateLoan}
                        balances={balances}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Loan Summary
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Managing {loans.length} total loans
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Filter Period
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToExcel}
                        className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    {canManageLoans && (
                        <Button
                            size="sm"
                            onClick={() => setIsNewLoanOpen(true)}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            New Loan
                        </Button>
                    )}
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className={cn(
                    "relative overflow-hidden backdrop-blur-xl",
                    "bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20",
                    "hover:shadow-2xl dark:hover:shadow-black/40",
                    "transition-all duration-300 hover:-translate-y-1",
                    "group"
                )}>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Total Amount Loaned
                        </CardTitle>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-xl flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {formatCurrency(metrics.totalLoaned)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Across {loans.length} loans
                        </p>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "relative overflow-hidden backdrop-blur-xl",
                    "bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20",
                    "hover:shadow-2xl dark:hover:shadow-black/40",
                    "transition-all duration-300 hover:-translate-y-1",
                    "group"
                )}>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Total Interest Earned
                        </CardTitle>
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900/30 dark:to-emerald-800/30 rounded-xl flex items-center justify-center">
                            <TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(metrics.totalInterest)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            Average rate: {formatPercent(metrics.averageInterestRate)}
                        </p>
                    </CardContent>
                </Card>

                <Card className={cn(
                    "relative overflow-hidden backdrop-blur-xl",
                    "bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20",
                    "hover:shadow-2xl dark:hover:shadow-black/40",
                    "transition-all duration-300 hover:-translate-y-1",
                    "group"
                )}>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            Outstanding Balance
                        </CardTitle>
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-900/30 dark:to-orange-800/30 rounded-xl flex items-center justify-center">
                            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {formatCurrency(metrics.totalOutstanding)}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                            From {metrics.activeLoans} active loans
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Loans Table */}
            <LoanTableRecords
                loans={loans}
                balances={balances}
                loading={isLoading}
                refreshLoans={async () => {
                    // Data will refresh automatically via React Query
                }}
                handleLoanPayment={handleLoanPayment}
                canManageLoans={canManageLoans}
                canProcessLoanPayments={canProcessLoanPayments}
            />

            {/* New Loan Dialog */}
            {canManageLoans && (
                <NewLoanDialog
                    open={isNewLoanOpen}
                    balances={balances}
                    onClose={() => setIsNewLoanOpen(false)}
                    onSubmit={handleCreateLoan}
                />
            )}

            {error && (
                <ErrorComponent
                    isOpen={isAlertOpen}
                    onClose={() => setIsAlertOpen(false)}
                    title="Error occurred"
                    message={error}
                />
            )}
        </div>
    );
}
