/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
                <Card className="border-l-4 border-l-emerald-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Total Groups
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stokvels.length}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                <Users className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-blue-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Total Members
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stokvels.reduce((sum, s) => sum + s.members.length, 0)}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                                <UserPlus className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-purple-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Total Collected
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(stokvels.reduce((sum, s) => sum + s.totalCollected, 0))}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-orange-500">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                                    Active Groups
                                </p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                    {stokvels.filter(s => s.status === 'active').length}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                                <Wallet className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
            "hover:shadow-lg transition-shadow cursor-pointer",
            "border-2",
            stokvel.status === 'active' && "border-emerald-200 dark:border-emerald-800"
        )}>
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <CardTitle className="text-xl mb-2">{stokvel.name}</CardTitle>
                        <CardDescription className="line-clamp-2">
                            {stokvel.description}
                        </CardDescription>
                    </div>
                    <Badge
                        className={cn(
                            stokvel.status === 'active' && "bg-emerald-500",
                            stokvel.status === 'paused' && "bg-orange-500",
                            stokvel.status === 'completed' && "bg-blue-500"
                        )}
                    >
                        {stokvel.status}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Contribution
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(stokvel.contributionAmount)}
                        </p>
                        <p className="text-xs text-gray-500 capitalize">
                            {stokvel.frequency}
                        </p>
                    </div>
                    <div className="space-y-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                            Total Collected
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(stokvel.totalCollected)}
                        </p>
                        <p className="text-xs text-gray-500">
                            {stokvel.members.length} members
                        </p>
                    </div>
                </div>

                {/* Progress Bar */}
                {stokvel.targetAmount && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                            <span>Progress</span>
                            <span>{progress.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 transition-all duration-300"
                                style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-500">
                            Target: {formatCurrency(stokvel.targetAmount)}
                        </p>
                    </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onViewDetails}
                        className="text-xs"
                    >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onAddMember}
                        className="text-xs"
                    >
                        <UserPlus className="w-3 h-3 mr-1" />
                        Member
                    </Button>
                    <Button
                        size="sm"
                        onClick={onRecordPayment}
                        className="text-xs bg-emerald-500 hover:bg-emerald-600"
                    >
                        <DollarSign className="w-3 h-3 mr-1" />
                        Pay
                    </Button>
                </div>
            </CardContent>
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
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        Create New Stokvel
                    </DialogTitle>
                    <DialogDescription>
                        Set up a new savings group and start collecting contributions
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Stokvel Name *</Label>
                        <Input
                            id="name"
                            placeholder="e.g., Family Savings Circle"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            placeholder="Brief description of the stokvel purpose"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="contribution">Contribution Amount *</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                                <Input
                                    id="contribution"
                                    type="number"
                                    step="0.01"
                                    placeholder="1000.00"
                                    value={formData.contributionAmount}
                                    onChange={(e) => setFormData({ ...formData, contributionAmount: e.target.value })}
                                    className="pl-7"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="frequency">Frequency *</Label>
                            <select
                                id="frequency"
                                value={formData.frequency}
                                onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                                className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                            >
                                <option value="weekly">Weekly</option>
                                <option value="monthly">Monthly</option>
                                <option value="quarterly">Quarterly</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="targetAmount">Target Amount (Optional)</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                                <Input
                                    id="targetAmount"
                                    type="number"
                                    step="0.01"
                                    placeholder="50000.00"
                                    value={formData.targetAmount}
                                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                                    className="pl-7"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600">
                            Create Stokvel
                        </Button>
                    </div>
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
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-white" />
                        </div>
                        Add Member
                    </DialogTitle>
                    <DialogDescription>
                        Add a new member to {stokvel?.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="memberName">Full Name *</Label>
                        <Input
                            id="memberName"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="email">Email (Optional)</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone (Optional)</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="0821234567"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="joinedDate">Join Date</Label>
                        <Input
                            id="joinedDate"
                            type="date"
                            value={formData.joinedDate}
                            onChange={(e) => setFormData({ ...formData, joinedDate: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600">
                            Add Member
                        </Button>
                    </div>
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
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                            <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        Record Payment
                    </DialogTitle>
                    <DialogDescription>
                        Record a contribution for {stokvel?.name}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                        <Label htmlFor="member">Member *</Label>
                        <select
                            id="member"
                            value={formData.memberId}
                            onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
                            className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800"
                        >
                            <option value="">Select member</option>
                            {stokvel?.members.map((member) => (
                                <option key={member.id} value={member.id}>
                                    {member.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="amount">Amount *</Label>
                        <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R</span>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder={stokvel?.contributionAmount.toString()}
                                value={formData.amount}
                                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                                className="pl-7"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="date">Payment Date</Label>
                            <Input
                                id="date"
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="period">Period</Label>
                            <Input
                                id="period"
                                placeholder="November 2024"
                                value={formData.period}
                                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="notes">Notes (Optional)</Label>
                        <Input
                            id="notes"
                            placeholder="Additional notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>

                    <div className="flex gap-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
                            Cancel
                        </Button>
                        <Button type="submit" className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600">
                            Record Payment
                        </Button>
                    </div>
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
            <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">{stokvel.name}</DialogTitle>
                    <DialogDescription>{stokvel.description}</DialogDescription>
                </DialogHeader>

                <Tabs defaultValue="members" className="mt-4">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="members">
                            <Users className="w-4 h-4 mr-2" />
                            Members
                        </TabsTrigger>
                        <TabsTrigger value="payments">
                            <DollarSign className="w-4 h-4 mr-2" />
                            Payments
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="members" className="space-y-4">
                        {stokvel.members.map((member) => (
                            <Card key={member.id}>
                                <CardContent className="pt-6">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-semibold text-lg">{member.name}</h4>
                                            {member.email && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{member.email}</p>
                                            )}
                                            {member.phone && (
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{member.phone}</p>
                                            )}
                                        </div>
                                        <Badge className={member.status === 'active' ? 'bg-emerald-500' : 'bg-gray-500'}>
                                            {member.status}
                                        </Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Total Paid</p>
                                            <p className="text-lg font-semibold">{formatCurrency(member.totalPaid)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-600 dark:text-gray-400">Amount Owed</p>
                                            <p className="text-lg font-semibold text-orange-500">{formatCurrency(member.totalOwed)}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </TabsContent>

                    <TabsContent value="payments" className="space-y-4">
                        {stokvel.payments.length === 0 ? (
                            <Card>
                                <CardContent className="flex flex-col items-center justify-center py-12">
                                    <DollarSign className="w-12 h-12 text-gray-400 mb-2" />
                                    <p className="text-gray-600 dark:text-gray-400">No payments recorded yet</p>
                                </CardContent>
                            </Card>
                        ) : (
                            stokvel.payments.map((payment) => (
                                <Card key={payment.id}>
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="font-semibold">{payment.memberName}</h4>
                                                <p className="text-sm text-gray-600 dark:text-gray-400">{payment.period}</p>
                                                <p className="text-xs text-gray-500">{payment.date}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-emerald-600">
                                                    {formatCurrency(payment.amount)}
                                                </p>
                                                <Badge className={
                                                    payment.status === 'paid' ? 'bg-emerald-500' :
                                                        payment.status === 'pending' ? 'bg-orange-500' :
                                                            'bg-red-500'
                                                }>
                                                    {payment.status}
                                                </Badge>
                                            </div>
                                        </div>
                                        {payment.notes && (
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                                                {payment.notes}
                                            </p>
                                        )}
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default StokvelsPage;