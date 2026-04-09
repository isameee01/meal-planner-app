"use client";

import { motion } from "framer-motion";
import { Calendar, Trash2, Edit3, Eye, Clock, Hash } from "lucide-react";
import { SavedPlan } from "../../types/saved-plans";
import { formatDistanceToNow } from "date-fns";

interface SavedPlanCardProps {
    plan: SavedPlan;
    onView: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

export default function SavedPlanCard({ plan, onView, onEdit, onDelete }: SavedPlanCardProps) {
    const createdDate = new Date(plan.createdAt);
    
    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none p-6 flex flex-col group transition-all hover:shadow-2xl hover:shadow-emerald-500/5 relative overflow-hidden h-full"
        >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />

            <div className="flex items-start justify-between mb-6">
                <div className="p-4 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                    <Calendar size={24} />
                </div>
                <div className="flex bg-slate-50 dark:bg-slate-800 rounded-xl p-1 gap-1">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                        title="Edit Plan"
                    >
                        <Edit3 size={16} />
                    </button>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onDelete(); }}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                        title="Delete Plan"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            <div className="space-y-4 flex-1">
                <div className="space-y-1">
                    <h3 
                        onClick={onView}
                        className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-emerald-500 transition-colors cursor-pointer hover:underline underline-offset-4 decoration-2"
                    >
                        {plan.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <Clock size={12} />
                        <span>{formatDistanceToNow(createdDate, { addSuffix: true })}</span>
                    </div>
                </div>

                {plan.description && (
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 line-clamp-2 italic leading-relaxed">
                        {plan.description}
                    </p>
                )}

                <div className="flex flex-wrap gap-1.5 pt-2">
                    <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-lg text-[9px] font-black uppercase tracking-widest border border-emerald-100 dark:border-emerald-900/40">
                        {plan.days} Days
                    </span>
                    {plan.tags.slice(0, 3).map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            {tag}
                        </span>
                    ))}
                    {plan.tags.length > 3 && (
                        <span className="px-2 py-1 text-[9px] font-black text-slate-300">+{plan.tags.length - 3}</span>
                    )}
                </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-50 dark:border-slate-800/50">
                <button 
                    onClick={onView}
                    className="w-full py-3 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-emerald-500 dark:hover:bg-emerald-500 transition-all shadow-xl shadow-slate-900/10 active:scale-[0.98]"
                >
                    <Eye size={16} />
                    <span>View Plan Detail</span>
                </button>
            </div>
        </motion.div>
    );
}
