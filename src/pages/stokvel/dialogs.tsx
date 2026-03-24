/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { toast } from '@/hooks/use-toast';
import type { AddStokvelMemberRequest, RecordStokvelPaymentRequest, Stokvel } from '@/types';

interface AddMemberDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stokvel: Stokvel | null;
    onSave: (data: AddStokvelMemberRequest) => Promise<void>;
}

export const AddMemberDialog: React.FC<AddMemberDialogProps> = ({ open, onOpenChange, stokvel, onSave }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        joinedDate: new Date().toISOString().split('T')[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.name) {
            toast({ title: "Error", description: "Member name is required", variant: "destructive" });
            return;
        }

        try {
            setIsSubmitting(true);
            await onSave(formData);
            setFormData({ name: '', email: '', phone: '', joinedDate: new Date().toISOString().split('T')[0] });
            onOpenChange(false);
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to add member",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
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
                            Add Member
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

interface RecordPaymentDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    stokvel: Stokvel | null;
    onSave: (data: RecordStokvelPaymentRequest) => Promise<void>;
}

export const RecordPaymentDialog: React.FC<RecordPaymentDialogProps> = ({ open, onOpenChange, stokvel, onSave }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        memberId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        period: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        notes: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.memberId || !formData.amount) {
            toast({ title: "Error", description: "Please select a member and enter amount", variant: "destructive" });
            return;
        }

        try {
            setIsSubmitting(true);
            await onSave({
                memberId: formData.memberId,
                amount: formData.amount,
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
        } catch (error) {
            toast({
                title: "Error",
                description: error instanceof Error ? error.message : "Failed to record payment",
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
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
                            onValueChange={(value) => setFormData({ ...formData, memberId: value })}
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
                                placeholder={stokvel?.contributionAmount}
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
                            Record Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};
