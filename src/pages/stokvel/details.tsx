/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, DollarSign, Download, Eye, UserPlus, Users } from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { cn } from '@/lib/utils';
import { formatCurrency, formatShortDate } from '@/lib/utils/formatters';
import { api, useStokvels } from '@/lib/api';
import { toast } from '@/hooks/use-toast';
import { AddMemberDialog, RecordPaymentDialog } from './dialogs';
import type { AddStokvelMemberRequest, RecordStokvelPaymentRequest, Stokvel, StokvelFrequency, StokvelMember, StokvelPayment } from '@/types';

type MemberInsight = {
    member: StokvelMember;
    payments: StokvelPayment[];
    paidCycles: number;
    plannedCycles: number;
    skippedCycles: number;
    lastPayment: StokvelPayment | null;
    outstandingAmount: number;
    totalDueAmount: number;
};

function startOfCycle(date: Date, frequency: StokvelFrequency): Date {
    const normalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    if (frequency === 'weekly') {
        const day = normalized.getDay();
        const diff = day === 0 ? -6 : 1 - day;
        normalized.setDate(normalized.getDate() + diff);
        return new Date(normalized.getFullYear(), normalized.getMonth(), normalized.getDate());
    }
    if (frequency === 'quarterly') {
        const quarterStartMonth = Math.floor(normalized.getMonth() / 3) * 3;
        return new Date(normalized.getFullYear(), quarterStartMonth, 1);
    }
    return new Date(normalized.getFullYear(), normalized.getMonth(), 1);
}

function addCycle(date: Date, frequency: StokvelFrequency): Date {
    if (frequency === 'weekly') {
        return new Date(date.getFullYear(), date.getMonth(), date.getDate() + 7);
    }
    if (frequency === 'quarterly') {
        return new Date(date.getFullYear(), date.getMonth() + 3, 1);
    }
    return new Date(date.getFullYear(), date.getMonth() + 1, 1);
}

