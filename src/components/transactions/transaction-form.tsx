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

const TransactionCategories = {
    INCOME: ['Salary', 'Interest Income', 'Late Fees', 'Penalties', 'Other Income'],
    EXPENSE: ['Office Rent', 'Utilities', 'Salary', 'Marketing', 'Supplies', 'Other'],
    LOAN_PAYMENT: ['Principal Payment', 'Interest Payment'],
    LOAN_DISBURSEMENT: ['New Loan', 'Loan Renewal']
} as const;

// type TransactionFormData = z.infer<typeof transactionFormSchema>;

interface TransactionFormProps {
    open: boolean;
    balances: Balance[]
    onClose: () => void;
    onSubmit: (data: NewTransaction) => Promise<void>;
}

export default function TransactionForm({ open, balances, onClose, onSubmit }: TransactionFormProps) {
    const [selectedType, setSelectedType] = useState<keyof typeof TransactionCategories>('INCOME');

    const transactionFormSchema = z.object({
        type: z.enum(['INCOME', 'EXPENSE', 'LOAN_PAYMENT', 'LOAN_DISBURSEMENT']),
        category: z.string().min(1, "Category is required"),
        fromBalanceId: z.string().min(1, "Transaction Bank is required"),
        amount: z.number().positive("Amount must be greater than 0"),
        description: z.string().min(1, "Description is required"),
        reference: z.string().optional(),
        interestRate: z.number().optional().default(30),
    });

    type NewTransaction = z.infer<typeof transactionFormSchema>;

    const form = useForm<NewTransaction>({
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

    const handleSubmit: SubmitHandler<NewTransaction> = async (data) => {
        try {

            if (data.type === 'LOAN_DISBURSEMENT' || data.type === 'EXPENSE') {
                await onSubmit({
                    date: new Date(),
                    type: data.type,
                    category: data.category,
                    description: `${data.category} - ${data.type} Expense`,
                    amount: data.amount.toString(),
                    reference: generateReferenceNumber(data.type),
                    fromBalanceId: data.fromBalanceId
                });
            } else if (data.type === 'LOAN_PAYMENT' || data.type === 'INCOME') {
                await onSubmit({
                    date: new Date(),
                    type: data.type,
                    category: data.category,
                    description: `${data.description} - ${data.category} of ${formatCurrency(data.amount)}`,
                    amount: data.amount.toString(),
                    reference: generateReferenceNumber(data.type),
                    fromBalanceId: data.fromBalanceId,
                });
            }

            form.reset();
            onClose();
        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };


    return (
        <Dialog open={open} onOpenChange={onClose}>
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
                            className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
                            {...form.register('description')}
                        />
                        {form.formState.errors.description && (
                            <p className="text-sm text-red-500">
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
                                defaultValue={selectedType}
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
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.type.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Category</Label>
                            <Select
                                onValueChange={(value) => form.setValue('category', value)}
                                defaultValue={form.getValues('category')}
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
                                <p className="text-sm text-red-500">
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
                                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
                                {...form.register('amount', { valueAsNumber: true })}
                            />
                            {form.formState.errors.amount && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.amount.message}
                                </p>
                            )}
                        </div>


                        <div>
                            <Label className="text-gray-700 dark:text-gray-300">Transaction Bank</Label>
                            <Select onValueChange={(bank) => form.setValue('fromBalanceId', bank)}>
                                <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500 w-full px-3 py-2 rounded-md">
                                    <SelectValue placeholder="Select a Bank" />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900">
                                    <SelectGroup >
                                        <SelectLabel>Transaction Bank</SelectLabel>
                                        {balances.map((balance) => (
                                            <SelectItem key={balance.id} value={balance.id}>
                                                {balance.accountName} - {formatCurrency(parseFloat(balance.currentBalance))}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                            {form.formState.errors.fromBalanceId && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.fromBalanceId.message}
                                </p>
                            )}
                        </div>

                        {/* <div>
                            <Label className="text-gray-700 dark:text-gray-300">Transaction Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "w-full min-w-[120px] justify-start text-left font-normal bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500",
                                            !date && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500">
                                    <Calendar
                                        mode="single"
                                        selected={date}
                                        onSelect={(date) => {
                                            setDate(date);
                                            if (date) {
                                                form.setValue('date', date);
                                            }
                                        }}
                                        initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                            {form.formState.errors.date && (
                                <p className="text-sm text-red-500">
                                    {form.formState.errors.date.message}
                                </p>
                            )}
                        </div> */}
                    </div>
                    {/* 
                    <div>
                        <Label className="text-gray-700 dark:text-gray-300">Transaction Bank</Label>
                        <Select onValueChange={(bank) => form.setValue('fromBalanceId', bank)}>
                            <SelectTrigger className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500 w-full px-3 py-2 rounded-md">
                                <SelectValue placeholder="Select a Bank" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900">
                                <SelectGroup >
                                    <SelectLabel>Transaction Bank</SelectLabel>
                                    {balances.map((balance) => (
                                        <SelectItem key={balance.id} value={balance.id}>
                                            {balance.accountName} - {formatCurrency(parseFloat(balance.currentBalance))}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                        {form.formState.errors.fromBalanceId && (
                            <p className="text-sm text-red-500 mt-1">
                                {form.formState.errors.fromBalanceId.message}
                            </p>
                        )}
                    </div> */}

                    <DialogFooter className="gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        >
                            Create Transaction
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}