/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFinanceData, api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils/formatters';
import { ArrowDownToLine, ArrowRightLeft, Wallet, CreditCard, Building2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';

interface Balance {
    id: string;
    type: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    balance: string;
    accountStatus: string;
}

// ============================================
// LOAD FUNDS DIALOG
// ============================================

interface LoadFundsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const LoadFundsDialog: React.FC<LoadFundsDialogProps> = ({ open, onOpenChange }) => {
    const { balances } = useFinanceData();
    const [formData, setFormData] = useState({
        toBalanceId: '',
        amount: '',
        description: '',
        category: 'Fund Loading',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const activeAccounts = (balances as Balance[]).filter(
        (b: Balance) => b.accountStatus === 'ACTIVE'
    );

    const getAccountName = (account: Balance) => {
        if (account.type === 'BANK') {
            return `${account.bankName} (${account.accountNumber?.slice(-4) || 'N/A'})`;
        }
        return account.accountName || 'Cash Account';
    };

    const selectedAccount = activeAccounts.find(a => a.id === formData.toBalanceId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.toBalanceId || !formData.amount) {
            toast({
                title: "Error",
                description: 'Please fill in all required fields',
                variant: "destructive",
            });
            return;
        }

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            toast({
                title: "Error",
                description: 'Please enter a valid amount',
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setSuccess(false);

        try {
            await api.recordIncome({
                amount: amount.toString(),
                category: formData.category,
                description: formData.description || 'Fund loaded into account',
                toBalanceId: formData.toBalanceId,
            });

            toast({
                title: "Success",
                description: `Successfully loaded ${formatCurrency(amount)}!`,
            });
            setSuccess(true);

            // Reset and close
            setTimeout(() => {
                setFormData({
                    toBalanceId: '',
                    amount: '',
                    description: '',
                    category: 'Fund Loading',
                });
                setSuccess(false);
                onOpenChange(false);
            }, 1500);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || 'Failed to load funds',
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                            <ArrowDownToLine className="w-5 h-5 text-white" />
                        </div>
                        Load Funds
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Add money to your account from external sources
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* Account Selection */}
                    <div className="space-y-2">
                        <Label htmlFor="load-account" className="text-sm font-medium">
                            Destination Account *
                        </Label>
                        <Select
                            value={formData.toBalanceId}
                            onValueChange={(value) => setFormData({ ...formData, toBalanceId: value })}
                        >
                            <SelectTrigger id="load-account" className="h-11">
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent>
                                {activeAccounts.map((account: Balance) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        <div className="flex items-center gap-2">
                                            {account.type === 'BANK' ? (
                                                <Building2 className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <Wallet className="w-4 h-4 text-purple-500" />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{getAccountName(account)}</span>
                                                <span className="text-xs text-gray-500">
                                                    {formatCurrency(parseFloat(account.balance))}
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Current Balance Display */}
                    {selectedAccount && (
                        <div className={cn(
                            "p-3 rounded-lg border-2",
                            "bg-gradient-to-br from-gray-50 to-gray-100",
                            "dark:from-gray-800 dark:to-gray-900",
                            "border-gray-200 dark:border-gray-700"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Current Balance
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(parseFloat(selectedAccount.balance))}
                                    </p>
                                </div>
                                <CreditCard className="w-10 h-10 text-gray-400" />
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="load-amount" className="text-sm font-medium">
                            Amount to Load *
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
                                R
                            </span>
                            <Input
                                id="load-amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="pl-7 h-11 text-base font-medium"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label htmlFor="load-category" className="text-sm font-medium">
                            Category
                        </Label>
                        <Input
                            id="load-category"
                            type="text"
                            placeholder="e.g., Fund Loading, Deposit"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="h-11"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="load-description" className="text-sm font-medium">
                            Description (Optional)
                        </Label>
                        <Input
                            id="load-description"
                            type="text"
                            placeholder="Add a note"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="h-11"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-11"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || success}
                            className={cn(
                                "flex-1 h-11 font-semibold transition-all duration-300",
                                success
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                    : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Loading...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Success!
                                </>
                            ) : (
                                <>
                                    <ArrowDownToLine className="w-4 h-4 mr-2" />
                                    Load Funds
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ============================================
// TRANSFER DIALOG
// ============================================

interface TransferDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const TransferDialog: React.FC<TransferDialogProps> = ({ open, onOpenChange }) => {
    const { balances } = useFinanceData();
    const [formData, setFormData] = useState({
        fromBalanceId: '',
        toBalanceId: '',
        amount: '',
        description: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const activeAccounts = (balances as Balance[]).filter(
        (b: Balance) => b.accountStatus === 'ACTIVE'
    );

    const getAccountName = (account: Balance) => {
        if (account.type === 'BANK') {
            return `${account.bankName} (${account.accountNumber?.slice(-4) || 'N/A'})`;
        }
        return account.accountName || 'Cash Account';
    };

    const fromAccount = activeAccounts.find(a => a.id === formData.fromBalanceId);
    const toAccount = activeAccounts.find(a => a.id === formData.toBalanceId);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.fromBalanceId || !formData.toBalanceId || !formData.amount) {
            toast({
                title: "Error",
                description: 'Please fill in all required fields',
                variant: "destructive",
            });
            return;
        }

        if (formData.fromBalanceId === formData.toBalanceId) {
            toast({
                title: "Error",
                description: 'Cannot transfer to the same account',
                variant: "destructive",
            });
            return;
        }

        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) {
            toast({
                title: "Error",
                description: 'Please enter a valid amount',
                variant: "destructive",
            });
            return;
        }

        const fromBalance = parseFloat(fromAccount?.balance || '0');
        if (amount > fromBalance) {
            toast({
                title: "Error",
                description: 'Insufficient funds in source account',
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setSuccess(false);

        try {
            await api.transferFunds({
                amount,
                fromBalanceId: formData.fromBalanceId,
                toBalanceId: formData.toBalanceId,
                description: formData.description || 'Transfer between accounts',
            });

            toast({
                title: "Success",
                description: `Successfully transferred ${formatCurrency(amount)}!`,
            });
            setSuccess(true);

            // Reset and close
            setTimeout(() => {
                setFormData({
                    fromBalanceId: '',
                    toBalanceId: '',
                    amount: '',
                    description: '',
                });
                setSuccess(false);
                onOpenChange(false);
            }, 1500);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || 'Failed to transfer funds',
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3 text-gray-900 dark:text-white">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                            <ArrowRightLeft className="w-5 h-5 text-white" />
                        </div>
                        Transfer Funds
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Move money between your accounts
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                    {/* From Account */}
                    <div className="space-y-2">
                        <Label htmlFor="from-account" className="text-sm font-medium">
                            From Account *
                        </Label>
                        <Select
                            value={formData.fromBalanceId}
                            onValueChange={(value) => setFormData({ ...formData, fromBalanceId: value })}
                        >
                            <SelectTrigger id="from-account" className="h-11">
                                <SelectValue placeholder="Select source account" />
                            </SelectTrigger>
                            <SelectContent>
                                {activeAccounts.map((account: Balance) => (
                                    <SelectItem key={account.id} value={account.id}>
                                        <div className="flex items-center gap-2">
                                            {account.type === 'BANK' ? (
                                                <Building2 className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <Wallet className="w-4 h-4 text-purple-500" />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{getAccountName(account)}</span>
                                                <span className="text-xs text-gray-500">
                                                    {formatCurrency(parseFloat(account.balance))}
                                                </span>
                                            </div>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Source Balance */}
                    {fromAccount && (
                        <div className={cn(
                            "p-3 rounded-lg border-2",
                            "bg-gradient-to-br from-red-50 to-orange-50",
                            "dark:from-red-900/20 dark:to-orange-900/20",
                            "border-red-200 dark:border-red-800"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Available Balance
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(parseFloat(fromAccount.balance))}
                                    </p>
                                </div>
                                <ArrowRightLeft className="w-10 h-10 text-red-400" />
                            </div>
                        </div>
                    )}

                    {/* Transfer Arrow */}
                    <div className="flex justify-center">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                            <ArrowRightLeft className="w-4 h-4 text-white" />
                        </div>
                    </div>

                    {/* To Account */}
                    <div className="space-y-2">
                        <Label htmlFor="to-account" className="text-sm font-medium">
                            To Account *
                        </Label>
                        <Select
                            value={formData.toBalanceId}
                            onValueChange={(value) => setFormData({ ...formData, toBalanceId: value })}
                        >
                            <SelectTrigger id="to-account" className="h-11">
                                <SelectValue placeholder="Select destination account" />
                            </SelectTrigger>
                            <SelectContent>
                                {activeAccounts
                                    .filter((a: Balance) => a.id !== formData.fromBalanceId)
                                    .map((account: Balance) => (
                                        <SelectItem key={account.id} value={account.id}>
                                            <div className="flex items-center gap-2">
                                                {account.type === 'BANK' ? (
                                                    <Building2 className="w-4 h-4 text-blue-500" />
                                                ) : (
                                                    <Wallet className="w-4 h-4 text-purple-500" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{getAccountName(account)}</span>
                                                    <span className="text-xs text-gray-500">
                                                        {formatCurrency(parseFloat(account.balance))}
                                                    </span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Destination Balance */}
                    {toAccount && (
                        <div className={cn(
                            "p-3 rounded-lg border-2",
                            "bg-gradient-to-br from-emerald-50 to-green-50",
                            "dark:from-emerald-900/20 dark:to-green-900/20",
                            "border-emerald-200 dark:border-emerald-800"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Current Balance
                                    </p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(parseFloat(toAccount.balance))}
                                    </p>
                                </div>
                                <CreditCard className="w-10 h-10 text-emerald-400" />
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="transfer-amount" className="text-sm font-medium">
                            Amount to Transfer *
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">
                                R
                            </span>
                            <Input
                                id="transfer-amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="pl-7 h-11 text-base font-medium"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="transfer-description" className="text-sm font-medium">
                            Description (Optional)
                        </Label>
                        <Input
                            id="transfer-description"
                            type="text"
                            placeholder="Add a note"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="h-11"
                        />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="flex-1 h-11"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || success}
                            className={cn(
                                "flex-1 h-11 font-semibold transition-all duration-300",
                                success
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600"
                                    : "bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                            )}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Transferring...
                                </>
                            ) : success ? (
                                <>
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    Success!
                                </>
                            ) : (
                                <>
                                    <ArrowRightLeft className="w-4 h-4 mr-2" />
                                    Transfer
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};