function cycleKey(date: Date, frequency: StokvelFrequency): string {
    if (frequency === 'weekly') {
        const start = startOfCycle(date, frequency);
        return `${start.getFullYear()}-W-${start.toISOString().slice(0, 10)}`;
    }
    if (frequency === 'quarterly') {
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        return `${date.getFullYear()}-Q${quarter}`;
    }
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getCycleDateFromPayment(payment: StokvelPayment, frequency: StokvelFrequency): Date {
    const normalizedPeriod = payment.period.trim();

    if (frequency === 'monthly') {
        const parsed = new Date(`${normalizedPeriod} 1`);
        if (!Number.isNaN(+parsed)) {
            return startOfCycle(parsed, frequency);
        }
    }

    if (frequency === 'quarterly') {
        const match = normalizedPeriod.match(/^Q([1-4])\s+(\d{4})$/i);
        if (match) {
            const quarter = Number(match[1]);
            const year = Number(match[2]);
            return new Date(year, (quarter - 1) * 3, 1);
        }
    }

    if (frequency === 'weekly' && normalizedPeriod.toLowerCase().startsWith('week of ')) {
        const parsed = new Date(normalizedPeriod.slice(8));
        if (!Number.isNaN(+parsed)) {
            return startOfCycle(parsed, frequency);
        }
    }

    return startOfCycle(new Date(payment.date), frequency);
}

function getCycleUnitLabel(frequency: StokvelFrequency, count: number): string {
    if (frequency === 'weekly') {
        return `${count} week${count === 1 ? '' : 's'}`;
    }
    if (frequency === 'quarterly') {
        return `${count} quarter${count === 1 ? '' : 's'}`;
    }
    return `${count} month${count === 1 ? '' : 's'}`;
}

function collectCycleDates(startDate: Date, endDate: Date, frequency: StokvelFrequency): Date[] {
    if (endDate < startDate) {
        return [];
    }

    const dates: Date[] = [];
    let cursor = startOfCycle(startDate, frequency);
    const lastCycle = startOfCycle(endDate, frequency);

    while (cursor <= lastCycle) {
        dates.push(new Date(cursor));
        cursor = addCycle(cursor, frequency);
    }

    return dates;
}

function buildMemberInsight(stokvel: Stokvel, member: StokvelMember): MemberInsight {
    const frequency = stokvel.frequency;
    const contributionAmount = parseFloat(stokvel.contributionAmount || '0');
    const payments = [...stokvel.payments]
        .filter((payment) => payment.memberId === member.id)
        .sort((a, b) => +new Date(b.date) - +new Date(a.date));

    const paidKeys = new Set(
        payments.map((payment) => cycleKey(getCycleDateFromPayment(payment, frequency), frequency))
    );

    const scheduleStart = startOfCycle(
        new Date(Math.max(+new Date(stokvel.startDate), +new Date(member.joinedDate))),
        frequency
    );
    const scheduleEnd = startOfCycle(new Date(stokvel.targetDate), frequency);
    const dueEnd = startOfCycle(new Date(Math.min(+new Date(), +scheduleEnd)), frequency);

    const plannedCycles = collectCycleDates(scheduleStart, scheduleEnd, frequency);
    const dueCycles = collectCycleDates(scheduleStart, dueEnd, frequency);
    const plannedKeys = new Set(plannedCycles.map((cycleDate) => cycleKey(cycleDate, frequency)));
    const paidPlannedCycleCount = [...paidKeys].filter((key) => plannedKeys.has(key)).length;

    let skippedCycles = 0;
    for (const dueCycle of dueCycles) {
        const key = cycleKey(dueCycle, frequency);
        if (!paidKeys.has(key)) {
            skippedCycles += 1;
        }
    }

    return {
        member,
        payments,
        paidCycles: paidPlannedCycleCount,
        plannedCycles: plannedCycles.length,
        skippedCycles,
        lastPayment: payments[0] || null,
        outstandingAmount: skippedCycles * contributionAmount,
        totalDueAmount: plannedCycles.length * contributionAmount,
    };
}

export default function StokvelDetailsPage() {
    const { stokvelId } = useParams();
    const { data, isLoading } = useStokvels();
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
    const [transactionsOpen, setTransactionsOpen] = useState(false);

    const stokvel = useMemo(() => (data?.stokvels || []).find((item: Stokvel) => item.id === stokvelId) || null, [data, stokvelId]);

    const memberInsights = useMemo(
        () => stokvel ? stokvel.members.map((member: StokvelMember) => buildMemberInsight(stokvel, member)).sort((a: MemberInsight, b: MemberInsight) => b.skippedCycles - a.skippedCycles) : [],
        [stokvel]
    );

    const totalSkippedCycles = memberInsights.reduce((sum: number, item: MemberInsight) => sum + item.skippedCycles, 0);
    const expectedCycleValue = stokvel ? parseFloat(stokvel.contributionAmount || '0') * stokvel.members.length : 0;
    const totalCollected = stokvel ? parseFloat(stokvel.totalCollected || '0') : 0;
    const targetAmount = stokvel ? parseFloat(stokvel.targetAmount || '0') : 0;
    const progress = stokvel && targetAmount > 0 ? (totalCollected / targetAmount) * 100 : 0;
    const plannedCycles = stokvel ? collectCycleDates(new Date(stokvel.startDate), new Date(stokvel.targetDate), stokvel.frequency).length : 0;
    const requiredPerCycle = plannedCycles > 0 && targetAmount > 0 ? targetAmount / plannedCycles : 0;
    const stokvelTransactions = stokvel ? [...stokvel.payments].sort((a, b) => +new Date(b.date) - +new Date(a.date)) : [];

    const handleAddMember = async (payload: AddStokvelMemberRequest) => {
        if (!stokvelId) return;
        await api.addStokvelMember(stokvelId, payload);
        toast({ title: "Success", description: "Member added successfully!" });
    };

    const handleRecordPayment = async (payload: RecordStokvelPaymentRequest) => {
        if (!stokvelId) return;
        await api.recordStokvelPayment(stokvelId, payload);
        toast({ title: "Success", description: "Payment recorded successfully!" });
    };

    const exportToExcel = () => {
        const summaryData = [
            ['Stokvel', stokvel.name],
            ['Description', stokvel.description || ''],
            ['Frequency', stokvel.frequency],
            ['Start Date', formatShortDate(new Date(stokvel.startDate))],
            ['Target Date', formatShortDate(new Date(stokvel.targetDate))],
            ['Contribution Amount', Number(stokvel.contributionAmount || '0')],
            ['Target Amount', Number(stokvel.targetAmount || '0')],
            ['Total Collected', totalCollected],
            ['Members', stokvel.members.length],
            ['Skipped Cycles', totalSkippedCycles],
            ['Planned Cycles', plannedCycles],
            ['Required Per Cycle', requiredPerCycle],
        ];

        const memberData = [
            ['Member', 'Email', 'Phone', 'Payment Progress', 'Payments Made', 'Skipped Months', 'Total Paid', 'Outstanding', 'Total Due', 'Last Payment', 'Status'],
            ...memberInsights.map((item: MemberInsight) => [
                item.member.name,
                item.member.email || '',
                item.member.phone || '',
                `${item.paidCycles}/${item.plannedCycles} Payments`,
                item.payments.length,
                item.skippedCycles,
                Number(item.member.totalPaid || '0'),
                item.outstandingAmount,
                item.totalDueAmount,
                item.lastPayment ? formatShortDate(new Date(item.lastPayment.date)) : '',
                item.skippedCycles === 0 ? 'Current' : 'Behind',
            ]),
        ];

        const paymentData = [
            ['Member', 'Period', 'Captured Date', 'Amount', 'Status', 'Notes'],
            ...[...stokvel.payments]
                .sort((a, b) => +new Date(b.date) - +new Date(a.date))
                .map((payment) => [
                    payment.memberName || payment.member?.name || '',
                    payment.period,
                    formatShortDate(new Date(payment.date)),
                    Number(payment.amount || '0'),
                    payment.status,
                    payment.notes || '',
                ]),
        ];

        const wb = XLSX.utils.book_new();

        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        summarySheet['!cols'] = [{ wch: 22 }, { wch: 24 }];

        const membersSheet = XLSX.utils.aoa_to_sheet(memberData);
        membersSheet['!cols'] = [
            { wch: 24 },
            { wch: 30 },
            { wch: 18 },
            { wch: 18 },
            { wch: 14 },
            { wch: 16 },
            { wch: 14 },
            { wch: 14 },
            { wch: 14 },
            { wch: 14 },
            { wch: 12 },
        ];

        const paymentsSheet = XLSX.utils.aoa_to_sheet(paymentData);
        paymentsSheet['!cols'] = [
            { wch: 24 },
            { wch: 16 },
            { wch: 16 },
            { wch: 14 },
            { wch: 12 },
            { wch: 36 },
        ];

        XLSX.utils.book_append_sheet(wb, summarySheet, 'Summary');
        XLSX.utils.book_append_sheet(wb, membersSheet, 'Members');
        XLSX.utils.book_append_sheet(wb, paymentsSheet, 'Payments');

        const safeName = stokvel.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
        XLSX.writeFile(wb, `${safeName || 'stokvel'}_${new Date().toISOString().slice(0, 10)}.xlsx`);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-[50vh]">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-emerald-600 dark:border-t-[#C4F546]" />
            </div>
        );
    }

    if (!stokvelId || !stokvel) {
        return <Navigate to="/app/stokvel" replace />;
    }

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                    <Link
                        to="/app/stokvel"
                        className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Stokvels
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {stokvel.name}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {stokvel.description || 'Track members, missed cycles, and every contribution in one place.'}
                        </p>
                    </div>
                </div>
                <div className="flex flex-wrap gap-3">
                    <Button
                        variant="outline"
                        onClick={() => setTransactionsOpen(true)}
                        className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50"
                    >
                        <Eye className="h-4 w-4 mr-2" />
                        Transactions
                    </Button>
                    <Button
                        variant="outline"
                        onClick={exportToExcel}
                        className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => setAddMemberOpen(true)}
                        className="backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200/50 dark:border-gray-700/50"
                    >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Add Member
                    </Button>
                    <Button
                        onClick={() => setRecordPaymentOpen(true)}
                        className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                        <DollarSign className="h-4 w-4 mr-2" />
                        Record Payment
                    </Button>
                </div>
            </div>

            <Card className={cn(
                "relative overflow-hidden backdrop-blur-xl",
                "bg-white/80 dark:bg-gray-900/80",
                "border border-gray-200/50 dark:border-gray-700/50",
                "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
            )}>
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-emerald-500/10" />
                <CardContent className="relative p-6 md:p-8">
                    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
                        <div className="space-y-5">
                            <div className="flex items-center gap-3">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                    <Users className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">{stokvel.frequency} contribution cycle</p>
                                    <div className="flex items-center gap-3 mt-1">
                                        <Badge className={cn(
                                            "text-xs font-semibold border-0",
                                            stokvel.status === 'active' && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
                                            stokvel.status === 'paused' && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
                                            stokvel.status === 'completed' && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400"
                                        )}>
                                            {stokvel.status}
                                        </Badge>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Started {formatShortDate(new Date(stokvel.startDate))}
                                        </span>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">
                                            Target {formatShortDate(new Date(stokvel.targetDate))}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {targetAmount > 0 && (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                                        <span>Progress toward target</span>
                                        <span className="font-semibold">{progress.toFixed(0)}%</span>
                                    </div>
                                    <div className="h-3 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {formatCurrency(totalCollected)} of {formatCurrency(targetAmount)}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                            <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/50 p-4">
                                <p className="text-sm text-gray-500 dark:text-gray-400">Expected per cycle</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{formatCurrency(expectedCycleValue)}</p>
                            </div>
                            <div className="rounded-2xl border border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/70 dark:bg-emerald-900/10 p-4">
                                <p className="text-sm text-emerald-700 dark:text-emerald-300">Planned duration</p>
                                <p className="text-2xl font-bold text-emerald-800 dark:text-emerald-200 mt-1">{getCycleUnitLabel(stokvel.frequency, plannedCycles)}</p>
                                <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80 mt-1">
                                    {requiredPerCycle > 0 ? `${formatCurrency(requiredPerCycle)} needed per cycle to reach ${formatCurrency(targetAmount)}` : 'Set by start date and target date'}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className={cn(
                "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                "border border-gray-200/50 dark:border-gray-700/50",
                "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
            )}>
                <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white">Members Payment Status</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                        Payment progress runs from each member's join date through the stokvel target date. Skipped months only count missed cycles due up to today.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/40 overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                    <TableHead>Member</TableHead>
                                    <TableHead>Payment Progress</TableHead>
                                    <TableHead>Payments Made</TableHead>
                                    <TableHead>Skipped Months</TableHead>
                                    <TableHead>Total Paid</TableHead>
                                    <TableHead>Outstanding</TableHead>
                                    <TableHead>Total Due</TableHead>
                                    <TableHead>Last Payment</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {memberInsights.map((item: MemberInsight) => (
                                    <TableRow key={item.member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                                        <TableCell>
                                            <div>
                                                <p className="font-semibold text-gray-900 dark:text-white">{item.member.name}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {item.member.email || item.member.phone || 'No contact info'}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className={cn(
                                            "font-semibold",
                                            item.skippedCycles === 0 ? "text-emerald-600 dark:text-emerald-400" : "text-gray-900 dark:text-white"
                                        )}>
                                            {item.paidCycles}/{item.plannedCycles} Payments
                                        </TableCell>
                                        <TableCell className="text-gray-600 dark:text-gray-300">
                                            {item.payments.length}
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(
                                                "border-0",
                                                item.skippedCycles > 0
                                                    ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                                            )}>
                                                {item.skippedCycles}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(parseFloat(item.member.totalPaid || '0'))}
                                        </TableCell>
                                        <TableCell className={cn(
                                            "font-semibold",
                                            item.outstandingAmount > 0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"
                                        )}>
                                            {formatCurrency(item.outstandingAmount)}
                                        </TableCell>
                                        <TableCell className="font-semibold text-gray-900 dark:text-white">
                                            {formatCurrency(item.totalDueAmount)}
                                        </TableCell>
                                        <TableCell className="text-gray-600 dark:text-gray-300">
                                            {item.lastPayment ? formatShortDate(new Date(item.lastPayment.date)) : 'None'}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <AddMemberDialog
                open={addMemberOpen}
                onOpenChange={setAddMemberOpen}
                stokvel={stokvel}
                onSave={handleAddMember}
            />

            <RecordPaymentDialog
                open={recordPaymentOpen}
                onOpenChange={setRecordPaymentOpen}
                stokvel={stokvel}
                onSave={handleRecordPayment}
            />

            <Dialog open={transactionsOpen} onOpenChange={setTransactionsOpen}>
                <DialogContent className={cn(
                    "max-w-5xl",
                    "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "shadow-2xl dark:shadow-black/40"
                )}>
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {stokvel.name} Transactions
                        </DialogTitle>
                        <DialogDescription className="text-gray-600 dark:text-gray-400">
                            Full payment history for this stokvel.
                        </DialogDescription>
                    </DialogHeader>

                    {stokvelTransactions.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/40">
                            <DollarSign className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                            <p className="text-sm text-gray-500 dark:text-gray-400">No transactions recorded yet</p>
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/40 overflow-hidden max-h-[60vh] overflow-y-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                        <TableHead>Member</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Captured Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Notes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {stokvelTransactions.map((payment: StokvelPayment) => (
                                        <TableRow key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/40">
                                            <TableCell className="font-semibold text-gray-900 dark:text-white">
                                                {payment.memberName || payment.member?.name || 'Unknown member'}
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-300">
                                                {payment.period}
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-300">
                                                {formatShortDate(new Date(payment.date))}
                                            </TableCell>
                                            <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(parseFloat(payment.amount || '0'))}
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={cn(
                                                    "border-0",
                                                    payment.status === 'paid' && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
                                                    payment.status === 'pending' && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
                                                    payment.status === 'late' && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                                )}>
                                                    {payment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-gray-600 dark:text-gray-300">
                                                {payment.notes || 'No notes'}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
