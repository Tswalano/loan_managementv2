import React from 'react';
import {
    ArrowRight, TrendingUp, Shield, Zap,
    BarChart3, CreditCard, Lock, LineChart, FileText,
} from 'lucide-react';
import Footer from '@/components/footer';
import LandingNavbar from '@/components/layout/landing-navbar';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

// ─── data ──────────────────────────────────────────────────────────────────

const FEATURES = [
    {
        icon: FileText,
        img: '/automated-reports.png',
        title: 'Automated Reports',
        desc: 'Generate comprehensive transaction reports with a single click — CSV, Excel, or PDF.',
    },
    {
        icon: CreditCard,
        img: '/transaction-management.png',
        title: 'Transaction Management',
        desc: 'Track and categorise every financial transaction across all your accounts.',
    },
    {
        icon: BarChart3,
        img: '/multi-source.png',
        title: 'Multi-Source Balances',
        desc: 'Connect and monitor balances from different banks and funding sources in one view.',
    },
    {
        icon: Lock,
        img: '/security.png',
        title: 'Enterprise Security',
        desc: 'Bank-level encryption with role-based access control for your whole team.',
    },
    {
        icon: LineChart,
        img: '/trend-analytics.png',
        title: 'Trend Analysis',
        desc: 'Visualise spending patterns and identify trends with interactive live charts.',
    },
    {
        icon: TrendingUp,
        img: '/realtime-insight.png',
        title: 'Real-time Insights',
        desc: 'Instant visibility into your financial health — no refresh needed.',
    },
];

const HERO_FEATURES = [
    { icon: TrendingUp, label: 'Real-time analytics', desc: 'Live dashboards with loan and transaction insights' },
    { icon: Shield, label: 'Secure & private', desc: 'End-to-end encrypted with role-based access control' },
    { icon: Zap, label: 'All-in-one platform', desc: 'Loans and bank accounts in one place' },
];

const METRICS = [
    { number: '10k+', label: 'Active users' },
    { number: '500+', label: 'Enterprise clients' },
    { number: '98%', label: 'Satisfaction rate' },
    { number: '24/7', label: 'Support available' },
];

