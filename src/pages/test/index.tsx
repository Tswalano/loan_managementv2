import { useState } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import { ArrowDown, ArrowRight, ArrowUp, Loader2 } from 'lucide-react';
import { useBalanceOperations } from '@/hooks/useBalanceOperations';
import { supabase } from '@/lib/supabase';
import { NewBalance, NewTransaction } from '@/types';
import { CardDeck } from './MobileCardDeck';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { formatCurrency, generateReferenceNumber } from '@/lib/utils/formatters';

const BalanceOperationsUI = () => {
    const {
        balances,
        loading,
        createBalance,
        recordExpense,
        recordIncome,
        transferBetweenAccounts
    } = useBalanceOperations();

    const [amount, setAmount] = useState('400');
    const [category, setCategory] = useState('TEST');
    const [description, setDescription] = useState('THIS IS A TEST');
    const [selectedAccount, setSelectedAccount] = useState('');
    const [targetAccount, setTargetAccount] = useState('');

    // const generateAccountNumber = () => `ACC-${Math.random().toString(36).substring(2, 8)}`;

    // generate the account number in this format 4325-2982-9928-00291
    const generateAccountNumber = () => {
        const accountNumber = [];
        for (let i = 0; i < 4; i++) {
            accountNumber.push(Math.floor(Math.random() * 9000) + 1000);
        }
        return accountNumber.join('-');
    };

    const handleCreateAccount = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const accounts = [
            { account: 'FNB', type: 'CASH', balance: 1400 },
            { account: 'CAPITEC', type: 'LOAN_RECEIVABLE', balance: 24983 }
        ];

        console.log(generateAccountNumber());


        for (const acc of accounts) {
            const newBalance: NewBalance = {
                userId: user.id,
                accountReference: generateAccountNumber(),
                currentBalance: `${acc.balance}`,
                bankName: `${acc.account} Test Bank`,
                accountName: `${acc.account} Account`,
                accountStatus: 'ACTIVE',
                type: 'BANK'
            };
            await createBalance(newBalance);
        }
    };

    // Expense Handler
    const handleExpense = async () => {
        if (!amount || !selectedAccount || !category) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        const newExpense: NewTransaction = {
            date: new Date(),
            type: 'LOAN_DISBURSEMENT',
            description: 'Loan Disbursement',
            fromBalanceId: selectedAccount,
            amount,
            category,
            reference: generateReferenceNumber("LOAN_DISBURSEMENT"),
        }

        console.log(newExpense);
        

        try {
            await recordExpense(newExpense);
            setAmount('');
            setCategory('');
            setDescription('');
        } catch (error) {
            console.error('Failed to record expense:', error);
        }
    };

    // Income Handler
    const handleIncome = async () => {
        if (!amount || !selectedAccount || !category) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        try {
            await recordIncome({
                amount: amount,
                category,
                description,
                reference: generateReferenceNumber("INCOME"),
                toBalanceId: selectedAccount,
                date: new Date(),
                // fromBalanceId: selectedAccount
            });
            setAmount('');
            setCategory('');
            setDescription('');
        } catch (error) {
            console.error('Failed to record income:', error);
        }
    };

    // Transfer Handler
    const handleTransfer = async () => {
        if (!amount || !selectedAccount || !targetAccount) return;

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('No user found');

        // amount: parseFloat(amount.toString()),
        // description: 'Transfer between accounts',
        // reference: generateReferenceNumber("LOAN_PAYMENT"),
        // fromBalanceId: selectedAccount,
        // toBalanceId: targetAccount,
        // type: 'LOAN_PAYMENT',
        // category: 'LOAN_PAYMENT',
        // date: new Date(),
        // userId: user.id

        try {
            await transferBetweenAccounts({
                amount: 0,
                fromBalanceId: selectedAccount,
                toBalanceId: targetAccount
            });
            setAmount('');
            setSelectedAccount('');
            setTargetAccount('');
        } catch (error) {
            console.error('Failed to transfer:', error);
        }
    };

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-6">
            {loading && (
                <div className="flex justify-center items-center">
                    <Loader2 className="animate-spin" />
                </div>
            )}
            {!loading && (
                <>
                    <CardDeck
                        balances={balances}
                        onCreateBalance={handleCreateAccount}
                    />
                    {/* Transaction Actions */}
                    <Card>
                        <CardHeader>
                            <CardTitle>New Transaction</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Amount Input */}
                                <div>
                                    <Input
                                        type="number"
                                        placeholder="Amount"
                                        value={amount}
                                        onChange={(e) => setAmount(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Category Input */}
                                <div>
                                    <Input
                                        placeholder="Category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Description Input */}
                                <div>
                                    <Input
                                        placeholder="Description (optional)"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full"
                                    />
                                </div>

                                {/* Account Selection */}
                                <div>
                                    <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select account" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {balances.map((balance) => (
                                                <SelectItem key={balance.id} value={balance.id}>
                                                    {balance.accountReference} - {formatCurrency(parseFloat(balance.currentBalance))}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Action Buttons */}
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <Button
                                        onClick={handleExpense}
                                        className="w-full"
                                        variant="outline"
                                    >
                                        <ArrowDown className="w-4 h-4 mr-2" />
                                        Expense
                                    </Button>
                                    <Button
                                        onClick={handleIncome}
                                        className="w-full"
                                    >
                                        <ArrowUp className="w-4 h-4 mr-2" />
                                        Income
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Transfer Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Transfer Between Accounts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {/* Source Account */}
                                <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="From account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {balances.map((balance) => (
                                            <SelectItem key={balance.id} value={balance.id}>
                                                {balance.accountReference} - {formatCurrency(parseFloat(balance.currentBalance))}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Target Account */}
                                <Select value={targetAccount} onValueChange={setTargetAccount}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="To account" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {balances.map((balance) => (
                                            <SelectItem key={balance.id} value={balance.id}>
                                                {balance.accountReference} - {formatCurrency(parseFloat(balance.currentBalance))}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {/* Transfer Amount */}
                                <Input
                                    type="number"
                                    placeholder="Transfer amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    className="w-full"
                                />

                                {/* Transfer Button */}
                                <Button
                                    onClick={handleTransfer}
                                    className="w-full"
                                    variant="outline"
                                >
                                    <ArrowRight className="w-4 h-4 mr-2" />
                                    Transfer
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}
        </div>
    );
};

export default BalanceOperationsUI;
