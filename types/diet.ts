export type DietType = 
    | "anything"
    | "keto"
    | "mediterranean"
    | "paleo"
    | "vegan"
    | "vegetarian";

export type PrimaryDiet = {
    id: string;
    type: DietType;
    label: string;
    description: string;
    iconName?: string; // name of a lucide icon
    colorClass?: string; // a tailwind class color theme
    exclusions: string[]; // List of tags or ingredients
};

export type FoodExclusion = {
    id: string;
    name: string;
    category: string;
};
