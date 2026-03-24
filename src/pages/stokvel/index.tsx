/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Users,
    Plus,
    DollarSign,
    TrendingUp,
    UserPlus,
    Wallet,
    Eye,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/utils/formatters';
import { toast } from '@/hooks/use-toast';

// ============================================
// TYPES
// ============================================

interface StokvelMember {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    joinedDate: string;
    totalPaid: number;
    totalOwed: number;
    status: 'active' | 'inactive';
}

interface StokvelPayment {
    id: string;
    memberId: string;
    memberName: string;
    amount: number;
    date: string;
    period: string; // e.g., "January 2024"
    status: 'paid' | 'pending' | 'late';
    notes?: string;
}

interface Stokvel {
    id: string;
    name: string;
    description: string;
    contributionAmount: number;
    frequency: 'weekly' | 'monthly' | 'quarterly';
    startDate: string;
    status: 'active' | 'completed' | 'paused';
    members: StokvelMember[];
    payments: StokvelPayment[];
    totalCollected: number;
    targetAmount?: number;
}

// ============================================
// MOCK DATA
// ============================================

const mockStokvels: Stokvel[] = [
    {
        id: '1',
        name: 'Family Savings Circle',
        description: 'Monthly family savings for emergency fund',
        contributionAmount: 1000,
        frequency: 'monthly',
        startDate: '2024-01-01',
        status: 'active',
        totalCollected: 15000,
        targetAmount: 50000,
        members: [
            {
                id: 'm1',
                name: 'John Doe',
                email: 'john@example.com',
                phone: '0821234567',
                joinedDate: '2024-01-01',
                totalPaid: 5000,
                totalOwed: 1000,
                status: 'active',
            },
            {
                id: 'm2',
                name: 'Jane Smith',
                email: 'jane@example.com',
                phone: '0827654321',
                joinedDate: '2024-01-01',
                totalPaid: 6000,
                totalOwed: 0,
                status: 'active',
            },
            {
                id: 'm3',
                name: 'Peter Brown',
                email: 'peter@example.com',
                phone: '0823456789',
                joinedDate: '2024-02-01',
                totalPaid: 4000,
                totalOwed: 1000,
                status: 'active',
            },
        ],
        payments: [
            {
                id: 'p1',
                memberId: 'm1',
                memberName: 'John Doe',
                amount: 1000,
                date: '2024-11-01',
                period: 'November 2024',
                status: 'paid',
            },
            {
                id: 'p2',
                memberId: 'm2',
                memberName: 'Jane Smith',
                amount: 1000,
                date: '2024-11-02',
                period: 'November 2024',
                status: 'paid',
            },
            {
                id: 'p3',
                memberId: 'm3',
                memberName: 'Peter Brown',
                amount: 1000,
                date: '2024-11-05',
                period: 'November 2024',
                status: 'pending',
            },
        ],
    },
];

// ============================================
// MAIN COMPONENT
// ============================================

