import { useState, useEffect } from 'react';
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
import { Plus, Search, Download, Calendar, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatShortDate, generateReferenceNumber, truncateText } from '@/lib/utils/formatters';
import type { Transaction, TransactionType } from '@/types';
import ViewTransactionDialog from '@/components/transactions/transaction-dialog';
import TransactionForm from '@/components/transactions/transaction-form';
import { useToast } from "@/hooks/use-toast";

export default function TransactionsPage() {
    const { toast } = useToast();
    const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<TransactionType | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);

    // Pagination and row limit state
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const rowOptions = [10, 20, 50];

    useEffect(() => {
        if (error) {
            toast({
                title: "Error Loading Transactions",
                description: (error as Error).message,
                variant: "destructive",
            });
        }
    }, [error, toast]);

    const handleTransactionCreate = async (formData: NewTransaction) => {
        try {
            if (formData.type === 'EXPENSE') {
                const reference = generateReferenceNumber('EXPENSE');
                await recordExpense({
                    date: formData.date,
                    amount: formData.amount.toString(),
                    type: formData.type,
                    category: formData.category,
                    description: formData.description,
                    toBalanceId: formData.fromBalanceId,
                    fromBalanceId: formData.toBalanceId,
                    reference
                });
            } else {
                const reference = generateReferenceNumber('INCOME');
                await recordTransaction.mutateAsync({
                    date: formData.date,
                    amount: formData.amount.toString(),
                    type: formData.type,
                    category: formData.category,
                    description: formData.description,
                    toBalanceId: formData.fromBalanceId,
                    fromBalanceId: formData.toBalanceId,
                    reference
                });
            }

            toast({
                title: "Success",
                description: "Transaction created successfully",
                variant: "default",
            });
            setIsNewTransactionOpen(false);
        } catch (error) {
            console.log("Error,", error);
            toast({
                title: "Error",
                description: "Failed to create transaction. Please try again.",
                variant: "destructive",
            });
        }
    };

    const getTypeColor = (type: TransactionType): string => {
        const colors: Partial<Record<TransactionType, string>> = {
            INCOME: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
            EXPENSE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            LOAN_PAYMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            LOAN_DISBURSEMENT: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        };
        return colors[type] ?? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    };

    const filteredTransactions = transactions.filter(transaction => {
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
    const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

    const EmptyState = () => (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                        Transactions Summary
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Track your income, expenses, and loan transactions
                    </p>
                </div>
                <Button
                    onClick={() => setIsNewTransactionOpen(true)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
                >
                    <Plus className="h-4 w-4" />
                    New Transaction
                </Button>
            </div>

            <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800">
                    <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/20 p-3 mb-4">
                        <Plus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        No transactions yet
                    </h3>
                    <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4">
                        Start tracking your transactions, monitor payments, and manage your lending business efficiently.
                    </p>
                    <Button
                        onClick={() => setIsNewTransactionOpen(true)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
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
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
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
        <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
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
                        className="bg-white dark:bg-gray-800"
                    >
                        <Calendar className="h-4 w-4 mr-2" />
                        Filter Date
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="bg-white dark:bg-gray-800"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => setIsNewTransactionOpen(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        New Transaction
                    </Button>
                </div>
            </div>

            {/* Main Card */}
            <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardHeader>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <CardTitle>All Transactions</CardTitle>
                            <CardDescription>
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
                            <SelectTrigger className="w-32">
                                <SelectValue placeholder="Rows per page" />
                            </SelectTrigger>
                            <SelectContent>
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
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="pl-10"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(['ALL', 'INCOME', 'EXPENSE', 'LOAN_PAYMENT', 'LOAN_DISBURSEMENT'] as const).map((type) => (
                                <Button
                                    key={type}
                                    variant={selectedType === type ? "default" : "outline"}
                                    size="sm"
                                    className={selectedType === type ?
                                        "bg-emerald-600 hover:bg-emerald-700 text-white" :
                                        "bg-white dark:bg-gray-800"}
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
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-800/50">
                                    <TableHead className="font-medium">Date</TableHead>
                                    <TableHead className="font-medium">Description</TableHead>
                                    <TableHead className="font-medium">Type</TableHead>
                                    <TableHead className="text-right font-medium">Amount</TableHead>
                                    <TableHead className="text-right font-medium">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Loading transactions...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : currentTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <div className="text-gray-500 dark:text-gray-400">
                                                No transactions found
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    currentTransactions.map((transaction) => (
                                        <TableRow
                                            key={transaction.id}
                                            className="hover:bg-gray-50 dark:hover:bg-gray-800/50"
                                        >
                                            <TableCell className="font-medium">
                                                {formatShortDate(new Date(transaction.date))}
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                    {truncateText(transaction.description || '', 60)}
                                                </div>
                                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                                    {transaction.reference || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(transaction.type)}`}>
                                                    {transaction.type.replace('_', ' ')}
                                                </span>
                                            </TableCell>
                                            <TableCell className={`text-right font-medium ${['INCOME', 'LOAN_PAYMENT'].includes(transaction.type)
                                                ? 'text-emerald-600 dark:text-emerald-400'
                                                : 'text-red-600 dark:text-red-400'
                                                }`}>
                                                {formatCurrency(transaction.amount)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400"
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
                        <div className="flex items-center justify-between mt-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                Page {currentPage} of {totalPages}
                            </div>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="bg-white dark:bg-gray-800"
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
                                            className={currentPage === pageNum ?
                                                "bg-emerald-600 hover:bg-emerald-700 text-white" :
                                                "bg-white dark:bg-gray-800"}
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
                                    className="bg-white dark:bg-gray-800"
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