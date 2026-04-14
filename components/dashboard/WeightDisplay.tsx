"use client";

import { WeightUnit, formatWeight } from "../../lib/utils/weight";

interface WeightDisplayProps {
    weightKg: number;
    unit: WeightUnit;
    className?: string;
    showSecondary?: boolean;
    size?: "sm" | "md" | "lg" | "xl";
}

export function WeightDisplay({ 
    weightKg, 
    unit, 
    className = "", 
    showSecondary = true,
    size = "md" 
}: WeightDisplayProps) {
    const { primary, secondary } = formatWeight(weightKg, unit);

    const sizeClasses = {
        sm: { primary: "text-sm", secondary: "text-[10px]" },
        md: { primary: "text-base", secondary: "text-xs" },
        lg: { primary: "text-2xl", secondary: "text-sm" },
        xl: { primary: "text-5xl", secondary: "text-lg" }
    };

    const currentSize = sizeClasses[size];

    return (
        <div className={`flex flex-col ${className}`}>
            <span className={`font-black tracking-tight text-slate-900 dark:text-white ${currentSize.primary}`}>
                {primary}
            </span>
            {showSecondary && (
                <span className={`font-bold text-slate-400 dark:text-slate-500 italic ${currentSize.secondary}`}>
                    ({secondary})
                </span>
            )}
        </div>
    );
}
