// src/components/loans/loan-payment-dialog.tsx
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
import { formatCurrency, stripLoanDisbursement } from '@/lib/utils/formatters';
import { Calculator } from 'lucide-react';
import { Loan, Balance, LoanPaymentRequest } from '@/types';

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

        // if (!loan.accountId) return;

        setLoanPayment({
            amount: remainingAmount,
            loanId: loan.id,
            toBalanceId: loanPayment.toBalanceId,
            description: `${stripLoanDisbursement(loanPayment.description ?? '')} - Loan Payment of ${formatCurrency(remainingAmount)}`,
        });

        console.log(loanPayment);

    };

    const handleHalfPayment = () => {

        // if (!loan.accountId) return;

        setLoanPayment({
            amount: remainingAmount / 2,
            loanId: loan.id,
            toBalanceId: loanPayment.toBalanceId,
            description: `${loan.borrowerName} - Loan Dep. of ${formatCurrency(remainingAmount / 2)}`
        });
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Make Payment
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">
                        Make loan payment
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Loan Summary */}
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 space-y-2">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Original Amount
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(Number(loan.outstandingBalance))}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                Remaining Balance
                            </span>
                            <span className="font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(remainingAmount)}
                            </span>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleFullPayment}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-emerald-600 dark:text-emerald-400"
                        >
                            Pay Full Amount
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleHalfPayment}
                            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-orange-600 dark:text-orange-400"
                        >
                            Pay Half Amount
                        </Button>
                    </div>

                    {/* Custom Amount */}
                    <div className="space-y-2">
                        <Label className="text-gray-700 dark:text-gray-300">
                            Payment Amount
                        </Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={loanPayment.amount ?? ''} // Display empty string if null
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setLoanPayment({
                                        ...loanPayment,
                                        amount: value === '' ? '' : parseFloat(value), // Allow empty string
                                    });
                                }}
                                max={remainingAmount}
                                min={0}
                                step="0.01"
                                className="pl-8 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                R
                            </span>
                        </div>
                    </div>

                    {/* Transaction Bank */}
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Transaction Bank</Label>
                        <Select onValueChange={(value) => setLoanPayment({ ...loanPayment, toBalanceId: value })} value={loanPayment.toBalanceId || undefined}>
                            <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500 w-full px-3 py-2 rounded-md">
                                <SelectValue placeholder="Select a Bank" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900">
                                <SelectGroup >
                                    <SelectLabel>Transaction Bank</SelectLabel>
                                    {balances.map((balance) => (
                                        <SelectItem key={balance.id} value={balance.id}>
                                            {balance.accountName} - {formatCurrency(parseFloat(balance.balance))}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Payment Preview */}
                    {Number(loanPayment.amount) > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 space-y-2">
                            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                                <Calculator className="h-4 w-4" />
                                <span className="text-sm font-medium">Payment Preview</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-500 dark:text-gray-400">
                                    New Balance After Payment
                                </span>
                                <span className="font-medium text-gray-900 dark:text-gray-100">
                                    {formatCurrency(Math.max(0, remainingAmount - Number(loanPayment.amount)))}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onSubmit(loanPayment)}
                        disabled={(Number(loanPayment.amount) <= 0) || (Number(loanPayment.amount) > remainingAmount) || isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        {isLoading ? 'Processing...' : 'Make Payment'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}