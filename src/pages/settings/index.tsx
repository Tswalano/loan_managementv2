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
    Loader2, Camera
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getCurrentUser } from '@/lib/auth';

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

            // TODO: Implement profile update logic with your backend
            // Example:
            // await fetch(`${BACKEND_API_URL}/users/${user.id}`, {
            //     method: 'PUT',
            //     headers: getAuthHeaders(),
            //     body: JSON.stringify(profileData)
            // });

            // Simulate API call
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
        <div className="container mx-auto p-6 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    Settings & Profile
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Manage your account settings and preferences
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Profile Section - Fixed on the left */}
                <div className="lg:col-span-4">
                    <div className="sticky top-6">
                        <Card className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                            <CardHeader>
                                <div className="flex items-center space-x-4">
                                    <div className="relative">
                                        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                                            <User className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                                        </div>
                                        <button className="absolute bottom-0 right-0 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                                            <Camera className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        </button>
                                    </div>
                                    <div>
                                        <CardTitle>Profile Settings</CardTitle>
                                        <CardDescription>
                                            Update your personal information
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Full Name
                                        </label>
                                        <Input
                                            placeholder="John Doe"
                                            value={profileData.fullName}
                                            onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                                            className="bg-white dark:bg-gray-800"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Email Address
                                        </label>
                                        <Input
                                            type="email"
                                            placeholder="john@example.com"
                                            value={profileData.email}
                                            onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                            className="bg-white dark:bg-gray-800"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Phone Number
                                        </label>
                                        <Input
                                            placeholder="+27 123 456 789"
                                            value={profileData.phone}
                                            onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                                            className="bg-white dark:bg-gray-800"
                                        />
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                        onClick={handleUpdateProfile}
                                        disabled={loading}
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

                {/* Settings Tabs - On the right */}
                <div className="lg:col-span-8">
                    <Tabs defaultValue="notifications" className="space-y-4">
                        <TabsList className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-transparent">
                            <TabsTrigger
                                value="notifications"
                                className="bg-white dark:bg-gray-800 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900"
                            >
                                <Bell className="w-4 h-4 mr-2" />
                                Notifications
                            </TabsTrigger>
                            <TabsTrigger
                                value="security"
                                className="bg-white dark:bg-gray-800 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900"
                            >
                                <Shield className="w-4 h-4 mr-2" />
                                Security
                            </TabsTrigger>
                            <TabsTrigger
                                value="subscriptions"
                                className="bg-white dark:bg-gray-800 data-[state=active]:bg-emerald-50 dark:data-[state=active]:bg-emerald-900"
                            >
                                <Settings className="w-4 h-4 mr-2" />
                                Subscriptions
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="notifications">
                            <Card className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Notification Settings</CardTitle>
                                    <CardDescription>
                                        Choose how you want to be notified about account activity
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                                            />
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
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
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="security">
                            <Card className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Security Settings</CardTitle>
                                    <CardDescription>
                                        Manage your account security and authentication preferences
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <Button variant="outline" className="w-full">
                                            Change Password
                                        </Button>
                                        <Button variant="outline" className="w-full">
                                            Enable Two-Factor Authentication
                                        </Button>
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Last login: Today at 10:45 AM
                                                <br />
                                                Location: Johannesburg, South Africa
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="subscriptions">
                            <Card className="bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm">
                                <CardHeader>
                                    <CardTitle>Subscription Plan</CardTitle>
                                    <CardDescription>
                                        Manage your subscription and billing details
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {/* Current Plan */}
                                    <div className="bg-emerald-50 dark:bg-emerald-900/50 p-4 rounded-lg">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-medium text-emerald-900 dark:text-emerald-100">
                                                    Professional Plan
                                                </h3>
                                                <p className="text-sm text-emerald-700 dark:text-emerald-300 mt-1">
                                                    R29/month • Renews on Feb 1, 2025
                                                </p>
                                            </div>
                                            <Button variant="outline" className="bg-white dark:bg-gray-800">
                                                Change Plan
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Payment Method */}
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                                Payment Method
                                            </h3>
                                            <Button variant="outline" size="sm">
                                                Add New
                                            </Button>
                                        </div>
                                        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                                                    <svg className="w-8 h-8" viewBox="0 0 24 24">
                                                        <path
                                                            fill="currentColor"
                                                            d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"
                                                        />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                                        •••• 4242
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
                                        <h3 className="font-medium text-gray-900 dark:text-gray-100">
                                            Billing History
                                        </h3>
                                        <div className="bg-white dark:bg-gray-800 rounded-lg divide-y dark:divide-gray-700">
                                            {[
                                                { date: 'Jan 1, 2025', amount: 'R29.00', status: 'Paid' },
                                                { date: 'Dec 1, 2024', amount: 'R29.00', status: 'Paid' },
                                                { date: 'Nov 1, 2024', amount: 'R29.00', status: 'Paid' },
                                            ].map((invoice, index) => (
                                                <div key={index} className="p-4 flex justify-between items-center">
                                                    <div>
                                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                                            {invoice.date}
                                                        </p>
                                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                                            {invoice.amount} • {invoice.status}
                                                        </p>
                                                    </div>
                                                    <Button variant="ghost" size="sm">Download</Button>
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
    );
}