/**
 * Groq AI Client Utility
 * Handles communication with the Groq API (Llama 3.3 70B)
 */

const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";

export interface GroqMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function callGroqAPI(
  messages: GroqMessage[],
  options?: {
    maxTokens?: number;
    temperature?: number;
    timeoutMs?: number;
    model?: string;
  }
) {
  // ✅ FIXED (IMPORTANT)
  const apiKey = process.env.GROQ_API_KEY;

  const model =
    options?.model ||
    process.env.NEXT_PUBLIC_GROQ_MODEL ||
    "llama-3.3-70b-versatile";

  if (!apiKey) {
    console.error("[Groq] GROQ_API_KEY is missing.");
    throw new Error(
      "Missing Groq API Key. Please set GROQ_API_KEY in your environment."
    );
  }

  const maxTokens = options?.maxTokens ?? 8192;
  const temperature = options?.temperature ?? 0.3;
  const timeoutMs = options?.timeoutMs ?? 60000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  console.log("[AI REQUEST START]");
  console.log("[API KEY EXISTS]", !!apiKey);
  console.log("[MODEL]", model);
  console.log(
    `[AI REQUEST] Model: ${model} | Max tokens: ${maxTokens} | Messages: ${messages.length}`
  );
  console.log("[AI PROMPT SAMPLE]", messages[messages.length - 1].content.substring(0, 200) + "...");

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: temperature,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[AI RAW ERROR]", JSON.stringify(errorData));
      throw new Error(
        errorData?.error?.message ||
          `Groq API Error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log(
      "[AI SUCCESS] Status:",
      response.status,
      "| Finish:",
      data.choices?.[0]?.finish_reason
    );

    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Groq API returned empty content");
    }

    return content;
  } catch (error: any) {
    clearTimeout(timeoutId);

    if (error.name === "AbortError") {
      throw new Error(`AI Request Timed Out (${timeoutMs / 1000}s)`);
    }

    console.error("[Groq API Failed]:", error.message || error);
    throw error;
  }
}