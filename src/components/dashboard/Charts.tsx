/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    AreaChart,
    Area,
    Cell
} from 'recharts';
import { formatCurrency } from '@/lib/utils/formatters';
import { useTransactionMetrics } from '@/hooks/useTransactions';
import { MetricCard } from './MetricCard';
import { PiggyBank, TrendingUp, Users, Wallet, Loader2 } from 'lucide-react';

const COLORS = {
    INCOME: '#10B981',      // Emerald
    EXPENSE: '#EF4444',     // Red
    LOAN_PAYMENT: '#F59E0B', // Amber
    LOAN_DISBURSEMENT: '#6366F1', // Indigo
    INTEREST: '#8B5CF6',    // Purple
    ACTIVE_LOANS: '#2563EB' // Blue
};

export const DashboardCharts: React.FC = () => {
    const { metrics, isLoading, error, refetchMetrics } = useTransactionMetrics();

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] space-y-4">
                <p className="text-red-600 dark:text-red-400">Error loading metrics: {error.message}</p>
                <button
                    onClick={() => refetchMetrics()}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    // No data state
    if (!metrics) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <p className="text-gray-500 dark:text-gray-400">No metrics data available</p>
            </div>
        );
    }

    console.log('Transaction Metrics:', metrics);

    // Calculate loan collection percentage
    const totalDisbursed = metrics.loanMetrics?.totalLoanAmount || 0;
    const totalCollected = metrics.monthlyData?.reduce((acc, month) => acc + (month.loanPayment || 0), 0) || 0;
    const collectionPercentage = totalDisbursed > 0
        ? (totalCollected / totalDisbursed) * 100
        : 0;

    // Calculate loan growth rate
    const loanTrendsLength = metrics.loanTrends?.length || 0;
    const currentMonth = loanTrendsLength > 0 ? metrics.loanTrends[loanTrendsLength - 1] : null;
    const previousMonth = loanTrendsLength > 1 ? metrics.loanTrends[loanTrendsLength - 2] : null;
    const growthRate = previousMonth?.activeLoans && previousMonth.activeLoans > 0
        ? ((currentMonth?.activeLoans || 0) - previousMonth.activeLoans) / previousMonth.activeLoans * 100
        : 0;

    const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: any; label?: string }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">{label}</p>
                    {payload.map((entry: any, index: number) => (
                        <div key={index} className="flex items-center justify-between gap-4">
                            <span style={{ color: entry.color }}>{entry.name}:</span>
                            <span className="font-medium">{formatCurrency(entry.value)}</span>
                        </div>
                    ))}
                </div>
            );
        }
        return null;
    };

    const formatYAxis = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}K`;
        }
        return `${value}`;
    };

    return (
        <div className="space-y-6">
            {/* Metrics */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Loan Amount"
                    value={formatCurrency(metrics.loanMetrics?.totalLoanAmount || 0)}
                    icon={<Wallet className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                    trend={{
                        value: parseFloat(collectionPercentage.toFixed(2)),
                        label: "collected"
                    }}
                />
                <MetricCard
                    title="Total Interest"
                    value={formatCurrency(metrics.loanMetrics?.totalInterest || 0)}
                    icon={<TrendingUp className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                    description="Based on active loans"
                />
                <MetricCard
                    title="Total Bank Balance"
                    value={formatCurrency(metrics.bankBalance || 0)}
                    icon={<Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                    trend={{
                        value: parseFloat(growthRate.toFixed(2)),
                        label: "growth rate"
                    }}
                />
                <MetricCard
                    title="Remaining Balance"
                    value={formatCurrency(metrics.loanMetrics?.totalRemainingBalance || 0)}
                    icon={<PiggyBank className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
                    description="Total outstanding amount"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Transaction Flow Chart */}
                <Card className="bg-white dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle>Transaction Flow</CardTitle>
                        <CardDescription>Monthly transaction amounts by type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={metrics.monthlyData || []}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-gray-200 dark:stroke-gray-700"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        className="text-xs"
                                        tick={{ fill: '#6B7280' }}
                                    />
                                    <YAxis
                                        className="text-xs"
                                        tick={{ fill: '#6B7280' }}
                                        tickFormatter={formatYAxis}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="income"
                                        stroke={COLORS.INCOME}
                                        name="Income"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="expense"
                                        stroke={COLORS.EXPENSE}
                                        name="Expense"
                                        strokeWidth={2}
                                        dot={false}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Loan Activity Chart */}
                <Card className="bg-white dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle>Loan Activity</CardTitle>
                        <CardDescription>Monthly loan disbursements and collections</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics.loanTrends || []}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-gray-200 dark:stroke-gray-700"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        className="text-xs"
                                        tick={{ fill: '#6B7280' }}
                                    />
                                    <YAxis
                                        className="text-xs"
                                        tick={{ fill: '#6B7280' }}
                                        tickFormatter={formatYAxis}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend />
                                    <Area
                                        type="monotone"
                                        dataKey="disbursements"
                                        stackId="1"
                                        stroke={COLORS.LOAN_DISBURSEMENT}
                                        fill={COLORS.LOAN_DISBURSEMENT}
                                        fillOpacity={0.6}
                                        name="Disbursements"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="payments"
                                        stackId="2"
                                        stroke={COLORS.LOAN_PAYMENT}
                                        fill={COLORS.LOAN_PAYMENT}
                                        fillOpacity={0.6}
                                        name="Collections"
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="interest"
                                        stackId="2"
                                        stroke={COLORS.INTEREST}
                                        fill={COLORS.INTEREST}
                                        fillOpacity={0.6}
                                        name="Interest"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction Type Distribution */}
                <Card className="bg-white dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle>Transaction Distribution</CardTitle>
                        <CardDescription>Breakdown by transaction type</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={metrics.typeBreakdown || []}
                                    layout="vertical"
                                    barSize={20}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-gray-200 dark:stroke-gray-700"
                                    />
                                    <XAxis
                                        type="number"
                                        className="text-xs"
                                        tick={{ fill: '#6B7280' }}
                                        tickFormatter={formatYAxis}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="type"
                                        className="text-xs"
                                        tick={{ fill: '#6B7280' }}
                                        width={120}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="amount"
                                        name="Amount"
                                        radius={[0, 4, 4, 0]}
                                    >
                                        {(metrics.typeBreakdown || []).map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[entry.type as keyof typeof COLORS]}
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Active Loans Trend */}
                <Card className="bg-white dark:bg-gray-800">
                    <CardHeader>
                        <CardTitle>Active Loans Trend</CardTitle>
                        <CardDescription>Monthly active loans count</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={metrics.loanTrends || []}>
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        className="stroke-gray-200 dark:stroke-gray-700"
                                    />
                                    <XAxis
                                        dataKey="month"
                                        className="text-xs"
                                        tick={{ fill: '#6B7280' }}
                                    />
                                    <YAxis
                                        className="text-xs"
                                        tick={{ fill: '#6B7280' }}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="activeLoans"
                                        stroke={COLORS.ACTIVE_LOANS}
                                        fill={COLORS.ACTIVE_LOANS}
                                        fillOpacity={0.6}
                                        name="Active Loans"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};