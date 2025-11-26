import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from '@/lib/utils/formatters';
import { Calculator, DollarSign, CreditCard, TrendingDown } from 'lucide-react';
import { Loan, Balance, LoanPaymentRequest } from '@/types';
import { cn } from '@/lib/utils';

export interface LoanPaymentDialogProps {
    loan: Loan;
    balances: Balance[];
    open: boolean;
    onClose: () => void;
    onSubmit: (loanPayment: LoanPaymentRequest) => Promise<void>;
    isLoading?: boolean;
}

export function LoanPaymentDialog({
    loan,
    open,
    balances,
    onClose,
    onSubmit,
    isLoading
}: LoanPaymentDialogProps) {
    const [loanPayment, setLoanPayment] = useState<LoanPaymentRequest>({
        amount: 0,
        toBalanceId: '',
        description: '',
        loanId: loan.id
    });

    const remainingAmount = Number(loan.outstandingBalance);

    const handleFullPayment = () => {
        setLoanPayment({
            amount: remainingAmount,
            loanId: loan.id,
            toBalanceId: loanPayment.toBalanceId,
            description: `${loan.borrowerName} - Loan Payment of ${formatCurrency(remainingAmount)}`,
        });
    };

    const handleHalfPayment = () => {
        setLoanPayment({
            amount: remainingAmount / 2,
            loanId: loan.id,
            toBalanceId: loanPayment.toBalanceId,
            description: `${loan.borrowerName} - Loan Dep. of ${formatCurrency(remainingAmount / 2)}`
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className={cn(
                "sm:max-w-[500px]",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Make Payment
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Process loan payment for {loan.borrowerName}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Loan Summary Card */}
                    <div className={cn(
                        "p-5 rounded-xl",
                        "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10",
                        "border border-blue-200 dark:border-blue-800/30"
                    )}>
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center">
                                <CreditCard className="h-4 w-4 text-white" />
                            </div>
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                Loan Details
                            </h4>
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Original Amount
                                </span>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {formatCurrency(Number(loan.principalAmount))}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                    Remaining Balance
                                </span>
                                <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                    {formatCurrency(remainingAmount)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Quick Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleFullPayment}
                            className={cn(
                                "h-auto py-4 flex flex-col items-center gap-2",
                                "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10",
                                "border-emerald-200 dark:border-emerald-800/30",
                                "hover:from-emerald-100 hover:to-emerald-200/50 dark:hover:from-emerald-900/30 dark:hover:to-emerald-800/20",
                                "text-emerald-700 dark:text-emerald-400"
                            )}
                        >
                            <DollarSign className="h-5 w-5" />
                            <div className="text-center">
                                <div className="text-xs font-medium">Pay Full</div>
                                <div className="text-sm font-bold">{formatCurrency(remainingAmount)}</div>
                            </div>
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleHalfPayment}
                            className={cn(
                                "h-auto py-4 flex flex-col items-center gap-2",
                                "bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10",
                                "border-orange-200 dark:border-orange-800/30",
                                "hover:from-orange-100 hover:to-orange-200/50 dark:hover:from-orange-900/30 dark:hover:to-orange-800/20",
                                "text-orange-700 dark:text-orange-400"
                            )}
                        >
                            <TrendingDown className="h-5 w-5" />
                            <div className="text-center">
                                <div className="text-xs font-medium">Pay Half</div>
                                <div className="text-sm font-bold">{formatCurrency(remainingAmount / 2)}</div>
                            </div>
                        </Button>
                    </div>

                    {/* Custom Amount Input */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Payment Amount
                        </Label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                            <Input
                                type="number"
                                value={loanPayment.amount ?? ''}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setLoanPayment({
                                        ...loanPayment,
                                        amount: value === '' ? '' : parseFloat(value),
                                    });
                                }}
                                max={remainingAmount}
                                min={0}
                                step="0.01"
                                placeholder="0.00"
                                className={cn(
                                    "pl-10 h-12 text-lg font-semibold",
                                    "bg-white dark:bg-gray-800/50",
                                    "border-gray-300 dark:border-gray-600",
                                    "focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546]",
                                    "text-gray-900 dark:text-white"
                                )}
                            />
                        </div>
                        {Number(loanPayment.amount) > remainingAmount && (
                            <p className="text-sm text-red-500 dark:text-red-400">
                                Amount exceeds remaining balance
                            </p>
                        )}
                    </div>

                    {/* Transaction Bank Select */}
                    <div className="space-y-3">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Transaction Bank
                        </Label>
                        <Select
                            onValueChange={(value) => setLoanPayment({ ...loanPayment, toBalanceId: value })}
                            value={loanPayment.toBalanceId || undefined}
                        >
                            <SelectTrigger className={cn(
                                "h-12 bg-white dark:bg-gray-800/50",
                                "border-gray-300 dark:border-gray-600",
                                "focus:ring-2 focus:ring-emerald-500 dark:focus:ring-[#C4F546]",
                                "text-gray-900 dark:text-white"
                            )}>
                                <SelectValue placeholder="Select a Bank Account" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                <SelectGroup>
                                    <SelectLabel className="text-gray-500 dark:text-gray-400">Available Accounts</SelectLabel>
                                    {balances.map((balance) => (
                                        <SelectItem
                                            key={balance.id}
                                            value={balance.id}
                                            className="focus:bg-gray-100 dark:focus:bg-gray-800"
                                        >
                                            <div className="flex items-center justify-between w-full gap-4">
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-900 dark:text-white">
                                                        {balance.accountName}
                                                    </span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {balance.bankName}
                                                    </span>
                                                </div>
                                                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                                    {formatCurrency(parseFloat(balance.balance))}
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment Preview */}
                    {Number(loanPayment.amount) > 0 && (
                        <div className={cn(
                            "p-5 rounded-xl",
                            "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-900/20 dark:to-purple-800/10",
                            "border border-purple-200 dark:border-purple-800/30"
                        )}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-8 h-8 rounded-lg bg-purple-500 dark:bg-purple-600 flex items-center justify-center">
                                    <Calculator className="h-4 w-4 text-white" />
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Payment Preview
                                </span>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">
                                        Payment Amount
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {formatCurrency(Number(loanPayment.amount))}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-purple-200 dark:border-purple-800/30">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        New Balance After Payment
                                    </span>
                                    <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(Math.max(0, remainingAmount - Number(loanPayment.amount)))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                        className={cn(
                            "bg-gray-100 dark:bg-gray-800",
                            "border-gray-300 dark:border-gray-600",
                            "text-gray-900 dark:text-white",
                            "hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onSubmit(loanPayment)}
                        disabled={(Number(loanPayment.amount) <= 0) || (Number(loanPayment.amount) > remainingAmount) || !loanPayment.toBalanceId || isLoading}
                        className={cn(
                            "bg-gradient-to-r from-emerald-600 to-emerald-700",
                            "hover:from-emerald-700 hover:to-emerald-800",
                            "text-white shadow-lg hover:shadow-xl",
                            "transition-all duration-300",
                            "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                Make Payment
                            </span>
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}