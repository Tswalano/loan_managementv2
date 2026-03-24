import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AccessDeniedProps {
    title?: string;
    description?: string;
}

export function AccessDenied({
    title = 'Access Denied',
    description = 'You do not have permission to open this page or perform this action in the current organization.',
}: AccessDeniedProps) {
    return (
        <div className="container mx-auto max-w-4xl py-10">
            <Card className={cn(
                'backdrop-blur-xl bg-white/85 dark:bg-gray-900/85',
                'border border-gray-200/50 dark:border-gray-700/50',
                'rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-black/20'
            )}>
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-lg">
                        <ShieldAlert className="h-10 w-10" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
                    <p className="mt-3 max-w-xl text-sm text-gray-600 dark:text-gray-300">
                        {description}
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
