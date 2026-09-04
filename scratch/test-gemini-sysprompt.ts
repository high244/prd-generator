import fs from "fs";
import path from "path";

// Read .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf-8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
      const idx = trimmed.indexOf("=");
      const key = trimmed.slice(0, idx).trim();
      const val = trimmed.slice(idx + 1).trim();
      process.env[key] = val;
    }
  }
}

import { generateWithGemini } from "../lib/gemini";

async function test() {
  try {
    const res = await generateWithGemini({
      systemPrompt: "Jawablah hanya dalam 1 kata: 'BERHASIL'.",
      userPrompt: "Tes koneksi Gemini API.",
      preferredModel: "gemini-3.6-flash",
    });
    console.log("Output Gemini:", res.text, "| Model:", res.model);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
