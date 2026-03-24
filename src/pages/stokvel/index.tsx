/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    Users,
    Plus,
    DollarSign,
    TrendingUp,
    UserPlus,
    Wallet,
    Eye,
    CalendarDays,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/formatters';
import { toast } from '@/hooks/use-toast';
import { api, useStokvels } from '@/lib/api';
import type {
    AddStokvelMemberRequest,
    CreateStokvelRequest,
    RecordStokvelPaymentRequest,
    Stokvel,
    StokvelFrequency,
    StokvelStatus,
} from '@/types';
import { AddMemberDialog, RecordPaymentDialog } from './dialogs';

const StokvelsPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useStokvels();
    const stokvels: Stokvel[] = data?.stokvels || [];
    const [selectedStokvelId, setSelectedStokvelId] = useState<string | null>(null);

    const [createStokvelOpen, setCreateStokvelOpen] = useState(false);
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);

    const selectedStokvel = stokvels.find((stokvel) => stokvel.id === selectedStokvelId) ?? null;

    const totalMembers = stokvels.reduce((sum, stokvel) => sum + stokvel.members.length, 0);
    const totalCollected = stokvels.reduce((sum, stokvel) => sum + parseFloat(stokvel.totalCollected || '0'), 0);
    const activeGroups = stokvels.filter((stokvel) => stokvel.status === 'active').length;

    const handleCreateStokvel = async (payload: CreateStokvelRequest) => {
        await api.createStokvel(payload);
        toast({ title: "Success", description: "Stokvel created successfully!" });
    };

    const handleAddMember = async (payload: AddStokvelMemberRequest) => {
        if (!selectedStokvelId) return;
        await api.addStokvelMember(selectedStokvelId, payload);
        toast({ title: "Success", description: "Member added successfully!" });
    };

    const handleRecordPayment = async (payload: RecordStokvelPaymentRequest) => {
        if (!selectedStokvelId) return;
        await api.recordStokvelPayment(selectedStokvelId, payload);
        toast({ title: "Success", description: "Payment recorded successfully!" });
    };

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Stokvel & Savings Groups
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Manage your savings groups and track member contributions
                    </p>
                </div>
                <Button
                    onClick={() => setCreateStokvelOpen(true)}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Stokvel
                </Button>
            </div>

            <div className="grid gap-6 md:grid-cols-4 mb-8">
                <MetricCard
                    title="Total Groups"
                    value={stokvels.length}
                    icon={<Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                />
                <MetricCard
                    title="Total Members"
                    value={totalMembers}
                    icon={<UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                />
                <MetricCard
                    title="Total Collected"
                    value={formatCurrency(totalCollected)}
                    icon={<TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                />
                <MetricCard
                    title="Active Groups"
                    value={activeGroups}
                    icon={<Wallet className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                />
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-[40vh]">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 dark:border-gray-700 border-t-emerald-600 dark:border-t-[#C4F546]" />
                </div>
            ) : (
                <>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {stokvels.map((stokvel) => (
                            <StokvelCard
                                key={stokvel.id}
                                stokvel={stokvel}
                                onViewDetails={() => navigate(`/app/stokvel/${stokvel.id}`)}
                                onAddMember={() => {
                                    setSelectedStokvelId(stokvel.id);
                                    setAddMemberOpen(true);
                                }}
                                onRecordPayment={() => {
                                    setSelectedStokvelId(stokvel.id);
                                    setRecordPaymentOpen(true);
                                }}
                            />
                        ))}
                    </div>

                    {stokvels.length === 0 && (
                        <Card className={cn(
                            "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                            "border border-gray-200/50 dark:border-gray-700/50",
                            "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                        )}>
                            <CardContent className="flex flex-col items-center justify-center py-16">
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-6 shadow-lg">
                                    <Users className="w-10 h-10 text-white" />
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                                    No Stokvels Yet
                                </h3>
                                <p className="text-gray-500 dark:text-gray-400 text-center max-w-md mb-6">
                                    Start your first savings group and manage member contributions from one place.
                                </p>
                                <Button
                                    onClick={() => setCreateStokvelOpen(true)}
                                    className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Create Your First Stokvel
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </>
            )}

            <CreateStokvelDialog
                open={createStokvelOpen}
                onOpenChange={setCreateStokvelOpen}
                onSave={handleCreateStokvel}
            />

            <AddMemberDialog
                open={addMemberOpen}
                onOpenChange={setAddMemberOpen}
                stokvel={selectedStokvel}
                onSave={handleAddMember}
            />

            <RecordPaymentDialog
                open={recordPaymentOpen}
                onOpenChange={setRecordPaymentOpen}
                stokvel={selectedStokvel}
                onSave={handleRecordPayment}
            />
        </div>
    );
};

function getCycleLabel(frequency: StokvelFrequency, count: number): string {
    if (frequency === 'weekly') {
        return `${count} week${count === 1 ? '' : 's'}`;
    }
    if (frequency === 'quarterly') {
        return `${count} quarter${count === 1 ? '' : 's'}`;
    }
    return `${count} month${count === 1 ? '' : 's'}`;
}

function countPlannedCycles(startDate: string, targetDate: string, frequency: StokvelFrequency): number {
    const start = new Date(startDate);
    const end = new Date(targetDate);

    if (Number.isNaN(+start) || Number.isNaN(+end) || end < start) {
        return 0;
    }

    if (frequency === 'weekly') {
        const diffDays = Math.floor((+end - +start) / (1000 * 60 * 60 * 24));
        return Math.floor(diffDays / 7) + 1;
    }

    const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());

    if (frequency === 'quarterly') {
        return Math.floor(monthDiff / 3) + 1;
    }

    return monthDiff + 1;
}

interface StokvelCardProps {
    stokvel: Stokvel;
    onViewDetails: () => void;
    onAddMember: () => void;
    onRecordPayment: () => void;
}

const StokvelCard: React.FC<StokvelCardProps> = ({
    stokvel,
    onViewDetails,
    onAddMember,
    onRecordPayment,
}) => {
    const totalCollected = parseFloat(stokvel.totalCollected || '0');
    const targetAmount = parseFloat(stokvel.targetAmount || '0');
    const progress = targetAmount > 0 ? (totalCollected / targetAmount) * 100 : 0;
    const plannedCycles = countPlannedCycles(stokvel.startDate, stokvel.targetDate, stokvel.frequency);

    return (
        <Card className={cn(
            "relative overflow-hidden backdrop-blur-xl",
            "bg-white/80 dark:bg-gray-900/80",
            "border border-gray-200/50 dark:border-gray-700/50",
            "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20",
            "p-6 hover:shadow-2xl dark:hover:shadow-black/40",
            "transition-all duration-300 hover:-translate-y-1",
            "group cursor-pointer"
        )}>
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/20 dark:to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-[#C4F546]/10 to-transparent dark:from-[#C4F546]/5 rounded-full blur-2xl" />

            <div className="relative z-10 space-y-4">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center shadow-inner">
                            <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent leading-tight">
                                {stokvel.name}
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                                {stokvel.description}
                            </p>
                        </div>
                    </div>
                    <Badge
                        className={cn(
                            "text-xs font-semibold shrink-0",
                            stokvel.status === 'active' && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0",
                            stokvel.status === 'paused' && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-0",
                            stokvel.status === 'completed' && "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 border-0"
                        )}
                    >
                        {stokvel.status}
                    </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Contribution</p>
                        <p className="text-lg font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {formatCurrency(parseFloat(stokvel.contributionAmount || '0'))}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{stokvel.frequency}</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Collected</p>
                        <p className="text-lg font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {formatCurrency(parseFloat(stokvel.totalCollected || '0'))}
                        </p>
                        <p className="text-xs text-gray-500">{stokvel.members.length} members</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 rounded-2xl border border-gray-200/60 dark:border-gray-700/40 bg-gray-50/70 dark:bg-gray-800/30 p-4">
                    <div className="space-y-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Target Date</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {new Date(stokvel.targetDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Planned Duration</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {getCycleLabel(stokvel.frequency, plannedCycles)}
                        </p>
                    </div>
                </div>

                {targetAmount > 0 && (
                    <div className="space-y-1.5">
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>Progress</span>
                            <span className="font-medium">{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Target: {formatCurrency(parseFloat(stokvel.targetAmount || '0'))}
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-100/60 dark:border-gray-700/40">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onViewDetails}
                            className="h-8 px-3 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/60"
                        >
                            <Eye className="w-3.5 h-3.5 mr-1.5" />
                            View
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onAddMember}
                            className="h-8 px-3 text-xs text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-800/60"
                        >
                            <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                            Member
                        </Button>
                    </div>
                    <Button
                        size="sm"
                        onClick={onRecordPayment}
                        className="h-8 px-3 text-xs bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg"
                    >
                        <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                        Pay
                    </Button>
                </div>
            </div>
        </Card>
    );
};

interface CreateStokvelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: CreateStokvelRequest) => Promise<void>;
}

const CreateStokvelDialog: React.FC<CreateStokvelDialogProps> = ({ open, onOpenChange, onSave }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contributionAmount: '',
        frequency: 'monthly' as StokvelFrequency,
        startDate: new Date().toISOString().split('T')[0],
        targetDate: new Date().toISOString().split('T')[0],
        status: 'active' as StokvelStatus,
        targetAmount: '',
    });

    const reset = () => setFormData({
        name: '',
        description: '',
        contributionAmount: '',
        frequency: 'monthly' as StokvelFrequency,
        startDate: new Date().toISOString().split('T')[0],
        targetDate: new Date().toISOString().split('T')[0],
        status: 'active' as StokvelStatus,
        targetAmount: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.contributionAmount || !formData.targetAmount || !formData.startDate || !formData.targetDate) {
            toast({ title: "Error", description: "Please fill in all required fields", variant: "destructive" });
            return;
        }

        if (new Date(formData.targetDate) < new Date(formData.startDate)) {
            toast({ title: "Error", description: "Target date must be on or after the start date", variant: "destructive" });
            return;
        }

        try {
            setIsSubmitting(true);
            await onSave({
                name: formData.name,
                description: formData.description,
                contributionAmount: formData.contributionAmount,
                frequency: formData.frequency,
                startDate: formData.startDate,
                targetDate: formData.targetDate,
                status: formData.status,
                targetAmount: formData.targetAmount,
            });
            reset();
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to create stokvel",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const plannedCycles = countPlannedCycles(formData.startDate, formData.targetDate, formData.frequency);
    const targetAmount = parseFloat(formData.targetAmount || '0');
    const estimatedPerCycle = plannedCycles > 0 && targetAmount > 0 ? targetAmount / plannedCycles : 0;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "sm:max-w-[550px]",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Create New Stokvel
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Set up a new savings group and start collecting contributions
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Stokvel Name *</Label>
                        <Input
                            placeholder="e.g., Family Savings Circle"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</Label>
                        <Input
                            placeholder="Brief description of the stokvel purpose"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Contribution Amount *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">R</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="1000.00"
                                    value={formData.contributionAmount}
                                    onChange={(e) => setFormData({ ...formData, contributionAmount: e.target.value })}
                                    className="pl-7 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Frequency *</Label>
                            <Select
                                value={formData.frequency}
                                onValueChange={(value) => setFormData({ ...formData, frequency: value as StokvelFrequency })}
                            >
                                <SelectTrigger className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-[#C4F546] text-gray-900 dark:text-white">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                    <SelectGroup>
                                        <SelectItem value="weekly">Weekly</SelectItem>
                                        <SelectItem value="monthly">Monthly</SelectItem>
                                        <SelectItem value="quarterly">Quarterly</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date *</Label>
                            <Input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">R</span>
                                <Input
                                    type="number"
                                    step="0.01"
                                    placeholder="50000.00"
                                    value={formData.targetAmount}
                                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                    className="pl-7 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Date *</Label>
                            <Input
                                type="date"
                                value={formData.targetDate}
                                min={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                                className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-900/10 p-4">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                <CalendarDays className="h-4 w-4" />
                                <p className="text-sm font-semibold">Payment Plan</p>
                            </div>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                {plannedCycles > 0 ? getCycleLabel(formData.frequency, plannedCycles) : 'Set a valid target date'}
                            </p>
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                {estimatedPerCycle > 0
                                    ? `${formatCurrency(estimatedPerCycle)} total needed per cycle to reach the target amount`
                                    : 'The target amount and target date determine how long the stokvel will run.'}
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            disabled={isSubmitting}
                            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Create Stokvel
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default StokvelsPage;
