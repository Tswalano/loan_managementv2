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
import { Balance, NewTransaction } from '@/types';
import { formatCurrency, generateReferenceNumber } from '@/lib/utils/formatters';
import { generateTransactionData } from '@/lib/utils/helper';

const TransactionCategories = {
    INCOME: ['Salary', 'Interest Income', 'Late Fees', 'Penalties', 'Other Income'],
    EXPENSE: ['Office Rent', 'Utilities', 'Salary', 'Marketing', 'Supplies', 'Other'],
    LOAN_PAYMENT: ['Principal Payment', 'Interest Payment'],
    LOAN_DISBURSEMENT: ['New Loan', 'Loan Renewal']
} as const;

const transactionFormSchema = z.object({
    type: z.enum(['INCOME', 'EXPENSE', 'LOAN_PAYMENT', 'LOAN_DISBURSEMENT']),
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
    onSubmit: (data: NewTransaction) => Promise<void>;
}

export default function TransactionForm({ open, balances, onClose, onSubmit }: TransactionFormProps) {
    const [selectedType, setSelectedType] = useState<keyof typeof TransactionCategories>('INCOME');

    const form = useForm<TransactionFormData>({
        resolver: zodResolver(transactionFormSchema),
        defaultValues: {
            type: 'INCOME',
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

            const transactionData: NewTransaction = generateTransactionData(
                {
                    ...data,
                    fromBalanceId: data.fromBalanceId ?? '',
                    date: new Date(),
                },
                data.type,
                "user123"
            );

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

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[500px] bg-white dark:bg-gray-800">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                        Create New Transaction
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">
                        Add a new transaction to track your income, expenses, or loan payments
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Description</Label>
                        <Input
                            placeholder="Enter transaction description"
                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
                            {...form.register('description')}
                        />
                        {form.formState.errors.description && (
                            <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Type</Label>
                            <Select
                                onValueChange={(value: keyof typeof TransactionCategories) => {
                                    setSelectedType(value);
                                    form.setValue('type', value);
                                    form.setValue('category', '');
                                }}
                                value={selectedType}
                            >
                                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    <SelectValue placeholder="Select type" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.keys(TransactionCategories).map((type) => (
                                        <SelectItem key={type} value={type}>
                                            {type.replace('_', ' ')}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.type && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.type.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Category</Label>
                            <Select
                                onValueChange={(value) => form.setValue('category', value)}
                                value={form.watch('category')}
                            >
                                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    <SelectValue placeholder="Select category" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TransactionCategories[selectedType].map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {category}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {form.formState.errors.category && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.category.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Amount</Label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
                                {...form.register('amount', { valueAsNumber: true })}
                            />
                            {form.formState.errors.amount && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.amount.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Account</Label>
                            <Select onValueChange={(value) => form.setValue('fromBalanceId', value)}>
                                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500 w-full">
                                    <SelectValue placeholder="Select account" />
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
                                                        <span className="ml-2 text-gray-500 text-xs">
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
                    </div>

                    {/* Transaction Summary */}
                    {form.watch('amount') > 0 && (
                        <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                Transaction Summary
                            </h4>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Type</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {selectedType.replace('_', ' ')}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Category</span>
                                    <span className="font-medium text-gray-900 dark:text-gray-100">
                                        {form.watch('category') || 'Not selected'}
                                    </span>
                                </div>
                                <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                    <span className="text-gray-700 dark:text-gray-300 font-medium">Amount</span>
                                    <span className={`font-semibold ${selectedType === 'INCOME' || selectedType === 'LOAN_PAYMENT'
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : 'text-red-600 dark:text-red-400'
                                        }`}>
                                        {selectedType === 'INCOME' || selectedType === 'LOAN_PAYMENT' ? '+' : '-'}
                                        {formatCurrency(form.watch('amount'))}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={form.formState.isSubmitting}
                            className="bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={form.formState.isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                        >
                            {form.formState.isSubmitting ? 'Creating...' : 'Create Transaction'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}