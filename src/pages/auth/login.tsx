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
import { Loader2, PiggyBank, Play, User as UserIcon, Mail, Lock, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { BACKEND_API_URL } from '@/lib/utils/consts';
import { cn } from '@/lib/utils';

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
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Checking server health...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
            {/* Navbar */}
            <nav className={cn(
                "mt-6 mb-4 rounded-2xl",
                "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                "border border-gray-200/50 dark:border-gray-700/50",
                "shadow-xl dark:shadow-2xl dark:shadow-black/20",
                "px-6 py-4 mx-auto max-w-6xl w-[94%]"
            )}>
                <div className="flex justify-between items-center">
                    <Link to="/" className="flex items-center font-bold text-xl group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform">
                            <PiggyBank className="h-5 w-5 text-white" />
                        </div>
                        <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                            FinanceFlow
                        </span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link
                            to="/"
                            className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            Home
                        </Link>
                        <Link
                            to="/signup"
                            className={cn(
                                "inline-flex items-center text-sm font-semibold rounded-xl px-5 py-2.5",
                                "bg-gradient-to-r from-emerald-600 to-emerald-700",
                                "hover:from-emerald-700 hover:to-emerald-800",
                                "text-white shadow-lg hover:shadow-xl",
                                "transition-all duration-300"
                            )}
                        >
                            Sign Up
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            {/* API health banner */}
            {!apiHealth && (
                <div className="mx-auto w-[94%] max-w-6xl mb-4">
                    <div className={cn(
                        "rounded-2xl p-4 flex justify-between items-center",
                        "bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/10",
                        "border border-red-200 dark:border-red-800/30"
                    )}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-white" />
                            </div>
                            <p className="text-sm text-red-900 dark:text-red-200 font-medium">
                                API is down — click to restart the backend server.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
                            onClick={startServer}
                        >
                            <Play className="h-4 w-4 mr-2" /> Start Server
                        </Button>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <main className="flex flex-1 items-center justify-center w-full px-4 py-8">
                <div className={cn(
                    "flex flex-col lg:flex-row w-full max-w-6xl rounded-3xl overflow-hidden",
                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "shadow-2xl dark:shadow-black/40",
                    "min-h-[70vh]"
                )}>
                    {/* Left: Login Form */}
                    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
                        <Card className={cn(
                            "w-full max-w-md",
                            "backdrop-blur-xl bg-white/90 dark:bg-gray-800/90",
                            "border border-gray-200/50 dark:border-gray-700/50",
                            "shadow-xl dark:shadow-2xl dark:shadow-black/20",
                            "rounded-2xl"
                        )}>
                            <CardHeader className="text-center space-y-4 pb-6">
                                <div className="flex justify-center">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                        <PiggyBank className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                        Welcome Back
                                    </h1>
                                    <CardDescription className="text-gray-600 dark:text-gray-400 mt-2">
                                        Enter your credentials to access your dashboard
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <form onSubmit={handleLogin}>
                                <CardContent className="space-y-5">
                                    {error && (
                                        <Alert variant="destructive" className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/30">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertDescription>{error}</AlertDescription>
                                        </Alert>
                                    )}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-gray-700 dark:text-gray-300 font-medium">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                            <Input
                                                id="email"
                                                type="email"
                                                placeholder="you@financeflow.app"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                                disabled={isLoggingIn}
                                                className="pl-11 h-12 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center">
                                            <Label htmlFor="password" className="text-gray-700 dark:text-gray-300 font-medium">
                                                Password
                                            </Label>
                                            <button
                                                type="button"
                                                className="text-sm text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium transition-colors"
                                            >
                                                Forgot password?
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500" />
                                            <Input
                                                id="password"
                                                type="password"
                                                placeholder="••••••••"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                                disabled={isLoggingIn}
                                                className="pl-11 h-12 bg-white dark:bg-gray-800/50 border-gray-300 dark:border-gray-600"
                                            />
                                        </div>
                                    </div>
                                </CardContent>

                                <CardFooter className="flex flex-col space-y-4 pt-2">
                                    <Button
                                        type="submit"
                                        disabled={isLoggingIn}
                                        className={cn(
                                            "w-full h-12",
                                            "bg-gradient-to-r from-emerald-600 to-emerald-700",
                                            "hover:from-emerald-700 hover:to-emerald-800",
                                            "text-white shadow-lg hover:shadow-xl",
                                            "transition-all duration-300",
                                            "disabled:opacity-50"
                                        )}
                                    >
                                        {isLoggingIn ? (
                                            <Loader2 className="h-5 w-5 animate-spin" />
                                        ) : (
                                            "Sign In"
                                        )}
                                    </Button>

                                    <div className="relative w-full">
                                        <div className="absolute inset-0 flex items-center">
                                            <span className="w-full border-t border-gray-200 dark:border-gray-700" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                                                Or
                                            </span>
                                        </div>
                                    </div>

                                    <Button
                                        type="button"
                                        onClick={handleDemoLogin}
                                        variant="outline"
                                        disabled={isLoggingIn}
                                        className={cn(
                                            "w-full h-12 flex items-center justify-center gap-2",
                                            "bg-white dark:bg-gray-800/50",
                                            "border-2 border-emerald-500/50 dark:border-emerald-500/30",
                                            "text-emerald-700 dark:text-emerald-400",
                                            "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
                                            "hover:border-emerald-600 dark:hover:border-emerald-400",
                                            "transition-all duration-300"
                                        )}
                                    >
                                        <UserIcon className="h-4 w-4" /> Use Demo Account
                                    </Button>

                                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                                        Don't have an account?{" "}
                                        <Link
                                            to="/contact-sales"
                                            className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-semibold transition-colors"
                                        >
                                            Request Access
                                        </Link>
                                    </p>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>

                    {/* Right: Illustration */}
                    <div className="hidden lg:flex w-1/2 items-center justify-center bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-900/20 dark:to-teal-900/10 relative overflow-hidden">
                        {/* Background decorations */}
                        <div className="absolute inset-0">
                            <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-emerald-200/50 to-emerald-300/30 dark:from-emerald-800/20 dark:to-emerald-900/10 rounded-full blur-3xl -translate-x-1/3 -translate-y-1/3" />
                            <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-teal-200/50 to-teal-300/30 dark:from-teal-800/20 dark:to-teal-900/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
                        </div>

                        <div className="relative z-10 text-center px-8">
                            <div className="mb-8 relative">
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-2xl rounded-full" />
                                <img
                                    src="/rb_705.png"
                                    alt="Illustration"
                                    className="w-full max-w-md mx-auto drop-shadow-2xl relative z-10"
                                />
                            </div>
                            <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3">
                                Track Your Loans
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto leading-relaxed">
                                Manage your lending business efficiently with our powerful dashboard and analytics tools.
                            </p>

                            {/* Feature badges */}
                            <div className="flex flex-wrap gap-3 justify-center mt-8">
                                <span className="px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    📊 Analytics
                                </span>
                                <span className="px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    💰 Payments
                                </span>
                                <span className="px-4 py-2 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300">
                                    📈 Reports
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer className="w-full py-8 mt-8 border-t border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl">
                <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-600 dark:text-gray-400 text-sm">
                    <p>
                        © {year}{" "}
                        <span className="font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 bg-clip-text text-transparent">
                            FinanceFlow
                        </span>
                        . All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link to="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">
                            Privacy Policy
                        </Link>
                        <Link to="#" className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors font-medium">
                            Terms of Service
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}