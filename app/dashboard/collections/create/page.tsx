"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
    ChevronLeft, 
    LayoutGrid, 
    FolderPlus,
    X,
    CheckCircle2,
    AlertCircle
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../../../components/dashboard/Sidebar";
import Header from "../../../../components/dashboard/Header";
import { useCollections } from "../../../../lib/hooks/useCollections";
import { Collection } from "../../../../types/collections";

export default function CreateCollectionPage() {
    const [collapsed, setCollapsed] = useState(false);
    const router = useRouter();
    const { addCollection } = useCollections();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!name.trim()) {
            setError("Collection name is required");
            return;
        }

        setIsSubmitting(true);

        const newCollection: Collection = {
            id: crypto.randomUUID(),
            name: name.trim(),
            description: description.trim(),
            foodIds: [],
            createdAt: new Date().toISOString(),
        };

        try {
            // Instant localStorage update via hook
            addCollection(newCollection);
            router.push("/dashboard/collections");
        } catch (err) {
            setError("Failed to create collection. Please try again.");
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 transition-colors">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
            
            <main className={`flex-1 overflow-y-auto transition-all duration-300 ${collapsed ? "ml-[80px]" : "ml-[280px]"}`}>
                <Header title="Create Collection" />

                <div className="max-w-3xl mx-auto p-4 sm:p-8 pb-32">
                    <div className="mb-8">
                        <Link 
                            href="/dashboard/collections"
                            className="inline-flex items-center text-sm font-black text-slate-400 hover:text-emerald-500 transition-colors uppercase tracking-widest gap-2"
                        >
                            <ChevronLeft size={16} />
                            Back to Collections
                        </Link>
                    </div>

                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 sm:p-12 shadow-2xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800"
                    >
                        <div className="flex items-center space-x-4 mb-10">
                            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-3xl">
                                <FolderPlus size={32} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase">New Collection</h1>
                                <p className="text-sm font-bold text-slate-400">Organize your favorite foods and recipes.</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Error Alert */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div 
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="bg-red-50 border border-red-100 text-red-600 p-4 rounded-2xl flex items-center gap-3 overflow-hidden"
                                    >
                                        <AlertCircle size={20} />
                                        <span className="text-sm font-bold">{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                        Collection Name <span className="text-red-500">*</span>
                                    </label>
                                    <input 
                                        type="text" 
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="e.g. My Paleo Favorites"
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 dark:text-white"
                                        autoFocus
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">
                                        Description (Optional)
                                    </label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Add a short summary of what's inside..."
                                        rows={4}
                                        className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all font-bold text-slate-900 dark:text-white resize-none"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-8 py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
                                >
                                    {isSubmitting ? "Creating..." : (
                                        <>
                                            <CheckCircle2 size={20} className="group-hover:scale-110 transition-transform" />
                                            <span>Create Collection</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="px-8 py-5 bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 rounded-3xl font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
