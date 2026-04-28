"use client";

import { useState, useEffect } from "react";
import { Theme } from "@/components/theme/ThemeProvider";
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar, 
    Sun, 
    Moon, 
    Monitor,
    Menu,
    Search,
    Bell,
    LogOut,
    User as UserIcon,
    Sparkles,
    Loader2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMounted } from "../../lib/hooks/useMounted";
import { useUserProfile } from "../../hooks/useUserProfile";
import { useAuth } from "../../hooks/useAuth";
import CalendarModal from "./CalendarModal";

interface HeaderProps {
    toggleMobileMenu?: () => void;
    viewMode?: "day" | "week";
    setViewMode?: (mode: "day" | "week") => void;
    selectedDate?: Date | { start: Date; end: Date | null };
    onDateChange?: (date: Date | { start: Date; end: Date }) => void;
    theme: Theme | undefined;
    onThemeChange: (theme: Theme) => void;
    isProcessing?: boolean;
    title?: string;
}

export default function Header({ 
    toggleMobileMenu, 
    viewMode, 
    setViewMode, 
    selectedDate, 
    onDateChange,
    theme,
    onThemeChange,
    isProcessing,
    title
}: HeaderProps) {
    const mounted = useMounted();
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const { profile } = useUserProfile();
    const { logout } = useAuth();

    if (!mounted) return null;


    const handleLogout = async () => {
        await logout();
        window.location.href = "/";
    };

    const formatDate = (d?: Date | { start: Date; end: Date | null }) => {
        if (!mounted || !d) return "";
        if (d instanceof Date) {

            return d.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });
        } else {
            const startStr = d.start.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
            if (!d.end || d.end.getTime() === d.start.getTime()) {
                return startStr;
            }
            const endStr = d.end.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
            return `${startStr} - ${endStr}`;
        }
    };

    const isToday = (d: Date | { start: Date; end: Date | null }) => {
        const dateToCheck = d instanceof Date ? d : d.start;
        const today = new Date();
        return dateToCheck.getDate() === today.getDate() && 
               dateToCheck.getMonth() === today.getMonth() && 
               dateToCheck.getFullYear() === today.getFullYear();
    };

    const nextDate = () => {
        if (isProcessing || !selectedDate || !onDateChange) return;
        if (viewMode === "day") {
            const current = selectedDate instanceof Date ? selectedDate : selectedDate.start;
            const next = new Date(current);
            next.setDate(next.getDate() + 1);
            onDateChange(next);
        } else {
            const start = selectedDate instanceof Date ? selectedDate : selectedDate.start;
            const end = selectedDate instanceof Date ? selectedDate : (selectedDate.end || selectedDate.start);
            const nextStart = new Date(start);
            const nextEnd = new Date(end);
            nextStart.setDate(nextStart.getDate() + 7);
            nextEnd.setDate(nextEnd.getDate() + 7);
            onDateChange({ start: nextStart, end: nextEnd });
        }
    };


    const prevDate = () => {
        if (isProcessing || !selectedDate || !onDateChange) return;
        if (viewMode === "day") {
            const current = selectedDate instanceof Date ? selectedDate : selectedDate.start;
            const prev = new Date(current);
            prev.setDate(prev.getDate() - 1);
            onDateChange(prev);
        } else {
            const start = selectedDate instanceof Date ? selectedDate : selectedDate.start;
            const end = selectedDate instanceof Date ? selectedDate : (selectedDate.end || selectedDate.start);
            const prevStart = new Date(start);
            const prevEnd = new Date(end);
            prevStart.setDate(prevStart.getDate() - 7);
            prevEnd.setDate(prevEnd.getDate() - 7);
            onDateChange({ start: prevStart, end: prevEnd });
        }
    };


    return (
        <header className="sticky top-0 z-40 w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 h-16 flex items-center justify-between transition-colors">
            <div className="flex items-center space-x-4">
                {title && (
                    <div className="hidden lg:flex items-center space-x-2 mr-4 border-r border-slate-200 dark:border-slate-800 pr-4">
                        <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{title}</span>
                    </div>
                )}
                <button 
                    onClick={toggleMobileMenu}
                    className="p-2 lg:hidden rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                >
                    <Menu size={20} />
                </button>
                
                {viewMode && setViewMode && (
                    <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                        <button 
                            onClick={() => setViewMode("day")}
                            disabled={isProcessing}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
                                viewMode === "day" 
                                    ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50"
                            }`}
                        >
                            Day
                        </button>
                        <button 
                            onClick={() => setViewMode("week")}
                            disabled={isProcessing}
                            className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all duration-200 ${
                                viewMode === "week" 
                                    ? "bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm" 
                                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 disabled:opacity-50"
                            }`}
                        >
                            Week
                        </button>
                    </div>
                )}

                {selectedDate && onDateChange && (
                    <div className="relative">
                        <button 
                            onClick={() => !isProcessing && setIsCalendarOpen(true)}
                            className="p-2 bg-slate-100 dark:bg-slate-800 text-emerald-500 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/30 transition-all border border-transparent hover:border-emerald-200 dark:hover:border-emerald-800 shadow-sm"
                            title="Open Calendar"
                        >
                            <Calendar size={18} />
                        </button>

                        <CalendarModal 
                            isOpen={isCalendarOpen} 
                            onClose={() => setIsCalendarOpen(false)} 
                            currentDate={selectedDate instanceof Date ? selectedDate : selectedDate.start}
                            onSelectDate={(d) => {
                                if (d instanceof Date) {
                                    onDateChange({ start: d, end: d });
                                } else {
                                    onDateChange(d);
                                }
                            }}
                            viewMode={viewMode || "day"}
                        />
                    </div>
                )}

                {selectedDate && (
                    <div className="hidden md:flex items-center space-x-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-2 py-1 rounded-xl">
                        <button 
                            onClick={prevDate}
                            disabled={isProcessing}
                            className="p-1 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors disabled:opacity-50"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button 
                            onClick={() => !isProcessing && setIsCalendarOpen(true)}
                            className="flex items-center space-x-3 px-3 py-1 text-[10px] font-black min-w-[160px] justify-center hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer uppercase tracking-[0.15em] border-x border-slate-100 dark:border-slate-800/50"
                        >
                            {isProcessing ? (
                                <Loader2 size={14} className="animate-spin text-emerald-500" />
                            ) : (
                                <Calendar size={14} className="text-emerald-500" />
                            )}
                            <span>{formatDate(selectedDate)}</span>
                            {mounted && isToday(selectedDate) && (
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            )}
                        </button>
                        <button 
                            onClick={nextDate}
                            disabled={isProcessing}
                            className="p-1 text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-colors disabled:opacity-50"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}

            </div>

            <div className="flex items-center space-x-3">
                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block mx-1"></div>

                <AnimatePresence mode="wait">
                    {mounted && profile ? (
                        <motion.div 
                            key="user"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="hidden sm:flex flex-col items-end mr-1"
                        >
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Performance Hub</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">{profile.fullName || "Elite User"}</span>
                        </motion.div>
                    ) : (
                        <div className="hidden sm:flex flex-col items-end mr-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Session</span>
                            <span className="text-xs font-black text-slate-800 dark:text-slate-100 uppercase tracking-tight">Guest</span>
                        </div>
                    )}
                </AnimatePresence>

                <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    <button 
                        onClick={() => onThemeChange("light")}
                        className={`p-1.5 rounded-lg transition-all ${
                            theme === "light" 
                                ? "bg-white dark:bg-slate-700 text-yellow-500 shadow-sm" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                        title="Light Mode"
                    >
                        <Sun size={18} />
                    </button>
                    <button 
                        onClick={() => onThemeChange("dark")}
                        className={`p-1.5 rounded-lg transition-all ${
                            theme === "dark" 
                                ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-purple-400 shadow-sm" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                        title="Dark Mode"
                    >
                        <Moon size={18} />
                    </button>
                    <button 
                        onClick={() => onThemeChange("system")}
                        className={`p-1.5 rounded-lg transition-all ${
                            theme === "system" 
                                ? "bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-400 shadow-sm" 
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                        title="System Mode"
                    >
                        <Monitor size={18} />
                    </button>
                    
                    <div className="w-px h-4 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    <button className="p-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Notifications">
                        <Bell size={18} />
                    </button>
                    <button 
                        onClick={handleLogout}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

        </header>
    );
}
