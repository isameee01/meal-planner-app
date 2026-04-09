"use client";

import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Hash, Clock, Info, Layout, Trash2, Edit3, CheckCircle2 } from "lucide-react";
import { SavedPlan } from "../../types/saved-plans";
import { format } from "date-fns";

interface SavedPlanModalProps {
    plan: SavedPlan;
    onClose: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

export default function SavedPlanModal({ plan, onClose, onEdit, onDelete }: SavedPlanModalProps) {
    // Prevent background scroll
    useEffect(() => {
        document.body.style.overflow = "hidden";
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        window.addEventListener("keydown", handleEsc);
        return () => {
            document.body.style.overflow = "auto";
            window.removeEventListener("keydown", handleEsc);
        };
    }, [onClose]);

    const stopPropagation = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
    }, []);

    const createdDate = new Date(plan.createdAt);

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm cursor-pointer"
            />

            {/* Modal Content */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={stopPropagation}
                className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl flex flex-col max-h-[85vh] overflow-hidden border border-slate-200 dark:border-slate-800"
            >
                {/* Header Decoration */}
                <div className="relative h-32 w-full bg-gradient-to-br from-emerald-500 to-teal-400 flex-shrink-0">
                    <div className="absolute inset-0 opacity-10 flex flex-wrap gap-4 p-4 overflow-hidden pointer-events-none">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <Layout key={i} size={48} />
                        ))}
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 bg-white/20 hover:bg-white/40 text-white rounded-full transition-all backdrop-blur-md"
                    >
                        <X size={20} />
                    </button>

                    <div className="absolute -bottom-8 left-8 p-6 bg-white dark:bg-slate-900 rounded-[2rem] shadow-xl border border-slate-100 dark:border-slate-800">
                        <Calendar size={32} className="text-emerald-500" />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto pt-16 p-8 space-y-8 scrollbar-hide">
                    <div className="space-y-2">
                        <div className="flex items-center gap-3">
                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">{plan.title}</h2>
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1.5"><Clock size={12} /> Created {format(createdDate, "MMM d, yyyy")}</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="flex items-center gap-1.5 underline decoration-emerald-500 decoration-2">{plan.days} Days Selection</span>
                        </div>
                    </div>

                    {plan.description && (
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={12} className="text-emerald-500" />
                                <span>Plan Memo</span>
                            </h4>
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-slate-100 dark:border-slate-800 pl-4">
                                {plan.description}
                            </p>
                        </div>
                    )}

                    {plan.tags.length > 0 && (
                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Hash size={12} className="text-emerald-500" />
                                <span>Focus Tags</span>
                            </h4>
                            <div className="flex flex-wrap gap-2">
                                {plan.tags.map((tag, i) => (
                                    <span key={i} className="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-100 dark:border-slate-700 shadow-sm">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-6 bg-emerald-50 dark:bg-emerald-950/20 rounded-[2.5rem] border border-emerald-100 dark:border-emerald-900/30 flex items-start gap-4">
                        <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <h4 className="text-xs font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">Production Ready</h4>
                            <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-normal uppercase">
                                This plan is ready to be deployed to your calendar. Future AI integrations will allow you to generate optimized versions of this layout.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4 flex-shrink-0">
                    <div className="flex items-center gap-2">
                        {onDelete && (
                            <button 
                                onClick={onDelete}
                                className="p-3 text-slate-400 hover:text-red-500 transition-colors"
                                title="Delete Plan"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        {onEdit && (
                            <button 
                                onClick={onEdit}
                                className="p-3 text-slate-400 hover:text-emerald-500 transition-colors"
                                title="Edit Plan"
                            >
                                <Edit3 size={20} />
                            </button>
                        )}
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="px-8 py-3 bg-slate-900 dark:bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-900/10 dark:shadow-emerald-500/10 hover:scale-105 active:scale-95 transition-all"
                    >
                        Close View
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
