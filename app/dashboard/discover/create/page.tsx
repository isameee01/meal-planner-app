"use client";

import { useState, useMemo, useEffect } from "react";
import { 
    ChevronLeft, 
    Plus, 
    X, 
    Save, 
    ChefHat, 
    Timer, 
    Users, 
    Info, 
    Search,
    Type,
    FileText,
    Image as ImageIcon,
    PieChart as PieChartIcon,
    Trash2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { FULL_DISCOVER_DATABASE, FoodItem, FoodCategory, MealType, getFoodImage } from "../../../../lib/discover-db";

interface IngredientEntry {
    foodId: string;
    foodName: string;
    amount: number;
    unit: string;
    nutrition: FoodItem["nutrition"];
}

const DEFAULT_NUTRITION: FoodItem["nutrition"] = {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, cholesterol: 0,
    sugar: { total: 0, added: 0 },
    fatBreakdown: { saturated: 0, polyunsaturated: 0, monounsaturated: 0, trans: 0 },
    vitamins: { vitaminA: "0%", vitaminC: "0%", vitaminD: "0%", vitaminE: "0%", vitaminK: "0%", vitaminB6: "0%", vitaminB12: "0%" },
    minerals: { calcium: "0%", iron: "0%", magnesium: "0%", phosphorus: "0%", potassium: "0%", zinc: "0%" },
    aminoAcids: { leucine: "0mg", isoleucine: "0mg", valine: "0mg", lysine: "0mg", methionine: "0mg", phenylalanine: "0mg", threonine: "0mg", tryptophan: "0mg", histidine: "0mg" }
};

export default function CreateRecipePage() {
    const router = useRouter();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState<FoodCategory>("recipe");
    const [mealTypes, setMealTypes] = useState<MealType[]>(["lunch"]);
    const [prepTime, setPrepTime] = useState(15);
    const [cookTime, setCookTime] = useState(15);
    const [servings, setServings] = useState(1);
    
    const [ingredients, setIngredients] = useState<IngredientEntry[]>([]);
    const [directions, setDirections] = useState<string[]>([""]);
    
    const [ingSearch, setIngSearch] = useState("");
    const [showSuggestions, setShowSuggestions] = useState(false);

    const suggestions = useMemo(() => {
        if (!ingSearch) return [];
        return FULL_DISCOVER_DATABASE.filter((f: FoodItem) => f.name.toLowerCase().includes(ingSearch.toLowerCase())).slice(0, 5);
    }, [ingSearch]);

    const totalNutrition = useMemo(() => {
        const total = { ...DEFAULT_NUTRITION };
        ingredients.forEach(ing => {
            const scale = ing.amount / 100; // Assuming database items are per 100g/unit
            total.calories += Math.round(ing.nutrition.calories * scale);
            total.protein += Math.round(ing.nutrition.protein * scale);
            total.carbs += Math.round(ing.nutrition.carbs * scale);
            total.fat += Math.round(ing.nutrition.fat * scale);
            total.fiber += Math.round(ing.nutrition.fiber * scale);
            total.sodium += Math.round(ing.nutrition.sodium * scale);
        });
        return total;
    }, [ingredients]);

    const handleAddIngredient = (food: FoodItem) => {
        const newIng: IngredientEntry = {
            foodId: food.id,
            foodName: food.name,
            amount: 100,
            unit: food.servingUnit,
            nutrition: food.nutrition
        };
        setIngredients([...ingredients, newIng]);
        setIngSearch("");
        setShowSuggestions(false);
    };

    const handleAddManualIngredient = () => {
        const newIng: IngredientEntry = {
            foodId: `custom-${Date.now()}`,
            foodName: ingSearch || "Custom Ingredient",
            amount: 100,
            unit: "g",
            nutrition: DEFAULT_NUTRITION
        };
        setIngredients([...ingredients, newIng]);
        setIngSearch("");
        setShowSuggestions(false);
    };

    const handleSave = () => {
        if (!name) return alert("Please enter a recipe name.");
        
        const customRecipe: FoodItem = {
            id: `recipe-${Date.now()}`,
            name,
            description,
            category: "recipe",
            image: getFoodImage({ name, category: "recipe" }),
            serving: `1 serving`,
            servingUnit: "serving",
            servingSize: 1,
            mealTypes,
            tags: ["custom", "recipe"],
            nutrition: {
                ...totalNutrition,
                calories: Math.round(totalNutrition.calories / servings),
                protein: Math.round(totalNutrition.protein / servings),
                carbs: Math.round(totalNutrition.carbs / servings),
                fat: Math.round(totalNutrition.fat / servings)
            },
            ingredients: ingredients.map(i => ({ name: i.foodName, amount: `${i.amount}${i.unit}` })),
            directions,
            prepTime,
            cookTime,
            servings
        };

        const stored = localStorage.getItem("discover_customRecipes");
        const next = stored ? [...JSON.parse(stored), customRecipe] : [customRecipe];
        localStorage.setItem("discover_customRecipes", JSON.stringify(next));
        
        router.push("/dashboard/discover");
    };

    return (
        <div className="min-h-full pb-20 bg-slate-50 dark:bg-slate-950 transition-colors">
            
            {/* Nav */}
            <div className="p-6 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-30">
                <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-500 hover:text-emerald-500 transition-colors font-bold uppercase text-[10px] tracking-widest"
                >
                    <ChevronLeft size={20} />
                    Cancel
                </button>
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">Create Custom Recipe</h2>
                <button 
                    onClick={handleSave}
                    className="flex items-center gap-2 px-8 py-3 bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-200/50 hover:scale-105 transition-all"
                >
                    <Save size={18} />
                    <span>Save Recipe</span>
                </button>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* LEFT: Core Info */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* Section 1: Identity */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 text-emerald-500">
                                <Type size={24} />
                                <h3 className="text-xl font-black uppercase tracking-widest">Basic Information</h3>
                            </div>
                            <div className="space-y-4">
                                <input 
                                    type="text" 
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Recipe Name (e.g. Grandma's Lasagna)"
                                    className="w-full text-4xl font-black bg-transparent border-b-2 border-slate-200 dark:border-slate-800 py-4 focus:border-emerald-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-800 transition-all"
                                />
                                <textarea 
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Recipe Description / Background Story..."
                                    className="w-full h-24 bg-white dark:bg-slate-900 rounded-[2rem] p-6 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-slate-700 dark:text-slate-300 font-medium transition-all"
                                />
                            </div>
                        </section>

                        {/* Section 2: Ingredients */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4 text-amber-500">
                                    <ChefHat size={24} />
                                    <h3 className="text-xl font-black uppercase tracking-widest">Ingredients</h3>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ingredients.length} items added</span>
                            </div>

                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input 
                                        type="text" 
                                        value={ingSearch}
                                        onChange={(e) => {
                                            setIngSearch(e.target.value);
                                            setShowSuggestions(true);
                                        }}
                                        placeholder="Search for ingredients to auto-fill nutrition..."
                                        className="w-full pl-16 pr-6 py-5 bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-amber-500 outline-none shadow-sm transition-all"
                                    />
                                </div>

                                <AnimatePresence>
                                    {showSuggestions && (ingSearch || suggestions.length > 0) && (
                                        <motion.div 
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 10 }}
                                            className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-700 z-40 overflow-hidden overflow-y-auto max-h-60"
                                        >
                                            {suggestions.map((food: FoodItem) => (
                                                <button 
                                                    key={food.id}
                                                    onClick={() => handleAddIngredient(food)}
                                                    className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 bg-amber-100 dark:bg-amber-900/30 rounded-lg flex items-center justify-center text-amber-600">
                                                            {food.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight leading-none mb-1">{food.name}</p>
                                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{food.nutrition.calories} kcal / 100g</p>
                                                        </div>
                                                    </div>
                                                    <Plus size={18} className="text-slate-300" />
                                                </button>
                                            ))}
                                            <button 
                                                onClick={handleAddManualIngredient}
                                                className="w-full flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 font-black uppercase text-[10px] tracking-widest border-t border-amber-100 dark:border-amber-900/10"
                                            >
                                                <Plus size={16} /> Add "{ingSearch || "Custom Ingredient"}" manually
                                            </button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="space-y-3">
                                {ingredients.map((ing, idx) => (
                                    <motion.div 
                                        key={ing.foodId}
                                        layout
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center gap-4 p-4 bg-white dark:bg-slate-900 rounded-[1.5rem] border border-slate-100 dark:border-slate-800 group"
                                    >
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white">{ing.foodName}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">
                                                {ing.nutrition.calories > 0 ? `${Math.round(ing.nutrition.calories * (ing.amount / 100))} kcal` : "No nutrition data"}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="number" 
                                                value={ing.amount}
                                                onChange={(e) => {
                                                    const next = [...ingredients];
                                                    next[idx].amount = parseInt(e.target.value) || 0;
                                                    setIngredients(next);
                                                }}
                                                className="w-20 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-3 py-1.5 rounded-xl text-center text-sm font-bold outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                            <span className="text-xs font-bold text-slate-400 uppercase">{ing.unit}</span>
                                            <button 
                                                onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                                                className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </section>

                        {/* Section 3: Directions */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4 text-blue-500">
                                <FileText size={24} />
                                <h3 className="text-xl font-black uppercase tracking-widest">Directions</h3>
                            </div>
                            <div className="space-y-4">
                                {directions.map((step, idx) => (
                                    <div key={idx} className="flex gap-4 group">
                                        <div className="w-10 h-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl flex items-center justify-center font-black shrink-0 relative">
                                            {idx + 1}
                                            {directions.length > 1 && (
                                                <button 
                                                    onClick={() => setDirections(directions.filter((_, i) => i !== idx))}
                                                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center scale-0 group-hover:scale-100 transition-transform"
                                                >
                                                    <X size={12} />
                                                </button>
                                            )}
                                        </div>
                                        <textarea 
                                            value={step}
                                            onChange={(e) => {
                                                const next = [...directions];
                                                next[idx] = e.target.value;
                                                setDirections(next);
                                            }}
                                            placeholder={`Step ${idx + 1} instructions...`}
                                            className="flex-1 bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 focus:ring-2 focus:ring-blue-500 outline-none text-slate-700 dark:text-slate-300 font-medium min-h-[80px]"
                                        />
                                    </div>
                                ))}
                                <button 
                                    onClick={() => setDirections([...directions, ""])}
                                    className="w-full flex items-center justify-center gap-2 p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 hover:text-blue-500 hover:border-blue-500 transition-all font-bold text-sm"
                                >
                                    <Plus size={18} /> Add Step
                                </button>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT: Properties & Nutrition Panel */}
                    <div className="lg:col-span-4 space-y-8 lg:sticky lg:top-32 h-fit">
                        
                        {/* Recipe Properties */}
                        <div className="p-8 bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 space-y-8 shadow-sm">
                            <div className="space-y-6">
                                <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Meal Properties</h4>
                                
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Meal Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {["breakfast", "lunch", "dinner", "snack"].map(type => (
                                            <button 
                                                key={type}
                                                onClick={() => {
                                                    const current = mealTypes;
                                                    const next = current.includes(type as MealType) 
                                                        ? current.filter(t => t !== type) 
                                                        : [...current, type as MealType];
                                                    setMealTypes(next);
                                                }}
                                                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                                                    mealTypes.includes(type as MealType) 
                                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" 
                                                        : "bg-slate-50 dark:bg-slate-800 text-slate-400"
                                                }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Prep Time (min)</label>
                                        <div className="relative">
                                            <Timer className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            <input 
                                                type="number" 
                                                value={prepTime}
                                                onChange={(e) => setPrepTime(parseInt(e.target.value) || 0)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Cook Time (min)</label>
                                        <div className="relative">
                                            <Timer className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                                            <input 
                                                type="number" 
                                                value={cookTime}
                                                onChange={(e) => setCookTime(parseInt(e.target.value) || 0)}
                                                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Planned Servings</label>
                                    <div className="relative">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="number" 
                                            value={servings}
                                            onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                                            className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-2xl text-sm font-bold outline-none border border-transparent focus:border-emerald-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Automatic Nutrition Panel */}
                        <div className="p-8 bg-slate-900 dark:bg-black rounded-[3rem] text-white shadow-2xl space-y-8 relative overflow-hidden">
                            <PieChartIcon className="absolute -right-8 -bottom-8 w-48 h-48 opacity-10 rotate-12" />
                            
                            <div className="relative z-10">
                                <h4 className="text-xl font-black uppercase tracking-widest italic mb-6">Real-time Nutrients</h4>
                                
                                <div className="flex flex-col items-center mb-8">
                                    <span className="text-5xl font-black text-emerald-400 tracking-tighter">
                                        {Math.round(totalNutrition.calories / servings)}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">kcal / serving</span>
                                </div>

                                <div className="space-y-6">
                                    {[
                                        { label: "Protein", value: `${Math.round(totalNutrition.protein / servings)}g`, bar: "bg-blue-500", pct: Math.min(100, (totalNutrition.protein / servings) * 2) },
                                        { label: "Carbs", value: `${Math.round(totalNutrition.carbs / servings)}g`, bar: "bg-emerald-500", pct: Math.min(100, (totalNutrition.carbs / servings)) },
                                        { label: "Fat", value: `${Math.round(totalNutrition.fat / servings)}g`, bar: "bg-amber-500", pct: Math.min(100, (totalNutrition.fat / servings) * 2.5) }
                                    ].map(macro => (
                                        <div key={macro.label} className="space-y-2">
                                            <div className="flex justify-between items-center text-xs font-bold uppercase tracking-tight">
                                                <span className="opacity-50">{macro.label}</span>
                                                <span>{macro.value}</span>
                                            </div>
                                            <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                                <div className={`h-full ${macro.bar}`} style={{ width: `${macro.pct}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="mt-10 p-4 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-3">
                                    <Info size={16} className="text-emerald-500" />
                                    <p className="text-[10px] font-medium text-slate-400">Nutrition data is aggregated from your selected ingredients.</p>
                                </div>
                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </div>
    );
}

function BarChart(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <line x1="12" x2="12" y1="20" y2="10" />
            <line x1="18" x2="18" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="16" />
        </svg>
    )
}
