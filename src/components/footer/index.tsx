import React from 'react';
import { Twitter, Linkedin, Github, PiggyBank } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
    const year = new Date().getFullYear();

    return (
        <footer className="bg-gray-900 border-t border-gray-800">
            <div className="container mx-auto px-4 py-12">
                {/* Main footer content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Company Info */}
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">
                            <Link to="/" className="flex items-center">
                                <span className="flex items-center text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-500">
                                    <PiggyBank className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
                                    FinanceFlow
                                </span>
                            </Link>
                        </h3>
                        <p className="text-gray-400 mb-4">
                            Streamline your financial operations with our comprehensive loan and expense management platform.
                        </p>
                        <div className="flex space-x-4">
                            <SocialLink href="https://x.com/tswalano" icon={<Twitter className="h-5 w-5" />} />
                            <SocialLink href="https://www.linkedin.com/in/glen-b-mogane-8a0377105" icon={<Linkedin className="h-5 w-5" />} />
                            <SocialLink href="https://github.com/tswalano" icon={<Github className="h-5 w-5" />} />
                        </div>
                    </div>

                    <div></div>

                    {/* Newsletter Subscription */}
                    <div>
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
                    <div className="text-gray-400 text-sm text-center md:text-left">
                        <a
                            href="https://glenify.studio"
                            className="text-emerald-500 hover:text-emerald-400 transition-colors font-semibold"
                        >
                            Glenify Studios
                        </a>{" "}
                        © {year} FinanceFlow. All rights reserved.
                    </div>
                    <div className="flex space-x-6">
                        <FooterButton text="Privacy Policy" />
                        <FooterButton text="Terms of Service" />
                        <FooterButton text="Cookies" />
                    </div>
                </div>
            </div>
        </footer>
    );
};

/* --- Reusable Subcomponents --- */
interface SocialLinkProps {
    href: string;
    icon: React.ReactNode;
}

const SocialLink: React.FC<SocialLinkProps> = ({ href, icon }) => (
    <a href={href} className="text-gray-400 hover:text-emerald-500 transition-colors">
        {icon}
    </a>
);

interface FooterButtonProps {
    text: string;
}

const FooterButton: React.FC<FooterButtonProps> = ({ text }) => (
    <button className="text-gray-400 hover:text-emerald-500 text-sm transition-colors">
        {text}
    </button>
);

export default Footer;
