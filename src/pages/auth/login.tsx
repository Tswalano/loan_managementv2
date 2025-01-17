// src/pages/auth/login.tsx
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from '@/components/theme-toggle';
import { Loader2, DollarSign } from 'lucide-react';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const from = (location.state as any)?.from?.pathname || '/';

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;
            console.log(data);

            navigate(from, { replace: true });
        } catch (error: any) {
            console.log(error);

            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Theme Toggle */}
            <div className="fixed top-4 right-4 z-50">
                <ThemeToggle />
            </div>

            <div className="flex min-h-[calc(100vh-4rem)]"> {/* Subtract footer height */}
                {/* Left Side - Login Form */}
                {/* <div className="w-full lg:w-1/2 flex items-center justify-center p-8"> */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                    <div className="w-full max-w-md space-y-8">
                        <div className="flex flex-col items-center space-y-2">
                            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/20 p-3">
                                <div className="rounded-full bg-emerald-600 dark:bg-emerald-500 p-3">
                                    <DollarSign className="w-8 h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                FinanceFlow
                            </h1>
                        </div>

                        <Card className="border-0 shadow-lg bg-gray-950">
                            <CardHeader className="space-y-1 pb-6">
                                <CardTitle className="text-2xl font-bold text-center text-gray-900 dark:text-gray-100">
                                    Welcome back
                                </CardTitle>
                                <CardDescription className="text-center text-gray-500 dark:text-gray-400">
                                    Enter your credentials to access your account
                                </CardDescription>
                            </CardHeader>
                            <form onSubmit={handleLogin}>
                                <CardContent className="space-y-4">
                                    {error && (
                                        <Alert variant="destructive" className="text-sm">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="space-y-2">
                                        <Label
                                            htmlFor="email"
                                            className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                        >
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <Label
                                                htmlFor="password"
                                                className="text-sm font-medium text-gray-700 dark:text-gray-300"
                                            >
                                                Password
                                            </Label>
                                            <button
                                                type="button"
                                                className="text-sm text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-11 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-emerald-500"
                                            required
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
                                        disabled={loading}
                                    >
                                        {loading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            'Sign in'
                                        )}
                                    </Button>
                                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                        Don't have an account?{' '}
                                        <a
                                            href="/request-access"
                                            type="button"
                                            className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                                        >
                                            Request Access
                                        </a>
                                    </p>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>
                </div>

                {/* Right Side - Vector Illustration */}
                <div className="hidden lg:flex w-1/2 bg-emerald-50 dark:bg-gray-800 relative overflow-hidden">
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                        {/* Decorative circles */}
                        <div className="absolute w-96 h-96 bg-emerald-100 dark:bg-emerald-900/20 rounded-full -top-20 -right-20" />
                        <div className="absolute w-96 h-96 bg-emerald-200 dark:bg-emerald-800/20 rounded-full -bottom-20 -left-20" />

                        <div className="relative z-10 flex flex-col items-center justify-center h-full max-h-[600px]">
                            <img src="/rb_705.png" alt="Illustration" className="w-full max-w-[400px] h-auto mb-8" />

                            {/* Text Overlay - Position relative to illustration */}
                            <div className="text-center mt-4">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                                    Track Your Loans
                                </h2>
                                <p className="text-gray-600 dark:text-gray-300 max-w-md">
                                    Manage your lending business efficiently with our powerful dashboard
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer - Now properly positioned */}
            <footer className="h-16 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="h-full flex items-center justify-center">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        © {new Date().getFullYear()} FinanceFlow. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
}