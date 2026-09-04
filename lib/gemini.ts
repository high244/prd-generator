export interface GeminiGenerateOptions {
  systemPrompt?: string;
  userPrompt: string;
  preferredModel?: string;
  temperature?: number;
  maxOutputTokens?: number;
}

export interface GeminiResponse {
  text: string;
  model: string;
}

const CANDIDATE_MODELS = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-3.8-flash",
  "gemini-flash-latest",
];

export async function generateWithGemini(
  options: GeminiGenerateOptions
): Promise<GeminiResponse> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY belum diset pada environment variables.");
  }

  const modelsToTry = options.preferredModel
    ? [
        options.preferredModel,
        ...CANDIDATE_MODELS.filter((m) => m !== options.preferredModel),
      ]
    : CANDIDATE_MODELS;

  let lastError: Error | null = null;

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      let userText = options.userPrompt;
      if (options.systemPrompt) {
        userText = `${options.systemPrompt}\n\n---\n\n${options.userPrompt}`;
      }

      const payload: Record<string, unknown> = {
        contents: [
          {
            role: "user",
            parts: [{ text: userText }],
          },
        ],
        generationConfig: {
          temperature: options.temperature ?? 0.7,
          maxOutputTokens: options.maxOutputTokens ?? 4000,
        },
      };

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(60000), // 60 detik agar output PRD panjang & kompleks tidak terputus timeout
      });

      const data = await res.json();

      if (!res.ok) {
        const errMsg = data.error?.message || `HTTP ${res.status}`;
        console.warn(`[Gemini API] Model ${model} returned error: ${errMsg}`);
        lastError = new Error(`[${model}] ${errMsg}`);
        continue;
      }

      const candidates = data.candidates || [];
      if (candidates.length === 0) {
        lastError = new Error(`[${model}] No candidates in response`);
        continue;
      }

      const parts = candidates[0].content?.parts || [];
      const textParts = parts
        .filter((p: { text?: string; thought?: boolean }) => !p.thought && typeof p.text === "string")
        .map((p: { text: string }) => p.text);

      let text = textParts.join("\n").trim();

      if (!text) {
        // Fallback jika semua part tertandai thought atau struktur berbeda
        text = parts.map((p: { text?: string }) => p.text || "").join("\n").trim();
      }

      if (!text) {
        lastError = new Error(`[${model}] Respon teks kosong`);
        continue;
      }

      return { text, model };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini API] Failed request with ${model}: ${errorMsg}`);
      lastError = err instanceof Error ? err : new Error(errorMsg);
    }
  }

  throw lastError || new Error("Semua kandidat model Gemini gagal merespon.");
}
