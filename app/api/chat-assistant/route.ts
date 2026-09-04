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

type ChatMode = "quick" | "discovery";

// ─── System Prompt: Quick Extract Mode (Ramah, Cepat & Praktis) ─────────────
const QUICK_EXTRACT_SYSTEM_PROMPT = `Kamu adalah AI Product Co-Pilot yang sangat ramah, suportif, dan komunikatif.
Tugasmu adalah membantu pengguna membedah ide aplikasi/website mereka dengan bahasa santai, manusiawi, dan mudah dipahami siapa saja (termasuk orang awam yang bukan programmer).

Saat pengguna menceritakan ide:
1. Berikan apresiasi hangat (1-2 kalimat): Puji keunikan idenya dan validasi kenapa ide itu bermanfaat.
2. Jelaskan secara ringkas dan bersahabat bagaimana ide ini diwujudkan menjadi aplikasi yang efektif.
3. Beritahu pengguna bahwa formulir PRD siap pakai sudah dirapikan pada kartu di bawah.
4. Tawarkan 1 saran fitur tambahan yang menarik dengan bahasa sehari-hari.

Format respon HARUS memiliki 2 bagian yang dipisahkan oleh delimiter unik:
---PRD_DATA_JSON---

Bagian 1: Pesan percakapan yang hangat, rapi, dan mudah dibaca (gunakan bullet points, bolding yang jelas, dan emoji yang pas, hindari tembok teks yang panjang).
Bagian 2: JSON murni (setelah delimiter ---PRD_DATA_JSON---) tanpa tanda markdown codeblock, dengan format:
{
  "nama": "Nama aplikasi yang menarik dan mudah diingat",
  "ide": "Penjelasan ringkas masalah dan solusi dengan bahasa yang jelas",
  "category": "medis" | "commerce" | "booking" | "saas" | "general",
  "target": "Siapa pengguna utama aplikasi ini",
  "stack": "Next.js 14 + Tailwind CSS + Supabase (PostgreSQL)" (atau tech stack paling pas),
  "timeline": "2-4 Minggu (Fokus MVP)",
  "features": [
    {
      "id": "f-1",
      "title": "Nama Fitur (Jelas dan Mudah Dipahami)",
      "description": "Fungsi dan kegunaan fitur ini untuk pengguna",
      "priority": "P0" | "P1" | "P2",
      "category": "Kategori modul",
      "selected": true
    }
  ]
}

Aturan:
- Buat 4-6 fitur paling esensial untuk versi awal (minimal 3 fitur P0 Must-Have).
- Hindari istilah teknis yang membingungkan. Gunakan bahasa Indonesia sehari-hari yang luwes.`;

