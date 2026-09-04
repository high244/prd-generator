export interface OpenRouterGenerateOptions {
  systemPrompt?: string;
  userPrompt: string;
  preferredModel?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface OpenRouterResponse {
  text: string;
  model: string;
}

// Map our internal engine ID to OpenRouter model string
export function mapEngineToOpenRouterModel(engineId?: string): string {
  if (!engineId) return "anthropic/claude-3.5-sonnet";

  switch (engineId) {
    case "openrouter-claude-3.5-sonnet":
      return "anthropic/claude-3.5-sonnet";
    case "openrouter-deepseek-r1":
      return "deepseek/deepseek-r1";
    case "openrouter-gpt-4o":
      return "openai/gpt-4o";
    case "openrouter-llama-3.3-70b":
      return "meta-llama/llama-3.3-70b-instruct";
    default:
      if (engineId.startsWith("openrouter/")) {
        return engineId.replace(/^openrouter\//, "");
      }
      return engineId;
  }
}

export async function generateWithOpenRouter(
  options: OpenRouterGenerateOptions
): Promise<OpenRouterResponse> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey || apiKey.trim().length < 5) {
    throw new Error(
      "OPENROUTER_API_KEY belum diset pada environment variables (.env.local). Silakan buat API Key di https://openrouter.ai/keys"
    );
  }

  const model = mapEngineToOpenRouterModel(options.preferredModel);

  const messages: Array<{ role: "system" | "user"; content: string }> = [];
  if (options.systemPrompt) {
    messages.push({ role: "system", content: options.systemPrompt });
  }
  messages.push({ role: "user", content: options.userPrompt });

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "PRD Architect Studio",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.maxTokens ?? 8192,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    let errMsg = `OpenRouter API error (status ${res.status})`;
    try {
      const errJson = JSON.parse(errText);
      if (errJson.error?.message) {
        errMsg = errJson.error.message;
      }
    } catch {
      // Use fallback error
    }
    throw new Error(errMsg);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (!text) {
    throw new Error("OpenRouter mengembalikan respon kosong.");
  }

  return {
    text,
    model: data.model || model,
  };
}
