// src/components/transactions/transaction-form.tsx
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Balance, CreateTransactionRequest, TransactionType } from '@/types';
import { formatCurrency } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';
import { DollarSign, Tag, FileText } from 'lucide-react';

const TransactionCategories = {
    INCOME: ['Salary', 'Interest Income', 'Late Fees', 'Penalties', 'Other Income'],
    EXPENSE: ['Office Rent', 'Utilities', 'Salary', 'Marketing', 'Supplies', 'Other'],
    LOAN_PAYMENT: ['Principal Payment', 'Interest Payment'],
    LOAN_DISBURSEMENT: ['New Loan', 'Loan Renewal']
} as const;

const transactionFormSchema = z.object({
    type: z.nativeEnum(TransactionType),
    category: z.string().min(1, "Category is required"),
    fromBalanceId: z.string().min(1, "Transaction account is required"),
    amount: z.number().positive("Amount must be greater than 0"),
    description: z.string().min(1, "Description is required"),
    reference: z.string().optional(),
    interestRate: z.number().optional().default(30),
});

type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
    open: boolean;
    balances: Balance[]
    onClose: () => void;
    onSubmit: (data: CreateTransactionRequest) => Promise<void>;
}

export default function TransactionForm({ open, balances, onClose, onSubmit }: TransactionFormProps) {
    const [selectedType, setSelectedType] = useState<keyof typeof TransactionCategories>('INCOME');

    const form = useForm<TransactionFormData>({
        resolver: zodResolver(transactionFormSchema),
        defaultValues: {
            type: TransactionType.INCOME,
            category: '',
            fromBalanceId: '',
            amount: 0,
            description: '',
            reference: '',
            interestRate: 30,
        },
    });

    const handleSubmit: SubmitHandler<TransactionFormData> = async (data) => {
        try {
            const transactionData: CreateTransactionRequest = {
                type: data.type,
                category: data.category,
                fromBalanceId: data.fromBalanceId,
                amount: data.amount,
                description: data.description,
                date: new Date().toISOString()
            }

            await onSubmit(transactionData);
            form.reset();
            onClose();
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };

    const handleClose = () => {
        form.reset();
        setSelectedType('INCOME');
        onClose();
    };

    const isIncome = selectedType === 'INCOME' || selectedType === 'LOAN_PAYMENT';

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className={cn(
                "sm:max-w-[550px]",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Create New Transaction
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Add a new transaction to track your income, expenses, or loan payments
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-5">
                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description
                        </Label>
                        <div className="relative">
                            <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <Input
                                placeholder="Enter transaction description"
                                className={cn(
                                    "pl-10 bg-white dark:bg-gray-800/50",
                                    "border-gray-300 dark:border-gray-600",
                                    "focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546]"
                                )}
                                {...form.register('description')}
                            />
                        </div>
                        {form.formState.errors.description && (
                            <p className="text-sm text-red-500 dark:text-red-400 flex items-center gap-1">
                                <span className="text-xs">⚠</span>
                                {form.formState.errors.description.message}
                            </p>
                        )}
                    </div>

                    {/* Type and Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Type
                            </Label>
                            <Select
                                onValueChange={(value: keyof typeof TransactionCategories) => {
                                    setSelectedType(value);
                                    form.setValue('type', value as unknown as TransactionType);
                                    form.setValue('category', '');
                                }}
                                value={selectedType}
                            >
                                <SelectTrigger className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    {(Object.keys(TransactionCategories) as (keyof typeof TransactionCategories)[]).map((typeKey) => (
                                        <SelectItem key={typeKey} value={typeKey} className="focus:bg-gray-100 dark:focus:bg-gray-800">
                                            {typeKey.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Category
                            </Label>
                            <Select
                                onValueChange={(value) => form.setValue('category', value)}
                                value={form.watch('category')}
                            >
                                <SelectTrigger className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    {TransactionCategories[selectedType].map((category) => (
                                        <SelectItem key={category} value={category} className="focus:bg-gray-100 dark:focus:bg-gray-800">
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Amount and Account */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Amount
                            </Label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="0.00"
                                    className={cn(
                                        "pl-10 bg-white dark:bg-gray-800/50",
                                        "border-gray-300 dark:border-gray-600",
                                        "focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546]"
                                    )}
                                    {...form.register('amount', { valueAsNumber: true })}
                                />
                            </div>
                            {form.formState.errors.amount && (
                                <p className="text-sm text-red-500 dark:text-red-400">
                                    {form.formState.errors.amount.message}
                                </p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Account
                            </Label>
                            <Select onValueChange={(value) => form.setValue('fromBalanceId', value)}>
                                <SelectTrigger className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600">
                                    <SelectValue placeholder="Select account" />
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
                                                            <span className="font-medium">{balance.accountName}</span>
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
                    </div>

                    {/* Transaction Summary */}
                    {form.watch('amount') > 0 && (
                        <div className={cn(
                            "p-5 rounded-xl border",
                            isIncome
                                ? "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-emerald-200 dark:border-emerald-800/30"
                                : "bg-gradient-to-br from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-red-200 dark:border-red-800/30"
                        )}>
                            <div className="flex items-center gap-2 mb-4">
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center",
                                    isIncome ? "bg-emerald-500 dark:bg-emerald-600" : "bg-red-500 dark:bg-red-600"
                                )}>
                                    <Tag className="h-4 w-4 text-white" />
                                </div>
                                <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                                    Transaction Summary
                                </h4>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Type</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {selectedType.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Category</span>
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {form.watch('category') || 'Not selected'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">Amount</span>
                                    <span className={cn(
                                        "text-lg font-bold",
                                        isIncome
                                            ? 'text-emerald-600 dark:text-emerald-400'
                                            : 'text-red-600 dark:text-red-400'
                                    )}>
                                        {isIncome ? '+' : '-'}{formatCurrency(form.watch('amount'))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={form.formState.isSubmitting}
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
                                'Create Transaction'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}