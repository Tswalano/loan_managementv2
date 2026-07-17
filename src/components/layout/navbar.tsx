// src/components/layout/navbar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    LayoutDashboard,
    PiggyBank,
    Receipt,
    Banknote,
    Settings,
    User,
    Menu,
    X,
    LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../theme-toggle';
import { clearAuth, setCurrentOrganization } from '@/lib/auth';
import api, { useCurrentUser } from '@/lib/api';
import { getActiveOrganization, PermissionKey, resolveOrganizationPermissions } from '@/lib/permissions';

const navigation: Array<{ name: string; href: string; icon: typeof LayoutDashboard; permission: PermissionKey }> = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard, permission: 'canViewDashboard' },
    { name: 'Loans', href: '/app/loans', icon: PiggyBank, permission: 'canViewLoans' },
    { name: 'Transactions', href: '/app/transactions', icon: Receipt, permission: 'canViewTransactions' },
    { name: 'Bank Accounts', href: '/app/bank-accounts', icon: Banknote, permission: 'canViewBankAccounts' },
];

export default function Navbar() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const { data: currentUserData } = useCurrentUser();
    const user = currentUserData?.user;
    const organizations = currentUserData?.organizations || [];
    const activeOrganization = getActiveOrganization(organizations);
    const permissions = activeOrganization
        ? resolveOrganizationPermissions(activeOrganization.role, activeOrganization.permissions)
        : null;
    const visibleNavigation = navigation.filter((item) => permissions?.[item.permission]);
    const displayName = user?.fullName
        || [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
        || user?.email
        || 'My Account';
    const initials = (user?.firstName?.[0] || user?.email?.[0] || 'A').toUpperCase();
    const isActive = (path: string) => {
        if (path === '/app') return location.pathname === path;
        return location.pathname === path || location.pathname.startsWith(`${path}/`);
    };

    const handleOrganizationSwitch = (organizationId: string) => {
        const nextOrganization = organizations.find((organization: { id: string }) => organization.id === organizationId);
        if (!nextOrganization || nextOrganization.id === activeOrganization?.id) {
            return;
        }

        setCurrentOrganization(nextOrganization);
        navigate('/app');
        window.location.reload();
    };

    const handleLogout = async () => {
        await clearAuth();
        await api.logout()

        navigate('/app/login');

    }

    return (
        <nav className="sticky top-0 pt-4 z-50 backdrop-blur-xl shadow-sm">
            <div className="container mx-auto px-4">
                {/* Outer glass container */}
                <div className="mt-4 mb-3 rounded-[26px] border border-gray-200/60 dark:border-emerald-500/10 bg-white/75 dark:bg-gray-950/75 backdrop-blur-xl px-5 py-3 shadow-[0_12px_30px_rgba(15,23,42,0.08)] dark:shadow-[0_18px_40px_rgba(0,0,0,0.35)] transition-all">
                    <div className="flex justify-between items-center">
                        {/* Left: Brand */}
                        <Link
                            to="/app"
                            className="flex items-center text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                        >
                            <PiggyBank className="h-6 w-6 mr-2 text-emerald-600 dark:text-emerald-400" />
                            FinanceFlow
                        </Link>

                        {/* Center: Navigation (Desktop) */}
                        <div className="hidden md:flex items-center gap-3">
                            {visibleNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${isActive(item.href)
                                        ? 'bg-gradient-to-r from-emerald-100/60 to-teal-100/60 dark:from-emerald-900/40 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-300 shadow-inner border border-emerald-200/40 dark:border-emerald-800/40'
                                        : 'text-gray-600 dark:text-gray-300 hover:text-emerald-600 hover:bg-emerald-50/60 dark:hover:text-emerald-400 dark:hover:bg-emerald-900/20'
                                        }`}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>

                        {/* Right: Controls */}
                        <div className="flex items-center gap-3">
                            <ThemeToggle />

                            {/* User Menu */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        className="hidden md:flex items-center gap-3 px-3 py-2 rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-gray-50/90 dark:bg-gray-900/85 hover:bg-emerald-50/80 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-200 transition-colors shadow-sm"
                                    >
                                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-bold text-white shadow-sm">
                                            {initials}
                                        </div>
                                        <div className="flex flex-col items-start leading-tight">
                                            <span className="max-w-[160px] truncate text-sm font-semibold">{displayName}</span>
                                            <span className="max-w-[160px] truncate text-xs text-gray-500 dark:text-gray-400">{user?.email || 'Signed in'}</span>
                                        </div>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-80 rounded-[24px] border border-gray-200/60 dark:border-gray-700/60 bg-white/92 dark:bg-gray-950/92 p-3 shadow-[0_18px_48px_rgba(15,23,42,0.18)] dark:shadow-[0_24px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl"
                                >
                                    <DropdownMenuLabel className="px-2 py-2">
                                        <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/80 bg-gray-50/80 dark:bg-gray-900/80 p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-base font-bold text-white">
                                                    {initials}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">{displayName}</p>
                                                    <p className="truncate text-xs text-gray-500 dark:text-gray-400">{user?.email || 'My Account'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </DropdownMenuLabel>
                                    {organizations.length > 1 && (
                                        <>
                                            <DropdownMenuSeparator />
                                            <div className="px-2 py-3">
                                                <div className="rounded-2xl border border-gray-200/60 dark:border-gray-800/80 bg-gray-50/80 dark:bg-gray-900/80 p-4">
                                                    <p className="mb-3 text-xs uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                                                        Organization
                                                    </p>
                                                    <Select value={activeOrganization?.id} onValueChange={handleOrganizationSwitch}>
                                                        <SelectTrigger className="h-11 rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white/90 dark:bg-gray-950/70">
                                                            <SelectValue placeholder="Select organization" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {organizations.map((organization: { id: string; name: string }) => (
                                                                <SelectItem key={organization.id} value={organization.id}>
                                                                    {organization.name}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                    <DropdownMenuSeparator />
                                    <div className="space-y-1 px-1 py-1">
                                        <DropdownMenuItem asChild className="rounded-xl px-3 py-3">
                                            <Link
                                                to="/app/profile"
                                                className="flex items-center rounded-xl text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                                            >
                                                <User className="h-5 w-5 mr-2" />
                                                My Profile
                                            </Link>
                                        </DropdownMenuItem>
                                        {permissions?.canManageSettings && (
                                            <DropdownMenuItem asChild className="rounded-xl px-3 py-3">
                                                <Link
                                                    to="/app/settings"
                                                    className="flex items-center rounded-xl text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                                                >
                                                    <Settings className="h-5 w-5 mr-2" />
                                                    Settings
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem
                                            onClick={handleLogout}
                                            className="rounded-xl px-3 py-3 text-red-600 dark:text-red-400 cursor-pointer"
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Log out
                                        </DropdownMenuItem>
                                    </div>
                                </DropdownMenuContent>
                            </DropdownMenu>

                            {/* Mobile Menu Button */}
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="md:hidden hover:bg-emerald-50/70 dark:hover:bg-emerald-900/20"
                            >
                                {isMobileMenuOpen ? (
                                    <X className="h-6 w-6" />
                                ) : (
                                    <Menu className="h-6 w-6" />
                                )}
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu */}
                    {isMobileMenuOpen && (
                        <div className="md:hidden mt-3 border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
                            {visibleNavigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive(item.href)
                                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                        : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400'
                                        }`}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            ))}

                            <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700">
                                {organizations.length > 1 && (
                                    <div className="px-3 pb-3">
                                        <p className="mb-2 text-xs uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
                                            Organization
                                        </p>
                                        <Select value={activeOrganization?.id} onValueChange={handleOrganizationSwitch}>
                                            <SelectTrigger className="h-11 rounded-xl border border-gray-200/50 dark:border-gray-700/50 bg-white/70 dark:bg-gray-900/70">
                                                <SelectValue placeholder="Select organization" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {organizations.map((organization: { id: string; name: string }) => (
                                                    <SelectItem key={organization.id} value={organization.id}>
                                                        {organization.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <Link
                                    to="/app/profile"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 rounded-md"
                                >
                                    <User className="h-5 w-5 mr-2" />
                                    My Profile
                                </Link>
                                {permissions?.canManageSettings && (
                                    <Link
                                        to="/app/settings"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 rounded-md"
                                    >
                                        <Settings className="h-5 w-5 mr-2" />
                                        Settings
                                    </Link>
                                )}
                                <button
                                    onClick={() => {
                                        handleLogout();
                                        setIsMobileMenuOpen(false);
                                    }}
                                    className="w-full flex items-center px-3 py-2 mt-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md"
                                >
                                    <LogOut className="h-5 w-5 mr-2" />
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
