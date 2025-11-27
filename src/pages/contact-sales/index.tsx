import React, { useState } from 'react';
import { Mail, Phone, Send, MapPin, PiggyBank, Check } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Footer from '@/components/footer';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

interface FormErrors {
    name?: string;
    email?: string;
    subject?: string;
    message?: string;
}

const ContactSalesPage: React.FC = () => {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.trim().length < 10) {
            newErrors.message = 'Message must be at least 10 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({
                ...prev,
                [name]: undefined
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Form submitted:', formData);
            setSubmitSuccess(true);

            setTimeout(() => {
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: ''
                });
                setSubmitSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 dark:from-gray-950 dark:via-gray-900 dark:to-emerald-950 flex flex-col">
            {/* Navigation */}
            <nav className="py-6 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className={cn(
                        "rounded-2xl",
                        "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                        "border border-gray-200/50 dark:border-gray-700/50",
                        "shadow-xl dark:shadow-2xl dark:shadow-black/20",
                        "px-6 py-4"
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
                            <div className="flex items-center gap-4">
                                <a
                                    href="/app"
                                    className={cn(
                                        "px-6 py-2.5 rounded-xl text-sm font-semibold",
                                        "bg-gradient-to-r from-emerald-600 to-emerald-700",
                                        "hover:from-emerald-700 hover:to-emerald-800",
                                        "text-white shadow-lg hover:shadow-xl",
                                        "transition-all duration-300"
                                    )}
                                >
                                    Get started
                                </a>
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-16">
                            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
                                Get In Touch
                            </h1>
                            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Have questions about FinanceFlow? We're here to help you manage your finances better.
                            </p>
                        </div>

                        {/* Form and Contact Info Container */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Contact Information Card */}
                            <div className="lg:col-span-1">
                                <div className={cn(
                                    "rounded-3xl p-10 h-full",
                                    "bg-gradient-to-br from-emerald-600 to-emerald-700",
                                    "shadow-2xl dark:shadow-black/40",
                                    "relative overflow-hidden"
                                )}>
                                    {/* Decorative circles */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/30 rounded-full blur-3xl" />
                                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/30 rounded-full blur-3xl" />

                                    <div className="relative z-10">
                                        <h2 className="text-3xl font-bold text-white mb-4">
                                            Contact Information
                                        </h2>
                                        <p className="text-emerald-100 mb-10 leading-relaxed">
                                            Reach out to us for support, inquiries, or just to say hello!
                                        </p>

                                        <div className="space-y-8">
                                            {/* Phone */}
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                                    <Phone className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-emerald-100 mb-1">Phone</div>
                                                    <div className="text-base font-semibold text-white">+27 61 726 2421</div>
                                                </div>
                                            </div>

                                            {/* Email */}
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                                    <Mail className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-emerald-100 mb-1">Email</div>
                                                    <div className="text-base font-semibold text-white">financeflow@glenify.studio</div>
                                                </div>
                                            </div>

                                            {/* Location */}
                                            <div className="flex items-start gap-4">
                                                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                                                    <MapPin className="w-5 h-5 text-white" />
                                                </div>
                                                <div>
                                                    <div className="text-sm text-emerald-100 mb-1">Location</div>
                                                    <div className="text-base font-semibold text-white">Remote, South Africa</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form Card */}
                            <div className="lg:col-span-2">
                                <div className={cn(
                                    "rounded-3xl p-10",
                                    "backdrop-blur-xl bg-white/80 dark:bg-gray-900/80",
                                    "border border-gray-200/50 dark:border-gray-700/50",
                                    "shadow-2xl dark:shadow-black/40"
                                )}>
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Success Message */}
                                        {submitSuccess && (
                                            <div className={cn(
                                                "p-5 rounded-xl border flex items-center gap-3",
                                                "bg-gradient-to-r from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/10",
                                                "border-emerald-200 dark:border-emerald-800/30"
                                            )}>
                                                <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-5 h-5 text-white" />
                                                </div>
                                                <p className="text-emerald-800 dark:text-emerald-200 font-semibold">
                                                    Message sent successfully! We'll get back to you soon.
                                                </p>
                                            </div>
                                        )}

                                        {/* Name Field */}
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={cn(
                                                    "w-full px-4 py-3.5 rounded-xl",
                                                    "bg-white dark:bg-gray-800/50",
                                                    "text-gray-900 dark:text-white placeholder-gray-400",
                                                    "focus:outline-none focus:ring-2 focus:ring-emerald-500",
                                                    "transition-all duration-200",
                                                    errors.name ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'
                                                )}
                                                placeholder="John Doe"
                                            />
                                            {errors.name && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Your Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={cn(
                                                    "w-full px-4 py-3.5 rounded-xl",
                                                    "bg-white dark:bg-gray-800/50",
                                                    "text-gray-900 dark:text-white placeholder-gray-400",
                                                    "focus:outline-none focus:ring-2 focus:ring-emerald-500",
                                                    "transition-all duration-200",
                                                    errors.email ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'
                                                )}
                                                placeholder="john@example.com"
                                            />
                                            {errors.email && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                            )}
                                        </div>

                                        {/* Subject Field */}
                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className={cn(
                                                    "w-full px-4 py-3.5 rounded-xl",
                                                    "bg-white dark:bg-gray-800/50",
                                                    "text-gray-900 dark:text-white placeholder-gray-400",
                                                    "focus:outline-none focus:ring-2 focus:ring-emerald-500",
                                                    "transition-all duration-200",
                                                    errors.subject ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'
                                                )}
                                                placeholder="How can we help you?"
                                            />
                                            {errors.subject && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
                                            )}
                                        </div>

                                        {/* Message Field */}
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={6}
                                                className={cn(
                                                    "w-full px-4 py-3.5 rounded-xl",
                                                    "bg-white dark:bg-gray-800/50",
                                                    "text-gray-900 dark:text-white placeholder-gray-400",
                                                    "focus:outline-none focus:ring-2 focus:ring-emerald-500",
                                                    "resize-none transition-all duration-200",
                                                    errors.message ? 'border-2 border-red-500' : 'border border-gray-300 dark:border-gray-600'
                                                )}
                                                placeholder="Write your message here..."
                                            />
                                            {errors.message && (
                                                <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="pt-4">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || submitSuccess}
                                                className={cn(
                                                    "w-full px-8 py-4 rounded-xl font-semibold text-base",
                                                    "bg-gradient-to-r from-emerald-600 to-emerald-700",
                                                    "hover:from-emerald-700 hover:to-emerald-800",
                                                    "text-white shadow-lg hover:shadow-xl",
                                                    "transition-all duration-300",
                                                    "disabled:opacity-50 disabled:cursor-not-allowed",
                                                    "flex items-center justify-center gap-2"
                                                )}
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : submitSuccess ? (
                                                    <>
                                                        <Check className="w-5 h-5" />
                                                        Message Sent!
                                                    </>
                                                ) : (
                                                    <>
                                                        Send Message
                                                        <Send className="w-5 h-5" />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ContactSalesPage;