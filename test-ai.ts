
import { generateMultiDayMealPlanAI } from './lib/ai/generateMealPlan';
import fs from 'fs';

// Simple env loader
const env = fs.readFileSync('.env', 'utf8');
env.split('\n').forEach(line => {
    const [key, value] = line.split('=');
    if (key && value) process.env[key.trim()] = value.trim().replace(/^"(.*)"$/, '$1');
});

async function run() {
    console.log("[DEBUG] GROQ_API_KEY EXISTS:", !!process.env.GROQ_API_KEY);
    console.log("[DEBUG] MODEL:", process.env.NEXT_PUBLIC_GROQ_MODEL);

    const userData = {
        age: 32,
        weight: 70,
        goalType: 'lose',
        calorieTarget: 1992,
        proteinTarget: 150,
        carbsTarget: 200,
        fatsTarget: 60
    };

    const dates = [new Date().toISOString().split('T')[0]];

    console.log("Starting AI Generation Test...");
    try {
        const res = await generateMultiDayMealPlanAI(userData, {}, dates);
        console.log("SUCCESS");
        console.log(JSON.stringify(res, null, 2));
    } catch (err: any) {
        console.error("FAILURE");
        console.error(err.message || err);
    }
}

run();