// ─── component ─────────────────────────────────────────────────────────────

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-gray-950 text-white overflow-x-clip">

            {/* ── Global mesh background ──────────────────────────────────── */}
            <div className="fixed inset-0 pointer-events-none" aria-hidden>
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_rgba(16,185,129,0.13)_0%,_transparent_60%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(20,184,166,0.09)_0%,_transparent_60%)]" />
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: 'linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* ── Top hairline ────────────────────────────────────────────── */}
            <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent z-50" />

            {/* ══ Navbar ══════════════════════════════════════════════════════ */}
            <LandingNavbar variant="landing" />

            {/* ══ Hero ════════════════════════════════════════════════════════ */}
            <header className="relative pt-20 pb-0 md:pt-28">
                <div className="relative mx-auto max-w-7xl px-6">

                    {/* Badge */}
                    <div className="flex justify-center mb-8">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">
                                Lending Management Platform
                            </span>
                        </div>
                    </div>

                    {/* Headline */}
                    <div className="text-center max-w-4xl mx-auto mb-8">
                        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.08] mb-6">
                            Take control of
                            <span className="block bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">
                                your finances
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            Manage loans and bank accounts — all in one powerful dashboard built for teams and individuals.
                        </p>
                    </div>

                    {/* CTAs */}
                    {/*    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
                        <button
                            onClick={() => navigate('/app')}
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-xl shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02]"
                        >
                            Get started
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    <button
                            onClick={() => navigate('/app/login')}
                            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-base font-semibold border border-gray-700 text-gray-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200"
                        >
                            Sign in to dashboard
                        </button> 
                    </div>*/}

                    {/* Feature pills */}
                    <div className="flex flex-wrap justify-center gap-4 mb-20">
                        {HERO_FEATURES.map(({ icon: Icon, label, desc }) => (
                            <div
                                key={label}
                                className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-gray-900/60 border border-gray-700/60 backdrop-blur-sm"
                            >
                                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                    <Icon className="w-4 h-4 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                                    <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Dashboard browser frame */}
                    <div className="relative">
                        {/* Glow */}
                        <div aria-hidden className="absolute -inset-8 rounded-[40px] bg-gradient-to-b from-emerald-500/10 via-emerald-600/5 to-transparent blur-3xl" />

                        <div className="relative rounded-2xl overflow-hidden border border-gray-700/60 bg-gray-900/80 backdrop-blur-sm shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
                            {/* Browser chrome */}
                            <div className="flex items-center gap-1.5 px-4 py-3 border-b border-gray-700/60 bg-gray-900/90">
                                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                                <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
                                <div className="flex-1 mx-4">
                                    <div className="h-6 rounded-md bg-gray-800/80 border border-gray-700/50 flex items-center px-3">
                                        <span className="text-xs text-gray-500 font-mono">financeflow.app/dashboard</span>
                                    </div>
                                </div>
                            </div>
                            <img
                                src="/dashboard.png"
                                alt="FinanceFlow dashboard"
                                className="w-full h-auto object-cover object-top"
                            />
                            {/* Bottom fade */}
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-950 to-transparent" />
                        </div>
                    </div>
                </div>
            </header>

            {/* ══ Features ════════════════════════════════════════════════════ */}
            <section id="features" className="relative py-28">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Section header */}
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Features</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-5">
                            Everything you need to
                            <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                manage finances
                            </span>
                        </h2>
                        <p className="text-gray-400 text-lg leading-relaxed">
                            One platform for loans, transactions, and analytics — built for the way your business works.
                        </p>
                    </div>

                    {/* Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {FEATURES.map((feature, i) => (
                            <div
                                key={i}
                                className={cn(
                                    'group relative rounded-2xl p-6 overflow-hidden',
                                    'bg-gray-900/70 border border-gray-700/60 backdrop-blur-sm',
                                    'hover:border-emerald-500/30 hover:bg-gray-900/90',
                                    'transition-all duration-300 hover:-translate-y-1',
                                    'shadow-[0_4px_20px_rgba(0,0,0,0.3)]',
                                )}
                            >
                                {/* Hover glow */}
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 via-transparent to-teal-500/0 group-hover:from-emerald-500/5 group-hover:to-teal-500/5 transition-all duration-300 rounded-2xl" />

                                <div className="relative z-10 flex flex-col items-center text-center">
                                    {/* Icon */}
                                    <div className="w-11 h-11 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
                                        <feature.icon className="w-5 h-5 text-emerald-400" />
                                    </div>

                                    {/* Image */}
                                    <div className="w-full h-28 flex items-center justify-center mb-5">
                                        <img
                                            src={feature.img}
                                            alt={feature.title}
                                            className="h-full object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-lg"
                                        />
                                    </div>

                                    <h3 className="text-base font-bold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══ Metrics ═════════════════════════════════════════════════════ */}
            <section id="metrics" className="relative py-28">
                {/* Section accent */}
                <div aria-hidden className="absolute left-0 right-0 h-px top-0 bg-gradient-to-r from-transparent via-gray-700/60 to-transparent" />

                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

                    {/* Left: copy + metrics grid */}
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Why FinanceFlow</span>
                        </div>
                        <h3 className="text-4xl md:text-5xl font-extrabold text-white mb-5 leading-tight">
                            Trusted by businesses
                            <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                                worldwide
                            </span>
                        </h3>
                        <p className="text-gray-400 text-lg mb-10 leading-relaxed">
                            FinanceFlow helps teams manage finances effectively, leading to better outcomes and sustainable growth.
                        </p>

                        <div className="grid grid-cols-2 gap-4">
                            {METRICS.map(({ number, label }) => (
                                <div
                                    key={label}
                                    className={cn(
                                        'p-5 rounded-2xl',
                                        'bg-gray-900/70 border border-gray-700/60',
                                        'hover:border-emerald-500/30 transition-all duration-300 hover:-translate-y-0.5',
                                    )}
                                >
                                    <div className="text-3xl font-extrabold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent mb-1">
                                        {number}
                                    </div>
                                    <div className="text-sm text-gray-500 font-medium">{label}</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right: visual */}
                    <div className="relative">
                        <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 rounded-3xl blur-3xl" />
                        <div className="relative rounded-2xl overflow-hidden border border-gray-700/60 bg-gray-900/60 backdrop-blur-sm p-2 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
                            <img
                                src="/automated-reports2.png"
                                alt="Platform statistics"
                                className="w-full object-contain rounded-xl opacity-90"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* ══ CTA ═════════════════════════════════════════════════════════ */}
            <section className="relative py-28 overflow-hidden">
                <div aria-hidden className="absolute left-0 right-0 h-px top-0 bg-gradient-to-r from-transparent via-gray-700/60 to-transparent" />

                {/* Radial glow behind CTA */}
                <div aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[800px] h-[400px] rounded-full bg-emerald-600/10 blur-3xl" />
                </div>

                <div className="relative max-w-4xl mx-auto px-6 text-center">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-8">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest">Get started today</span>
                    </div>

                    <h3 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-6">
                        Ready to transform
                        <span className="block bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                            your finances?
                        </span>
                    </h3>

                    <p className="text-gray-400 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
                        Join thousands who have already transformed their financial management with FinanceFlow.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <button
                            onClick={() => navigate('/app')}
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white shadow-xl shadow-emerald-500/25 transition-all duration-200 hover:scale-[1.02]"
                        >
                            Start free trial
                            <ArrowRight className="w-4 h-4" />
                        </button>
                        <Link
                            to="/contact-sales"
                            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl text-base font-semibold border border-gray-700 text-gray-300 hover:border-emerald-500/50 hover:text-emerald-400 hover:bg-emerald-500/5 transition-all duration-200"
                        >
                            Contact sales
                        </Link>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;
