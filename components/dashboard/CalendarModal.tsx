"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalendarIcon, ChevronLeft, ChevronRight, Check, AlertCircle, RotateCcw } from "lucide-react";
import { 
    format, 
    addMonths, 
    subMonths, 
    startOfMonth, 
    endOfMonth, 
    startOfWeek, 
    endOfWeek, 
    eachDayOfInterval, 
    isSameDay, 
    isWithinInterval, 
    isToday as isDateToday,
    isBefore,
    isAfter,
    startOfDay
} from "date-fns";

interface CalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelectDate: (date: Date | { start: Date; end: Date }) => void;
    currentDate: Date;
    viewMode: "day" | "week";
}

export default function CalendarModal({ isOpen, onClose, onSelectDate, currentDate, viewMode }: CalendarModalProps) {
    const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(currentDate));
    const [range, setRange] = useState<{ start: Date | null; end: Date | null }>({ start: startOfDay(currentDate), end: null });
    const [currentMonth, setCurrentMonth] = useState(startOfMonth(currentDate));

    useEffect(() => {
        if (isOpen) {
            const today = startOfDay(currentDate);
            setSelectedDate(today);
            
            // Initialize range from props if available
            if (viewMode === "week") {
                // We need to pass the full range object to currentDate or add a new prop
                // For now, let's just initialize with the currentDate as start
                setRange({ start: today, end: null });
            } else {
                setRange({ start: today, end: null });
            }
            
            setCurrentMonth(startOfMonth(currentDate));
        }
    }, [isOpen, currentDate, viewMode]);

    const handleDateClick = (clickedDate: Date) => {
        const date = startOfDay(clickedDate);
        
        if (!range.start || (range.start && range.end)) {
            // First click or reset (3rd click scenario)
            setRange({ start: date, end: null });
        } else {
            // Second click
            let start = range.start;
            let end = date;
            if (isBefore(end, start)) {
                // Auto-correct / swap dates if needed
                [start, end] = [end, start];
            }
            setRange({ start, end });
        }
    };

    const handleReset = () => {
        setRange({ start: null, end: null });
    };

    const handleApply = () => {
        if (range.start && range.end) {
            onSelectDate({ start: range.start, end: range.end });
        } else if (range.start) {
            onSelectDate({ start: range.start, end: range.start });
        }
        onClose();
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    // Calendar grid logic
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 10 }}
                    className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl w-[320px] overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800"
                >
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
                        <div className="flex items-center space-x-2">
                            <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/40 rounded-lg text-emerald-600 dark:text-emerald-400">
                                <CalendarIcon size={16} />
                            </div>
                            <div>
                                <h3 className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest leading-none">
                                    {viewMode === "day" ? "Select Date" : "Select Range"}
                                </h3>
                            </div>
                        </div>
                        <div className="flex items-center space-x-1">
                            {viewMode === "week" && (
                                <button 
                                    onClick={handleReset}
                                    className="p-1.5 text-slate-400 hover:text-emerald-500 transition-colors"
                                    title="Reset Selection"
                                >
                                    <RotateCcw size={16} />
                                </button>
                            )}
                            <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                                <X size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                        <div className="flex items-center justify-between mb-6">
                            <button 
                                onClick={prevMonth}
                                className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-black text-slate-800 dark:text-slate-100 uppercase tracking-widest text-xs">
                                {format(currentMonth, "MMMM yyyy")}
                            </span>
                            <button 
                                onClick={nextMonth}
                                className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>

                        <div className="grid grid-cols-7 gap-1">
                            {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                                <div key={`weekday-${i}`} className="text-center text-[10px] font-black text-slate-300 dark:text-slate-600 mb-2 uppercase tracking-widest">{d}</div>
                            ))}
                            
                            {calendarDays.map((day, idx) => {
                                const isCurrentMonth = isSameDay(startOfMonth(day), currentMonth);
                                const isSelected = (range.start && isSameDay(day, range.start)) || (range.end && isSameDay(day, range.end));
                                
                                const isInRange = range.start && range.end && isWithinInterval(day, { start: range.start, end: range.end });
                                const isRangeStart = range.start && isSameDay(day, range.start);
                                const isRangeEnd = range.end && isSameDay(day, range.end);

                                return (
                                    <button 
                                        key={idx}
                                        onClick={() => handleDateClick(day)}
                                        className={`group relative h-10 w-full rounded-xl text-xs font-black transition-all ${
                                            !isCurrentMonth ? "opacity-20 pointer-events-none" : ""
                                        } ${
                                            isSelected 
                                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-200 dark:shadow-none" 
                                                : isInRange 
                                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" 
                                                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                                        }`}
                                    >
                                        <span className="relative z-10">{format(day, "d")}</span>
                                        {isSelected && (
                                            <motion.div 
                                                layoutId="activeDay"
                                                className="absolute inset-0 bg-emerald-500 rounded-xl"
                                                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                            />
                                        )}
                                        {isDateToday(day) && !isSelected && (
                                            <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-emerald-500 rounded-full" />
                                        )}
                                    </button>
                                );
                            })}
                        </div>

                        {(!range.end && range.start) && (
                            <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 flex items-start space-x-3 text-emerald-600 dark:text-emerald-400">
                                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                                <p className="text-[10px] font-bold leading-relaxed uppercase tracking-wide">Select the end date to complete your custom planning range.</p>
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between sticky bottom-0">
                        <button 
                            onClick={onClose}
                            className="text-[10px] font-black text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-widest px-4"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleApply}
                            disabled={!range.start}
                            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-emerald-200 dark:shadow-none transition-all flex items-center space-x-2"
                        >
                            <span>Apply</span>
                            <Check size={14} strokeWidth={3} />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
