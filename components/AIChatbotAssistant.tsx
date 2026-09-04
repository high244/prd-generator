"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { FeatureItem } from "@/lib/prompt";
import type { AIEngineOption, SavedChatMessage } from "@/lib/types";

export interface ExtractedPRDData {
  nama: string;
  ide: string;
  category: string;
  target: string;
  stack: string;
  timeline: string;
  features: FeatureItem[];
}

export type ChatMode = "quick" | "discovery";

export type ChatMessage = SavedChatMessage;

interface AIChatbotAssistantProps {
  activeEngine: AIEngineOption;
  onApplyToForm?: (data: ExtractedPRDData) => void;
  onClose?: () => void;
  chatMode?: ChatMode;
  onChatModeChange?: (mode: ChatMode) => void;
  messages?: ChatMessage[];
  onMessagesChange?: (messages: ChatMessage[]) => void;
  projectTitle?: string;
}

// ─── Discovery Dimensions ────────────────────────────────────────────────────
const DISCOVERY_DIMENSIONS = [
  { key: "origin", label: "Asal Ide", icon: "💡", keywords: ["asal", "origin", "problem", "masalah", "pemicu", "ide"] },
  { key: "user", label: "Target User", icon: "👤", keywords: ["user", "target", "pengguna", "pain", "persona"] },
  { key: "evidence", label: "Bukti Kebutuhan", icon: "📊", keywords: ["bukti", "evidence", "demand", "kebutuhan", "validasi"] },
  { key: "alternatives", label: "Solusi Saat Ini", icon: "🔄", keywords: ["solusi", "alternatif", "alternative", "kompetisi", "saat ini", "sekarang"] },
  { key: "mvp", label: "MVP & Prioritas", icon: "🎯", keywords: ["mvp", "prioritas", "scope", "fitur", "v1"] },
  { key: "tech", label: "Tech & Feasibility", icon: "⚙️", keywords: ["tech", "teknologi", "feasibility", "ai", "platform", "stack"] },
];

// ─── Quick Starter Prompts ───────────────────────────────────────────────────
const QUICK_STARTER_PROMPTS = [
  "Saya mau buat aplikasi sewa lapangan olahraga online, ada fitur booking slot waktu, bayar QRIS instan, dan split bill antar teman.",
  "Bantu saya buat platform penitipan hewan peliharaan: pemilik bisa booking jadwal inap, pantau via live CCTV, dan konsultasi dokter hewan.",
  "Saya ingin buat SaaS tool untuk UMKM: pembuatan invoice digital otomatis, pengingat jatuh tempo via WhatsApp, dan rekonsiliasi mutasi bank.",
  "Aplikasi kasir kedai kopi & restoran: pelanggan bisa scan QR di meja untuk pesan makanan sendiri tanpa antre di kasir.",
];

const DISCOVERY_STARTER_PROMPTS = [
  "Saya punya ide untuk membuat platform manajemen freelancer — tapi belum yakin bentuknya seperti apa.",
  "Saya ingin bikin tool AI untuk bantu UMKM, tapi masih eksplorasi arah yang tepat.",
  "Ada peluang besar di industri logistik terakhir-mil menurut saya, mau diskusi dulu sebelum bikin PRD.",
  "Saya melihat masalah di cara klinik kecil mengelola antrian pasien, mau validasi dulu idenya.",
];

