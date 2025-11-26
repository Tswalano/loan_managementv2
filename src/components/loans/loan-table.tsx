import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Balance, Loan, LoanPaymentRequest, LoanResponse } from "@/types";
import { formatCurrency, formatShortDate } from "@/lib/utils/formatters";
import { LoanPaymentDialog } from "./loan-payment-dialog";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { DollarSign, Send, AlertCircle } from "lucide-react";

interface LoanTableProps {
    loans: Loan[];
    balances: Balance[];
    refreshLoans: () => void;
    handleLoanPayment: (payment: LoanPaymentRequest) => Promise<LoanResponse>;
    loading: boolean;
}

function LoanTableRecords({
    refreshLoans,
    handleLoanPayment,
    loading,
    loans,
    balances,
}: LoanTableProps) {
    const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);
    const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handlePayment = (loan: Loan) => {
        setSelectedLoan(loan);
        setIsPaymentDialogOpen(true);
        setError(null);
    };

    const handleDisburst = (loan: Loan) => {
        api.disburseLoan(loan.id, {
            amount: Number(loan.principalAmount),
            fromBalanceId: loan.balanceId,
            description: `Disbursing loan to ${loan.borrowerName}`,
        })
            .then(() => {
                refreshLoans();
            })
            .catch((err) => {
                console.error('Error disbursing loan:', err);
                setError('Failed to disburse loan. Please try again.');
            });
    };

    const handlePaymentSubmit = async (payment: LoanPaymentRequest) => {
        if (!selectedLoan) return;

        try {
            setIsProcessing(true);
            setError(null);

            const result = await handleLoanPayment({ ...payment, loanId: selectedLoan.id });

            console.log('Payment result:', result);

            if (result.success) {
                setIsPaymentDialogOpen(false);
                refreshLoans();
            } else {
                setError('Payment failed');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Payment failed');
            console.error('Error processing payment:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-48">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-emerald-600 dark:border-t-[#C4F546]" />
            </div>
        );
    }

    return (
        <>
            <Card className={cn(
                "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                "border border-gray-200/50 dark:border-gray-700/50",
                "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
            )}>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Recent Loans</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                        Latest loan disbursements and their status
                    </CardDescription>
                    {error && (
                        <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 mt-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800/30">
                            <AlertCircle className="h-4 w-4" />
                            {error}
                        </div>
                    )}
                </CardHeader>
                <CardContent>
                    <div className="rounded-xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-800/50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Borrower
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Account
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Amount
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Balance
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                    {loans.map((loan, index) => (
                                        <tr
                                            key={loan.id}
                                            className={cn(
                                                "transition-colors duration-200",
                                                "hover:bg-gray-50 dark:hover:bg-gray-800/50",
                                                index % 2 === 0 ? "bg-white dark:bg-gray-900/40" : "bg-gray-50/50 dark:bg-gray-900/20"
                                            )}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                                        <span className="text-white font-semibold text-sm">
                                                            {loan.borrowerName?.charAt(0)?.toUpperCase() || 'N'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                                            {loan.borrowerName || 'Not available'}
                                                        </div>
                                                        <div className="text-xs text-gray-500 dark:text-gray-400">
                                                            Started {loan.createdAt ? formatShortDate(new Date(loan.createdAt)) : 'Not available'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                    {loan.balance?.bankName || '-'}
                                                </div>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                                                    {loan.balance?.accountNumber || '-'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-bold text-gray-900 dark:text-white">
                                                    {formatCurrency(parseFloat(loan.principalAmount || '0'))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                                    {formatCurrency(parseFloat(loan.outstandingBalance || '0'))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span className={cn(
                                                    "px-3 py-1.5 text-xs rounded-full font-semibold inline-flex items-center gap-1",
                                                    loan.status === 'ACTIVE' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
                                                    loan.status === 'PAID' && "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
                                                    loan.status === 'DEFAULTED' && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
                                                    loan.status === 'PENDING' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
                                                )}>
                                                    <div className={cn(
                                                        "w-1.5 h-1.5 rounded-full",
                                                        loan.status === 'ACTIVE' && "bg-emerald-600 dark:bg-emerald-400",
                                                        loan.status === 'PAID' && "bg-blue-600 dark:bg-blue-400",
                                                        loan.status === 'DEFAULTED' && "bg-red-600 dark:bg-red-400",
                                                        loan.status === 'PENDING' && "bg-yellow-600 dark:bg-yellow-400"
                                                    )} />
                                                    {loan.status || 'PENDING'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right">
                                                {loan.status === 'ACTIVE' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePayment(loan)}
                                                        disabled={loan.status !== 'ACTIVE' || isProcessing}
                                                        className={cn(
                                                            "bg-emerald-50 dark:bg-emerald-900/20",
                                                            "border-emerald-200 dark:border-emerald-800/30",
                                                            "text-emerald-700 dark:text-emerald-400",
                                                            "hover:bg-emerald-100 dark:hover:bg-emerald-900/40",
                                                            "disabled:opacity-50 disabled:cursor-not-allowed",
                                                            "transition-all duration-200"
                                                        )}
                                                    >
                                                        <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                                                        Make Payment
                                                    </Button>
                                                ) : loan.status === 'PENDING' ? (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDisburst(loan)}
                                                        className={cn(
                                                            "bg-blue-50 dark:bg-blue-900/20",
                                                            "border-blue-200 dark:border-blue-800/30",
                                                            "text-blue-700 dark:text-blue-400",
                                                            "hover:bg-blue-100 dark:hover:bg-blue-900/40",
                                                            "transition-all duration-200"
                                                        )}
                                                    >
                                                        <Send className="h-3.5 w-3.5 mr-1.5" />
                                                        Disburse Loan
                                                    </Button>
                                                ) : (
                                                    <span className="text-sm text-gray-400 dark:text-gray-500 font-medium">
                                                        No Actions
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
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
                    isLoading={isProcessing}
                />
            )}
        </>
    );
}

export default LoanTableRecords;