"use client";

import { useTheme } from "../../../../components/ThemeProvider";
import Header from "../../../../components/dashboard/Header";
import ClientOnly from "../../../../components/common/ClientOnly";
import { usePrimaryDiet } from "../../../../lib/hooks/usePrimaryDiet";
import { AVAILABLE_DIETS } from "../../../../lib/constants/diets";
import { Check, Target } from "lucide-react";
import { motion } from "framer-motion";
import * as Icons from "lucide-react";
import { PrimaryDiet } from "../../../../types/diet";

const getIcon = (iconName: string | undefined): React.FC<any> => {
    if (!iconName) return Target;
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Target;
};

function DietCard({ diet, isSelected, onSelect }: { diet: PrimaryDiet; isSelected: boolean; onSelect: () => void }) {
    const Icon = getIcon(diet.iconName);
    
    return (
        <motion.div 
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={`
                relative p-6 rounded-2xl border-2 transition-all cursor-pointer shadow-sm
                flex items-center bg-white dark:bg-slate-900 overflow-hidden
                ${isSelected ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10 shadow-lg shadow-emerald-500/10" : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md"}
            `}
        >
            <div className={`p-4 rounded-2xl mr-6 flex-shrink-0 text-white shadow-md ${diet.colorClass || 'bg-slate-500'}`}>
                <Icon size={32} />
            </div>
            
            <div className="flex-1">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{diet.label}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">{diet.description}</p>
            </div>

            <div className="ml-4 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isSelected ? "bg-emerald-500 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600"}`}>
                    <Check size={16} strokeWidth={isSelected ? 3 : 2} />
                </div>
            </div>
            
            {isSelected && (
                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-emerald-500" />
            )}
        </motion.div>
    );
}

export default function PrimaryDietPage() {
    const { theme, setTheme } = useTheme();
    const { activeDietId, setDiet, isLoaded } = usePrimaryDiet();

    return (
        <div className="flex flex-col min-w-0 h-full bg-slate-50 dark:bg-slate-900/50">
            <Header theme={theme} onThemeChange={setTheme} />
            
            <ClientOnly 
                fallback={
                    <div className="max-w-4xl mx-auto p-4 sm:p-8 flex items-center justify-center min-h-[50vh]">
                        <div className="animate-pulse bg-slate-200 dark:bg-slate-800 w-32 h-32 rounded-3xl" />
                    </div>
                }
            >
                <div className="max-w-4xl mx-auto p-4 sm:p-8 space-y-8 w-full pb-20">
                    <div className="space-y-4 max-w-2xl">
                        <div className="flex items-center space-x-2 text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
                            <Target size={14} className="text-emerald-500" />
                            <span>Diet & Nutrition</span>
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Primary Diet</h1>
                        <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                            Select your core dietary framework. These massive structural filters are automatically applied instantly across your Meal Planner to ensure complete compliance.
                        </p>
                    </div>

                    {!isLoaded ? (
                        <div className="space-y-4">
                            {[1,2,3,4].map(i => (
                                <div key={i} className="h-28 rounded-2xl bg-slate-200 dark:bg-slate-800/50 animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ staggerChildren: 0.05 }}
                            className="space-y-4 pt-4"
                        >
                            {AVAILABLE_DIETS.map((diet) => (
                                <DietCard 
                                    key={diet.id}
                                    diet={diet}
                                    isSelected={activeDietId === diet.id}
                                    onSelect={() => setDiet(activeDietId === diet.id ? null : diet.id)}
                                />
                            ))}
                        </motion.div>
                    )}
                </div>
            </ClientOnly>
        </div>
    );
}
