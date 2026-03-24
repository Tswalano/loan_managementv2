import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BadgeCheck, Eye, EyeOff, Loader2, Lock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useAPI, useCurrentUser } from '@/lib/api';
import { getCurrentOrganization } from '@/lib/auth';

export default function ProfilePage() {
    const { toast } = useToast();
    const api = useAPI();
    const { data: currentUserData } = useCurrentUser();
    const user = currentUserData?.user;
    const storedOrganization = getCurrentOrganization();
    const currentOrganization = currentUserData?.organizations?.find(
        (organization: { id: string }) => organization.id === storedOrganization?.id
    ) || currentUserData?.organizations?.[0];
    const enabledPermissionCount = currentOrganization?.permissions
        ? Object.values(currentOrganization.permissions).filter(Boolean).length
        : 0;

    const [profileLoading, setProfileLoading] = useState(false);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [pwLoading, setPwLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (user) {
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setPhone(user.phoneNumber || '');
        }
    }, [user]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setProfileLoading(true);
            await api.updateProfile({ firstName, lastName, phoneNumber: phone });
            toast({ title: 'Profile updated', description: 'Your profile has been saved.' });
        } catch (err) {
            toast({
                title: 'Error',
                description: err instanceof Error ? err.message : 'Failed to update profile.',
                variant: 'destructive',
            });
        } finally {
            setProfileLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            toast({ title: 'Passwords do not match', variant: 'destructive' });
            return;
        }
        if (newPassword.length < 8) {
            toast({ title: 'Password too short', description: 'Must be at least 8 characters.', variant: 'destructive' });
            return;
        }
        try {
            setPwLoading(true);
            await api.changePassword({ currentPassword, newPassword });
            toast({ title: 'Password changed', description: 'Your password has been updated.' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            toast({
                title: 'Error',
                description: err instanceof Error ? err.message : 'Failed to change password.',
                variant: 'destructive',
            });
        } finally {
            setPwLoading(false);
        }
    };

    const cardClass = cn(
        'backdrop-blur-xl bg-white/80 dark:bg-gray-900/80',
        'border border-gray-200/50 dark:border-gray-700/50',
        'rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20'
    );

    const inputClass = cn(
        'bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 h-11',
        'focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-[#C4F546]'
    );

    return (
        <div className="container mx-auto max-w-6xl space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        My Profile
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        View and update your personal account details.
                    </p>
                </div>
                <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/60 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Organization</p>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{currentOrganization?.name || 'No organization'}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{currentOrganization?.role || 'No role assigned'}</p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.72fr_1.28fr]">
                <Card className={cardClass}>
                    <CardHeader>
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <span className="text-3xl font-bold text-white">
                                    {(firstName?.[0] || user?.email?.[0] || '?').toUpperCase()}
                                </span>
                            </div>
                            <div className="text-center">
                                <CardTitle className="text-xl text-gray-900 dark:text-white">
                                    {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'My Profile'}
                                </CardTitle>
                                <CardDescription className="mt-1">{user?.email}</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-gray-50/70 dark:bg-gray-800/40 p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Role</p>
                            <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">
                                {currentOrganization?.role || 'No role assigned'}
                            </p>
                        </div>
                        <div className="rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-900/10 p-4">
                            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                <BadgeCheck className="h-4 w-4" />
                                <p className="text-sm font-semibold">Account Status</p>
                            </div>
                            <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                Your profile is active and linked to the current organization.
                            </p>
                        </div>
                        <div className="rounded-xl border border-gray-200/60 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/50 p-4">
                            <p className="text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">Organization Details</p>
                            <div className="mt-3 space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Organization Name</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {currentOrganization?.name || 'No organization'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Your Role</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {currentOrganization?.role || 'No role assigned'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Joined Organization</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {currentOrganization?.joinedAt ? new Date(currentOrganization.joinedAt).toLocaleDateString() : 'Not available'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Enabled Access Rules</p>
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {enabledPermissionCount} permission{enabledPermissionCount === 1 ? '' : 's'} enabled
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-6">
                    <Card className={cardClass}>
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                                <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                Profile Details
                            </CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400">
                                Keep your profile details current.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-5" onSubmit={handleUpdateProfile}>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                                        <Input placeholder="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputClass} />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                                        <Input placeholder="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                                        <Input type="email" value={user?.email || ''} disabled className="bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 h-11 opacity-60 cursor-not-allowed" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                                        <Input placeholder="+27 123 456 789" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
                                    </div>
                                </div>
                                <Button
                                    type="submit"
                                    disabled={profileLoading}
                                    className="h-11 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    {profileLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : 'Save Profile'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    <Card className={cardClass}>
                        <CardHeader>
                            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                                <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                Change Password
                            </CardTitle>
                            <CardDescription className="text-gray-500 dark:text-gray-400">
                                Update your password to keep your account secure.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form className="space-y-5" onSubmit={handleChangePassword}>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</Label>
                                    <div className="relative">
                                        <Input type={showCurrent ? 'text' : 'password'} placeholder="Enter current password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className={cn(inputClass, 'pr-10')} required />
                                        <button type="button" onClick={() => setShowCurrent((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                            {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</Label>
                                    <div className="relative">
                                        <Input type={showNew ? 'text' : 'password'} placeholder="At least 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={cn(inputClass, 'pr-10')} required />
                                        <button type="button" onClick={() => setShowNew((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                            {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</Label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirm ? 'text' : 'password'}
                                            placeholder="Repeat new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={cn(inputClass, 'pr-10', confirmPassword && newPassword !== confirmPassword ? 'border-red-400 focus-visible:ring-red-400' : '')}
                                            required
                                        />
                                        <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                                            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    {confirmPassword && newPassword !== confirmPassword && <p className="text-xs text-red-500">Passwords do not match</p>}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={pwLoading}
                                    className="h-11 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    {pwLoading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</> : 'Update Password'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
