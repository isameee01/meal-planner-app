import { PrimaryDiet } from "../../types/diet";

export const AVAILABLE_DIETS: PrimaryDiet[] = [
    {
        id: "anything",
        type: "anything",
        label: "Anything",
        description: "No restrictions. You eat everything.",
        iconName: "Utensils",
        colorClass: "bg-slate-500",
        exclusions: []
    },
    {
        id: "keto",
        type: "keto",
        label: "Keto",
        description: "Excludes: High-carb grains, refined starches, sugar",
        iconName: "Flame",
        colorClass: "bg-purple-500",
        exclusions: ["high-carb", "grains", "refined-starches", "sugar", "bread", "pasta", "rice"]
    },
    {
        id: "mediterranean",
        type: "mediterranean",
        label: "Mediterranean",
        description: "Excludes: Red meat, processed foods, refined sugar",
        iconName: "Fish",
        colorClass: "bg-blue-500",
        exclusions: ["red-meat", "beef", "pork", "processed-foods", "sugar"]
    },
    {
        id: "paleo",
        type: "paleo",
        label: "Paleo",
        description: "Excludes: Dairy, grains, legumes, processed foods",
        iconName: "Bone",
        colorClass: "bg-orange-500",
        exclusions: ["dairy", "cheese", "milk", "yogurt", "grains", "bread", "pasta", "rice", "legumes", "beans", "peanuts", "processed-foods"]
    },
    {
        id: "vegan",
        type: "vegan",
        label: "Vegan",
        description: "Excludes: Meat, poultry, fish, dairy, eggs",
        iconName: "Leaf",
        colorClass: "bg-green-600",
        exclusions: ["meat", "beef", "pork", "poultry", "chicken", "turkey", "fish", "salmon", "seafood", "dairy", "cheese", "milk", "yogurt", "eggs", "honey"]
    },
    {
        id: "vegetarian",
        type: "vegetarian",
        label: "Vegetarian",
        description: "Excludes: Meat, poultry, fish",
        iconName: "Carrot",
        colorClass: "bg-lime-500",
        exclusions: ["meat", "beef", "pork", "poultry", "chicken", "turkey", "fish", "salmon", "seafood"]
    }
];
