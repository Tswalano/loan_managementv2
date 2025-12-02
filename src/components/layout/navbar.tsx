// src/components/layout/navbar.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
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
    Menu,
    X,
    LogOut,
    UserCircle,
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../theme-toggle';
import { clearAuth } from '@/lib/auth';
import api from '@/lib/api';

const navigation = [
    { name: 'Dashboard', href: '/app', icon: LayoutDashboard },
    { name: 'Loans', href: '/app/loans', icon: PiggyBank },
    { name: 'Transactions', href: '/app/transactions', icon: Receipt },
    { name: 'Stokvel', href: '/app/stokvel', icon: Receipt },
    { name: 'Bank Accounts', href: '/app/bank-accounts', icon: Banknote },
];

export default function Navbar() {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const isActive = (path: string) => location.pathname === path;

    const handleLogout = async () => {
        await clearAuth();
        await api.logout()

        navigate('/app/login');

    }

    return (
        <nav className="sticky top-0 pt-4 z-50 backdrop-blur-xl shadow-sm">
            <div className="container mx-auto px-4">
                {/* Outer glass container */}
                <div className="mt-4 mb-3 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/60 dark:bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/40 px-5 py-3 shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all">
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
                            {navigation.map((item) => (
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
                                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full hover:bg-emerald-50/70 dark:hover:bg-emerald-900/30 text-gray-700 dark:text-gray-200 transition-colors"
                                    >
                                        <UserCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                                        <span>Admin</span>
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent
                                    align="end"
                                    className="w-56 bg-white/80 dark:bg-gray-900/90 backdrop-blur border border-gray-200 dark:border-gray-700 shadow-lg rounded-xl"
                                >
                                    <DropdownMenuLabel className="text-gray-700 dark:text-gray-300">
                                        My Account
                                    </DropdownMenuLabel>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem asChild>
                                        <Link
                                            to="/app/settings"
                                            className="flex items-center text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400"
                                        >
                                            <Settings className="h-5 w-5 mr-2" />
                                            Settings
                                        </Link>
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                        onClick={handleLogout}
                                        className="text-red-600 dark:text-red-400 cursor-pointer"
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Log out
                                    </DropdownMenuItem>
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
                            {navigation.map((item) => (
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
                                <Link
                                    to="/app/settings"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-400 rounded-md"
                                >
                                    <Settings className="h-5 w-5 mr-2" />
                                    Settings
                                </Link>
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
