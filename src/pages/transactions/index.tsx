/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search, ChevronLeft, ChevronRight, Filter, Download, X, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';
import { formatCurrency, formatShortDate, maskAccountLast8Grouped, truncateText } from '@/lib/utils/formatters';
import { CreateTransactionRequest, Transaction, TransactionType } from '@/types';
import ViewTransactionDialog from '@/components/transactions/transaction-dialog';
import { LoanDetailsDialog } from '@/components/loans/loan-details-dialog';
import TransactionForm from '@/components/transactions/transaction-form';
import { useToast } from "@/hooks/use-toast";
import { api, useFinanceData } from '@/lib/api';
import { cn } from '@/lib/utils';

type TransactionFilter = 'ALL' | 'LOAN' | 'INCOME' | 'TRANSFER' | 'EXPENSE';
type TransactionFlow = 'income' | 'expense' | 'transfer';

export default function TransactionsPage() {
    const { toast } = useToast();
    const {
        isLoading,
        transactions,
        balances,
    } = useFinanceData();

    const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<TransactionFilter>('ALL');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [startDate, setStartDate] = useState<string>('');
    const [endDate, setEndDate] = useState<string>('');
    const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);
    const [viewLoanId, setViewLoanId] = useState<string | null>(null);

    // Pagination and row limit state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const rowOptions = [10, 20, 50];

    // console.log("Transactions loaded:", transactions.fromBalance.accountName, transactions.fromBalance.accountNumber);

    const handleTransactionCreate = async (formData: CreateTransactionRequest) => {
        try {
            console.log("Creating transaction with data:", formData);

            if (formData.type === 'LOAN_DISBURSEMENT') {
                console.log("Handling loan disbursement transaction", formData);
                api.createLoan({
                    balanceId: formData.fromBalanceId!,
                    borrowerName: formData.description || 'Unnamed Borrower',
                    borrowerEmail: formData.metadata?.borrowerEmail || '',
                    borrowerPhone: formData.metadata?.borrowerPhone || '',
                    principalAmount: formData.amount,
                    interestRate: 30,
                    termMonths: 12,
                    metadata: {
                        notes: 'Disbursed via transaction form',
                    }
                })
            } else {
                await api.createTransaction({
                    date: formData.date,
                    amount: formData.amount.toString(),
                    type: formData.type,
                    category: formData.category,
                    description: formData.description,
                    fromBalanceId: formData.type === 'INCOME' ? undefined : formData.fromBalanceId,
                    toBalanceId: formData.type === 'INCOME' ? formData.fromBalanceId : undefined,
                });
            }

            toast({
                title: "Success",
                description: "Transaction created successfully",
                variant: "default",
            });
            setIsNewTransactionOpen(false);
        } catch (error: any) {
            console.log("Error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to create transaction. Please try again.",
                variant: "destructive",
            });
        }
    };

    const getTransactionFlow = (type: TransactionType): TransactionFlow => {
        if ([TransactionType.INCOME, TransactionType.INTEREST, TransactionType.DEPOSIT, TransactionType.LOAN_PAYMENT].includes(type)) {
            return 'income';
        }
        if (type === TransactionType.TRANSFER) {
            return 'transfer';
        }
        return 'expense';
    };

    const getFlowLabel = (type: TransactionType): string => {
        const flow = getTransactionFlow(type);
        if (flow === 'income') return 'Income';
        if (flow === 'expense') return 'Expense';
        return 'Transfer';
    };

    const getFlowColor = (type: TransactionType): string => {
        const flow = getTransactionFlow(type);
        if (flow === 'income') {
            return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
        }
        if (flow === 'expense') {
            return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
        }
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300';
    };

    const matchesSelectedFilter = (type: TransactionType) => {
        if (selectedType === 'ALL') return true;
        if (selectedType === 'LOAN') {
            return type === TransactionType.LOAN_DISBURSEMENT || type === TransactionType.LOAN_PAYMENT;
        }
        if (selectedType === 'INCOME') {
            return type === TransactionType.INCOME || type === TransactionType.INTEREST || type === TransactionType.DEPOSIT;
        }
        if (selectedType === 'TRANSFER') {
            return type === TransactionType.TRANSFER;
        }
        return type === TransactionType.EXPENSE || type === TransactionType.FEE || type === TransactionType.WITHDRAWAL;
    };

    const filterOptions: Array<{ value: TransactionFilter; label: string }> = [
        { value: 'LOAN', label: 'Loan' },
        { value: 'INCOME', label: 'Income' },
        { value: 'TRANSFER', label: 'Transfer' },
        { value: 'EXPENSE', label: 'Expense' },
    ];

    const filteredTransactions = transactions.filter((transaction: Transaction) => {
        const description = transaction.description || '';
        const category = transaction.category || '';

        const matchesType = matchesSelectedFilter(transaction.type);
        const matchesSearch =
            description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase());

        const txDate = new Date(transaction.date);
        const matchesStart = !startDate || txDate >= new Date(startDate);
        const matchesEnd = !endDate || txDate <= new Date(endDate + 'T23:59:59');

        return matchesType && matchesSearch && matchesStart && matchesEnd;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

    const hasActiveFilters = selectedType !== 'ALL' || searchTerm || startDate || endDate;

    const clearFilters = () => {
        setSelectedType('ALL');
        setSearchTerm('');
        setStartDate('');
        setEndDate('');
        setCurrentPage(1);
    };

    const exportToExcel = () => {
        const wsData = [
            ['Date', 'Description', 'Category', 'Type', 'Amount', 'Reference', 'Account'],
            ...filteredTransactions.map((t: Transaction) => [
                formatShortDate(new Date(t.date)),
                t.description || '',
                t.category || '',
                t.type,
                Number(t.amount),
                t.reference || '',
                t.fromBalance?.accountName || t.toBalance?.accountName || '',
            ]),
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        ws['!cols'] = [{ wch: 14 }, { wch: 40 }, { wch: 18 }, { wch: 20 }, { wch: 14 }, { wch: 20 }, { wch: 24 }];
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Transactions');
        XLSX.writeFile(wb, `transactions_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    console.log("Rendering TransactionsPage:", currentTransactions);

    const EmptyState = () => (
        <div className="space-y-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Transactions Summary
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Track your income, expenses, and loan transactions
                    </p>
                </div>
                <Button
                    onClick={() => setIsNewTransactionOpen(true)}
                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    New Transaction
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
                        No transactions yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                        Start tracking your transactions, monitor payments, and manage your lending business efficiently.
                    </p>
                    <Button
                        onClick={() => setIsNewTransactionOpen(true)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        Create Your First Transaction
                    </Button>
                </CardContent>
            </Card>
        </div>
    );

    if (isLoading && transactions.length === 0) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-emerald-600 dark:border-t-[#C4F546]" />
            </div>
        );
    }

    if (!isLoading && transactions.length === 0) {
        return (
            <>
                <EmptyState />
                <TransactionForm
                    balances={balances}
                    open={isNewTransactionOpen}
                    onClose={() => setIsNewTransactionOpen(false)}
                    onSubmit={handleTransactionCreate}
                />
            </>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Transactions Summary
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Track your income, expenses, and loan transactions
                    </p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                            const today = new Date().toISOString().slice(0, 10);
                            setStartDate(startDate || today);
                            setEndDate(endDate || today);
                            setCurrentPage(1);
                        }}
                        className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Filter Date
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={exportToExcel}
                        className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setIsNewTransactionOpen(true)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Transaction
                    </Button>
                </div>
            </div>

            {/* Main Card */}
            <Card className={cn(
                "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                "border border-gray-200/50 dark:border-gray-700/50",
                "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
            )}>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle className="text-gray-900 dark:text-white">All Transactions</CardTitle>
                            <CardDescription className="text-gray-600 dark:text-gray-400">
                                Showing {startIndex + 1} to {Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                            </CardDescription>
                        </div>
                        <Select
                            value={rowsPerPage.toString()}
                            onValueChange={(value) => {
                                setRowsPerPage(Number(value));
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-32 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600">
                                <SelectValue placeholder="Rows per page" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                {rowOptions.map(option => (
                                    <SelectItem key={option} value={option.toString()}>
                                        {option} rows
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                            />
                        </div>
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full sm:w-44 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                        />
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="w-full sm:w-44 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                        />
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={clearFilters}
                                className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                            >
                                <X className="h-4 w-4 mr-2" />
                                Clear
                            </Button>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className={cn(
                                    "transition-all duration-200",
                                    selectedType === 'ALL'
                                        ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                                        : "bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                                )}
                                onClick={() => {
                                    setSelectedType('ALL');
                                    setCurrentPage(1);
                                }}
                            >
                                <Filter className="h-3.5 w-3.5 mr-1.5" />
                                All
                            </Button>
                            {filterOptions.map((option) => (
                                <Button
                                    key={option.value}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "transition-all duration-200",
                                        selectedType === option.value
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                                            : "bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                                    )}
                                    onClick={() => {
                                        setSelectedType(option.value);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {option.label}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Date</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Description</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Account</TableHead>
                                    <TableHead className="font-semibold text-gray-700 dark:text-gray-300">Type</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Amount</TableHead>
                                    <TableHead className="text-right font-semibold text-gray-700 dark:text-gray-300">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12">
                                            <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                <div className="h-6 w-6 animate-spin rounded-full border-3 border-gray-300 dark:border-gray-700 border-t-emerald-600 dark:border-t-[#C4F546] mr-3" />
                                                Loading transactions...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : currentTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-12">
                                            <div className="text-gray-500 dark:text-gray-400">
                                                No transactions found
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentTransactions.map((transaction: Transaction, index: number) => (
                                        <TableRow
                                            key={transaction.id}
                                            className={cn(
                                                "transition-colors duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50",
                                                index % 2 === 0 ? "bg-white dark:bg-gray-900/40" : "bg-gray-50/50 dark:bg-gray-900/20"
                                            )}
                                        >
                                            <TableCell className="font-medium text-gray-900 dark:text-white">
                                                {formatShortDate(new Date(transaction.date))}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {truncateText(transaction.description || '', 60)}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                    {transaction.reference || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {
                                                    transaction.fromBalance || transaction.toBalance
                                                        ? (
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {transaction.fromBalance?.accountName || transaction.toBalance?.accountName || 'Outgoing Transfer'}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                                    {transaction.fromBalance?.accountNumber ? maskAccountLast8Grouped(transaction.fromBalance.accountNumber) :
                                                                        transaction.toBalance?.accountNumber ? maskAccountLast8Grouped(transaction.toBalance.accountNumber) : 'Outgoing Acct'}
                                                                </div>
                                                            </div>
                                                        )
                                                        : (
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                Outgoing Transfer
                                                            </div>
                                                        )
                                                }
                                            </TableCell>
                                            <TableCell>
                                                <span className={cn(
                                                    "px-3 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1",
                                                    getFlowColor(transaction.type)
                                                )}>
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        getTransactionFlow(transaction.type) === 'income' && "bg-emerald-600 dark:bg-emerald-400",
                                                        getTransactionFlow(transaction.type) === 'expense' && "bg-red-600 dark:bg-red-400",
                                                        getTransactionFlow(transaction.type) === 'transfer' && "bg-slate-500 dark:bg-slate-400"
                                                    )} />
                                                    {getFlowLabel(transaction.type)}
                                                </span>
                                            </TableCell>
                                            <TableCell className={cn(
                                                "text-right font-bold",
                                                getTransactionFlow(transaction.type) === 'income' && 'text-emerald-600 dark:text-emerald-400',
                                                getTransactionFlow(transaction.type) === 'expense' && 'text-red-600 dark:text-red-400',
                                                getTransactionFlow(transaction.type) === 'transfer' && 'text-slate-600 dark:text-slate-300'
                                            )}>
                                                {formatCurrency(Number(transaction.amount) || 0)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className={cn(
                                                        "bg-emerald-50 dark:bg-emerald-900/20",
                                                        "border-emerald-200 dark:border-emerald-800/30",
                                                        "text-emerald-700 dark:text-emerald-400",
                                                        "hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                                                    )}
                                                    onClick={() => setViewTransaction(transaction)}
                                                >
                                                    View Details
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination Controls */}
                    {filteredTransactions.length > 0 && (
                        <div className="flex items-center justify-between mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={cn(
                                                currentPage === pageNum
                                                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800"
                                                    : "bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                                            )}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 disabled:opacity-50"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialogs */}
            <TransactionForm
                balances={balances}
                open={isNewTransactionOpen}
                onClose={() => setIsNewTransactionOpen(false)}
                onSubmit={handleTransactionCreate}
            />

            <ViewTransactionDialog
                transaction={viewTransaction}
                open={!!viewTransaction}
                onClose={() => setViewTransaction(null)}
                onViewLoan={(loanId) => {
                    setViewTransaction(null);
                    setViewLoanId(loanId);
                }}
            />

            <LoanDetailsDialog
                loanId={viewLoanId}
                open={!!viewLoanId}
                onClose={() => setViewLoanId(null)}
            />
        </div>
    );
}
