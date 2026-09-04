import { NextRequest, NextResponse } from "next/server";
import { generateWithGemini } from "@/lib/gemini";
import type { FeatureItem } from "@/lib/prompt";

export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ExtractedPRDData {
  nama: string;
  ide: string;
  category: string;
  target: string;
  stack: string;
  timeline: string;
  features: FeatureItem[];
}

export async function POST(req: NextRequest) {
  let body: { messages: ChatMessage[]; preferredModel?: string };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body request tidak valid." }, { status: 400 });
  }

  const { messages, preferredModel } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Pesan obrolan wajib diisi." }, { status: 400 });
  }

  const conversationHistory = messages
    .map((m) => `${m.role === "user" ? "Pengguna" : "Asisten"}: ${m.content}`)
    .join("\n\n");

  const systemPrompt = `Kamu adalah AI Product Management Consultant yang ramah, cerdas, dan interaktif.
Tugasmu adalah mendengarkan keinginan, ide, atau obrolan santai pengguna tentang produk/website/aplikasi yang ingin mereka bangun, lalu:
1. Menjawab secara percakapan santai & profesional dalam Bahasa Indonesia (memberikan apresiasi, tanggapan singkat, dan saran nilai tambah).
2. Mengekstrak dan memetakan informasi tersebut ke dalam format formulir PRD siap pakai.

Format jawaban HARUS memiliki 2 bagian yang dipisahkan oleh delimiter unik:
---PRD_DATA_JSON---

Bagian 1: Jawaban Percakapan Anda (1-2 paragraf ramah menjelaskan apa yang sudah Anda rangkum dan saran fitur).
Bagian 2: JSON murni (setelah delimiter ---PRD_DATA_JSON---) tanpa markdown fence, dengan struktur:
{
  "nama": "Nama website/aplikasi yang menarik",
  "ide": "Ringkasan masalah dan solusi yang diselesaikan",
  "category": "medis" | "commerce" | "booking" | "saas" | "general",
  "target": "Profil target pengguna utama",
  "stack": "Next.js 14 + Tailwind CSS + Supabase (PostgreSQL)" (atau yang paling cocok),
  "timeline": "2-4 Minggu (Fokus MVP)",
  "features": [
    {
      "id": "f-1",
      "title": "Nama Fitur (3-5 kata)",
      "description": "Fungsi singkat",
      "priority": "P0" | "P1" | "P2",
      "category": "Kategori modul",
      "selected": true
    }
  ]
}

Aturan Penting:
- Buat 4-6 fitur yang paling esensial (minimal 3 fitur P0 Must-Have).
- Jika pengguna belum menyebutkan nama atau tech stack, rekomendasikan nama yang kreatif dan tech stack modern standar industri.`;

  const userPrompt = `Berikut adalah percakapan pengguna mengenai ide produk yang ingin dibuat:

${conversationHistory}

Berdasarkan percakapan di atas, berikan tanggapan percakapan Anda lalu sertakan JSON data formulir PRD setelah delimiter ---PRD_DATA_JSON---.`;

  try {
    const geminiRes = await generateWithGemini({
      systemPrompt,
      userPrompt,
      preferredModel: preferredModel || "gemini-3.6-flash",
    });

    const fullText = geminiRes.text;
    const parts = fullText.split("---PRD_DATA_JSON---");

    let reply = parts[0]?.trim() || "Baik, saya sudah memahami ide Anda dan merangkumnya.";
    let extracted: ExtractedPRDData | null = null;

    if (parts.length > 1) {
      try {
        const jsonStr = parts[1]
          .replace(/^```json\s*/i, "")
          .replace(/^```\s*/, "")
          .replace(/\s*```$/, "")
          .trim();
        extracted = JSON.parse(jsonStr);
      } catch (parseErr) {
        console.warn("Gagal parse JSON dari respon chat:", parseErr);
      }
    }

    // Jika parsing JSON gagal, buat estimasi fallback dari percakapan terakhir
    if (!extracted) {
      const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
      extracted = {
        nama: "Ide Aplikasi Baru",
        ide: lastUserMsg,
        category: "general",
        target: "Pengguna umum / target audiens relevan",
        stack: "Next.js 14 + Tailwind CSS + Supabase",
        timeline: "2-4 Minggu (Fokus MVP)",
        features: [
          {
            id: `f-${Date.now()}-1`,
            title: "Autentikasi & Profil Pengguna",
            description: "Pendaftaran dan pengelolaan akun pengguna aman.",
            priority: "P0",
            category: "Autentikasi",
            selected: true,
          },
          {
            id: `f-${Date.now()}-2`,
            title: "Dashboard Layanan Utama",
            description: "Antarmuka interaksi fitur inti produk.",
            priority: "P0",
            category: "Core Flow",
            selected: true,
          },
          {
            id: `f-${Date.now()}-3`,
            title: "Sistem Notifikasi & Feedback",
            description: "Pengingat status dan umpan balik pengguna.",
            priority: "P1",
            category: "Engagement",
            selected: true,
          },
        ],
      };
    }

    return NextResponse.json({
      reply,
      extracted,
      model: geminiRes.model,
      source: "gemini",
    });
  } catch (err) {
    console.error("Chat assistant error:", err);
    // Fallback response jika API timeout/error
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";
    return NextResponse.json({
      reply: `Ide yang sangat menarik! Saya telah merangkum poin-poin utama dari "${lastUserMsg.slice(0, 80)}..." dan memetakan struktur formulirnya untuk Anda.`,
      extracted: {
        nama: "Solusi Digital Baru",
        ide: lastUserMsg,
        category: "general",
        target: "Pengguna aktif digital",
        stack: "Next.js 14 + Tailwind CSS + Supabase",
        timeline: "2-4 Minggu (Fokus MVP)",
        features: [
          {
            id: "f-fb-1",
            title: "Manajemen Akun & Autentikasi",
            description: "Login cepat dan profil pengguna.",
            priority: "P0",
            category: "Autentikasi",
            selected: true,
          },
          {
            id: "f-fb-2",
            title: "Fitur Inti Transaksi / Aktivitas",
            description: "Pusat aktivitas sesuai ide yang dijelaskan.",
            priority: "P0",
            category: "Core Value",
            selected: true,
          },
          {
            id: "f-fb-3",
            title: "Integrasi Notifikasi Real-Time",
            description: "Update status instan ke pengguna.",
            priority: "P1",
            category: "Notifikasi",
            selected: true,
          },
        ],
      },
      source: "fallback",
    });
  }
}
