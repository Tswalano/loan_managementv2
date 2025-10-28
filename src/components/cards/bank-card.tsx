import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CreditCard } from 'lucide-react';

interface BankCardProps {
    accountName: string;
    accountNumber: string;
    bankName: string;
    currentBalance: string;
    onClick: () => void;
}

const BANK_COLORS = {
    'First National Bank': 'from-emerald-500 to-emerald-700',
    'Capitec Bank': 'from-purple-500 to-pink-600',
    'TymeBank': 'from-blue-500 to-indigo-600',
    'ABSA Bank': 'from-red-500 to-red-700',
    'Standard Bank': 'from-blue-600 to-blue-800',
    'Nedbank': 'from-green-600 to-green-800',
    'African Bank': 'from-orange-500 to-red-600',
    'Discovery Bank': 'from-purple-600 to-indigo-700',
} as const;

export const BankCard: React.FC<BankCardProps> = ({
    accountName,
    accountNumber,
    bankName,
    currentBalance,
    onClick
}) => {
    const gradientColor = BANK_COLORS[bankName as keyof typeof BANK_COLORS] || 'from-gray-600 to-gray-800';

    return (
        <Card
            className={cn(
                "relative overflow-hidden h-48",
                "bg-gradient-to-br",
                gradientColor,
                "transition-all duration-300 hover:scale-[1.02]",
                "cursor-pointer"
            )}
            onClick={onClick}
        >
            <div className="absolute top-4 right-4">
                <CreditCard className="h-6 w-6 text-white/80" />
            </div>

            <div className="p-6 flex flex-col h-full justify-between text-white">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold tracking-wide">{accountName}</h3>
                    <p className="text-sm text-white/70">{bankName}</p>
                </div>

                <div className="space-y-4">
                    <div>
                        <p className="text-3xl font-bold tracking-tight">
                            ZAR {parseFloat(currentBalance).toLocaleString('en-ZA')}
                        </p>
                    </div>

                    <p className="font-mono text-sm tracking-widest text-white/90">
                        {accountNumber.replace(/-/g, ' ')}
                    </p>
                </div>

                <div className="absolute bottom-0 right-0 opacity-10 transform translate-x-8 translate-y-8">
                    <CreditCard className="w-48 h-48" />
                </div>
            </div>
        </Card>
    );
};