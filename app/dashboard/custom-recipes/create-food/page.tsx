"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Camera, Trash2, Check, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../../../components/dashboard/Sidebar";
import Header from "../../../../components/dashboard/Header";
import { useTheme } from "../../../../components/ThemeProvider";
import { useCustomFoods } from "../../../../lib/hooks/useCustomFoods";
import { CustomFood } from "../../../../types/custom-recipes";

export default function CreateFoodPage() {
    const [collapsed, setCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const router = useRouter();
    const { addFood } = useCustomFoods();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const [servingUnit, setServingUnit] = useState<"grams" | "servings">("servings");
    const [servingSize, setServingSize] = useState("1");
    const [servingsPerPackage, setServingsPerPackage] = useState("");
    const [price, setPrice] = useState("");
    const [calories, setCalories] = useState("");
    const [carbs, setCarbs] = useState("");
    const [fats, setFats] = useState("");
    const [protein, setProtein] = useState("");
    
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => setMounted(true), []);

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

    const validate = () => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = "Food name is required";
        if (!servingSize || isNaN(Number(servingSize))) newErrors.servingSize = "Valid serving size is required";
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        
        setIsSaving(true);
        const newFood: CustomFood = {
            id: crypto.randomUUID(),
            name,
            description,
            image: image || `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80`, // Random fallback
            servingSize: Number(servingSize),
            servingUnit,
            servingsPerPackage: servingsPerPackage ? Number(servingsPerPackage) : undefined,
            price: price ? Number(price) : undefined,
            calories: Number(calories) || 0,
            carbs: Number(carbs) || 0,
            fats: Number(fats) || 0,
            protein: Number(protein) || 0,
            createdAt: new Date().toISOString()
        };

        try {
            addFood(newFood);
            setTimeout(() => {
                router.push("/dashboard/custom-recipes");
            }, 800);
        } catch (e) {
            console.error(e);
            setIsSaving(false);
        }
    };

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors overflow-hidden">
            <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

            <main className={`flex-1 flex flex-col min-w-0 transition-all duration-300 h-screen ${collapsed ? "lg:ml-[80px]" : "lg:ml-[280px]"}`}>
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
                    <div className="max-w-3xl mx-auto space-y-8 pb-20">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <button 
                                onClick={() => router.back()}
                                className="flex items-center space-x-2 text-slate-500 hover:text-emerald-500 transition-colors font-bold text-sm"
                            >
                                <ArrowLeft size={18} />
                                <span>Back to Library</span>
                            </button>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100 uppercase tracking-tight">Create Custom Food</h2>
                        </div>

                        {/* Form Sections */}
                        <div className="space-y-6">
                            {/* SECTION 1: BASIC INFO */}
                            <FormSection title="1. Basic Information" description="Name your food and give it a quick description.">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Name (Required)</label>
                                        <input 
                                            value={name}
                                            onChange={(e) => {setName(e.target.value); if(errors.name) validate();}}
                                            placeholder="e.g. Grandma's Apple Pie"
                                            className={`w-full bg-slate-100 dark:bg-slate-800 border-2 transition-all px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium ${
                                                errors.name ? "border-red-400 ring-2 ring-red-400/10" : "border-transparent focus:border-emerald-500"
                                            }`}
                                        />
                                        {errors.name && (
                                            <p className="flex items-center space-x-1 text-red-500 text-[10px] font-bold uppercase tracking-wider mt-1 px-1">
                                                <AlertCircle size={10} />
                                                <span>{errors.name}</span>
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Description</label>
                                        <textarea 
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            rows={3}
                                            placeholder="Tell us more about this food..."
                                            className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium resize-none"
                                        />
                                    </div>
                                </div>
                            </FormSection>

                            {/* SECTION 2: IMAGE */}
                            <FormSection title="2. Visuals" description="Add a high-quality image to make it stand out.">
                                <div className="flex flex-col items-center">
                                    <div className="relative group w-full aspect-video rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center transition-all hover:border-emerald-500/50">
                                        {image ? (
                                            <>
                                                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-4">
                                                    <button 
                                                        onClick={() => fileInputRef.current?.click()}
                                                        className="p-3 bg-white text-emerald-500 rounded-full hover:scale-110 transition-transform"
                                                    >
                                                        <Camera size={20} />
                                                    </button>
                                                    <button 
                                                        onClick={() => setImage(null)}
                                                        className="p-3 bg-white text-red-500 rounded-full hover:scale-110 transition-transform"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </>
                                        ) : (
                                            <button 
                                                onClick={() => fileInputRef.current?.click()}
                                                className="flex flex-col items-center space-y-3 text-slate-400 hover:text-emerald-500 transition-colors"
                                            >
                                                <div className="w-14 h-14 bg-white dark:bg-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                                                    <Upload size={24} />
                                                </div>
                                                <span className="font-black text-xs uppercase tracking-widest">Click to upload photo</span>
                                            </button>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={fileInputRef} 
                                            onChange={handleImageChange} 
                                            className="hidden" 
                                            accept="image/*"
                                        />
                                    </div>
                                </div>
                            </FormSection>

                            {/* SECTION 3: SERVING SIZE */}
                            <FormSection title="3. Serving Size" description="How do you measure this food?">
                                <div className="space-y-6">
                                    <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl w-fit">
                                        {(["servings", "grams"] as const).map((unit) => (
                                            <button
                                                key={unit}
                                                onClick={() => setServingUnit(unit)}
                                                className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                                                    servingUnit === unit 
                                                        ? "bg-white dark:bg-slate-700 text-emerald-500 shadow-sm" 
                                                        : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                                }`}
                                            >
                                                {unit}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Serving Amount</label>
                                        <div className="relative group">
                                            <input 
                                                type="number"
                                                value={servingSize}
                                                onChange={(e) => setServingSize(e.target.value)}
                                                className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all font-black text-xl px-4 py-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 pr-32"
                                            />
                                            <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-400 pointer-events-none uppercase text-xs tracking-widest">
                                                {servingUnit}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </FormSection>

                            {/* SECTION 4: NUTRITION */}
                            <FormSection title="4. Detailed Nutrition" description="Enter the macros for one serving.">
                                <div className="grid grid-cols-2 gap-4">
                                    <NutritionInput label="Calories" value={calories} onChange={setCalories} unit="kcal" color="bg-orange-500" />
                                    <NutritionInput label="Protein" value={protein} onChange={setProtein} unit="g" color="bg-emerald-500" />
                                    <NutritionInput label="Carbs" value={carbs} onChange={setCarbs} unit="g" color="bg-blue-500" />
                                    <NutritionInput label="Fats" value={fats} onChange={setFats} unit="g" color="bg-yellow-500" />
                                </div>
                            </FormSection>

                            {/* ACTIONS */}
                            <div className="pt-10 flex items-center space-x-4">
                                <button 
                                    onClick={() => router.back()}
                                    className="flex-1 px-8 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl hover:bg-slate-200 transition-all font-black uppercase tracking-widest text-sm"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSave}
                                    disabled={!name || isSaving}
                                    className="flex-[2] px-8 py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20 font-black uppercase tracking-widest text-sm flex items-center justify-center space-x-3 disabled:opacity-50 disabled:grayscale"
                                >
                                    {isSaving ? (
                                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                                            <Check size={20} />
                                        </motion.div>
                                    ) : (
                                        <>
                                            <Check size={20} />
                                            <span>Save Custom Food</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

function FormSection({ title, description, children }: { title: string, description: string, children: React.ReactNode }) {
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white dark:bg-slate-900 rounded-[32px] p-8 space-y-6 border border-slate-100 dark:border-slate-800 shadow-xl shadow-emerald-500/[0.02]"
        >
            <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight">{title}</h3>
                <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">{description}</p>
            </div>
            {children}
        </motion.div>
    );
}

function NutritionInput({ label, value, onChange, unit, color }: {
    label: string;
    value: string;
    onChange: (val: string) => void;
    unit: string;
    color: string;
}) {
    return (
        <div className="space-y-1.5 focus-within:scale-[1.02] transition-transform">
            <div className="flex items-center space-x-2 px-1">
                <div className={`w-2 h-2 rounded-full ${color}`}></div>
                <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">{label}</label>
            </div>
            <div className="relative group">
                <input 
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="0"
                    className="w-full bg-slate-100 dark:bg-slate-800 border-2 border-transparent focus:border-emerald-500 transition-all font-black text-lg px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 pr-20"
                />
                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-slate-300 pointer-events-none uppercase text-[10px] tracking-widest italic">
                    {unit}
                </span>
            </div>
        </div>
    );
}
