import { PiggyBank } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
    { href: '#features', label: 'Features' },
    { href: '#metrics', label: 'Why Us' },
    { href: '/contact-sales', label: 'Contact Sales' },
];

interface LandingNavbarProps {
    /** Show section anchor links (landing) vs "Back to home" ghost link (inner pages) */
    variant?: 'landing' | 'page';
}

export default function LandingNavbar({ variant = 'landing' }: LandingNavbarProps) {
    const navigate = useNavigate();

    return (
        <nav className="sticky top-0 z-40 w-full px-4 pt-5 pb-3">
            <div className="mx-auto max-w-7xl">
                <div className={cn(
                    'flex items-center justify-between',
                    'rounded-2xl px-5 py-3',
                    'bg-gray-900/80 backdrop-blur-xl',
                    'border border-gray-700/60',
                    'shadow-[0_8px_32px_rgba(0,0,0,0.4)]',
                )}>
                    {/* Brand */}
                    <Link to="/" className="flex items-center gap-3 group">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-105 transition-transform">
                            <PiggyBank className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-extrabold text-white">FinanceFlow</span>
                    </Link>

                    {/* Center: anchor links (landing) */}
                    {variant === 'landing' && (
                        <div className="hidden md:flex items-center gap-7 text-sm font-medium">
                            {NAV_LINKS.map(({ href, label }) =>
                                href.startsWith('/') ? (
                                    <Link
                                        key={href}
                                        to={href}
                                        className="text-gray-400 hover:text-emerald-400 transition-colors"
                                    >
                                        {label}
                                    </Link>
                                ) : (
                                    <a
                                        key={href}
                                        href={href}
                                        className="text-gray-400 hover:text-emerald-400 transition-colors"
                                    >
                                        {label}
                                    </a>
                                )
                            )}
                        </div>
                    )}

                    {/* Right */}
                    <div className="flex items-center gap-3">
                        {variant === 'page' && (
                            <Link
                                to="/"
                                className="hidden sm:block px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800/60 transition-all duration-200"
                            >
                                Back to home
                            </Link>
                        )}
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