export default function AIChatbotAssistant({
  activeEngine,
  onApplyToForm,
  onClose,
  chatMode = "quick",
  onChatModeChange,
  messages: externalMessages,
  onMessagesChange,
  projectTitle,
}: AIChatbotAssistantProps) {
  const [mode, setMode] = useState<ChatMode>(chatMode);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (externalMessages && externalMessages.length > 0) return externalMessages;
    return [];
  });
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [discoveredDimensions, setDiscoveredDimensions] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastEmittedMessagesRef = useRef<ChatMessage[] | null>(null);

  // Sync external mode prop
  useEffect(() => {
    setMode(chatMode);
  }, [chatMode]);

  // Generate welcome message based on mode
  const getWelcomeMessage = useCallback((currentMode: ChatMode): ChatMessage => ({
    id: "msg-welcome",
    role: "assistant",
    content: currentMode === "discovery"
      ? "Halo! Saya adalah **AI Product Discovery Partner** Anda. 🔍\n\nDi mode ini, saya akan menggali ide produk Anda secara mendalam melalui wawancara terstruktur — bukan sekadar mengekstrak informasi.\n\nSaya akan menantang asumsi, memvalidasi kebutuhan pasar, dan membantu Anda menemukan **MVP yang paling tajam** sebelum menghasilkan spesifikasi PRD.\n\nCeritakan ide produk Anda, dan mari kita mulai menggali bersama! 🚀"
      : "Halo! Saya adalah **AI Product Consultant** Anda. 🚀\n\nCeritakan apa yang diinginkan oleh Anda atau klien Anda dengan bahasa santai. Anda juga bisa langsung menempelkan (paste) catatan brief atau obrolan chat klien.\n\nSaya akan langsung membedah ide tersebut menjadi **Nama Aplikasi, Problem Statement, Target Pengguna, Rekomendasi Tech Stack, serta Daftar Fitur Prioritas (P0/P1/P2)** yang langsung siap dimasukkan ke formulir PRD!",
    timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
  }), []);

  // Sync incoming external messages from active project
  useEffect(() => {
    if (externalMessages && externalMessages === lastEmittedMessagesRef.current) {
      return;
    }

    if (externalMessages && externalMessages.length > 0) {
      setMessages(externalMessages);
      const dims = new Set<string>();
      for (const m of externalMessages) {
        if (m.discoveryDimension) dims.add(m.discoveryDimension);
        else if (m.content) {
          const d = detectDimension(m.content);
          if (d) dims.add(d);
        }
      }
      setDiscoveredDimensions(dims);
    } else {
      const welcome = getWelcomeMessage(mode);
      setMessages([welcome]);
      setDiscoveredDimensions(new Set());
    }
  }, [externalMessages, mode, getWelcomeMessage]);

  const updateMessages = useCallback(
    (newMessages: ChatMessage[]) => {
      setMessages(newMessages);
      lastEmittedMessagesRef.current = newMessages;
      onMessagesChange?.(newMessages);
    },
    [onMessagesChange]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  // Detect dimension from AI response
  function detectDimension(text: string): string | null {
    const dimensionMatch = text.match(/\[📍\s*Dimensi:\s*([^\]]+)\]/);
    if (dimensionMatch) {
      const raw = dimensionMatch[1].trim().toLowerCase();
      for (const dim of DISCOVERY_DIMENSIONS) {
        if (dim.keywords.some(kw => raw.includes(kw))) return dim.key;
      }
      // Fallback: return first matching dimension keyword in the text
      for (const dim of DISCOVERY_DIMENSIONS) {
        if (dim.keywords.some(kw => text.toLowerCase().includes(kw))) return dim.key;
      }
    }
    return null;
  }

  function handleModeSwitch(newMode: ChatMode) {
    if (newMode === mode) return;
    setMode(newMode);
    onChatModeChange?.(newMode);
    if (messages.length <= 1) {
      const welcome = getWelcomeMessage(newMode);
      updateMessages([welcome]);
      setDiscoveredDimensions(new Set());
    }
  }

  async function handleSendMessage(textToSend?: string) {
    const text = (textToSend ?? inputValue).trim();
    if (!text || isLoading) return;

    const userMessageId = `user-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };

    const updatedWithUser = [...messages, userMsg];
    updateMessages(updatedWithUser);
    setInputValue("");
    setIsLoading(true);

    try {
      const historyForApi = updatedWithUser.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi,
          preferredModel: activeEngine,
          mode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghubungi AI Assistant.");
      }

      // Track discovered dimensions
      let detectedDim: string | null = null;
      if (mode === "discovery" && data.reply) {
        detectedDim = data.discoveryDimension || detectDimension(data.reply);
        if (detectedDim) {
          setDiscoveredDimensions((prev) => new Set(prev).add(detectedDim!));
        }
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply || "Saya sudah merangkum kebutuhan produk Anda di bawah ini:",
        extracted: data.extracted,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        discoveryDimension: detectedDim || data.discoveryDimension,
      };

      updateMessages([...updatedWithUser, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Maaf, terjadi kendala saat memproses obrolan. Silakan coba lagi.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      updateMessages([...updatedWithUser, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleFinishDiscovery() {
    handleSendMessage("Saya rasa sudah cukup. Tolong rangkum premis dan generate data PRD berdasarkan hasil discovery kita.");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  const starterPrompts = mode === "discovery" ? DISCOVERY_STARTER_PROMPTS : QUICK_STARTER_PROMPTS;
  const discoveredCount = discoveredDimensions.size;

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/95 overflow-hidden select-none">
      {/* Chat Taskbar Header */}
      <div className="p-3.5 sm:px-4 bg-slate-950 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-glow shrink-0 ${
            mode === "discovery"
              ? "bg-gradient-to-tr from-amber-500 to-orange-500"
              : "bg-gradient-to-tr from-indigo-500 to-brand-accent"
          }`}>
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              {mode === "discovery" ? (
                <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>
              ) : (
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              )}
            </svg>
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-xs text-white truncate">
                {mode === "discovery" ? "Deep Discovery" : "Quick Extract"}
              </h3>
              <span className={`flex h-1.5 w-1.5 rounded-full animate-pulse shrink-0 ${
                mode === "discovery" ? "bg-amber-400" : "bg-emerald-400"
              }`} />
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              {projectTitle
                ? `Tersimpan di: ${projectTitle}`
                : mode === "discovery"
                  ? "Wawancara Produk Mendalam"
                  : "Konsultasi Produk & Arsitektur"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Mode Toggle */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-white/5">
            <button
              type="button"
              onClick={() => handleModeSwitch("quick")}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                mode === "quick"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Mode Quick Extract — langsung ekstrak ke form"
            >
              ⚡ Quick
            </button>
            <button
              type="button"
              onClick={() => handleModeSwitch("discovery")}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                mode === "discovery"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
              title="Mode Deep Discovery — wawancara mendalam sebelum PRD"
            >
              🔍 Discovery
            </button>
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={() => {
              const welcome = getWelcomeMessage(mode);
              updateMessages([welcome]);
              setDiscoveredDimensions(new Set());
            }}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-900 transition-colors"
            title="Reset Obrolan"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M21 3v5h-5" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
              <path d="M3 21v-5h5" />
            </svg>
          </button>

          {/* Close */}
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
              title="Tutup Taskbar Chatbot"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Discovery Progress Tracker (only in discovery mode) */}
      {mode === "discovery" && messages.length > 1 && (
        <div className="px-4 py-2.5 bg-gradient-to-r from-amber-950/30 via-slate-950 to-orange-950/30 border-b border-amber-500/10 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400/80">
              Discovery Progress
            </span>
            <span className="text-[10px] font-mono text-amber-300/70">
              {discoveredCount}/6 dimensi
            </span>
          </div>
          <div className="flex gap-1">
            {DISCOVERY_DIMENSIONS.map((dim) => {
              const isDiscovered = discoveredDimensions.has(dim.key);
              return (
                <div
                  key={dim.key}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-1 rounded-md transition-all ${
                    isDiscovered
                      ? "bg-amber-500/20 border border-amber-500/30"
                      : "bg-slate-900/60 border border-white/5"
                  }`}
                  title={dim.label}
                >
                  <span className="text-[11px]">{dim.icon}</span>
                  <span className={`text-[8px] font-medium truncate max-w-full px-0.5 ${
                    isDiscovered ? "text-amber-300" : "text-slate-500"
                  }`}>
                    {dim.label}
                  </span>
                </div>
              );
            })}
          </div>
          {/* Progress bar */}
          <div className="mt-1.5 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-orange-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((discoveredCount / 6) * 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div
              key={m.id}
              className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
            >
              {!isUser && (
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 mt-1 ${
                  mode === "discovery"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "bg-brand-500/20 text-brand-300 border border-brand-500/30"
                }`}>
                  {mode === "discovery" ? "🔍" : "🤖"}
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] space-y-3 ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                {/* Discovery dimension badge */}
                {!isUser && m.discoveryDimension && mode === "discovery" && (
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[9px] text-amber-300 font-mono">
                    📍 {m.discoveryDimension}
                  </div>
                )}

                {/* Bubble message */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-brand-600 text-white rounded-tr-none shadow-md"
                      : mode === "discovery"
                        ? "bg-slate-900/90 border border-amber-500/15 text-slate-200 rounded-tl-none shadow-sm"
                        : "bg-slate-900/90 border border-white/10 text-slate-200 rounded-tl-none shadow-sm"
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>
                  <div
                    className={`text-[10px] mt-1.5 ${
                      isUser ? "text-indigo-200 text-right" : "text-slate-500"
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>

                {/* Extracted PRD Preview Card (If available on assistant message) */}
                {m.extracted && (
                  <div className={`p-4 rounded-xl shadow-xl space-y-3 text-xs animate-in fade-in slide-in-from-top-2 ${
                    mode === "discovery"
                      ? "bg-gradient-to-br from-amber-950/60 via-slate-900/90 to-orange-950/60 border border-amber-500/40"
                      : "bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/60 border border-indigo-500/40"
                  }`}>
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className={`flex items-center gap-1.5 font-semibold ${
                        mode === "discovery" ? "text-amber-300" : "text-indigo-300"
                      }`}>
                        <span>{mode === "discovery" ? "🏆" : "📋"}</span>
                        <span>{mode === "discovery" ? "Hasil Discovery → PRD Data:" : "Hasil Ekstraksi Formulir PRD:"}</span>
                      </div>
                      <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        mode === "discovery"
                          ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
                          : "bg-brand-500/20 text-brand-300 border-brand-500/30"
                      }`}>
                        {m.extracted.features?.length || 0} Fitur
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">
                          Nama Proyek
                        </span>
                        <strong className="text-white text-xs">{m.extracted.nama}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono">
                          Rekomendasi Stack
                        </span>
                        <span className="text-slate-200 truncate block">
                          {m.extracted.stack}
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-mono">
                        {mode === "discovery" ? "Problem Statement (Hasil Validasi)" : "Ringkasan Masalah & Solusi"}
                      </span>
                      <p className="text-slate-300 mt-0.5 line-clamp-3">
                        {m.extracted.ide}
                      </p>
                    </div>

                    {/* Features list mini preview */}
                    {m.extracted.features && m.extracted.features.length > 0 && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">
                          {mode === "discovery" ? "Fitur Tervalidasi dari Discovery" : "Fitur Esensial yang Disusun"}
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.extracted.features.slice(0, 5).map((f) => (
                            <span
                              key={f.id}
                              className={`text-[10px] px-2 py-0.5 rounded border ${
                                f.priority === "P0"
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : f.priority === "P1"
                                    ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                                    : "bg-slate-500/15 text-slate-400 border-slate-500/30"
                              }`}
                            >
                              [{f.priority}] {f.title}
                            </span>
                          ))}
                          {m.extracted.features.length > 5 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                              +{m.extracted.features.length - 5} lainnya
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* CTA to Apply Extracted Data into Form */}
                    {onApplyToForm && (
                      <button
                        type="button"
                        onClick={() => onApplyToForm(m.extracted!)}
                        className={`w-full py-2 px-3 rounded-lg text-white font-medium text-xs shadow-glow transition-all flex items-center justify-center gap-2 ${
                          mode === "discovery"
                            ? "bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 hover:from-amber-600 hover:to-orange-500"
                            : "bg-gradient-to-r from-brand-500 via-indigo-600 to-brand-accent hover:from-brand-600 hover:to-indigo-500"
                        }`}
                      >
                        <span>{mode === "discovery" ? "🏆 Masukkan Hasil Discovery ke Workspace PRD" : "✨ Masukkan ke Workspace PRD"}</span>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                          <polyline points="9 18 15 12 9 6" />
                        </svg>
                      </button>
                    )}
                  </div>
                )}
              </div>

              {isUser && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 text-slate-300 border border-white/10 flex items-center justify-center text-xs shrink-0 mt-1">
                  👤
                </div>
              )}
            </div>
          );
        })}

        {/* Loading Bubble */}
        {isLoading && (
          <div className="flex gap-3 justify-start animate-in fade-in">
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 mt-1 ${
              mode === "discovery"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                : "bg-brand-500/20 text-brand-300 border border-brand-500/30"
            }`}>
              {mode === "discovery" ? "🔍" : "🤖"}
            </div>
            <div className={`p-3.5 rounded-2xl rounded-tl-none text-xs flex items-center gap-2 ${
              mode === "discovery"
                ? "bg-slate-900 border border-amber-500/15 text-amber-300/80"
                : "bg-slate-900 border border-white/10 text-slate-400"
            }`}>
              <span className={`h-2 w-2 rounded-full animate-ping ${
                mode === "discovery" ? "bg-amber-400" : "bg-brand-400"
              }`} />
              <span>
                {mode === "discovery"
                  ? "AI sedang menganalisis dan menyiapkan pertanyaan discovery..."
                  : "AI sedang membedah kebutuhan produk & memetakan fitur..."
                }
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Starter Chips */}
      {messages.length <= 2 && (
        <div className="p-3 bg-slate-950/60 border-t border-white/5 space-y-1.5 shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
            {mode === "discovery" ? "🔍 Mulai Discovery (Klik untuk coba):" : "💡 Contoh Ide Cepat (Klik untuk coba):"}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {starterPrompts.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(promptText)}
                className={`text-left text-[11px] px-2.5 py-1 rounded-lg border transition-all line-clamp-1 max-w-full ${
                  mode === "discovery"
                    ? "bg-slate-900 hover:bg-amber-500/20 text-slate-300 hover:text-amber-300 border-white/5"
                    : "bg-slate-900 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border-white/5"
                }`}
              >
                {promptText}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Finish Discovery Button (only in discovery mode after some conversation) */}
      {mode === "discovery" && messages.length >= 6 && !messages.some(m => m.extracted) && !isLoading && (
        <div className="px-4 py-2 bg-gradient-to-r from-amber-950/20 to-orange-950/20 border-t border-amber-500/10 shrink-0">
          <button
            type="button"
            onClick={handleFinishDiscovery}
            className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-amber-500/90 to-orange-600/90 hover:from-amber-500 hover:to-orange-500 text-white font-medium text-xs shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <span>✅</span>
            <span>Selesai Discovery — Generate PRD Data</span>
          </button>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="p-3 sm:p-4 bg-slate-900/90 border-t border-white/10 shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <textarea
              rows={2}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                mode === "discovery"
                  ? "Ceritakan ide produk Anda... saya akan menggali lebih dalam. (Enter untuk kirim)"
                  : "Ketik apa yang diinginkan oleh user / klien Anda di sini... (Enter untuk kirim)"
              }
              className={`w-full p-3 rounded-xl bg-slate-950 border text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none leading-relaxed ${
                mode === "discovery"
                  ? "border-amber-500/15 focus:border-amber-500"
                  : "border-white/10 focus:border-brand-500"
              }`}
            />
          </div>

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className={`p-3 rounded-xl text-white font-medium shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
              mode === "discovery"
                ? "bg-gradient-to-tr from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-500"
                : "bg-gradient-to-tr from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-500"
            }`}
            title="Kirim pesan"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
