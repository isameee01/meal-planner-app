/**
 * AI Meal Planner Engine
 * Generates and rebalances personalized meal plans using Groq (Llama 3 70B)
 */

import { callGroqAPI, GroqMessage } from "./groq";
import { GeneratedMeal } from "../meal-planner";
import { FoodItem } from "../food-db";

/**
 * Validates the AI response structure strictly
 */
function validateAIResponse(data: any): boolean {
    if (!data.daily_calories || !data.macros || !data.meals) {
        console.error("[AI Validation] Missing core fields:", { data });
        return false;
    }
    const requiredSlots = ["breakfast", "lunch", "dinner", "snack"];
    for (const slot of requiredSlots) {
        const meal = data.meals[slot];
        if (!meal || !meal.name || !Array.isArray(meal.ingredients) || !meal.nutrition || !Array.isArray(meal.directions) || !meal.prep_time) {
            console.error(`[AI Validation] Slot "${slot}" is invalid:`, meal);
            return false;
        }
        if (meal.ingredients.length === 0 || meal.directions.length === 0) {
            console.error(`[AI Validation] Slot "${slot}" has empty lists:`, meal);
            return false;
        }
        if (typeof meal.nutrition.calories !== 'number') {
            console.error(`[AI Validation] Slot "${slot}" lacks calorie number:`, meal.nutrition);
            return false;
        }
    }
    return true;
}

/**
 * Generates a full day meal plan via AI
 */
export async function generateMealPlanAI(
    userData: any, 
    settings: any, 
    blockedFoodNames: string[] = [],
    retryCount = 0
): Promise<GeneratedMeal[]> {
    const prompt = `
You are a world-class AI Nutritionist. Design a professional daily meal plan.

User Stats:
- Age: ${userData.age || 30}
- Weight: ${userData.weight}kg
- Height: ${userData.height}cm
- Goal: ${userData.goalType}
- Activity Level: ${userData.activityLevel || 'moderate'}

Task: 
1. Calculate daily calories and P/C/F distribution.
2. Generate 4 REALISTIC meals (breakfast, lunch, dinner, snack).
3. For EACH: Name, Ingredients (precise quantities), Step-by-step Directions, and Nutrition.

Constraint: 
- STRICTLY PROHIBITED: ${blockedFoodNames.join(", ") || "None"}
- Balance macros for the specific goal.

Return ONLY strict JSON:
{
  "daily_calories": number,
  "macros": { "protein": number, "carbs": number, "fats": number },
  "meals": {
    "breakfast": { 
      "name": "String", 
      "ingredients": [{"name": "String", "amount": "String", "calories": number}], 
      "nutrition": {"calories": number, "protein": number, "carbs": number, "fats": number}, 
      "directions": ["String"],
      "prep_time": "String" 
    },
    "lunch": { ... },
    "dinner": { ... },
    "snack": { ... }
  }
}
`;

    try {
        const responseText = await callGroqAPI([
            { role: "system", content: "You are a professional nutritionist that returns ONLY strict valid JSON." },
            { role: "user", content: prompt }
        ]);

        console.log("[AI RAW RESPONSE]", responseText);
        const data = JSON.parse(responseText);
        console.log("[AI PARSED JSON]", data);

        if (!validateAIResponse(data)) {
            throw new Error("AI response failed mandatory structure validation");
        }

        return transformAIResponse(data);

    } catch (error) {
        if (retryCount === 0) {
            console.warn("[AI] Validation failed. Retrying once...");
            return generateMealPlanAI(userData, settings, blockedFoodNames, 1);
        }
        throw error;
    }
}

/**
 * Rebalances a day based on a manual item addition
 */
export async function rebalanceDayAI(
    currentMeals: GeneratedMeal[],
    addedItem: { name: string, calories: number, protein: number, carbs: number, fat: number },
    addedSlot: string,
    userData: any,
    targetCalories: number
): Promise<GeneratedMeal[]> {
    // Determine which slots are "future" slots
    const slotsOrder = ["Breakfast", "Lunch", "Dinner", "Snack"];
    const addedIdx = slotsOrder.indexOf(addedSlot);
    const futureSlots = slotsOrder.slice(addedIdx + 1);

    if (futureSlots.length === 0) {
        throw new Error("No future meals available to rebalance for this day.");
    }

    const currentTotalCal = currentMeals.reduce((sum, m) => sum + m.totalCalories, 0);
    const extraCalories = (currentTotalCal + addedItem.calories) - targetCalories;

    console.log(`[AI Rebalance] User added ${addedItem.name} (${addedItem.calories} kcal). Delta: ${extraCalories} kcal. Adjusting: ${futureSlots.join(", ")}`);

    const prompt = `
You are a dynamic AI Nutrition Coach. A user has added an item to their plan, and you must REBALANCE the remaining meals.

CONTEXT:
- Daily Target: ${targetCalories} kcal
- User Goal: ${userData.goalType}
- Action: User added "${addedItem.name}" (${addedItem.calories} kcal) to ${addedSlot}.
- Current Remaining Budget for [${futureSlots.join(", ")}]: Must be adjusted to fit the daily target.

INSTRUCTIONS:
1. KEEP the following meals UNCHANGED: ${slotsOrder.slice(0, addedIdx + 1).join(", ")}.
2. GENERATE NEW recipes for the following meals to ensure the total daily calories stay at ${targetCalories}: ${futureSlots.join(", ")}.
3. Ensure the future meals are still realistic and satisfying.

Return ONLY strict JSON with ALL 4 meals (existing ones included as they are, new ones updated):
{
  "daily_calories": ${targetCalories},
  "macros": { "protein": number, "carbs": number, "fats": number },
  "meals": {
    "breakfast": { "name": "String", "ingredients": [...], "nutrition": {...}, "directions": [...], "prep_time": "String" },
    "lunch": { ... },
    "dinner": { ... },
    "snack": { ... }
  }
}
`;

    try {
        const responseText = await callGroqAPI([
            { role: "system", content: "You are a professional nutrition rebalancing engine. Return ONLY strict JSON." },
            { role: "user", content: prompt }
        ]);

        console.log("[AI REBALANCE RAW]", responseText);
        const data = JSON.parse(responseText);
        
        if (!validateAIResponse(data)) throw new Error("Rebalance validation failed");

        return transformAIResponse(data);
    } catch (error) {
        console.error("[AI Rebalance] Failed:", error);
        throw error;
    }
}

