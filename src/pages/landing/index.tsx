import React from 'react';
import { PiggyBank, ArrowRight } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Footer from '@/components/footer';
import { useTheme } from '@/components/theme-provider';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface MetricCardProps {
    number: string;
    label: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ number, label }) => (
    <div className={cn(
        "p-6 rounded-2xl",
        "backdrop-blur-xl bg-white/80 dark:bg-gray-800/80",
        "border border-gray-200/50 dark:border-gray-700/50",
        "shadow-lg hover:shadow-xl",
        "transition-all duration-300 hover:-translate-y-1"
    )}>
        <div className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-400 dark:to-emerald-500 bg-clip-text text-transparent mb-2">
            {number}
        </div>
        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</div>
    </div>
);

const LandingPage: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleStart = () => navigate('/app');

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950">
            {/* Navigation */}
            <nav className="sticky top-6 z-50 mx-auto max-w-7xl px-4">
                <div className={cn(
                    "rounded-2xl",
                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                    "border border-gray-200/50 dark:border-gray-700/50",
                    "shadow-xl dark:shadow-2xl dark:shadow-black/20",
                    "px-6 py-4"
                )}>
                    <div className="flex items-center justify-between">
                        {/* Left: Brand */}
                        <Link to="/" className="flex items-center font-bold text-xl group">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mr-3 shadow-lg group-hover:scale-110 transition-transform">
                                <PiggyBank className="h-5 w-5 text-white" />
                            </div>
                            <span className="bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                                FinanceFlow
                            </span>
                        </Link>

                        {/* Center: Links */}
                        <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                            <a href="#features" className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                Features
                            </a>
                            <a href="#metrics" className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                Why Us
                            </a>
                            <a href="#pricing" className="text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
                                Pricing
                            </a>
                        </div>

                        {/* Right: Auth + Theme */}
                        <div className="flex items-center gap-4">
                            <Button
                                size="sm"
                                onClick={() => navigate('/app/login')}
                                className="bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                Login
                            </Button>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
                {/* Background gradient */}
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[800px] w-[1000px] rounded-full blur-3xl opacity-40
                          bg-gradient-to-br from-emerald-300/40 via-emerald-200/30 to-transparent 
                          dark:from-emerald-500/30 dark:via-emerald-600/20 dark:to-transparent" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4">
                    {/* Badge */}
                    <div className={cn(
                        "mx-auto mb-6 flex w-fit items-center gap-2 rounded-full",
                        "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                        "border border-emerald-200/50 dark:border-emerald-700/50",
                        "px-4 py-2 text-sm shadow-lg",
                        "group hover:border-emerald-400 dark:hover:border-emerald-500",
                        "transition-all duration-300"
                    )}>
                        <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 px-3 py-1 text-xs font-bold uppercase tracking-wide">
                            New
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">We've just released a new feature</span>
                        <ArrowRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-1 transition-transform" />
                    </div>

                    {/* Headline */}
                    <div className="text-center mx-auto max-w-4xl">
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 dark:text-white leading-[1.1] mb-6">
                            Boost Your{" "}
                            <span className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 bg-clip-text text-transparent">
                                Productivity
                            </span>
                            ,<br className="hidden md:block" />
                            Simplify Your Finance
                        </h1>
                        <p className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            We simplify the intricacies of your financial operations with a user-friendly platform
                            that not only manages your tasks effortlessly but also enhances overall efficiency.
                        </p>

                        {/* CTAs */}
                        {/* <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={handleStart}
                                className={cn(
                                    "inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold",
                                    "bg-gradient-to-r from-emerald-600 to-emerald-700",
                                    "hover:from-emerald-700 hover:to-emerald-800",
                                    "text-white shadow-xl hover:shadow-2xl",
                                    "transition-all duration-300 hover:scale-105"
                                )}
                            >
                                Get Started
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </button>
                            <button
                                onClick={handlePreview}
                                className={cn(
                                    "inline-flex items-center justify-center rounded-xl px-8 py-4 text-base font-semibold",
                                    "backdrop-blur-xl bg-white/80 dark:bg-gray-800/80",
                                    "border-2 border-emerald-500/50 dark:border-emerald-500/30",
                                    "text-emerald-700 dark:text-emerald-400",
                                    "hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
                                    "hover:border-emerald-600 dark:hover:border-emerald-400",
                                    "transition-all duration-300 hover:scale-105"
                                )}
                            >
                                Preview Platform
                            </button>
                        </div> */}
                    </div>

                    {/* Dashboard preview */}
                    <div className="relative mt-20 md:mt-28">
                        {/* Glow effect */}
                        <div aria-hidden className="absolute -inset-12 rounded-[40px] bg-gradient-to-b from-emerald-200/40 via-emerald-300/20 to-transparent dark:from-emerald-500/20 dark:via-emerald-600/10 blur-3xl" />
                        <div className={cn(
                            "relative rounded-3xl overflow-hidden",
                            "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                            "border border-gray-200/50 dark:border-gray-700/50",
                            "shadow-2xl dark:shadow-black/40"
                        )}>
                            <img
                                src={theme === 'dark' ? '/dashboard-light.png' : '/dashboard.png'}
                                alt="FinanceFlow dashboard preview"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section id="features" className="py-24 relative">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <div className={cn(
                            "inline-flex items-center justify-center mb-6 px-5 py-2 rounded-full",
                            "backdrop-blur-xl bg-white/80 dark:bg-gray-800/80",
                            "border border-gray-200/50 dark:border-gray-700/50",
                            "text-gray-700 dark:text-gray-300 text-sm font-semibold shadow-lg"
                        )}>
                            Features
                        </div>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Boost productivity with our
                            <br />
                            <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                user-friendly Finance App
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400">
                            Embrace efficiency with the intuitive design of our tools — making productivity and
                            financial management a seamless part of your daily routine.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                img: '/automated-reports.png',
                                title: 'Automate Reports',
                                desc: 'Generate and download comprehensive transaction reports with a single click.'
                            },
                            {
                                img: '/transaction-management.png',
                                title: 'Transaction Management',
                                desc: 'Track and manage all your financial transactions in one place.'
                            },
                            {
                                img: '/multi-source.png',
                                title: 'Multi-Source Balance',
                                desc: 'Connect and monitor balances from different accounts and sources.'
                            },
                            {
                                img: '/security.png',
                                title: 'Enterprise Security',
                                desc: 'Bank-level encryption and security features to protect your data.'
                            },
                            {
                                img: '/trend-analytics.png',
                                title: 'Trend Analysis',
                                desc: 'Visualize spending patterns and identify trends with interactive charts.'
                            },
                            {
                                img: '/realtime-insight.png',
                                title: 'Real-time Insights',
                                desc: 'Get instant insights into your financial health with live dashboards.'
                            }
                        ].map((feature, idx) => (
                            <div
                                key={idx}
                                className={cn(
                                    "p-8 rounded-3xl",
                                    "backdrop-blur-xl bg-white/80 dark:bg-gray-800/80",
                                    "border border-gray-200/50 dark:border-gray-700/50",
                                    "shadow-lg hover:shadow-2xl dark:hover:shadow-black/40",
                                    "transition-all duration-300 hover:-translate-y-2",
                                    "group"
                                )}
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-6 w-48 h-32 flex items-center justify-center">
                                        <img
                                            src={feature.img}
                                            alt={feature.title}
                                            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                                        />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Metrics Section */}
            <section id="metrics" className="py-24 relative">
                <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h3 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Trusted by businesses worldwide
                        </h3>
                        <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                            FinanceFlow helps teams manage finances effectively, leading to better outcomes and sustainable growth.
                        </p>
                        <div className="grid grid-cols-2 gap-6">
                            <MetricCard number="10k+" label="Active users" />
                            <MetricCard number="500+" label="Enterprise clients" />
                            <MetricCard number="98%" label="Satisfaction rate" />
                            <MetricCard number="24/7" label="Support available" />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-emerald-200/30 to-teal-200/30 dark:from-emerald-800/20 dark:to-teal-800/20 rounded-3xl blur-3xl" />
                        {/* <div className={cn(
                            "relative rounded-3xl overflow-hidden",
                            "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                            "border border-gray-200/50 dark:border-gray-700/50",
                            "shadow-2xl dark:shadow-black/40"
                        )}> */}
                        <img
                            src="/automated-reports2.png"
                            alt="Platform statistics"
                            className="w-full h-[420px] object-contain"
                        />
                        {/* </div> */}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-600" />
                <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/30 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-400/30 rounded-full blur-3xl" />
                </div>
                <div className="relative mx-auto max-w-7xl px-4">
                    <div className={cn(
                        "rounded-3xl p-12 md:p-16 text-center",
                        "backdrop-blur-xl bg-white/10",
                        "border border-white/20",
                        "shadow-2xl"
                    )}>
                        <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                            Start your free trial today
                        </h3>
                        <p className="text-emerald-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                            Join thousands who have transformed their financial management with FinanceFlow.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleStart}
                                className={cn(
                                    "rounded-xl px-8 py-4 font-semibold text-base",
                                    "bg-white text-emerald-700",
                                    "hover:bg-emerald-50",
                                    "shadow-xl hover:shadow-2xl",
                                    "transition-all duration-300 hover:scale-105"
                                )}
                            >
                                Start free trial
                            </button>
                            <Link
                                to="/contact-sales"
                                className={cn(
                                    "rounded-xl px-8 py-4 font-semibold text-base",
                                    "border-2 border-white/60 text-white",
                                    "hover:bg-white/10",
                                    "transition-all duration-300 hover:scale-105"
                                )}
                            >
                                Contact sales
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;