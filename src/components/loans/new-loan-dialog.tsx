// src/components/loans/new-loan-dialog.tsx
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { formatCurrency } from "@/lib/utils/formatters";
import { Balance, CreateLoanRequest } from "@/types";
// import { generateTransactionData } from "@/lib/utils/helper";

const loanSchema = z.object({
    borrowerName: z.string().min(2, "Borrower name is required"),
    fromBalanceId: z.string().min(1, "Bank selection is required"),
    principalAmount: z.number().positive('Amount must be positive'),
    interestRate: z.number().positive('Interest rate must be positive'),
});

type LoanFormData = z.infer<typeof loanSchema>;

interface NewLoanDialogProps {
    open: boolean;
    balances: Balance[]
    onClose: () => void;
    onSubmit: (data: CreateLoanRequest) => Promise<void>;
}

export function NewLoanDialog({ open, onClose, onSubmit, balances }: NewLoanDialogProps) {


    const form = useForm<LoanFormData>({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            borrowerName: '',
            principalAmount: 0,
            interestRate: 30,
            fromBalanceId: '',
        }
    });

    const handleSubmit = async (data: LoanFormData) => {
        try {
            console.log("Creating loan transaction:", data);

            // Generate the clean transaction object for API
            // const loanData = generateTransactionData(
            //     {
            //         ...data,
            //         fromBalanceId: data.fromBalanceId ?? '',
            //         toBalanceId: data.fromBalanceId ?? data.fromBalanceId, // optional, safe fallback
            //         date: new Date(), // replace with real date
            //     },
            //     TransactionType.LOAN_DISBURSEMENT,
            //     'user123'
            // );

            const loanData: CreateLoanRequest = {
                // userId: 'user123',
                balanceId: data.fromBalanceId,
                borrowerName: data.borrowerName,
                principalAmount: data.principalAmount,
                interestRate: data.interestRate,
                termMonths: 12,
            };

            // Send it to your API
            await onSubmit(loanData);

            form.reset();
            onClose();
        } catch (error) {
            console.error('Error creating loan:', error);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Create New Loan
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">
                        Enter the details for the new loan
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Borrower Name</Label>
                            <Input
                                {...form.register('borrowerName')}
                                placeholder="Enter borrower name"
                                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
                            />
                            {form.formState.errors.borrowerName && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.borrowerName.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Loan Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    {...form.register('principalAmount', { valueAsNumber: true })}
                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
                                />
                                {form.formState.errors.principalAmount && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {form.formState.errors.principalAmount.message}
                                    </p>
                                )}
                            </div>
                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Interest Rate (%)</Label>
                                <Input
                                    type="number"
                                    step="0.1"
                                    disabled
                                    {...form.register('interestRate', { valueAsNumber: true })}
                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500 disabled:opacity-60"
                                />
                                {form.formState.errors.interestRate && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {form.formState.errors.interestRate.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Disbursement Account</Label>
                            <Select onValueChange={(value) => form.setValue('fromBalanceId', value)}>
                                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500 w-full">
                                    <SelectValue placeholder="Select account to disburse from" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900">
                                    <SelectGroup>
                                        <SelectLabel>Available Accounts</SelectLabel>
                                        {balances.length === 0 ? (
                                            <div className="px-2 py-4 text-sm text-gray-500 dark:text-gray-400">
                                                No accounts available
                                            </div>
                                        ) : (
                                            balances.map((balance) => (
                                                <SelectItem key={balance.id} value={balance.id}>
                                                    <div className="flex items-center justify-between w-full">
                                                        <span>{balance.accountName}</span>
                                                        <span className="ml-2 text-gray-500">
                                                            {formatCurrency(parseFloat(balance.balance || '0'))}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.fromBalanceId && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.fromBalanceId.message}
                                </p>
                            )}
                        </div>

                        {/* Loan Summary */}
                        {form.watch('principalAmount') > 0 && form.watch('interestRate') > 0 && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3">
                                    Loan Summary
                                </h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Principal Amount</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {formatCurrency(form.watch('principalAmount'))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Interest Rate</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {form.watch('interestRate')}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Total Interest</span>
                                        <span className="font-medium text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(
                                                (form.watch('principalAmount') * (form.watch('interestRate') / 100))
                                            )}
                                        </span>
                                    </div>
                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700 dark:text-gray-300 font-medium">Total Repayment</span>
                                            <span className="font-semibold text-gray-900 dark:text-gray-100">
                                                {formatCurrency(
                                                    form.watch('principalAmount') +
                                                    (form.watch('principalAmount') * (form.watch('interestRate') / 100))
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                form.reset();
                                onClose();
                            }}
                            className="bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                        >
                            {form.formState.isSubmitting ? 'Creating...' : 'Create Loan'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}