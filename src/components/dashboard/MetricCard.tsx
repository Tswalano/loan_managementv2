import React from 'react';
import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
        value: number;
        label: string;
        isPositive?: boolean;
    };
    description?: string;
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    icon,
    trend,
    description,
    className
}) => {
    return (
        <Card className={cn(
            "relative overflow-hidden backdrop-blur-xl",
            "bg-white/80 dark:bg-gray-900/80",
            "border border-gray-200/50 dark:border-gray-700/50",
            "rounded-2xl shadow-xl dark:shadow-2xl dark:shadow-black/20",
            "p-6 hover:shadow-2xl dark:hover:shadow-black/40",
            "transition-all duration-300 hover:-translate-y-1",
            "group",
            className
        )}>
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-gray-100/20 dark:to-gray-800/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Content */}
            <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="w-11 h-11 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl flex items-center justify-center shadow-inner">
                                {icon}
                            </div>
                        )}
                    </div>
                    {trend && (
                        <div className={cn(
                            "flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold",
                            trend.isPositive !== false
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
                        )}>
                            {trend.isPositive !== false ? (
                                <TrendingUp className="h-3 w-3" />
                            ) : (
                                <TrendingDown className="h-3 w-3" />
                            )}
                            {trend.value}%
                        </div>
                    )}
                </div>

                <div className="space-y-1 mb-3">
                    <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</h3>
                    <p className="text-3xl font-bold bg-gradient-to-br from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                        {value}
                    </p>
                </div>

                {(trend || description) && (
                    <div className="flex items-center gap-2 text-sm">
                        {trend && (
                            <span className={cn(
                                "font-medium",
                                trend.isPositive !== false
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-red-600 dark:text-red-400"
                            )}>
                                {trend.label}
                            </span>
                        )}
                        {description && (
                            <span className="text-gray-500 dark:text-gray-400">
                                {description}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Decorative elements */}
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-gradient-to-br from-[#C4F546]/10 to-transparent dark:from-[#C4F546]/5 rounded-full blur-2xl" />
        </Card>
    );
};