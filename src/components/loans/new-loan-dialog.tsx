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
import { Balance, FormTransactionData, NewTransaction } from "@/types";
import { generateTransactionData } from "@/lib/utils/helper";

const loanSchema = z.object({
    description: z.string().min(2, "Borrower name is required"),
    fromBalanceId: z.string().min(2, "Bank name is required"),
    amount: z.number().positive('Amount must be positive'),
    interestRate: z.number().positive('Interest rate must be positive'),
    // date: z.date().max(new Date(), "Date must be in the past"),
});


interface NewLoanDialogProps {
    open: boolean;
    balances: Balance[]
    onClose: () => void;
    onSubmit: (data: NewTransaction) => Promise<void>;
}

export function NewLoanDialog({ open, onClose, onSubmit, balances }: NewLoanDialogProps) {
    // const [date, setDate] = React.useState<Date>()
    const form = useForm({
        resolver: zodResolver(loanSchema),
        defaultValues: {
            description: '',
            amount: 0,
            interestRate: 30,
            fromBalanceId: '',
            date: new Date(),
        }
    });

    const handleSubmit = async (data: FormTransactionData) => {
        try {
            console.log("Creating transaction:", data);

            const loanData: NewTransaction = generateTransactionData(data, "LOAN_DISBURSEMENT");

            // You'll need to transform the data object into a NewTransaction object
            // before calling onSubmit
            // const newTransaction: NewTransaction = {
            //     ...data,
            //     date: data.date || new Date().toISOString(),
            //     amount: String(data.amount),
            //     type: "LOAN_DISBURSEMENT",
            //     loanStatus: "ACTIVE",
            //     interestRate: String(data.interestRate),
            //     category: data.description,
            //     fromBalanceId: data.fromBalanceId,
            //     reference: generateReferenceNumber("LOAN_DISBURSEMENT")
            // };

            await onSubmit(loanData);

            form.reset();
            onClose();

        } catch (error) {
            console.error('Error creating transaction:', error);
        }
    };

    // const calculateMonthlyPayment = () => {
    //     const amount = form.getValues('amount');
    //     const rate = form.getValues('interestRate') / 100 / 12;
    //     const term = 1;

    //     if (amount && rate && term) {
    //         const monthlyPayment = (amount * rate * Math.pow(1 + rate, term)) / (Math.pow(1 + rate, term) - 1);
    //         return monthlyPayment;
    //     }
    //     return 0;
    // };

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
                                {...form.register('description')}
                                className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
                            />
                            {form.formState.errors.description && (
                                <p className="text-sm text-red-500 mt-1">
                                    {form.formState.errors.description.message}
                                </p>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label className="text-gray-700 dark:text-gray-300">Loan Amount</Label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    {...form.register('amount', { valueAsNumber: true })}
                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
                                />
                                {form.formState.errors.amount && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {form.formState.errors.amount.message}
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
                                    className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
                                />
                                {form.formState.errors.interestRate && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {form.formState.errors.interestRate.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
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
                                <Label className="text-gray-700 dark:text-gray-300">Start Date</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full min-w-[120px] justify-start text-left font-normal bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500",
                                                !form.watch('date') && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {form.watch('date') ? format(form.watch('date'), "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500">
                                        <Calendar
                                            mode="single"
                                            // selected={(date) => form.setValue('date', date)}
                                            onSelect={(date) => form.setValue('date', date || new Date())}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div> */}
                        </div>

                        {/* Loan Summary */}
                        {form.watch('amount') > 0 && form.watch('interestRate') > 0 && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    Loan Summary
                                </h4>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Interest Rate %</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {/* {formatCurrency(calculateMonthlyPayment())} */}
                                            30%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Total Interest</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {formatCurrency(
                                                (form.watch('amount') * (form.watch('interestRate') / 100))
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500 dark:text-gray-400">Total Payment</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {formatCurrency(
                                                form.watch('amount') +
                                                (form.watch('amount') * (form.watch('interestRate') / 100))
                                            )}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

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
                            Create Loan
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}