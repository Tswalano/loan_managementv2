import { useState, useEffect } from 'react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Bell, Shield, Loader2, Eye, EyeOff, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { useAPI } from '@/lib/api';

const NOTIFICATIONS_KEY = 'app_notifications_settings';

interface NotificationSettings {
    emailNotifications: boolean;
    paymentReminders: boolean;
    accountAlerts: boolean;
}

function loadNotifications(): NotificationSettings {
    try {
        const stored = localStorage.getItem(NOTIFICATIONS_KEY);
        if (stored) return JSON.parse(stored);
    } catch { /* ignore */ }
    return { emailNotifications: true, paymentReminders: true, accountAlerts: true };
}

export default function SettingsAndProfilePage() {
    const { toast } = useToast();
    const api = useAPI();
    const user = getCurrentUser();

    const [profileLoading, setProfileLoading] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName || '');
    const [lastName, setLastName] = useState(user?.lastName || '');
    const [phone, setPhone] = useState(user?.phoneNumber || '');

    const [pwLoading, setPwLoading] = useState(false);
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [notifications, setNotifications] = useState<NotificationSettings>(loadNotifications);

    useEffect(() => {
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notifications));
    }, [notifications]);

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
        <div className="container mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                    Settings
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Profile Card */}
                <div className="lg:col-span-4">
                    <div className="sticky top-8">
                        <Card className={cardClass}>
                            <CardHeader>
                                <div className="flex flex-col items-center space-y-4 mb-2">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                        <span className="text-2xl font-bold text-white">
                                            {(firstName?.[0] || user?.email?.[0] || '?').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="text-center">
                                        <CardTitle className="text-lg text-gray-900 dark:text-white">
                                            {firstName || lastName ? `${firstName} ${lastName}`.trim() : 'Your Profile'}
                                        </CardTitle>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={handleUpdateProfile}>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">First Name</Label>
                                        <Input
                                            placeholder="First name"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Last Name</Label>
                                        <Input
                                            placeholder="Last name"
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</Label>
                                        <Input
                                            type="email"
                                            value={user?.email || ''}
                                            disabled
                                            className="bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 h-11 opacity-60 cursor-not-allowed"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</Label>
                                        <Input
                                            placeholder="+27 123 456 789"
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            className={inputClass}
                                        />
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={profileLoading}
                                        className={cn(
                                            'w-full h-11',
                                            'bg-gradient-to-r from-emerald-600 to-emerald-700',
                                            'hover:from-emerald-700 hover:to-emerald-800',
                                            'text-white shadow-lg hover:shadow-xl transition-all duration-300'
                                        )}
                                    >
                                        {profileLoading ? (
                                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
                                        ) : 'Save Profile'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>

                {/* Tabs */}
                <div className="lg:col-span-8">
                    <Tabs defaultValue="security" className="space-y-6">
                        <TabsList className={cn(
                            'grid w-full grid-cols-2 gap-2 p-1',
                            'bg-white/80 dark:bg-gray-900/80',
                            'backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50',
                            'rounded-2xl h-auto'
                        )}>
                            {[
                                { value: 'security', label: 'Security', icon: Shield },
                                { value: 'notifications', label: 'Notifications', icon: Bell },
                            ].map(({ value, label, icon: Icon }) => (
                                <TabsTrigger
                                    key={value}
                                    value={value}
                                    className={cn(
                                        'rounded-xl py-3 px-4 flex items-center justify-center gap-2',
                                        'data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700',
                                        'data-[state=active]:text-white data-[state=active]:shadow-lg',
                                        'transition-all duration-200'
                                    )}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{label}</span>
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        {/* Security Tab — Change Password */}
                        <TabsContent value="security">
                            <Card className={cardClass}>
                                <CardHeader>
                                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                                        <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        Change Password
                                    </CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-gray-400">
                                        Update your password to keep your account secure
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <form className="space-y-5" onSubmit={handleChangePassword}>
                                        {/* Current Password */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Password</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showCurrent ? 'text' : 'password'}
                                                    placeholder="Enter current password"
                                                    value={currentPassword}
                                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                                    className={cn(inputClass, 'pr-10')}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrent(v => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* New Password */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showNew ? 'text' : 'password'}
                                                    placeholder="At least 8 characters"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    className={cn(inputClass, 'pr-10')}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowNew(v => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Confirm Password */}
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Confirm New Password</Label>
                                            <div className="relative">
                                                <Input
                                                    type={showConfirm ? 'text' : 'password'}
                                                    placeholder="Repeat new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    className={cn(
                                                        inputClass,
                                                        'pr-10',
                                                        confirmPassword && newPassword !== confirmPassword
                                                            ? 'border-red-400 focus-visible:ring-red-400'
                                                            : ''
                                                    )}
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowConfirm(v => !v)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                                >
                                                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                            </div>
                                            {confirmPassword && newPassword !== confirmPassword && (
                                                <p className="text-xs text-red-500">Passwords do not match</p>
                                            )}
                                        </div>

                                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                                            <Button
                                                type="submit"
                                                disabled={pwLoading}
                                                className={cn(
                                                    'w-full h-11',
                                                    'bg-gradient-to-r from-emerald-600 to-emerald-700',
                                                    'hover:from-emerald-700 hover:to-emerald-800',
                                                    'text-white shadow-lg hover:shadow-xl transition-all duration-300'
                                                )}
                                            >
                                                {pwLoading ? (
                                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
                                                ) : 'Update Password'}
                                            </Button>
                                        </div>
                                    </form>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Notifications Tab */}
                        <TabsContent value="notifications">
                            <Card className={cardClass}>
                                <CardHeader>
                                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                                        <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                        Notification Preferences
                                    </CardTitle>
                                    <CardDescription className="text-gray-500 dark:text-gray-400">
                                        Choose how you want to be notified about account activity
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {[
                                        {
                                            key: 'emailNotifications' as const,
                                            title: 'Email Notifications',
                                            desc: 'Receive email updates about your account activity',
                                        },
                                        {
                                            key: 'paymentReminders' as const,
                                            title: 'Payment Reminders',
                                            desc: 'Get notified about upcoming loan payments',
                                        },
                                        {
                                            key: 'accountAlerts' as const,
                                            title: 'Account Alerts',
                                            desc: 'Receive alerts about important account changes',
                                        },
                                    ].map(({ key, title, desc }) => (
                                        <div
                                            key={key}
                                            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
                                        >
                                            <div className="space-y-0.5 flex-1 pr-4">
                                                <p className="text-sm font-semibold text-gray-900 dark:text-white">{title}</p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
                                            </div>
                                            <Switch
                                                checked={notifications[key]}
                                                onCheckedChange={(checked) =>
                                                    setNotifications(prev => ({ ...prev, [key]: checked }))}
                                                className="data-[state=checked]:bg-emerald-600"
                                            />
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </div>
        </div>
    );
}
