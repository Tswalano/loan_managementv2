import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from '@/components/theme-toggle';
import { Loader2, DollarSign, PiggyBank } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import useUserSession from '@/hooks/useUserSession';
import { BACKEND_API_URL } from '@/lib/utils/consts';

// Types
interface LoginCredentials {
    email: string;
    password: string;
}

interface LoginResponse {
    message: string;
    token: string;
    user: any; // Replace with your user type
}

// API login function
const loginUser = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await fetch(`${BACKEND_API_URL}/login`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'Login failed');
    }

    return data;
};

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { setSession, isLoading } = useUserSession();
    const from = (location.state as any)?.from?.pathname || '/app';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);

    const loginMutation = useMutation({
        mutationFn: loginUser,
        onSuccess: (data) => {
            setError(null);
            console.log(data)
            setSession(data.token, data.user);
            navigate(from, { replace: true });
        },
        onError: (error: Error) => {
            setError(error.message);
        }
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        loginMutation.mutate({ email, password });
    };

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <header className="fixed top-0 w-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <a href="/" className="flex items-center">
                            <span className="flex items-center text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                                <PiggyBank className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                                FinanceFlow
                            </span>
                        </a>
                        <ThemeToggle />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col lg:flex-row mt-16">
                {/* Left Side - Login Form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                    <div className="w-full max-w-md space-y-6">
                        <div className="flex flex-col items-center space-y-4">
                            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/20 p-3">
                                <div className="rounded-full bg-emerald-600 dark:bg-emerald-500 p-3">
                                    <DollarSign className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                                </div>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                                Welcome back
                            </h1>
                        </div>

                        <Card className="border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-gray-800">
                            <CardHeader className="space-y-1 pb-4">
                                <CardDescription className="text-center text-gray-600 dark:text-gray-300">
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
                                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
                                            Email
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">
                                                Password
                                            </Label>
                                            <button
                                                type="button"
                                                className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700"
                                            required
                                        />
                                    </div>
                                </CardContent>
                                <CardFooter className="flex flex-col space-y-4">
                                    <Button
                                        type="submit"
                                        className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white"
                                        disabled={loginMutation.isPending}
                                    >
                                        {isLoading ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            'Sign in'
                                        )}
                                    </Button>
                                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                        Don't have an account?{' '}
                                        <a
                                            href="/request-access"
                                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
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
                <div className="hidden lg:block w-1/2 relative">
                    <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800">
                        {/* Top gradient overlay */}
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white dark:from-gray-900 to-transparent z-10" />

                        {/* Content container */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                            {/* Decorative circles */}
                            <div className="absolute w-96 h-96 bg-emerald-100/50 dark:bg-emerald-900/20 rounded-full -top-20 -right-20 blur-3xl" />
                            <div className="absolute w-96 h-96 bg-emerald-200/50 dark:bg-emerald-800/20 rounded-full -bottom-20 -left-20 blur-3xl" />

                            <div className="relative z-10 flex flex-col items-center justify-center max-w-lg w-full">
                                <img
                                    src="/rb_705.png"
                                    alt="Illustration"
                                    className="w-full max-w-md h-auto mb-8 drop-shadow-2xl"
                                />
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                        Track Your Loans
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-300">
                                        Manage your lending business efficiently with our powerful dashboard
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Bottom gradient overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-100 dark:from-gray-900 to-transparent" />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
                <div className="container mx-auto px-4 py-6 sm:py-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
                        <div className="text-gray-600 dark:text-gray-400 text-sm text-center sm:text-left">
                            <a href="https://glenify.studio" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
                                <span className="font-semibold">Glenify Studios</span>
                            </a>{' '}
                            © 2024 FinanceFlow. All rights reserved.
                        </div>
                        <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
                            <button className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm">
                                Privacy Policy
                            </button>
                            <button className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm">
                                Terms of Service
                            </button>
                            <button className="text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 text-sm">
                                Cookies
                            </button>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}