"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { suggestFoodsAI, AISuggestion } from "../../lib/ai/suggestFoods";
import { FULL_DISCOVER_DATABASE, FoodItem } from "../../lib/discover-db";
import { useGlobalFoodState } from "../../lib/contexts/FoodStateContext";
import FoodCard from "./FoodCard";

interface AIRecommendationsProps {
    onAddToPlanner: (food: FoodItem) => void;
    onOpenNutrition: (food: FoodItem) => void;
}

export default function AIRecommendations({ onAddToPlanner, onOpenNutrition }: AIRecommendationsProps) {
    const [suggestions, setSuggestions] = useState<(AISuggestion & { food?: FoodItem })[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { blockedFoods } = useGlobalFoodState();

    useEffect(() => {
        async function fetchRecommendations() {
            setLoading(true);
            setError(null);
            try {
                const statsStr = localStorage.getItem("user_stats");
                const userData = statsStr ? JSON.parse(statsStr) : { weight: 70 };
                
                const goalStr = localStorage.getItem("user_goal");
                const goal = goalStr ? JSON.parse(goalStr).goalType : "maintain";

                // Fetch AI Suggestions
                const aiSuggestions = await suggestFoodsAI(userData, goal, "Standard", blockedFoods);
                
                // Map to Database
                const richSuggestions = aiSuggestions.map(s => {
                    const foodMatch = FULL_DISCOVER_DATABASE.find(f => 
                        f.name.toLowerCase().includes(s.name.toLowerCase()) || 
                        s.name.toLowerCase().includes(f.name.toLowerCase())
                    );
                    return { ...s, food: foodMatch };
                }).filter(s => {
                    // SECONDARY SAFETY GUARD: Ensure food match exists AND isn't blocked
                    if (!s.food) return false;
                    const isBlocked = blockedFoods.some(blocked => 
                        s.food!.id === blocked || 
                        s.food!.name.toLowerCase().trim() === blocked.toLowerCase().trim()
                    );
                    return !isBlocked;
                });

                setSuggestions(richSuggestions);
            } catch (err) {
                console.error("AI Recommendations failed:", err);
                setError("Failed to fetch AI suggestions.");
            } finally {
                setLoading(false);
            }
        }

        fetchRecommendations();
    }, [blockedFoods]);

    if (loading) {
        return (
            <div className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-[2.5rem] p-8 mb-12">
                <div className="flex items-center space-x-3 mb-6">
                    <Loader2 className="w-5 h-5 text-emerald-500 animate-spin" />
                    <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
                        AI Brain is picking foods...
                    </h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-2xl" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || suggestions.length === 0) return null;

    return (
        <section className="bg-emerald-500/5 dark:bg-emerald-500/10 border border-emerald-500/10 rounded-[2.5rem] p-8 mb-12 relative overflow-hidden">
            {/* Background Sparkles Decal */}
            <div className="absolute -top-10 -right-10 opacity-10 dark:opacity-20 pointer-events-none">
                <Sparkles size={200} className="text-emerald-500" />
            </div>

            <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-1">
                        <Sparkles size={14} />
                        <span>Hyper-Personalized</span>
                    </div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic underline decoration-emerald-500/30 decoration-4 underline-offset-8">
                        Recommended <span className="text-emerald-500">for You</span>
                    </h2>
                </div>
                <button className="flex items-center space-x-2 text-sm font-black text-slate-400 hover:text-emerald-500 transition-colors group">
                    <span>SEE WHY</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {suggestions.map((item, idx) => (
                        <motion.div
                            key={item.food!.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="relative group h-full"
                        >
                            {/* Personalization Tag */}
                            <div className="absolute top-4 left-4 z-20">
                                <span className="bg-emerald-500 text-white text-[9px] font-black px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 uppercase tracking-wider">
                                    <Info size={10} />
                                    Match: {item.score}%
                                </span>
                            </div>

                            <FoodCard 
                                food={item.food!} 
                                onAddToPlanner={onAddToPlanner} 
                                onOpenNutrition={onOpenNutrition} 
                                viewMode="grid" 
                            />

                            {/* Reasoning Overlay on Hover */}
                            <div className="absolute inset-0 bg-emerald-600/90 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl flex flex-col items-center justify-center p-6 text-center z-30 pointer-events-none">
                                <Sparkles size={32} className="text-white mb-4 animate-pulse" />
                                <h4 className="text-white font-black text-lg mb-2 uppercase italic tracking-tight">Why this?</h4>
                                <p className="text-emerald-50/90 text-sm font-bold leading-relaxed">
                                    "{item.reason}"
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}
