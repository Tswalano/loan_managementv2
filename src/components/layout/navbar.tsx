// src/components/layout/navbar.tsx
import { Link, useLocation } from 'react-router-dom';
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
    UserCircle
} from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '../theme-toggle';
// import { supabase } from '@/lib/supabase';

const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Loans', href: '/loans', icon: PiggyBank },
    { name: 'Transactions', href: '/transactions', icon: Receipt },
    { name: 'Bank Accounts', href: '/bank-accounts', icon: Banknote },
];

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const handleLogout = async () => {
        // const { error } = await supabase.auth.signOut();
        // if (error) {
        //     console.error('Error during logout:', error.message);
        // } else {
            window.location.href = '/login';
        // }
    };

    return (
        <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="flex h-16 justify-between items-center">
                    {/* Logo and Desktop Navigation */}
                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0">
                            <span className="flex items-center text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                                <PiggyBank className="h-6 w-6 mr-2" />
                                Loan Tracker
                            </span>
                        </div>
                        <div className="hidden md:flex md:space-x-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive(item.href)
                                            ? 'text-emerald-600 dark:text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                                            : 'text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 dark:text-gray-300 dark:hover:text-emerald-500 dark:hover:bg-emerald-900/20'
                                        }`}
                                >
                                    <item.icon className="h-4 w-4 mr-2" />
                                    {item.name}
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Right side buttons */}
                    <div className="flex items-center gap-2">
                        <ThemeToggle />

                        {/* User Menu Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative gap-2 hidden md:flex hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:hover:bg-emerald-900 dark:hover:text-emerald-50"
                                >
                                    <UserCircle className="h-5 w-5" />
                                    <span className=''>Admin</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                    <Settings className="h-4 w-4 mr-2" />
                                    Settings
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    className="text-red-600 dark:text-red-400"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="h-4 w-4 mr-2" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Separate Logout Button for smaller screens */}
                        <Button
                            onClick={handleLogout}
                            variant="ghost"
                            className="gap-2 md:hidden text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                        >
                            <LogOut className="h-5 w-5" />
                        </Button>

                        {/* Mobile menu button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="md:hidden"
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Mobile menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden border-t border-gray-200 dark:border-gray-700">
                        <div className="space-y-1 px-2 py-3">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    className={`flex items-center px-3 py-2 rounded-md text-base font-medium transition-colors ${isActive(item.href)
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-500'
                                            : 'text-gray-600 hover:bg-emerald-50 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-emerald-900/20 dark:hover:text-emerald-500'
                                        }`}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                >
                                    <item.icon className="h-5 w-5 mr-3" />
                                    {item.name}
                                </Link>
                            ))}

                            <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-gray-600 dark:text-gray-300"
                                >
                                    <Settings className="h-5 w-5 mr-3" />
                                    Settings
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}