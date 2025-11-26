import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';

interface BankCardProps {
    accountName: string;
    accountNumber: string;
    bankName: string;
    currentBalance: string;
    onClick: () => void;
}

const BANK_COLORS = {
    'First National Bank': 'bg-gradient-to-br from-gray-900 to-black',
    'Capitec Bank': 'bg-gradient-to-br from-gray-900 to-black',
    'TymeBank': 'bg-gradient-to-br from-gray-900 to-black',
    'ABSA Bank': 'bg-gradient-to-br from-gray-900 to-black',
    'Standard Bank': 'bg-gradient-to-br from-gray-900 to-black',
    'Nedbank': 'bg-gradient-to-br from-gray-900 to-black',
    'African Bank': 'bg-gradient-to-br from-gray-900 to-black',
    'Discovery Bank': 'bg-gradient-to-br from-gray-900 to-black',
} as const;

const ACCENT_COLORS = {
    'First National Bank': 'bg-[#C4F546]',
    'Capitec Bank': 'bg-[#C4F546]',
    'TymeBank': 'bg-[#C4F546]',
    'ABSA Bank': 'bg-[#C4F546]',
    'Standard Bank': 'bg-[#C4F546]',
    'Nedbank': 'bg-[#C4F546]',
    'African Bank': 'bg-[#C4F546]',
    'Discovery Bank': 'bg-[#C4F546]',
} as const;

export const BankCard: React.FC<BankCardProps> = ({
    accountName,
    accountNumber,
    bankName,
    currentBalance,
    onClick
}) => {
    const cardColor = BANK_COLORS[bankName as keyof typeof BANK_COLORS] || 'bg-gradient-to-br from-gray-900 to-black';
    const accentColor = ACCENT_COLORS[bankName as keyof typeof ACCENT_COLORS] || 'bg-[#C4F546]';
    const isAccentCard = parseFloat(currentBalance) > 5000; // Use accent color for high balance cards

    return (
        <Card
            className={cn(
                "relative overflow-hidden h-48 border-0 shadow-lg",
                isAccentCard ? accentColor : cardColor,
                "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                "cursor-pointer rounded-2xl"
            )}
            onClick={onClick}
        >
            <div className="absolute top-4 right-4">
                <button className={cn(
                    "p-1 rounded-full transition-colors",
                    isAccentCard ? "hover:bg-black/10" : "hover:bg-white/10"
                )}>
                    <MoreVertical className={cn(
                        "h-5 w-5",
                        isAccentCard ? "text-black/60" : "text-white/80"
                    )} />
                </button>
            </div>

            <div className="p-6 flex flex-col h-full justify-between">
                <div className="space-y-1">
                    <h3 className={cn(
                        "text-sm font-medium",
                        isAccentCard ? "text-black/60" : "text-white/60"
                    )}>
                        {accountName}
                    </h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className={cn(
                            "text-3xl font-bold tracking-tight",
                            isAccentCard ? "text-black" : "text-white"
                        )}>
                            ${parseFloat(currentBalance).toLocaleString('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                            })}
                        </p>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className={cn(
                            "font-mono text-sm tracking-wider",
                            isAccentCard ? "text-black/70" : "text-white/70"
                        )}>
                            •••• {accountNumber ? accountNumber.slice(-4) : '4576'}
                        </p>
                        <p className={cn(
                            "font-mono text-sm",
                            isAccentCard ? "text-black/70" : "text-white/70"
                        )}>
                            10/24
                        </p>
                        <div className="flex items-center gap-1">
                            <div className={cn(
                                "w-6 h-6 rounded-full",
                                isAccentCard ? "bg-black/20" : "bg-white/20"
                            )}></div>
                            <div className={cn(
                                "w-6 h-6 rounded-full -ml-3",
                                isAccentCard ? "bg-black/40" : "bg-white/40"
                            )}></div>
                        </div>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5"></div>
            </div>
        </Card>
    );
};