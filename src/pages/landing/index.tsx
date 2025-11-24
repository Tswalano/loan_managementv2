import React from 'react';
import { PiggyBank } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Footer from '@/components/footer';
import { useTheme } from '@/components/theme-provider';
import { Link, useNavigate } from 'react-router-dom';

interface MetricCardProps {
    number: string;
    label: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ number, label }) => (
    <div>
        <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mb-1">{number}</div>
        <div className="text-sm text-gray-600 dark:text-gray-300">{label}</div>
    </div>
);

const LandingPage: React.FC = () => {
    const { theme } = useTheme();
    const navigate = useNavigate();

    const handleStart = () => (window.location.href = '/app');
    const handlePreview = () => navigate('/preview');

    return (
        <div className="min-h-screen bg-white dark:bg-gray-950">
            <nav className="sticky top-0 z-40">
                <div className="mx-auto max-w-7xl px-4">
                    <div className="mt-6 mb-4 rounded-2xl border border-gray-200/60 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur supports-[backdrop-filter]:bg-white/40 px-5 py-3 shadow-sm">
                        <div className="flex items-center justify-between">
                            {/* Left: Brand */}
                            <Link to="/" className="flex items-center font-extrabold text-xl text-gray-900 dark:text-white">
                                <PiggyBank className="h-6 w-6 text-emerald-600 dark:text-emerald-400 mr-2" />
                                FinanceFlow
                            </Link>

                            {/* Center: Links */}
                            <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                                <a href="#features" className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400">Features</a>
                                <a href="#metrics" className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400">Why Us</a>
                                <a href="#pricing" className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400">Pricing</a>
                                <a href="#testimonials" className="text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400">Testimonials</a>
                            </div>

                            {/* Right: Auth + Theme */}
                            <div className="flex items-center gap-3">
                                <Link to="/app/login" className="hidden sm:inline text-sm font-medium text-gray-800 dark:text-gray-100 hover:text-emerald-600 dark:hover:text-emerald-400">Login</Link>
                                <Link
                                    to="/signup"
                                    className="inline-flex items-center text-sm font-semibold rounded-full px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow-md"
                                >
                                    Sign Up
                                </Link>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <header className="relative overflow-hidden">
                {/* Soft radial gradient like TaskHarbor */}
                <div aria-hidden className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[700px] w-[900px] rounded-full blur-3xl opacity-60
                          bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))]
                          from-emerald-300/30 via-emerald-200/20 to-transparent dark:from-emerald-500/20 dark:via-teal-500/10" />
                </div>

                <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-10 md:pt-24 md:pb-24">
                    {/* Badge */}
                    <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-emerald-500/20 bg-white/70 dark:bg-white/5 backdrop-blur px-3 py-1 text-xs text-gray-700 dark:text-gray-200">
                        <span className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">New</span>
                        We’ve just released a new feature
                        <span className="ml-1">→</span>
                    </div>

                    {/* Headline */}
                    <div className="text-center mx-auto max-w-4xl">
                        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-[1.1]">
                            Boost Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">Productivity</span>,<br className="hidden md:block" />
                            Simplify Your Finance
                        </h1>
                        <p className="mt-5 text-base md:text-lg text-gray-600 dark:text-gray-300">
                            We simplify the intricacies of your financial operations with a user-friendly platform
                            that not only manages your tasks effortlessly but also enhances overall efficiency.
                        </p>

                        {/* CTAs */}
                        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={handleStart}
                                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg"
                            >
                                Get Started
                            </button>
                            <button
                                onClick={handlePreview}
                                className="inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold border border-emerald-400/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50/60 dark:hover:bg-emerald-900/20"
                            >
                                Preview Platform
                            </button>
                        </div>
                    </div>

                    {/* Dashboard mock card */}
                    <div className="relative mt-14 md:mt-20">
                        {/* glowing ring */}
                        <div aria-hidden className="absolute -inset-8 md:-inset-12 rounded-[28px] bg-gradient-to-b from-emerald-200/40 to-transparent dark:from-emerald-500/15 blur-2xl" />
                        <div className="relative rounded-3xl border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur shadow-2xl overflow-hidden">
                            <img
                                src={theme === 'dark' ? '/dashboard-light.png' : '/dashboard.png'}
                                alt="FinanceFlow preview"
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    </div>
                </div>
            </header>

            <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/40">
                <div className="max-w-7xl mx-auto px-4">
                    {/* Section Header */}
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <div className="inline-flex items-center justify-center mb-4 px-4 py-1 rounded-full bg-white border border-gray-200/70 dark:border-white/10 text-gray-700 dark:text-gray-300 text-sm font-medium">
                            Features
                        </div>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4">
                            Boost productivity with our
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500">
                                user-friendly Finance App.
                            </span>
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Embrace efficiency with the intuitive design of our tools — making productivity and
                            financial management a seamless part of your daily routine.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Card 1 */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                            <div className="p-6 flex flex-col items-center text-center">
                                <img src="/feature-tasks.svg" alt="Prioritization" className="w-48 h-32 object-contain mb-6" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Automate Reports
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Generate and download comprehensive transaction reports with a single click.
                                </p>
                            </div>
                        </div>

                        {/* Card 2 */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                            <div className="p-6 flex flex-col items-center text-center">
                                <img src="/feature-goals.svg" alt="Goal Achievement" className="w-48 h-32 object-contain mb-6" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Transaction Management
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Track and manage all your financial transactions in one place.
                                </p>
                            </div>
                        </div>

                        {/* Card 3 */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                            <div className="p-6 flex flex-col items-center text-center">
                                <img src="/feature-progress.svg" alt="Progress Tracker" className="w-48 h-32 object-contain mb-6" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Multi-Source Balance
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Connect and monitor balances from different accounts and sources.
                                </p>
                            </div>
                        </div>

                        {/* Card 4 */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                            <div className="p-6 flex flex-col items-center text-center">
                                <img src="/feature-projects.svg" alt="Projects" className="w-48 h-32 object-contain mb-6" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Enterprise Security
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Bank-level encryption and security features to protect your data.
                                </p>
                            </div>
                        </div>

                        {/* Card 5 */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                            <div className="p-6 flex flex-col items-center text-center">
                                <img src="/feature-insights.svg" alt="Insights" className="w-48 h-32 object-contain mb-6" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Trend Analysis
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Visualize spending patterns and identify trends with interactive charts.
                                </p>
                            </div>
                        </div>

                        {/* Card 6 */}
                        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md transition-all">
                            <div className="p-6 flex flex-col items-center text-center">
                                <img src="/feature-security.svg" alt="Security" className="w-48 h-32 object-contain mb-6" />
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    Enterprise Security
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-300">
                                    Bank-level encryption and security features to protect your data.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* -------------------------------- Metrics ------------------------------- */}
            <section id="metrics" className="py-20 md:py-24">
                <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
                    <div>
                        <h3 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4">Trusted by businesses worldwide</h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-8">
                            FinanceFlow helps teams manage finances effectively, leading to better outcomes and sustainable growth.
                        </p>
                        <div className="grid grid-cols-2 gap-8">
                            <MetricCard number="10k+" label="Active users" />
                            <MetricCard number="500+" label="Enterprise clients" />
                            <MetricCard number="98%" label="Satisfaction rate" />
                            <MetricCard number="24/7" label="Support available" />
                        </div>
                    </div>
                    <div className="relative">
                        <div className="rounded-3xl overflow-hidden border border-gray-200/70 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur shadow-xl">
                            <img src="/table-professor.svg" alt="Platform statistics" className="w-full h-[420px] object-cover" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --------------------------------- CTA --------------------------------- */}
            <section className="py-20 md:py-24 relative overflow-hidden">
                <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-emerald-600 to-teal-600" />
                <div className="relative mx-auto max-w-7xl px-4">
                    <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur px-6 md:px-12 py-12 md:py-16 text-center text-white shadow-2xl">
                        <h3 className="text-3xl md:text-4xl font-extrabold mb-4">Start your free trial today</h3>
                        <p className="text-emerald-100 mb-8 max-w-2xl mx-auto">
                            Join thousands who have transformed their financial management with FinanceFlow.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button onClick={handleStart} className="rounded-full px-7 py-3 font-semibold bg-white text-emerald-700 hover:bg-emerald-50">
                                Start free trial
                            </button>
                            <Link
                                to="/contact-sales"
                                className="rounded-full px-7 py-3 font-semibold border border-white/60 hover:bg-white/10"
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
