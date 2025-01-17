import React from 'react';
import { Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';

const Footer: React.FC = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 border-t border-gray-800">
            <div className="container mx-auto px-4 py-12">
                {/* Main footer content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">FinanceFlow</h3>
                        <p className="text-gray-400 mb-4">
                            Streamline your financial operations with our comprehensive loan and expense management platform.
                        </p>
                        <div className="flex space-x-4">
                            <SocialLink href="#" icon={<Twitter className="h-5 w-5" />} />
                            <SocialLink href="#" icon={<Facebook className="h-5 w-5" />} />
                            <SocialLink href="#" icon={<Instagram className="h-5 w-5" />} />
                            <SocialLink href="#" icon={<Linkedin className="h-5 w-5" />} />
                            <SocialLink href="#" icon={<Github className="h-5 w-5" />} />
                        </div>
                    </div>

                    {/* Resources */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Resources</h4>
                        <ul className="space-y-3">
                            <FooterLink href="#" text="Documentation" />
                            <FooterLink href="#" text="API Reference" />
                            <FooterLink href="#" text="Guides" />
                            <FooterLink href="#" text="Customer Stories" />
                        </ul>
                    </div>

                    {/* Company */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Company</h4>
                        <ul className="space-y-3">
                            <FooterLink href="#" text="About Us" />
                            <FooterLink href="#" text="Careers" />
                            <FooterLink href="#" text="Blog" />
                            <FooterLink href="#" text="Press" />
                        </ul>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="text-white font-semibold mb-4">Legal</h4>
                        <ul className="space-y-3">
                            <FooterLink href="#" text="Terms of Service" />
                            <FooterLink href="#" text="Privacy Policy" />
                            <FooterLink href="#" text="Security" />
                            <FooterLink href="#" text="Compliance" />
                        </ul>
                    </div>
                </div>

                {/* Newsletter Subscription */}
                <div className="border-t border-gray-800 pt-8 mb-8">
                    <div className="max-w-xl">
                        <h4 className="text-white font-semibold mb-4">Stay up to date</h4>
                        <div className="flex gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-300 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                            />
                            <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors">
                                Subscribe
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
                <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                    <div className="text-gray-400 text-sm">
                        <a href="https://glenify.studio" className="text-emerald-500 hover:text-emerald-400 transition-colors">
                            <span className="font-semibold">Glenify Studios</span>
                        </a>  © {year} FinanceFlow. All rights reserved.
                    </div>
                    <div className="flex space-x-6">
                        <button className="text-gray-400 hover:text-emerald-500 text-sm">
                            Privacy Policy
                        </button>
                        <button className="text-gray-400 hover:text-emerald-500 text-sm">
                            Terms of Service
                        </button>
                        <button className="text-gray-400 hover:text-emerald-500 text-sm">
                            Cookies
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
};

interface SocialLinkProps {
    href: string;
    icon: React.ReactNode;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, icon }) => {
    return (
        <a
            href={href}
            className="text-gray-400 hover:text-emerald-500 transition-colors"
        >
            {icon}
        </a>
    );
};

interface FooterLinkProps {
    href: string;
    text: string;
}

const FooterLink: React.FC<FooterLinkProps> = ({ href, text }) => {
    return (
        <li>
            <a
                href={href}
                className="text-gray-400 hover:text-emerald-500 transition-colors"
            >
                {text}
            </a>
        </li>
    );
};

export default Footer;