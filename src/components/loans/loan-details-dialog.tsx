import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useLoan } from "@/lib/api";
import { formatCurrency, formatShortDate } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import { LoanStatus } from "@/types";
import {
    User, Mail, Phone, Banknote, Calendar, TrendingUp,
    AlertCircle, CheckCircle2, Clock, XCircle, Building2, Loader2
} from "lucide-react";

interface LoanDetailsDialogProps {
    loanId: string | null;
    open: boolean;
    onClose: () => void;
}

const statusConfig: Partial<Record<LoanStatus, { label: string; icon: typeof TrendingUp; color: 'emerald' | 'blue' | 'red' | 'yellow' }>> = {
    [LoanStatus.ACTIVE]: { label: 'Active', icon: TrendingUp, color: 'emerald' },
    [LoanStatus.PAID]: { label: 'Paid', icon: CheckCircle2, color: 'blue' },
    [LoanStatus.DEFAULTED]: { label: 'Defaulted', icon: XCircle, color: 'red' },
    [LoanStatus.PENDING]: { label: 'Pending', icon: Clock, color: 'yellow' },
};

function DetailRow({ label, value, mono = false }: { label: string; value: React.ReactNode; mono?: boolean }) {
    return (
        <div className="flex flex-col gap-1">
            <Label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {label}
            </Label>
            <span className={cn(
                "text-sm font-semibold text-gray-900 dark:text-white",
                mono && "font-mono"
            )}>
                {value ?? '—'}
            </span>
        </div>
    );
}

export function LoanDetailsDialog({ loanId, open, onClose }: LoanDetailsDialogProps) {
    const { data, isLoading } = useLoan(loanId ?? undefined);
    const loan = data?.loan;

    const loanStatus = loan?.status as LoanStatus | undefined;
    const status = loanStatus ? statusConfig[loanStatus] : null;
    const StatusIcon = status?.icon ?? AlertCircle;

    const principalAmount = loan ? parseFloat(loan.principalAmount) : 0;
    const interestRate = loan ? parseFloat(loan.interestRate) : 0;
    const totalWithInterest = principalAmount * (1 + interestRate / 100);
    const totalPaid = loan ? parseFloat(loan.totalPaid || '0') : 0;
    const outstanding = loan ? parseFloat(loan.outstandingBalance || '0') : 0;
    const progressPct = totalWithInterest > 0
        ? Math.min(100, Math.round((totalPaid / totalWithInterest) * 100))
        : 0;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className={cn(
                "sm:max-w-[600px]",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Loan Details
                    </DialogTitle>
                    <DialogDescription className="text-gray-500 dark:text-gray-400">
                        Full breakdown of loan terms and repayment status
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-emerald-600 dark:text-emerald-400" />
                    </div>
                )}

                {!isLoading && loan && (
                    <div className="space-y-5 py-2">
                        {/* Status + Amount hero */}
                        <div className={cn(
                            "p-5 rounded-2xl border",
                            status?.color === 'emerald' && "from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10 border-emerald-200 dark:border-emerald-800/30",
                            status?.color === 'blue' && "from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 border-blue-200 dark:border-blue-800/30",
                            status?.color === 'red' && "from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 border-red-200 dark:border-red-800/30",
                            status?.color === 'yellow' && "from-yellow-50 to-yellow-100/50 dark:from-yellow-900/20 dark:to-yellow-800/10 border-yellow-200 dark:border-yellow-800/30",
                            "bg-gradient-to-br"
                        )}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Principal Amount</p>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(principalAmount)}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                        {interestRate}% interest · {loan.termMonths} months · Total {formatCurrency(totalWithInterest)}
                                    </p>
                                </div>
                                <span className={cn(
                                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold",
                                    status?.color === 'emerald' && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
                                    status?.color === 'blue' && "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
                                    status?.color === 'red' && "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
                                    status?.color === 'yellow' && "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400",
                                )}>
                                    <StatusIcon className="w-4 h-4" />
                                    {status?.label ?? loan.status}
                                </span>
                            </div>

                            {/* Progress bar */}
                            <div className="mt-4">
                                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
                                    <span>Repaid: {formatCurrency(totalPaid)}</span>
                                    <span>{progressPct}%</span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            status?.color === 'emerald' && "bg-emerald-500",
                                            status?.color === 'blue' && "bg-blue-500",
                                            status?.color === 'red' && "bg-red-500",
                                            status?.color === 'yellow' && "bg-yellow-500",
                                        )}
                                        style={{ width: `${progressPct}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                                    Outstanding: <span className="font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(outstanding)}</span>
                                </p>
                            </div>
                        </div>

                        {/* Borrower */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 p-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5" /> Borrower
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <DetailRow label="Name" value={loan.borrowerName} />
                                <DetailRow
                                    label="Email"
                                    value={loan.borrowerEmail
                                        ? <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3 opacity-60" />{loan.borrowerEmail}</span>
                                        : '—'}
                                />
                                <DetailRow
                                    label="Phone"
                                    value={loan.borrowerPhone
                                        ? <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3 opacity-60" />{loan.borrowerPhone}</span>
                                        : '—'}
                                />
                            </div>
                        </div>

                        {/* Dates + Account */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 p-4 space-y-3">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <Calendar className="w-3.5 h-3.5" /> Timeline
                                </p>
                                <DetailRow label="Disbursed" value={loan.disbursementDate ? formatShortDate(new Date(loan.disbursementDate)) : '—'} />
                                <DetailRow label="Maturity" value={loan.maturityDate ? formatShortDate(new Date(loan.maturityDate)) : '—'} />
                                <DetailRow label="Created" value={formatShortDate(new Date(loan.createdAt))} />
                            </div>

                            <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 p-4 space-y-3">
                                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide flex items-center gap-1.5">
                                    <Building2 className="w-3.5 h-3.5" /> Funding Account
                                </p>
                                <DetailRow label="Bank" value={loan.balance?.bankName ?? '—'} />
                                <DetailRow label="Account" value={loan.balance?.accountName ?? '—'} />
                                <DetailRow label="Number" mono value={loan.balance?.accountNumber ?? '—'} />
                            </div>
                        </div>

                        {/* Financial summary */}
                        <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/80 dark:bg-gray-800/40 p-4">
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                                <Banknote className="w-3.5 h-3.5" /> Financials
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <DetailRow label="Principal" value={formatCurrency(principalAmount)} />
                                <DetailRow label="Interest Rate" value={`${interestRate}%`} />
                                <DetailRow label="Total Due" value={formatCurrency(totalWithInterest)} />
                                <DetailRow label="Total Paid" value={
                                    <span className="text-emerald-600 dark:text-emerald-400">{formatCurrency(totalPaid)}</span>
                                } />
                            </div>
                        </div>
                    </div>
                )}

                {!isLoading && !loan && (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-500 dark:text-gray-400">
                        <AlertCircle className="w-10 h-10 mb-3 opacity-50" />
                        <p className="text-sm">Loan details could not be loaded.</p>
                    </div>
                )}

                <DialogFooter className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                        onClick={onClose}
                        className={cn(
                            "bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600",
                            "text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                        )}
                        variant="outline"
                    >
                        Close
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
