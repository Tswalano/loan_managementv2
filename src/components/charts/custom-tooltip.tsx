interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{
        name: string;
        value: number;
    }>;
}

export function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white dark:bg-gray-800 p-2 border rounded-lg shadow-lg">
                <p className="text-sm">{`${payload[0].name}: ${payload[0].value}`}</p>
            </div>
        );
    }
    return null;
}