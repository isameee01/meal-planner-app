"use client";

import { X, Heart, ShieldCheck, Download, Printer, PieChart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FoodItem } from "../../lib/discover-db";

interface NutritionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    food: FoodItem | null;
}

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface NutritionDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    food: FoodItem | null;
}

export default function NutritionDetailsModal({ isOpen, onClose, food }: NutritionDetailsModalProps) {
    if (!food) return null;

    // Normalize nutrition data (handle both static and AI structures)
    const calories = food.nutrition?.calories ?? food.calories ?? 0;
    const protein = food.nutrition?.protein ?? food.protein ?? 0;
    const carbs = food.nutrition?.carbs ?? food.carbs ?? 0;
    const fat = food.nutrition?.fat ?? food.fat ?? 0;
    const fiber = food.nutrition?.fiber ?? food.fiber ?? 0;
    const sugarTotal = food.nutrition?.sugar?.total ?? food.sugar ?? 0;
    const sugarAdded = food.nutrition?.sugar?.added ?? 0;
    
    const vitamins = food.nutrition?.vitamins ?? {};
    const minerals = food.nutrition?.minerals ?? {};
    const aminoAcids = food.nutrition?.aminoAcids ?? {};
    const fatBreakdown = food.nutrition?.fatBreakdown ?? { saturated: 0, polyunsaturated: 0, monounsaturated: 0, trans: 0 };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const title = `${food.name} - Nutritional Report`;
        
        doc.setFontSize(22);
        doc.text(title, 14, 20);
        
        doc.setFontSize(12);
        doc.setTextColor(100);
        doc.text(`Official Nutritional Data | Serving Size: ${food.serving}`, 14, 30);
        
        // 1. Macros Table
        autoTable(doc, {
            startY: 40,
            head: [['Nutrient', 'Value', 'Daily Context']],
            body: [
                ['Calories', `${Math.round(calories)} kcal`, 'Energy Source'],
                ['Protein', `${Math.round(protein)}g`, 'Muscle Support'],
                ['Carbohydrates', `${Math.round(carbs)}g`, 'Energy'],
                ['Total Fat', `${Math.round(fat)}g`, 'Essential Fatty Acids'],
                ['Fiber', `${Math.round(fiber)}g`, 'Digestion'],
                ['Sugars', `${Math.round(sugarTotal)}g`, 'Natural & Added']
            ],
            theme: 'striped',
            headStyles: { fillColor: [16, 185, 129] }
        });

        // 2. Vitamins & Minerals
        const finalY = (doc as any).lastAutoTable.finalY || 40;
        doc.setFontSize(16);
        doc.setTextColor(0);
        doc.text("Vitamins & Minerals", 14, finalY + 15);

        const vits = Object.entries(vitamins).map(([k, v]) => [k.replace("vitamin", "Vit "), v]);
        const mins = Object.entries(minerals).map(([k, v]) => [k, v]);
        
        autoTable(doc, {
            startY: finalY + 20,
            head: [['Vitamin', 'Amount', 'Mineral', 'Amount']],
            body: Array.from({ length: Math.max(vits.length, mins.length) }).map((_, i) => [
                vits[i]?.[0] || "-", vits[i]?.[1] || "-",
                mins[i]?.[0] || "-", mins[i]?.[1] || "-"
            ]),
            theme: 'grid',
            headStyles: { fillColor: [59, 130, 246] }
        });

        // 3. Amino Acids
        const finalY2 = (doc as any).lastAutoTable.finalY;
        doc.setFontSize(16);
        doc.text("Amino Acid Profile", 14, finalY2 + 15);
        
        const aminos = Object.entries(aminoAcids).map(([k, v]) => [k, v]);
        autoTable(doc, {
            startY: finalY2 + 20,
            head: [['Amino Acid', 'Concentration']],
            body: aminos,
            theme: 'striped',
            headStyles: { fillColor: [107, 114, 128] }
        });

        doc.save(`${food.name.toLowerCase().replace(/\s+/g, '-')}-nutrition.pdf`);
    };

    const handlePrint = () => {
        window.print();
    };

    const sections = [
        {
            title: "Macronutrients",
            icon: PieChart,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            items: [
                { label: "Calories", value: `${Math.round(calories)} kcal`, sub: "Daily Energy" },
                { label: "Protein", value: `${Math.round(protein)}g`, sub: "Muscle Repair" },
                { label: "Carbs", value: `${Math.round(carbs)}g`, sub: "Energy Source" },
                { label: "Fat", value: `${Math.round(fat)}g`, sub: "Hormone Health" }
            ]
        },
        {
            title: "Fiber & Sugars",
            icon: BarChart,
            color: "text-amber-500",
            bg: "bg-amber-50",
            items: [
                { label: "Dietary Fiber", value: `${Math.round(fiber)}g`, sub: "Digestive Health" },
                { label: "Total Sugars", value: `${Math.round(sugarTotal)}g`, sub: "Natural/Added" },
                { label: "Added Sugars", value: `${Math.round(sugarAdded)}g`, sub: "Limit Daily" },
                { label: "Glucose", value: "N/A", sub: "Simple Sugar" }
            ]
        }
    ];

    const detailedFats = [
        { label: "Saturated Fat", value: `${fatBreakdown.saturated || 0}g` },
        { label: "Polyunsaturated", value: `${fatBreakdown.polyunsaturated || 0}g` },
        { label: "Monounsaturated", value: `${fatBreakdown.monounsaturated || 0}g` },
        { label: "Trans Fat", value: `${fatBreakdown.trans || 0}g` }
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[110] no-print"
                    />
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-950 rounded-[2.5rem] shadow-2xl z-[111] overflow-hidden flex flex-col print-content"
                    >
                        {/* Header */}
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                            <div>
                                <div className="flex items-center gap-3 mb-1">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white">{food.name}</h2>
                                    <span className="px-3 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20 no-print">Official Data</span>
                                </div>
                                <p className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                                    <ShieldCheck size={16} className="text-emerald-500" />
                                    Detailed Nutritional Profile per {food.serving}
                                </p>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-3 bg-white dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 rounded-2xl transition-all shadow-sm border border-slate-100 dark:border-slate-700 no-print"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-8 space-y-10 scrollbar-hide">
                            {/* Detailed content same as before ... */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sections.map(section => (
                                    <div key={section.title} className="space-y-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${section.bg}`}>
                                                <section.icon size={20} className={section.color} />
                                            </div>
                                            <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-sm">{section.title}</h3>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            {section.items.map(item => (
                                                <div key={item.label} className="p-4 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 tracking-tight">{item.label}</p>
                                                    <p className="text-lg font-black text-slate-800 dark:text-slate-100">{item.value}</p>
                                                    <p className="text-[10px] text-slate-500 font-medium">{item.sub}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" /> Fat Breakdown
                                    </h4>
                                    <div className="space-y-3">
                                        {detailedFats.map(fat => (
                                            <div key={fat.label} className="flex justify-between items-center text-sm">
                                                <span className="text-slate-500 font-medium">{fat.label}</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{fat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> Vitamins
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                        {Object.entries(vitamins).length > 0 ? Object.entries(vitamins).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center text-[13px]">
                                                <span className="text-slate-500 font-medium capitalize">{key.replace("vitamin", "Vit ")}</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{value as string}</span>
                                            </div>
                                        )) : <p className="text-[10px] text-slate-400 italic">Standard profile.</p>}
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Minerals
                                    </h4>
                                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                                        {Object.entries(minerals).length > 0 ? Object.entries(minerals).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center text-[13px]">
                                                <span className="text-slate-500 font-medium capitalize">{key}</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200">{value as string}</span>
                                            </div>
                                        )) : <p className="text-[10px] text-slate-400 italic">Standard profile.</p>}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row gap-4 items-center justify-between no-print">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                                <Info size={14} />
                                <span>Nutritional values are calculated based on FDA standards.</span>
                            </div>
                            <div className="flex gap-3">
                                <button 
                                    onClick={handlePrint}
                                    className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-2xl font-bold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
                                >
                                    <Printer size={18} />
                                    <span>Print</span>
                                </button>
                                <button 
                                    onClick={handleDownloadPDF}
                                    className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200/50 transition-all"
                                >
                                    <Download size={18} />
                                    <span>Download PDF</span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
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

function BarChart2(props: any) {
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
            <line x1="18" x2="18" y1="20" y2="10" />
            <line x1="12" x2="12" y1="20" y2="4" />
            <line x1="6" x2="6" y1="20" y2="14" />
        </svg>
    )
}

import { BarChart as BarIcon, Info, Activity } from "lucide-react";
