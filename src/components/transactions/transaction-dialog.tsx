import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Transaction } from '@/types';
import { formatCurrency, formatShortDate } from '@/lib/utils/formatters';
import { ArrowDownRight, ArrowUpRight, Banknote, CreditCard, FileText } from "lucide-react";

interface ViewTransactionDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onClose: () => void;
}

const ViewTransactionDialog = ({ transaction, open, onClose }: ViewTransactionDialogProps) => {
    if (!transaction) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-white dark:bg-gray-800">
                <DialogHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                            Transaction Details
                        </DialogTitle>
                        <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${transaction.type === 'INCOME' || transaction.type === 'LOAN_PAYMENT'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                                : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                }`}
                        >
                            {transaction.type.replace('_', ' ')}
                        </span>
                    </div>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">
                        Transaction from {formatShortDate(new Date(transaction.date))}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-8 py-4">
                    {/* Main Amount Card */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                                    Amount
                                </p>
                                <p
                                    className={`text-3xl font-bold ${transaction.type === 'INCOME' || transaction.type === 'LOAN_PAYMENT'
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-red-600 dark:text-red-400'
                                        }`}
                                >
                                    {formatCurrency(parseFloat(transaction.amount))}
                                </p>
                            </div>
                            {/* Icon based on transaction type */}
                            <div className={`p-4 rounded-full ${transaction.type === 'INCOME' || transaction.type === 'LOAN_PAYMENT'
                                ? 'bg-emerald-100 dark:bg-emerald-900/20'
                                : 'bg-red-100 dark:bg-red-900/20'
                                }`}>
                                {transaction.type === 'INCOME' && <ArrowUpRight className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
                                {transaction.type === 'EXPENSE' && <ArrowDownRight className="h-6 w-6 text-red-600 dark:text-red-400" />}
                                {transaction.type === 'LOAN_PAYMENT' && <Banknote className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />}
                                {transaction.type === 'LOAN_DISBURSEMENT' && <CreditCard className="h-6 w-6 text-red-600 dark:text-red-400" />}
                            </div>
                        </div>
                    </div>

                    {/* Transaction Details Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div>
                                <Label className="text-sm text-gray-500 dark:text-gray-400">Category</Label>
                                <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-100">
                                    {transaction.category}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm text-gray-500 dark:text-gray-400">Reference</Label>
                                <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-100">
                                    {transaction.reference || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <Label className="text-sm text-gray-500 dark:text-gray-400">Date</Label>
                                <p className="mt-1 text-base font-medium text-gray-900 dark:text-gray-100">
                                    {formatShortDate(new Date(transaction.date))}
                                </p>
                            </div>
                            {transaction.id && (
                                <div className="flex flex-col items-start">
                                    <Label className="text-sm text-gray-500 dark:text-gray-400">Related Loan</Label>
                                    <Button
                                        variant="link"
                                        className="mt-1 p-0 m-0 h-auto text-base font-medium text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                                        onClick={() => {/* Handle loan navigation */ }}
                                    >
                                        View Loan Details →
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-2">
                        <Label className="text-sm text-gray-500 dark:text-gray-400">Description</Label>
                        <div className="rounded-lg bg-gray-50 dark:bg-gray-900/50 p-4 border border-gray-100 dark:border-gray-700">
                            <p className="text-base text-gray-900 dark:text-gray-100">
                                {transaction.description || 'No description provided'}
                            </p>
                        </div>
                    </div>

                    {/* Footer Information */}
                    <div className="pt-4 mt-6 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                            <span>Transaction ID: {transaction.id}</span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    {transaction.type === 'LOAN_DISBURSEMENT' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Handle viewing loan details */ }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            <FileText className="h-4 w-4" />
                            View Loan
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewTransactionDialog;
