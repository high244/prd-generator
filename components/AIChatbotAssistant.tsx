"use client";

import { useState, useRef, useEffect } from "react";
import type { FeatureItem } from "@/lib/prompt";
import type { AIEngineOption } from "@/lib/types";

export interface ExtractedPRDData {
  nama: string;
  ide: string;
  category: string;
  target: string;
  stack: string;
  timeline: string;
  features: FeatureItem[];
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  extracted?: ExtractedPRDData;
  timestamp: string;
}

interface AIChatbotAssistantProps {
  activeEngine: AIEngineOption;
  onApplyToForm?: (data: ExtractedPRDData) => void;
  onClose?: () => void;
}

const QUICK_STARTER_PROMPTS = [
  "Saya mau buat aplikasi sewa lapangan olahraga online, ada fitur booking slot waktu, bayar QRIS instan, dan split bill antar teman.",
  "Bantu saya buat platform penitipan hewan peliharaan: pemilik bisa booking jadwal inap, pantau via live CCTV, dan konsultasi dokter hewan.",
  "Saya ingin buat SaaS tool untuk UMKM: pembuatan invoice digital otomatis, pengingat jatuh tempo via WhatsApp, dan rekonsiliasi mutasi bank.",
  "Aplikasi kasir kedai kopi & restoran: pelanggan bisa scan QR di meja untuk pesan makanan sendiri tanpa antre di kasir.",
];

export default function AIChatbotAssistant({
  activeEngine,
  onApplyToForm,
  onClose,
}: AIChatbotAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Halo! Saya adalah **AI Product Consultant** Anda. 🚀\n\nCeritakan apa yang diinginkan oleh Anda atau klien Anda dengan bahasa santai. Anda juga bisa langsung menempelkan (paste) catatan brief atau obrolan chat klien.\n\nSaya akan langsung membedah ide tersebut menjadi **Nama Aplikasi, Problem Statement, Target Pengguna, Rekomendasi Tech Stack, serta Daftar Fitur Prioritas (P0/P1/P2)** yang langsung siap dimasukkan ke formulir PRD!",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

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

    setMessages((prev) => [...prev, userMsg]);
    setInputValue("");
    setIsLoading(true);

    try {
      const historyForApi = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat-assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: historyForApi,
          preferredModel: activeEngine,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menghubungi AI Assistant.");
      }

      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: data.reply || "Saya sudah merangkum kebutuhan produk Anda di bawah ini:",
        extracted: data.extracted,
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: "assistant",
        content: "Maaf, terjadi kendala saat memproses obrolan. Silakan coba lagi.",
        timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <div className="flex flex-col h-full w-full bg-slate-950/95 overflow-hidden select-none">
      {/* Chat Taskbar Header */}
      <div className="p-3.5 sm:px-4 bg-slate-950 border-b border-white/10 flex items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-brand-accent flex items-center justify-center text-white shadow-glow shrink-0">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <div className="truncate">
            <div className="flex items-center gap-1.5">
              <h3 className="font-display font-bold text-xs text-white truncate">
                Chatbot Co-Pilot
              </h3>
              <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </div>
            <p className="text-[10px] text-slate-400 truncate">
              Konsultasi Produk & Arsitektur
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMessages([
                {
                  id: "msg-welcome",
                  role: "assistant",
                  content:
                    "Halo! Saya adalah **AI Product Consultant** Anda. 🚀\n\nCeritakan apa yang diinginkan oleh Anda atau klien Anda dengan bahasa santai. Anda juga bisa konsultasi mengenai ide, arsitektur, atau fitur produk software.\n\nSaya siap membantu kapan saja!",
                  timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
                },
              ]);
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
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center text-xs shrink-0 mt-1">
                  🤖
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] space-y-3 ${
                  isUser ? "items-end" : "items-start"
                }`}
              >
                {/* Bubble message */}
                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? "bg-brand-600 text-white rounded-tr-none shadow-md"
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
                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/60 border border-indigo-500/40 shadow-xl space-y-3 text-xs animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between border-b border-white/10 pb-2">
                      <div className="flex items-center gap-1.5 font-semibold text-indigo-300">
                        <span>📋</span>
                        <span>Hasil Ekstraksi Formulir PRD:</span>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
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
                        Ringkasan Masalah & Solusi
                      </span>
                      <p className="text-slate-300 mt-0.5 line-clamp-2">
                        {m.extracted.ide}
                      </p>
                    </div>

                    {/* Features list mini preview */}
                    {m.extracted.features && m.extracted.features.length > 0 && (
                      <div>
                        <span className="text-slate-400 block text-[10px] uppercase font-mono mb-1">
                          Fitur Esensial yang Disusun
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {m.extracted.features.slice(0, 4).map((f) => (
                            <span
                              key={f.id}
                              className={`text-[10px] px-2 py-0.5 rounded border ${
                                f.priority === "P0"
                                  ? "bg-emerald-500/15 text-emerald-300 border-emerald-500/30"
                                  : "bg-amber-500/15 text-amber-300 border-amber-500/30"
                              }`}
                            >
                              [{f.priority}] {f.title}
                            </span>
                          ))}
                          {m.extracted.features.length > 4 && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-white/5 text-slate-400">
                              +{m.extracted.features.length - 4} lainnya
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
                        className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-brand-500 via-indigo-600 to-brand-accent hover:from-brand-600 hover:to-indigo-500 text-white font-medium text-xs shadow-glow transition-all flex items-center justify-center gap-2"
                      >
                        <span>✨ Masukkan ke Workspace PRD</span>
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
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center text-xs shrink-0 mt-1">
              🤖
            </div>
            <div className="p-3.5 rounded-2xl rounded-tl-none bg-slate-900 border border-white/10 text-xs text-slate-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-brand-400 animate-ping" />
              <span>AI sedang membedah kebutuhan produk & memetakan fitur...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Starter Chips */}
      {messages.length <= 2 && (
        <div className="p-3 bg-slate-950/60 border-t border-white/5 space-y-1.5 shrink-0">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-500 block">
            💡 Contoh Ide Cepat (Klik untuk coba):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_STARTER_PROMPTS.map((promptText, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(promptText)}
                className="text-left text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-brand-500/20 text-slate-300 hover:text-brand-300 border border-white/5 transition-all line-clamp-1 max-w-full"
              >
                {promptText}
              </button>
            ))}
          </div>
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
              placeholder="Ketik apa yang diinginkan oleh user / klien Anda di sini... (Enter untuk kirim)"
              className="w-full p-3 rounded-xl bg-slate-950 border border-white/10 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 resize-none leading-relaxed"
            />
          </div>

          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 rounded-xl bg-gradient-to-tr from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-500 text-white font-medium shadow-glow transition-all disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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
