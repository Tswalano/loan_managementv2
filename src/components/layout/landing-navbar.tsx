import { PiggyBank } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
    { href: '/#features', label: 'Features' },
    { href: '/#metrics', label: 'Why Us' },
    { href: '/contact-sales', label: 'Contact Sales' },
];

interface LandingNavbarProps {
    /** Show section anchor links (landing) vs "Back to home" ghost link (inner pages) */
    variant?: 'landing' | 'page';
}

export default function LandingNavbar({ variant = 'landing' }: LandingNavbarProps) {
    const navigate = useNavigate();
    const location = useLocation();

    const isActiveLink = (href: string) => {
        if (href === '/contact-sales') {
            return location.pathname === '/contact-sales';
        }
        return location.pathname === href;
    };

    return (
        <nav className="sticky top-0 z-40 w-full px-4 pt-5 pb-3">
            <div className="mx-auto max-w-7xl">
                <div className={cn(
                    'flex items-center justify-between',
                    'rounded-[26px] px-5 py-3',
                    'bg-gray-900/80 backdrop-blur-xl',
                    'border border-gray-700/60',
                    'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
                    variant === 'page' && 'bg-gray-900/85',
                )}>
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                            <PiggyBank className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-extrabold text-white">FinanceFlow</span>
                    </Link>

                    {/* Center: anchor links (landing) */}
                    <div className="hidden md:flex items-center gap-3 text-sm font-medium">
                        {NAV_LINKS.map(({ href, label }) => (
                            <Link
                                key={href}
                                to={href}
                                className={cn(
                                    'rounded-xl px-4 py-2 transition-all duration-200',
                                    isActiveLink(href)
                                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                        : 'text-gray-400 hover:text-emerald-400 hover:bg-gray-800/60'
                                )}
                            >
                                {label}
                            </Link>
                        ))}
                    </div>

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        <Link
                            to="/"
                            className={cn(
                                'hidden sm:block px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
                                location.pathname === '/'
                                    ? 'bg-gray-800/70 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-gray-800/60'
                            )}
                        >
                            Home
                        </Link>
                        <button
                            onClick={() => navigate('/app/login')}
                            className="px-4 py-2 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-lg shadow-emerald-500/20 transition-all duration-200"
                        >
                            Sign in
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
}
