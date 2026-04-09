"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
    ChevronLeft, 
    CheckCircle2, 
    X, 
    Calendar,
    Hash,
    AlignLeft,
    Tag,
    AlertCircle,
    ArrowRightCircle,
    Save,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../../../components/dashboard/Sidebar";
import Header from "../../../../components/dashboard/Header";
import { useSavedPlans } from "../../../../lib/hooks/useSavedPlans";
import { SavedPlan } from "../../../../types/saved-plans";

function SavedPlanFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const { addPlan, updatePlan, getPlanById, loading: plansLoading } = useSavedPlans();

    const [collapsed, setCollapsed] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [days, setDays] = useState(7);
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Hydrate form for edit mode
    useEffect(() => {
        if (editId && !plansLoading) {
            const plan = getPlanById(editId);
            if (plan) {
                setTitle(plan.title);
                setDescription(plan.description || "");
                setDays(plan.days);
                setTags(plan.tags);
            }
        }
    }, [editId, plansLoading, getPlanById]);

    const handleAddTag = (e?: React.KeyboardEvent) => {
        if (e && e.key !== "Enter" && e.key !== ",") return;
        if (e) e.preventDefault();

        const tag = tagInput.trim().replace(/,/g, "");
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        if (days < 1 || days > 30) {
            setError("Days must be between 1 and 30");
            return;
        }

        setIsSubmitting(true);

        try {
            if (editId) {
                updatePlan(editId, {
                    title: title.trim(),
                    description: description.trim(),
                    days,
                    tags
                });
            } else {
                const newPlan: SavedPlan = {
                    id: crypto.randomUUID(),
                    title: title.trim(),
                    description: description.trim(),
                    days,
                    tags,
                    createdAt: new Date().toISOString()
                };
                addPlan(newPlan);
            }
            router.push("/dashboard/saved-plans");
        } catch (err) {
            setError("Failed to save plan. Please try again.");
            setIsSubmitting(false);
        }
    };

    const isValid = title.trim().length > 0 && days >= 1 && days <= 30;

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors overflow-hidden">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            
            <main className={`flex-1 overflow-y-auto transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[280px]"}`}>
                <Header title={editId ? "Edit Architecture" : "Plan Architecture"} />

                <div className="max-w-4xl mx-auto p-4 sm:p-8 pb-32">
                    <div className="mb-8">
                        <Link 
                            href="/dashboard/saved-plans"
                            className="inline-flex items-center text-xs font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest gap-2"
                        >
                            <ChevronLeft size={16} />
                            Back to Library
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Form Column */}
                        <div className="lg:col-span-2 space-y-8">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
                            >
                                <div className="flex items-center space-x-4 mb-12">
                                    <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl">
                                        <Hash size={32} />
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic underline decoration-emerald-500 decoration-8 underline-offset-8 decoration-white dark:decoration-slate-900">
                                            {editId ? "Modify Structure" : "New Foundation"}
                                        </h1>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Architecture Configuration</p>
                                    </div>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-10">
                                    {error && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 p-4 rounded-2xl flex items-center gap-3 text-xs font-black uppercase tracking-widest"
                                        >
                                            <AlertCircle size={16} />
                                            <span>{error}</span>
                                        </motion.div>
                                    )}

                                    <div className="space-y-8">
                                        {/* Title Input */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                                <AlignLeft size={12} /> Plan Identifier <span className="text-red-500">*</span>
                                            </label>
                                            <input 
                                                type="text" 
                                                value={title}
                                                onChange={(e) => setTitle(e.target.value)}
                                                placeholder="e.g. Hypertrophy Week One"
                                                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-black text-slate-900 dark:text-white uppercase tracking-tight placeholder:text-slate-300"
                                            />
                                        </div>

                                        {/* Description Textarea */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                                <AlignLeft size={12} /> Strategic Memo
                                            </label>
                                            <textarea 
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                placeholder="Document the logic behind this nutrition sequence..."
                                                rows={4}
                                                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 dark:text-white resize-none italic"
                                            />
                                        </div>

                                        {/* Days Input */}
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                                <Calendar size={12} /> Temporal Scope (1-30 Days)
                                            </label>
                                            <div className="flex items-center gap-4">
                                                <input 
                                                    type="range" 
                                                    min="1" 
                                                    max="30"
                                                    value={days}
                                                    onChange={(e) => setDays(parseInt(e.target.value))}
                                                    className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                                />
                                                <div className="w-16 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center font-black text-lg shadow-lg">
                                                    {days}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tag System */}
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 flex items-center gap-2">
                                                <Tag size={12} /> Classification Focus
                                            </label>
                                            <div className="space-y-4">
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        value={tagInput}
                                                        onChange={(e) => setTagInput(e.target.value)}
                                                        onKeyDown={handleAddTag}
                                                        onBlur={() => handleAddTag()}
                                                        placeholder="Add tags (Enter or comma)..."
                                                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-3xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-black text-slate-900 dark:text-white uppercase tracking-tight placeholder:text-slate-300"
                                                    />
                                                </div>
                                                
                                                <AnimatePresence>
                                                    {tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 px-2">
                                                            {tags.map((tag, i) => (
                                                                <motion.button
                                                                    key={tag}
                                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                                    animate={{ opacity: 1, scale: 1 }}
                                                                    exit={{ opacity: 0, scale: 0.8 }}
                                                                    type="button"
                                                                    onClick={() => removeTag(tag)}
                                                                    className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/10 flex items-center gap-2 group"
                                                                >
                                                                    <span>{tag}</span>
                                                                    <X size={12} className="group-hover:scale-125 transition-transform" />
                                                                </motion.button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Grid */}
                                    <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 pt-10">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting || !isValid}
                                            className="flex-1 px-8 py-6 bg-emerald-500 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/40 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                                        >
                                            {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : (
                                                <>
                                                    <Save size={20} className="group-hover:rotate-12 transition-transform" />
                                                    <span>{editId ? "Update Structure" : "Finalize Foundation"}</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => router.back()}
                                            className="px-12 py-6 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white border border-slate-100 dark:border-slate-700 rounded-[2rem] font-black uppercase tracking-widest transition-all"
                                        >
                                            Abandon
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>

                        {/* Preview Column */}
                        <div className="space-y-6">
                            <div className="sticky top-8">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4 mb-4">Architecture Preview</h4>
                                <div className="opacity-60 scale-95 origin-top grayscale hover:grayscale-0 transition-all cursor-not-allowed">
                                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 flex flex-col items-center justify-center text-center space-y-4 h-64">
                                        <ArrowRightCircle size={48} className="text-slate-200" />
                                        <p className="text-xs font-black text-slate-300 uppercase underline underline-offset-4 decoration-2">Auto-Generating Live Feed</p>
                                    </div>
                                </div>
                                <div className="mt-8 p-6 bg-slate-900 dark:bg-emerald-950/20 rounded-3xl border border-slate-800 dark:border-emerald-900/30">
                                    <h4 className="text-xs font-black text-emerald-400 uppercase tracking-widest mb-3 italic flex items-center gap-2">
                                        <CheckCircle2 size={16} /> 
                                        <span>System Integrity</span>
                                    </h4>
                                    <p className="text-[10px] font-bold text-slate-400 leading-normal uppercase">
                                        Data is persistent via local encryption. Changes reflect across all active performance terminals instantly.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function CreateSavedPlanPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><Loader2 className="animate-spin text-emerald-500" size={48} /></div>}>
            <SavedPlanFormContent />
        </Suspense>
    );
}
