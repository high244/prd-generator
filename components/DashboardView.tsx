"use client";

import { useState } from "react";
import { SavedPRDProject, AIEngineOption, AI_ENGINE_OPTIONS, UserProfile } from "@/lib/types";

interface PresetConcept {
  name: string;
  badge: string;
  nama: string;
  ide: string;
  category: string;
  target: string;
  stack: string;
}

interface DashboardViewProps {
  savedProjects: SavedPRDProject[];
  activeEngine: AIEngineOption;
  onOpenEngineModal: () => void;
  onSelectEngine: (engine: AIEngineOption) => void;
  onNewProject: () => void;
  onOpenProject: (project: SavedPRDProject) => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  onApplyPreset: (preset: PresetConcept) => void;
  presets: PresetConcept[];
  currentUser: UserProfile;
}

export default function DashboardView({
  savedProjects,
  activeEngine,
  onOpenEngineModal,
  onSelectEngine,
  onNewProject,
  onOpenProject,
  onDeleteProject,
  onApplyPreset,
  presets,
  currentUser,
}: DashboardViewProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const activeEngineMeta =
    AI_ENGINE_OPTIONS.find((e) => e.id === activeEngine) || AI_ENGINE_OPTIONS[0];

  const filteredProjects = savedProjects.filter(
    (p) =>
      p.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ide.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalFeatures = savedProjects.reduce(
    (acc, cur) => acc + (cur.features?.length || 0),
    0
  );

  function formatDate(iso: string) {
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Tersimpan";
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Welcome Hero Banner */}
      <div className="relative rounded-3xl p-6 sm:p-10 overflow-hidden border border-white/10 bg-gradient-to-br from-slate-900/90 via-indigo-950/40 to-slate-950/90 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 rounded-full bg-brand-accent/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>PRD Architect Studio v2.0</span>
            <span className="text-slate-600">•</span>
            <span className="text-brand-300">Production Ready</span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-5xl text-white tracking-tight leading-tight">
            Dashboard Perancangan{" "}
            <span className="bg-gradient-to-r from-brand-400 via-indigo-300 to-brand-accent bg-clip-text text-transparent">
              Produk & PRD
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Kelola ide aplikasi, petakan kebutuhan fitur esensial (P0/P1/P2), rancang skema database terintegrasi, dan generate dokumen PRD profesional yang langsung siap di-eksekusi oleh tim engineer atau <strong>Cursor AI / Claude Code</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onNewProject}
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-brand-500 via-indigo-600 to-brand-accent hover:from-brand-600 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-glow hover:shadow-glow-cyan transition-all flex items-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>+ Buat PRD Baru Sekarang</span>
            </button>

            {savedProjects.length > 0 && (
              <button
                type="button"
                onClick={() => onOpenProject(savedProjects[0])}
                className="py-3 px-5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 hover:text-white font-medium text-xs sm:text-sm border border-white/10 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4 text-brand-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <span>Buka Dokumen Terakhir</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* AI ENGINE CONFIGURATION CARD (Pro vs Free) */}
      {currentUser.plan === "pro" ? (
        /* PRO TIER (Admin): Full model selector, Ubah button, and custom engines */
        <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <div className="flex items-center gap-2.5">
                {/* User requested Pill Badge */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs text-slate-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold">AI Engine Active</span>
                </div>
                <span className="text-xs font-mono text-brand-300">
                  {activeEngineMeta.provider}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  👑 Pro Feature
                </span>
              </div>
              <h2 className="font-display font-semibold text-lg text-white mt-2">
                Pengaturan AI Engine yang Sedang Dipakai
              </h2>
              <p className="text-xs text-slate-400">
                Pilih model AI sebelum masuk ke halaman pembuatan PRD. Dokumen dan fitur akan diproses dengan model ini.
              </p>
            </div>

            <button
              type="button"
              onClick={onOpenEngineModal}
              className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-medium border border-white/10 transition-all flex items-center gap-2"
            >
              <span>⚙️ Pengaturan Engine Lengkap</span>
            </button>
          </div>

          {/* Quick Engine Selector Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
            {AI_ENGINE_OPTIONS.filter((e) => e.id !== "fallback").map((engine) => {
              const isSelected = activeEngine === engine.id;
              return (
                <div
                  key={engine.id}
                  onClick={() => onSelectEngine(engine.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? "bg-brand-500/15 border-brand-500 shadow-glow"
                      : "bg-slate-900/60 border-white/5 hover:border-white/15 hover:bg-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-xs text-white">
                      {engine.name}
                    </span>
                    {isSelected ? (
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-slate-500">Pilih</span>
                    )}
                  </div>
                  <div className="text-[10px] font-mono text-brand-300 mb-1">
                    {engine.badge}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {engine.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* FREE TIER (Member): Locked engine, only AI Engine Active badge, no model switcher */
        <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs text-slate-200">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-semibold">AI Engine Active</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5">
                  Paket Free (Standar)
                </span>
              </div>
              <h2 className="font-display font-semibold text-base text-white">
                AI Engine Aktif & Teroptimasi
              </h2>
              <p className="text-xs text-slate-400 max-w-xl">
                Sistem secara otomatis mengelola performa AI untuk akun Anda. Kustomisasi pergantian model AI (Gemini 3.8 Flash, Claude 3.5 Sonnet) dikhususkan untuk akun <strong>Pro Tier (Admin)</strong>.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/80 border border-white/5 text-center shrink-0">
              <div className="text-[11px] text-slate-400 mb-1">Status Akun:</div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                ⚡ Free Member Aktif
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Quick Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/15 text-brand-400 flex items-center justify-center border border-brand-500/25 shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-white">
              {savedProjects.length}
            </div>
            <div className="text-xs text-slate-400">Proyek Akun Anda ({currentUser.plan.toUpperCase()})</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center border border-indigo-500/25 shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-white">
              {totalFeatures || 6}
            </div>
            <div className="text-xs text-slate-400">Fitur Terpetakan (P0/P1/P2)</div>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-white/10 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/25 shrink-0">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div>
            <div className="text-sm font-semibold text-white">
              {currentUser.plan === "pro" ? activeEngineMeta.name : "AI Engine Active"}
            </div>
            <div className="text-xs text-emerald-400 flex items-center gap-1.5 mt-0.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>{currentUser.plan === "pro" ? "Kustomisasi Pro Aktif" : "Engine Standar Aktif"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Saved Projects Section */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="font-display font-semibold text-xl text-white">
              Proyek PRD Anda ({savedProjects.length})
            </h2>
            <p className="text-xs text-slate-400">
              Dokumen PRD tersimpan secara otomatis. Klik salah satu untuk membuka dan mengedit kembali.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari proyek tersimpan..."
              className="input-glass w-full px-3 py-1.5 rounded-xl text-xs"
            />
          </div>
        </div>

        {filteredProjects.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-white/5 space-y-3">
            <p className="text-xs text-slate-400">Tidak ada proyek yang sesuai dengan pencarian.</p>
            <button
              type="button"
              onClick={onNewProject}
              className="text-xs text-brand-400 hover:underline font-medium"
            >
              + Buat PRD Baru
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProjects.map((project) => (
              <div
                key={project.id}
                className="glass-panel p-5 rounded-2xl border border-white/10 hover:border-brand-500/40 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-300 border border-brand-500/20">
                      {project.category || "General"}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(project.createdAt)}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-display font-semibold text-base text-white group-hover:text-brand-300 transition-colors line-clamp-1">
                      {project.nama}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {project.ide}
                    </p>
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                      💻 {project.stack ? project.stack.split("+")[0].trim() : "Next.js"}
                    </span>
                    {project.features && (
                      <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5">
                        ⚡ {project.features.length} Fitur
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-5 border-t border-white/10 mt-4 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onOpenProject(project)}
                    className="flex-1 py-2 px-3 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 text-brand-300 text-xs font-medium border border-brand-500/30 transition-all text-center flex items-center justify-center gap-1.5"
                  >
                    <span>Buka PRD</span>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => onDeleteProject(project.id, e)}
                    className="p-2 rounded-lg bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 border border-white/5 transition-colors"
                    title="Hapus PRD"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Presets Starters */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-brand-400 animate-pulse" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Inspirasi Cepat — Template Industri
            </h3>
          </div>
          <span className="text-xs text-slate-400">
            Klik salah satu template untuk langsung masuk ke workspace
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {presets.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => onApplyPreset(preset)}
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
      </div>
    </div>
  );
}
