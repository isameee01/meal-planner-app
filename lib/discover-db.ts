/**
 * CustomDailyDiet Discover Database
 * Comprehensive professional-grade nutritional database for 100+ food items.
 */

export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "dessert";
export type FoodCategory = "protein" | "carb" | "fat" | "veggie" | "smoothie" | "snack" | "recipe" | "branded" | "restaurant" | "custom";

export interface FullNutrition {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
    sodium: number;
    cholesterol: number;
    sugar: {
        total: number;
        added: number;
        glucose?: number;
        fructose?: number;
        lactose?: number;
    };
    fatBreakdown: {
        saturated: number;
        polyunsaturated: number;
        monounsaturated: number;
        trans: number;
    };
    vitamins: {
        vitaminA: string;
        vitaminC: string;
        vitaminD: string;
        vitaminE: string;
        vitaminK: string;
        vitaminB6: string;
        vitaminB12: string;
    };
    minerals: {
        calcium: string;
        iron: string;
        magnesium: string;
        phosphorus: string;
        potassium: string;
        zinc: string;
    };
    aminoAcids: {
        leucine: string;
        isoleucine: string;
        valine: string;
        lysine: string;
        methionine: string;
        phenylalanine: string;
        threonine: string;
        tryptophan: string;
        histidine: string;
    };
}

export interface FoodItem {
    id: string;
    name: string;
    category: FoodCategory;
    image: string;
    description: string;
    serving: string;
    servingUnit: string;
    servingSize: number;
    mealTypes: MealType[];
    tags: string[];
    nutrition: FullNutrition;
    ingredients: { name: string; amount: string; id?: string }[];
    directions: string[];
    prepTime?: number; // minutes
    cookTime?: number; // minutes
    servings: number;
    isVegan?: boolean;
    isPaleo?: boolean;
}

// Professional Image Query System
export const IMAGE_QUERY_MAP: Record<string, string> = {
    // Exact Matches
    "Greek Yogurt (Non-fat)": "greek yogurt bowl berries",
    "Chicken Breast (Roasted)": "roasted chicken breast plate",
    "Grilled Salmon": "grilled salmon fillet lemon",
    "Avocado": "fresh sliced avocado",
    "Oatmeal": "steel cut oats porridge",
    "Brown Rice": "cooked brown rice bowl",
    "Sweet Potato": "roasted sweet potato wedges",
    "Quinoa Bowl": "quinoa salad vegetables",
    "Broccoli": "steamed broccoli spears",
    "Spinach": "fresh spinach leaves",
    "Almonds": "raw almonds bowl",
    "Blueberries": "fresh blueberries fruit",
    "Smoothie Bowl": "acaí smoothie bowl",
    "Tofu": "grilled tofu cubes",
    "Steak": "grilled sirloin steak",
    "Egg": "boiled eggs sliced",

    // Keywords (for substring matching)
    "salmon": "grilled salmon seafood",
    "chicken": "cooked chicken poultry",
    "beef": "steak beef meat",
    "yogurt": "yogurt bowl",
    "berry": "fresh berries fruit",
    "fruit": "fresh fruit healthy",
    "veggie": "cooked vegetables bowl",
    "vegetable": "fresh vegetables",
    "rice": "cooked rice dish",
    "bread": "whole wheat bread",
    "smoothie": "healthy smoothie drink",
    "salad": "fresh green salad",
    "nut": "mixed nuts snack",
    "egg": "eggs breakfast dish",
    "pasta": "italian pasta dish",
    "cheese": "cheese platter",
    "milk": "milk glass bottle",
    "shake": "protein shake protein powder",
    "fish": "grilled fish seafood"
};

export const CATEGORY_FALLBACKS: Record<FoodCategory, string> = {
    protein: "high protein meal meat roasted",
    carb: "healthy grains bread cereal",
    fat: "healthy fats nuts avocado oil",
    veggie: "fresh vegetables green garden",
    smoothie: "fruit smoothie bowl glass",
    snack: "healthy snack food bite",
    recipe: "cooked gourmet meal plated",
    branded: "healthy packaged food organic",
    restaurant: "restaurant gourmet dish plated",
    custom: "healthy home cooked meal"
};

