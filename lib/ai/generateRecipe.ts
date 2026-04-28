/**
 * generateRecipe.ts
 *
 * Isolated AI module: generates a full recipe for a single food item.
 * - Takes ONE food (name + macro profile)
 * - Returns ingredients[], instructions[], prepTime
 * - Never returns empty arrays; has a built-in fallback
 * - Does NOT touch meal generation or rebalance logic
 */

import { callGroqAPI } from "./groq";

export interface FoodRecipe {
    ingredients: RecipeIngredient[];
    instructions: string[];
    prepTime: number;
}

export interface RecipeIngredient {
    name: string;
    amount: string;       // e.g. "200g", "1 cup"
    calories?: number;
    protein?: number;
    carbs?: number;
    fats?: number;
}

/**
 * Generate a complete recipe for a single food item via Groq AI.
 * Designed to be called in parallel: await Promise.all(foods.map(generateRecipeForFood))
 */
export async function generateRecipeForFood(
    food: { name: string; calories: number; protein: number; carbs: number; fat: number; serving?: string },
    userGoal: string = "maintain",
    settings?: any
): Promise<FoodRecipe> {
    const prompt = [
        "You are an expert chef and nutritionist. Generate a complete, realistic recipe for this food item.",
        "",
        "FOOD: " + food.name,
        "MACROS: " + food.calories + " kcal | P " + food.protein + "g | C " + food.carbs + "g | F " + food.fat + "g",
        "SERVING SIZE: " + (food.serving ?? "1 serving"),
        "USER GOAL: " + userGoal,
        "",
        "REQUIREMENTS:",
        "1. 4-8 real ingredients with exact quantities (e.g. '200g', '1 cup', '2 tbsp')",
        "2. Per-ingredient: calories, protein, carbs, fats (real numbers, no zeros unless genuinely zero)",
        "3. 4-6 clear, specific cooking instructions",
        "4. prepTime in minutes (integer)",
        "",
        "Return ONLY valid JSON (no markdown, no explanation):",
        '{"ingredients":[{"name":"string","amount":"string","calories":0,"protein":0,"carbs":0,"fats":0}],"instructions":["Step 1","Step 2"],"prepTime":15}',
    ].join("\n");

    try {
        const systemPrompt = settings?.recipe_prompt
            ? `${settings.recipe_prompt}\n\nYou are a precise chef. Return ONLY valid JSON matching the exact schema. No markdown, no code blocks, no explanation.`
            : "You are a precise chef. Return ONLY valid JSON matching the exact schema. No markdown, no code blocks, no explanation.";

        const rawText = await callGroqAPI([
            {
                role: "system",
                content: systemPrompt,
            },
            { role: "user", content: prompt },
        ], {
            model: settings?.ai_model || undefined
        });

        // Strip markdown fences if model wrapped the response
        let jsonText = rawText.trim();
        if (jsonText.startsWith("```")) {
            const m = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (m) jsonText = m[1].trim();
        }
        if (!jsonText.startsWith("{")) {
            const m = jsonText.match(/\{[\s\S]*\}/);
            if (m) jsonText = m[0];
        }

        const data = JSON.parse(jsonText);

        const ingredients: RecipeIngredient[] = (data.ingredients ?? [])
            .filter((i: any) => i?.name && i?.amount)
            .map((i: any) => ({
                name: String(i.name),
                amount: String(i.amount),
                calories: typeof i.calories === "number" ? i.calories : undefined,
                protein:  typeof i.protein  === "number" ? i.protein  : undefined,
                carbs:    typeof i.carbs    === "number" ? i.carbs    : undefined,
                fats:     typeof i.fats     === "number" ? i.fats     : undefined,
            }));

        const instructions: string[] = (data.instructions ?? [])
            .filter((s: any) => typeof s === "string" && s.trim().length > 0)
            .map((s: string) => s.trim());

        const prepTime: number =
            typeof data.prepTime === "number" ? data.prepTime :
            typeof data.prep_time === "number" ? data.prep_time : 15;

        // Sanity: if AI returned empty arrays, use fallback
        if (ingredients.length === 0 || instructions.length === 0) {
            console.warn("[generateRecipeForFood] Empty recipe from AI for", food.name, "— using fallback");
            return buildFallbackRecipe(food);
        }

        console.log(
            "[generateRecipeForFood] " + food.name + ": " +
            ingredients.length + " ingredients, " +
            instructions.length + " steps, " + prepTime + " min"
        );

        return { ingredients, instructions, prepTime };

    } catch (error) {
        console.error("[generateRecipeForFood] Failed for", food.name, ":", error);
        return buildFallbackRecipe(food);
    }
}

/**
 * Generate recipes for multiple foods in parallel.
 * Returns a map of food.id → FoodRecipe.
 */
export async function generateRecipesForFoods(
    foods: Array<{ id: string; name: string; calories: number; protein: number; carbs: number; fat: number; serving?: string }>,
    userGoal: string = "maintain",
    settings?: any
): Promise<Record<string, FoodRecipe>> {
    const results = await Promise.all(
        foods.map(food => generateRecipeForFood(food, userGoal, settings))
    );

    const map: Record<string, FoodRecipe> = {};
    foods.forEach((food, idx) => {
        map[food.id] = results[idx];
    });
    return map;
}

// ── Fallback ────────────────────────────────────────────────────────────────────

function buildFallbackRecipe(food: {
    name: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    serving?: string;
}): FoodRecipe {
    const serving = food.serving ?? "1 serving";
    return {
        ingredients: [
            {
                name: food.name,
                amount: serving,
                calories: food.calories,
                protein: food.protein,
                carbs: food.carbs,
                fats: food.fat,
            },
        ],
        instructions: [
            "Prepare " + food.name + " according to package or standard instructions.",
            "Portion to " + serving + " as specified.",
            "Season lightly with salt and pepper if desired.",
            "Serve immediately as part of your meal.",
        ],
        prepTime: 10,
    };
}
