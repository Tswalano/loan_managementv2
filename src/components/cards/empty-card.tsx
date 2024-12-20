import React from 'react';
import { Plus } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';

interface NoLoansCardProps {
    title: string;
    message: string;
    onCreate: () => void;
}

const EmptyMessageCard: React.FC<NoLoansCardProps> = ({ onCreate, message, title }) => {
    return (
        <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 bg-white dark:bg-gray-800">
                <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/20 p-3 mb-4">
                    <Plus className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {`No ${title} created yet`}
                </h3>
                <p className="text-gray-500 dark:text-gray-400 text-center max-w-sm mb-4">
                    {message}
                </p>
                <Button
                    onClick={onCreate}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    {`Create Your ${title}`}
                </Button>
            </CardContent>
        </Card>
    );
};

export default EmptyMessageCard;