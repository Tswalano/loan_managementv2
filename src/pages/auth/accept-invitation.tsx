import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from '@/components/theme-toggle';
import { Loader2, PiggyBank, Mail, Lock, AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { BACKEND_API_URL } from '@/lib/utils/consts';
import { cn } from '@/lib/utils';
import { MinimumFooter } from '@/components/footer';
import { getAuthToken, saveUserData, setCurrentOrganization } from '@/lib/auth';

type InviteStatus = 'idle' | 'accepting' | 'accepted' | 'error';

export default function AcceptInvitationPage() {
    const { token = '' } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();

    const [apiHealth, setApiHealth] = useState(true);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState<InviteStatus>('idle');
    const [inviteError, setInviteError] = useState<string | null>(null);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isAuthenticated = Boolean(getAuthToken());
    const invitePath = location.pathname;
    const inviteLink = useMemo(() => `${window.location.origin}${invitePath}`, [invitePath]);

    const acceptInvitation = async () => {
        if (!token) return;
        try {
            setStatus('accepting');
            setInviteError(null);
            const result = await api.acceptInvitation(token);
            if (result.organization) {
                setCurrentOrganization(result.organization);
            }
            setStatus('accepted');
            toast({
                title: 'Invitation accepted',
                description: 'You have joined the organization successfully.',
            });
            setTimeout(() => navigate('/app', { replace: true }), 1200);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to accept invitation.';
            setInviteError(message);
            setStatus('error');
        }
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

    useEffect(() => {
        if (isAuthenticated && token && status === 'idle') {
            void acceptInvitation();
        }
    }, [isAuthenticated, token, status]);

    const startServer = async () => {
        try {
            const res = await fetch(`${BACKEND_API_URL}/start-project`, { method: 'POST' });
            if (res.ok) {
                setApiHealth(true);
                toast({ title: 'Server started successfully' });
            } else {
                setApiHealth(false);
            }
        } catch {
            setApiHealth(false);
            toast({
                title: 'Error',
                description: 'Failed to start the server',
                variant: 'destructive',
            });
        }
    };

    const handleRegisterAndAccept = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) return;

        try {
            setIsSubmitting(true);
            setInviteError(null);

            const result = await api.register({
                email,
                password,
                firstName,
                lastName,
                organizationName: `${firstName || email}'s Workspace`,
            });

            saveUserData(result.token, result.user, result.organization);

            const acceptResult = await api.acceptInvitation(token);
            if (acceptResult.organization) {
                setCurrentOrganization(acceptResult.organization);
            }

            toast({
                title: 'Account created',
                description: 'Your account was created and the invitation was accepted.',
            });
            navigate('/app', { replace: true });
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to complete invitation setup.';
            setInviteError(message);
            toast({
                title: 'Invitation setup failed',
                description: message,
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg">
                    <Loader2 className="h-8 w-8 animate-spin text-white" />
                </div>
                <p className="text-gray-600 dark:text-gray-300 font-medium">Preparing invitation...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
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
                    <ThemeToggle />
                </div>
            </nav>

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
                                API is down. Start the backend server to continue.
                            </p>
                        </div>
                        <Button
                            size="sm"
                            className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg"
                            onClick={startServer}
                        >
                            Start Server
                        </Button>
                    </div>
                </div>
            )}

            <main className="flex flex-1 items-center justify-center w-full px-4 py-8">
                <div className={cn(
                    "flex flex-col lg:flex-row w-full max-w-6xl rounded-3xl overflow-hidden",
                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "shadow-2xl dark:shadow-black/40",
                    "min-h-[70vh]"
                )}>
                    <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-gradient-to-br from-emerald-600 to-emerald-700 text-white flex flex-col justify-center">
                        <div className="max-w-md">
                            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-medium mb-6">
                                <UserPlus className="h-4 w-4" />
                                Organization Invitation
                            </div>
                            <h1 className="text-4xl font-bold leading-tight">
                                Join the organization from a direct invite link
                            </h1>
                            <p className="mt-4 text-emerald-50/90">
                                Sign in with the invited email address, or create your account here and the invitation will be accepted automatically.
                            </p>
                            <div className="mt-8 rounded-2xl border border-white/15 bg-white/10 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-emerald-100/80">Invitation Link</p>
                                <p className="mt-2 break-all text-sm text-white/90">{inviteLink}</p>
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12">
                        <Card className="w-full max-w-xl border-0 shadow-none bg-transparent">
                            <CardHeader className="px-0">
                                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                    Accept Invitation
                                </CardTitle>
                                <CardDescription>
                                    {isAuthenticated
                                        ? 'Your account is signed in. We are finalizing the invitation now.'
                                        : 'Choose one of the options below to join the platform.'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-0 space-y-6">
                                {inviteError && (
                                    <Alert variant="destructive">
                                        <AlertDescription>{inviteError}</AlertDescription>
                                    </Alert>
                                )}

                                {status === 'accepted' && (
                                    <div className="rounded-2xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/70 dark:bg-emerald-900/10 p-5">
                                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                                            <CheckCircle2 className="h-5 w-5" />
                                            <p className="font-semibold">Invitation accepted successfully.</p>
                                        </div>
                                        <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                                            Redirecting you into the platform.
                                        </p>
                                    </div>
                                )}

                                {isAuthenticated && status !== 'accepted' && (
                                    <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-gray-50/70 dark:bg-gray-800/40 p-5">
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="h-5 w-5 animate-spin text-emerald-600 dark:text-emerald-400" />
                                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                Accepting your invitation...
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {!isAuthenticated && (
                                    <>
                                        <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-gray-50/70 dark:bg-gray-800/40 p-5 space-y-4">
                                            <div>
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Already have an account?</h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Sign in with the invited email address and this page will complete the invitation automatically.
                                                </p>
                                            </div>
                                            <Button
                                                onClick={() => navigate('/app/login', { state: { from: { pathname: invitePath } } })}
                                                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                                            >
                                                <Mail className="h-4 w-4 mr-2" />
                                                Sign In To Accept
                                            </Button>
                                        </div>

                                        <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/50 p-5">
                                            <div className="mb-4">
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Create account and join</h2>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Create your account here, then the invitation will be accepted immediately.
                                                </p>
                                            </div>
                                            <form className="space-y-4" onSubmit={handleRegisterAndAccept}>
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <Label>First Name</Label>
                                                        <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="First name" />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label>Last Name</Label>
                                                        <Input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Email Address</Label>
                                                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Use the invited email address" required />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Password</Label>
                                                    <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" required />
                                                </div>
                                                <Button
                                                    type="submit"
                                                    disabled={isSubmitting}
                                                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"
                                                >
                                                    {isSubmitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Creating account...</> : <><Lock className="h-4 w-4 mr-2" />Create Account And Join</>}
                                                </Button>
                                            </form>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <MinimumFooter />
        </div>
    );
}
