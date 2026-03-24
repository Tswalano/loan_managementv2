/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
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
            <DialogContent className={cn(
                "sm:max-w-[500px]",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Load Funds
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Add money to your account from external sources
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    {/* Account Selection */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Destination Account *
                        </Label>
                        <Select
                            value={formData.toBalanceId}
                            onValueChange={(value) => setFormData({ ...formData, toBalanceId: value })}
                        >
                            <SelectTrigger className="h-11 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-[#C4F546] text-gray-900 dark:text-white">
                                <SelectValue placeholder="Select account" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                {activeAccounts.map((account: Balance) => (
                                    <SelectItem key={account.id} value={account.id} className="focus:bg-gray-100 dark:focus:bg-gray-800">
                                        <div className="flex items-center gap-2">
                                            {account.type === 'BANK' ? (
                                                <Building2 className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <Wallet className="w-4 h-4 text-purple-500" />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{getAccountName(account)}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
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
                            "p-4 rounded-xl",
                            "bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-700/20",
                            "border border-gray-200 dark:border-gray-700/50"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Balance</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(parseFloat(selectedAccount.balance))}
                                    </p>
                                </div>
                                <CreditCard className="w-8 h-8 text-gray-300 dark:text-gray-600" />
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Amount to Load *
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">R</span>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="pl-7 h-11 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Category
                        </Label>
                        <Input
                            type="text"
                            placeholder="e.g., Fund Loading, Deposit"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="h-11 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description (Optional)
                        </Label>
                        <Input
                            type="text"
                            placeholder="Add a note"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="h-11 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>

                    <DialogFooter className="gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || success}
                            className={cn(
                                "font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                                success
                                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700"
                                    : "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
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
                    </DialogFooter>
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
            <DialogContent className={cn(
                "sm:max-w-[500px]",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Transfer Funds
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Move money between your accounts
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    {/* From Account */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            From Account *
                        </Label>
                        <Select
                            value={formData.fromBalanceId}
                            onValueChange={(value) => setFormData({ ...formData, fromBalanceId: value })}
                        >
                            <SelectTrigger className="h-11 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-[#C4F546] text-gray-900 dark:text-white">
                                <SelectValue placeholder="Select source account" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                {activeAccounts.map((account: Balance) => (
                                    <SelectItem key={account.id} value={account.id} className="focus:bg-gray-100 dark:focus:bg-gray-800">
                                        <div className="flex items-center gap-2">
                                            {account.type === 'BANK' ? (
                                                <Building2 className="w-4 h-4 text-blue-500" />
                                            ) : (
                                                <Wallet className="w-4 h-4 text-purple-500" />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-medium text-sm">{getAccountName(account)}</span>
                                                <span className="text-xs text-gray-500 dark:text-gray-400">
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
                            "p-4 rounded-xl",
                            "bg-gradient-to-br from-orange-50 to-red-50/50 dark:from-red-900/20 dark:to-orange-900/10",
                            "border border-orange-200 dark:border-red-800/40"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Available Balance</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(parseFloat(fromAccount.balance))}
                                    </p>
                                </div>
                                <ArrowRightLeft className="w-7 h-7 text-orange-300 dark:text-red-700" />
                            </div>
                        </div>
                    )}

                    {/* Transfer Arrow */}
                    <div className="flex justify-center">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow">
                            <ArrowRightLeft className="w-3.5 h-3.5 text-white" />
                        </div>
                    </div>

                    {/* To Account */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            To Account *
                        </Label>
                        <Select
                            value={formData.toBalanceId}
                            onValueChange={(value) => setFormData({ ...formData, toBalanceId: value })}
                        >
                            <SelectTrigger className="h-11 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-[#C4F546] text-gray-900 dark:text-white">
                                <SelectValue placeholder="Select destination account" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                {activeAccounts
                                    .filter((a: Balance) => a.id !== formData.fromBalanceId)
                                    .map((account: Balance) => (
                                        <SelectItem key={account.id} value={account.id} className="focus:bg-gray-100 dark:focus:bg-gray-800">
                                            <div className="flex items-center gap-2">
                                                {account.type === 'BANK' ? (
                                                    <Building2 className="w-4 h-4 text-blue-500" />
                                                ) : (
                                                    <Wallet className="w-4 h-4 text-purple-500" />
                                                )}
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-sm">{getAccountName(account)}</span>
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
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
                            "p-4 rounded-xl",
                            "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10",
                            "border border-emerald-200 dark:border-emerald-800/30"
                        )}>
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Balance</p>
                                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(parseFloat(toAccount.balance))}
                                    </p>
                                </div>
                                <CreditCard className="w-7 h-7 text-emerald-300 dark:text-emerald-700" />
                            </div>
                        </div>
                    )}

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Amount to Transfer *
                        </Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">R</span>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="pl-7 h-11 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Description (Optional)
                        </Label>
                        <Input
                            type="text"
                            placeholder="Add a note"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="h-11 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>

                    <DialogFooter className="gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isLoading}
                            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || success}
                            className={cn(
                                "font-semibold text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed",
                                success
                                    ? "bg-gradient-to-r from-emerald-600 to-emerald-700"
                                    : "bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
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
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};