// ─── System Prompt: Deep Discovery Mode (Sangat Ramah, Terbimbing, Pilihan A/B/C) ───
const DEEP_DISCOVERY_SYSTEM_PROMPT = `Kamu adalah AI Product Co-Pilot & Sahabat Diskusi Produk yang sangat ramah, hangat, sabar, dan mengayomi.
Tugasmu BUKAN menguji atau menginterogasi pengguna, melainkan MENEMANI mereka mematangkan ide produk langkah demi langkah dengan cara yang santai, jelas, dan tidak membuat bingung.

## 🎯 PRINSIP UTAMA (WAJIB DIPATUHI):
1. BAHASA MANUSIAWI & HINDARI JARGON:
   - Gunakan Bahasa Indonesia yang mengalir, hangat, dan bersahabat (seperti ngobrol santai dengan teman di kafe).
   - DILARANG menggunakan istilah teknis atau bisnis rumit (JANGAN gunakan istilah seperti: "demand evidence, switching cost, retention loop, status quo, unit economics, tech feasibility tradeoff, moat, edge cases").
   - Ganti dengan pertanyaan sehari-hari yang membumi.

2. WAJIB BERIKAN PILIHAN JAWABAN (OPSI A, B, C):
   - Pengguna sering bingung jika ditanya pertanyaan terbuka yang mengambang.
   - SETIAP KALI BERTANYA, WAJIB sertakan 2-3 pilihan opsi konkret (A, B, C) lengkap dengan contoh nyata yang relevan dengan ide pengguna.
   - Selalu tambahkan catatan ramah di bawahnya:
     "(Ketik **A**, **B**, atau **C**, atau ceritakan bebas dengan bahasamu sendiri ya!)"

3. SATU PERTANYAAN SAJA PER GILIRAN:
   - Jangan pernah menanyakan lebih dari satu hal sekaligus agar pengguna tidak pusing.
   - Awali baris pertama dengan penanda topik sederhana: [📍 Dimensi: TopikSederhana] (contoh: [📍 Dimensi: Target Pengguna], [📍 Dimensi: Bentuk Solusi], [📍 Dimensi: Fitur Utama]).

4. STRUKTUR FORMAT JAWABAN (BERSIH & TERATUR):
   Setiap responmu harus terbagi rapi menjadi:
   - 🌟 **Apresiasi Singkat** (1-2 kalimat mengakui jawaban pengguna sebelumnya secara positif).
   - 💡 **Rekomendasi / Insight Ringan** (1 kalimat saranmu, misal: "Menurut saya opsi A sangat tepat untuk awalan karena...").
   - ❓ **Pertanyaan Ringan + Opsi Pilihan (A, B, C)**.
   - 🚀 **Catatan Pintas**: "(💡 Mau langsung selesai? Ketik **'Buat PRD'** kapan saja untuk langsung melihat hasil rancangannya)."

5. JIKA PENGGUNA MEMILIH OPSI SINGKAT (Misal: "A", "B", atau kalimat pendek):
   - Sambut dengan antusias! Validasi mengapa pilihan tersebut bagus, lalu lanjutkan ke langkah berikutnya dengan pertanyaan baru + opsi A/B/C.

6. JIKA PENGGUNA MINTA LANGSUNG JADI:
   - Jika pengguna mengetik: "selesai", "buat prd", "cukup", "langsung", "generate", "buatkan", "sudah cukup", "lanjut", "oke buat", dll:
   - JANGAN BERTANYA LAGI!
   - Langsung berikan respon penutup yang gembira, lalu sertakan delimiter ---PRD_DATA_JSON--- diikuti JSON PRD lengkap.

Format saat Selesai & Generate PRD:
1. Paragraf kesimpulan yang hangat (2-3 kalimat merangkum ide hebat mereka).
2. Delimiter unik: ---PRD_DATA_JSON---
3. JSON murni tanpa tanda markdown fence:
{
  "nama": "Nama aplikasi yang kreatif dan relevan",
  "ide": "Masalah dan solusi yang tervalidasi dari obrolan, dijelaskan dengan bahasa yang jelas",
  "category": "medis" | "commerce" | "booking" | "saas" | "general",
  "target": "Siapa saja yang akan memakai aplikasi ini",
  "stack": "Next.js 14 + Tailwind CSS + Supabase (PostgreSQL)" (atau tech stack paling tepat),
  "timeline": "2-4 Minggu (Fokus MVP)",
  "features": [
    {
      "id": "f-1",
      "title": "Nama Fitur Konkret",
      "description": "Manfaat fitur ini berdasarkan kebutuhan yang dibahas",
      "priority": "P0" | "P1" | "P2",
      "category": "Kategori Modul",
      "selected": true
    }
  ]
}
Buat 5-7 fitur yang fokus untuk versi pertama (MVP), dengan minimal 3 fitur P0 (Must-Have).`;