const StokvelsPage: React.FC = () => {
    const [stokvels, setStokvels] = useState<Stokvel[]>(mockStokvels);
    const [selectedStokvel, setSelectedStokvel] = useState<Stokvel | null>(null);

    // Dialog states
    const [createStokvelOpen, setCreateStokvelOpen] = useState(false);
    const [addMemberOpen, setAddMemberOpen] = useState(false);
    const [recordPaymentOpen, setRecordPaymentOpen] = useState(false);
    const [viewDetailsOpen, setViewDetailsOpen] = useState(false);

    return (
        <div className="container mx-auto p-6 max-w-7xl">
            {/* Header */}
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

            {/* Stats Overview */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
                <MetricCard
                    title="Total Groups"
                    value={stokvels.length}
                    icon={<Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />}
                />
                <MetricCard
                    title="Total Members"
                    value={stokvels.reduce((sum, s) => sum + s.members.length, 0)}
                    icon={<UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />}
                />
                <MetricCard
                    title="Total Collected"
                    value={formatCurrency(stokvels.reduce((sum, s) => sum + s.totalCollected, 0))}
                    icon={<TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />}
                />
                <MetricCard
                    title="Active Groups"
                    value={stokvels.filter(s => s.status === 'active').length}
                    icon={<Wallet className="w-5 h-5 text-orange-600 dark:text-orange-400" />}
                />
            </div>

            {/* Stokvels List */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {stokvels.map((stokvel) => (
                    <StokvelCard
                        key={stokvel.id}
                        stokvel={stokvel}
                        onViewDetails={() => {
                            setSelectedStokvel(stokvel);
                            setViewDetailsOpen(true);
                        }}
                        onAddMember={() => {
                            setSelectedStokvel(stokvel);
                            setAddMemberOpen(true);
                        }}
                        onRecordPayment={() => {
                            setSelectedStokvel(stokvel);
                            setRecordPaymentOpen(true);
                        }}
                    />
                ))}
            </div>

            {/* Empty State */}
            {stokvels.length === 0 && (
                <Card className="border-2 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center py-12">
                        <Users className="w-16 h-16 text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                            No Stokvels Yet
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6 text-center max-w-md">
                            Create your first stokvel to start managing group savings and contributions
                        </p>
                        <Button onClick={() => setCreateStokvelOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Create Your First Stokvel
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Dialogs */}
            <CreateStokvelDialog
                open={createStokvelOpen}
                onOpenChange={setCreateStokvelOpen}
                onSave={(data) => {
                    const newStokvel: Stokvel = {
                        ...data,
                        id: Date.now().toString(),
                        members: [],
                        payments: [],
                        totalCollected: 0,
                    };
                    setStokvels([...stokvels, newStokvel]);
                    toast({ title: "Success", description: "Stokvel created successfully!" });
                }}
            />

            <AddMemberDialog
                open={addMemberOpen}
                onOpenChange={setAddMemberOpen}
                stokvel={selectedStokvel}
                onSave={(memberData) => {
                    if (!selectedStokvel) return;

                    const newMember: StokvelMember = {
                        ...memberData,
                        id: Date.now().toString(),
                        totalPaid: 0,
                        totalOwed: 0,
                        status: 'active',
                    };

                    setStokvels(stokvels.map(s =>
                        s.id === selectedStokvel.id
                            ? { ...s, members: [...s.members, newMember] }
                            : s
                    ));

                    toast({ title: "Success", description: "Member added successfully!" });
                }}
            />

            <RecordPaymentDialog
                open={recordPaymentOpen}
                onOpenChange={setRecordPaymentOpen}
                stokvel={selectedStokvel}
                onSave={(paymentData) => {
                    if (!selectedStokvel) return;

                    const member = selectedStokvel.members.find(m => m.id === paymentData.memberId);
                    const newPayment: StokvelPayment = {
                        ...paymentData,
                        id: Date.now().toString(),
                        memberName: member?.name || '',
                        status: 'paid',
                    };

                    setStokvels(stokvels.map(s => {
                        if (s.id === selectedStokvel.id) {
                            return {
                                ...s,
                                payments: [...s.payments, newPayment],
                                totalCollected: s.totalCollected + paymentData.amount,
                                members: s.members.map(m =>
                                    m.id === paymentData.memberId
                                        ? { ...m, totalPaid: m.totalPaid + paymentData.amount }
                                        : m
                                ),
                            };
                        }
                        return s;
                    }));

                    toast({ title: "Success", description: "Payment recorded successfully!" });
                }}
            />

            <StokvelDetailsDialog
                open={viewDetailsOpen}
                onOpenChange={setViewDetailsOpen}
                stokvel={selectedStokvel}
            />
        </div>
    );
};

// ============================================
// STOKVEL CARD COMPONENT
// ============================================

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
    const progress = stokvel.targetAmount
        ? (stokvel.totalCollected / stokvel.targetAmount) * 100
        : 0;

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
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/20 dark:to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Decorative blur circle */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-[#C4F546]/10 to-transparent dark:from-[#C4F546]/5 rounded-full blur-2xl" />

            <div className="relative z-10 space-y-4">
                {/* Header */}
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

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Contribution</p>
                        <p className="text-lg font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {formatCurrency(stokvel.contributionAmount)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">{stokvel.frequency}</p>
                    </div>
                    <div className="space-y-0.5">
                        <p className="text-xs text-gray-500 dark:text-gray-400">Total Collected</p>
                        <p className="text-lg font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            {formatCurrency(stokvel.totalCollected)}
                        </p>
                        <p className="text-xs text-gray-500">{stokvel.members.length} members</p>
                    </div>
                </div>

                {/* Progress Bar */}
                {stokvel.targetAmount && (
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
                            Target: {formatCurrency(stokvel.targetAmount)}
                        </p>
                    </div>
                )}

                {/* Actions */}
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

// ============================================
// CREATE STOKVEL DIALOG
// ============================================

interface CreateStokvelDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSave: (data: Omit<Stokvel, 'id' | 'members' | 'payments' | 'totalCollected'>) => void;
}

const CreateStokvelDialog: React.FC<CreateStokvelDialogProps> = ({ open, onOpenChange, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        contributionAmount: '',
        frequency: 'monthly' as 'weekly' | 'monthly' | 'quarterly',
        startDate: new Date().toISOString().split('T')[0],
        status: 'active' as 'active' | 'completed' | 'paused',
        targetAmount: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name || !formData.contributionAmount) {
            toast({ title: "Error", description: "Please fill in required fields", variant: "destructive" });
            return;
        }

        onSave({
            name: formData.name,
            description: formData.description,
            contributionAmount: parseFloat(formData.contributionAmount),
            frequency: formData.frequency,
            startDate: formData.startDate,
            status: formData.status,
            targetAmount: formData.targetAmount ? parseFloat(formData.targetAmount) : undefined,
        });

        setFormData({
            name: '',
            description: '',
            contributionAmount: '',
            frequency: 'monthly',
            startDate: new Date().toISOString().split('T')[0],
            status: 'active',
            targetAmount: '',
        });
        onOpenChange(false);
    };

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
                                onValueChange={(v) => setFormData({ ...formData, frequency: v as any })}
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
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Date</Label>
                            <Input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Amount (Optional)</Label>
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

                    <DialogFooter className="gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
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

// ============================================
// ADD MEMBER DIALOG
// ============================================

interface AddMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stokvel: Stokvel | null;
    onSave: (data: Omit<StokvelMember, 'id' | 'totalPaid' | 'totalOwed' | 'status'>) => void;
}

const AddMemberDialog: React.FC<AddMemberDialogProps> = ({ open, onOpenChange, stokvel, onSave }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        joinedDate: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast({ title: "Error", description: "Member name is required", variant: "destructive" });
            return;
        }

        onSave(formData);
        setFormData({ name: '', email: '', phone: '', joinedDate: new Date().toISOString().split('T')[0] });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "sm:max-w-[450px]",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Add Member
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Add a new member to {stokvel?.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Full Name *</Label>
                        <Input
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email (Optional)</Label>
                            <Input
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone (Optional)</Label>
                            <Input
                                type="tel"
                                placeholder="0821234567"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Join Date</Label>
                        <Input
                            type="date"
                            value={formData.joinedDate}
                            onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white"
                        />
                    </div>

                    <DialogFooter className="gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Add Member
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ============================================
// RECORD PAYMENT DIALOG
// ============================================

interface RecordPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stokvel: Stokvel | null;
    onSave: (data: Omit<StokvelPayment, 'id' | 'memberName' | 'status'>) => void;
}

const RecordPaymentDialog: React.FC<RecordPaymentDialogProps> = ({ open, onOpenChange, stokvel, onSave }) => {
    const [formData, setFormData] = useState({
        memberId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        notes: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.memberId || !formData.amount) {
            toast({ title: "Error", description: "Please select a member and enter amount", variant: "destructive" });
            return;
        }

        onSave({
            memberId: formData.memberId,
            amount: parseFloat(formData.amount),
            date: formData.date,
            period: formData.period,
            notes: formData.notes,
        });

        setFormData({
            memberId: '',
            amount: '',
            date: new Date().toISOString().split('T')[0],
            period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            notes: '',
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "sm:max-w-[450px]",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Record Payment
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        Record a contribution for {stokvel?.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5 mt-2">
                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Member *</Label>
                        <Select
                            value={formData.memberId}
                            onValueChange={(v) => setFormData({ ...formData, memberId: v })}
                        >
                            <SelectTrigger className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-emerald-500 dark:focus:ring-[#C4F546] text-gray-900 dark:text-white">
                                <SelectValue placeholder="Select member" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700">
                                <SelectGroup>
                                    {stokvel?.members.map((member) => (
                                        <SelectItem key={member.id} value={member.id} className="focus:bg-gray-100 dark:focus:bg-gray-800">
                                            {member.name}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Amount *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 dark:text-gray-500">R</span>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder={stokvel?.contributionAmount.toString()}
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="pl-7 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Payment Date</Label>
                            <Input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Period</Label>
                            <Input
                                placeholder="November 2024"
                                value={formData.period}
                                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Notes (Optional)</Label>
                        <Input
                            placeholder="Additional notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546] text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500"
                        />
                    </div>

                    <DialogFooter className="gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                            className="bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            Record Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

// ============================================
// STOKVEL DETAILS DIALOG
// ============================================

interface StokvelDetailsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stokvel: Stokvel | null;
}

const StokvelDetailsDialog: React.FC<StokvelDetailsDialogProps> = ({ open, onOpenChange, stokvel }) => {
    if (!stokvel) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn(
                "sm:max-w-[680px] max-h-[85vh] overflow-y-auto",
                "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-2xl dark:shadow-black/40"
            )}>
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {stokvel.name}
                    </DialogTitle>
                    <DialogDescription className="text-gray-600 dark:text-gray-400">
                        {stokvel.description}
                    </DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="members" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2 bg-gray-100/80 dark:bg-gray-800/80">
                        <TabsTrigger value="members" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                            <Users className="w-4 h-4 mr-2" />
                            Members
                        </TabsTrigger>
                        <TabsTrigger value="payments" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Payments
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="space-y-3 mt-4">
                        {stokvel.members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/40"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center shrink-0">
                                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                                            {member.name.charAt(0)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{member.name}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {member.email || member.phone || 'No contact info'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right hidden sm:block">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Paid</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(member.totalPaid)}</p>
                                    </div>
                                    {member.totalOwed > 0 && (
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Owed</p>
                                            <p className="text-sm font-semibold text-orange-500 dark:text-orange-400">{formatCurrency(member.totalOwed)}</p>
                                        </div>
                                    )}
                                    <Badge className={cn(
                                        "text-xs font-semibold border-0",
                                        member.status === 'active'
                                            ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                                    )}>
                                        {member.status}
                                    </Badge>
                                </div>
                            </div>
                        ))}
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-3 mt-4">
                        {stokvel.payments.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/40">
                                <DollarSign className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-2" />
                                <p className="text-sm text-gray-500 dark:text-gray-400">No payments recorded yet</p>
                            </div>
                        ) : (
                            stokvel.payments.map((payment) => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/40"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-white">{payment.memberName}</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{payment.period}</p>
                                        {payment.notes && (
                                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{payment.notes}</p>
                                        )}
                                    </div>
                                    <div className="text-right flex items-center gap-3">
                                        <div>
                                            <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatCurrency(payment.amount)}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{payment.date}</p>
                                        </div>
                                        <Badge className={cn(
                                            "text-xs font-semibold border-0",
                                            payment.status === 'paid' && "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400",
                                            payment.status === 'pending' && "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400",
                                            payment.status === 'late' && "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                                        )}>
                                            {payment.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default StokvelsPage;