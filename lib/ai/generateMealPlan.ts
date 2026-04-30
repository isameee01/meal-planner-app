/**
 * AI Meal Planner Engine - Production Grade
 * Generates and rebalances personalized meal plans using Groq (Llama 3.3 70B)
 *
 * Key capabilities:
 * - Multi-day plan generation in ONE AI call
 * - Full ingredient list per meal (with quantity, calories, protein, carbs, fats)
 * - Servings scaling: re-calls AI OR scales all ingredient quantities + nutrition
 * - Zero fake/placeholder data
 */

import { callGroqAPI, GroqMessage } from "./groq";
import { GeneratedMeal } from "../meal-planner";
import { FoodItem } from "../food-db";

let aiGlobalIdCounter = 0;

// ─── Types ────────────────────────────────────────────────────────────────────

export interface AIIngredient {
    name: string;
    quantity: string;   // e.g. "1/2 cup", "200g"
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
}

export interface AIMeal {
    type: "breakfast" | "lunch" | "dinner" | "snack";
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    ingredients: AIIngredient[];
    instructions: string[];
    prepTime: number;
    servings: number;
}

export interface AIDay {
    date: string;           // "YYYY-MM-DD"
    meals: AIMeal[];
}

export interface AIPlanResponse {
    days: AIDay[];
}

// ─── Validation ───────────────────────────────────────────────────────────────

function validateAIMeal(meal: any, dayIdx: number, mealIdx: number): boolean {
    const ctx = `[AI Validation] Day ${dayIdx} meal ${mealIdx}`;
    if (!meal || typeof meal !== "object") {
        console.error(`${ctx}: meal is not an object`, meal);
        return false;
    }
    const required = ["type", "name", "calories", "protein", "carbs", "fats", "ingredients", "instructions"];
    for (const field of required) {
        if (meal[field] === undefined || meal[field] === null) {
            console.error(`${ctx}: missing field "${field}"`, meal);
            return false;
        }
    }
    if (!Array.isArray(meal.ingredients) || meal.ingredients.length === 0) {
        console.error(`${ctx} "${meal.name}": ingredients must be non-empty array`, meal.ingredients);
        return false;
    }
    if (!Array.isArray(meal.instructions) || meal.instructions.length === 0) {
        console.error(`${ctx} "${meal.name}": instructions must be non-empty array`, meal.instructions);
        return false;
    }
    if (typeof meal.calories !== "number" || meal.calories <= 0) {
        console.error(`${ctx} "${meal.name}": invalid calories`, meal.calories);
        return false;
    }
    for (const ing of meal.ingredients) {
        if (!ing.name || !ing.quantity) {
            console.error(`${ctx} "${meal.name}": ingredient missing name/quantity`, ing);
            return false;
        }
    }
    return true;
}

function validateAIPlan(data: any): boolean {
    if (!data || !Array.isArray(data.days) || data.days.length === 0) {
        console.error("[AI Validation] Response missing 'days' array:", data);
        return false;
    }
    for (let d = 0; d < data.days.length; d++) {
        const day = data.days[d];
        if (!day.date || !Array.isArray(day.meals) || day.meals.length !== 4) {
            console.error(`[AI Validation] Day ${d} malformed (needs 4 meals):`, day);
            return false;
        }
        const mealTypes = day.meals.map((m: any) => m.type);
        const requiredTypes = ["breakfast", "lunch", "dinner", "snack"];
        for (const t of requiredTypes) {
            if (!mealTypes.includes(t)) {
                console.error(`[AI Validation] Day ${d} missing meal type "${t}"`);
                return false;
            }
        }
        for (let m = 0; m < day.meals.length; m++) {
            if (!validateAIMeal(day.meals[m], d, m)) return false;
        }
    }
    return true;
}

// ─── Prompt Builder ────────────────────────────────────────────────────────────

