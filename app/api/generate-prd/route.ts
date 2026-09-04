import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { buildPrompt, generateFallbackPRD, type PRDInput } from "@/lib/prompt";
import { generateWithGemini } from "@/lib/gemini";

export const dynamic = "force-dynamic";

interface GeneratePRDRequestBody extends Partial<PRDInput> {
  preferredModel?: string;
  engine?: string;
}

export async function POST(req: NextRequest) {
  let body: GeneratePRDRequestBody;

  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Body request tidak valid." },
      { status: 400 }
    );
  }

  const { nama, ide, fitur, preferredModel, engine } = body;

  const hasFeature =
    (Array.isArray(fitur) && fitur.length > 0) ||
    (typeof fitur === "string" && fitur.trim().length > 0);

  if (!nama?.trim() || !ide?.trim() || !hasFeature) {
    return NextResponse.json(
      { error: "Nama website, ide & masalah, dan fitur utama wajib diisi." },
      { status: 400 }
    );
  }

  // Jika user memilih Smart Offline Fallback Engine secara eksplisit
  if (engine === "fallback") {
    const fallbackMarkdown = generateFallbackPRD({
      nama: nama.trim(),
      ide: ide.trim(),
      fitur: fitur!,
      target: (body.target ?? "").trim(),
      stack: body.stack || "Next.js 14 + Tailwind CSS + Supabase",
      timeline: body.timeline,
      businessModel: body.businessModel,
    });
    return NextResponse.json({
      markdown: fallbackMarkdown,
      source: "fallback",
      model: "Smart Architecture Engine",
    });
  }

  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  const { system, user } = buildPrompt({
    nama: nama.trim(),
    ide: ide.trim(),
    fitur: fitur!,
    target: (body.target ?? "").trim(),
    stack: body.stack || "Next.js 14 + Tailwind CSS + Supabase",
    timeline: body.timeline,
    businessModel: body.businessModel,
  });

  // 1. Prioritaskan Google Gemini API jika key tersedia (dan user tidak memilih Claude saja)
  if (engine !== "claude-3-5-sonnet" && geminiKey && geminiKey.trim().length > 10) {
    try {
      const targetModel = preferredModel || "gemini-3.6-flash";
      const geminiRes = await generateWithGemini({
        systemPrompt: system,
        userPrompt: user,
        preferredModel: targetModel,
      });

      return NextResponse.json({
        markdown: geminiRes.text,
        source: "gemini",
        model: geminiRes.model,
      });
    } catch (geminiErr) {
      console.warn("Gemini API call failed, attempting fallback:", geminiErr);
    }
  }

  // 2. Alternatif: Anthropic Claude API
  const isAnthropicKeyValid =
    Boolean(anthropicKey) &&
    anthropicKey!.startsWith("sk-ant-") &&
    !anthropicKey!.includes("xxxxxxxx");

  if (isAnthropicKeyValid) {
    try {
      const anthropic = new Anthropic({ apiKey: anthropicKey });
      const message = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 3500,
        system,
        messages: [{ role: "user", content: user }],
      });

      const markdown = message.content
        .filter((block): block is Anthropic.TextBlock => block.type === "text")
        .map((block) => block.text)
        .join("\n");

      if (markdown) {
        return NextResponse.json({ markdown, source: "claude" });
      }
    } catch (claudeErr) {
      console.warn("Claude API call failed:", claudeErr);
    }
  }

  // 3. Smart Fallback Engine bawaan jika API eksternal gagal / kuota habis
  const fallbackMarkdown = generateFallbackPRD({
    nama: nama.trim(),
    ide: ide.trim(),
    fitur: fitur!,
    target: (body.target ?? "").trim(),
    stack: body.stack || "Next.js 14 + Tailwind CSS + Supabase",
    timeline: body.timeline,
    businessModel: body.businessModel,
  });

  return NextResponse.json({
    markdown: fallbackMarkdown,
    source: "fallback",
    note: "Dokumen disusun oleh Smart Fallback Engine berstandar industri.",
  });
}
