"use client";

import { useState, useMemo } from "react";
import ReactMarkdown from "react-markdown";

interface PRDViewerProps {
  markdown: string;
  nama: string;
  ide: string;
  stack: string;
  timeline?: string;
  aiSource: "gemini" | "claude" | "fallback" | null;
  aiModel?: string;
  onSaveToHistory: () => void;
  isSaved?: boolean;
  onShowToast: (msg: string) => void;
}

interface ParsedSection {
  number: number;
  title: string;
  fullHeading: string;
  content: string;
}

export default function PRDViewer({
  markdown,
  nama,
  ide,
  stack,
  timeline,
  aiSource,
  aiModel,
  onSaveToHistory,
  isSaved = false,
  onShowToast,
}: PRDViewerProps) {
  // View mode: 'tabs' (Modular) | 'accordion' (Collapsible) | 'full' (Traditional) | 'prompt' | 'raw'
  const [viewMode, setViewMode] = useState<"tabs" | "accordion" | "full" | "prompt" | "raw">("tabs");
  const [activeTabGroup, setActiveTabGroup] = useState<number>(0);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true,
    9: true,
    10: true,
  });
  const [copiedPrd, setCopiedPrd] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  // Parse markdown into 10 structured sections based on "## [number]."
  const sections = useMemo<ParsedSection[]>(() => {
    if (!markdown) return [];
    const lines = markdown.split("\n");
    const result: ParsedSection[] = [];
    let currentSection: ParsedSection | null = null;
    let contentBuffer: string[] = [];

    for (const line of lines) {
      const match = line.match(/^##\s+(\d+)\.\s*(.*)$/);
      if (match) {
        if (currentSection) {
          currentSection.content = contentBuffer.join("\n").trim();
          result.push(currentSection);
          contentBuffer = [];
        }
        currentSection = {
          number: parseInt(match[1], 10),
          title: match[2].trim(),
          fullHeading: line,
          content: "",
        };
      } else {
        contentBuffer.push(line);
      }
    }

    if (currentSection) {
      currentSection.content = contentBuffer.join("\n").trim();
      result.push(currentSection);
    }

    return result;
  }, [markdown]);

  // Tab Groups for Modular Mode
  const tabGroups = [
    {
      id: 0,
      name: "📌 1. Visi & Persona",
      desc: "Visi produk, problem statement, dan profil persona pengguna",
      sectionNumbers: [1, 2],
    },
    {
      id: 1,
      name: "⚡ 2. Fitur & MoSCoW",
      desc: "Tabel fitur prioritas P0 (Must), P1 (Should), P2 (Nice-to-Have)",
      sectionNumbers: [3],
    },
    {
      id: 2,
      name: "🗄️ 3. Database & Teknis",
      desc: "Sitemap alur halaman, skema database SQL DDL, stack, & NFR",
      sectionNumbers: [4, 5, 6, 7],
    },
    {
      id: 3,
      name: "🚀 4. Roadmap & AI Agent",
      desc: "Jadwal peluncuran MVP, indikator KPI, & prompt coding agent",
      sectionNumbers: [8, 9, 10],
    },
  ];

  // Extract Cursor / Coding Agent Prompt
  function extractCodingAgentPrompt(): string {
    const match = markdown.match(/```markdown\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      return match[1].trim();
    }
    const section10 = sections.find((s) => s.number === 10);
    if (section10) return section10.content;

    return `Halo AI Assistant, kamu adalah Senior Fullstack Engineer.
Saya ingin membangun project "${nama}".
Problem: ${ide}
Tech Stack: ${stack}
Mohon buatkan implementasi tahap pertama dari project ini berdasarkan PRD.`;
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

  async function handleCopyPRD() {
    await copyToClipboard(markdown);
    setCopiedPrd(true);
    onShowToast("Dokumen PRD lengkap berhasil disalin!");
    setTimeout(() => setCopiedPrd(false), 2000);
  }

  async function handleCopyPrompt() {
    const prompt = extractCodingAgentPrompt();
    await copyToClipboard(prompt);
    setCopiedPrompt(true);
    onShowToast("Prompt AI Coding Agent berhasil disalin!");
    setTimeout(() => setCopiedPrompt(false), 2000);
  }

  function handleDownloadMD() {
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
    onShowToast("File PRD (.md) berhasil diunduh!");
  }

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
    table { width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; }
    th { background: #f1f5f9; text-align: left; padding: 12px; border: 1px solid #cbd5e1; color: #0f172a; font-weight: 600; }
    td { padding: 12px; border: 1px solid #e2e8f0; color: #334155; }
    tr:nth-child(even) { background: #f8fafc; }
    pre { background: #0f172a; color: #f8fafc; padding: 18px; border-radius: 10px; overflow-x: auto; font-size: 13px; line-height: 1.6; }
    code { background: #e2e8f0; padding: 2px 6px; border-radius: 4px; font-size: 13px; color: #0f172a; font-family: monospace; }
    pre code { background: transparent; color: inherit; padding: 0; }
  </style>
</head>
<body>
  <div class="container">
    <div style="font-size: 12px; color: #64748b; margin-bottom: 16px;">Product Requirement Document • PRD Architect Studio</div>
    <div style="white-space: pre-wrap;">${markdown.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</div>
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
    onShowToast("File PRD (.html) berhasil diunduh!");
  }

  function toggleSection(num: number) {
    setExpandedSections((prev) => ({ ...prev, [num]: !prev[num] }));
  }

  function expandAll() {
    const allTrue: Record<number, boolean> = {};
    sections.forEach((s) => (allTrue[s.number] = true));
    setExpandedSections(allTrue);
  }

  function collapseAll() {
    const allFalse: Record<number, boolean> = {};
    sections.forEach((s) => (allFalse[s.number] = false));
    setExpandedSections(allFalse);
  }

  const wordCount = markdown ? markdown.split(/\s+/).filter(Boolean).length : 0;
  const readTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <div className="glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">
      {/* Top Action & View Toolbar */}
      <div className="p-3.5 sm:px-6 bg-slate-900/90 border-b border-white/10 flex flex-wrap items-center justify-between gap-3">
        {/* View Mode Switcher */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-xl border border-white/5">
          <button
            type="button"
            onClick={() => setViewMode("tabs")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "tabs"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Tampilan Modular per Bab (Ringkas & Nyaman Dibaca)"
          >
            📑 Tab Bab Pintar
          </button>

          <button
            type="button"
            onClick={() => setViewMode("accordion")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "accordion"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Tampilan Bab yang Dapat Dilipat"
          >
            📂 Bab Lipat
          </button>

          <button
            type="button"
            onClick={() => setViewMode("full")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "full"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Tampilan Dokumen Lengkap Tradisional"
          >
            📄 Dokumen Lengkap
          </button>

          <button
            type="button"
            onClick={() => setViewMode("prompt")}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "prompt"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Prompt Siap Paste ke Cursor / Claude Code"
          >
            🤖 Prompt Agent
          </button>

          <button
            type="button"
            onClick={() => setViewMode("raw")}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              viewMode === "raw"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
            title="Teks Markdown Asli"
          >
            📝 Raw
          </button>
        </div>

        {/* Right Toolbar Action Buttons (Save, Copy, Download, Print) */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Save to History Button */}
          <button
            type="button"
            onClick={onSaveToHistory}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isSaved
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border-white/10"
            }`}
            title="Simpan dokumen PRD ke riwayat project"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span>{isSaved ? "Tersimpan ✓" : "Simpan PRD"}</span>
          </button>

          {/* Copy PRD */}
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
                <span>Salin</span>
              </>
            )}
          </button>

          {/* Download MD */}
          <button
            type="button"
            onClick={handleDownloadMD}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-all"
            title="Unduh Markdown"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>.md</span>
          </button>

          {/* Download HTML */}
          <button
            type="button"
            onClick={handleDownloadHTML}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-white/10 transition-all"
            title="Unduh file HTML standalone"
          >
            <svg className="w-3.5 h-3.5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>HTML</span>
          </button>

          {/* Print PDF */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10 transition-all"
            title="Cetak atau Ekspor PDF"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Document Meta & AI Engine Status Bar */}
      <div className="px-6 py-2.5 bg-slate-950/70 border-b border-white/5 flex flex-wrap items-center justify-between text-xs gap-3">
        <div className="flex items-center gap-4 text-slate-300 flex-wrap">
          <span className="font-semibold text-white">{nama || "Proyek PRD"}</span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline-flex items-center gap-1">
            📖 ~{readTime} mnt baca ({wordCount.toLocaleString()} kata)
          </span>
          {timeline && (
            <>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-slate-400">⏱️ {timeline}</span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Active AI Pill Badge (User match) */}
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-900 border border-white/10 text-[11px] text-slate-200">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {aiSource === "gemini"
                ? `Gemini (${aiModel || "Flash"})`
                : aiSource === "claude"
                ? "Claude 3.5 Sonnet"
                : "Smart Architecture"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
        {/* MODE 1: TAB BAB PINTAR (MODULAR & RINGKAS - DEFAULT) */}
        {viewMode === "tabs" && (
          <div className="space-y-6">
            {/* Tab Navigation Chips */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {tabGroups.map((tab) => {
                const isActive = activeTabGroup === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTabGroup(tab.id)}
                    className={`p-3 rounded-xl text-left border transition-all ${
                      isActive
                        ? "bg-brand-500/15 border-brand-500/60 shadow-glow"
                        : "bg-slate-900/50 border-white/5 hover:bg-slate-900/80 hover:border-white/10"
                    }`}
                  >
                    <div className={`font-semibold text-xs ${isActive ? "text-brand-300" : "text-slate-200"}`}>
                      {tab.name}
                    </div>
                    <div className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                      {tab.desc}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Active Tab Content */}
            <div className="p-6 rounded-2xl bg-slate-950/50 border border-white/10 space-y-8 prd-doc-view">
              {sections.length === 0 ? (
                <ReactMarkdown>{markdown}</ReactMarkdown>
              ) : (
                sections
                  .filter((sec) => tabGroups[activeTabGroup].sectionNumbers.includes(sec.number))
                  .map((sec) => (
                    <div key={sec.number} className="space-y-3">
                      <h2 className="text-xl font-bold font-display text-white border-b border-white/10 pb-2">
                        ## {sec.number}. {sec.title}
                      </h2>
                      <ReactMarkdown>{sec.content}</ReactMarkdown>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* MODE 2: BAB LIPAT (ACCORDION) */}
        {viewMode === "accordion" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs text-slate-400">
                Klik judul bab untuk membuka atau melipat isi dokumen
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={expandAll}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Buka Semua
                </button>
                <button
                  type="button"
                  onClick={collapseAll}
                  className="px-2.5 py-1 rounded-lg text-xs bg-slate-800 hover:bg-slate-700 text-slate-300"
                >
                  Tutup Semua
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {sections.map((sec) => {
                const isOpen = expandedSections[sec.number] ?? true;
                return (
                  <div
                    key={sec.number}
                    className="rounded-xl border border-white/10 bg-slate-900/60 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => toggleSection(sec.number)}
                      className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-850 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-lg bg-brand-500/20 text-brand-300 text-xs font-mono font-bold flex items-center justify-center">
                          {sec.number}
                        </span>
                        <span className="font-display font-semibold text-sm text-white">
                          {sec.title}
                        </span>
                      </div>
                      <svg
                        className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={2}
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </button>

                    {isOpen && (
                      <div className="p-5 pt-2 border-t border-white/5 prd-doc-view bg-slate-950/40">
                        <ReactMarkdown>{sec.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODE 3: FULL TRADITIONAL MARKDOWN VIEW */}
        {viewMode === "full" && (
          <div className="space-y-5">
            {/* Quick Table of Contents chips */}
            <div className="p-3 rounded-xl bg-slate-900/90 border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M4 6h16M4 12h10M4 18h14" />
                  </svg>
                  Lompat Cepat ke Bab
                </span>
                <span className="text-[10px] text-slate-500">Klik untuk navigasi instan</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { title: "1. Visi & Masalah", query: "1." },
                  { title: "2. User Stories", query: "2." },
                  { title: "3. MoSCoW Fitur", query: "3." },
                  { title: "4. Sitemap Alur", query: "4." },
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

        {/* MODE 4: PROMPT CURSOR / CODING AGENT */}
        {viewMode === "prompt" && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/30 flex items-start justify-between gap-3">
              <div>
                <h4 className="text-xs font-semibold text-brand-300 mb-1">
                  Siap Di-paste Langsung ke Cursor / Claude Code
                </h4>
                <p className="text-xs text-slate-300">
                  Prompt ini sudah diekstrak khusus agar AI Coding Agent langsung memahami arsitektur teknis, tabel database, dan urutan fitur prioritas P0.
                </p>
              </div>
              <button
                type="button"
                onClick={handleCopyPrompt}
                className="px-3.5 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white font-medium text-xs shadow-sm whitespace-nowrap"
              >
                {copiedPrompt ? "Tersalin! ✓" : "Salin Prompt Agent"}
              </button>
            </div>

            <pre className="p-5 rounded-xl bg-slate-950 border border-white/10 text-xs font-mono text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
              {extractCodingAgentPrompt()}
            </pre>
          </div>
        )}

        {/* MODE 5: RAW MARKDOWN */}
        {viewMode === "raw" && (
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
              rows={24}
              readOnly
              value={markdown}
              className="w-full p-4 rounded-xl bg-slate-950 border border-white/10 font-mono text-xs text-slate-200 leading-relaxed focus:outline-none"
            />
          </div>
        )}
      </div>
    </div>
  );
}