/**
 * Synthesize missing deep recipe details for sparse AI plans
 */
export async function synthesizeDeepRecipe(mealName: string, baseIngredients: any[], userData: any): Promise<{ ingredients: any[], directions: string[], prep_time: string }> {
    const prompt = `
You are a master chef. Generate a highly detailed, professional recipe for: "${mealName}".
The user goal is: ${userData.goalType}.
The initial generated base ingredients were: ${JSON.stringify(baseIngredients)}.

Please return a comprehensive, granular list of precise ingredients and detailed step-by-step cooking directions.
Return ONLY strict valid JSON:
{
  "ingredients": [{"name": "String", "amount": "String"}],
  "directions": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "prep_time": "String"
}
`;

    try {
        const responseText = await callGroqAPI([
            { role: "system", content: "You are a professional chef. Return ONLY strict JSON." },
            { role: "user", content: prompt }
        ]);

        const data = JSON.parse(responseText);
        return {
            ingredients: data.ingredients && data.ingredients.length > 0 ? data.ingredients : baseIngredients,
            directions: data.directions || ["Serve and enjoy."],
            prep_time: data.prep_time || "15 mins"
        };
    } catch (error) {
        console.error("Failed to synthesize deep recipe details:", error);
        return { ingredients: baseIngredients, directions: ["Serve and enjoy."], prep_time: "15 mins" };
    }
}

/**
 * Generates a recipe for a single food item via AI
 */
export async function generateRecipeAI(foodName: string, userData: any): Promise<{ ingredients: any[], directions: string[], prep_time: string }> {
    const prompt = `
You are a master chef. Generate a professional recipe for: "${foodName}".
The user goal is: ${userData.goalType}.

Return ONLY strict valid JSON:
{
  "ingredients": [{"name": "String", "amount": "String"}],
  "directions": ["Step 1", "Step 2"],
  "prep_time": "String"
}
`;

    try {
        const responseText = await callGroqAPI([
            { role: "system", content: "You are a professional chef. Return ONLY strict JSON." },
            { role: "user", content: prompt }
        ]);

        const data = JSON.parse(responseText);
        return {
            ingredients: data.ingredients || [],
            directions: data.directions || [],
            prep_time: data.prep_time || "15 mins"
        };
    } catch (error) {
        console.error("Failed to generate standalone recipe:", error);
        return { ingredients: [], directions: [], prep_time: "15 mins" };
    }
}

/**
 * Helper to transform AI JSON into App State
 */
function transformAIResponse(data: any): GeneratedMeal[] {
    const slots = ["breakfast", "lunch", "dinner", "snack"];
    return slots.map(slotKey => {
        const aiMeal = data.meals[slotKey];
        const virtualFood: FoodItem = {
            id: `ai-${slotKey}-${Date.now()}`,
            name: aiMeal.name,
            calories: aiMeal.nutrition.calories,
            protein: aiMeal.nutrition.protein,
            carbs: aiMeal.nutrition.carbs,
            fat: aiMeal.nutrition.fats,
            fiber: 0,
            priceScore: 2,
            category: slotKey === "snack" ? "snack" : "protein",
            serving: "1 serving",
            tags: ["ai-generated"],
            mealTypes: [slotKey as any],
            ingredients: aiMeal.ingredients,
            directions: aiMeal.directions,
            prepTime: aiMeal.prep_time,
            description: `Individually adjusted ${slotKey} component.`
        };

        return {
            slot: slotKey.charAt(0).toUpperCase() + slotKey.slice(1),
            items: [{ food: virtualFood, amount: 1 }],
            totalCalories: aiMeal.nutrition.calories,
            totalProtein: aiMeal.nutrition.protein,
            totalCarbs: aiMeal.nutrition.carbs,
            totalFat: aiMeal.nutrition.fats
        };
    });
}
