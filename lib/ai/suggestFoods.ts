/**
 * AI Food Recommendation Engine
 * Suggests personalized foods from the database using Groq (Llama 3 70B)
 */

import { callGroqAPI } from "./groq";
import { FULL_DISCOVER_DATABASE } from "../discover-db";

export interface AISuggestion {
    name: string;
    reason: string;
    score: number;
}

/**
 * Generates personalized food recommendations based on user data.
 */
export async function suggestFoodsAI(userData: any, goal: string, dietType: string, blockedFoodNames: string[] = []) {
    // 1. Prepare context for AI (Sample of database items for better suggestions)
    const sampleFoods = FULL_DISCOVER_DATABASE.slice(0, 20).map(f => ({ name: f.name, calories: f.nutrition.calories, protein: f.nutrition.protein }));
    
    const prompt = `
You are a professional nutritionist. Recommend 5-8 foods for a user.

User Context:
- Current Weight: ${userData.weight}kg
- Goal: ${goal}
- Diet Type: ${dietType}
- Blocked Foods: ${blockedFoodNames.join(", ")}

Task:
Suggest foods from a nutritional standpoint that help reach this goal.

Constraints:
1. Recommend foods that are likely to be in a standard healthy database.
2. Provide a specific, personalized "reason" for each food.
3. Assign a "score" (0-100) based on how well it fits their specific case.

Return ONLY valid JSON in this exact format:
{
  "foods": [
    { "name": "Food Name", "reason": "Short personalized explanation", "score": 95 }
  ]
}
`;

    console.log("AI Discovery Prompt:", prompt);

    try {
        const responseText = await callGroqAPI([{ role: "user", content: prompt }]);
        console.log("AI Discovery Response:", responseText);

        const data = JSON.parse(responseText);

        if (!data.foods || !Array.isArray(data.foods)) {
            throw new Error("Invalid AI response structure for discovery");
        }

        // Final Filter: Blocked Foods safety
        const filteredSuggestions = data.foods.filter((s: any) => {
            const isBlocked = blockedFoodNames.some(blocked => 
                s.name.toLowerCase().includes(blocked.toLowerCase())
            );
            return !isBlocked;
        });

        return filteredSuggestions as AISuggestion[];

    } catch (error) {
        console.error("AI Food Suggestion Failed:", error);
        throw error;
    }
}
