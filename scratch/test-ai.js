
const { generateMultiDayMealPlanAI } = require('./lib/ai/generateMealPlan');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

// Add GROQ_API_KEY from environment if available
if (!process.env.GROQ_API_KEY) {
    console.error("GROQ_API_KEY not found in .env.local. Please ensure it is set.");
    process.exit(1);
}

const userData = {
    age: 30,
    weight: 70,
    goalType: 'lose',
    calorieTarget: 1992,
    proteinTarget: 150,
    carbsTarget: 200,
    fatsTarget: 60
};

const dates = [new Date().toISOString().split('T')[0]];

console.log("Starting AI Generation Test...");
generateMultiDayMealPlanAI(userData, {}, dates)
    .then(res => {
        console.log("SUCCESS");
        console.log(JSON.stringify(res, null, 2));
    })
    .catch(err => {
        console.error("FAILURE");
        console.error(err);
    });
