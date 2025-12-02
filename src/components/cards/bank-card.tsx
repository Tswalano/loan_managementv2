import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MoreVertical } from 'lucide-react';
import { formatCurrency } from '@/types';
import { maskAccountLast8Grouped } from '@/lib/utils/formatters';

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

// Bank Logo Components
const FNBLogo = () => (
    <div className="flex items-center gap-2">
        <img src="/fnb.png" alt="FNB Logo" className="h-10 object-contain" />
    </div>
);

const CapitecLogo = () => (
    <div className="flex items-center gap-2">
        <img src="/capitec-logo.png" alt="Capitec Logo" className="h-6 object-contain" />
    </div>
);

const TymeBankLogo = () => (
    <div className="flex items-center gap-2">
        <img src="/tymebank.png" alt="TymeBank Logo" className="h-8 object-contain" />
    </div>
);

const ABSALogo = () => (
    <div className="flex items-center gap-2">
        <img src="/absa.png" alt="ABSA Logo" className="h-10 object-contain" />
    </div>
);

const StandardBankLogo = () => (
    <div className="flex items-center gap-2">
        <img src="/standard-bank.png" alt="Standard Bank Logo" className="h-8 object-contain" />
    </div>
);

const NedbankLogo = () => (
    <div className="flex items-center gap-2">
        <img src="/nedbank.png" alt="Nedbank Logo" className="h-10 object-contain" />
    </div>
);

const AfricanBankLogo = () => (
    <div className="flex items-center gap-2">
        <img src="/african-bank.png" alt="African Bank Logo" className="h-6 object-contain" />
    </div>
);

const DiscoveryBankLogo = () => (
    <div className="flex items-center gap-2">
        <img src="/discovery-bank.png" alt="Discovery Bank Logo" className="h-10 object-contain" />
    </div>
);

const BankLogo: React.FC<{ bankName: string }> = ({ bankName }) => {
    switch (bankName) {
        case 'First National Bank':
            return <FNBLogo />;
        case 'Capitec Bank':
            return <CapitecLogo />;
        case 'TymeBank':
            return <TymeBankLogo />;
        case 'ABSA Bank':
            return <ABSALogo />;
        case 'Standard Bank':
            return <StandardBankLogo />;
        case 'Nedbank':
            return <NedbankLogo />;
        case 'African Bank':
            return <AfricanBankLogo />;
        case 'Discovery Bank':
            return <DiscoveryBankLogo />;
        default:
            return <span className="text-white font-bold text-lg">{bankName}</span>;
    }
};

export const BankCard: React.FC<BankCardProps> = ({
    accountName,
    accountNumber,
    bankName,
    currentBalance,
    onClick
}) => {
    const cardColor = BANK_COLORS[bankName as keyof typeof BANK_COLORS] || 'bg-gradient-to-br from-gray-900 to-black';

    return (
        <Card
            className={cn(
                "relative overflow-hidden h-60 border-0 shadow-lg",
                cardColor,
                "transition-all duration-300 hover:scale-[1.02] hover:shadow-xl",
                "cursor-pointer rounded-2xl"
            )}
            onClick={onClick}
        >
            <div className="absolute top-4 right-4">
                <button className="p-1 rounded-full transition-colors hover:bg-white/10">
                    <MoreVertical className="h-5 w-5 text-white/80" />
                </button>
            </div>

            <div className="p-6 flex flex-col h-full justify-between">
                <div className="space-y-3">
                    <BankLogo bankName={bankName} />
                    <h3 className="text-sm font-medium text-white/60">
                        {accountName}
                    </h3>
                </div>

                <div className="space-y-6">
                    <div>
                        <p className="text-3xl font-bold tracking-tight text-white">
                            {formatCurrency(parseFloat(currentBalance))}
                        </p>

                    </div>

                    <div className="flex items-center justify-between">
                        <p className="font-mono text-sm tracking-wider text-white/70">
                            {accountNumber ? maskAccountLast8Grouped(accountNumber) : '3636-3333-3333-3333'}
                        </p>
                        <p className="font-mono text-sm text-white/70">
                            10/24
                        </p>
                        <div className="flex items-center gap-1">
                            <div className="w-6 h-6 rounded-full bg-white/20"></div>
                            <div className="w-6 h-6 rounded-full -ml-3 bg-white/40"></div>
                        </div>

                    </div>
                    <div>
                        <p className="text-xs font-medium text-white/50 uppercase tracking-wide">
                            John Doe
                        </p>
                    </div>
                </div>

                {/* Decorative circles */}
                <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/5"></div>
                <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-white/5"></div>
            </div>
        </Card>
    );
};