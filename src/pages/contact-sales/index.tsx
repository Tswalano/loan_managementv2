import React, { useState } from 'react';
import { Mail, Phone, Send, MapPin, Check, MessageSquare, Zap, Clock } from 'lucide-react';
import Footer from '@/components/footer';
import LandingNavbar from '@/components/layout/landing-navbar';

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
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name as keyof FormErrors]) {
            setErrors(prev => ({ ...prev, [name]: undefined }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            setSubmitSuccess(true);
            setTimeout(() => {
                setFormData({ name: '', email: '', subject: '', message: '' });
                setSubmitSuccess(false);
            }, 3000);
        } catch (error) {
            console.error('Error submitting form:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const inputClass = (hasError: boolean) =>
        `w-full px-4 py-3.5 rounded-xl bg-gray-900/60 border ${hasError ? 'border-red-500/70' : 'border-gray-700/60'} text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all duration-200`;

    return (
        <div className="relative min-h-screen bg-gray-950 text-white flex flex-col overflow-x-hidden">

            {/* Fixed background layers */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(16,185,129,0.14)_0%,transparent_55%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(20,184,166,0.10)_0%,transparent_55%)]" />
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                        backgroundSize: '48px 48px',
                    }}
                />
            </div>

            {/* Top hairline */}
            <div className="fixed top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent z-50" />

            {/* Navigation */}
            <LandingNavbar variant="page" />

            {/* Main Content */}
            <main className="relative z-10 flex-1 py-16 md:py-24">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">

                        {/* Header */}
                        <div className="text-center mb-16">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium mb-8">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                                </span>
                                We typically respond within 24 hours
                            </div>

                            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6">
                                <span className="text-white">Get In </span>
                                <span className="bg-gradient-to-r from-emerald-400 via-emerald-300 to-teal-400 bg-clip-text text-transparent">Touch</span>
                            </h1>
                            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                                Have questions about FinanceFlow? We're here to help you manage your finances better.
                            </p>
                        </div>

                        {/* Quick stats row */}
                        <div className="grid grid-cols-3 gap-4 mb-12 max-w-2xl mx-auto">
                            {[
                                { icon: Clock, label: '&lt; 24h', sub: 'Response time' },
                                { icon: MessageSquare, label: '5★', sub: 'Support rating' },
                                { icon: Zap, label: '24/7', sub: 'Available' },
                            ].map(({ icon: Icon, label, sub }) => (
                                <div key={sub} className="flex flex-col items-center gap-1 p-4 rounded-2xl bg-gray-900/50 border border-gray-700/50">
                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-1">
                                        <Icon className="w-4 h-4 text-emerald-400" />
                                    </div>
                                    <span
                                        className="text-base font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent"
                                        dangerouslySetInnerHTML={{ __html: label }}
                                    />
                                    <span className="text-xs text-gray-500">{sub}</span>
                                </div>
                            ))}
                        </div>

                        {/* Section divider */}
                        <div className="h-px bg-gradient-to-r from-transparent via-gray-700/60 to-transparent mb-12" />

                        {/* Form and Contact Info Container */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                            {/* Contact Information Card */}
                            <div className="lg:col-span-1">
                                <div className="rounded-3xl p-8 h-full bg-gray-900/70 border border-gray-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative overflow-hidden">
                                    {/* Subtle glow */}
                                    <div className="absolute top-0 left-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
                                    <div className="absolute bottom-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none" />

                                    <div className="relative z-10">
                                        <h2 className="text-2xl font-bold text-white mb-2">
                                            Contact Information
                                        </h2>
                                        <p className="text-gray-400 mb-10 leading-relaxed text-sm">
                                            Reach out to us for support, inquiries, or just to say hello!
                                        </p>

                                        <div className="space-y-6">
                                            {[
                                                { icon: Phone, label: 'Phone', value: '+27 61 726 2421' },
                                                { icon: Mail, label: 'Email', value: 'financeflow@glenify.studio' },
                                                { icon: MapPin, label: 'Location', value: 'Remote, South Africa' },
                                            ].map(({ icon: Icon, label, value }) => (
                                                <div key={label} className="flex items-start gap-4">
                                                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                        <Icon className="w-4 h-4 text-emerald-400" />
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">{label}</div>
                                                        <div className="text-sm font-semibold text-gray-200">{value}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Divider */}
                                        <div className="h-px bg-gradient-to-r from-transparent via-gray-700/60 to-transparent my-8" />

                                        {/* Social proof / tagline */}
                                        <div className="rounded-2xl bg-emerald-500/5 border border-emerald-500/15 p-5">
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                "FinanceFlow transformed how we manage our lending operations. Support was outstanding from day one."
                                            </p>
                                            <div className="mt-4 flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-xs font-bold text-white">
                                                    TM
                                                </div>
                                                <div>
                                                    <div className="text-xs font-semibold text-gray-300">Thabo M.</div>
                                                    <div className="text-xs text-gray-500">Finance Manager</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form Card */}
                            <div className="lg:col-span-2">
                                <div className="rounded-3xl p-8 md:p-10 bg-gray-900/70 border border-gray-700/60 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                                    <h3 className="text-lg font-semibold text-white mb-6">Send us a message</h3>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        {/* Success Message */}
                                        {submitSuccess && (
                                            <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center flex-shrink-0">
                                                    <Check className="w-4 h-4 text-emerald-400" />
                                                </div>
                                                <p className="text-emerald-300 text-sm font-medium">
                                                    Message sent successfully! We'll get back to you soon.
                                                </p>
                                            </div>
                                        )}

                                        {/* Name + Email row */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                            <div>
                                                <label htmlFor="name" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                    Your Name
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    className={inputClass(!!errors.name)}
                                                    placeholder="John Doe"
                                                />
                                                {errors.name && (
                                                    <p className="mt-1.5 text-xs text-red-400">{errors.name}</p>
                                                )}
                                            </div>
                                            <div>
                                                <label htmlFor="email" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                    Your Email
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    className={inputClass(!!errors.email)}
                                                    placeholder="john@example.com"
                                                />
                                                {errors.email && (
                                                    <p className="mt-1.5 text-xs text-red-400">{errors.email}</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Subject Field */}
                                        <div>
                                            <label htmlFor="subject" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                Subject
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className={inputClass(!!errors.subject)}
                                                placeholder="How can we help you?"
                                            />
                                            {errors.subject && (
                                                <p className="mt-1.5 text-xs text-red-400">{errors.subject}</p>
                                            )}
                                        </div>

                                        {/* Message Field */}
                                        <div>
                                            <label htmlFor="message" className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={6}
                                                className={`${inputClass(!!errors.message)} resize-none`}
                                                placeholder="Write your message here..."
                                            />
                                            {errors.message && (
                                                <p className="mt-1.5 text-xs text-red-400">{errors.message}</p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || submitSuccess}
                                                className="w-full px-8 py-4 rounded-xl font-semibold text-base bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white shadow-[0_0_24px_rgba(16,185,129,0.3)] hover:shadow-[0_0_36px_rgba(16,185,129,0.45)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
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
