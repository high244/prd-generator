"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "./Sidebar";
import DashboardView from "./DashboardView";
import PRDViewer from "./PRDViewer";
import AIEngineModal from "./AIEngineModal";
import AIChatbotAssistant, { ExtractedPRDData, ChatMode } from "./AIChatbotAssistant";
import AuthGate from "./AuthGate";
import {
  SavedPRDProject,
  SavedChatMessage,
  AIEngineOption,
  AI_ENGINE_OPTIONS,
  UserProfile,
} from "@/lib/types";
import {
  getCurrentUserSession,
  logoutUserSession,
} from "@/lib/supabase";
import {
  loadSavedProjects,
  saveProject,
  deleteProject,
  syncProjectsFromSupabase,
  loadActiveEngine,
  saveActiveEngine,
  SAMPLE_MEDIBRIDGE_PRD,
} from "@/lib/storage";
import type { FeatureItem } from "@/lib/prompt";

export interface PresetConcept {
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

export default function PRDStudio() {
  // Auth Session State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  // Navigation & View State
  const [currentView, setCurrentView] = useState<"dashboard" | "generator">("dashboard");
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("quick");
  const [chatMessages, setChatMessages] = useState<SavedChatMessage[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEngineModalOpen, setIsEngineModalOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Storage & Projects
  const [savedProjects, setSavedProjects] = useState<SavedPRDProject[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeEngine, setActiveEngine] = useState<AIEngineOption>("gemini-3.6-flash");

  // Form & Active PRD State
  const [nama, setNama] = useState("");
  const [ide, setIde] = useState("");
  const [category, setCategory] = useState("general");
  const [target, setTarget] = useState("");
  const [stack, setStack] = useState(TECH_STACK_PRESETS[0]);
  const [timeline, setTimeline] = useState("2-4 Minggu (Fokus MVP)");
  const [depthLevel, setDepthLevel] = useState<"standard" | "ultra_deep">("ultra_deep");

  // Feature Discovery
  const [features, setFeatures] = useState<FeatureItem[]>([]);
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [newFeatureText, setNewFeatureText] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<"ALL" | "P0" | "P1" | "P2">("ALL");

  // Generation Output
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [markdown, setMarkdown] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [aiSource, setAiSource] = useState<"claude" | "fallback" | "gemini" | "openrouter" | null>(null);
  const [aiModel, setAiModel] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Auto Save Draft States
  const [autoSaveStatus, setAutoSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [lastAutoSavedTime, setLastAutoSavedTime] = useState<string | null>(null);
  const skipAutoSaveRef = useRef(true);

  // Reset everything to default clean dashboard (default model gemini-3.6-flash, clean draft)
  function resetToDefaultState() {
    skipAutoSaveRef.current = true;
    setAutoSaveStatus("idle");
    setActiveProjectId(null);
    setNama("");
    setIde("");
    setCategory("general");
    setTarget("");
    setStack(TECH_STACK_PRESETS[0]);
    setTimeline("2-4 Minggu (Fokus MVP)");
    setDepthLevel("ultra_deep");
    setFeatures([]);
    setMarkdown("");
    setStatus("idle");
    setErrorMsg("");
    setActiveEngine("gemini-3.6-flash");
    saveActiveEngine("gemini-3.6-flash");
    setChatMessages([]);
    setChatMode("quick");
    setCurrentView("dashboard");
  }

  // Initialize Auth & Storage
  useEffect(() => {
    const sessionUser = getCurrentUserSession();
    if (sessionUser) {
      setCurrentUser(sessionUser);
      const projects = loadSavedProjects(sessionUser.id);
      setSavedProjects(projects);
      resetToDefaultState();

      // Sync cloud projects dari Supabase di background
      syncProjectsFromSupabase(sessionUser.id).then((cloudProjects) => {
        if (cloudProjects && cloudProjects.length > 0) {
          setSavedProjects(cloudProjects);
        }
      });
    }
  }, []);

  // Debounced Auto Save Draft Effect
  useEffect(() => {
    if (currentView !== "generator") return;
    if (skipAutoSaveRef.current) {
      skipAutoSaveRef.current = false;
      return;
    }

    const hasData = Boolean(
      nama.trim() ||
      ide.trim() ||
      target.trim() ||
      features.length > 0 ||
      markdown.trim() ||
      chatMessages.length > 1
    );
    if (!hasData) {
      setAutoSaveStatus("idle");
      return;
    }

    setAutoSaveStatus("saving");
    const timer = setTimeout(() => {
      const savedId = saveCurrentDraftToHistory(false);
      if (savedId) {
        setAutoSaveStatus("saved");
        const now = new Date();
        setLastAutoSavedTime(
          now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
        );
      } else {
        setAutoSaveStatus("idle");
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [nama, ide, category, target, stack, timeline, depthLevel, features, markdown, chatMessages, chatMode, currentView]);

  function showToast(msg: string) {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  }

  // Auth Handlers
  function handleLoginSuccess(user: UserProfile) {
    setCurrentUser(user);
    const projects = loadSavedProjects(user.id);
    setSavedProjects(projects);
    resetToDefaultState();
    showToast(`Selamat datang, ${user.name}! (${user.plan === "pro" ? "👑 Pro Tier" : "⚡ Free Tier"})`);

    // Sync cloud projects dari Supabase di background
    syncProjectsFromSupabase(user.id).then((cloudProjects) => {
      if (cloudProjects && cloudProjects.length > 0) {
        setSavedProjects(cloudProjects);
      }
    });
  }

  function handleLogoutRequest() {
    setIsLogoutModalOpen(true);
  }

  function handleLogoutConfirm() {
    setIsLoggingOut(true);
    setTimeout(() => {
      logoutUserSession();
      setCurrentUser(null);
      resetToDefaultState();
      setIsLogoutModalOpen(false);
      setIsLoggingOut(false);
      showToast("Anda telah berhasil keluar dari akun.");
    }, 800);
  }

  function handleLogoutCancel() {
    setIsLogoutModalOpen(false);
  }

  // Engine Change (Protected for Pro only)
  function handleSelectEngine(engine: AIEngineOption) {
    if (currentUser?.plan !== "pro") {
      showToast("Kustomisasi model AI hanya tersedia untuk akun Pro (Admin).");
      return;
    }
    setActiveEngine(engine);
    saveActiveEngine(engine);
    const meta = AI_ENGINE_OPTIONS.find((e) => e.id === engine);
    showToast(`AI Engine aktif: ${meta?.name || engine}`);
  }

  // Save current workspace state as draft to history
  function saveCurrentDraftToHistory(notify = true): string | null {
    const hasDraftData =
      Boolean(nama.trim()) ||
      Boolean(ide.trim()) ||
      Boolean(target.trim()) ||
      features.length > 0 ||
      Boolean(markdown.trim()) ||
      chatMessages.length > 1;

    if (!hasDraftData) {
      return null;
    }

    const idToSave = activeProjectId || `prd-${Date.now()}`;
    const firstUserMsg = chatMessages.find((m) => m.role === "user")?.content;
    const projectTitle =
      nama.trim() ||
      (ide.trim() ? ide.trim().slice(0, 35) + "..." : "") ||
      (firstUserMsg ? firstUserMsg.slice(0, 35) + "..." : "") ||
      `Draft PRD (${new Date().toLocaleDateString("id-ID")})`;

    const draftProject: SavedPRDProject = {
      id: idToSave,
      userId: currentUser?.id,
      nama: projectTitle,
      ide: ide.trim(),
      category: category || "general",
      target: target.trim(),
      stack: stack || TECH_STACK_PRESETS[0],
      timeline: timeline || "2-4 Minggu (Fokus MVP)",
      depthLevel,
      features: features || [],
      markdown: markdown || "",
      model: aiModel || activeEngine,
      source: aiSource || "gemini",
      chatHistory: chatMessages,
      chatMode: chatMode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = saveProject(draftProject, currentUser?.id);
    setSavedProjects(updated);
    setActiveProjectId(idToSave);

    if (notify) {
      showToast(`Draft "${projectTitle}" berhasil disimpan ke riwayat proyek!`);
    }

    return idToSave;
  }

  // Exit from workspace back to dashboard with auto-saved draft
  function handleExitWorkspace() {
    saveCurrentDraftToHistory(false);
    setCurrentView("dashboard");
  }

  // Open existing project from history/dashboard
  function handleOpenProject(project: SavedPRDProject) {
    if (currentView === "generator" && activeProjectId !== project.id) {
      saveCurrentDraftToHistory(false);
    }
    skipAutoSaveRef.current = true;
    setAutoSaveStatus("saved");
    setActiveProjectId(project.id);
    setNama(project.nama);
    setIde(project.ide);
    setCategory(project.category);
    setTarget(project.target || "");
    setStack(project.stack || TECH_STACK_PRESETS[0]);
    setTimeline(project.timeline || "2-4 Minggu (Fokus MVP)");
    setDepthLevel(project.depthLevel || "ultra_deep");
    setFeatures(project.features || []);
    setMarkdown(project.markdown || "");
    setAiSource(project.source || "gemini");
    setAiModel(project.model || "");
    setStatus(project.markdown ? "success" : "idle");
    setChatMessages(project.chatHistory && project.chatHistory.length > 0 ? project.chatHistory : []);
    setChatMode(project.chatMode || "discovery");
    setCurrentView("generator");
  }

  // Apply extracted data from AI Chatbot into Form & langsung buat entri di Riwayat Proyek
  function handleApplyFromChat(data: ExtractedPRDData) {
    const newProjectId = activeProjectId || `prd-${Date.now()}`;
    const projectTitle =
      data.nama.trim() ||
      (data.ide.trim() ? data.ide.trim().slice(0, 35) + "..." : "") ||
      `Draft PRD (${new Date().toLocaleDateString("id-ID")})`;

    setActiveProjectId(newProjectId);
    setNama(data.nama);
    setIde(data.ide);
    setCategory(data.category || "general");
    setTarget(data.target || "");
    setStack(data.stack || TECH_STACK_PRESETS[0]);
    setTimeline(data.timeline || "2-4 Minggu (Fokus MVP)");
    setFeatures(data.features || []);
    setMarkdown("");
    setStatus("idle");
    setErrorMsg("");

    // Langsung buat dan simpan entri proyek baru ke Riwayat Proyek & Supabase
    const newDraftProject: SavedPRDProject = {
      id: newProjectId,
      userId: currentUser?.id,
      nama: projectTitle,
      ide: data.ide.trim(),
      category: data.category || "general",
      target: data.target || "",
      stack: data.stack || TECH_STACK_PRESETS[0],
      timeline: data.timeline || "2-4 Minggu (Fokus MVP)",
      features: data.features || [],
      markdown: "",
      model: activeEngine,
      source: "gemini",
      chatHistory: chatMessages,
      chatMode: chatMode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = saveProject(newDraftProject, currentUser?.id);
    setSavedProjects(updated);
    skipAutoSaveRef.current = true;
    setAutoSaveStatus("saved");
    setLastAutoSavedTime(
      new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
    );

    setCurrentView("generator");
    setIsChatbotOpen(false); // Otomatis tutup drawer chatbot agar workspace terlihat fokus
    showToast(`Proyek "${projectTitle}" berhasil dibuat dan masuk ke Riwayat Proyek!`);
  }

  // Reset to create new project
  function handleNewProject() {
    if (currentView === "generator") {
      saveCurrentDraftToHistory(false);
    }
    skipAutoSaveRef.current = true;
    setAutoSaveStatus("idle");
    setActiveProjectId(null);
    setNama("");
    setIde("");
    setCategory("general");
    setTarget("");
    setStack(TECH_STACK_PRESETS[0]);
    setTimeline("2-4 Minggu (Fokus MVP)");
    setFeatures([]);
    setMarkdown("");
    setStatus("idle");
    setErrorMsg("");
    setChatMessages([]);
    setChatMode("quick");
    setCurrentView("generator");
  }

  // Delete project
  function handleDeleteProject(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (confirm("Hapus dokumen PRD ini dari riwayat tersimpan?")) {
      const updated = deleteProject(id, currentUser?.id);
      setSavedProjects(updated);
      if (activeProjectId === id) {
        handleNewProject();
      }
      showToast("Dokumen PRD berhasil dihapus.");
    }
  }

  // Apply preset concept
  function handleApplyPreset(preset: PresetConcept) {
    if (currentView === "generator") {
      saveCurrentDraftToHistory(false);
    }
    setActiveProjectId(null);
    setNama(preset.nama);
    setIde(preset.ide);
    setCategory(preset.category);
    setTarget(preset.target);
    setStack(preset.stack);
    setMarkdown("");
    setStatus("idle");
    setCurrentView("generator");
    triggerFeatureBrainstorm(preset.nama, preset.ide, preset.category);
  }

  // AI Feature Brainstorming
  async function triggerFeatureBrainstorm(targetNama?: string, targetIde?: string, targetCat?: string) {
    const activeIde = targetIde ?? ide;
    const activeNama = targetNama ?? nama;
    const activeCat = targetCat ?? category;

    if (!activeIde.trim() && !activeNama.trim()) {
      setErrorMsg("Ketik nama atau ide dasar aplikasi terlebih dahulu.");
      setStatus("error");
      return;
    }

    setIsBrainstorming(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/suggest-features", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: activeNama,
          ide: activeIde,
          category: activeCat,
          preferredModel: activeEngine,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal mendapatkan rekomendasi fitur.");
      }

      setFeatures(data.features || []);
      showToast("Rekomendasi fitur berhasil dibuat!");
    } catch (err) {
      console.error(err);
      setErrorMsg("Gagal memuat rekomendasi fitur.");
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

  // Generate PRD
  async function handleGeneratePRD() {
    if (!nama.trim() || !ide.trim()) {
      setStatus("error");
      setErrorMsg("Nama aplikasi dan ide dasar wajib diisi.");
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
          depthLevel,
          preferredModel: activeEngine,
          engine: activeEngine,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyusun PRD.");
      }

      setMarkdown(data.markdown);
      setAiSource(data.source || "gemini");
      setAiModel(data.model || activeEngine);
      setStatus("success");

      // Auto-save to saved projects in localStorage
      const newProjectId = activeProjectId || `prd-${Date.now()}`;
      const projectToSave: SavedPRDProject = {
        id: newProjectId,
        userId: currentUser?.id,
        nama,
        ide,
        category,
        target,
        stack,
        timeline,
        depthLevel,
        features,
        markdown: data.markdown,
        model: data.model || activeEngine,
        source: data.source || "gemini",
        chatHistory: chatMessages,
        chatMode: chatMode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const updated = saveProject(projectToSave, currentUser?.id);
      setSavedProjects(updated);
      setActiveProjectId(newProjectId);

      showToast("Dokumen PRD berhasil dibuat & disimpan ke riwayat!");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Terjadi kendala saat menyusun PRD.");
    }
  }

  // Explicit Save to History
  function handleSaveCurrentProject() {
    if (!markdown) {
      showToast("Belum ada dokumen PRD untuk disimpan.");
      return;
    }

    const idToSave = activeProjectId || `prd-${Date.now()}`;
    const projectToSave: SavedPRDProject = {
      id: idToSave,
      userId: currentUser?.id,
      nama: nama || "Proyek Tanpa Judul",
      ide,
      category,
      target,
      stack,
      timeline,
      depthLevel,
      features,
      markdown,
      model: aiModel || activeEngine,
      source: aiSource || "gemini",
      chatHistory: chatMessages,
      chatMode: chatMode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = saveProject(projectToSave, currentUser?.id);
    setSavedProjects(updated);
    setActiveProjectId(idToSave);
    showToast("Dokumen PRD berhasil disimpan ke riwayat!");
  }

  const activeEngineMeta =
    AI_ENGINE_OPTIONS.find((e) => e.id === activeEngine) || AI_ENGINE_OPTIONS[0];

  const filteredFeatures = features.filter((f) => {
    if (priorityFilter === "ALL") return true;
    return f.priority === priorityFilter;
  });


  // Not logged in -> Show Supabase Auth Gate
  if (!currentUser) {
    return <AuthGate onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen flex flex-col bg-ambient-pattern overflow-hidden">
      {/* Top Navbar */}
      <header className="h-16 shrink-0 border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              onClick={handleExitWorkspace}
              className="flex items-center gap-2.5 cursor-pointer"
              title="Kembali ke Dashboard Depan"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-500 to-brand-accent flex items-center justify-center text-white shadow-glow">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <span className="font-display font-bold text-base tracking-tight text-white hidden sm:inline">
                PRD Architect
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                v2.0 Studio
              </span>
            </div>
          </div>

          {/* Right Header Navigation, Active Engine Badge & User Profile */}
          <div className="flex items-center gap-3">

            {/* AI Engine Active Pill Badge (Pro shows Ubah & model name, Free only shows AI Engine Active) */}
            {currentUser.plan === "pro" ? (
              <button
                type="button"
                onClick={() => setIsEngineModalOpen(true)}
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-white/10 text-xs text-slate-200 transition-all group"
                title="Klik untuk mengubah AI Engine (Akun Pro)"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-medium">AI Engine Active</span>
                <span className="text-[10px] text-slate-500 group-hover:text-brand-300 hidden md:inline">
                  ({activeEngineMeta.name})
                </span>
              </button>
            ) : (
              <div
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-white/10 text-xs text-slate-300"
                title="AI Engine Aktif & Terstandarisasi"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-medium">AI Engine Active</span>
              </div>
            )}
            {/* Chatbot Co-Pilot / Consultation Button (Right of AI Engine) */}
            <button
              type="button"
              onClick={() => setIsChatbotOpen(!isChatbotOpen)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all ${
                isChatbotOpen
                  ? "bg-indigo-600 hover:bg-indigo-500 text-white border-indigo-400/60 shadow-glow"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-200 border-white/10 hover:border-indigo-500/40"
              }`}
              title="Konsultasi Produk & Arsitektur dengan Chatbot AI"
            >
              <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              <span>Chatbot Co-Pilot</span>
              {isChatbotOpen ? (
                <span className="text-[10px] text-indigo-200 ml-0.5">✕</span>
              ) : (
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  Konsultasi
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* App Body with Sidebar & Main View */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left Sidebar (ChatGPT / Claude UI Style) */}
        <Sidebar
          currentView={currentView}
          onExitToDashboard={handleExitWorkspace}
          savedProjects={savedProjects}
          activeProjectId={activeProjectId}
          onSelectProject={handleOpenProject}
          onNewProject={handleNewProject}
          onDeleteProject={handleDeleteProject}
          activeEngine={activeEngine}
          onOpenEngineModal={() => setIsEngineModalOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          currentUser={currentUser}
          onLogout={handleLogoutRequest}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-8">
          <div className="max-w-[1440px] mx-auto pb-16">
            {/* VIEW 1: DASHBOARD VIEW */}
            {currentView === "dashboard" && (
              <DashboardView
                savedProjects={savedProjects}
                activeEngine={activeEngine}
                onOpenEngineModal={() => setIsEngineModalOpen(true)}
                onSelectEngine={handleSelectEngine}
                onNewProject={handleNewProject}
                onOpenProject={handleOpenProject}
                onDeleteProject={handleDeleteProject}
                onApplyPreset={handleApplyPreset}
                presets={PRESET_TEMPLATES}
                currentUser={currentUser}
              />
            )}

            {/* VIEW 2: WORKSPACE & PRD GENERATOR VIEW */}
            {currentView === "generator" && (
              <div className="space-y-6">
                {/* Workspace Action Header: Exit Button, Draft Status, and Engine Info */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleExitWorkspace}
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-white/15 hover:border-brand-500/40 text-xs font-semibold transition-all shadow-sm group"
                      title="Keluar ke Dashboard & Simpan Draft Otomatis"
                    >
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-brand-300 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M19 12H5" />
                        <polyline points="12 19 5 12 12 5" />
                      </svg>
                      <span>Keluar ke Dashboard</span>
                    </button>

                    <div className="h-4 w-px bg-white/10 hidden sm:block" />

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="text-slate-500 hidden sm:inline">Workspace:</span>
                      <span className="text-white font-medium truncate max-w-[180px] sm:max-w-xs">
                        {nama || "Draft PRD Baru"}
                      </span>
                      {!markdown && (nama || ide || features.length > 0) && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                          Draft Otomatis
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    {/* Auto Save Draft Status Indicator */}
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-white/10 text-xs font-mono select-none"
                      title="Draft perubahan otomatis disimpan ke riwayat proyek"
                    >
                      {autoSaveStatus === "saving" ? (
                        <>
                          <svg className="w-3.5 h-3.5 text-amber-400 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-amber-300">Menyimpan draft...</span>
                        </>
                      ) : autoSaveStatus === "saved" ? (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-emerald-300 font-medium">Auto-save: Tersimpan</span>
                          {lastAutoSavedTime && (
                            <span className="text-[10px] text-slate-500 hidden sm:inline font-mono">({lastAutoSavedTime})</span>
                          )}
                        </>
                      ) : (
                        <>
                          <span className="w-2 h-2 rounded-full bg-emerald-400/60" />
                          <span className="text-slate-300">Auto Save Aktif</span>
                        </>
                      )}
                    </div>

                    <span className="text-xs text-slate-400 hidden md:inline">Engine:</span>
                    {currentUser.plan === "pro" ? (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-brand-500/10 text-brand-300 border border-brand-500/20">
                        {activeEngineMeta.name}
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        AI Engine Active
                      </span>
                    )}
                  </div>
                </div>

                {/* Main 2-Column Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
                  {/* Left Column: Input Form & Feature Discovery (5 Cols) */}
                  <section className="xl:col-span-5 space-y-4">
                    <div className="glass-panel rounded-2xl p-6 border border-white/10 shadow-xl space-y-5">
                        <div className="border-b border-white/10 pb-4">
                          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono border border-indigo-500/20 mb-2">
                            Tahap 1 • Konsep & Ide Dasar
                          </div>
                          <h2 className="font-display font-semibold text-lg text-white">
                            Rancang Spesifikasi Produk
                          </h2>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Tuliskan ide aplikasi Anda. AI akan bantu menyusun breakdown fitur dan dokumen PRD lengkap.
                          </p>
                        </div>

                      {/* Nama Website */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                          Nama Website / Project <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          value={nama}
                          onChange={(e) => setNama(e.target.value)}
                          placeholder="Contoh: KopiNusantara, CariTutor, QuickInvoice"
                          className="input-glass w-full px-3.5 py-2.5 rounded-lg text-xs sm:text-sm"
                        />
                      </div>

                      {/* Ide & Masalah */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                            Ide & Masalah yang Diselesaikan <span className="text-rose-400">*</span>
                          </label>
                          <span className="text-[10px] text-slate-400">Bahasa Indonesia</span>
                        </div>
                        <textarea
                          rows={4}
                          value={ide}
                          onChange={(e) => setIde(e.target.value)}
                          placeholder="Website ini untuk siapa, apa masalah utama yang dialami pengguna, dan bagaimana solusi yang ingin Anda berikan?"
                          className="input-glass w-full px-3.5 py-2.5 rounded-lg text-xs sm:text-sm leading-relaxed"
                        />
                      </div>

                      {/* AI Feature Brainstorming Card */}
                      <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 via-slate-900/60 to-purple-950/40 border border-indigo-500/30 shadow-inner space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300">
                          <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
                          </svg>
                          <span>AI Feature Brainstorming Assistant</span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Belum tahu fitur apa saja yang dibutuhkan? Klik tombol di bawah agar AI memecah ide Anda menjadi fitur siap pakai.
                        </p>

                        <button
                          type="button"
                          onClick={() => triggerFeatureBrainstorm()}
                          disabled={isBrainstorming || (!ide.trim() && !nama.trim())}
                          className="w-full py-2.5 px-4 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 text-xs font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                          {isBrainstorming ? (
                            <>
                              <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              <span>AI sedang memetakan fitur...</span>
                            </>
                          ) : (
                            <>
                              <span>✨ Rekomendasikan Fitur Otomatis</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Feature List (if generated) */}
                      {features.length > 0 && (
                        <div className="space-y-3 pt-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                              Fitur Terpetakan ({features.filter((f) => f.selected).length}/{features.length})
                            </span>
                            <div className="flex items-center gap-1">
                              {(["ALL", "P0", "P1", "P2"] as const).map((p) => (
                                <button
                                  key={p}
                                  type="button"
                                  onClick={() => setPriorityFilter(p)}
                                  className={`px-2 py-0.5 text-[10px] rounded font-mono ${
                                    priorityFilter === p
                                      ? "bg-brand-500 text-white"
                                      : "bg-slate-800 text-slate-400"
                                  }`}
                                >
                                  {p}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                            {filteredFeatures.map((f) => (
                              <div
                                key={f.id}
                                onClick={() => toggleFeature(f.id)}
                                className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all flex items-start gap-2.5 ${
                                  f.selected
                                    ? "bg-slate-900/90 border-brand-500/40 text-slate-200"
                                    : "bg-slate-950/40 border-white/5 text-slate-500 opacity-60"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={Boolean(f.selected)}
                                  onChange={() => {}}
                                  className="mt-0.5 rounded border-white/20 bg-slate-800"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-slate-200">
                                      {f.title}
                                    </span>
                                    <span
                                      className={`text-[9px] font-mono px-1.5 py-0.2 rounded ${
                                        f.priority === "P0"
                                          ? "bg-emerald-500/20 text-emerald-300"
                                          : f.priority === "P1"
                                          ? "bg-amber-500/20 text-amber-300"
                                          : "bg-purple-500/20 text-purple-300"
                                      }`}
                                    >
                                      {f.priority}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    {f.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Tech Stack & Timeline */}
                      <div className="space-y-3 pt-2">
                        <div>
                          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                            Preferensi Tech Stack
                          </label>
                          <select
                            value={stack}
                            onChange={(e) => setStack(e.target.value)}
                            className="input-glass w-full px-3 py-2 rounded-lg text-xs appearance-none"
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
                            Target Timeline MVP
                          </label>
                          <div className="grid grid-cols-3 gap-2">
                            {["1-2 Minggu (Fast MVP)", "2-4 Minggu (Standar)", "1-2 Bulan (Lengkap)"].map((t) => (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setTimeline(t)}
                                className={`px-2 py-1.5 text-[10px] rounded-lg border text-center transition-all ${
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

                        {/* Tingkat Kedalaman PRD (Depth Mode) */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between mb-1.5">
                            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                              Tingkat Kedalaman Dokumen
                            </label>
                            <span className="text-[10px] text-brand-300 font-medium bg-brand-500/10 border border-brand-500/30 px-2 py-0.5 rounded-full">
                              🔥 Default: Ultra Deep
                            </span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setDepthLevel("ultra_deep")}
                              className={`p-2.5 rounded-xl border text-left transition-all relative ${
                                depthLevel === "ultra_deep"
                                  ? "bg-brand-500/15 border-brand-500 text-white shadow-glow"
                                  : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">🔬</span>
                                  <span className="text-xs font-bold text-slate-100">Ultra Deep Spec</span>
                                </div>
                                {depthLevel === "ultra_deep" && (
                                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                DDL SQL lengkap + RLS, Gherkin Given-When-Then, skema API JSON, edge case, race condition, & rule Claude Code.
                              </p>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDepthLevel("standard")}
                              className={`p-2.5 rounded-xl border text-left transition-all relative ${
                                depthLevel === "standard"
                                  ? "bg-brand-500/15 border-brand-500 text-white shadow-glow"
                                  : "bg-slate-900/50 border-white/5 text-slate-400 hover:text-slate-200"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-sm">⚡</span>
                                  <span className="text-xs font-bold text-slate-100">Standard PRD</span>
                                </div>
                                {depthLevel === "standard" && (
                                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                                )}
                              </div>
                              <p className="text-[10px] text-slate-400 mt-1 leading-relaxed">
                                Format padat & cepat, fokus spesifikasi fitur MVP esensial dan alur pengguna dasar.
                              </p>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Error Message */}
                      {status === "error" && (
                        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                          <svg className="w-4 h-4 shrink-0 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                          </svg>
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      {/* Main Action Generate Button */}
                      <button
                        type="button"
                        onClick={handleGeneratePRD}
                        disabled={status === "loading" || !nama.trim() || !ide.trim()}
                        className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-brand-500 via-indigo-600 to-brand-accent hover:from-brand-600 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-glow hover:shadow-glow-cyan transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {status === "loading" ? (
                          <>
                            <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>Menyusun PRD Padat & Terstruktur...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                            </svg>
                            <span>{status === "success" ? "Generate Ulang PRD" : "🚀 Generate Dokumen PRD"}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </section>

                  {/* Right Column: Output PRD Viewer (7 Cols) */}
                  <section className="xl:col-span-7">
                    {status === "idle" && !markdown && (
                      <div className="glass-panel rounded-2xl border border-white/10 p-10 min-h-[560px] flex flex-col items-center justify-center text-center max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-2xl bg-brand-500/15 border border-brand-500/25 flex items-center justify-center text-brand-400 mb-4 shadow-glow">
                          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                            <polyline points="14 2 14 8 20 8" />
                          </svg>
                        </div>
                        <h3 className="font-display font-semibold text-lg text-white mb-2">
                          Dokumen PRD Siap Dibuat
                        </h3>
                        <p className="text-xs text-slate-400 leading-relaxed mb-6">
                          Isi formulir di sebelah kiri atau pilih salah satu template inspirasi di Dashboard. Klik tombol Generate untuk menyusun dokumen lengkap berstandar industri.
                        </p>
                        {savedProjects.length > 0 && (
                          <button
                            type="button"
                            onClick={() => handleOpenProject(savedProjects[0])}
                            className="text-xs text-brand-400 hover:underline"
                          >
                            Atau buka kembali: {savedProjects[0].nama} →
                          </button>
                        )}
                      </div>
                    )}

                    {status === "loading" && (
                      <div className="glass-panel rounded-2xl border border-white/10 p-10 min-h-[560px] flex flex-col items-center justify-center text-center max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full border-4 border-t-brand-500 border-r-transparent border-b-brand-accent border-l-transparent animate-spin mb-6" />
                        <h4 className="font-display font-medium text-base text-white mb-2">
                          Menyusun PRD dengan {currentUser.plan === "pro" ? activeEngineMeta.name : "AI Engine"}...
                        </h4>
                        <p className="text-xs text-slate-400">
                          Memetakan user stories, skema tabel database, tabel acceptance criteria, dan instruksi prompt Cursor / Claude Code.
                        </p>
                      </div>
                    )}

                    {(status === "success" || markdown) && (
                      <PRDViewer
                        markdown={markdown}
                        nama={nama}
                        ide={ide}
                        stack={stack}
                        timeline={timeline}
                        aiSource={aiSource}
                        aiModel={aiModel}
                        onSaveToHistory={handleSaveCurrentProject}
                        isSaved={Boolean(activeProjectId)}
                        onShowToast={showToast}
                      />
                    )}
                  </section>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Right Chatbot Taskbar Panel (Konsultasi AI) */}
        {isChatbotOpen && (
          <aside className="w-80 sm:w-96 lg:w-[420px] border-l border-white/10 bg-slate-950/95 backdrop-blur-xl flex flex-col h-full shrink-0 z-40 shadow-2xl animate-in slide-in-from-right duration-200">
            <AIChatbotAssistant
              activeEngine={activeEngine}
              onApplyToForm={handleApplyFromChat}
              onClose={() => setIsChatbotOpen(false)}
              chatMode={chatMode}
              onChatModeChange={setChatMode}
              messages={chatMessages}
              onMessagesChange={setChatMessages}
              projectTitle={nama || (activeProjectId ? "Draft Proyek" : undefined)}
            />
          </aside>
        )}
      </div>

      {/* AI Engine Selection Modal */}
      <AIEngineModal
        isOpen={isEngineModalOpen}
        onClose={() => setIsEngineModalOpen(false)}
        activeEngine={activeEngine}
        onSelectEngine={handleSelectEngine}
      />

      {/* Logout Confirmation Modal */}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleLogoutCancel}
          />
          {/* Modal Card */}
          <div className="relative w-full max-w-sm mx-4 rounded-2xl bg-slate-900 border border-white/10 shadow-2xl p-6 animate-in fade-in zoom-in-95 duration-200">
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-14 h-14 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center">
                <svg className="w-7 h-7 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </div>
            </div>

            {/* Title & Description */}
            <h3 className="text-center text-white font-display font-semibold text-lg mb-1">
              Keluar dari Akun?
            </h3>
            <p className="text-center text-slate-400 text-sm mb-6 leading-relaxed">
              Sesi kerja Anda akan berakhir dan Anda akan kembali ke halaman login.
            </p>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleLogoutCancel}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium border border-white/10 transition-all disabled:opacity-50"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleLogoutConfirm}
                disabled={isLoggingOut}
                className="flex-1 py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium border border-rose-500/40 shadow-lg shadow-rose-500/20 transition-all disabled:opacity-70 flex items-center justify-center gap-2"
              >
                {isLoggingOut ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Keluar...</span>
                  </>
                ) : (
                  <span>Ya, Logout</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
