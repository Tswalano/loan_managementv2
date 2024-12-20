import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
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
import { Plus, Loader2 } from 'lucide-react';
import { useBalanceOperations } from '@/hooks/useBalanceOperations';
import { supabase } from '@/lib/supabase';
import type { Balance, NewBalance } from '@/types';
import { DeleteAccountDialog } from '@/components/cards/delete-card';
import { BankCard } from '@/components/cards/bank-card';
import { useToast } from '@/hooks/use-toast';

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
    initialBalance: string;
}

export default function AccountManagementPage() {
    const { balances, loading, createBalance, deleteBalance } = useBalanceOperations();
    const { toast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<Balance | null>(null);
    const [formData, setFormData] = useState<AccountFormData>({
        accountName: '',
        bankName: 'FNB',
        initialBalance: '0'
    });

    const generateAccountNumber = () => {
        const accountNumber = [];
        for (let i = 0; i < 4; i++) {
            accountNumber.push(Math.floor(Math.random() * 9000) + 1000);
        }
        return accountNumber.join('-');
    };

    const handleCreateAccount = async () => {
        try {
            setIsCreating(true);
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('No user found');

            const newBalance: NewBalance = {
                userId: user.id,
                accountReference: generateAccountNumber(),
                currentBalance: formData.initialBalance,
                bankName: BANKS[formData.bankName],
                accountName: formData.accountName || BANKS[formData.bankName],
                accountStatus: 'ACTIVE',
                type: 'BANK'
            };

            await createBalance(newBalance);

            toast({
                title: "Account created",
                description: "Your new account has been created successfully.",
            });

            setFormData({
                accountName: '',
                bankName: 'FNB',
                initialBalance: '0'
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to create account. Please try again.",
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
            await deleteBalance(selectedAccount.id);

            toast({
                title: "Account deleted",
                description: "The account has been deleted successfully.",
            });

            setSelectedAccount(null);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete account. Please try again.",
                variant: "destructive",
            });
            console.error('Failed to delete account:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Account Management
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage your bank accounts, cash, and loan receivables
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Add New Account Form - Fixed on the left */}
                <div className="lg:col-span-4">
                    <div className="sticky top-6">
                        <Card className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle>Add New Account</CardTitle>
                                <CardDescription>
                                    Create a new account to track your finances
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Bank
                                        </label>
                                        <Select
                                            value={formData.bankName}
                                            onValueChange={(value: BankKey) =>
                                                setFormData({ ...formData, bankName: value })}
                                        >
                                            <SelectTrigger className="bg-white dark:bg-gray-800">
                                                <SelectValue placeholder="Select your bank" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.entries(BANKS).map(([key, name]) => (
                                                    <SelectItem key={key} value={key}>
                                                        {name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Account Name (Optional)
                                        </label>
                                        <Input
                                            placeholder="e.g., Main Savings Account"
                                            value={formData.accountName}
                                            onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
                                            className="bg-white dark:bg-gray-800"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Initial Balance
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={formData.initialBalance}
                                            onChange={(e) => setFormData({ ...formData, initialBalance: e.target.value })}
                                            className="bg-white dark:bg-gray-800"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={handleCreateAccount}
                                        disabled={isCreating}
                                    >
                                        {isCreating ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="w-4 h-4 mr-2" />
                                                Add Account
                                            </>
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Bank Cards Grid - On the right */}
                <div className="lg:col-span-8">
                    {loading ? (
                        <div className="flex items-center justify-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                        </div>
                    ) : balances.length === 0 ? (
                        <Card className="flex flex-col items-center justify-center h-48 bg-gray-50/50 dark:bg-gray-800/50 border-dashed">
                            <div className="text-center space-y-2">
                                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                    No accounts yet
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Add your first bank account to get started
                                </p>
                            </div>
                        </Card>
                    ) : (
                        <div className="grid gap-6 sm:grid-cols-2">
                            {balances.map((balance) => (
                                <BankCard
                                    key={balance.id}
                                    accountName={balance.accountName}
                                    accountReference={balance.accountReference}
                                    bankName={balance.bankName}
                                    currentBalance={balance.currentBalance}
                                    onClick={() => setSelectedAccount(balance)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Account Dialog */}
            {selectedAccount && (
                <DeleteAccountDialog
                    open={!!selectedAccount}
                    onOpenChange={(open) => !open && setSelectedAccount(null)}
                    onConfirm={handleDeleteAccount}
                    accountName={selectedAccount.accountName}
                    bankName={selectedAccount.bankName}
                    balance={selectedAccount.currentBalance}
                    isDeleting={isDeleting}
                />
            )}
        </div>
    );
}