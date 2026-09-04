"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { FeatureItem } from "@/lib/prompt";

type Status = "idle" | "loading" | "success" | "error";

interface PresetConcept {
  name: string;
  badge: string;
  nama: string;
  ide: string;
  category: string;
  target: string;
  stack: string;
}

const PRESET_TEMPLATES: PresetConcept[] = [
  {
    name: "MediBridge AI (Enterprise)",
    badge: "🏥 Hospital & SatuSehat",
    nama: "MediBridge AI — Clinical EHR & Telemedicine Ecosystem",
    ide: "Platform enterprise SaaS terintegrasi untuk Rumah Sakit & Jaringan Faskes: Rekam Medis Elektronik (RME) berstandar Kemenkes SatuSehat FHIR v4.0, Telekonsultasi WebRTC E2EE, Asisten Triase Klinis AI (ICD-10/ICD-9-CM), E-Resep Farmasi Digital Terenkripsi, dan Automasi Bridging Klaim BPJS Kesehatan (V-Claim API).",
    category: "medis",
    target: "Direktur Medis & IT Rumah Sakit, Dokter Spesialis, Manajemen SIMRS, Apoteker, Pasien Rawat Jalan",
    stack: "Next.js 14 + Tailwind CSS + Supabase (PostgreSQL) + LiveKit WebRTC + Redis Upstash",
  },
  {
    name: "Warung Kopi & FnB",
    badge: "Food & Beverage",
    nama: "Kopi Nusantara Hub",
    ide: "Aplikasi pemesanan kopi online untuk kedai lokal. Pelanggan bisa melihat menu kopi spesial, pesan pickup/dine-in tanpa antre, bayar instan via QRIS, serta mengumpulkan poin loyalitas. Pemilik kedai memiliki dashboard kasir untuk pantau pesanan dapur.",
    category: "commerce",
    target: "Pencinta kopi usia 20-35 tahun, pekerja kantoran, dan mahasiswa",
    stack: "Next.js 14 + Tailwind CSS + Supabase (PostgreSQL)",
  },
  {
    name: "Klinik & Janji Temu",
    badge: "Booking & Reservasi",
    nama: "KlinikSehat Booking",
    ide: "Platform reservasi online untuk klinik dokter gigi & spesialis. Pasien dapat memilih dokter, melihat jadwal praktik kosong, booking slot tanpa antre lama, dan mendapatkan pengingat WhatsApp otomatis sebelum jadwal.",
    category: "booking",
    target: "Pasien umum, keluarga muda, dan dokter praktik mandiri",
    stack: "Next.js 14 + Tailwind CSS + PostgreSQL + Prisma",
  },
  {
    name: "Micro-SaaS AI Tool",
    badge: "SaaS & AI",
    nama: "CaptionCraft AI",
    ide: "Alat pembuat caption media sosial bertenaga AI untuk UMKM dan content creator. Pengguna mengunggah foto produk atau mengetik deskripsi, lalu sistem menghasilkan 5 pilihan caption viral lengkap dengan hashtag relevan dan jadwal posting.",
    category: "saas",
    target: "Pemilik toko online, social media manager, dan freelancer",
    stack: "Next.js 14 + Tailwind CSS + Claude API + Stripe/Xendit",
  },
  {
    name: "Komunitas & Kursus",
    badge: "EdTech",
    nama: "DevAcademy ID",
    ide: "Platform belajar coding interaktif dengan kurikulum terstruktur. Siswa menonton video modul, mengerjakan kuis coding, berdiskusi di forum komunitas, dan mendapatkan sertifikat digital setelah lulus.",
    category: "general",
    target: "Mahasiswa IT, career switcher yang ingin jadi developer",
    stack: "Next.js 14 + Tailwind CSS + Supabase + Mux Video",
  },
];

const TECH_STACK_PRESETS = [
  "Next.js 14 + Tailwind CSS + Supabase (PostgreSQL)",
  "React (Vite) + Tailwind CSS + Node.js Express + MongoDB",
  "Next.js 14 + TypeScript + Prisma ORM + PostgreSQL",
  "Terserah AI (Rekomendasikan arsitektur paling modern & cepat)",
];

export default function PRDGenerator() {
  // Form States
  const [nama, setNama] = useState("");
  const [ide, setIde] = useState("");
  const [category, setCategory] = useState("general");
  const [target, setTarget] = useState("");
  const [stack, setStack] = useState(TECH_STACK_PRESETS[0]);
  const [timeline, setTimeline] = useState("2-4 Minggu (Fokus MVP)");

  // Feature Brainstorming States
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [activeTab, setActiveTab] = useState<"rendered" | "prompt" | "raw">("rendered");

  // Generator & UI States
  const [status, setStatus] = useState<Status>("idle");
  const [markdown, setMarkdown] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [copiedPrd, setCopiedPrd] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [aiSource, setAiSource] = useState<"claude" | "fallback" | "gemini" | "openrouter" | null>(null);
  const [aiModel, setAiModel] = useState<string>("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "P0" | "P1" | "P2">("ALL");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }

  // Apply Preset
  function applyPreset(preset: PresetConcept) {
    setNama(preset.nama);
    setIde(preset.ide);
    setCategory(preset.category);
    setTarget(preset.target);
    setStack(preset.stack);
    // Auto-fetch feature brainstorm
    triggerFeatureBrainstorm(preset.nama, preset.ide, preset.category);
  }

  // AI Feature Brainstorming API Call
  async function triggerFeatureBrainstorm(targetNama?: string, targetIde?: string, targetCat?: string) {
    const activeIde = targetIde ?? ide;
    const activeNama = targetNama ?? nama;
    const activeCat = targetCat ?? category;

    if (!activeIde.trim() && !activeNama.trim()) {
      setErrorMsg("Ketik nama atau ide dasar aplikasi terlebih dahulu sebelum meminta rekomendasi fitur.");
      setStatus("error");
      return;
    }

    setIsBrainstorming(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/suggest-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: activeNama, ide: activeIde, category: activeCat }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendapatkan rekomendasi fitur.");
      }

      setFeatures(data.features || []);
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal memuat rekomendasi fitur. Coba lagi atau tambahkan fitur secara manual.");
    } finally {
      setIsBrainstorming(false);
    }
  }

  // Toggle Feature Selection
  function toggleFeature(id: string) {
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, selected: !f.selected } : f))
    );
  }

  // Add Custom Feature
  function handleAddCustomFeature(e: React.FormEvent) {
    e.preventDefault();
    if (!newFeatureText.trim()) return;

    const newItem: FeatureItem = {
      id: `custom-${Date.now()}`,
      title: newFeatureText.trim(),
      description: "Fitur kustom yang ditentukan oleh pengguna.",
      priority: "P0",
      category: "Kustom",
      selected: true,
    };

    setFeatures((prev) => [...prev, newItem]);
    setNewFeatureText("");
  }

  // Generate PRD Call
  async function handleGeneratePRD() {
    if (!nama.trim() || !ide.trim()) {
      setStatus("error");
      setErrorMsg("Nama aplikasi dan deskripsi ide dasar wajib diisi.");
      return;
    }

    const selectedFeatures = features.filter((f) => f.selected);
    if (features.length > 0 && selectedFeatures.length === 0) {
      setStatus("error");
      setErrorMsg("Pilih minimal 1 fitur untuk disertakan ke dalam dokumen PRD.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/generate-prd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama,
          ide,
          fitur: selectedFeatures.length > 0 ? selectedFeatures : ide,
          target,
          stack,
          timeline,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyusun PRD.");
      }

      setMarkdown(data.markdown);
      setAiSource(data.source || "fallback");
      setAiModel(data.model || "");
      setStatus("success");
      showToast("Dokumen PRD berhasil dibuat!");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kendala saat menyusun PRD.");
    }
  }

  // Extract Cursor / Coding Agent Prompt from Markdown
  function extractCodingAgentPrompt(): string {
    const match = markdown.match(/```markdown\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      return match[1].trim();
    }
    return `Halo AI Assistant, kamu adalah Senior Fullstack Engineer.
Saya ingin membangun project "${nama}".
Problem yang diselesaikan: ${ide}
Tech Stack: ${stack}
Mohon buatkan implementasi tahap pertama dari project ini berdasarkan PRD di atas.`;
  }

  // Copy Full PRD
  async function handleCopyPRD() {
    await copyToClipboard(markdown);
    setCopiedPrd(true);
    showToast("Dokumen PRD berhasil disalin ke clipboard!");
    setTimeout(() => setCopiedPrd(false), 2000);
  }

  // Copy Coding Agent Prompt
  async function handleCopyPrompt() {
    const prompt = extractCodingAgentPrompt();
    await copyToClipboard(prompt);
    setCopiedPrompt(true);
    showToast("Prompt Coding Agent berhasil disalin!");
    setTimeout(() => setCopiedPrompt(false), 2000);
  }

  async function copyToClipboard(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }
  }

  // Download Markdown file
  function handleDownload() {
    const slug = (nama || "project").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PRD-${slug}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("File PRD (.md) berhasil diunduh!");
  }

  // Download standalone HTML report
  function handleDownloadHTML() {
    const slug = (nama || "project").trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PRD: ${nama || "Project"}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.7; max-width: 960px; margin: 40px auto; padding: 0 24px; color: #1e293b; background: #f8fafc; }
    .container { background: #ffffff; padding: 48px; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.06); border: 1px solid #e2e8f0; }
    h1 { color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 12px; margin-top: 0; }
    h2 { color: #1e293b; margin-top: 36px; border-bottom: 1px solid #f1f5f9; padding-bottom: 8px; }
    h3 { color: #2563eb; }
    table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
    th { background: #f1f5f9; text-align: left; padding: 12px; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 600; }
    td { padding: 12px; border: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #f8fafc; }
    pre { background: #0f172a; color: #f8fafc; padding: 18px; border-radius: 10px; overflow-x: auto; font-size: 13px; line-height: 1.6; }
    code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #0f172a; font-family: monospace; }
    pre code { background: transparent; color: inherit; padding: 0; }
    blockquote { border-left: 4px solid #6366f1; margin: 0; padding-left: 16px; color: #64748b; font-style: italic; background: #eef2ff; padding: 12px 16px; border-radius: 0 8px 8px 0; }
    .badge { display: inline-block; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 600; background: #e0e7ff; color: #4338ca; }
    .doc-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #f1f5f9; font-size: 12px; color: #64748b; }
  </style>
</head>
<body>
  <div class="container">
    <div class="doc-meta">
      <span class="badge">Official Product Requirement Document (PRD)</span>
      <span>Dibuat via PRD Architect Engine</span>
    </div>
    <div class="content" style="white-space: pre-wrap; font-family: inherit;">${markdown.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
  </div>
</body>
</html>`;
    const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `PRD-${slug}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast("File Dokumen PRD (.html) berhasil diunduh!");
  }

  // Print PRD
  function handlePrint() {
    window.print();
  }

  const selectedCount = features.filter((f) => f.selected).length;
  const p0Count = features.filter((f) => f.selected && f.priority === "P0").length;
  const p1Count = features.filter((f) => f.selected && f.priority === "P1").length;
  const p2Count = features.filter((f) => f.selected && f.priority === "P2").length;

  return (
    <div className="space-y-8">
      {/* Quick Concept Presets */}
      <section className="glass-panel rounded-2xl p-5 border border-white/10 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Inspirasi Cepat — Pilih Template Ide
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Klik salah satu untuk mengisi form dan rekomendasi fitur otomatis
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => applyPreset(preset)}
              className="text-left p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-white/5 hover:border-brand-500/50 transition-all group"
            >
              <span className="inline-block text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-400 border border-brand-500/20 mb-2">
                {preset.badge}
              </span>
              <div className="font-medium text-sm text-slate-200 group-hover:text-white transition-colors">
                {preset.name}
              </div>
              <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                {preset.ide}
              </p>
            </button>
          ))}
        </div>
      </section>

      {/* Main Grid: Form / Stepper (Left) & Output Document (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left Column: Form & AI Feature Discovery (5 Cols on XL) */}
        <section className="xl:col-span-5 space-y-6">
          <div className="glass-panel rounded-2xl p-6 sm:p-7 border border-white/10 shadow-xl space-y-6">
            <div className="border-b border-white/10 pb-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono border border-indigo-500/20 mb-2">
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                Tahap 1 • Konsep Dasar
              </div>
              <h2 className="font-display font-semibold text-xl text-white">
                Ceritakan Ide Produk Anda
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Jelaskan masalah yang mau diselesaikan. Jika belum tahu fitur teknisnya, AI akan bantu memetakan.
              </p>
            </div>

            {/* Input Nama Website */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                Nama Website / Project <span className="text-rose-400">*</span>
              </label>
              <input
                type="text"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                placeholder="Contoh: KopiNusantara, CariTutor, QuickInvoice"
                className="input-glass w-full px-4 py-2.5 rounded-lg text-sm"
              />
            </div>

            {/* Input Ide & Masalah */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Ide & Masalah yang Diselesaikan <span className="text-rose-400">*</span>
                </label>
                <span className="text-[11px] text-slate-400">Bahasa Indonesia / Santai</span>
              </div>
              <textarea
                rows={4}
                value={ide}
                onChange={(e) => setIde(e.target.value)}
                placeholder="Website ini untuk siapa, apa masalah utama yang dialami pengguna, dan bagaimana solusi yang ingin Anda berikan?"
                className="input-glass w-full px-4 py-3 rounded-lg text-sm leading-relaxed"
              />
            </div>

            {/* AI FEATURE BRAINSTORMING CALLOUT (Highlight Feature) */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 border border-indigo-500/30 shadow-inner">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1">
                    <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
                    </svg>
                    AI Feature Brainstorming Assistant
                  </div>
                  <p className="text-xs text-slate-300">
                    Belum tahu fitur apa saja yang dibutuhkan? Klik tombol di bawah agar AI memecah ide Anda menjadi fitur siap pakai.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => triggerFeatureBrainstorm()}
                disabled={isBrainstorming || (!ide.trim() && !nama.trim())}
                className="mt-3.5 w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isBrainstorming ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Menganalisis ide & menyusun fitur...</span>
                  </>
                ) : (
                  <>
                    <span>✨ Rekomendasikan Fitur dengan AI</span>
                  </>
                )}
              </button>
            </div>

            {/* List Fitur Interaktif (Checkbox Cards) */}
            {features.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    {(["ALL", "P0", "P1", "P2"] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPriorityFilter(p)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
                          priorityFilter === p
                            ? "bg-brand-500 text-white font-bold"
                            : "bg-slate-800/80 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {p === "ALL" ? `Semua (${features.length})` : p}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFeatures((prev) => prev.map((f) => ({ ...f, selected: f.priority === "P0" })))}
                      className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors"
                      title="Pilih hanya fitur P0 untuk MVP cepat"
                    >
                      ⚡ Fokus P0
                    </button>
                    <button
                      type="button"
                      onClick={() => setFeatures((prev) => prev.map((f) => ({ ...f, selected: true })))}
                      className="text-[11px] text-brand-400 hover:underline"
                    >
                      Pilih Semua
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setFeatures((prev) => prev.map((f) => ({ ...f, selected: false })))}
                      className="text-[11px] text-slate-400 hover:underline"
                    >
                      Batal
                    </button>
                  </div>
                </div>

                <div className="max-h-[320px] overflow-y-auto pr-1 space-y-2.5">
                  {features
                    .filter((f) => priorityFilter === "ALL" || f.priority === priorityFilter)
                    .map((feat) => {
                    const priorityColor =
                      feat.priority === "P0"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                        : feat.priority === "P1"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : "bg-purple-500/10 text-purple-400 border-purple-500/30";

                    return (
                      <div
                        key={feat.id}
                        onClick={() => toggleFeature(feat.id)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                          feat.selected
                            ? "bg-slate-900/90 border-brand-500/40 shadow-sm"
                            : "bg-slate-950/40 border-white/5 opacity-60 hover:opacity-90"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={feat.selected}
                          onChange={() => {}}
                          className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-brand-500 focus:ring-brand-500 focus:ring-offset-0 cursor-pointer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${priorityColor}`}>
                              {feat.priority}
                            </span>
                            <span className="text-xs font-semibold text-slate-200">
                              {feat.title}
                            </span>
                            <span className="text-[10px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
                              {feat.category}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-relaxed">
                            {feat.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Form Tambah Fitur Kustom */}
                <form onSubmit={handleAddCustomFeature} className="flex gap-2 pt-1">
                  <input
                    type="text"
                    value={newFeatureText}
                    onChange={(e) => setNewFeatureText(e.target.value)}
                    placeholder="+ Tambah fitur kustom sendiri..."
                    className="input-glass flex-1 px-3 py-2 rounded-lg text-xs"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10"
                  >
                    Tambah
                  </button>
                </form>
              </div>
            )}

            {/* Preferensi Tambahan: Target Pengguna & Tech Stack */}
            <div className="pt-3 border-t border-white/10 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Target Pengguna (User Persona)
                </label>
                <input
                  type="text"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  placeholder="Contoh: Mahasiswa, Ibu Rumah Tangga, Developer Pemula"
                  className="input-glass w-full px-4 py-2.5 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Preferensi Tech Stack
                </label>
                <select
                  value={stack}
                  onChange={(e) => setStack(e.target.value)}
                  className="input-glass w-full px-4 py-2.5 rounded-lg text-xs appearance-none"
                >
                  {TECH_STACK_PRESETS.map((opt) => (
                    <option key={opt} value={opt} className="bg-slate-900 text-slate-100">
                      {opt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                  Estimasi Timeline MVP
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["1-2 Minggu (Fast MVP)", "2-4 Minggu (Standar)", "1-2 Bulan (Lengkap)"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setTimeline(t)}
                      className={`px-2.5 py-2 text-[11px] rounded-lg border text-center transition-all ${
                        timeline === t
                          ? "bg-brand-500/20 border-brand-500/50 text-brand-300 font-medium"
                          : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Error Display */}
            {status === "error" && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Main Action Button */}
            <button
              type="button"
              onClick={handleGeneratePRD}
              disabled={status === "loading" || !nama.trim() || !ide.trim()}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-500 via-indigo-600 to-brand-accent hover:from-brand-600 hover:to-indigo-500 text-white font-semibold text-sm shadow-glow hover:shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === "loading" ? (
                <>
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Menyusun Dokumen PRD Standar Industri...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <line x1="9" y1="15" x2="15" y2="15" />
                  </svg>
                  <span>{status === "success" ? "Generate Ulang PRD" : "🚀 Generate PRD Lengkap"}</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Right Column: Output PRD Document & Actions (7 Cols on XL) */}
        <section className="xl:col-span-7">
          <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden min-h-[680px] flex flex-col">
            {/* Header Toolbar */}
            <div className="p-4 sm:px-6 bg-slate-900/80 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
              {/* Document Tabs */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 rounded-xl border border-white/5">
                <button
                  type="button"
                  onClick={() => setActiveTab("rendered")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "rendered"
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📄 Pratinjau PRD
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("prompt")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "prompt"
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  🤖 Prompt Cursor / Agent
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("raw")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    activeTab === "raw"
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  📝 Raw Markdown
                </button>
              </div>

              {/* Action Buttons (Copy, Download, Print) */}
              {status === "success" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyPRD}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-all"
                  >
                    {copiedPrd ? (
                      <span className="text-emerald-400 font-semibold">Tersalin ✓</span>
                    ) : (
                      <>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                        <span>Salin PRD</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-all"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    <span>Unduh .md</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadHTML}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-all"
                    title="Unduh sebagai dokumen HTML standalone siap buka"
                  >
                    <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                    <span>Unduh HTML</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrint}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-all"
                    title="Cetak / Simpan PDF"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="6 9 6 2 18 2 18 9" />
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <rect x="6" y="14" width="12" height="8" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Quick Metrics Bar if Success */}
            {status === "success" && (
              <div className="px-6 py-2.5 bg-slate-950/60 border-b border-white/5 flex flex-wrap items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-4 text-slate-300 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    P0 Core: <strong className="text-white">{p0Count || 3}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    P1 Growth: <strong className="text-white">{p1Count || 2}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-400" />
                    P2 Ops: <strong className="text-white">{p2Count || 1}</strong>
                  </span>
                  <span className="text-slate-600 hidden sm:inline">•</span>
                  <span className="text-slate-400 hidden sm:inline-flex items-center gap-1">
                    📖 ~{Math.max(1, Math.ceil((markdown ? markdown.split(/\s+/).filter(Boolean).length : 0) / 200))} mnt baca
                    <span className="text-slate-500">({(markdown ? markdown.split(/\s+/).filter(Boolean).length : 0).toLocaleString()} kata)</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">Engine:</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-brand-500/10 text-brand-300 border border-brand-500/20">
                    {aiSource === "gemini"
                      ? `Google Gemini (${aiModel || "Flash"})`
                      : aiSource === "claude"
                      ? "Claude 3.5 Sonnet (Live API)"
                      : aiSource === "openrouter"
                      ? `OpenRouter (${aiModel || "AI"})`
                      : "Smart Architecture Engine"}
                  </span>
                </div>
              </div>
            )}

            {/* Content Body */}
            <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
              {status === "idle" && (
                <div className="h-full min-h-[460px] flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-brand-500/20 to-brand-accent/20 border border-brand-500/30 flex items-center justify-center mb-4 text-brand-400 shadow-glow">
                    <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </svg>
                  </div>
                  <h3 className="font-display font-semibold text-lg text-white mb-2">
                    Dokumen PRD Siap Dibuat
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Pilih template ide di atas atau ketik ide Anda di sebelah kiri. Manfaatkan fitur <strong>AI Feature Brainstorming</strong> untuk memetakan kebutuhan sistem secara otomatis.
                  </p>
                </div>
              )}

              {status === "loading" && (
                <div className="h-full min-h-[460px] flex flex-col items-center justify-center text-center max-w-md mx-auto py-12">
                  <div className="relative w-16 h-16 mb-6">
                    <div className="absolute inset-0 rounded-full border-4 border-brand-500/20 animate-ping" />
                    <div className="w-16 h-16 rounded-full border-4 border-t-brand-500 border-r-transparent border-b-brand-accent border-l-transparent animate-spin" />
                  </div>
                  <h4 className="font-display font-medium text-base text-white mb-1">
                    Menyusun Dokumen PRD Komprehensif...
                  </h4>
                  <p className="text-xs text-slate-400 mb-6">
                    Menghubungkan user stories, skema database, tabel acceptance criteria, dan instruksi AI coding agent.
                  </p>
                  <div className="w-full max-w-xs space-y-2">
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-brand-500 to-brand-accent rounded-full w-3/4 animate-pulse" />
                    </div>
                  </div>
                </div>
              )}

              {status === "success" && activeTab === "rendered" && (
                <div className="space-y-4">
                  {/* Quick Table of Contents chips */}
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <path d="M4 6h16M4 12h10M4 18h14" />
                        </svg>
                        Navigasi Cepat Bab PRD
                      </span>
                      <span className="text-[10px] text-slate-500">Klik untuk lompat langsung ke bab</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { title: "1. Visi & Masalah", query: "1." },
                        { title: "2. User Stories", query: "2." },
                        { title: "3. MoSCoW", query: "3." },
                        { title: "4. Sitemap", query: "4." },
                        { title: "5. Skema DB", query: "5." },
                        { title: "6. Tech Stack", query: "6." },
                        { title: "7. NFR & Security", query: "7." },
                        { title: "8. Roadmap MVP", query: "8." },
                        { title: "9. KPIs", query: "9." },
                        { title: "10. Prompt Agent", query: "10." },
                      ].map((tab) => (
                        <button
                          key={tab.title}
                          type="button"
                          onClick={() => {
                            const h2s = Array.from(document.querySelectorAll(".prd-doc-view h2"));
                            const match = h2s.find((el) => el.textContent?.includes(tab.query));
                            if (match) {
                              match.scrollIntoView({ behavior: "smooth", block: "start" });
                            }
                          }}
                          className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-800/80 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-white/5 transition-all"
                        >
                          {tab.title}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="prd-doc-view max-w-none">
                    <ReactMarkdown>{markdown}</ReactMarkdown>
                  </div>
                </div>
              )}

              {status === "success" && activeTab === "prompt" && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-start justify-between gap-3">
                    <div>
                      <h4 className="text-xs font-semibold text-brand-300 mb-1">
                        Siap Di-paste ke Cursor / Claude Code
                      </h4>
                      <p className="text-xs text-slate-300">
                        Prompt ini sudah diekstrak khusus agar AI Coding Agent langsung memahami arsitektur, database, dan fitur P0 yang harus dibangun pertama kali.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleCopyPrompt}
                      className="px-3 py-1.5 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs shadow-sm whitespace-nowrap"
                    >
                      {copiedPrompt ? "Tersalin! ✓" : "Salin Prompt Agent"}
                    </button>
                  </div>

                  <pre className="p-4 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                    {extractCodingAgentPrompt()}
                  </pre>
                </div>
              )}

              {status === "success" && activeTab === "raw" && (
                <div className="space-y-3">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={handleCopyPRD}
                      className="text-xs text-brand-400 hover:underline"
                    >
                      {copiedPrd ? "Tersalin ✓" : "Salin Teks Markdown"}
                    </button>
                  </div>
                  <textarea
                    rows={26}
                    value={markdown}
                    onChange={(e) => setMarkdown(e.target.value)}
                    className="w-full p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-brand-500"
                  />
                </div>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900/95 text-white border border-brand-500/40 shadow-2xl backdrop-blur-lg animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <span className="text-xs font-medium text-slate-100">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
