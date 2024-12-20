// src/components/dashboard/MetricCard.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface MetricCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: {
        value: number;
        label: string;
    };
    description?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    icon,
    trend,
    description
}) => (
    <Card className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-200">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">
                {title}
            </CardTitle>
            <div className="h-8 w-8 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                {icon}
            </div>
        </CardHeader>
        <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {value}
            </div>
            {trend && (
                <div className={`flex items-center text-sm ${trend.value > 30 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {trend.value > 30 ? (
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                    ) : (
                        <ArrowDownRight className="h-4 w-4 mr-1" />
                    )}
                    {Math.abs(trend.value)}% {trend.label}
                </div>
            )}
            {description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {description}
                </p>
            )}
        </CardContent>
    </Card>
);