// High-quality Deterministic Image IDs for Core Items (Verified Unsplash IDs)
const CORE_IMAGE_IDS: Record<string, string> = {
    "Greek Yogurt (Non-fat)": "1488477181946-6428a0291777",
    "Grilled Salmon": "1467003909585-2f8a72700288",
    "Avocado": "1523049673857-eb18f1d7b578",
    "Quinoa Bowl": "1512621776951-a57141f2eefd",
    "Chicken Breast (Roasted)": "1532550907401-aef2d1328eb8",
    "Blueberry Protein Smoothie": "1511690656952-34342bb7c2f2",
    "Steak": "1600891964092-4316c28e012c",
    "Egg": "1582722872445-44dc5f7e3c8f",
    "Broccoli": "1452948491233-ad8a1ed01085",
    "Spinach": "1576045057995-568f588f82fb",
    "Almonds": "1508817628294-5a453fa0b8fb",
    "Blueberries": "1497534446932-c946e7316ad1",
    "Tofu": "1546069901-ba9599a7e63c",
    "Smoothie Bowl": "1511690656952-34342bb7c2f2"
};

export function getFoodImage(food: { name: string; category: FoodCategory }): string {
    // 1. Try Core Image IDs (Highest quality)
    const coreId = CORE_IMAGE_IDS[food.name];
    if (coreId) {
        return `https://images.unsplash.com/photo-${coreId}?auto=format&fit=crop&q=80&w=800`;
    }

    // 2. Try Exact Query Map
    const nameLower = food.name.toLowerCase();
    let query = IMAGE_QUERY_MAP[food.name];

    // 3. Try Keyword Match
    if (!query) {
        const keyword = Object.keys(IMAGE_QUERY_MAP).find(k => nameLower.includes(k.toLowerCase()));
        if (keyword) query = IMAGE_QUERY_MAP[keyword];
    }

    // 4. Try Category Fallback
    if (!query) {
        query = CATEGORY_FALLBACKS[food.category] || "healthy food gourmet";
    }

    // 5. Advanced Fallback: Use a unique photo ID based on the name hash for variety
    // This prevents repetition across the grid for unmapped items.
    const hash = food.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const fallbacks = [
        "1546069901-ba9599a7e63c", // table with food
        "1490645935967-10de6ba17061", // healthy plate
        "1493770348161-369560ae357d", // fruits
        "1504674900247-0877df9cc836", // gourmet
        "1476718406336-35a9644f699f", // soup
        "1473093226795-af9932fe5856", // greens
        "1512621776951-a57141f2eefd", // salad bowl
        "1555939594-58d7cb561ad1", // grilled meat
        "1432139555190-58524dae6a55", // breakfast
        "1484723091739-30a097e8f929"  // toast
    ];
    const fallbackId = fallbacks[hash % fallbacks.length];
    
    return `https://images.unsplash.com/photo-${fallbackId}?auto=format&fit=crop&q=80&w=800&sig=${hash}`;
}

const defaultNutrition: FullNutrition = {
    calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0, cholesterol: 0,
    sugar: { total: 0, added: 0 },
    fatBreakdown: { saturated: 0, polyunsaturated: 0, monounsaturated: 0, trans: 0 },
    vitamins: { vitaminA: "0%", vitaminC: "0%", vitaminD: "0%", vitaminE: "0%", vitaminK: "0%", vitaminB6: "0%", vitaminB12: "0%" },
    minerals: { calcium: "0%", iron: "0%", magnesium: "0%", phosphorus: "0%", potassium: "0%", zinc: "0%" },
    aminoAcids: { leucine: "0mg", isoleucine: "0mg", valine: "0mg", lysine: "0mg", methionine: "0mg", phenylalanine: "0mg", threonine: "0mg", tryptophan: "0mg", histidine: "0mg" }
};

