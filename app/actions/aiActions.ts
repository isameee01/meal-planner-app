"use server";

import { generateMultiDayMealPlanAI, rebalanceDayAI } from "@/lib/ai/generateMealPlan";
import { suggestFoodsAI } from "@/lib/ai/suggestFoods";
import { supabase } from "@/lib/supabaseClient";
import { GeneratedMeal } from "@/lib/meal-planner";

/**
 * Fetches admin settings directly from Supabase
 */
async function getAdminSettings() {
    try {
        const { data, error } = await supabase
            .from('admin_settings')
            .select('*')
            .single();
        
        if (error) {
            console.warn("[AI Action] Could not fetch admin settings, using defaults.", error.message);
            return null;
        }
        return data;
    } catch (e) {
        console.error("[AI Action] Admin settings fetch failed:", e);
        return null;
    }
}

/**
 * Server Action: Generate Meal Plan
 */
export async function generateMealPlanAction(
    userData: any,
    clientSettings: any,
    dates: string[],
    blockedFoods: string[] = []
): Promise<Record<string, GeneratedMeal[]>> {
    console.log("[SERVER ACTION CALLED]");
    console.log(`[AI REQUEST] generateMealPlanAction for ${dates.length} days. User: ${userData.age}yr, ${userData.weight}kg`);
    
    const adminSettings = await getAdminSettings();
    const settings = adminSettings || clientSettings;

    // Security Check: Ensure API key is present on server
    if (!process.env.GROQ_API_KEY) {
        console.error("[AI ERROR] GROQ_API_KEY is missing on server.");
        throw new Error("AI configuration error: Missing API Key.");
    }

    try {
        const result = await generateMultiDayMealPlanAI(
            userData,
            settings,
            dates,
            blockedFoods
        );
        
        console.log(`[AI RESPONSE] Successfully generated meals for ${Object.keys(result).length} dates.`);
        return result;
    } catch (error: any) {
        console.error("[AI ERROR] Meal generation failed:", error.message || error);
        throw error;
    }
}

/**
 * Server Action: Suggest Foods for Discover Page
 */
export async function suggestFoodsAction(
    userData: any,
    goal: string,
    dietType: string,
    blockedFoods: string[] = []
) {
    console.log(`[AI REQUEST] suggestFoodsAction. Goal: ${goal}, Diet: ${dietType}`);

    if (!process.env.GROQ_API_KEY) {
        console.error("[AI ERROR] GROQ_API_KEY is missing on server.");
        throw new Error("AI configuration error: Missing API Key.");
    }

    try {
        const result = await suggestFoodsAI(userData, goal, dietType, blockedFoods);
        console.log(`[AI RESPONSE] Successfully suggested ${result.length} foods.`);
        return result;
    } catch (error: any) {
        console.error("[AI ERROR] Food suggestion failed:", error.message || error);
        throw error;
    }
}

/**
 * Server Action: Rebalance Day
 */
export async function rebalanceDayAction(
    currentMeals: GeneratedMeal[],
    addedItem: any,
    slot: string,
    userData: any,
    targetCalories: number
) {
    console.log(`[AI REQUEST] rebalanceDayAction for slot: ${slot}. Added: ${addedItem.name}`);

    const adminSettings = await getAdminSettings();

    if (!process.env.GROQ_API_KEY) {
        console.error("[AI ERROR] GROQ_API_KEY is missing on server.");
        throw new Error("AI configuration error: Missing API Key.");
    }

    try {
        const result = await rebalanceDayAI(
            currentMeals,
            addedItem,
            slot,
            userData,
            targetCalories,
            adminSettings
        );
        console.log(`[AI RESPONSE] Day rebalanced successfully.`);
        return result;
    } catch (error: any) {
        console.error("[AI ERROR] Day rebalance failed:", error.message || error);
        throw error;
    }
}
