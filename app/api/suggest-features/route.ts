import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { generateSuggestedFeatures, type FeatureItem } from "@/lib/prompt";
import { generateWithGemini } from "@/lib/gemini";
import { generateWithOpenRouter } from "@/lib/openrouter";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { nama?: string; ide?: string; category?: string; preferredModel?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body request tidak valid." },
      { status: 400 }
    );
  }

  const { nama = "", ide = "", category = "", preferredModel } = body;

  if (!ide.trim() && !nama.trim()) {
    return NextResponse.json(
      { error: "Masukkan minimal nama atau deskripsi ide aplikasi." },
      { status: 400 }
    );
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const systemPrompt = `Kamu adalah Product Manager handal. Tugasmu adalah memecah ide aplikasi menjadi 6-8 fitur terstruktur dengan prioritas:
- P0: Fitur Wajib / Core MVP (3-4 fitur)
- P1: Fitur Nilai Tambah / Retensi (2 fitur)
- P2: Fitur Admin / Operasional (1-2 fitur)

Kembalikan HANYA JSON array murni tanpa markdown fence, tanpa teks pembuka atau penutup. Format setiap item:
[
  {
    "id": "f-1",
    "title": "Nama Fitur Ringkas (3-5 kata)",
    "description": "Deskripsi singkat fungsi dan manfaat fitur (1 kalimat)",
    "priority": "P0",
    "category": "Kategori",
    "selected": true
  }
]`;

  const userPrompt = `Nama Aplikasi: ${nama || "(belum ditentukan)"}
Ide & Masalah yang ingin diselesaikan: ${ide}
Kategori / Industri: ${category || "Umum / Web App"}

Buatkan daftar fitur terstruktur yang paling esensial dan berdampak tinggi untuk MVP project ini.`;

  const isOpenRouterRequested = Boolean(preferredModel?.startsWith("openrouter"));

  // 1. Prioritaskan OpenRouter jika model OpenRouter dipilih secara eksplisit atau jika OpenRouter satu-satunya key yang diset
  if (isOpenRouterRequested || (!geminiKey && !anthropicKey && openrouterKey)) {
    try {
      const openrouterRes = await generateWithOpenRouter({
        systemPrompt,
        userPrompt,
        preferredModel: preferredModel || "openrouter-claude-3.5-sonnet",
      });

      const cleanJson = openrouterRes.text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();

      const parsedFeatures: FeatureItem[] = JSON.parse(cleanJson);
      if (Array.isArray(parsedFeatures) && parsedFeatures.length > 0) {
        return NextResponse.json({
          features: parsedFeatures,
          source: "openrouter",
          model: openrouterRes.model,
        });
      }
    } catch (openrouterErr) {
      console.warn("OpenRouter suggest-features failed:", openrouterErr);
    }
  }

  // 2. Google Gemini API jika key tersedia
  if (!isOpenRouterRequested && geminiKey && geminiKey.trim().length > 10) {
    try {
      const geminiRes = await generateWithGemini({
        systemPrompt,
        userPrompt,
        preferredModel: preferredModel || "gemini-3.6-flash",
      });

      const cleanJson = geminiRes.text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();

      const parsedFeatures: FeatureItem[] = JSON.parse(cleanJson);
      if (Array.isArray(parsedFeatures) && parsedFeatures.length > 0) {
        return NextResponse.json({
          features: parsedFeatures,
          source: "gemini",
          model: geminiRes.model,
        });
      }
    } catch (geminiErr) {
      console.warn("Gemini suggest-features failed:", geminiErr);
    }
  }

  // 3. OpenRouter Fallback jika Gemini gagal dan OpenRouter belum dieksekusi
  if (!isOpenRouterRequested && openrouterKey && openrouterKey.trim().length > 5) {
    try {
      const openrouterRes = await generateWithOpenRouter({
        systemPrompt,
        userPrompt,
        preferredModel: "openrouter-claude-3.5-sonnet",
      });

      const cleanJson = openrouterRes.text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();

      const parsedFeatures: FeatureItem[] = JSON.parse(cleanJson);
      if (Array.isArray(parsedFeatures) && parsedFeatures.length > 0) {
        return NextResponse.json({
          features: parsedFeatures,
          source: "openrouter",
          model: openrouterRes.model,
        });
      }
    } catch (orErr) {
      console.warn("OpenRouter fallback suggest-features failed:", orErr);
    }
  }

  // 4. Fallback Claude (Direct)
  if (anthropicKey && anthropicKey.startsWith("sk-ant-") && !anthropicKey.includes("xxxxxxxx")) {
    try {
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      const promptText = `Nama Aplikasi: ${nama || "(belum ditentukan)"}
Ide & Masalah yang ingin diselesaikan: ${ide}
Kategori / Industri: ${category || "Umum / Web App"}

Buatkan daftar fitur terstruktur yang paling esensial dan berdampak tinggi untuk MVP project ini.`;

      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: "user", content: promptText }],
      });

      const responseText = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n")
        .trim();

      const cleanJson = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/, "")
        .replace(/\s*```$/, "")
        .trim();
      const parsedFeatures = JSON.parse(cleanJson);

      if (Array.isArray(parsedFeatures) && parsedFeatures.length > 0) {
        return NextResponse.json({
          features: parsedFeatures,
          source: "claude",
        });
      }
    } catch (err) {
      console.warn("Claude suggest-features failed:", err);
    }
  }

  // 3. Fallback Cerdas Bawaan jika API eksternal tidak aktif / kuota habis
  const fallbackFeatures = generateSuggestedFeatures(nama, ide, category);
  return NextResponse.json({
    features: fallbackFeatures,
    source: "fallback",
    warning: "Menggunakan rekomendasi cerdas bawaan.",
  });
}

