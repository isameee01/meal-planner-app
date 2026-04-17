"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { 
    Check,
    ChevronDown,
    Utensils, 
    Wheat, 
    Droplets, 
    Leaf, 
    Coffee, 
    Cookie, 
    Milk, 
    Flame as Spice, 
    Container, 
    Beef, 
    Cherry, 
    Shell, 
    GlassWater as Bottle, 
    IceCream,
    ChefHat
} from "lucide-react";

export interface GroceryItem {
    id: string;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    image?: string;
}

interface GroceryItemCardProps {
    item: GroceryItem;
    selected: boolean;
    onToggle: (id: string) => void;
    onUpdate: (id: string, updates: Partial<GroceryItem>) => void;
}

// Image Mapping System - High Quality Placeholders
const IMAGE_MAP: Record<string, string> = {
    // --- Proteins & Meats ---
    "chicken breast": "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=200&h=200",
    "grilled salmon": "https://images.unsplash.com/photo-1485921325833-c519f76c4927?auto=format&fit=crop&w=200&h=200",
    "ground beef": "https://images.unsplash.com/photo-1588168333986-5078d3ae3976?auto=format&fit=crop&w=200&h=200",
    "sausage": "https://images.unsplash.com/photo-1547050605-2f125021ed20?auto=format&fit=crop&w=200&h=200",
    
    // --- Dairy ---
    "milk": "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=200&h=200",
    "greek yogurt": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=200&h=200",
    "cheese": "https://images.unsplash.com/photo-1486297678162-ad2a19b05840?auto=format&fit=crop&w=200&h=200",
    "eggs": "https://images.unsplash.com/photo-1582722872445-44ad5f7844dd?auto=format&fit=crop&w=200&h=200",
    
    // --- Produce ---
    "avocado": "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=200&h=200",
    "broccoli": "https://images.unsplash.com/photo-1452960962994-acf4fd70b632?auto=format&fit=crop&w=200&h=200",
    "banana": "https://images.unsplash.com/photo-1603833665858-e81b1c7e6ddb?auto=format&fit=crop&w=200&h=200",
    "spinach": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=200&h=200",
    "onion": "https://images.unsplash.com/photo-1518977822534-7049a6ecf73e?auto=format&fit=crop&w=200&h=200",
    "garlic": "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?auto=format&fit=crop&w=200&h=200",
    "berries": "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=200&h=200",
    
    // --- Pantry & Others ---
    "oatmeal": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=200&h=200",
    "olive oil": "https://images.unsplash.com/photo-1474979266404-7eaacbacf82a?auto=format&fit=crop&w=200&h=200",
    "almonds": "https://images.unsplash.com/photo-1508815121350-f2da6e140de4?auto=format&fit=crop&w=200&h=200",
    "chocolate": "https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=200&h=200",
};

const CATEGORY_ICONS: Record<string, any> = {
    "Dairy Products": Milk,
    "Spices and Herbs": Spice,
    "Fats and Oils": Droplets,
    "Soups, Sauces, and Gravies": Container,
    "Sausages and Meats": Spice, // Using Spice icon as a visual stand-in for savory meats
    "Fruits": Cherry,
    "Vegetables": Leaf,
    "Nuts and Seeds": Shell,
    "Beef Products": Beef,
    "Beverages": Bottle,
    "Sweets": IceCream,
    "Proteins": Utensils,
    "Pantry": ChefHat,
    "Snacks": Cookie,
};

import Link from "next/link";

const GroceryItemCard = React.memo(({ item, selected, onToggle, onUpdate }: GroceryItemCardProps) => {
    const [imgError, setImgError] = useState(false);
    const Icon = CATEGORY_ICONS[item.category] || Utensils;
    const imageUrl = IMAGE_MAP[item.name.toLowerCase()] || "";

    const units = [
        "g", "kg", "oz", "lb", "cup", "tbsp", "tsp", "piece", "serving", "ml", "L"
    ];

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`group relative flex items-center p-3 bg-white dark:bg-slate-900 rounded-[32px] border transition-all duration-300 ${
                selected 
                    ? "border-emerald-500 ring-4 ring-emerald-500/5 bg-emerald-50/10" 
                    : "border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/5"
            }`}
        >
            {/* Multi-Select Action */}
            <button 
                onClick={(e) => { e.stopPropagation(); onToggle(item.id); }}
                className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                    selected 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500"
                }`}
            >
                {selected && <Check size={14} strokeWidth={4} />}
            </button>

            {/* Main Clickable Area (Deep Navigation) */}
            <Link 
                href={`/dashboard/ingredients/${encodeURIComponent(item.name)}`}
                className="flex items-center flex-1 min-w-0 mx-4 group/inner"
            >
                <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-800 flex flex-shrink-0 items-center justify-center overflow-hidden border border-slate-100 dark:border-slate-700 group-hover/inner:scale-110 transition-transform duration-500 shadow-sm">
                    {!imgError && imageUrl ? (
                        <img 
                            src={imageUrl} 
                            alt={item.name}
                            onError={() => setImgError(true)}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <Icon size={24} className="text-emerald-500/40" />
                    )}
                </div>

                <div className="flex-1 min-w-0 ml-4 mr-2">
                    <h4 className="text-sm font-black text-slate-800 dark:text-slate-100 truncate uppercase mt-0.5 leading-tight group-hover/inner:text-emerald-500 transition-colors">
                        {item.name}
                    </h4>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1.5 flex items-center">
                        <span className="w-1.5 h-px bg-emerald-500/50 mr-2" />
                        {item.category}
                    </p>
                </div>
            </Link>

            {/* Real-time Inventory Controls */}
            <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-800/80 rounded-[20px] p-2 border border-slate-100 dark:border-slate-700 min-w-[70px]">
                <input 
                    type="number" 
                    min="0"
                    step="0.01"
                    value={item.quantity}
                    onChange={(e) => onUpdate(item.id, { quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-transparent border-none text-center text-xs font-black text-slate-900 dark:text-white focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="relative mt-1 group/unit w-full flex justify-center border-t border-slate-200 dark:border-slate-700 pt-1.5">
                    <select 
                        value={item.unit}
                        onMouseDown={(e) => e.stopPropagation()}
                        onChange={(e) => { e.stopPropagation(); onUpdate(item.id, { unit: e.target.value }); }}
                        className="appearance-none bg-transparent w-full text-center pr-3 py-0.5 text-[9px] font-black uppercase text-slate-400 dark:text-slate-500 border-none focus:ring-0 cursor-pointer"
                    >
                        {units.map(u => (
                            <option key={u} value={u} className="bg-white dark:bg-slate-900">{u}</option>
                        ))}
                    </select>
                    <ChevronDown size={8} className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" />
                </div>
            </div>
        </motion.div>
    );
});

GroceryItemCard.displayName = "GroceryItemCard";

export default GroceryItemCard;
