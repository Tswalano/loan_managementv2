// src/components/loans/LoanTableRecords.tsx
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Balance, Loan, LoanPayment, LoanTransactionResult } from "@/types";
import { formatCurrency, formatShortDate } from "@/lib/utils/formatters";
import { LoanPaymentDialog } from "./loan-payment-dialog";

interface LoanTableProps {
    loans: Loan[];
    balances: Balance[];
    refreshLoans: () => Promise<void>;
    handleLoanPayment: (payment: LoanPayment) => Promise<LoanTransactionResult>;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

function LoanTableRecords({
    setLoading,
    refreshLoans,
    handleLoanPayment,
    loading,
    loans,
    balances,
}: LoanTableProps) {
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handlePayment = (loan: Loan) => {
        setSelectedLoan(loan);
        setIsPaymentDialogOpen(true);
        setError(null);
    };

    const handlePaymentSubmit = async (payment: LoanPayment) => {
        if (!selectedLoan) return;

        try {
            setLoading(true);
            setError(null);

            if (!selectedLoan.accountId) return;

            const result = await handleLoanPayment({
                loanId: payment.loanId,
                amount: payment.amount,
                description: payment.description,
                accountId: payment.accountId
            });

            if (result.success) {
                setIsPaymentDialogOpen(false);
                await refreshLoans();
            } else {
                setError(result.error || 'Payment failed');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Payment failed');
            console.error('Error processing payment:', error);
        } finally {
            setLoading(false);
        }
    };

    // const filterLoanTransactions = (loan: Transaction) => {
    //     return loan.type === 'LOAN_DISBURSEMENT' || loan.type === 'LOAN_PAYMENT';
    // };

    return (
        <>
            <Card className="bg-white dark:bg-gray-800">
                <CardHeader>
                    <CardTitle>Recent Loans</CardTitle>
                    <CardDescription>Latest loan disbursements and their status</CardDescription>
                    {error && (
                        <div className="text-sm text-red-600 dark:text-red-400 mt-2">
                            {error}
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead>
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Borrower
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Account
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Balance
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {loans.map((loan) => (
                                    <tr key={loan.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {loan.borrowerName || 'Not available'}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Started {loan.createdAt ? formatShortDate(new Date(loan.createdAt)) : 'Not available'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                                {loan.balance.bankName || '-'}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                {loan.balance.accountReference || '-'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                                            {formatCurrency(parseFloat(loan.amount || '0'))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-900 dark:text-gray-100">
                                            {formatCurrency(parseFloat(loan.remainingBalance || '0'))}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`px-2 py-1 text-xs rounded-full font-medium ${loan.status === 'ACTIVE'
                                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400'
                                                : loan.status === 'PAID'
                                                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                                                    : loan.status === 'DEFAULTED'
                                                        ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                }`}>
                                                {loan.status || 'PENDING'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handlePayment(loan)}
                                                disabled={loan.status !== 'ACTIVE'}
                                                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                                                    text-emerald-600 dark:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-700 
                                                    hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-50 
                                                    disabled:cursor-not-allowed transition-colors duration-200"
                                            >
                                                Make Payment
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {selectedLoan && (
                <LoanPaymentDialog
                    loan={selectedLoan}
                    open={isPaymentDialogOpen}
                    balances={balances}
                    onClose={() => {
                        setIsPaymentDialogOpen(false);
                        setSelectedLoan(null);
                        setError(null);
                    }}
                    onSubmit={handlePaymentSubmit}
                    isLoading={loading}
                // error={error || null}
                />
            )}
        </>
    );
}

export default LoanTableRecords;