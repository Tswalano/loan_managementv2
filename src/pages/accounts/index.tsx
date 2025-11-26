/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import {
    Card,
    CardContent,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Wallet, CreditCard } from 'lucide-react';
import { api, useBalances } from '@/lib/api';
import { AccountType, type Balance } from '@/types';
import { DeleteAccountDialog } from '@/components/cards/delete-card';
import { useToast } from '@/hooks/use-toast';
import { getCurrentUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { BankCard } from '@/components/cards/bank-card';

const BANKS = {
    FNB: 'First National Bank',
    CAPITEC: 'Capitec Bank',
    TYMEBANK: 'TymeBank',
    ABSA: 'ABSA Bank',
    STANDARDBANK: 'Standard Bank',
    NEDBANK: 'Nedbank',
    AFRICANBANK: 'African Bank',
    DISCOVERY: 'Discovery Bank'
} as const;

type BankKey = keyof typeof BANKS;

interface AccountFormData {
    accountName: string;
    bankName: BankKey;
    initialBalance: number;
}

export default function AccountManagementPage() {
    const user = getCurrentUser();
    const { data: balancesData, isLoading, refetch } = useBalances();
    const balances = balancesData?.balances || [];

    const { toast } = useToast();
    const [selectedAccount, setSelectedAccount] = useState<Balance | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [formData, setFormData] = useState<AccountFormData>({
        accountName: '',
        bankName: 'FNB',
        initialBalance: 0
    });

    const generateAccountNumber = () => {
        const accountNumber = [];
        for (let i = 0; i < 4; i++) {
            accountNumber.push(Math.floor(Math.random() * 9000) + 1000);
        }
        return accountNumber.join('-');
    };

    const handleCreateAccount = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to create an account.",
                variant: "destructive",
            });
            return;
        }

        try {
            setIsCreating(true);

            await api.createBalance({
                type: AccountType.BANK,
                accountNumber: generateAccountNumber(),
                balance: formData.initialBalance.toString(),
                bankName: BANKS[formData.bankName],
                accountName: formData.accountName || BANKS[formData.bankName],
            });

            toast({
                title: "Account created",
                description: "Your new account has been created successfully.",
            });

            setFormData({
                accountName: '',
                bankName: 'FNB',
                initialBalance: 0
            });

            setIsCreateDialogOpen(false);
            refetch();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to create account. Please try again.",
                variant: "destructive",
            });
            console.error('Failed to create account:', error);
        } finally {
            setIsCreating(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (!selectedAccount) return;

        try {
            setIsDeleting(true);

            await api.deleteBalance(selectedAccount.id);

            toast({
                title: "Account deleted",
                description: "The account has been deleted successfully.",
            });

            setSelectedAccount(null);
            refetch();
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to delete account. Please try again.",
                variant: "destructive",
            });
            console.error('Failed to delete account:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    // Empty State Card Component
    const EmptyStateCard = () => (
        <Card
            onClick={() => setIsCreateDialogOpen(true)}
            className={cn(
                "relative overflow-hidden h-48",
                "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                "border-2 border-dashed border-gray-300 dark:border-gray-600",
                "rounded-2xl shadow-lg dark:shadow-2xl dark:shadow-black/20",
                "hover:border-emerald-500 dark:hover:border-emerald-500",
                "hover:shadow-xl dark:hover:shadow-black/40",
                "transition-all duration-300 hover:scale-[1.02]",
                "cursor-pointer group"
            )}
        >
            <CardContent className="flex flex-col items-center justify-center h-full p-6">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <Plus className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    Add New Account
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                    Click to create a new bank account
                </p>
            </CardContent>

            {/* Decorative elements */}
            <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <CreditCard className="h-12 w-12 text-gray-400 dark:text-gray-600" />
            </div>
            <div className="absolute bottom-4 left-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <Wallet className="h-10 w-10 text-gray-400 dark:text-gray-600" />
            </div>
        </Card>
    );

    return (
        <div className="min-h-screen p-8">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            Account Management
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            Manage your bank accounts and financial portfolios
                        </p>
                    </div>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className={cn(
                            "bg-gradient-to-r from-emerald-600 to-emerald-700",
                            "hover:from-emerald-700 hover:to-emerald-800",
                            "text-white shadow-lg hover:shadow-xl",
                            "transition-all duration-300"
                        )}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Account
                    </Button>
                </div>

                {/* Accounts Grid */}
                {isLoading ? (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[1, 2, 3].map((i) => (
                            <Card
                                key={i}
                                className={cn(
                                    "h-48 animate-pulse",
                                    "bg-gray-200 dark:bg-gray-800",
                                    "rounded-2xl"
                                )}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {/* Empty State Card - Always shown first */}
                        <EmptyStateCard />

                        {/* Existing Bank Cards */}
                        {balances.map((balance: Balance) => (
                            <BankCard
                                key={balance.id}
                                accountName={balance.accountName}
                                accountNumber={balance.accountNumber}
                                bankName={balance.bankName}
                                currentBalance={balance.balance}
                                onClick={() => setSelectedAccount(balance)}
                            />
                        ))}
                    </div>
                )}

                {/* Create Account Dialog */}
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogContent className={cn(
                        "sm:max-w-[500px]",
                        "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                        "border border-gray-200/50 dark:border-gray-700/50",
                        "shadow-2xl dark:shadow-black/40"
                    )}>
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                Create New Account
                            </DialogTitle>
                            <DialogDescription className="text-gray-600 dark:text-gray-400">
                                Add a new bank account to track your finances
                            </DialogDescription>
                        </DialogHeader>

                        <form className="space-y-5 py-4" onSubmit={(e) => { e.preventDefault(); handleCreateAccount(); }}>
                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Bank
                                </Label>
                                <Select
                                    value={formData.bankName}
                                    onValueChange={(value: BankKey) =>
                                        setFormData({ ...formData, bankName: value })}
                                >
                                    <SelectTrigger className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 h-11">
                                        <SelectValue placeholder="Select your bank" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                        {Object.entries(BANKS).map(([key, name]) => (
                                            <SelectItem key={key} value={key} className="focus:bg-gray-100 dark:focus:bg-gray-800">
                                                {name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Account Name (Optional)
                                </Label>
                                <Input
                                    placeholder="e.g., Main Savings Account"
                                    value={formData.accountName}
                                    onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                    className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 h-11"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Initial Balance
                                </Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    value={formData.initialBalance}
                                    onChange={(e) => setFormData({ ...formData, initialBalance: parseFloat(e.target.value) || 0 })}
                                    className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 h-11"
                                />
                            </div>

                            <DialogFooter className="gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setIsCreateDialogOpen(false);
                                        setFormData({ accountName: '', bankName: 'FNB', initialBalance: 0 });
                                    }}
                                    disabled={isCreating}
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
                                    disabled={isCreating}
                                    className={cn(
                                        "bg-gradient-to-r from-emerald-600 to-emerald-700",
                                        "hover:from-emerald-700 hover:to-emerald-800",
                                        "text-white shadow-lg hover:shadow-xl",
                                        "transition-all duration-300",
                                        "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                >
                                    {isCreating ? (
                                        <>
                                            <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <Plus className="w-4 h-4 mr-2" />
                                            Create Account
                                        </>
                                    )}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                {/* Delete Account Dialog */}
                {selectedAccount && (
                    <DeleteAccountDialog
                        open={!!selectedAccount}
                        onOpenChange={(open) => !open && setSelectedAccount(null)}
                        onConfirm={handleDeleteAccount}
                        accountName={selectedAccount.accountName}
                        accountNumber={selectedAccount.accountNumber}
                        bankName={selectedAccount.bankName}
                        balance={selectedAccount.balance}
                        isDeleting={isDeleting}
                    />
                )}
            </div>
        </div>
    );
}