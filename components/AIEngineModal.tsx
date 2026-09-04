"use client";

import { useState } from "react";
import { AIEngineOption, AI_ENGINE_OPTIONS } from "@/lib/types";

interface AIEngineModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeEngine: AIEngineOption;
  onSelectEngine: (engine: AIEngineOption) => void;
}

export default function AIEngineModal({
  isOpen,
  onClose,
  activeEngine,
  onSelectEngine,
}: AIEngineModalProps) {
  const [selected, setSelected] = useState<AIEngineOption>(activeEngine);
  const [pingStatus, setPingStatus] = useState<string | null>(null);
  const [isPinging, setIsPinging] = useState(false);

  if (!isOpen) return null;

  async function handleTestPing() {
    setIsPinging(true);
    setPingStatus(null);
    const startTime = performance.now();
    try {
      const res = await fetch("/api/suggest-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: "Ping Test",
          ide: "Test koneksi model",
          category: "test",
          preferredModel: selected,
        }),
      });
      const duration = Math.round(performance.now() - startTime);
      if (res.ok) {
        setPingStatus(`🟢 Terhubung aktif! Latensi: ${duration}ms`);
      } else {
        const data = await res.json();
        setPingStatus(`⚠️ Gagal konek: ${data.error || "Model error"}`);
      }
    } catch {
      setPingStatus("🔴 Gagal koneksi jaringan");
    } finally {
      setIsPinging(false);
    }
  }

  function handleSave() {
    onSelectEngine(selected);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-xl glass-panel rounded-2xl border border-white/15 shadow-2xl p-6 sm:p-7 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center">
              ⚙️
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg text-white">
                Pilih AI Engine
              </h3>
              <p className="text-xs text-slate-400">
                Tentukan model kecerdasan buatan untuk menyusun PRD & breakdown fitur Anda.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Engine List Options */}
        <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
          {AI_ENGINE_OPTIONS.map((engine) => {
            const isChosen = selected === engine.id;
            return (
              <div
                key={engine.id}
                onClick={() => setSelected(engine.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                  isChosen
                    ? "bg-brand-500/10 border-brand-500 shadow-glow"
                    : "bg-slate-900/60 border-white/5 hover:border-white/15 hover:bg-slate-900"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        isChosen
                          ? "border-brand-400 bg-brand-500"
                          : "border-slate-600 bg-transparent"
                      }`}
                    >
                      {isChosen && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-100">
                          {engine.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                          {engine.provider}
                        </span>
                        {engine.recommended && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            ⭐ Direkomendasikan
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        {engine.description}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ping Test Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-white/5 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Status Koneksi:</span>
            <span className="font-mono text-slate-200">
              {pingStatus || "Siap diuji"}
            </span>
          </div>
          <button
            type="button"
            onClick={handleTestPing}
            disabled={isPinging}
            className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 transition-colors disabled:opacity-50"
          >
            {isPinging ? "Menguji..." : "⚡ Test Ping"}
          </button>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-brand-500 to-brand-accent hover:from-brand-600 hover:to-brand-accent text-white font-medium text-xs shadow-glow transition-all"
          >
            Simpan Pilihan Engine
          </button>
        </div>
      </div>
    </div>
  );
}
