import { useState } from 'react';
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
import {
    Settings, User, Bell, Shield,
    Loader2, Camera, CreditCard, Download, Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

interface ProfileData {
    fullName: string;
    email: string;
    phone: string;
    companyName: string;
}

interface NotificationSettings {
    emailNotifications: boolean;
    paymentReminders: boolean;
    accountAlerts: boolean;
}

export default function SettingsAndProfilePage() {
    const { toast } = useToast();
    const user = getCurrentUser();
    const [loading, setLoading] = useState(false);
    const [profileData, setProfileData] = useState<ProfileData>({
        fullName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
        email: user?.email || '',
        phone: user?.phoneNumber || '',
        companyName: ''
    });
    const [notifications, setNotifications] = useState<NotificationSettings>({
        emailNotifications: true,
        paymentReminders: true,
        accountAlerts: true
    });

    const handleUpdateProfile = async () => {
        if (!user) {
            toast({
                title: "Error",
                description: "You must be logged in to update your profile.",
                variant: "destructive",
            });
            return;
        }

        try {
            setLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast({
                title: "Profile updated",
                description: "Your profile has been updated successfully.",
            });
        } catch (error) {
            console.error('Error updating profile:', error);
            toast({
                title: "Error",
                description: "Failed to update profile. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-8">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        Settings & Profile
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">
                        Manage your account settings and preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Profile Section */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-8">
                            <Card className={cn(
                                "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                                "border border-gray-200/50 dark:border-gray-700/50",
                                "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                            )}>
                                <CardHeader>
                                    <div className="flex flex-col items-center space-y-4 mb-4">
                                        <div className="relative">
                                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                                <User className="w-12 h-12 text-white" />
                                            </div>
                                            <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg border-2 border-white dark:border-gray-700 hover:scale-110 transition-transform">
                                                <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                            </button>
                                        </div>
                                        <div className="text-center">
                                            <CardTitle className="text-xl text-gray-900 dark:text-white">
                                                Profile Settings
                                            </CardTitle>
                                            <CardDescription className="text-gray-600 dark:text-gray-400 mt-1">
                                                Update your personal information
                                            </CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); handleUpdateProfile(); }}>
                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Full Name
                                            </Label>
                                            <Input
                                                placeholder="John Doe"
                                                value={profileData.fullName}
                                                onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                                className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 h-11"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Email Address
                                            </Label>
                                            <Input
                                                type="email"
                                                placeholder="john@example.com"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 h-11"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Phone Number
                                            </Label>
                                            <Input
                                                placeholder="+27 123 456 789"
                                                value={profileData.phone}
                                                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                                className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 h-11"
                                            />
                                        </div>

                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className={cn(
                                                "w-full h-11",
                                                "bg-gradient-to-r from-emerald-600 to-emerald-700",
                                                "hover:from-emerald-700 hover:to-emerald-800",
                                                "text-white shadow-lg hover:shadow-xl",
                                                "transition-all duration-300",
                                                "disabled:opacity-50"
                                            )}
                                        >
                                            {loading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Updating...
                                                </>
                                            ) : (
                                                'Update Profile'
                                            )}
                                        </Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Settings Tabs */}
                    <div className="lg:col-span-8">
                        <Tabs defaultValue="notifications" className="space-y-6">
                            <TabsList className={cn(
                                "grid w-full grid-cols-3 gap-4 p-1",
                                "bg-white/80 dark:bg-gray-900/80",
                                "backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50",
                                "rounded-2xl h-auto"
                            )}>
                                <TabsTrigger
                                    value="notifications"
                                    className={cn(
                                        "rounded-xl py-3 px-4",
                                        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700",
                                        "data-[state=active]:text-white data-[state=active]:shadow-lg",
                                        "transition-all duration-200"
                                    )}
                                >
                                    <Bell className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Notifications</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="security"
                                    className={cn(
                                        "rounded-xl py-3 px-4",
                                        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700",
                                        "data-[state=active]:text-white data-[state=active]:shadow-lg",
                                        "transition-all duration-200"
                                    )}
                                >
                                    <Shield className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Security</span>
                                </TabsTrigger>
                                <TabsTrigger
                                    value="billing"
                                    className={cn(
                                        "rounded-xl py-3 px-4",
                                        "data-[state=active]:bg-gradient-to-r data-[state=active]:from-emerald-600 data-[state=active]:to-emerald-700",
                                        "data-[state=active]:text-white data-[state=active]:shadow-lg",
                                        "transition-all duration-200"
                                    )}
                                >
                                    <Settings className="w-4 h-4 mr-2" />
                                    <span className="hidden sm:inline">Billing</span>
                                </TabsTrigger>
                            </TabsList>

                            {/* Notifications Tab */}
                            <TabsContent value="notifications">
                                <Card className={cn(
                                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                                    "border border-gray-200/50 dark:border-gray-700/50",
                                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                                )}>
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-white">Notification Settings</CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-gray-400">
                                            Choose how you want to be notified about account activity
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-6">
                                            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                                <div className="space-y-1 flex-1">
                                                    <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        Email Notifications
                                                    </label>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Receive email updates about your account activity
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notifications.emailNotifications}
                                                    onCheckedChange={(checked) =>
                                                        setNotifications({ ...notifications, emailNotifications: checked })}
                                                    className="data-[state=checked]:bg-emerald-600"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                                <div className="space-y-1 flex-1">
                                                    <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        Payment Reminders
                                                    </label>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Get notified about upcoming loan payments
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notifications.paymentReminders}
                                                    onCheckedChange={(checked) =>
                                                        setNotifications({ ...notifications, paymentReminders: checked })}
                                                    className="data-[state=checked]:bg-emerald-600"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                                                <div className="space-y-1 flex-1">
                                                    <label className="text-sm font-semibold text-gray-900 dark:text-white">
                                                        Account Alerts
                                                    </label>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Receive alerts about important account changes
                                                    </p>
                                                </div>
                                                <Switch
                                                    checked={notifications.accountAlerts}
                                                    onCheckedChange={(checked) =>
                                                        setNotifications({ ...notifications, accountAlerts: checked })}
                                                    className="data-[state=checked]:bg-emerald-600"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Security Tab */}
                            <TabsContent value="security">
                                <Card className={cn(
                                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                                    "border border-gray-200/50 dark:border-gray-700/50",
                                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                                )}>
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-white">Security Settings</CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-gray-400">
                                            Manage your account security and authentication preferences
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        <div className="space-y-4">
                                            <Button
                                                variant="outline"
                                                className="w-full h-12 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <Shield className="w-4 h-4 mr-2" />
                                                Change Password
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="w-full h-12 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
                                            >
                                                <Shield className="w-4 h-4 mr-2" />
                                                Enable Two-Factor Authentication
                                            </Button>

                                            <div className={cn(
                                                "p-5 rounded-xl border",
                                                "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10",
                                                "border-blue-200 dark:border-blue-800/30"
                                            )}>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-blue-500 dark:bg-blue-600 flex items-center justify-center flex-shrink-0">
                                                        <Calendar className="h-5 w-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Last Login</h4>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Today at 10:45 AM
                                                        </p>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                                            Location: Johannesburg, South Africa
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* Billing Tab */}
                            <TabsContent value="billing">
                                <Card className={cn(
                                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                                    "border border-gray-200/50 dark:border-gray-700/50",
                                    "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20"
                                )}>
                                    <CardHeader>
                                        <CardTitle className="text-gray-900 dark:text-white">Subscription & Billing</CardTitle>
                                        <CardDescription className="text-gray-600 dark:text-gray-400">
                                            Manage your subscription and payment details
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Current Plan */}
                                        <div className={cn(
                                            "p-6 rounded-xl border",
                                            "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-800/10",
                                            "border-emerald-200 dark:border-emerald-800/30"
                                        )}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                                        Professional Plan
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                                        R29/month • Renews on Feb 1, 2025
                                                    </p>
                                                </div>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                                                >
                                                    Change Plan
                                                </Button>
                                            </div>
                                        </div>

                                        {/* Payment Method */}
                                        <div className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                                    Payment Method
                                                </h3>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                                                >
                                                    Add New
                                                </Button>
                                            </div>
                                            <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                                                        <CreditCard className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                                                    </div>
                                                    <div>
                                                        <p className="font-semibold text-gray-900 dark:text-white">
                                                            •••• •••• •••• 4242
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            Expires 12/2025
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button variant="ghost" size="sm">Edit</Button>
                                            </div>
                                        </div>

                                        {/* Billing History */}
                                        <div className="space-y-4">
                                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                                Billing History
                                            </h3>
                                            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
                                                {[
                                                    { date: 'Jan 1, 2025', amount: 'R29.00', status: 'Paid' },
                                                    { date: 'Dec 1, 2024', amount: 'R29.00', status: 'Paid' },
                                                    { date: 'Nov 1, 2024', amount: 'R29.00', status: 'Paid' },
                                                ].map((invoice, index) => (
                                                    <div key={index} className="p-4 flex justify-between items-center hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors">
                                                        <div>
                                                            <p className="font-semibold text-gray-900 dark:text-white">
                                                                {invoice.date}
                                                            </p>
                                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                                {invoice.amount} • <span className="text-emerald-600 dark:text-emerald-400">{invoice.status}</span>
                                                            </p>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="hover:bg-gray-200 dark:hover:bg-gray-600"
                                                        >
                                                            <Download className="w-4 h-4 mr-2" />
                                                            Download
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </div>
        </div>
    );
};