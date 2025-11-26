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
import { cn } from "@/lib/utils";

interface ViewTransactionDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onClose: () => void;
}

const ViewTransactionDialog = ({ transaction, open, onClose }: ViewTransactionDialogProps) => {
    if (!transaction) return null;

    const isIncome = transaction.type === 'INCOME' || transaction.type === 'LOAN_PAYMENT';

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className={cn(
                "sm:max-w-[650px]",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <DialogHeader className="space-y-4">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Transaction Details
                        </DialogTitle>
                        <span
                            className={cn(
                                "px-3 py-1.5 rounded-full text-sm font-semibold inline-flex items-center gap-1.5",
                                isIncome
                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            )}
                        >
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                isIncome ? "bg-emerald-600 dark:bg-emerald-400" : "bg-red-600 dark:bg-red-400"
                            )} />
                            {transaction.type.replace('_', ' ')}
                        </span>
                    </div>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Transaction from {formatShortDate(new Date(transaction.date))}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Main Amount Card */}
                    <div className={cn(
                        "p-6 rounded-2xl",
                        "bg-gradient-to-br border",
                        isIncome
                            ? "from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-emerald-200 dark:border-emerald-800/30"
                            : "from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-red-200 dark:border-red-800/30"
                    )}>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                                    Amount
                                </p>
                                <p className={cn(
                                    "text-4xl font-bold",
                                    isIncome
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-red-600 dark:text-red-400'
                                )}>
                                    {formatCurrency(Number(transaction.amount))}
                                </p>
                            </div>
                            {/* Icon based on transaction type */}
                            <div className={cn(
                                "w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg",
                                isIncome
                                    ? 'bg-emerald-500 dark:bg-emerald-600'
                                    : 'bg-red-500 dark:bg-red-600'
                            )}>
                                {transaction.type === 'INCOME' && <ArrowUpRight className="h-8 w-8 text-white" />}
                                {transaction.type === 'EXPENSE' && <ArrowDownRight className="h-8 w-8 text-white" />}
                                {transaction.type === 'LOAN_PAYMENT' && <Banknote className="h-8 w-8 text-white" />}
                                {transaction.type === 'LOAN_DISBURSEMENT' && <CreditCard className="h-8 w-8 text-white" />}
                            </div>
                        </div>
                    </div>

                    {/* Transaction Details Grid */}
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-6">
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Category</Label>
                                <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                                    {transaction.category}
                                </p>
                            </div>
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Reference</Label>
                                <p className="mt-2 text-base font-mono text-gray-900 dark:text-white">
                                    {transaction.reference || 'N/A'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</Label>
                                <p className="mt-2 text-base font-semibold text-gray-900 dark:text-white">
                                    {formatShortDate(new Date(transaction.date))}
                                </p>
                            </div>
                            {transaction.loanId && (
                                <div>
                                    <Label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Related Loan</Label>
                                    <Button
                                        variant="link"
                                        className="p-0 h-auto text-base font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                                        onClick={() => {/* Handle loan navigation */ }}
                                    >
                                        View Loan Details →
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Description Section */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</Label>
                        <div className={cn(
                            "rounded-xl p-4 border",
                            "bg-gray-50 dark:bg-gray-800/50",
                            "border-gray-200 dark:border-gray-700"
                        )}>
                            <p className="text-base text-gray-900 dark:text-white leading-relaxed">
                                {transaction.description || 'No description provided'}
                            </p>
                        </div>
                    </div>

                    {/* Footer Information */}
                    <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Transaction ID
                            </span>
                            <span className="text-sm font-mono text-gray-900 dark:text-white">
                                {transaction.id.slice(0, 8)}...
                            </span>
                        </div>
                    </div>
                </div>

                <DialogFooter className="gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    {transaction.type === 'LOAN_DISBURSEMENT' && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {/* Handle viewing loan details */ }}
                            className={cn(
                                "bg-emerald-50 dark:bg-emerald-900/20",
                                "border-emerald-200 dark:border-emerald-800/30",
                                "text-emerald-700 dark:text-emerald-400",
                                "hover:bg-emerald-100 dark:hover:bg-emerald-900/40"
                            )}
                        >
                            <FileText className="h-4 w-4 mr-2" />
                            View Loan
                        </Button>
                    )}
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className={cn(
                            "bg-gray-100 dark:bg-gray-800",
                            "border-gray-300 dark:border-gray-600",
                            "text-gray-900 dark:text-white",
                            "hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default ViewTransactionDialog;