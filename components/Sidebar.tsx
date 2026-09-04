"use client";

import { useState } from "react";
import { SavedPRDProject, AIEngineOption, AI_ENGINE_OPTIONS, UserProfile } from "@/lib/types";

interface SidebarProps {
  currentView: "dashboard" | "generator";
  onSelectView: (view: "dashboard" | "generator") => void;
  savedProjects: SavedPRDProject[];
  activeProjectId: string | null;
  onSelectProject: (project: SavedPRDProject) => void;
  onNewProject: () => void;
  onDeleteProject: (id: string, e: React.MouseEvent) => void;
  activeEngine: AIEngineOption;
  onOpenEngineModal: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  currentUser: UserProfile;
  onLogout: () => void;
}

export default function Sidebar({
  currentView,
  onSelectView,
  savedProjects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onDeleteProject,
  activeEngine,
  onOpenEngineModal,
  isCollapsed,
  onToggleCollapse,
  currentUser,
  onLogout,
}: SidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProjects = savedProjects.filter((p) =>
    p.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const activeEngineMeta = AI_ENGINE_OPTIONS.find((e) => e.id === activeEngine) || AI_ENGINE_OPTIONS[0];

  function formatRelativeDate(isoString: string): string {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      if (diffDays === 0) return "Hari ini";
      if (diffDays === 1) return "Kemarin";
      if (diffDays < 7) return `${diffDays} hari lalu`;
      return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
    } catch {
      return "Tersimpan";
    }
  }

  return (
    <aside
      className={`relative border-r border-white/10 bg-slate-950/95 backdrop-blur-xl flex flex-col transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-72 sm:w-80"
      } shrink-0 min-h-[calc(100vh-4rem)] select-none`}
    >
      {/* Sidebar Header */}
      <div className="p-3.5 border-b border-white/10 flex items-center justify-between gap-2">
        {!isCollapsed && (
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-500 to-brand-accent flex items-center justify-center text-white shadow-glow shrink-0">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
                <polyline points="2 12 12 17 22 12" />
              </svg>
            </div>
            <div className="truncate">
              <div className="font-display font-bold text-sm text-white leading-tight">
                PRD Architect
              </div>
              <div className="text-[10px] text-slate-400 font-mono">Workspace AI</div>
            </div>
          </div>
        )}

        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors ml-auto"
          title={isCollapsed ? "Buka Sidebar" : "Lipat Sidebar"}
        >
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isCollapsed ? "rotate-180" : ""}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* Action: New Project Button */}
      <div className="p-3">
        <button
          type="button"
          onClick={onNewProject}
          className={`w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-500 text-white font-medium text-xs shadow-glow transition-all flex items-center ${
            isCollapsed ? "justify-center px-0" : "justify-center gap-2"
          }`}
          title="Buat PRD Baru"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          {!isCollapsed && <span>+ Buat PRD Baru</span>}
        </button>
      </div>

      {/* Main Navigation links */}
      <div className="px-3 pb-2 space-y-1">
        <button
          type="button"
          onClick={() => onSelectView("dashboard")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentView === "dashboard"
              ? "bg-brand-500/15 text-brand-300 border border-brand-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
          } ${isCollapsed ? "justify-center px-0" : ""}`}
          title="Dashboard Depan"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
          {!isCollapsed && <span>Dashboard Depan</span>}
        </button>

        <button
          type="button"
          onClick={() => onSelectView("generator")}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
            currentView === "generator"
              ? "bg-brand-500/15 text-brand-300 border border-brand-500/30"
              : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
          } ${isCollapsed ? "justify-center px-0" : ""}`}
          title="Editor & Generator PRD"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
          {!isCollapsed && <span>Workspace PRD</span>}
        </button>

        <button
          type="button"
          onClick={() => onNewProject()}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-slate-900/60 transition-all ${
            isCollapsed ? "justify-center px-0" : ""
          }`}
          title="Mulai dengan Chatbot AI"
        >
          <svg className="w-4 h-4 shrink-0 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {!isCollapsed && <span>Chatbot Co-Pilot</span>}
        </button>
      </div>

      {/* Search Bar (if expanded) */}
      {!isCollapsed && (
        <div className="px-3 pt-2 pb-1">
          <div className="relative">
            <svg
              className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari PRD tersimpan..."
              className="w-full pl-8 pr-3 py-1.5 bg-slate-900/80 border border-white/10 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500/50"
            />
          </div>
        </div>
      )}

      {/* Saved PRDs History Section */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        {!isCollapsed && (
          <div className="flex items-center justify-between px-2 pt-2 pb-1 text-[11px] font-mono uppercase tracking-wider text-slate-500">
            <span>Riwayat Proyek ({filteredProjects.length})</span>
          </div>
        )}

        {filteredProjects.length === 0 ? (
          !isCollapsed && (
            <div className="p-4 text-center text-xs text-slate-500">
              Belum ada PRD tersimpan yang cocok.
            </div>
          )
        ) : (
          filteredProjects.map((project) => {
            const isActive = activeProjectId === project.id;
            return (
              <div
                key={project.id}
                onClick={() => onSelectProject(project)}
                className={`group relative flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-all border ${
                  isActive
                    ? "bg-slate-900 border-brand-500/40 text-white shadow-sm"
                    : "hover:bg-slate-900/60 border-transparent text-slate-300 hover:text-white"
                } ${isCollapsed ? "justify-center p-2" : ""}`}
                title={project.nama}
              >
                <div className="mt-0.5 shrink-0 text-slate-400 group-hover:text-brand-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>

                {!isCollapsed && (
                  <div className="flex-1 min-w-0 pr-6">
                    <div className="font-medium text-xs truncate leading-snug">
                      {project.nama}
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                      <span className="capitalize">{project.category || "General"}</span>
                      <span>•</span>
                      <span>{formatRelativeDate(project.createdAt)}</span>
                    </div>
                  </div>
                )}

                {/* Delete button on hover */}
                {!isCollapsed && (
                  <button
                    type="button"
                    onClick={(e) => onDeleteProject(project.id, e)}
                    className="absolute right-2 top-2.5 p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Hapus dari riwayat"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sidebar Footer: AI Engine Active Pill Badge (Matches user screenshot) */}
      {/* Sidebar Footer: AI Engine Active Pill Badge (Matches user screenshot) */}
      <div className="p-3 border-t border-white/10 bg-slate-950/90 space-y-2">
        {currentUser.plan === "pro" ? (
          /* PRO USER (Admin): Full details, Ubah button, and model name from screenshot */
          <button
            type="button"
            onClick={onOpenEngineModal}
            className={`w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-white/10 hover:border-brand-500/40 transition-all text-left group ${
              isCollapsed ? "flex items-center justify-center p-2" : ""
            }`}
            title="Pengaturan AI Engine (Pro Plan)"
          >
            {isCollapsed ? (
              <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
            ) : (
              <div>
                {/* The user-requested pill badge */}
                <div className="flex items-center justify-between mb-1.5">
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-950 border border-white/10 text-[11px] text-slate-300">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-medium">AI Engine Active</span>
                  </div>
                  <span className="text-[10px] text-slate-500 group-hover:text-brand-400 transition-colors">
                    Ubah ⚙️
                  </span>
                </div>
                <div className="text-xs font-semibold text-slate-200 truncate">
                  {activeEngineMeta.name}
                </div>
                <div className="text-[10px] text-slate-400 font-mono truncate">
                  {activeEngineMeta.provider}
                </div>
              </div>
            )}
          </button>
        ) : (
          /* FREE USER (Member): Locked engine, ONLY AI Engine Active pill, no model text, no change button */
          <div
            className={`w-full p-2.5 rounded-xl bg-slate-900/80 border border-white/5 text-center ${
              isCollapsed ? "flex items-center justify-center p-2" : ""
            }`}
            title="AI Engine terstandar (Paket Free)"
          >
            {isCollapsed ? (
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            ) : (
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 border border-white/10 text-[11px] text-slate-300">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  <span className="font-medium">AI Engine Active</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Account Info & Logout */}
        {!isCollapsed && (
          <div className="pt-2 border-t border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 min-w-0 pr-2">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="truncate">
                <div className="font-medium text-slate-200 text-[11px] truncate flex items-center gap-1">
                  <span>{currentUser.name}</span>
                  {currentUser.plan === "pro" ? (
                    <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 font-mono">PRO</span>
                  ) : (
                    <span className="text-[9px] px-1 rounded bg-white/10 text-slate-400 font-mono">FREE</span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onLogout}
              className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors"
              title="Keluar (Logout)"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
