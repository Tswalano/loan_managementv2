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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, Search, Download, Calendar, Loader2 } from 'lucide-react';
import { formatCurrency, formatShortDate, generateReferenceNumber, truncateText } from '@/lib/utils/formatters';
import type { Transaction, LoanTransactionType, NewTransaction } from '@/types';
import ErrorComponent from '@/components/error/error-component';
import ViewTransactionDialog from '@/components/transactions/transaction-dialog';
import TransactionForm from '@/components/transactions/transaction-form';
import { useBalanceOperations } from '@/hooks/useBalanceOperations';
import { useToast } from "@/hooks/use-toast"

export default function TransactionsPage() {
    const { toast } = useToast();
    const [isNewTransactionOpen, setIsNewTransactionOpen] = useState(false);
    const [selectedType, setSelectedType] = useState<LoanTransactionType | 'ALL'>('ALL');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [viewTransaction, setViewTransaction] = useState<Transaction | null>(null);

    const {
        loading,
        error,
        transactions,
        balances,
        fetchTransactions,
        setLoading,
        recordExpense,
        recordTransaction
    } = useBalanceOperations();

    const handleTransactionCreate = async (formData: NewTransaction) => {
        setLoading(true);
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
                await recordTransaction({
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

            await fetchTransactions();
            toast({
                title: "Success",
                description: "Transaction created successfully",
                variant: "default",
            });
            setIsNewTransactionOpen(false);
        } catch (error) {
            console.error('Transaction creation failed:', error);
            toast({
                title: "Error",
                description: "Failed to create transaction. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const getTypeColor = (type: LoanTransactionType): string => {
        const colors = {
            INCOME: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400',
            EXPENSE: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
            LOAN_PAYMENT: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            LOAN_DISBURSEMENT: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        };
        return colors[type] || colors.EXPENSE;
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

    if (error) {
        return (
            <ErrorComponent
                title="Error Loading Transactions"
                message={error.toString().toUpperCase()}
                onRetry={fetchTransactions} isOpen={false} onClose={function (): void {
                    throw new Error('Function not implemented.');
                }}
            />
        );
    }

    // Empty state component
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

    if (loading && transactions.length === 0) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    if (!loading && transactions.length === 0) {
        return (
            <>
                <EmptyState />
                <TransactionForm
                    balances={balances}
                    open={isNewTransactionOpen}
                    onClose={() => setIsNewTransactionOpen(false)}
                    onSubmit={(data: NewTransaction) => handleTransactionCreate({ ...data })}
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
                                Showing {filteredTransactions.length} transactions
                            </CardDescription>
                        </div>
                    </div>
                    <div className="mt-4 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search transactions..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
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
                                    onClick={() => setSelectedType(type)}
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
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <div className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                                Loading transactions...
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTransactions.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center py-8">
                                            <div className="text-gray-500 dark:text-gray-400">
                                                No transactions found
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((transaction) => (
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