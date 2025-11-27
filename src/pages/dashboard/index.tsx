/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils/formatters';
import { Wallet, TrendingUp, Users, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinanceData } from '@/lib/api';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/components/dashboard/MetricCard';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    Cell
} from 'recharts';

interface Transaction {
    id: string;
    amount: string;
    type: string;
    description: string | null;
    date: string;
    isLoanDisbursement: boolean;
    isLoanPayment: boolean;
    category: string;
}

// Custom tooltip components
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} className="text-xs text-gray-600 dark:text-gray-400">
                        <span style={{ color: entry.color }}>{entry.name}: </span>
                        <span className="font-semibold">{formatCurrency(entry.value)}</span>
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const DashboardCharts: React.FC = () => {
    const { isLoading, dashboard } = useFinanceData();

    // Use computed data from enhanced hook OR fallback to manual processing
    const chartData = useMemo(() => {
        // If we have enhanced metrics from the hook, use them
        if (dashboard?.monthlyData && dashboard?.loanTrends) {
            console.log('✅ Using enhanced computed metrics');
            return {
                monthlyData: dashboard.monthlyData.slice(-8),
                loanTrends: dashboard.loanTrends.slice(-8),
                typeBreakdown: dashboard.typeBreakdown?.slice(0, 5) || [],
            };
        }

        // Fallback: If no enhanced metrics, process recentTransactions manually
        console.log('⚠️ Falling back to manual processing');
        if (!dashboard?.recentTransactions || dashboard.recentTransactions.length === 0) {
            return null;
        }

        const txns = dashboard.recentTransactions as Transaction[];

        // Group by month
        const monthlyMap: Record<string, any> = {};
        txns.forEach(transaction => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!monthlyMap[monthKey]) {
                monthlyMap[monthKey] = {
                    month: date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
                    disbursements: 0,
                    payments: 0,
                    expense: 0,
                    income: 0,
                    interest: 0
                };
            }

            const amount = parseFloat(transaction.amount);

            if (transaction.isLoanDisbursement) {
                monthlyMap[monthKey].disbursements += amount;
                monthlyMap[monthKey].expense += amount;
            } else if (transaction.isLoanPayment) {
                monthlyMap[monthKey].payments += amount;
                monthlyMap[monthKey].income += amount;
                monthlyMap[monthKey].interest += amount * 0.1;
            } else if (transaction.type === 'EXPENSE') {
                monthlyMap[monthKey].expense += amount;
            } else {
                monthlyMap[monthKey].income += amount;
            }
        });

        // Convert to array and sort
        const monthlyArray = Object.keys(monthlyMap)
            .sort()
            .map(key => monthlyMap[key]);

        // Type breakdown
        const typeMap: Record<string, number> = {};
        txns.forEach(transaction => {
            const type = transaction.isLoanDisbursement
                ? 'EXPENSE'
                : transaction.isLoanPayment
                    ? 'LOAN_PAYMENT'
                    : transaction.type;

            typeMap[type] = (typeMap[type] || 0) + parseFloat(transaction.amount);
        });

        const typeBreakdownArray = Object.entries(typeMap)
            .map(([type, amount]) => ({
                type,
                amount: amount as number,
            }))
            .sort((a, b) => b.amount - a.amount);

        return {
            monthlyData: monthlyArray.slice(-8),
            loanTrends: monthlyArray.slice(-8), // Use same data for loan trends
            typeBreakdown: typeBreakdownArray.slice(0, 5),
        };
    }, [dashboard]);

    // Loading state
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-black dark:border-t-[#C4F546]" />
            </div>
        );
    }

    // No data state
    if (!dashboard) {
        return (
            <div className="flex items-center justify-center h-[400px]">
                <p className="text-gray-500 dark:text-gray-400">No metrics data available</p>
            </div>
        );
    }

    // Use computed loan metrics if available
    const loanMetrics = dashboard.loanMetrics || {
        totalLoanAmount: parseFloat(dashboard.totalLoaned || '0'),
        totalInterest: parseFloat(dashboard.totalLoaned || '0') * 0.1,
        totalRemainingBalance: parseFloat(dashboard.totalOutstanding || '0'),
        activeLoansCount: dashboard.activeLoansCount || 0
    };

    const totalLoaned = loanMetrics.totalLoanAmount;
    const totalOutstanding = loanMetrics.totalRemainingBalance;
    const collectionRate = totalLoaned > 0 ? ((totalLoaned - totalOutstanding) / totalLoaned) * 100 : 0;
    const bankBalance = dashboard.bankBalance || parseFloat(dashboard.totalBalance || '0');

    return (
        <div className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Loan Amount"
                    value={formatCurrency(totalLoaned)}
                    icon={<Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />}
                    trend={{
                        value: parseFloat(collectionRate.toFixed(2)),
                        label: "collected",
                        isPositive: collectionRate > 50
                    }}
                />
                <MetricCard
                    title="Total Interest"
                    value={formatCurrency(loanMetrics.totalInterest)}
                    icon={<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                    description="Based on active loans"
                />
                <MetricCard
                    title="Total Bank Balance"
                    value={formatCurrency(bankBalance)}
                    icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                    trend={{
                        value: loanMetrics.activeLoansCount,
                        label: "active loans",
                        isPositive: true
                    }}
                />
                <MetricCard
                    title="Remaining Balance"
                    value={formatCurrency(totalOutstanding)}
                    icon={<PiggyBank className="h-5 w-5 text-purple-600 dark:text-purple-400" />}
                    description="Total outstanding amount"
                />
            </div>

            {/* Charts Grid */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Transaction Flow - Area Chart */}
                <Card className={cn(
                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                )}>
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Transaction Flow</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Monthly transaction amounts by type
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {!chartData || chartData.monthlyData.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                                        No transaction data available yet
                                    </p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartData.monthlyData}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#10B981" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#10B981" stopOpacity={0.05} />
                                            </linearGradient>
                                            <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            className="stroke-gray-200 dark:stroke-gray-700"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 11 }}
                                            className="fill-gray-500 dark:fill-gray-400"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            className="fill-gray-500 dark:fill-gray-400"
                                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            wrapperStyle={{ fontSize: '12px' }}
                                            iconType="circle"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="income"
                                            name="Income"
                                            stroke="#10B981"
                                            strokeWidth={3}
                                            fill="url(#incomeGradient)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="expense"
                                            name="Expense"
                                            stroke="#EF4444"
                                            strokeWidth={3}
                                            fill="url(#expenseGradient)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Loan Activity - Stacked Area Chart */}
                <Card className={cn(
                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                )}>
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Loan Activity</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Monthly loan disbursements and collections
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            {!chartData || chartData.loanTrends.length === 0 ? (
                                <div className="flex items-center justify-center h-full">
                                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                                        No loan activity data available yet
                                    </p>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart
                                        data={chartData.loanTrends}
                                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                                    >
                                        <defs>
                                            <linearGradient id="disbursementGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#818CF8" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.3} />
                                            </linearGradient>
                                            <linearGradient id="collectionGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#C4F546" stopOpacity={0.6} />
                                                <stop offset="95%" stopColor="#C4F546" stopOpacity={0.2} />
                                            </linearGradient>
                                            <linearGradient id="interestGrad" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#A78BFA" stopOpacity={0.5} />
                                                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.2} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid
                                            strokeDasharray="3 3"
                                            className="stroke-gray-200 dark:stroke-gray-700"
                                            vertical={false}
                                        />
                                        <XAxis
                                            dataKey="month"
                                            tick={{ fontSize: 11 }}
                                            className="fill-gray-500 dark:fill-gray-400"
                                        />
                                        <YAxis
                                            tick={{ fontSize: 11 }}
                                            className="fill-gray-500 dark:fill-gray-400"
                                            tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                                        />
                                        <Tooltip content={<CustomTooltip />} />
                                        <Legend
                                            wrapperStyle={{ fontSize: '12px' }}
                                            iconType="circle"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="disbursements"
                                            name="Disbursements"
                                            stackId="1"
                                            stroke="#818CF8"
                                            fill="url(#disbursementGrad)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="payments"
                                            name="Collections"
                                            stackId="1"
                                            stroke="#C4F546"
                                            fill="url(#collectionGrad)"
                                        />
                                        <Area
                                            type="monotone"
                                            dataKey="interest"
                                            name="Interest"
                                            stackId="1"
                                            stroke="#A78BFA"
                                            fill="url(#interestGrad)"
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction Distribution - Horizontal Bar Chart */}
                {/* Transaction Distribution - Horizontal Bar Chart */}
                <Card className={cn(
                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                )}>
                    {/* Title Section */}
                    <CardHeader>
                        <CardTitle className="text-lg">Transaction Distribution</CardTitle>
                        <CardDescription className="text-sm text-gray-500 dark:text-gray-400">
                            Breakdown by type
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {/* FIX: give the chart a fixed height so ResponsiveContainer can size itself */}
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                {(() => {
                                    const typeLabels: Record<string, string> = {
                                        EXPENSE: "Expenses",
                                        INCOME: "Income",
                                        LOAN_PAYMENT: "Loan Payments",
                                        LOAN_DISBURSEMENT: "Loan Disbursements",
                                        TRANSFER: "Transfers"
                                    };

                                    const colorMap: Record<string, { start: string; end: string }> = {
                                        EXPENSE: { start: "#F43F5E", end: "#FB7185" },
                                        INCOME: { start: "#8B5CF6", end: "#A78BFA" },
                                        LOAN_PAYMENT: { start: "#3B82F6", end: "#60A5FA" },
                                        LOAN_DISBURSEMENT: { start: "#14B8A6", end: "#2DD4BF" },
                                        TRANSFER: { start: "#F59E0B", end: "#FBBF24" }
                                    };

                                    const data = (chartData?.typeBreakdown || []).map((item: any, index: number) => ({
                                        ...item,
                                        amount: Number(item.amount) || 0, // ensure number
                                        displayName: typeLabels[item.type] || item.type,
                                        gradientId: `barGradient${index}`,
                                        color: colorMap[item.type] || { start: "#94A3B8", end: "#CBD5E1" }
                                    }));

                                    const renderLegend = () => (
                                        <div className="flex flex-wrap gap-4 px-2 pb-2">
                                            {data.map((item: any, index: number) => (
                                                <div key={index} className="flex items-center space-x-2">
                                                    <div
                                                        className="w-4 h-4 rounded"
                                                        style={{
                                                            background: `linear-gradient(to right, ${item.color.start}, ${item.color.end})`
                                                        }}
                                                    />
                                                    <span className="text-sm text-gray-700 dark:text-gray-300">
                                                        {item.displayName}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    );

                                    return (
                                        <BarChart
                                            data={data}
                                            layout="vertical"
                                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                            barSize={28}
                                            // optional safety if you want to limit bar width
                                            maxBarSize={40}
                                        >
                                            {/* Gradients */}
                                            <defs>
                                                {data.map((item: any, index: number) => (
                                                    <linearGradient key={index} id={item.gradientId} x1="0" y1="0" x2="1" y2="0">
                                                        <stop offset="0%" stopColor={item.color.start} />
                                                        <stop offset="100%" stopColor={item.color.end} />
                                                    </linearGradient>
                                                ))}
                                            </defs>

                                            <CartesianGrid
                                                strokeDasharray="3 3"
                                                className="stroke-gray-200/20 dark:stroke-gray-700/20"
                                                horizontal={false}
                                            />

                                            {/* Hide Y Axis labels */}
                                            <YAxis type="category" dataKey="displayName" hide />

                                            {/* Keep numeric X Axis transparent but set domain to [0, dataMax] to avoid weird auto-scaling */}
                                            <XAxis
                                                type="number"
                                                hide
                                                domain={[0, 'dataMax']}
                                            />

                                            {/* Tooltip */}
                                            <Tooltip
                                                formatter={(v: any) => formatCurrency(Number(v))}
                                                contentStyle={{
                                                    backgroundColor: "rgba(17, 24, 39, 0.95)",
                                                    border: "1px solid rgba(75,85,99,0.3)",
                                                    borderRadius: "0.75rem",
                                                    fontSize: "12px",
                                                    color: "#fff",
                                                    padding: "12px",
                                                    boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                                                }}
                                                cursor={{ fill: "rgba(100, 116, 139, 0.04)" }}
                                            />

                                            {/* Bars */}
                                            <Bar dataKey="amount" radius={[0, 12, 12, 0]}>
                                                {data.map((entry: any, index: number) => (
                                                    <Cell
                                                        key={index}
                                                        fill={`url(#${entry.gradientId})`}
                                                        className="transition-opacity hover:opacity-90"
                                                    />
                                                ))}
                                            </Bar>

                                            {/* Legend */}
                                            <Legend
                                                verticalAlign="top"
                                                align="left"
                                                height={60}
                                                content={renderLegend}
                                            />
                                        </BarChart>
                                    );
                                })()}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>



                {/* Recent Activity */}
                <Card className={cn(
                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                )}>
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Recent Activity</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Latest transactions
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {!dashboard.recentTransactions || dashboard.recentTransactions.length === 0 ? (
                                <div className="flex items-center justify-center h-32">
                                    <p className="text-gray-400 dark:text-gray-500 text-sm">
                                        No recent transactions
                                    </p>
                                </div>
                            ) : (
                                dashboard.recentTransactions.slice(0, 5).map((transaction: Transaction) => {
                                    const isIncome = transaction.type === 'INCOME' || transaction.isLoanPayment;

                                    return (
                                        <div
                                            key={transaction.id}
                                            className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all group"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110",
                                                    isIncome
                                                        ? "bg-gradient-to-br from-emerald-400 to-emerald-600"
                                                        : "bg-gradient-to-br from-red-400 to-red-600"
                                                )}>
                                                    {isIncome ? (
                                                        <ArrowDownRight className="h-5 w-5 text-white" />
                                                    ) : (
                                                        <ArrowUpRight className="h-5 w-5 text-white" />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900 dark:text-white">
                                                        {transaction.description || 'N/A'}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {new Date(transaction.date).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn(
                                                    "text-sm font-bold",
                                                    isIncome ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                                                )}>
                                                    {isIncome ? '+' : '-'}{formatCurrency(parseFloat(transaction.amount))}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardCharts;