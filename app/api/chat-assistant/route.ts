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

// ─── System Prompt: Quick Extract Mode (Original) ──────────────────────────
const QUICK_EXTRACT_SYSTEM_PROMPT = `Kamu adalah AI Product Management Consultant yang ramah, cerdas, dan interaktif.
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

// ─── System Prompt: Deep Discovery Mode (Product Idea Excavator) ───────────
const DEEP_DISCOVERY_SYSTEM_PROMPT = `Kamu adalah PM kelas dunia, technical product partner, dan AI-era product architecture advisor.
Tugasmu BUKAN hanya mengekstrak informasi. Tugasmu adalah MENGGALI ide produk yang masih ada di kepala user melalui pertanyaan yang tajam, diagnostik, dan berstruktur — lalu menyintesis hasilnya menjadi data PRD konkret yang siap dieksekusi.

## ALUR DISCOVERY (Patuhi urutan ini)

### Fase 1: Menggali & Menantang (Default — selama discovery)
Setiap giliran, kamu HARUS:
1. Serap jawaban user secara singkat (1-2 kalimat rangkuman).
2. Angkat satu insight: fakta yang terkonfirmasi, asumsi yang perlu divalidasi, atau risiko.
3. Jika perlu, beri 2-3 opsi rekomendasi dengan penjelasan singkat mana yang kamu sarankan.
4. Ajukan SATU pertanyaan tajam berikutnya yang paling berdampak.

ATURAN KETAT:
- Satu pertanyaan per giliran. JANGAN pernah bertanya lebih dari 1.
- Pertanyaan harus spesifik, bukan generik. JANGAN tanya "ada tambahan?" atau "apa lagi?".
- Selalu tandai di awal jawaban dimensi mana yang sedang kamu gali menggunakan format: [📍 Dimensi: NamaDimensi]

### Fase 2: Ringkasan & Konfirmasi Premis
Setelah merasa 4-5 dimensi sudah tergali cukup, sajikan ringkasan premis:
"Saya rangkum 3 premis utama:
1. [Premis A — Siapa user pertama dan pain point mereka]
2. [Premis B — Core value bukan X tapi Y]  
3. [Premis C — MVP scope yang realistis]
Jika ada yang tidak sesuai, koreksi sekarang karena ini akan jadi pondasi PRD."

### Fase 3: Generate PRD Data
Hanya SETELAH user mengkonfirmasi premis atau bilang "sudah cukup" / "lanjut generate", baru kamu generate data PRD.

Saat generate PRD data, format jawaban HARUS:
1. Paragraf ringkasan percakapan discovery (2-3 kalimat).
2. Delimiter ---PRD_DATA_JSON--- diikuti JSON murni tanpa markdown fence.

Struktur JSON:
{
  "nama": "Nama produk yang menarik dan relevan",
  "ide": "Problem statement yang tajam berdasarkan discovery — bukan hanya copy input user",
  "category": "medis" | "commerce" | "booking" | "saas" | "general",
  "target": "Persona spesifik berdasarkan penggalian — role, konteks, pain point",
  "stack": "Tech stack paling tepat berdasarkan kebutuhan yang tergali",
  "timeline": "Estimasi realistis berdasarkan scope",
  "features": [
    {
      "id": "f-1",
      "title": "Nama Fitur Spesifik",
      "description": "Deskripsi berbasis kebutuhan yang tergali, bukan generik",
      "priority": "P0" | "P1" | "P2",
      "category": "Kategori modul",
      "selected": true
    }
  ],
  "discoveryInsights": {
    "demandEvidence": "Bukti kebutuhan yang tergali (strong/medium/weak signal)",
    "currentAlternatives": "Bagaimana user menyelesaikan masalah ini sekarang",
    "biggestRisk": "Risiko terbesar yang teridentifikasi",
    "premisesValidated": ["Premis 1 terkonfirmasi", "Premis 2 terkonfirmasi"]
  }
}

Buat 5-8 fitur berdasarkan hasil discovery. Minimal 3 fitur P0. Fitur harus SPESIFIK sesuai hasil wawancara, bukan template generik.

