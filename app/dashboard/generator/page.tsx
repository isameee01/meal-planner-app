"use client";

import { useState, useEffect } from "react";
import { 
    Settings2, 
    Clock, 
    Zap, 
    Scale, 
    CloudIcon, 
    Target, 
    DollarSign, 
    Wheat, 
    Calendar, 
    Globe, 
    Flame,
    CheckCircle2,
    Loader2,
    Info,
    ChevronDown,
    Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useGeneratorSettings } from "../../../lib/hooks/useGeneratorSettings";
import { 
    PriceLimit, 
    CarbsType, 
    GeneratorFocus, 
    DayOfWeek, 
    UnitSystem, 
    EnergyUnit 
} from "../../../types/settings";

const TIMEZONES = [
    { label: "(GMT -11:00) Midway Island, Samoa", value: "Pacific/Midway" },
    { label: "(GMT -10:00) Hawaii", value: "Pacific/Honolulu" },
    { label: "(GMT -09:00) Alaska", value: "America/Anchorage" },
    { label: "(GMT -08:00) Pacific Time (US & Canada)", value: "America/Los_Angeles" },
    { label: "(GMT -07:00) Mountain Time (US & Canada)", value: "America/Denver" },
    { label: "(GMT -06:00) Central Time (US & Canada), Mexico City", value: "America/Chicago" },
    { label: "(GMT -05:00) Eastern Time (US & Canada), Bogota, Lima", value: "America/New_York" },
    { label: "(GMT -04:00) Atlantic Time (Canada), Caracas, La Paz", value: "America/Halifax" },
    { label: "(GMT -03:30) Newfoundland", value: "America/St_Johns" },
    { label: "(GMT -03:00) Brazil, Buenos Aires, Georgetown", value: "America/Sao_Paulo" },
    { label: "(GMT -02:00) Mid-Atlantic", value: "Atlantic/South_Georgia" },
    { label: "(GMT -01:00) Azores, Cape Verde Islands", value: "Atlantic/Azores" },
    { label: "(GMT +00:00) Western Europe Time, London, Lisbon, Casablanca", value: "Europe/London" },
    { label: "(GMT +01:00) Brussels, Copenhagen, Madrid, Paris", value: "Europe/Paris" },
    { label: "(GMT +02:00) Kaliningrad, South Africa", value: "Europe/Kaliningrad" },
    { label: "(GMT +03:00) Baghdad, Riyadh, Moscow, St. Petersburg", value: "Europe/Moscow" },
    { label: "(GMT +03:30) Tehran", value: "Asia/Tehran" },
    { label: "(GMT +04:00) Abu Dhabi, Muscat, Baku, Tbilisi", value: "Asia/Dubai" },
    { label: "(GMT +04:30) Kabul", value: "Asia/Kabul" },
    { label: "(GMT +05:00) Ekaterinburg, Islamabad, Karachi, Tashkent", value: "Asia/Karachi" },
    { label: "(GMT +05:30) Bombay, Calcutta, Madras, New Delhi", value: "Asia/Kolkata" },
    { label: "(GMT +05:45) Kathmandu", value: "Asia/Kathmandu" },
    { label: "(GMT +06:00) Almaty, Dhaka, Colombo", value: "Asia/Dhaka" },
    { label: "(GMT +07:00) Bangkok, Hanoi, Jakarta", value: "Asia/Bangkok" },
    { label: "(GMT +08:00) Beijing, Perth, Singapore, Hong Kong", value: "Asia/Singapore" },
    { label: "(GMT +09:00) Tokyo, Seoul, Osaka, Sapporo, Yakutsk", value: "Asia/Tokyo" },
    { label: "(GMT +09:30) Adelaide, Darwin", value: "Australia/Adelaide" },
    { label: "(GMT +10:00) Eastern Australia, Guam, Vladivostok", value: "Australia/Sydney" },
    { label: "(GMT +11:00) Magadan, Solomon Islands, New Caledonia", value: "Asia/Magadan" },
    { label: "(GMT +12:00) Auckland, Wellington, Fiji, Kamchatka", value: "Pacific/Auckland" },
];

const DAYS_OF_WEEK: { label: string; value: DayOfWeek }[] = [
    { label: "Sunday", value: "sunday" },
    { label: "Monday", value: "monday" },
    { label: "Tuesday", value: "tuesday" },
    { label: "Wednesday", value: "wednesday" },
    { label: "Thursday", value: "thursday" },
    { label: "Friday", value: "friday" },
    { label: "Saturday", value: "saturday" },
];