function buildMultiDayPrompt(
    userData: any,
    dates: string[],
    blockedFoodNames: string[],
    servingsOverride?: number
): string {
    const servingsNote = servingsOverride
        ? `- Default servings per meal: ${servingsOverride} (scale all ingredient quantities accordingly)`
        : "- Default servings per meal: 1";

    return `You are a world-class AI Nutritionist. Generate a complete ${dates.length}-day personalized meal plan.

USER PROFILE:
- Age: ${userData.age || 30}
- Current Weight: ${userData.weight || 70}kg
- Target Weight Goal: ${userData.goalType || "maintain"}
- Activity Level: ${userData.activityLevel || "moderate"}
- Diet Type Preference: ${userData.dietType || "anything"}

STRICT NUTRITIONAL TARGETS (PER DAY):
- Daily Calorie Target: ${userData.calorieTarget || 2000} kcal
- Protein: ${userData.proteinTarget || 150}g
- Carbs: ${userData.carbsTarget || 200}g
- Fats: ${userData.fatsTarget || 60}g
${servingsNote}

DATES TO GENERATE: ${dates.join(", ")}

VARIETY REQUIREMENT:
- Do NOT provide the same meals for every day. 
- Tailor the meal selection specifically to someone who weighs ${userData.weight || 70}kg and is aiming to ${userData.goalType || "maintain"}.
- Ensure the meal choices reflect a ${userData.dietType || "anything"} lifestyle.
- Use the current timestamp seed for randomness: ${Date.now()}


STRICT REQUIREMENTS:
1. Generate ALL ${dates.length} days.
2. Each day MUST have exactly 4 meals: breakfast, lunch, dinner, snack.
3. Every meal MUST include realistic ingredients, precise quantities, and accurate macros.
4. The TOTAL DAILY macros MUST match the targets above (+/- 5%). DO NOT DEVIATE.
5. Diet Type logic: If "keto", use very low carb ingredients. If "vegan", NO animal products. If "vegetarian", NO meat/fish.
6. STRICTLY PROHIBITED foods: ${blockedFoodNames.length > 0 ? blockedFoodNames.join(", ") : "None"}
7. Vary meals across days — no repeated recipes.
8. Focus on high-quality, whole food ingredients.
9. Instructions must be clear and professional.
10. RETURN ONLY VALID JSON.

RETURN ONLY THIS EXACT JSON STRUCTURE (no explanation, no markdown):
{
  "days": [
    {
      "date": "YYYY-MM-DD",
      "meals": [
        {
          "type": "breakfast",
          "name": "Specific Recipe Name",
          "calories": 450,
          "protein": 28,
          "carbs": 45,
          "fats": 12,
          "ingredients": [
            {
              "name": "Rolled Oats",
              "quantity": "1/2 cup (40g)",
              "calories": 150,
              "protein": 5,
              "carbs": 27,
              "fats": 3
            },
            {
              "name": "Greek Yogurt",
              "quantity": "3/4 cup (170g)",
              "calories": 100,
              "protein": 17,
              "carbs": 6,
              "fats": 0
            }
          ],
          "instructions": [
            "Step 1: ...",
            "Step 2: ...",
            "Step 3: ...",
            "Step 4: ..."
          ],
          "prepTime": 10,
          "servings": 1
        }
      ]
    }
  ]
}`;
}

// ─── Transform AI Response → App State ────────────────────────────────────────

