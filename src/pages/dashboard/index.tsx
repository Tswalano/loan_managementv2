/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { formatCurrency } from '@/lib/utils/formatters';
import { Wallet, TrendingUp, Users, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useFinanceData } from '@/lib/api';
import { cn } from '@/lib/utils';
import { MetricCard } from '@/components/dashboard/MetricCard';

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

const DashboardCharts: React.FC = () => {
    const { isLoading, dashboard } = useFinanceData();

    // Process transaction data
    const processedData = useMemo(() => {
        if (!dashboard?.recentTransactions) return null;

        const transactions = dashboard.recentTransactions as Transaction[];

        // Group by month
        const monthlyData = transactions.reduce((acc: any, transaction) => {
            const date = new Date(transaction.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!acc[monthKey]) {
                acc[monthKey] = {
                    month: date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
                    disbursements: 0,
                    payments: 0,
                    expenses: 0,
                    income: 0,
                    interest: 0
                };
            }

            const amount = parseFloat(transaction.amount);

            if (transaction.isLoanDisbursement) {
                acc[monthKey].disbursements += amount;
                acc[monthKey].expenses += amount;
            } else if (transaction.isLoanPayment) {
                acc[monthKey].payments += amount;
                acc[monthKey].income += amount;
                acc[monthKey].interest += amount * 0.1; // Estimate 10% as interest
            } else if (transaction.type === 'EXPENSE') {
                acc[monthKey].expenses += amount;
            } else {
                acc[monthKey].income += amount;
            }

            return acc;
        }, {});

        // Convert to array and sort by date
        const monthlyArray = Object.keys(monthlyData)
            .sort()
            .map(key => monthlyData[key]);

        // Calculate transaction type breakdown
        const typeBreakdown = transactions.reduce((acc: any, transaction) => {
            const type = transaction.isLoanDisbursement
                ? 'EXPENSE'
                : transaction.isLoanPayment
                    ? 'LOAN_PAYMENT'
                    : transaction.type;

            if (!acc[type]) {
                acc[type] = 0;
            }
            acc[type] += parseFloat(transaction.amount);
            return acc;
        }, {});

        const typeBreakdownArray = Object.entries(typeBreakdown).map(([type, amount]) => ({
            type,
            amount: amount as number,
            label: type === 'EXPENSE' ? 'Expenses' :
                type === 'LOAN_PAYMENT' ? 'Loan Payments' :
                    type === 'INCOME' ? 'Income' : type
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

    const metrics = dashboard as DashboardMetrics;
    const totalLoaned = parseFloat(metrics.totalLoaned);
    const totalOutstanding = parseFloat(metrics.totalOutstanding);
    // const collectionRate = totalLoaned > 0 ? ((totalLoaned - totalOutstanding) / totalLoaned) * 100 : 0;

    console.log("Processed Data:", processedData);

    return (
        <div className="space-y-8">
            {/* Metrics Cards */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <MetricCard
                    title="Total Loan Amount"
                    value={formatCurrency(totalLoaned)}
                    icon={<Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />}
                    trend={{
                        value: 0,
                        label: "collected",
                        isPositive: false
                    }}
                />
                <MetricCard
                    title="Total Interest"
                    value={formatCurrency(totalLoaned * 0.1)}
                    icon={<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
                    description="Based on active loans"
                />
                <MetricCard
                    title="Total Bank Balance"
                    value={formatCurrency(parseFloat(metrics.totalBalance))}
                    icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
                    trend={{
                        value: 100,
                        label: "growth rate",
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
                {/* Transaction Flow - Smooth Area Chart */}
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
                        <div className="h-[300px] relative">
                            <svg width="100%" height="100%" className="overflow-visible">
                                <defs>
                                    <linearGradient id="incomeGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
                                    </linearGradient>
                                    <linearGradient id="expenseGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#EF4444" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#EF4444" stopOpacity="0.05" />
                                    </linearGradient>
                                </defs>

                                {processedData && processedData.monthlyData.length > 0 && (
                                    <>
                                        {/* Grid lines */}
                                        {[0, 25, 50, 75, 100].map((percent, i) => (
                                            <g key={i}>
                                                <line
                                                    x1="40"
                                                    y1={250 - (percent * 2)}
                                                    x2="100%"
                                                    y2={250 - (percent * 2)}
                                                    stroke="currentColor"
                                                    className="stroke-gray-200 dark:stroke-gray-700"
                                                    strokeDasharray="4 4"
                                                    strokeWidth="1"
                                                />
                                                <text
                                                    x="5"
                                                    y={255 - (percent * 2)}
                                                    className="fill-gray-500 dark:fill-gray-400 text-xs"
                                                >
                                                    {percent * 40}K
                                                </text>
                                            </g>
                                        ))}

                                        {(() => {
                                            const data = processedData.monthlyData.slice(-8);
                                            const maxValue = Math.max(...data.map((d: any) => Math.max(d.income, d.expenses)));
                                            // const width = 100 / data.length;

                                            // Income path
                                            const incomePath = data.map((d: any, i: number) => {
                                                const x = 40 + (i * (100 - 40) / (data.length - 1));
                                                const y = 250 - ((d.income / maxValue) * 200);
                                                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                            }).join(' ');

                                            // Expense path
                                            const expensePath = data.map((d: any, i: number) => {
                                                const x = 40 + (i * (100 - 40) / (data.length - 1));
                                                const y = 250 - ((d.expenses / maxValue) * 200);
                                                return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                            }).join(' ');

                                            return (
                                                <g>
                                                    {/* Income area */}
                                                    <path
                                                        d={`${incomePath} L ${40 + ((data.length - 1) * (100 - 40) / (data.length - 1))} 250 L 40 250 Z`}
                                                        fill="url(#incomeGradient)"
                                                    />
                                                    <path
                                                        d={incomePath}
                                                        fill="none"
                                                        stroke="#10B981"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />

                                                    {/* Expense area */}
                                                    <path
                                                        d={`${expensePath} L ${40 + ((data.length - 1) * (100 - 40) / (data.length - 1))} 250 L 40 250 Z`}
                                                        fill="url(#expenseGradient)"
                                                    />
                                                    <path
                                                        d={expensePath}
                                                        fill="none"
                                                        stroke="#EF4444"
                                                        strokeWidth="3"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />

                                                    {/* X-axis labels */}
                                                    {data.map((d: any, i: number) => (
                                                        <text
                                                            key={i}
                                                            x={40 + (i * (100 - 40) / (data.length - 1))}
                                                            y="280"
                                                            textAnchor="middle"
                                                            className="fill-gray-500 dark:fill-gray-400 text-xs"
                                                        >
                                                            {d.month}
                                                        </text>
                                                    ))}
                                                </g>
                                            );
                                        })()}
                                    </>
                                )}
                            </svg>
                        </div>

                        {/* Legend */}
                        <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Income</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-gray-600 dark:text-gray-400">Expense</span>
                            </div>
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
                        <div className="h-[300px] relative">
                            <svg width="100%" height="100%" className="overflow-visible">
                                <defs>
                                    <linearGradient id="disbursementGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#818CF8" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#6366F1" stopOpacity="0.3" />
                                    </linearGradient>
                                    <linearGradient id="collectionGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#C4F546" stopOpacity="0.6" />
                                        <stop offset="100%" stopColor="#C4F546" stopOpacity="0.2" />
                                    </linearGradient>
                                    <linearGradient id="interestGradient" x1="0" x2="0" y1="0" y2="1">
                                        <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.5" />
                                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.2" />
                                    </linearGradient>
                                </defs>

                                {processedData && processedData.monthlyData.length > 0 && (() => {
                                    const data = processedData.monthlyData.slice(-8);
                                    const maxValue = Math.max(...data.map((d: any) => d.disbursements + d.payments + d.interest));

                                    // Create stacked paths
                                    const disbursementPath = data.map((d: any, i: number) => {
                                        const x = 40 + (i * (100 - 40) / (data.length - 1));
                                        const y = 250 - ((d.disbursements / maxValue) * 200);
                                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                    }).join(' ');

                                    const paymentPath = data.map((d: any, i: number) => {
                                        const x = 40 + (i * (100 - 40) / (data.length - 1));
                                        const y = 250 - (((d.disbursements + d.payments) / maxValue) * 200);
                                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                    }).join(' ');

                                    const interestPath = data.map((d: any, i: number) => {
                                        const x = 40 + (i * (100 - 40) / (data.length - 1));
                                        const y = 250 - (((d.disbursements + d.payments + d.interest) / maxValue) * 200);
                                        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
                                    }).join(' ');

                                    return (
                                        <g>
                                            {/* Grid */}
                                            {[0, 25, 50, 75, 100].map((percent, i) => (
                                                <line
                                                    key={i}
                                                    x1="40"
                                                    y1={250 - (percent * 2)}
                                                    x2="100%"
                                                    y2={250 - (percent * 2)}
                                                    stroke="currentColor"
                                                    className="stroke-gray-200 dark:stroke-gray-700"
                                                    strokeDasharray="4 4"
                                                    strokeWidth="1"
                                                />
                                            ))}

                                            {/* Disbursements */}
                                            <path
                                                d={`${disbursementPath} L ${40 + ((data.length - 1) * (100 - 40) / (data.length - 1))} 250 L 40 250 Z`}
                                                fill="url(#disbursementGradient)"
                                            />

                                            {/* Payments */}
                                            <path
                                                d={`${paymentPath} L ${40 + ((data.length - 1) * (100 - 40) / (data.length - 1))} 250 L 40 250 Z`}
                                                fill="url(#collectionGradient)"
                                            />

                                            {/* Interest */}
                                            <path
                                                d={`${interestPath} L ${40 + ((data.length - 1) * (100 - 40) / (data.length - 1))} 250 L 40 250 Z`}
                                                fill="url(#interestGradient)"
                                            />

                                            {/* X-axis labels */}
                                            {data.map((d: any, i: number) => (
                                                <text
                                                    key={i}
                                                    x={40 + (i * (100 - 40) / (data.length - 1))}
                                                    y="280"
                                                    textAnchor="middle"
                                                    className="fill-gray-500 dark:fill-gray-400 text-xs"
                                                >
                                                    {d.month}
                                                </text>
                                            ))}
                                        </g>
                                    );
                                })()}
                            </svg>
                        </div>

                        <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Disbursements</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-[#C4F546] rounded-full"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Collections</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <span className="text-xs text-gray-600 dark:text-gray-400">Interest</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Transaction Distribution - Horizontal Bars */}
                <Card className={cn(
                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                )}>
                    <CardHeader>
                        <CardTitle className="text-gray-900 dark:text-white">Transaction Distribution</CardTitle>
                        <CardDescription className="text-gray-600 dark:text-gray-400">
                            Breakdown by transaction type
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-5">
                            {processedData?.typeBreakdown.slice(0, 5).map((item: any, index: number) => {
                                const maxAmount = processedData.typeBreakdown[0].amount;
                                const percentage = (item.amount / maxAmount) * 100;

                                const colors = [
                                    'from-red-500 to-red-600',
                                    'from-[#C4F546] to-green-500',
                                    'from-purple-500 to-purple-600',
                                    'from-blue-500 to-blue-600',
                                    'from-orange-500 to-orange-600'
                                ];

                                return (
                                    <div key={index} className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                {item.label}
                                            </span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white">
                                                {formatCurrency(item.amount)}
                                            </span>
                                        </div>
                                        <div className="relative w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                                            <div
                                                className={`h-full bg-gradient-to-r ${colors[index % colors.length]} rounded-full transition-all duration-1000 ease-out shadow-lg`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Active Loans Trend */}
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
                            {metrics.recentTransactions.slice(0, 5).map((transaction) => {
                                const isIncome = transaction.isLoanPayment;

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
                                                    {transaction.description}
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
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default DashboardCharts;