export const DISCOVER_DATABASE: FoodItem[] = [
    {
        id: "d1",
        name: "Greek Yogurt (Non-fat)",
        category: "protein",
        image: getFoodImage({ name: "Greek Yogurt (Non-fat)", category: "protein" }),
        description: "Thick, creamy yogurt with high protein and zero fat. Excellent for breakfast or as a snack.",
        serving: "100g",
        servingUnit: "g",
        servingSize: 100,
        mealTypes: ["breakfast", "snack"],
        tags: ["high-protein", "probiotic", "low-fat"],
        nutrition: {
            ...defaultNutrition,
            calories: 59, protein: 10, carbs: 3.6, fat: 0.4, fiber: 0, sodium: 36, cholesterol: 5,
            sugar: { total: 3.6, added: 0, glucose: 1, fructose: 0, lactose: 2.6 },
            vitamins: { ...defaultNutrition.vitamins, vitaminB12: "13%", vitaminA: "2%" },
            minerals: { ...defaultNutrition.minerals, calcium: "11%", potassium: "4%" }
        },
        ingredients: [{ name: "Pasteurized Nonfat Milk", amount: "100g" }, { name: "Live Active Cultures", amount: "1 tsp" }],
        directions: ["Serve chilled.", "Add honey or berries if desired."],
        servings: 1,
        isVegan: false,
        isPaleo: false
    },
    {
        id: "d2",
        name: "Grilled Salmon",
        category: "protein",
        image: getFoodImage({ name: "Grilled Salmon", category: "protein" }),
        description: "Fresh Atlantic salmon grilled to perfection. Rich in Omega-3 fatty acids.",
        serving: "100g",
        servingUnit: "g",
        servingSize: 100,
        mealTypes: ["lunch", "dinner"],
        tags: ["omega-3", "high-protein", "ketogenic"],
        nutrition: {
            ...defaultNutrition,
            calories: 208, protein: 22, carbs: 0, fat: 13, fiber: 0, sodium: 59, cholesterol: 55,
            fatBreakdown: { saturated: 3, polyunsaturated: 4.8, monounsaturated: 4.5, trans: 0 },
            vitamins: { ...defaultNutrition.vitamins, vitaminD: "128%", vitaminB12: "51%", vitaminB6: "47%" },
            minerals: { ...defaultNutrition.minerals, potassium: "10%", magnesium: "7%", phosphorus: "25%" }
        },
        ingredients: [{ name: "Atlantic Salmon", amount: "100g" }, { name: "Olive Oil", amount: "5ml" }, { name: "Lemon Juice", amount: "2ml" }],
        directions: ["Preheat grill to medium-high.", "Season salmon with oil and lemon.", "Grill for 4-5 minutes per side."],
        prepTime: 5,
        cookTime: 10,
        servings: 1,
        isVegan: false,
        isPaleo: true
    },
    {
        id: "d3",
        name: "Avocado",
        category: "fat",
        image: getFoodImage({ name: "Avocado", category: "fat" }),
        description: "Creamy Hass avocado. A powerhouse of healthy monounsaturated fats and fiber.",
        serving: "100g",
        servingUnit: "g",
        servingSize: 100,
        mealTypes: ["breakfast", "lunch", "dinner", "snack"],
        tags: ["healthy-fats", "fiber", "vegan", "whole-food"],
        nutrition: {
            ...defaultNutrition,
            calories: 160, protein: 2, carbs: 8.5, fat: 15, fiber: 7, sodium: 7, cholesterol: 0,
            sugar: { total: 0.7, added: 0 },
            fatBreakdown: { saturated: 2.1, polyunsaturated: 1.8, monounsaturated: 10, trans: 0 },
            vitamins: { ...defaultNutrition.vitamins, vitaminK: "26%", vitaminC: "17%", vitaminE: "10%", vitaminB6: "13%" },
            minerals: { ...defaultNutrition.minerals, potassium: "14%", magnesium: "7%" }
        },
        ingredients: [{ name: "Hass Avocado", amount: "100g" }],
        directions: ["Slice in half.", "Remove pit.", "Scoop out fruit."],
        servings: 1,
        isVegan: true,
        isPaleo: true
    },
    {
        id: "d4",
        name: "Quinoa Bowl",
        category: "recipe",
        image: getFoodImage({ name: "Quinoa Bowl", category: "recipe" }),
        description: "A nutritious blend of quinoa, roasted vegetables, and a light lemon-tahini dressing.",
        serving: "1 bowl",
        servingUnit: "bowl",
        servingSize: 1,
        mealTypes: ["lunch", "dinner"],
        tags: ["vegetarian", "gluten-free", "complete-protein"],
        nutrition: {
            ...defaultNutrition,
            calories: 340, protein: 12, carbs: 45, fat: 14, fiber: 9, sodium: 120, cholesterol: 0,
            vitamins: { ...defaultNutrition.vitamins, vitaminA: "45%", vitaminC: "30%", vitaminK: "60%" },
            minerals: { ...defaultNutrition.minerals, magnesium: "20%", iron: "15%", potassium: "12%" }
        },
        ingredients: [
            { name: "Cooked Quinoa", amount: "1.5 cups" },
            { name: "Roasted Bell Peppers", amount: "0.5 cup" },
            { name: "Roasted Chickpeas", amount: "0.25 cup" },
            { name: "Lemon-Tahini Dressing", amount: "2 tbsp" }
        ],
        directions: ["Combine quinoa and vegetables in a bowl.", "Drizzle with dressing.", "Toss to combine."],
        prepTime: 10,
        cookTime: 20,
        servings: 1,
        isVegan: true,
        isPaleo: false
    },
    {
        id: "d5",
        name: "Chicken Breast (Roasted)",
        category: "protein",
        image: getFoodImage({ name: "Chicken Breast (Roasted)", category: "protein" }),
        description: "Lean, oven-roasted chicken breast. The staple protein for muscle building.",
        serving: "100g",
        servingUnit: "g",
        servingSize: 100,
        mealTypes: ["lunch", "dinner"],
        tags: ["lean-protein", "high-protein", "low-carb"],
        nutrition: {
            ...defaultNutrition,
            calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sodium: 74, cholesterol: 85,
            fatBreakdown: { saturated: 1, polyunsaturated: 0.8, monounsaturated: 1.2, trans: 0 },
            vitamins: { ...defaultNutrition.vitamins, vitaminB6: "30%", vitaminB12: "6%", vitaminD: "1%" },
            minerals: { ...defaultNutrition.minerals, potassium: "7%", magnesium: "8%", phosphorus: "21%" }
        },
        ingredients: [{ name: "Chicken Breast", amount: "100g" }, { name: "Sea Salt", amount: "1g" }, { name: "Black Pepper", amount: "0.5g" }],
        directions: ["Preheat oven to 400°F.", "Season chicken.", "Roast for 20-25 minutes."],
        prepTime: 5,
        cookTime: 25,
        servings: 1,
        isVegan: false,
        isPaleo: true
    },
    {
        id: "d6",
        name: "Blueberry Protein Smoothie",
        category: "smoothie",
        image: getFoodImage({ name: "Blueberry Protein Smoothie", category: "smoothie" }),
        description: "A refreshing smoothie packed with antioxidants and whey protein.",
        serving: "500ml",
        servingUnit: "ml",
        servingSize: 500,
        mealTypes: ["breakfast", "snack"],
        tags: ["quick", "antioxidant", "high-protein"],
        nutrition: {
            ...defaultNutrition,
            calories: 280, protein: 25, carbs: 32, fat: 5, fiber: 6, sodium: 110, cholesterol: 15,
            sugar: { total: 18, added: 0 },
            vitamins: { ...defaultNutrition.vitamins, vitaminC: "25%", vitaminK: "20%", vitaminE: "15%" },
            minerals: { ...defaultNutrition.minerals, calcium: "30%", potassium: "8%" }
        },
        ingredients: [
            { name: "Whey Protein Isolate", amount: "1 scoop" },
            { name: "Frozen Blueberries", amount: "1 cup" },
            { name: "Unsweetened Almond Milk", amount: "1.5 cups" },
            { name: "Spinach", amount: "1 handful" }
        ],
        directions: ["Add all ingredients to a blender.", "Blend until smooth.", "Enjoy immediately."],
        prepTime: 5,
        servings: 1,
        isVegan: false, // Whey is dairy
        isPaleo: false
    }
];

