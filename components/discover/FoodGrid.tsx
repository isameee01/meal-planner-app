"use client";

import { motion, AnimatePresence } from "framer-motion";
import FoodCard from "./FoodCard";
import { FoodItem } from "../../lib/discover-db";

interface FoodGridProps {
    foods: FoodItem[];
    onAddToPlanner: (food: FoodItem) => void;
    onOpenNutrition: (food: FoodItem) => void;
    viewMode: "grid" | "list";
}

export default function FoodGrid({ 
    foods, 
    onAddToPlanner, 
    onOpenNutrition,
    viewMode 
}: FoodGridProps) {
    if (foods.length === 0) return null;

    return (
        <div className={`p-4 lg:p-8 max-w-7xl mx-auto ${
            viewMode === "grid" 
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" 
                : "flex flex-col gap-6"
        }`}>
            <AnimatePresence mode="popLayout">
                {foods.map((food) => (
                    <FoodCard 
                        key={food.id}
                        food={food}
                        onAddToPlanner={onAddToPlanner}
                        onOpenNutrition={onOpenNutrition}
                        viewMode={viewMode}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
}
