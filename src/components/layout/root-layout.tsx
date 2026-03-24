import { Outlet } from 'react-router-dom';
import Navbar from './navbar';
import { MinimumFooter } from '../footer';

export default function RootLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8">
                <Outlet />
            </main>
            <MinimumFooter />
        </div>
    );
}
