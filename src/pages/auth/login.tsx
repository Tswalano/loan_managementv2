/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from '@/components/theme-toggle';
import {
    Loader2, PiggyBank, Play, Eye, EyeOff,
    Mail, Lock, AlertCircle, TrendingUp, Shield, Zap,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { saveUserData } from '@/lib/auth';
import { BACKEND_API_URL } from '@/lib/utils/consts';
import { cn } from '@/lib/utils';

const DEMO_EMAIL = "email@financeco.com";
const DEMO_PASSWORD = "Admin123";

const FEATURES = [
    { icon: TrendingUp, label: 'Real-time analytics', desc: 'Live dashboards with loan and transaction insights' },
    { icon: Shield, label: 'Secure & private', desc: 'End-to-end encrypted with role-based access control' },
    { icon: Zap, label: 'Built for speed', desc: 'Manage loans and accounts in one place' },
];

export default function LoginPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const location = useLocation();

    const [apiHealth, setApiHealth] = useState(true);
    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [demoLoading, setDemoLoading] = useState(false);

    const from = (location.state as any)?.from?.pathname || '/app';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoggingIn(true);
        try {
            const result = await api.login({ email, password });
            saveUserData(result.token, result.user, result.organization);
            toast({ title: 'Welcome back', description: `Signed in as ${result.user.firstName || result.user.email}` });
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'Invalid email or password.');
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleDemoLogin = async () => {
        setError(null);
        setDemoLoading(true);
        setEmail(DEMO_EMAIL);
        setPassword(DEMO_PASSWORD);
        try {
            const result = await api.login({ email: DEMO_EMAIL, password: DEMO_PASSWORD });
            saveUserData(result.token, result.user, result.organization);
            toast({ title: 'Demo access granted', description: 'Exploring the demo account.' });
            navigate(from, { replace: true });
        } catch (err: any) {
            setError(err.message || 'Demo login failed.');
        } finally {
            setDemoLoading(false);
        }
    };

    const startServer = async () => {
        try {
            const res = await fetch(`${BACKEND_API_URL}/start-project`, { method: 'POST' });
            if (res.ok) {
                setApiHealth(true);
                toast({ title: 'Server started' });
            }
        } catch {
            toast({ title: 'Failed to start server', variant: 'destructive' });
        }
    };

    useEffect(() => {
        api.healthCheck()
            .then(r => setApiHealth(r.status === 'ok'))
            .catch(() => setApiHealth(false))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
                        <Loader2 className="w-7 h-7 animate-spin text-white" />
                    </div>
                    <p className="text-sm text-gray-400">Connecting to server…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">

            {/* ── Left panel — branding ───────────────────────────────────── */}
            <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative overflow-hidden bg-gray-950 flex-col">

                {/* Mesh gradient background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.18)_0%,_transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(20,184,166,0.12)_0%,_transparent_60%)]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />

                {/* Floating grid lines */}
                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

                {/* Top-left logo */}
                <div className="relative z-10 p-10">
                    <Link to="/" className="inline-flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                            <PiggyBank className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-extrabold text-white">FinanceFlow</span>
                    </Link>
                </div>

                {/* Center content */}
                <div className="relative z-10 flex flex-col justify-center flex-1 px-10 xl:px-14 pb-10">
                    <div className="max-w-md">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Lending Management</span>
                        </div>

                        <h1 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                            Take control of
                            <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                your finances
                            </span>
                        </h1>

                        <p className="text-gray-400 text-lg leading-relaxed mb-10">
                            Manage loans and bank accounts — all in one powerful dashboard.
                        </p>

                        {/* Feature list */}
                        <div className="space-y-4">
                            {FEATURES.map(({ icon: Icon, label, desc }) => (
                                <div key={label} className="flex items-start gap-4">
                                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <Icon className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{label}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Dashboard mockup preview — bottom strip */}
                <div className="relative z-10 px-10 xl:px-14 pb-0 overflow-hidden">
                    <div className="rounded-t-2xl border border-gray-700/60 bg-gray-900/80 backdrop-blur-sm overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-700/60">
                            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                            <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                            <span className="ml-3 text-xs text-gray-500 font-mono">financeflow.app/dashboard</span>
                        </div>
                        <img
                            src="/dashboard.png"
                            alt="Dashboard preview"
                            className="w-full object-cover object-top max-h-48 opacity-60"
                        />
                    </div>
                </div>
            </div>

            {/* ── Right panel — form ──────────────────────────────────────── */}
            <div className="flex-1 flex flex-col min-h-screen">

                {/* Top bar */}
                <header className="flex items-center justify-between px-6 sm:px-10 py-5">
                    {/* Mobile logo */}
                    <Link to="/" className="lg:hidden flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                            <PiggyBank className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-gray-900 dark:text-white">FinanceFlow</span>
                    </Link>
                    <div className="lg:hidden" />
                    <div className="ml-auto">
                        <ThemeToggle />
                    </div>
                </header>

                {/* API health banner */}
                {!apiHealth && (
                    <div className="mx-6 sm:mx-10 mb-2 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30">
                        <div className="flex items-center gap-2.5">
                            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            <p className="text-sm text-red-700 dark:text-red-300 font-medium">
                                API is offline — the backend server needs to be started.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            onClick={startServer}
                            className="flex-shrink-0 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white hover:from-emerald-700 hover:to-emerald-800"
                        >
                            <Play className="w-3.5 h-3.5 mr-1.5" />
                            Start
                        </Button>
                    </div>
                )}

                {/* Form centred in remaining space */}
                <div className="flex-1 flex items-center justify-center px-6 sm:px-10 py-8">
                    <div className="w-full max-w-[400px] space-y-8">

                        {/* Heading */}
                        <div>
                            <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                                Sign in
                            </h2>
                            <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
                                Enter your credentials to access your account
                            </p>
                        </div>

                        {/* Error alert */}
                        {error && (
                            <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 px-4 py-3">
                                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Form */}
                        <form onSubmit={handleLogin} className="space-y-5">
                            {/* Email */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={isLoggingIn || demoLoading}
                                        className={cn(
                                            'pl-10 h-12 text-sm',
                                            'bg-white dark:bg-gray-800/60',
                                            'border-gray-200 dark:border-gray-700',
                                            'focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-400',
                                            'rounded-xl'
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                        Password
                                    </Label>
                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <Input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={isLoggingIn || demoLoading}
                                        className={cn(
                                            'pl-10 pr-10 h-12 text-sm',
                                            'bg-white dark:bg-gray-800/60',
                                            'border-gray-200 dark:border-gray-700',
                                            'focus-visible:ring-2 focus-visible:ring-emerald-500 dark:focus-visible:ring-emerald-400',
                                            'rounded-xl'
                                        )}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Sign in button */}
                            <Button
                                type="submit"
                                disabled={isLoggingIn || demoLoading}
                                className={cn(
                                    'w-full h-12 text-sm font-semibold rounded-xl',
                                    'bg-gradient-to-r from-emerald-600 to-emerald-700',
                                    'hover:from-emerald-700 hover:to-emerald-800',
                                    'text-white shadow-lg shadow-emerald-500/20',
                                    'transition-all duration-200',
                                    'disabled:opacity-60'
                                )}
                            >
                                {isLoggingIn
                                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Signing in…</>
                                    : 'Sign in'}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                            <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or</span>
                            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
                        </div>

                        {/* Demo login */}
                        <button
                            type="button"
                            onClick={handleDemoLogin}
                            disabled={isLoggingIn || demoLoading}
                            className={cn(
                                'w-full h-12 flex items-center justify-center gap-2.5 rounded-xl text-sm font-semibold',
                                'border-2 border-dashed border-emerald-300 dark:border-emerald-700',
                                'text-emerald-700 dark:text-emerald-400',
                                'hover:bg-emerald-50 dark:hover:bg-emerald-900/20',
                                'hover:border-emerald-500 dark:hover:border-emerald-500',
                                'transition-all duration-200',
                                'disabled:opacity-60'
                            )}
                        >
                            {demoLoading
                                ? <><Loader2 className="w-4 h-4 animate-spin" />Loading demo…</>
                                : <>
                                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                                        <span className="text-[9px] font-black text-white leading-none">D</span>
                                    </div>
                                    Try the demo account
                                </>}
                        </button>

                        {/* Register link */}
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                to="/contact-sales"
                                className="font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors"
                            >
                                Request access
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <footer className="px-6 sm:px-10 py-5 flex items-center justify-between">
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                        © {new Date().getFullYear()} FinanceFlow. All rights reserved.
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-600">
                        Secure · Encrypted · Private
                    </p>
                </footer>
            </div>
        </div>
    );
}
