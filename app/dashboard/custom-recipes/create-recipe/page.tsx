"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Upload, Camera, Trash2, Check, Plus, Type, List, Info, Clock, Users, Sparkles, Hash } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../../../../components/dashboard/Header";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useCustomRecipes } from "../../../../lib/hooks/useCustomRecipes";
import { CustomRecipe, MealType } from "../../../../types/custom-recipes";

export default function CreateRecipePage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const { addRecipe } = useCustomRecipes();
    const searchParams = useSearchParams();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);
    
    // Properties
    const [mealCategory, setMealCategory] = useState<"main" | "side">("main");
    const [targetMeals, setTargetMeals] = useState<MealType[]>(["lunch", "dinner"]);
    const [makesGoodLeftovers, setMakesGoodLeftovers] = useState(true);
    
    // Recipe Stats
    const [prepTime, setPrepTime] = useState("10");
    const [cookTime, setCookTime] = useState("20");
    const [yields, setYields] = useState("1");
    const [servingDescription, setServingDescription] = useState("");
    const [canBeMadeForOne, setCanBeMadeForOne] = useState(true);

    // Ingredients
    const [ingredients, setIngredients] = useState<string[]>([]);
    const [newIngredient, setNewIngredient] = useState("");
    const [isParsingIngredients, setIsParsingIngredients] = useState(false);
    const [parseText, setParseText] = useState("");

    // Directions
    const [steps, setSteps] = useState<string[]>([]);
    
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Load pre-filled data if redirected from import
        const prefilledData = searchParams.get("data");
        if (prefilledData) {
            try {
                const parsed = JSON.parse(prefilledData);
                setName(parsed.name || "");
                setIngredients(parsed.ingredients || []);
                setSteps(parsed.steps || []);
            } catch (e) {
                console.error("Failed to parse prefilled data", e);
            }
        }
    }, [searchParams]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const addIngredient = () => {
        if (newIngredient.trim()) {
            setIngredients([...ingredients, newIngredient.trim()]);
            setNewIngredient("");
        }
    };

    const removeIngredient = (index: number) => {
        setIngredients(ingredients.filter((_, i) => i !== index));
    };

    const parseIngredientsAction = () => {
        const lines = parseText.split(/[,\n]/).map(l => l.trim()).filter(l => l);
        setIngredients([...ingredients, ...lines]);
        setParseText("");
        setIsParsingIngredients(false);
    };

    const addStep = () => {
        setSteps([...steps, ""]);
    };

    const updateStep = (index: number, val: string) => {
        const next = [...steps];
        next[index] = val;
        setSteps(next);
    };

    const removeStep = (index: number) => {
        setSteps(steps.filter((_, i) => i !== index));
    };

    const toggleMeal = (meal: MealType) => {
        if (targetMeals.includes(meal)) {
            setTargetMeals(targetMeals.filter(m => m !== meal));
        } else {
            setTargetMeals([...targetMeals, meal]);
        }
    };

    const handleSave = () => {
        if (!name.trim()) return;
        
        setIsSaving(true);
        const newRecipe: CustomRecipe = {
            id: crypto.randomUUID(),
            name,
            description,
            image: image || `https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&q=80`,
            mealCategory,
            targetMeals,
            makesGoodLeftovers,
            prepTime: Number(prepTime) || 0,
            cookTime: Number(cookTime) || 0,
            yields: Number(yields) || 1,
            servingDescription,
            canBeMadeForOne,
            ingredients,
            steps: steps.filter(s => s.trim()),
            createdAt: new Date().toISOString()
        };

        addRecipe(newRecipe);
        setTimeout(() => router.push("/dashboard/custom-recipes"), 1000);
    };

    if (!mounted) return null;

    const mealOptions: MealType[] = ["breakfast", "lunch", "dinner", "snack", "dessert"];

    return (
        <div className="flex flex-col min-w-0 h-full">
            <Header 
                toggleMobileMenu={() => setMobileMenuOpen(true)}
                viewMode="day"
                setViewMode={() => {}}
                selectedDate={new Date()}
                onDateChange={() => {}}
                theme={theme}
                onThemeChange={setTheme}
                isProcessing={false}
            />

                <div className="flex-1 p-4 lg:p-10 overflow-y-auto relative scrollbar-hide">
                    <div className="max-w-4xl mx-auto space-y-8 pb-32">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => router.back()}
                                className="flex items-center space-x-2 text-slate-500 hover:text-emerald-500 transition-colors font-bold text-sm"
                            >
                                <ArrowLeft size={18} />
                                <span>Back to Library</span>
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Create Custom Recipe</h2>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                {/* SECTION 1: BASIC INFO */}
                                <FormSection title="Recipe Essence" description="The core details that define this dish.">
                                    <div className="space-y-6">
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Recipe Name</label>
                                            <input 
                                                value={name}
                                                onChange={(e) => setName(e.target.value)}
                                                placeholder="e.g. Avocado Toast with Poached Egg"
                                                className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 font-bold text-lg"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Description & Story</label>
                                            <textarea 
                                                value={description}
                                                onChange={(e) => setDescription(e.target.value)}
                                                rows={4}
                                                placeholder="What makes this recipe special?..."
                                                className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/10 font-medium resize-none shadow-inner"
                                            />
                                        </div>
                                    </div>
                                </FormSection>

                                {/* SECTION 4: INGREDIENTS */}
                                <FormSection 
                                    title="Ingredients" 
                                    description="List everything needed to bring this recipe to life."
                                    action={
                                        <button 
                                            onClick={() => setIsParsingIngredients(!isParsingIngredients)}
                                            className="text-[10px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-600 transition-colors flex items-center space-x-1"
                                        >
                                            <Type size={12} />
                                            <span>Parse from text</span>
                                        </button>
                                    }
                                >
                                    <div className="space-y-4">
                                        {isParsingIngredients && (
                                            <motion.div 
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border-2 border-emerald-100 dark:border-emerald-900/30 space-y-3"
                                            >
                                                <textarea 
                                                    value={parseText}
                                                    onChange={(e) => setParseText(e.target.value)}
                                                    placeholder="Paste ingredients separated by commas or new lines..."
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                                                    rows={4}
                                                />
                                                <div className="flex justify-end space-x-2">
                                                    <button onClick={() => setIsParsingIngredients(false)} className="px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cancel</button>
                                                    <button onClick={parseIngredientsAction} className="px-4 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20">Parse Now</button>
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="flex space-x-2">
                                            <input 
                                                value={newIngredient}
                                                onChange={(e) => setNewIngredient(e.target.value)}
                                                onKeyDown={(e) => e.key === "Enter" && addIngredient()}
                                                placeholder="Add an ingredient..."
                                                className="flex-1 bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all px-4 py-3 rounded-xl focus:outline-none text-sm font-medium"
                                            />
                                            <button 
                                                onClick={addIngredient}
                                                className="p-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20"
                                            >
                                                <Plus size={20} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 gap-2">
                                            <AnimatePresence>
                                                {ingredients.map((ing, idx) => (
                                                    <motion.div 
                                                        key={ing + idx}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9 }}
                                                        className="group flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-4 py-3 rounded-xl border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition-all"
                                                    >
                                                        <div className="flex items-center space-x-3">
                                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{ing}</span>
                                                        </div>
                                                        <button onClick={() => removeIngredient(idx)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                            {ingredients.length === 0 && (
                                                <div className="py-8 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
                                                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">No ingredients yet</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </FormSection>

                                {/* SECTION 5: DIRECTIONS */}
                                <FormSection title="Preparation Steps" description="Step-by-step guide to achieving culinary perfection.">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <AnimatePresence>
                                                {steps.map((step, idx) => (
                                                    <motion.div 
                                                        key={`step-${idx}`}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, x: 20 }}
                                                        className="relative"
                                                    >
                                                        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black text-xs shadow-lg shadow-emerald-500/20 z-10 border-4 border-white dark:border-slate-900">
                                                            {idx + 1}
                                                        </div>
                                                        <div className="flex items-center space-x-2 pl-4">
                                                            <textarea 
                                                                value={step}
                                                                onChange={(e) => updateStep(idx, e.target.value)}
                                                                placeholder="Describe this step..."
                                                                className="flex-1 bg-white dark:bg-slate-800/30 border-2 border-slate-100 dark:border-slate-800 focus:border-emerald-500 transition-all p-4 rounded-2xl focus:outline-none text-sm font-medium resize-none shadow-sm"
                                                                rows={2}
                                                            />
                                                            <button onClick={() => removeStep(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                        <button 
                                            onClick={addStep}
                                            className="w-full py-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl flex items-center justify-center space-x-3 text-slate-400 hover:text-emerald-500 hover:border-emerald-500/50 transition-all font-black text-xs uppercase tracking-widest"
                                        >
                                            <Plus size={18} />
                                            <span>Add a Step</span>
                                        </button>
                                    </div>
                                </FormSection>
                            </div>

                            <div className="space-y-8">
                                {/* SIDEBAR: IMAGE */}
                                <FormSection title="Dish Glory" description="A visual preview.">
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="relative group aspect-square rounded-[32px] overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex items-center justify-center cursor-pointer transition-all hover:scale-[1.02]"
                                    >
                                        {image ? (
                                            <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="flex flex-col items-center space-y-2 text-slate-400">
                                                <Camera size={40} className="stroke-[1]" />
                                                <span className="font-black text-[10px] uppercase tracking-widest">Capture Preview</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <Upload className="text-white" />
                                        </div>
                                        <input type="file" ref={fileInputRef} onChange={handleImageChange} className="hidden" accept="image/*" />
                                    </div>
                                </FormSection>

                                {/* SIDEBAR: MEAL PROPERTIES */}
                                <FormSection title="Properties" description="When and how to enjoy this.">
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Meal Focus</label>
                                            <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                                <button 
                                                    onClick={() => setMealCategory("main")}
                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        mealCategory === "main" ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm" : "text-slate-400"
                                                    }`}
                                                >
                                                    Main
                                                </button>
                                                <button 
                                                    onClick={() => setMealCategory("side")}
                                                    className={`flex-1 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                                                        mealCategory === "side" ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm" : "text-slate-400"
                                                    }`}
                                                >
                                                    Side
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Best For</label>
                                            <div className="grid grid-cols-2 gap-2">
                                                {mealOptions.map(meal => (
                                                    <button 
                                                        key={meal}
                                                        onClick={() => toggleMeal(meal)}
                                                        className={`px-3 py-2 rounded-xl border-2 transition-all text-[10px] font-black uppercase tracking-widest text-left ${
                                                            targetMeals.includes(meal) 
                                                                ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" 
                                                                : "border-slate-100 dark:border-slate-800 text-slate-400"
                                                        }`}
                                                    >
                                                        <div className="flex items-center justify-between">
                                                            <span>{meal}</span>
                                                            {targetMeals.includes(meal) && <Check size={12} />}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <ToggleField label="Good Leftovers?" active={makesGoodLeftovers} onToggle={() => setMakesGoodLeftovers(!makesGoodLeftovers)} />
                                    </div>
                                </FormSection>

                                {/* SIDEBAR: STATS */}
                                <FormSection title="Precision" description="Prep, cook, and yield metrics.">
                                    <div className="space-y-4">
                                        <MetricField label="Prep Time" value={prepTime} onChange={setPrepTime} unit="min" icon={Clock} />
                                        <MetricField label="Cook Time" value={cookTime} onChange={setCookTime} unit="min" icon={Clock} />
                                        <MetricField label="Yields" value={yields} onChange={setYields} unit="sv" icon={Users} />
                                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                                            <ToggleField label="Scalable for 1?" active={canBeMadeForOne} onToggle={() => setCanBeMadeForOne(!canBeMadeForOne)} />
                                        </div>
                                    </div>
                                </FormSection>
                            </div>
                        </div>

                        {/* FINAL SAVE ACTION */}
                        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4">
                            <button 
                                onClick={handleSave}
                                disabled={!name || ingredients.length === 0 || isSaving}
                                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white py-5 rounded-[24px] font-black uppercase tracking-widest shadow-2xl shadow-emerald-500/40 flex items-center justify-center space-x-4 transition-all active:scale-95 disabled:grayscale disabled:opacity-50"
                            >
                                {isSaving ? <Check size={24} className="animate-bounce" /> : <Sparkles size={24} />}
                                <span>{isSaving ? "Saving Masterpiece..." : "Finalize Custom Recipe"}</span>
                            </button>
                        </div>
                    </div>
                </div>
        </div>
    );
}

function FormSection({ title, description, children, action }: { 
    title: string; 
    description: string; 
    children: React.ReactNode; 
    action?: React.ReactNode; 
}) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 rounded-[32px] p-8 space-y-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-emerald-500/[0.02]"
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
                    <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{description}</p>
                </div>
                {action}
            </div>
            {children}
        </motion.div>
    );
}

function MetricField({ label, value, onChange, unit, icon: Icon }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    unit: string;
    icon: any;
}) {
    return (
        <div className="space-y-1.5 group">
            <div className="flex items-center space-x-2 px-1">
                <Icon size={12} className="text-emerald-500" />
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
            </div>
            <div className="relative group">
                <input 
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent transition-all font-black px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 text-sm pr-16"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300 text-[10px] tracking-widest uppercase italic pointer-events-none">{unit}</span>
            </div>
        </div>
    );
}

function ToggleField({ label, active, onToggle }: {
    label: string;
    active: boolean;
    onToggle: () => void;
}) {
    return (
        <button 
            onClick={onToggle}
            className="w-full flex items-center justify-between group"
        >
            <span className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">{label}</span>
            <div className={`w-12 h-6 rounded-full p-1 transition-all ${active ? "bg-emerald-500" : "bg-slate-200 dark:bg-slate-800"}`}>
                <motion.div 
                    animate={{ x: active ? 24 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                />
            </div>
        </button>
    );
}