export default function GeneratorSettingsPage() {
    const { settings, updateSettings, status, isLoaded } = useGeneratorSettings();

    if (!isLoaded) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-emerald-500" size={32} />
            </div>
        );
    }

    const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: any, title: string, subtitle: string }) => (
        <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-500 shrink-0">
                <Icon size={24} />
            </div>
            <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">{title}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{subtitle}</p>
            </div>
        </div>
    );

    const ControlWrapper = ({ label, description, children }: { label: string, description: string, children: React.ReactNode }) => (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800 transition-all hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl hover:shadow-slate-200/50 dark:hover:shadow-none hover:border-emerald-100">
            <div className="space-y-1">
                <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{label}</h3>
                <p className="text-xs text-slate-400 font-medium max-w-sm">{description}</p>
            </div>
            <div className="shrink-0">
                {children}
            </div>
        </div>
    );

    const Toggle = ({ active, onToggle }: { active: boolean, onToggle: () => void }) => (
        <button 
            onClick={onToggle}
            className={`relative w-14 h-8 rounded-full transition-all duration-300 ${active ? 'bg-emerald-500 shadow-lg shadow-emerald-200/50 dark:shadow-none' : 'bg-slate-200 dark:bg-slate-700'}`}
        >
            <motion.div 
                animate={{ x: active ? 28 : 4 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
            />
        </button>
    );

    const Select = ({ value, options, onChange }: { value: string, options: { label: string; value: string }[], onChange: (val: any) => void }) => (
        <div className="relative group">
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl px-5 py-2.5 text-xs font-black text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-emerald-500 transition-all cursor-pointer min-w-[160px]"
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none transition-transform group-hover:translate-y-[-40%]" />
        </div>
    );

    const MultiToggle = ({ value, options, onChange }: { value: string, options: { label: string; value: string }[], onChange: (val: any) => void }) => (
        <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        value === opt.value 
                            ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    }`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="flex-1 p-6 lg:p-12 max-w-5xl mx-auto space-y-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                        <Settings2 className="text-emerald-500" size={36} />
                        Generator Engine
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 font-medium italic">Configure the AI brain behind your meal planning experiences.</p>
                </div>

                <div className="flex items-center h-10">
                    <AnimatePresence mode="wait">
                        {status === "saving" && (
                            <motion.div 
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center space-x-2 text-slate-400"
                            >
                                <Loader2 size={16} className="animate-spin" />
                                <span className="text-xs font-black uppercase tracking-widest">Saving...</span>
                            </motion.div>
                        )}
                        {status === "saved" && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center space-x-2 text-emerald-500"
                            >
                                <CheckCircle2 size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Saved ✅</span>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 gap-12">
                
                {/* Section 1: Planner Settings */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <SectionHeader 
                        icon={Zap} 
                        title="Planner Intelligence" 
                    subtitle="Control automation and selection behavior" 
                    />
                    
                    <div className="space-y-4">
                        <ControlWrapper 
                            label="Auto-Weekly Planner" 
                            description="AI will automatically generate a new meal plan for you every week based on your current targets."
                        >
                            <Toggle active={settings.autoPlanner} onToggle={() => updateSettings({ autoPlanner: !settings.autoPlanner })} />
                        </ControlWrapper>

                        <ControlWrapper 
                            label="Budget Sensitivity" 
                            description="Prioritize meals based on estimated ingredient costs."
                        >
                            <Select 
                                value={settings.priceLimit} 
                                options={[
                                    { label: "No Limit", value: "none" },
                                    { label: "Low (Budget)", value: "low" },
                                    { label: "Medium (Balanced)", value: "medium" },
                                    { label: "High (Premium)", value: "high" },
                                ]} 
                                onChange={(val: PriceLimit) => updateSettings({ priceLimit: val })}
                            />
                        </ControlWrapper>

                        <ControlWrapper 
                            label="Generator Focus" 
                            description="Tweak the algorithm to prioritize different success metrics."
                        >
                            <MultiToggle 
                                value={settings.focus} 
                                options={[
                                    { label: "Balanced", value: "balanced" },
                                    { label: "Variety", value: "variety" },
                                    { label: "Strict Macros", value: "macros" },
                                    { label: "Groceries", value: "groceries" },
                                ]} 
                                onChange={(val: GeneratorFocus) => updateSettings({ focus: val })}
                            />
                        </ControlWrapper>

                        <ControlWrapper 
                            label="Allow Half Servings" 
                            description="Allow the generator to suggest 0.5 meal portions to hit exact macro targets."
                        >
                            <Toggle active={settings.allowHalfServings} onToggle={() => updateSettings({ allowHalfServings: !settings.allowHalfServings })} />
                        </ControlWrapper>
                    </div>
                </div>

                {/* Section 2: Nutrition Logic */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <SectionHeader 
                        icon={Wheat} 
                        title="Nutrition Logic" 
                    subtitle="Define how macros and energy are calculated" 
                    />
                    
                    <div className="space-y-4">
                        <ControlWrapper 
                            label="Target Carbohydrates As" 
                            description="Choose whether to track total carbs or Net Carbs (Total - Fiber)."
                        >
                            <MultiToggle 
                                value={settings.carbsType} 
                                options={[
                                    { label: "Total Carbs", value: "total" },
                                    { label: "Net Carbs", value: "net" },
                                ]} 
                                onChange={(val: CarbsType) => updateSettings({ carbsType: val })}
                            />
                        </ControlWrapper>

                        <div className="p-6 bg-amber-50 dark:bg-amber-900/10 rounded-3xl flex items-start gap-4 border border-amber-100 dark:border-amber-900/30">
                            <Info className="text-amber-500 mt-0.5 shrink-0" size={18} />
                            <p className="text-xs font-bold text-amber-800 dark:text-amber-200 leading-relaxed italic uppercase tracking-tight">
                                Note: Changing your carbs calculation type will immediately update your Nutrition Hub and daily targets across the app.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 3: Time & Units */}
                <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 lg:p-10 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800">
                    <SectionHeader 
                        icon={Globe} 
                        title="World & Standards" 
                        subtitle="Localization and preference settings" 
                    />
                    
                    <div className="space-y-4">
                        <ControlWrapper 
                            label="Local Timezone" 
                            description="Determines when your day starts and schedules meals correctly."
                        >
                            <Select 
                                value={settings.timezone} 
                                options={TIMEZONES} 
                                onChange={(val: string) => updateSettings({ timezone: val })}
                            />
                        </ControlWrapper>

                        <ControlWrapper 
                            label="First Day of Week" 
                            description="Sets the starting column in your weekly planner view."
                        >
                            <Select 
                                value={settings.firstDayOfWeek} 
                                options={DAYS_OF_WEEK} 
                                onChange={(val: DayOfWeek) => updateSettings({ firstDayOfWeek: val })}
                            />
                        </ControlWrapper>

                        <ControlWrapper 
                            label="Unit System" 
                            description="Standardize weights (kg/lbs) and measurements (cm/ft)."
                        >
                            <MultiToggle 
                                value={settings.units} 
                                options={[
                                    { label: "U.S. Standard", value: "us" },
                                    { label: "Metric System", value: "metric" },
                                ]} 
                                onChange={(val: UnitSystem) => updateSettings({ units: val })}
                            />
                        </ControlWrapper>

                        <ControlWrapper 
                            label="Energy Unit" 
                            description="Track intake in Calories or Kilojoules."
                        >
                            <MultiToggle 
                                value={settings.energyUnit} 
                                options={[
                                    { label: "Calories (kcal)", value: "kcal" },
                                    { label: "Kilojoules (kJ)", value: "kJ" },
                                ]} 
                                onChange={(val: EnergyUnit) => updateSettings({ energyUnit: val })}
                            />
                        </ControlWrapper>
                    </div>
                </div>
            </div>

            {/* Footer / Global impact note */}
            <div className="p-10 bg-slate-900 dark:bg-black rounded-[40px] text-white relative overflow-hidden">
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center shrink-0">
                        <Activity size={32} />
                    </div>
                    <div className="text-center md:text-left space-y-2">
                        <h4 className="text-xl font-black uppercase italic tracking-tight">Global Synchronization Active</h4>
                        <p className="text-slate-400 text-sm max-w-2xl">
                            Any changes made here are instantly propagated to the meal generator, nutrition hub, and unit conversion engines across the entire SaaS platform.
                        </p>
                    </div>
                </div>
                {/* Decorative backgrounds */}
                <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-emerald-500/10 blur-[100px] rounded-full" />
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Globe size={180} />
                </div>
            </div>
        </div>
    );
}
