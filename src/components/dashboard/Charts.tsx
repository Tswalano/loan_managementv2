/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils/formatters';
import { MetricCard } from './MetricCard';
import { Wallet, Users, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinanceData } from '@/lib/api';

interface Transaction {
    id: string;
    amount: string;
    type: string;
    description: string;
    date: string;
    isLoanDisbursement: boolean;
    isLoanPayment: boolean;
    category: string;
}

interface DashboardMetrics {
    totalBalance: string;
    totalLoaned: string;
    totalOutstanding: string;
    activeLoansCount: number;
    balanceAccounts: number;
    recentTransactions: Transaction[];
}

export const DashboardCharts: React.FC = () => {
    const { isLoading, dashboard } = useFinanceData();

    // Process transaction data
    const processedData = useMemo(() => {
        if (!dashboard?.recentTransactions) return null;

        const transactions = dashboard.recentTransactions as Transaction[];

        // Group by month
        const monthlyData = transactions.reduce((acc: any, transaction) => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getMonth() + 1}/${date.getFullYear()}`;

            if (!acc[monthKey]) {
                acc[monthKey] = {
                    month: new Date(date.getFullYear(), date.getMonth()).toLocaleDateString('en-US', { month: 'short' }),
                    disbursements: 0,
                    payments: 0,
                    expenses: 0,
                    total: 0
                };
            }

            const amount = parseFloat(transaction.amount);

            if (transaction.isLoanDisbursement) {
                acc[monthKey].disbursements += amount;
            } else if (transaction.isLoanPayment) {
                acc[monthKey].payments += amount;
            } else if (transaction.type === 'EXPENSE') {
                acc[monthKey].expenses += amount;
            }

            acc[monthKey].total += amount;

            return acc;
        }, {});

        // Convert to array and sort by date
        const monthlyArray = Object.values(monthlyData);

        // Calculate transaction type breakdown
        const typeBreakdown = transactions.reduce((acc: any, transaction) => {
            const type = transaction.isLoanDisbursement
                ? 'Loan Disbursed'
                : transaction.isLoanPayment
                    ? 'Loan Payment'
                    : transaction.category;

            if (!acc[type]) {
                acc[type] = 0;
            }
            acc[type] += parseFloat(transaction.amount);
            return acc;
        }, {});

        const typeBreakdownArray = Object.entries(typeBreakdown).map(([type, amount]) => ({
            type,
            amount: amount as number
        })).sort((a, b) => b.amount - a.amount);

        return {
            monthlyData: monthlyArray,
            typeBreakdown: typeBreakdownArray
        };
    }, [dashboard?.recentTransactions]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
            </div>
        );
    }

    // No data state
    if (!dashboard) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <p className="text-gray-500">No metrics data available</p>
            </div>
        );
    }

    const metrics = dashboard as DashboardMetrics;
    const totalLoaned = parseFloat(metrics.totalLoaned);
    const totalOutstanding = parseFloat(metrics.totalOutstanding);
    const collectionRate = totalLoaned > 0 ? ((totalLoaned - totalOutstanding) / totalLoaned) * 100 : 0;

    return (
        <div className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Balance"
                    value={formatCurrency(parseFloat(metrics.totalBalance))}
                    icon={<Wallet className="h-5 w-5 text-black" />}
                    description={`Across ${metrics.balanceAccounts} accounts`}
                />
                <MetricCard
                    title="Total Loaned"
                    value={formatCurrency(totalLoaned)}
                    icon={<ArrowUpRight className="h-5 w-5 text-red-600" />}
                    trend={{
                        value: parseFloat(collectionRate.toFixed(1)),
                        label: "collected",
                        isPositive: true
                    }}
                />
                <MetricCard
                    title="Active Loans"
                    value={metrics.activeLoansCount}
                    icon={<Users className="h-5 w-5 text-blue-600" />}
                    description="Currently active"
                />
                <MetricCard
                    title="Outstanding"
                    value={formatCurrency(totalOutstanding)}
                    icon={<PiggyBank className="h-5 w-5 text-orange-600" />}
                    trend={{
                        value: parseFloat(((totalOutstanding / totalLoaned) * 100).toFixed(1)),
                        label: "of total",
                        isPositive: false
                    }}
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Monthly Transaction Flow */}
                <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">Transaction Flow</CardTitle>
                        <CardDescription className="text-sm text-gray-500">Monthly disbursements vs payments</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-end justify-between gap-2 px-4">
                            {processedData?.monthlyData.slice(-8).map((data: any, index: number) => {
                                const maxValue = Math.max(
                                    ...processedData.monthlyData.map((d: any) =>
                                        Math.max(d.disbursements, d.payments)
                                    )
                                );

                                return (
                                    <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                        <div className="w-full flex flex-col items-center gap-1">
                                            {/* Disbursements Bar */}
                                            <div className="w-full flex flex-col items-center">
                                                <div
                                                    className="w-full bg-red-500 rounded-t-lg hover:bg-red-600 transition-colors cursor-pointer"
                                                    style={{
                                                        height: `${(data.disbursements / maxValue) * 200}px`,
                                                        minHeight: data.disbursements > 0 ? '4px' : '0px'
                                                    }}
                                                    title={`Disbursed: ${formatCurrency(data.disbursements)}`}
                                                />
                                            </div>

                                            {/* Payments Bar */}
                                            <div className="w-full flex flex-col items-center">
                                                <div
                                                    className="w-full bg-[#C4F546] rounded-t-lg hover:bg-[#b8e63f] transition-colors cursor-pointer"
                                                    style={{
                                                        height: `${(data.payments / maxValue) * 200}px`,
                                                        minHeight: data.payments > 0 ? '4px' : '0px'
                                                    }}
                                                    title={`Collected: ${formatCurrency(data.payments)}`}
                                                />
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 font-medium">{data.month}</span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded"></div>
                                <span className="text-sm text-gray-600">Disbursed</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#C4F546] rounded"></div>
                                <span className="text-sm text-gray-600">Collected</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction Type Breakdown */}
                <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">Transaction Breakdown</CardTitle>
                        <CardDescription className="text-sm text-gray-500">By transaction type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {processedData?.typeBreakdown.slice(0, 6).map((item: any, index: number) => {
                                const maxAmount = processedData.typeBreakdown[0].amount;
                                const percentage = (item.amount / maxAmount) * 100;

                                // Color scheme based on transaction type
                                const getColor = (type: string) => {
                                    if (type.includes('Loan Disbursed')) return 'bg-red-500';
                                    if (type.includes('Loan Payment')) return 'bg-[#C4F546]';
                                    if (type.includes('Interest')) return 'bg-purple-500';
                                    if (type.includes('Salary')) return 'bg-blue-500';
                                    return 'bg-gray-500';
                                };

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700">{item.type}</span>
                                            <span className="text-sm font-semibold text-gray-900">
                                                {formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${getColor(item.type)}`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-white border border-gray-200 rounded-2xl shadow-sm lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg font-semibold text-gray-900">Recent Activity</CardTitle>
                        <CardDescription className="text-sm text-gray-500">Last 5 transactions</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {metrics.recentTransactions.slice(0, 5).map((transaction) => {
                                const isIncome = transaction.isLoanPayment;
                                const isExpense = transaction.isLoanDisbursement || transaction.type === 'EXPENSE';

                                return (
                                    <div
                                        key={transaction.id}
                                        className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isIncome ? 'bg-green-100' : 'bg-red-100'
                                                }`}>
                                                {isIncome ? (
                                                    <ArrowDownRight className="h-6 w-6 text-green-600" />
                                                ) : (
                                                    <ArrowUpRight className="h-6 w-6 text-red-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{transaction.description}</p>
                                                <p className="text-sm text-gray-500">
                                                    {new Date(transaction.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-lg font-semibold ${isIncome ? 'text-green-600' : 'text-red-600'
                                                }`}>
                                                {isIncome ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                                            </p>
                                            <p className="text-xs text-gray-500">{transaction.category}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};