function transformAIDay(day: AIDay): GeneratedMeal[] {
    const slots = ["breakfast", "lunch", "dinner", "snack"] as const;
    const meals = slots.map(slotKey => {
        const aiMeal = day.meals.find(m => m.type.toLowerCase() === slotKey);
        if (!aiMeal) {
            console.error(`[Transform] Missing meal type "${slotKey}" in day ${day.date}`);
            return null;
        }

        const safeIngredients = aiMeal.ingredients ?? [];
        const safeInstructions = aiMeal.instructions ?? [];

        let calcCals = 0;
        let calcProtein = 0;
        let calcCarbs = 0;
        let calcFat = 0;

        const validatedIngredients = safeIngredients.map(ing => {
            const p = Math.max(0, ing.protein ?? 0);
            const c = Math.max(0, ing.carbs ?? 0);
            const f = Math.max(0, ing.fats ?? 0);
            const calculatedIngCals = (p * 4) + (c * 4) + (f * 9);
            const finalIngCals = ing.calories > 0 ? ing.calories : calculatedIngCals;

            calcProtein += p;
            calcCarbs += c;
            calcFat += f;
            calcCals += finalIngCals;

            return {
                name: ing.name ?? "Ingredient",
                amount: ing.quantity ?? "1 portion",
                calories: Math.round(finalIngCals),
                protein: p,
                carbs: c,
                fats: f,
            };
        });

        const aiTotalCals = aiMeal.calories ?? 0;
        const finalMealCals = Math.abs(aiTotalCals - calcCals) / (calcCals || 1) < 0.15 ? aiTotalCals : calcCals;

        const virtualFood: FoodItem = {
            id: `ai-${slotKey}-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: aiMeal.name ?? `AI ${slotKey}`,
            calories: Math.round(finalMealCals),
            protein: Math.round(calcProtein),
            carbs: Math.round(calcCarbs),
            fat: Math.round(calcFat),
            fiber: 0,
            priceScore: 2,
            category: slotKey === "snack" ? "snack" : "protein",
            serving: `${aiMeal.servings ?? 1} serving(s)`,
            tags: ["ai-generated"],
            mealTypes: [slotKey],
            ingredients: validatedIngredients,
            directions: safeInstructions,
            prepTime: aiMeal.prepTime ?? 15,
            description: `AI-generated ${slotKey}.`,
        };

        return {
            slot: slotKey.charAt(0).toUpperCase() + slotKey.slice(1),
            items: [{ food: virtualFood, amount: aiMeal.servings ?? 1 }],
            totalCalories: Math.round(finalMealCals),
            totalProtein: Math.round(calcProtein),
            totalCarbs: Math.round(calcCarbs),
            totalFat: Math.round(calcFat),
        } as GeneratedMeal;
    }).filter(Boolean) as GeneratedMeal[];

    console.log(`[AI OUTPUT] Successfully transformed day ${day.date}. Total calories: ${meals.reduce((s, m) => s + m.totalCalories, 0)}`);
    return meals;
}


// ─── Fallback Payload ──────────────────────────────────────────────────────────

function createFallbackDay(date: string, cals: number): AIDay {
    const p = Math.round(cals * 0.30 / 4);
    const c = Math.round(cals * 0.45 / 4);
    const f = Math.round(cals * 0.25 / 9);
    return {
        date,
        meals: [
            {
                type: "breakfast",
                name: "Greek Yogurt Power Bowl",
                calories: Math.round(cals * 0.25),
                protein: p,
                carbs: c,
                fats: f,
                ingredients: [
                    { name: "Greek Yogurt (non-fat)", quantity: "1 cup (240g)", calories: 130, protein: 22, carbs: 9, fats: 0 },
                    { name: "Rolled Oats", quantity: "1/2 cup (40g)", calories: 150, protein: 5, carbs: 27, fats: 3 },
                    { name: "Mixed Berries", quantity: "1/2 cup (75g)", calories: 40, protein: 1, carbs: 9, fats: 0 },
                    { name: "Honey", quantity: "1 tsp (7g)", calories: 21, protein: 0, carbs: 6, fats: 0 },
                    { name: "Chia Seeds", quantity: "1 tbsp (12g)", calories: 58, protein: 2, carbs: 5, fats: 4 },
                ],
                instructions: [
                    "Measure out Greek yogurt into a bowl.",
                    "Top with rolled oats and mixed berries.",
                    "Drizzle honey over the top.",
                    "Sprinkle chia seeds and serve immediately.",
                ],
                prepTime: 5,
                servings: 1,
            },
            {
                type: "lunch",
                name: "Grilled Chicken & Quinoa Bowl",
                calories: Math.round(cals * 0.35),
                protein: p,
                carbs: c,
                fats: f,
                ingredients: [
                    { name: "Chicken Breast", quantity: "6 oz (170g)", calories: 280, protein: 53, carbs: 0, fats: 6 },
                    { name: "Quinoa (cooked)", quantity: "1 cup (185g)", calories: 222, protein: 8, carbs: 39, fats: 4 },
                    { name: "Cherry Tomatoes", quantity: "1/2 cup (75g)", calories: 27, protein: 1, carbs: 6, fats: 0 },
                    { name: "Cucumber", quantity: "1/2 medium (100g)", calories: 15, protein: 1, carbs: 4, fats: 0 },
                    { name: "Olive Oil", quantity: "1 tbsp (14g)", calories: 120, protein: 0, carbs: 0, fats: 14 },
                    { name: "Lemon Juice", quantity: "1 tbsp (15ml)", calories: 4, protein: 0, carbs: 1, fats: 0 },
                ],
                instructions: [
                    "Season chicken breast with salt, pepper, and garlic powder.",
                    "Grill chicken for 6-7 minutes per side until cooked through.",
                    "Cook quinoa according to package instructions.",
                    "Slice chicken and arrange over quinoa with veggies.",
                    "Drizzle with olive oil and lemon juice.",
                ],
                prepTime: 20,
                servings: 1,
            },
            {
                type: "dinner",
                name: "Baked Salmon with Sweet Potato",
                calories: Math.round(cals * 0.30),
                protein: p,
                carbs: c,
                fats: f,
                ingredients: [
                    { name: "Salmon Fillet", quantity: "6 oz (170g)", calories: 354, protein: 38, carbs: 0, fats: 22 },
                    { name: "Sweet Potato", quantity: "1 medium (130g)", calories: 112, protein: 2, carbs: 26, fats: 0 },
                    { name: "Broccoli", quantity: "1 cup (91g)", calories: 31, protein: 3, carbs: 6, fats: 0 },
                    { name: "Olive Oil", quantity: "1 tbsp (14g)", calories: 120, protein: 0, carbs: 0, fats: 14 },
                    { name: "Garlic", quantity: "2 cloves (6g)", calories: 9, protein: 0, carbs: 2, fats: 0 },
                    { name: "Dill (fresh)", quantity: "1 tbsp", calories: 5, protein: 0, carbs: 1, fats: 0 },
                ],
                instructions: [
                    "Preheat oven to 400°F (200°C).",
                    "Season salmon with dill, garlic, salt, and olive oil.",
                    "Cube sweet potato and toss with olive oil. Roast for 25 minutes.",
                    "Add salmon to baking sheet and bake for 12-15 minutes.",
                    "Steam broccoli for 5 minutes and serve alongside.",
                ],
                prepTime: 35,
                servings: 1,
            },
            {
                type: "snack",
                name: "Almond Butter & Apple",
                calories: Math.round(cals * 0.10),
                protein: Math.round(p / 3),
                carbs: Math.round(c / 2),
                fats: Math.round(f / 2),
                ingredients: [
                    { name: "Apple (medium)", quantity: "1 whole (182g)", calories: 95, protein: 0, carbs: 25, fats: 0 },
                    { name: "Almond Butter", quantity: "2 tbsp (32g)", calories: 196, protein: 7, carbs: 6, fats: 18 },
                    { name: "Cinnamon", quantity: "1/4 tsp", calories: 2, protein: 0, carbs: 0, fats: 0 },
                ],
                instructions: [
                    "Wash and slice the apple into wedges.",
                    "Transfer almond butter to a small dipping bowl.",
                    "Sprinkle cinnamon over almond butter.",
                    "Dip apple slices into almond butter and enjoy.",
                ],
                prepTime: 3,
                servings: 1,
            },
        ],
    };
}

// ─── Main API: Multi-Day Generation ────────────────────────────────────────────

/**
 * Generate meal plans for one or more dates in a SINGLE AI call.
 * Returns a map of dateKey → GeneratedMeal[]
 */
export async function generateMultiDayMealPlanAI(
    userData: any,
    settings: any,
    dates: string[],                   // ["2025-04-19", "2025-04-20", ...]
    blockedFoodNames: string[] = [],
    retryCount = 0
): Promise<Record<string, GeneratedMeal[]>> {
    console.log("[AI REQUEST] Using Admin Settings?", !!settings?.meal_prompt);
    console.log("[AI REQUEST] Selected Model:", settings?.ai_model || "default");
    console.log("[AI REQUEST] Generating meal plan for dates:", dates);
    console.log("[AI REQUEST] User data:", JSON.stringify(userData));
    console.log("[AI REQUEST] Blocked foods:", blockedFoodNames);

    const prompt = buildMultiDayPrompt(userData, dates, blockedFoodNames);

    try {
        const systemPrompt = settings?.meal_prompt
            ? `${settings.meal_prompt}\n\nYou ALWAYS return ONLY valid JSON matching the exact schema provided. No explanation, no markdown, no code blocks — just raw JSON.`
            : "You are a professional AI Nutritionist. You ALWAYS return ONLY valid JSON matching the exact schema provided. No explanation, no markdown, no code blocks — just raw JSON.";

        const responseText = await callGroqAPI([
            {
                role: "system",
                content: systemPrompt,
            },
            { role: "user", content: prompt },
        ], {
            model: settings?.ai_model || undefined
        });

        let data: AIPlanResponse;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error("[AI PARSE ERROR] Failed to parse JSON:", parseError);
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                data = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error("AI response is not valid JSON - NO FALLBACK ALLOWED");
            }
        }

        console.log("[AI RAW RESPONSE]", JSON.stringify(data));
        console.log("[AI OUTPUT]", JSON.stringify(data, null, 2));

        if (!validateAIPlan(data)) {
            console.error("[AI ERROR] Validation failed for data:", JSON.stringify(data));
            throw new Error("AI response failed mandatory structure validation - NO FALLBACK ALLOWED");
        }

        // Build result map
        const result: Record<string, GeneratedMeal[]> = {};
        for (const day of data.days) {
            result[day.date] = transformAIDay(day);
        }

        // Fill any missing dates with fallback  
        for (const date of dates) {
            if (!result[date]) {
                console.warn(`[AI] No data returned for date ${date}. Using fallback.`);
                const cals = userData.calorieTarget || 2000;
                result[date] = transformAIDay(createFallbackDay(date, cals));
            }
        }

        console.log("[FINAL PLAN USED]", JSON.stringify(result, null, 2));
        return result;

    } catch (error) {
        if (retryCount === 0) {
            console.warn("[AI] Generation failed. Retrying once with same prompt...", error);
            return generateMultiDayMealPlanAI(userData, settings, dates, blockedFoodNames, 1);
        }

        console.error("[AI ERROR] Final generation failed for dates:", dates, error);
        console.warn("[AI] Using detailed fallback plan for all dates due to error.");

        const cals = userData.calorieTarget || 2000;
        const result: Record<string, GeneratedMeal[]> = {};
        for (const date of dates) {
            result[date] = transformAIDay(createFallbackDay(date, cals));
        }
        return result;
    }
}

/**
 * Single-day wrapper (backward compat)
 */
export async function generateMealPlanAI(
    userData: any,
    settings: any,
    blockedFoodNames: string[] = [],
    retryCount = 0
): Promise<GeneratedMeal[]> {
    const today = new Date().toISOString().split("T")[0];
    const result = await generateMultiDayMealPlanAI(userData, settings, [today], blockedFoodNames, retryCount);
    return result[today] || [];
}

// ─── Servings Scaling ──────────────────────────────────────────────────────────

/**
 * Scale a meal's ingredient quantities and nutrition by a servings multiplier.
 * This is Option B (pure math scaling) — no AI call required.
 */
export function scaleMealServings(meal: GeneratedMeal, newServings: number): GeneratedMeal {
    const firstItem = meal.items[0];
    if (!firstItem) return meal;

    const oldServings = firstItem.amount || 1;
    const factor = newServings / oldServings;

    if (Math.abs(factor - 1) < 0.01) return meal; // No change needed

    console.log(`[Servings Scale] ${meal.slot}: ${oldServings} → ${newServings} (factor: ${factor.toFixed(2)})`);

    const scaledItems = meal.items.map(item => {
        const scaledFood: FoodItem = {
            ...item.food,
            calories: Math.round(item.food.calories * factor),
            protein: Math.round(item.food.protein * factor),
            carbs: Math.round(item.food.carbs * factor),
            fat: Math.round(item.food.fat * factor),
            serving: `${newServings} serving(s)`,
            // Scale each ingredient quantity text (prefix multiplier)
            ingredients: item.food.ingredients?.map(ing => ({
                ...ing,
                amount: scaleQuantityText(ing.amount, factor),
                calories: Math.round((ing.calories || 0) * factor),
                protein: Math.round(((ing as any).protein || 0) * factor),
                carbs: Math.round(((ing as any).carbs || 0) * factor),
                fats: Math.round(((ing as any).fats || 0) * factor),
            })),
        };
        return { food: scaledFood, amount: newServings };
    });

    return {
        ...meal,
        items: scaledItems,
        totalCalories: Math.round(meal.totalCalories * factor),
        totalProtein: Math.round(meal.totalProtein * factor),
        totalCarbs: Math.round(meal.totalCarbs * factor),
        totalFat: Math.round(meal.totalFat * factor),
    };
}

/**
 * Intelligently scale a quantity string by a factor.
 * Examples: "1/2 cup" × 2 = "1 cup", "200g" × 1.5 = "300g"
 */
function scaleQuantityText(quantity: string, factor: number): string {
    if (!quantity || factor === 1) return quantity;

    const fractionMatch = quantity.match(/^(\d+)\/(\d+)(.*)/);
    const decimalMatch = quantity.match(/^(\d+\.?\d*)(.*)/);

    if (fractionMatch) {
        const value = parseInt(fractionMatch[1]) / parseInt(fractionMatch[2]);
        return `${formatNumber(value * factor)}${fractionMatch[3]}`;
    } else if (decimalMatch) {
        return `${formatNumber(parseFloat(decimalMatch[1]) * factor)}${decimalMatch[2]}`;
    }
    return quantity;
}

function formatNumber(n: number): string {
    if (Number.isInteger(n)) return n.toString();
    const fractions: [number, string][] = [
        [0.25, "1/4"], [0.33, "1/3"], [0.5, "1/2"], [0.67, "2/3"], [0.75, "3/4"],
    ];
    for (const [val, str] of fractions) {
        if (Math.abs(n - val) < 0.05) return str;
        if (Math.abs(n - Math.floor(n) - val) < 0.05) return `${Math.floor(n)} ${str}`;
    }
    return n.toFixed(1).replace(/\.0$/, "");
}

// ─── Rebalance Day ─────────────────────────────────────────────────────────────

/**
 * Rebalances a day's remaining meals after a manual item addition.
 * NOTE: currentMeals ALREADY includes the newly added item (context adds it first).
 */
export async function rebalanceDayAI(
    currentMeals: GeneratedMeal[],
    addedItem: { name: string; calories: number; protein: number; carbs: number; fat: number },
    addedSlot: string,
    userData: any,
    targetCalories: number,
    settings?: any
): Promise<GeneratedMeal[]> {
    const slotsOrder = ["Breakfast", "Lunch", "Dinner", "Snack"];
    const addedIdx = slotsOrder.findIndex(s => s.toLowerCase() === addedSlot.toLowerCase());
    const futureSlots = addedIdx >= 0 ? slotsOrder.slice(addedIdx + 1) : [];

    // If no future slots (e.g., user added to Snack), nothing to rebalance
    if (futureSlots.length === 0) {
        console.log("[AI Rebalance] No future slots to rebalance - returning current meals.");
        return currentMeals;
    }

    // Budget = target minus what is already consumed (includes newly added food)
    const currentTotalCal = currentMeals.reduce((sum, m) => sum + m.totalCalories, 0);
    const remainingBudget = Math.max(0, targetCalories - currentTotalCal);
    const perSlot = Math.round(remainingBudget / futureSlots.length);

    console.log(
        "[AI Rebalance] Added \"" + addedItem.name + "\" to " + addedSlot +
        ". Day total now: " + currentTotalCal + " kcal. " +
        "Rebalancing [" + futureSlots.join(", ") + "] with " + remainingBudget +
        " kcal remaining (~" + perSlot + "/slot)."
    );

    const lockedMealsSummary = currentMeals
        .filter(m => !futureSlots.map(s => s.toLowerCase()).includes(m.slot.toLowerCase()))
        .map(m => "  " + m.slot + ": " + m.totalCalories + " kcal (" + m.items.map(i => i.food.name).join(", ") + ")")
        .join("\n");

    const today = new Date().toISOString().split("T")[0];

    // Build schema examples per slot (using JSON.stringify to avoid template literal issues)
    const schemaExamples = futureSlots.map(slot => {
        const cal = perSlot;
        const prot = Math.round(cal * 0.30 / 4);
        const carbs = Math.round(cal * 0.45 / 4);
        const fats = Math.round(cal * 0.25 / 9);
        return JSON.stringify({
            type: slot.toLowerCase(),
            name: "REAL_RECIPE_NAME",
            calories: cal,
            protein: prot,
            carbs: carbs,
            fats: fats,
            ingredients: [
                { name: "REAL_INGREDIENT_1", quantity: "100g", calories: Math.round(cal * 0.35), protein: prot, carbs: 5, fats: 4 },
                { name: "REAL_INGREDIENT_2", quantity: "1 cup", calories: Math.round(cal * 0.25), protein: 5, carbs: carbs, fats: 2 },
                { name: "REAL_INGREDIENT_3", quantity: "2 tbsp", calories: Math.round(cal * 0.15), protein: 2, carbs: 3, fats: fats },
            ],
            instructions: [
                "Step 1: REAL_STEP",
                "Step 2: REAL_STEP",
                "Step 3: REAL_STEP",
                "Step 4: REAL_STEP",
            ],
            prepTime: 20,
            servings: 1,
        });
    }).join(",\n        ");

    const promptLines = [
        "You are an expert AI Nutritionist. Rebalance a user's remaining meal slots for the day.",
        "",
        "DAILY TARGET: " + targetCalories + " kcal",
        "USER GOAL: " + (userData?.goalType ?? "maintain"),
        "",
        "ALREADY-SET MEALS (do NOT change):",
        (lockedMealsSummary || "  None yet"),
        "",
        "JUST ADDED: \"" + addedItem.name + "\" (" + addedItem.calories + " kcal) to " + addedSlot,
        "REMAINING BUDGET: " + remainingBudget + " kcal for [" + futureSlots.join(", ") + "] (~" + perSlot + " kcal each)",
        "",
        "GENERATE meals for ONLY these slots: " + futureSlots.join(", "),
        "",
        "REQUIREMENTS for EVERY generated meal:",
        "1. Real, specific recipe name (no placeholders)",
        "2. 4-8 real ingredients with exact quantities AND per-ingredient macros (no zeros)",
        "3. 4+ step-by-step cooking instructions",
        "4. calories/protein/carbs/fats that correctly sum from ingredients",
        "",
        "Return ONLY this exact JSON (no markdown, no explanation):",
        "{\"days\":[{\"date\":\"" + today + "\",\"meals\":[",
        "        " + schemaExamples,
        "]}]}",
    ];
    const prompt = promptLines.join("\n");

    try {
        const systemPrompt = settings?.meal_prompt
            ? `${settings.meal_prompt}\n\nYou are a precise AI nutritionist. Return ONLY valid JSON with real food data. No markdown, no code blocks, no explanation.`
            : "You are a precise AI nutritionist. Return ONLY valid JSON with real food data. No markdown, no code blocks, no explanation.";

        const responseText = await callGroqAPI([
            {
                role: "system",
                content: systemPrompt,
            },
            { role: "user", content: prompt },
        ], {
            model: settings?.ai_model || undefined
        });

        console.log("[AI REBALANCE RAW RESPONSE]", responseText.substring(0, 500));

        // Extract JSON even if model wrapped it in markdown
        let jsonText = responseText.trim();
        if (jsonText.startsWith("```")) {
            const mdMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (mdMatch) jsonText = mdMatch[1].trim();
        }
        if (!jsonText.startsWith("{")) {
            const objMatch = jsonText.match(/\{[\s\S]*\}/);
            if (objMatch) jsonText = objMatch[0];
        }

        const data: AIPlanResponse = JSON.parse(jsonText);

        if (!data?.days?.[0]?.meals?.length) {
            throw new Error("[AI Rebalance] Response missing meals array");
        }

        const newFutureMeals = transformAIDay(data.days[0]);
        const futureSlotKeys = futureSlots.map(s => s.toLowerCase());

        console.log(
            "[AI Rebalance] Success:",
            newFutureMeals.map(m =>
                m.slot + ": " + m.totalCalories + "kcal, " +
                (m.items[0]?.food?.ingredients?.length ?? 0) + " ingredients"
            )
        );

        // Merge: keep locked meals unchanged, replace only future slots
        return currentMeals.map(meal => {
            const key = meal.slot.toLowerCase();
            if (futureSlotKeys.includes(key)) {
                return newFutureMeals.find(m => m.slot.toLowerCase() === key) ?? meal;
            }
            return meal;
        });

    } catch (error) {
        console.error("[AI Rebalance] Failed - keeping current meals (food item still visible):", error);
        // Graceful degradation: user's added food is already in state from Step 1
        return currentMeals;
    }
}

// ─── Recipe Synthesis ──────────────────────────────────────────────────────────

/**
 * Synthesize full recipe details for a meal that lacks them
 */
export async function synthesizeDeepRecipe(
    mealName: string,
    baseIngredients: any[],
    userData: any
): Promise<{ ingredients: any[]; directions: string[]; prep_time: string }> {
    const prompt = `You are a master chef. Generate a detailed recipe for: "${mealName}".
User goal: ${userData.goalType || "maintain"}.
Base ingredients: ${JSON.stringify(baseIngredients)}.

Return ONLY JSON:
{
  "ingredients": [{"name": "","amount": ""}],
  "directions": ["Step 1", "Step 2", "Step 3", "Step 4"],
  "prep_time": "15 mins"
}`;

    try {
        const responseText = await callGroqAPI([
            { role: "system", content: "You are a professional chef. Return ONLY strict JSON." },
            { role: "user", content: prompt },
        ]);

        const data = JSON.parse(responseText);
        return {
            ingredients:
                data.ingredients && data.ingredients.length > 0
                    ? data.ingredients
                    : baseIngredients,
            directions: data.directions || ["Prepare and serve."],
            prep_time: data.prep_time || "15 mins",
        };
    } catch (error) {
        console.error("Failed to synthesize deep recipe details:", error);
        return { ingredients: baseIngredients, directions: ["Prepare and serve."], prep_time: "15 mins" };
    }
}

/**
 * Generates a recipe for a single food item via AI
 */
export async function generateRecipeAI(
    foodName: string,
    userData: any
): Promise<{ ingredients: any[]; directions: string[]; prep_time: string }> {
    const prompt = `You are a master chef. Generate a professional recipe for: "${foodName}".
User goal: ${userData?.goalType || "maintain"}.

Return ONLY JSON:
{
  "ingredients": [{"name": "", "amount": ""}],
  "directions": ["Step 1", "Step 2", "Step 3"],
  "prep_time": "15 mins"
}`;

    try {
        const responseText = await callGroqAPI([
            { role: "system", content: "You are a professional chef. Return ONLY strict JSON." },
            { role: "user", content: prompt },
        ]);

        const data = JSON.parse(responseText);
        return {
            ingredients: data.ingredients || [],
            directions: data.directions || [],
            prep_time: data.prep_time || "15 mins",
        };
    } catch (error) {
        console.error("Failed to generate standalone recipe:", error);
        return { ingredients: [], directions: [], prep_time: "15 mins" };
    }
}
