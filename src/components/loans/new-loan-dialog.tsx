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
import { cn } from "@/lib/utils";
import { DollarSign, TrendingUp, Calculator } from "lucide-react";

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

            const loanData: CreateLoanRequest = {
                balanceId: data.fromBalanceId,
                borrowerName: data.borrowerName,
                principalAmount: data.principalAmount,
                interestRate: data.interestRate,
                termMonths: 12,
            };

            await onSubmit(loanData);
            form.reset();
            onClose();
        } catch (error) {
            console.error('Error creating loan:', error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className={cn(
                "sm:max-w-[550px]",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Create New Loan
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Enter the details for the new loan disbursement
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div className="space-y-5">
                        {/* Borrower Name */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Borrower Name
                            </Label>
                            <div className="relative">
                                <Input
                                    {...form.register('borrowerName')}
                                    placeholder="Enter borrower full name"
                                    className={cn(
                                        "bg-white dark:bg-gray-800/50",
                                        "border-gray-300 dark:border-gray-600",
                                        "focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546]",
                                        "text-gray-900 dark:text-white",
                                        "placeholder:text-gray-400 dark:placeholder:text-gray-500"
                                    )}
                                />
                            </div>
                            {form.formState.errors.borrowerName && (
                                <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                                    <span className="text-xs">⚠</span>
                                    {form.formState.errors.borrowerName.message}
                                </p>
                            )}
                        </div>

                        {/* Amount and Interest Rate */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Loan Amount
                                </Label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <Input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        {...form.register('principalAmount', { valueAsNumber: true })}
                                        className={cn(
                                            "pl-9 bg-white dark:bg-gray-800/50",
                                            "border-gray-300 dark:border-gray-600",
                                            "focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546]",
                                            "text-gray-900 dark:text-white"
                                        )}
                                    />
                                </div>
                                {form.formState.errors.principalAmount && (
                                    <p className="text-sm text-red-500 dark:text-red-400">
                                        {form.formState.errors.principalAmount.message}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Interest Rate (%)
                                </Label>
                                <div className="relative">
                                    <TrendingUp className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                    <Input
                                        type="number"
                                        step="0.1"
                                        disabled
                                        {...form.register('interestRate', { valueAsNumber: true })}
                                        className={cn(
                                            "pl-9 bg-gray-100 dark:bg-gray-800/30",
                                            "border-gray-300 dark:border-gray-600",
                                            "text-gray-900 dark:text-white",
                                            "disabled:opacity-60 cursor-not-allowed"
                                        )}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Disbursement Account */}
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Disbursement Account
                            </Label>
                            <Select onValueChange={(value) => form.setValue('fromBalanceId', value)}>
                                <SelectTrigger className={cn(
                                    "bg-white dark:bg-gray-800/50",
                                    "border-gray-300 dark:border-gray-600",
                                    "focus:ring-2 focus:ring-emerald-500 dark:focus:ring-[#C4F546]",
                                    "text-gray-900 dark:text-white"
                                )}>
                                    <SelectValue placeholder="Select account to disburse from" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    <SelectGroup>
                                        <SelectLabel className="text-gray-500 dark:text-gray-400">Available Accounts</SelectLabel>
                                        {balances.length === 0 ? (
                                            <div className="px-2 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                                No accounts available
                                            </div>
                                        ) : (
                                            balances.map((balance) => (
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
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {form.formState.errors.fromBalanceId.message}
                                </p>
                            )}
                        </div>

                        {/* Loan Summary */}
                        {form.watch('principalAmount') > 0 && form.watch('interestRate') > 0 && (
                            <div className={cn(
                                "p-5 rounded-xl",
                                "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10",
                                "border border-emerald-200 dark:border-emerald-800/30"
                            )}>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500 dark:bg-emerald-600 flex items-center justify-center">
                                        <Calculator className="h-4 w-4 text-white" />
                                    </div>
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                        Loan Summary
                                    </h4>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Principal Amount</span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(form.watch('principalAmount'))}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Interest Rate</span>
                                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                            {form.watch('interestRate')}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600 dark:text-gray-400">Total Interest</span>
                                        <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(
                                                (form.watch('principalAmount') * (form.watch('interestRate') / 100))
                                            )}
                                        </span>
                                    </div>
                                    <div className="pt-3 border-t border-emerald-200 dark:border-emerald-800/30">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                                Total Repayment
                                            </span>
                                            <span className="text-lg font-bold text-gray-900 dark:text-white">
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

                    <DialogFooter className="gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                                form.reset();
                                onClose();
                            }}
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
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className={cn(
                                "bg-gradient-to-r from-emerald-600 to-emerald-700",
                                "hover:from-emerald-700 hover:to-emerald-800",
                                "text-white shadow-lg hover:shadow-xl",
                                "transition-all duration-300",
                                "disabled:opacity-50 disabled:cursor-not-allowed"
                            )}
                        >
                            {form.formState.isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                    Creating...
                                </span>
                            ) : (
                                'Create Loan'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}