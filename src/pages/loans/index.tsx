import { useMemo, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { Plus, Download, Calendar, TrendingUp, DollarSign, AlertCircle } from 'lucide-react';
import { NewLoanDialog } from '@/components/loans/new-loan-dialog';
import LoanTableRecords from '@/components/loans/loan-table';
import { api } from '@/lib/api';
import { useFinanceData } from '@/lib/api';
import { CreateLoanRequest, LoanPaymentRequest } from '@/types';
import { calculateLoanMetrics } from '@/components/dashboard/utils';
import ErrorComponent from '@/components/error/error-component';
import { cn } from '@/lib/utils';

export default function LoanSummaryPage() {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const {
        isLoading,
        loans,
        balances,
    } = useFinanceData();

    const metrics = useMemo(() => calculateLoanMetrics(loans), [loans]);

    const statusDistribution = [
        {
            name: 'Active',
            value: loans.filter((loan: { status: string; }) => loan.status === 'ACTIVE').length,
            color: '#10B981',
            bgColor: 'from-emerald-500 to-emerald-600'
        },
        {
            name: 'Paid',
            value: loans.filter((loan: { status: string; }) => loan.status === 'PAID').length,
            color: '#3B82F6',
            bgColor: 'from-blue-500 to-blue-600'
        },
        {
            name: 'Defaulted',
            value: loans.filter((loan: { status: string; }) => loan.status === 'DEFAULTED').length,
            color: '#EF4444',
            bgColor: 'from-red-500 to-red-600'
        },
    ];

    const loansBySize = [
        { range: '< 999', count: loans.filter((loan: { principalAmount: string; }) => parseFloat(loan.principalAmount) <= 999).length },
        { range: '1k - 1.9k', count: loans.filter((loan: { principalAmount: string; }) => parseFloat(loan.principalAmount) >= 1000 && parseFloat(loan.principalAmount) <= 1999).length },
        { range: '2k - 3.9k', count: loans.filter((loan: { principalAmount: string; }) => parseFloat(loan.principalAmount) >= 2000 && parseFloat(loan.principalAmount) <= 3999).length },
        { range: '4k+', count: loans.filter((loan: { principalAmount: string; }) => parseFloat(loan.principalAmount) >= 4000).length },
    ];

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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-emerald-600 dark:border-t-[#C4F546]" />
            </div>
        );
    }

    if (loans.length === 0) {
        return (
            <div className="p-8 min-h-screen">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Loan Summary
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Get started by creating your first loan
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsNewLoanOpen(true)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Loan
                    </Button>
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
                        <Button
                            onClick={() => setIsNewLoanOpen(true)}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Create Your First Loan
                        </Button>
                    </CardContent>
                </Card>

                <NewLoanDialog
                    open={isNewLoanOpen}
                    onClose={() => setIsNewLoanOpen(false)}
                    onSubmit={handleCreateLoan}
                    balances={balances}
                />
            </div>
        );
    }

    const maxLoanSize = Math.max(...loansBySize.map(l => l.count));

    return (
        <div className="p-8 space-y-8 min-h-screen">
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
                        className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setIsNewLoanOpen(true)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Loan
                    </Button>
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

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Loan Status Distribution */}
                <Card className={cn(
                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                )}>
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Loan Status Distribution</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Overview of loan statuses
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-center h-[300px]">
                            <div className="relative w-64 h-64">
                                {/* Donut Chart */}
                                <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
                                    <circle
                                        cx="100"
                                        cy="100"
                                        r="80"
                                        fill="none"
                                        stroke="currentColor"
                                        className="stroke-gray-200 dark:stroke-gray-700"
                                        strokeWidth="40"
                                    />
                                    {(() => {
                                        const total = statusDistribution.reduce((sum, item) => sum + item.value, 0);
                                        let currentAngle = 0;

                                        return statusDistribution.map((item, index) => {
                                            const percentage = (item.value / total) * 100;
                                            const strokeDasharray = `${percentage * 5.03} ${502.4 - (percentage * 5.03)}`;
                                            const rotation = currentAngle;
                                            currentAngle += percentage * 3.6;

                                            return (
                                                <circle
                                                    key={index}
                                                    cx="100"
                                                    cy="100"
                                                    r="80"
                                                    fill="none"
                                                    stroke={item.color}
                                                    strokeWidth="40"
                                                    strokeDasharray={strokeDasharray}
                                                    strokeDashoffset="0"
                                                    style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center' }}
                                                    className="transition-all duration-500"
                                                />
                                            );
                                        });
                                    })()}
                                </svg>

                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center">
                                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                                        {loans.length}
                                    </div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Loans</div>
                                </div>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap justify-center gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            {statusDistribution.map((item, index) => (
                                <div key={index} className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {item.name} ({item.value})
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Loan Size Distribution */}
                <Card className={cn(
                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                )}>
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Loan Size Distribution</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Number of loans by amount range
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-end justify-around gap-4 p-4">
                            {loansBySize.map((item, index) => {
                                const heightPercent = maxLoanSize > 0 ? (item.count / maxLoanSize) * 100 : 0;
                                const colors = [
                                    'from-blue-500 to-blue-600',
                                    'from-emerald-500 to-emerald-600',
                                    'from-purple-500 to-purple-600',
                                    'from-orange-500 to-orange-600'
                                ];

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-3">
                                        <div className="w-full relative group">
                                            <div
                                                className={cn(
                                                    "w-full rounded-t-xl bg-gradient-to-t transition-all duration-500 shadow-lg group-hover:shadow-xl",
                                                    colors[index]
                                                )}
                                                style={{ height: `${Math.max(heightPercent, 5)}%`, minHeight: '20px' }}
                                            >
                                                {item.count > 0 && (
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold text-gray-900 dark:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                                        {item.count}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs font-medium text-gray-600 dark:text-gray-400 text-center">
                                            {item.range}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
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
            />

            {/* New Loan Dialog */}
            <NewLoanDialog
                open={isNewLoanOpen}
                balances={balances}
                onClose={() => setIsNewLoanOpen(false)}
                onSubmit={handleCreateLoan}
            />

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