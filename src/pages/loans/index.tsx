// src/pages/loan-summary.tsx
'use client';
import { useMemo, useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend
} from 'recharts';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { Plus, Download, Calendar, Loader2 } from 'lucide-react';
import { NewLoanDialog } from '@/components/loans/new-loan-dialog';
import { CustomTooltip } from '@/components/charts/custom-tooltip';
import LoanTableRecords from '@/components/loans/loan-table';
import { useBalanceOperations } from '@/hooks/useBalanceOperations';
import { LoanPayment, NewTransaction } from '@/types';
import { calculateLoanMetrics } from '@/components/dashboard/utils';
import ErrorComponent from '@/components/error/error-component';

const COLORS = ['#10B981', '#F59E0B', '#EF4444']; // emerald, yellow, red

export default function LoanSummaryPage() {
    const [isAlertOpen, setIsAlertOpen] = useState(false);
    const [isNewLoanOpen, setIsNewLoanOpen] = useState(false);
    const {
        isLoading,
        error,
        refetchTransactions,
        recordLoanPayment,
        loans,
        balances,
        recordExpense
    } = useBalanceOperations();

    const metrics = useMemo(() => calculateLoanMetrics(loans), [loans]);

    const statusDistribution = [
        { name: 'Active', value: loans.filter(loan => loan.status === 'ACTIVE').length },
        { name: 'Paid', value: loans.filter(loan => loan.status === 'PAID').length },
        { name: 'Defaulted', value: loans.filter(loan => loan.status === 'DEFAULTED').length },
    ];

    const loansBySize = [
        { range: '< 999', count: loans.filter(loan => parseFloat(loan.principalAmount) <= 999).length },
        { range: '1k - 1.9k', count: loans.filter(loan => parseFloat(loan.principalAmount) >= 1000 && parseFloat(loan.principalAmount) <= 1999).length },
        { range: '2k - 3.9k', count: loans.filter(loan => parseFloat(loan.principalAmount) >= 2000 && parseFloat(loan.principalAmount) <= 3999).length },
        { range: '4k+', count: loans.filter(loan => parseFloat(loan.principalAmount) >= 4000).length },
    ];

    const handleCreateLoan = async (lData: NewTransaction) => {
        try {
            console.log("Creating transaction:", lData);

            if (!lData.fromBalanceId) {
                throw new Error('No balance selected');
            }

            const e = await recordExpense({ ...lData });
            console.log("Expense created:", e);

            setIsNewLoanOpen(false);
        } catch (error) {
            console.error('Error creating loan:', error);
            setIsAlertOpen(true);
        }
    };

    async function handleLoanPayment(payment: LoanPayment) {
        try {
            console.log("Processing loan payment:", payment);

            if (!payment.accountId) {
                throw new Error('No loan selected');
            }

            const result = await recordLoanPayment.mutateAsync({
                amount: payment.amount || 0,
                loanId: payment.loanId,
                toBalanceId: payment.accountId,
                description: payment.description,
            });

            console.log("Loan payment result:", result);

            return {
                success: true,
                transaction: result
            };
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
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (loans.length === 0) {
        return (
            <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                            Loan Summary
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Get started by creating your first loan
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsNewLoanOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        New Loan
                    </Button>
                </div>

                <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800">
                        <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/20 p-3 mb-4">
                            <Plus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            No loans yet
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4">
                            No recent loans available.
                        </p>
                        <Button
                            onClick={() => setIsNewLoanOpen(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
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

    return (
        <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900">
            {/* Header Section */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
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
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                    >
                        <Calendar className="h-4 w-4" />
                        Filter Period
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700"
                    >
                        <Download className="h-4 w-4" />
                        Export Report
                    </Button>
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                        onClick={() => setIsNewLoanOpen(true)}
                    >
                        <Plus className="h-4 w-4" />
                        New Loan
                    </Button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="bg-white dark:bg-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Total Amount Loaned
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(metrics.totalLoaned)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Across {loans.length} loans
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Total Interest Earned
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {formatCurrency(metrics.totalInterest)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            Average rate: {formatPercent(metrics.averageInterestRate)}
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 dark:text-gray-400">
                            Outstanding Balance
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                            {formatCurrency(metrics.totalOutstanding)}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            From {metrics.activeLoans} active loans
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-white dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle>Loan Status Distribution</CardTitle>
                        <CardDescription>Overview of loan statuses</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={statusDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label
                                    >
                                        {statusDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}-${entry.name}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle>Loan Size Distribution</CardTitle>
                        <CardDescription>Number of loans by amount range</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={loansBySize}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
                                    <XAxis dataKey="range" />
                                    <YAxis />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            border: 'none',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                        }}
                                    />
                                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Loans Table */}
            <LoanTableRecords
                loans={loans}
                balances={balances}
                loading={isLoading}
                refreshLoans={refetchTransactions}
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
                    message={(error as Error).message}
                />
            )}
        </div>
    );
}