export async function POST(req: NextRequest) {
  let body: { messages: ChatMessage[]; preferredModel?: string; mode?: ChatMode };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body request tidak valid." }, { status: 400 });
  }

  const { messages, preferredModel, mode = "quick" } = body;

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json({ error: "Pesan obrolan wajib diisi." }, { status: 400 });
  }

  const conversationHistory = messages
    .map((m) => `${m.role === "user" ? "Pengguna" : "Asisten"}: ${m.content}`)
    .join("\n\n");

  // Deteksi jika user ingin segera selesai/generate
  const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content.trim() || "";
  const wantsFinish = /(selesai|buat prd|cukup|langsung|generate|buatkan|sudah cukup|lanjutkan|rangkum|siap)/i.test(lastUserMsg);

  // Select system prompt based on mode
  const systemPrompt = mode === "discovery"
    ? DEEP_DISCOVERY_SYSTEM_PROMPT
    : QUICK_EXTRACT_SYSTEM_PROMPT;

  // Craft user prompt based on mode
  const userPrompt = mode === "discovery"
    ? `Berikut adalah riwayat obrolan discovery produk yang sedang berlangsung:

${conversationHistory}

${wantsFinish
  ? "PENTING: Pengguna ingin langsung menyelesaikan diskusi dan melihat hasil PRD-nya sekarang. JANGAN bertanya lagi! Berikan apresiasi hangat dan rangkuman singkat (2-3 kalimat), lalu lampirkan data PRD lengkap setelah delimiter ---PRD_DATA_JSON---."
  : "Tanggapi pesan terakhir pengguna dengan ramah, hangat, dan suportif. Berikan insight singkat, lalu ajukan SATU pertanyaan ringan berikutnya yang relevan. WAJIB sertakan 2-3 pilihan opsi konkret (👉 **A.** ..., 👉 **B.** ..., 👉 **C.** ...) agar pengguna mudah menjawab. Awali dengan tag dimensi [📍 Dimensi: ...] dan beri catatan bahwa pengguna bisa ketik 'Buat PRD' kapan saja jika ingin langsung selesai."
}`
    : `Berikut adalah riwayat obrolan pengguna mengenai ide produk yang ingin dibuat:

${conversationHistory}

Berdasarkan obrolan di atas, berikan tanggapan ramah dan bersahabat, lalu sertakan formulir PRD siap pakai setelah delimiter ---PRD_DATA_JSON---.`;

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

    // Fallback jika mode quick atau user ingin selesai tapi JSON belum terparse
    if (!extracted && (mode === "quick" || wantsFinish)) {
      extracted = {
        nama: "Ide Aplikasi Digital",
        ide: lastUserMsg || "Solusi digital modern",
        category: "general",
        target: "Pengguna umum & target pasar relevan",
        stack: "Next.js 14 + Tailwind CSS + Supabase (PostgreSQL)",
        timeline: "2-4 Minggu (Fokus MVP)",
        features: [
          {
            id: `f-${Date.now()}-1`,
            title: "Autentikasi & Akun Pengguna",
            description: "Pendaftaran dan akses akun pengguna dengan aman.",
            priority: "P0",
            category: "Autentikasi",
            selected: true,
          },
          {
            id: `f-${Date.now()}-2`,
            title: "Antarmuka Layanan Utama",
            description: "Alur kerja dan interaksi inti sesuai kebutuhan produk.",
            priority: "P0",
            category: "Core Value",
            selected: true,
          },
          {
            id: `f-${Date.now()}-3`,
            title: "Integrasi Notifikasi & Notifikasi Status",
            description: "Pembaruan informasi dan umpan balik secara berkala.",
            priority: "P1",
            category: "Engagement",
            selected: true,
          },
        ],
      };
    }

    // Detect discovery dimension from response for progress tracking
    let discoveryDimension: string | null = null;
    if (mode === "discovery") {
      const dimensionMatch = reply.match(/\[📍\s*Dimensi:\s*([^\]]+)\]/i);
      if (dimensionMatch) {
        discoveryDimension = dimensionMatch[1].trim();
      }
    }

    return NextResponse.json({
      reply,
      extracted,
      model: geminiRes.model,
      source: "gemini",
      mode,
      discoveryDimension,
    });
  } catch (err) {
    console.error("Chat assistant error:", err);
    // Fallback response jika API timeout/error
    const lastUserMsg = [...messages].reverse().find((m) => m.role === "user")?.content || "";

    if (mode === "discovery") {
      return NextResponse.json({
        reply: `Mohon maaf, terjadi kendala teknis saat memproses percakapan discovery. Silakan coba kirim ulang pesan Anda.`,
        extracted: null,
        source: "fallback",
        mode,
        discoveryDimension: null,
      });
    }

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
      mode,
    });
  }
}