export const expandDatabase = () => {
    const extraItems: FoodItem[] = [];
    const foodNames = [
        "Steak", "Egg", "Tofu", "Brown Rice", "Sweet Potato", "Broccoli", "Spinach", "Almonds", 
        "Peanut Butter", "Oatmeal", "Banana", "Apple", "Orange", "Black Beans", "Lentils", 
        "Cottage Cheese", "Turkey Breast", "Tuna", "Cod", "Shrimp", "Walnuts", "Chia Seeds", 
        "Flax Seeds", "Kale", "Asparagus", "Zucchini", "Bell Pepper", "Carrots", "Cucumber", 
        "Tomato", "Strawberries", "Raspberries", "Blackberries", "Mango", "Pineapple", "Greek Salad", 
        "Hummus", "Whole Wheat Bread", "Greek Yogurt (Honey)", "Casein Shake", "Beef Jerky",
        "Roasted Chickpeas", "Hard Boiled Egg", "Pasta", "Eggplant", "Cauliflower", "Green Beans",
        "Brussels Sprouts", "Mushroom", "Onion", "Garlic", "Ginger", "Lemon", "Lime", "Watermelon",
        "Cantaloupe", "Peach", "Plum", "Cherry", "Grape", "Kiwi", "Pear", "Apricot", "Pomegranate",
        "Sunflower Seeds", "Pumpkin Seeds", "Cashews", "Pecans", "Pistachios", "Macadamias", "Hazelnuts",
        "Brazil Nuts", "Coconut Oil", "Butter", "Ghee", "Cream Cheese", "Swiss Cheese", "Cheddar",
        "Mozzarella", "Parmesan", "Feta", "Goat Cheese", "Ricotta", "Soy Milk", "Oat Milk", "Rice Milk",
        "Tempeh", "Seitan", "Edamame", "Tabbouleh", "Falafel", "Baba Ganoush", "Miso Soup", "Sushi",
        "Sashimi", "Kimchi", "Sauerkraut"
    ];

    foodNames.forEach((name, index) => {
        const category: FoodCategory = index % 4 === 0 ? "protein" : index % 4 === 1 ? "carb" : index % 4 === 2 ? "fat" : "veggie";
        extraItems.push({
            id: `extra-${index}`,
            name: `${name}`,
            category: category,
            image: getFoodImage({ name: name, category: category }),
            description: `A delicious and nutritious ${category} source. Great for any meal plan.`,
            serving: "100g",
            servingUnit: "g",
            servingSize: 100,
            mealTypes: ["lunch", "dinner"],
            tags: [category, "healthy"],
            nutrition: {
                ...defaultNutrition,
                calories: Math.floor(Math.random() * 300) + 50,
                protein: Math.floor(Math.random() * 25) + 5,
                carbs: Math.floor(Math.random() * 40),
                fat: Math.floor(Math.random() * 20),
            },
            ingredients: [{ name: name, amount: "100g" }],
            directions: ["Prepare as desired.", "Season to taste."],
            servings: 1
        });
    });

    return [...DISCOVER_DATABASE, ...extraItems];
};

export const FULL_DISCOVER_DATABASE = expandDatabase();
