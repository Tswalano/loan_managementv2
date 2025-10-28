import React, { useState } from 'react';
import { Mail, Phone, Send, MapPin, PiggyBank } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import Footer from '@/components/footer';
import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';

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
    // const navigate = useNavigate();
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
        // Clear error for this field when user starts typing
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

        // Simulate API call
        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Form submitted:', formData);
            setSubmitSuccess(true);

            // Reset form after 3 seconds
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

    // const handleGoBack = () => {
    //     navigate(-1);
    // };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
            {/* Navigation */}
            <nav className="border-b border-gray-200 dark:border-gray-800 py-4">
                <div className="container mx-auto px-4">
                    <div className="flex justify-between items-center">
                        <div className="text-2xl font-bold text-emerald-600">
                            <div className="flex-shrink-0">
                                <Link to="/" className="flex items-center text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                                    <PiggyBank className="h-6 w-6 mr-2" />
                                    FinanceFlow
                                </Link>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <a
                                href="/app"
                                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                            >
                                Get started
                            </a>
                            {/* Theme Toggle */}
                            <div className="">
                                <ThemeToggle />
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 py-12 md:py-20 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
                <div className="container mx-auto px-4">
                    <div className="max-w-6xl mx-auto">
                        {/* Header */}
                        <div className="text-center mb-12">
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                                Get In Touch
                            </h1>
                            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                                Have questions about FinanceFlow? We're here to help you manage your finances better.
                            </p>
                        </div>

                        {/* Form and Contact Info Container */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Contact Information Card */}
                            <div className="lg:col-span-1">
                                <div className="bg-emerald-600 dark:bg-emerald-700 rounded-2xl p-8 text-white h-full shadow-xl">
                                    <h2 className="text-2xl font-bold mb-4">
                                        Contact Information
                                    </h2>
                                    <p className="text-emerald-100 mb-8">
                                        Reach out to us for support, inquiries, or just to say hello!
                                    </p>

                                    <div className="space-y-6">
                                        {/* Phone */}
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium mb-1">+27 61 726 2421</div>
                                            </div>
                                        </div>

                                        {/* Email */}
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <Mail className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">financeflow@glenify.studio</div>
                                            </div>
                                        </div>

                                        {/* Location */}
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0">
                                                <MapPin className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-medium">Remote, South Africa</div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Decorative Circle */}
                                    <div className="mt-12 relative">
                                        <div className="w-40 h-40 bg-emerald-500/30 rounded-full blur-3xl"></div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form Card */}
                            <div className="lg:col-span-2">
                                <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 md:p-10">
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Success Message */}
                                        {submitSuccess && (
                                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg">
                                                <p className="text-emerald-800 dark:text-emerald-200 font-medium text-center">
                                                    ✓ Message sent successfully! We'll get back to you soon.
                                                </p>
                                            </div>
                                        )}

                                        {/* Name Field */}
                                        <div>
                                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Your Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                                    }`}
                                                placeholder="John Doe"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                                            )}
                                        </div>

                                        {/* Email Field */}
                                        <div>
                                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Your Email
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.email ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                                    }`}
                                                placeholder="john@example.com"
                                            />
                                            {errors.email && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                                            )}
                                        </div>

                                        {/* Subject Field */}
                                        <div>
                                            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Your Subject
                                            </label>
                                            <input
                                                type="text"
                                                id="subject"
                                                name="subject"
                                                value={formData.subject}
                                                onChange={handleChange}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors ${errors.subject ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                                    }`}
                                                placeholder="How can we help you?"
                                            />
                                            {errors.subject && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subject}</p>
                                            )}
                                        </div>

                                        {/* Message Field */}
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Message
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                rows={6}
                                                className={`w-full px-4 py-3 border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none transition-colors ${errors.message ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
                                                    }`}
                                                placeholder="Write here your message"
                                            />
                                            {errors.message && (
                                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.message}</p>
                                            )}
                                        </div>

                                        {/* Submit Button */}
                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting || submitSuccess}
                                                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                            >
                                                {isSubmitting ? (
                                                    <>
                                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                        Sending...
                                                    </>
                                                ) : submitSuccess ? (
                                                    'Message Sent!'
                                                ) : (
                                                    <>
                                                        Send Message
                                                        <Send className="w-4 h-4" />
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