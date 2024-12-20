import { Button } from '@/components/ui/button';
import { Balance } from '@/types';
import { Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils/formatters';

interface CardDeckProps {
    balances: Balance[];
    onCreateBalance: () => Promise<void>;
}

function getCardColor(type: 'CASH' | 'BANK' | 'MOBILE_MONEY' | 'LOAN_RECEIVABLE') {
    switch (type) {
        case 'BANK':
            return {
                background: 'bg-gradient-to-br from-blue-600 to-blue-800',
                textColor: 'text-white',
                gradientOverlay: 'bg-white/10'
            };
        case 'CASH':
            return {
                background: 'bg-gradient-to-br from-emerald-600 to-emerald-800',
                textColor: 'text-white',
                gradientOverlay: 'bg-white/10'
            };
        case 'MOBILE_MONEY':
            return {
                background: 'bg-gradient-to-br from-purple-600 to-purple-800',
                textColor: 'text-white',
                gradientOverlay: 'bg-white/10'
            };
        case 'LOAN_RECEIVABLE':
            return {
                background: 'bg-gradient-to-br from-orange-600 to-orange-800',
                textColor: 'text-white',
                gradientOverlay: 'bg-white/10'
            };
        default:
            return {
                background: 'bg-gradient-to-br from-gray-600 to-gray-800',
                textColor: 'text-white',
                gradientOverlay: 'bg-white/10'
            };
    }
}

export const CardDeck: React.FC<CardDeckProps> = ({ balances, onCreateBalance }) => {
    // const [activeCard, setActiveCard] = useState(0);

    return (
        <div className="w-full space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center px-4">
                <h2 className="text-xl font-semibold">My Cards</h2>
                {/* Only show navigation dots if there are more than 3 cards */}
                {/* {hasMultipleCards && ( */}
                <div className="flex gap-1">
                    {balances.map((_, index) => (
                        <button
                            key={index}
                            className="w-2 h-2 rounded-full transition-colors duration-200"
                        />
                    ))}
                </div>
                {/* )} */}
            </div>

            {/* Cards Container */}
            <div className={`relative h-56 w-full`}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Add New Card */}
                    <div className="relative w-full transition-all duration-300">
                        <Button
                            variant="outline"
                            onClick={onCreateBalance}
                            className="w-full h-48 border-2 border-dashed rounded-2xl flex items-center justify-center bg-gray-100 text-black text-base"
                        >
                            Add New Card
                            <Plus className="h-6 w-6" />
                        </Button>
                    </div>

                    {/* Balance Cards */}
                    {balances.map((balance) => {
                        const cardStyle = getCardColor(balance.type);
                        return (
                            <div
                                key={balance.id}
                                className="w-full transition-all duration-300 transform"
                            >
                                <div className={`h-48 rounded-2xl ${cardStyle.background} p-6 shadow-lg`}>
                                    <div className="flex flex-col h-full justify-between">
                                        <div>
                                            <p className="text-lg font-medium text-white/90">VISA</p>
                                            <p className="text-sm font-mono text-white/90">
                                                {balance.bankName}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-2xl font-semibold text-white mb-2">
                                                {formatCurrency(parseFloat(balance.currentBalance))}
                                            </p>
                                            <p className="text-sm text-white/70">
                                                **** **** **** {balance.accountReference.slice(-4)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};