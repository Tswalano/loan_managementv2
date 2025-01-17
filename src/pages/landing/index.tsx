import React from 'react';
import { Download, Mail, Wallet, ArrowUpDown, LineChart, Shield, Star } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Footer from '@/components/footer';

// Interface definitions
interface Feature {
    icon: React.ReactNode;
    title: string;
    description: string;
}

interface FeatureCardProps extends Feature { }

interface MetricCardProps {
    number: string;
    label: string;
}

// Constants
const features: Feature[] = [
    {
        icon: <Download className="w-8 h-8" />,
        title: "Automated Reports",
        description: "Generate and download comprehensive transaction reports with a single click."
    },
    {
        icon: <ArrowUpDown className="w-8 h-8" />,
        title: "Transaction Management",
        description: "Easily track and manage all your financial transactions in one place."
    },
    {
        icon: <Wallet className="w-8 h-8" />,
        title: "Multi-Source Balance",
        description: "Connect and monitor balances from different accounts and sources."
    },
    {
        icon: <Mail className="w-8 h-8" />,
        title: "Monthly Reports",
        description: "Receive automated monthly reports summarizing your financial activity."
    },
    {
        icon: <LineChart className="w-8 h-8" />,
        title: "Trend Analysis",
        description: "Visualize spending patterns and identify trends with interactive charts."
    },
    {
        icon: <Shield className="w-8 h-8" />,
        title: "Enterprise Security",
        description: "Bank-level encryption and security features to protect your data."
    }
];

// Component definitions
const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => {
    return (
        <div className="p-8 bg-white dark:bg-gray-900 rounded-2xl">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                {title}
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
                {description}
            </p>
        </div>
    );
};

const MetricCard: React.FC<MetricCardProps> = ({ number, label }) => {
    return (
        <div>
            <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
                {number}
            </div>
            <div className="text-gray-600 dark:text-gray-300">
                {label}
            </div>
        </div>
    );
};

const LandingPage: React.FC = () => {
    const renderStars = (count: number): React.ReactNode[] => {
        return Array.from({ length: count }, (_, index) => (
            <Star key={index} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        ));
    };

    const handleStartTrial = (): void => {
        // Add trial start logic here
        console.log('Starting free trial');
    };

    const handleContactSales = (): void => {
        // Add contact sales logic here
        console.log('Contacting sales');
    };

    const handleWatchVideo = (): void => {
        // Add video playback logic here
        console.log('Playing video');
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Navigation */}
            <nav className="border-b border-gray-200 dark:border-gray-800 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-emerald-600">FinanceFlow</div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <button
                                onClick={handleStartTrial}
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg"
                            >
                                Get started
                            </button>
                            {/* Theme Toggle */}
                            <div className="">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <header className="relative pt-16 md:pt-24 pb-36">
                <div className="container mx-auto px-4">
                    {/* Small badge */}
                    <div className="flex justify-center mb-8">
                        <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                            <span className="text-emerald-600 dark:text-emerald-400">New features available</span>
                            <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-medium">
                                New
                            </span>
                        </div>
                    </div>

                    <div className="text-center max-w-4xl mx-auto">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white mb-6">
                            Streamline Your Financial Operations with Our SaaS Solution
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
                            Manage loans, track expenses, and gain insights with our comprehensive financial management platform. Perfect for businesses of all sizes.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                            <button
                                onClick={handleStartTrial}
                                className="px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors text-lg"
                            >
                                Start free trial
                            </button>
                            <button
                                onClick={handleWatchVideo}
                                className="px-8 py-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors text-lg inline-flex items-center"
                            >
                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Watch video
                            </button>
                        </div>

                        {/* Trust badges */}
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-2 mb-4">
                                {renderStars(5)}
                                <span className="text-gray-600 dark:text-gray-400">5.0</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Trusted by over 1000+ companies worldwide
                            </p>
                        </div>
                    </div>
                </div>

                {/* Dashboard Preview */}
                <div className="container mx-auto px-4 mt-16">
                    <div className="relative">
                        <div className="w-full h-[780px] rounded-lg overflow-hidden">
                            <img
                                src="/dashboard_mockup.svg"
                                alt="Dashboard preview"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="py-24 bg-gray-50 dark:bg-gray-800">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                            Everything you need to manage your finances
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-300">
                            Powerful features to help you track, manage, and grow your business
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {/* Metrics Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                                Trusted by businesses worldwide
                            </h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                Our platform helps businesses manage their finances more effectively, leading to better outcomes and growth.
                            </p>
                            <div className="grid grid-cols-2 gap-8">
                                <MetricCard number="10k+" label="Active users" />
                                <MetricCard number="500+" label="Enterprise clients" />
                                <MetricCard number="98%" label="Satisfaction rate" />
                                <MetricCard number="24/7" label="Support available" />
                            </div>
                        </div>
                        <div className="relative">
                            <div className="w-full h-[480px] rounded-2xl overflow-hidden">
                                <img
                                    src="/table-professor.svg"
                                    alt="Platform statistics"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-emerald-600 dark:bg-emerald-900">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <h2 className="text-3xl font-bold text-white mb-6">
                            Start your free trial today
                        </h2>
                        <p className="text-lg text-emerald-100 mb-8">
                            Join thousands of satisfied users who have transformed their financial management with our platform.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={handleStartTrial}
                                className="px-8 py-4 bg-white text-emerald-600 rounded-lg font-medium transition-colors hover:bg-emerald-50"
                            >
                                Start free trial
                            </button>
                            <button
                                onClick={handleContactSales}
                                className="px-8 py-4 border border-white text-white hover:bg-emerald-700 rounded-lg font-medium transition-colors"
                            >
                                Contact sales
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default LandingPage;