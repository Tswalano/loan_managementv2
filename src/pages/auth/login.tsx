/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
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
import { Loader2, PiggyBank, Play, User as UserIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { BACKEND_API_URL } from '@/lib/utils/consts';

const DEMO_EMAIL = "email@financeco.com";
const DEMO_PASSWORD = "Admin123";

export default function LoginPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const location = useLocation();
    const [apiHealth, setApiHealth] = useState(true);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const year = new Date().getFullYear();

    const from = (location.state as any)?.from?.pathname || '/app';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoggingIn(true);

        try {
            const result = await api.login({ email, password });

            // Token is automatically saved by api.login() to sessionStorage
            // Store user data for easy access throughout the app
            sessionStorage.setItem('user', JSON.stringify(result.user));
            if (result.organization) {
                sessionStorage.setItem('organization', JSON.stringify(result.organization));
            }

            toast({
                title: "Success",
                description: `Welcome back, ${result.user.firstName || 'User'}!`
            });

            navigate(from, { replace: true });
        } catch (error: any) {
            setError(error.message);
            toast({
                title: "Login Failed",
                description: error.message,
                variant: "destructive"
            });
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleDemoLogin = () => {
        setEmail(DEMO_EMAIL);
        setPassword(DEMO_PASSWORD);
        toast({
            title: "Using Demo Account",
            description: "Logging in as demo user..."
        });

        setTimeout(async () => {
            try {
                setIsLoggingIn(true);
                const result = await api.login({
                    email: DEMO_EMAIL,
                    password: DEMO_PASSWORD
                });

                sessionStorage.setItem('user', JSON.stringify(result.user));
                if (result.organization) {
                    sessionStorage.setItem('organization', JSON.stringify(result.organization));
                }

                toast({
                    title: "Success",
                    description: "Demo login successful"
                });

                navigate(from, { replace: true });
            } catch (error: any) {
                setError(error.message);
                toast({
                    title: "Login Failed",
                    description: error.message,
                    variant: "destructive"
                });
            } finally {
                setIsLoggingIn(false);
            }
        }, 800);
    };

    useEffect(() => {
        const checkApiHealth = async () => {
            try {
                const result = await api.healthCheck();
                setApiHealth(result.status === 'ok');
            } catch {
                setApiHealth(false);
            } finally {
                setLoading(false);
            }
        };
        checkApiHealth();
    }, []);

    const startServer = async () => {
        try {
            const res = await fetch(`${BACKEND_API_URL}/start-project`, {
                method: 'POST'
            });

            if (res.ok) {
                setApiHealth(true);
                toast({ title: "Server started successfully" });
            } else {
                setApiHealth(false);
            }
        } catch {
            setApiHealth(false);
            toast({
                title: "Error",
                description: "Failed to start the server",
                variant: "destructive"
            });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-gray-950 dark:to-gray-900">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-3" />
                <p className="text-gray-600 dark:text-gray-300">Checking server health...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-white dark:bg-gray-950">
            {/* Navbar */}
            <nav className="mt-6 mb-4 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/40 px-5 py-3 shadow-sm mx-auto max-w-6xl w-[94%]">
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center font-extrabold text-xl text-gray-900 dark:text-white">
                        <PiggyBank className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-2" />
                        FinanceFlow
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="hidden sm:inline text-sm font-medium text-gray-800 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400"
                        >
                            Home
                        </Link>
                        <Link
                            to="/signup"
                            className="inline-flex items-center text-sm font-semibold rounded-full px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                        >
                            Sign Up
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            {/* API health banner */}
            {!apiHealth && (
                <div className="mx-auto w-[94%] max-w-5xl">
                    <div className="bg-red-50 border border-red-200 rounded-xl py-3 px-5 flex justify-between items-center shadow-sm mb-4">
                        <p className="text-sm text-red-800 font-medium">
                            API is down — click below to restart the backend server.
                        </p>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" onClick={startServer}>
                            <Play className="h-3 w-3 mr-1" /> Start Server
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex flex-1 items-center justify-center w-full">
                <div className="flex flex-col lg:flex-row w-full max-w-6xl rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-lg bg-white dark:bg-gray-900/50 min-h-[70vh]">
                    {/* Left: Login Form */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-10">
                        <Card className="w-full max-w-md bg-white/80 dark:bg-gray-800/70 backdrop-blur-xl border border-gray-100 dark:border-gray-700 shadow-lg rounded-3xl">
                            <CardHeader className="text-center space-y-2">
                                <div className="flex justify-center mb-2">
                                    <div className="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900/40">
                                        <PiggyBank className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome Back</h1>
                                <CardDescription className="text-gray-600 dark:text-gray-300">
                                    Enter your credentials to access your dashboard
                                </CardDescription>
                            </CardHeader>

                            <form onSubmit={handleLogin}>
                                <CardContent className="space-y-4">
                                    {error && (
                                        <Alert variant="destructive">
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="email">Email</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="you@financeflow.app"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            disabled={isLoggingIn}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="password">Password</Label>
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
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            required
                                            disabled={isLoggingIn}
                                        />
                                    </div>
                                </CardContent>

                                <CardFooter className="flex flex-col space-y-4">
                                    <Button
                                        type="submit"
                                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                        disabled={isLoggingIn}
                                    >
                                        {isLoggingIn ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            "Sign In"
                                        )}
                                    </Button>

                                    <Button
                                        type="button"
                                        onClick={handleDemoLogin}
                                        variant="outline"
                                        className="w-full flex items-center justify-center gap-2 border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                                        disabled={isLoggingIn}
                                    >
                                        <UserIcon className="h-4 w-4" /> Use Demo Account
                                    </Button>

                                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                        Don't have an account?{" "}
                                        <Link
                                            to="/contact-sales"
                                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                                        >
                                            Request Access
                                        </Link>
                                    </p>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>

                    {/* Right: Illustration */}
                    <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/10 relative">
                        <div className="absolute inset-0 overflow-hidden">
                            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-200/50 dark:bg-emerald-800/20 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-200/50 dark:bg-teal-800/20 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
                        </div>
                        <div className="relative z-10 text-center px-6">
                            <img
                                src="/rb_705.png"
                                alt="Illustration"
                                className="w-full max-w-sm mx-auto mb-6 drop-shadow-2xl"
                            />
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                                Track Your Loans
                            </h2>
                            <p className="text-gray-600 dark:text-gray-300">
                                Manage your lending business efficiently with our powerful dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 mt-8 border-t border-gray-100 dark:border-gray-800 bg-transparent">
                <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
                    <p>
                        © {year} <span className="font-semibold text-emerald-600 dark:text-emerald-400">FinanceFlow</span>. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Privacy Policy</Link>
                        <Link to="#" className="hover:text-emerald-600 dark:hover:text-emerald-400">Terms of Service</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}