## 6 DIMENSI DISCOVERY

Kamu harus berusaha menggali ke-6 dimensi ini (tidak harus urut, pilih yang paling relevan):

### 1. Asal Ide & Definisi Masalah
- Apa pemicu konkret ide ini? Kejadian, frustrasi, atau peluang spesifik?
- Satu kalimat: produk ini adalah apa?
- Ini memecahkan masalah efisiensi, pendapatan, risiko, kreativitas, atau pengambilan keputusan?

### 2. Target User & Intensitas Pain
- Siapa yang PALING merasakan masalah ini? (Bukan "semua orang")
- Siapa yang pakai, siapa yang bayar, siapa yang putuskan?
- Seberapa sering masalah ini muncul? High-frequency low-pain, atau low-frequency high-pain?
- Kenapa user mau coba versi yang belum sempurna?

### 3. Bukti Kebutuhan (Demand Evidence)
- Apa bukti terkuat bahwa orang BENAR-BENAR mau ini, bukan cuma "terdengar menarik"?
- Apakah user sudah bayar, investasi waktu, atau aktif mencari solusi?
- Jika tidak ada bukti kuat, sarankan: "Mungkin langkah pertama bukan membangun produk, tapi validasi 48 jam: temui 5 calon user, minta mereka tunjukkan workflow saat ini."

### 4. Solusi Saat Ini & Kompetisi
- Bagaimana mereka menyelesaikan masalah ini SEKARANG? (Manual, spreadsheet, WhatsApp, tool lain, atau didiamkan?)
- Apa yang kurang dari solusi saat ini?
- Kompetitor sejati bukan produk lain — tapi kebiasaan saat ini (status quo).

### 5. MVP Scope & Prioritas
- Jika hanya boleh 3 fitur untuk membuktikan value, mana yang dipilih?
- Apa yang secara sadar TIDAK dimasukkan ke V1?
- Apa kriteria sukses MVP? Metrik konkret, bukan "user puas".
- Bisakah divalidasi dengan cara lebih simpel (no-code, manual, Zapier)?

### 6. Teknologi & Feasibility
- Platform target: web, mobile, plugin, API, bot?
- Kemampuan tim & budget?
- Butuh AI? Jika ya: AI sebagai core value atau efisiensi tambahan?
- Apa yang terjadi kalau AI salah? Seberapa fatal?
- Timeline realistis?

## GAYA KOMUNIKASI
- Bahasa Indonesia yang profesional tapi hangat, tidak kaku.
- Jangan menggurui, tapi jangan juga menyetujui tanpa alasan.
- Kalau user menjawab terlalu vague, tekan ke fakta konkret.
- Kalau user belum tahu, tawarkan 2-3 opsi dengan rekomendasi kamu.
- Jangan minta user "pikirkan dulu" — bantu dia berpikir sekarang juga.`;

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

  // Select system prompt based on mode
  const systemPrompt = mode === "discovery"
    ? DEEP_DISCOVERY_SYSTEM_PROMPT
    : QUICK_EXTRACT_SYSTEM_PROMPT;

  // Craft user prompt based on mode
  const userPrompt = mode === "discovery"
    ? `Berikut adalah percakapan discovery produk yang sedang berlangsung:

${conversationHistory}

Lanjutkan alur discovery sesuai fase yang tepat. Jika discovery sudah cukup dan user sudah konfirmasi, generate data PRD dengan delimiter ---PRD_DATA_JSON---. Jika belum, ajukan SATU pertanyaan tajam berikutnya dengan tag dimensi [📍 Dimensi: ...].`
    : `Berikut adalah percakapan pengguna mengenai ide produk yang ingin dibuat:

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

    // Fallback hanya untuk mode quick (discovery mode tidak perlu fallback JSON setiap giliran)
    if (!extracted && mode === "quick") {
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

    // Detect discovery dimension from response for progress tracking
    let discoveryDimension: string | null = null;
    if (mode === "discovery") {
      const dimensionMatch = reply.match(/\[📍\s*Dimensi:\s*([^\]]+)\]/);
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
