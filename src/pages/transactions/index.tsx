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
import { Plus, Search, Download, Calendar, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { formatCurrency, formatShortDate, maskAccountLast8Grouped, truncateText } from '@/lib/utils/formatters';
import { CreateTransactionRequest, Transaction, TransactionType } from '@/types';
import ViewTransactionDialog from '@/components/transactions/transaction-dialog';
import TransactionForm from '@/components/transactions/transaction-form';
import { useToast } from "@/hooks/use-toast";
import { api, useFinanceData } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function TransactionsPage() {
    const { toast } = useToast();
    const {
        isLoading,
        transactions,
        balances,
    } = useFinanceData();

    const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);

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

    const getTypeColor = (type: TransactionType): string => {
        const colors: Partial<Record<TransactionType, string>> = {
            INCOME: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
            EXPENSE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
            LOAN_PAYMENT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
            LOAN_DISBURSEMENT: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        };
        return colors[type] ?? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
    };

    const filteredTransactions = transactions.filter((transaction: Transaction) => {
        const description = transaction.description || '';
        const category = transaction.category || '';

        const matchesType = selectedType === 'ALL' || transaction.type === selectedType;
        const matchesSearch =
            description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.toLowerCase().includes(searchTerm.toLowerCase());

        return matchesType && matchesSearch;
    });

    // Pagination calculations
    const totalPages = Math.ceil(filteredTransactions.length / rowsPerPage);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const currentTransactions = transactions.slice(startIndex, endIndex);

    console.log("Rendering TransactionsPage:", currentTransactions);

    const EmptyState = () => (
        <div className="p-8 min-h-screen">
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
            <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-950">
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
        <div className="p-8 space-y-8 min-h-screen">
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
                        size="sm"
                        variant="outline"
                        className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-800/80"
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Filter Date
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
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
                            {Object.values(TransactionType).map((type) => (
                                <Button
                                    key={type}
                                    variant="outline"
                                    size="sm"
                                    className={cn(
                                        "transition-all duration-200",
                                        selectedType === type
                                            ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                                            : "bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                                    )}
                                    onClick={() => {
                                        setSelectedType(type);
                                        setCurrentPage(1);
                                    }}
                                >
                                    {type.replace('_', ' ')}
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
                                                    getTypeColor(transaction.type)
                                                )}>
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        transaction.type === 'INCOME' && "bg-emerald-600 dark:bg-emerald-400",
                                                        transaction.type === 'EXPENSE' && "bg-orange-600 dark:bg-orange-400",
                                                        transaction.type === 'LOAN_PAYMENT' && "bg-yellow-600 dark:bg-yellow-400",
                                                        transaction.type === 'LOAN_DISBURSEMENT' && "bg-red-600 dark:bg-red-400",
                                                        transaction.type === 'TRANSFER' && "bg-lime-600 dark:bg-lime-400"
                                                    )} />
                                                    {transaction.type.replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell className={cn(
                                                "text-right font-bold",
                                                ['INCOME', 'LOAN_PAYMENT'].includes(transaction.type)
                                                    ? 'text-emerald-600 dark:text-emerald-400'
                                                    : 'text-red-600 dark:text-red-400'
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
            />
        </div>
    );
}