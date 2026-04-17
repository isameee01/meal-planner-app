/**
 * Groq AI Client Utility
 * Handles communication with the Groq API (Llama 3 70B)
 */

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
export interface GroqMessage {
    role: "system" | "user" | "assistant";
    content: string;
}

// Mocks removed for production hardening.

export async function callGroqAPI(messages: GroqMessage[]) {
    const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
    const model = process.env.NEXT_PUBLIC_GROQ_MODEL || "llama-3.3-70b-versatile";

    if (!apiKey) {
        console.error("[Groq] NEXT_PUBLIC_GROQ_API_KEY is missing. AI features will fail.");
        throw new Error("Missing Groq API Key. Please set NEXT_PUBLIC_GROQ_API_KEY in your environment.");
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

    try {
        console.log(`[AI Request] Mode: Production | Model: ${model}`);
        const response = await fetch(GROQ_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: model,
                messages: messages,
                temperature: 0.3,
                max_tokens: 2048,
                response_format: { type: "json_object" }
            }),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error("[AI RAW ERROR]", errorData);
            throw new Error(errorData.error?.message || `Groq API Error: ${response.status}`);
        }

        const data = await response.json();
        console.log("[AI RAW RESPONSE]", JSON.stringify(data, null, 2));
        
        try {
            const fs = require('fs');
            const logContent = `\n--- NEW AI REQUEST ---\nModel: ${model}\nRAW RESPONSE:\n${JSON.stringify(data, null, 2)}\n`;
            fs.appendFileSync('ai_telemetry.log', logContent);
        } catch (e) { }
        
        const content = data.choices[0].message.content;
        try {
            const parsed = JSON.parse(content);
            console.log("[AI PARSED JSON]", JSON.stringify(parsed, null, 2));
            try {
                const fs = require('fs');
                fs.appendFileSync('ai_telemetry.log', `\nPARSED JSON:\n${JSON.stringify(parsed, null, 2)}\n`);
            } catch (e) {}
        } catch (e) {
            console.warn("[AI PARSE WARNING] Response was not JSON or failed to parse locally.");
            try {
                const fs = require('fs');
                fs.appendFileSync('ai_telemetry.log', `\nFAILED TO PARSE JSON:\n${content}\n`);
            } catch (e) {}
        }

        return content;
    } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.name === 'AbortError') {
            throw new Error("AI Request Timed Out (10s limit)");
        }
        console.error("Groq API Call Failed:", error);
        throw error;
    }
}
