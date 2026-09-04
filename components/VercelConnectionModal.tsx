"use client";

import { useState, useEffect } from "react";

interface VercelConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdated?: (connected: boolean) => void;
}

const ENV_VARIABLES = [
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    placeholder: "https://zsvsqekmcdrvyctqqmuo.supabase.co",
    description: "URL endpoint Supabase project (Client & Server)",
    source: "Supabase Dashboard -> Settings -> API -> Project URL",
    type: "supabase",
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    placeholder: "Ambil dari .env.local lokal Anda (anon / publishable key)",
    description: "Public Anon/Publishable Key Supabase untuk autentikasi browser",
    source: "Supabase Dashboard -> Settings -> API -> anon public",
    type: "supabase",
  },
  {
    key: "SUPABASE_SERVICE_ROLE_KEY",
    placeholder: "Ambil dari .env.local lokal Anda (service_role key)",
    description: "Service role key untuk operasi server terproteksi",
    source: "Supabase Dashboard -> Settings -> API -> service_role secret",
    type: "supabase",
  },
  {
    key: "GEMINI_API_KEY",
    placeholder: "Ambil dari .env.local lokal Anda (Gemini API key)",
    description: "Google Gemini API key untuk generator PRD & Chatbot",
    source: "aistudio.google.com -> Get API Key",
    type: "ai",
  },
  {
    key: "ANTHROPIC_API_KEY",
    placeholder: "Ambil dari .env.local lokal Anda (Claude API key)",
    description: "Anthropic Claude API key untuk model Claude Sonnet",
    source: "console.anthropic.com -> API Keys",
    type: "ai",
  },
];

const RAW_ENV_BLOCK = `# Salin langsung isi file .env.local dari komputer lokal Anda
# ke Vercel Settings -> Environment Variables.
#
# Variabel yang wajib diisi:
NEXT_PUBLIC_SUPABASE_URL=https://zsvsqekmcdrvyctqqmuo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<isi_dari_file_env_local_anda>
SUPABASE_SERVICE_ROLE_KEY=<isi_dari_file_env_local_anda>
GEMINI_API_KEY=<isi_dari_file_env_local_anda>
ANTHROPIC_API_KEY=<isi_dari_file_env_local_anda>`;

export default function VercelConnectionModal({
  isOpen,
  onClose,
  onStatusUpdated,
}: VercelConnectionModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [testResult, setTestResult] = useState<{
    tested: boolean;
    connected: boolean;
    host?: string;
    error?: string | null;
  }>({
    tested: false,
    connected: false,
  });

  const checkConnection = async () => {
    setIsChecking(true);
    try {
      const res = await fetch("/api/system-status");
      const data = await res.json();
      const isConn = data.supabase?.connected || false;
      setTestResult({
        tested: true,
        connected: isConn,
        host: data.supabase?.host || undefined,
        error: data.supabase?.error || null,
      });
      if (onStatusUpdated) {
        onStatusUpdated(isConn);
      }
    } catch {
      setTestResult({
        tested: true,
        connected: false,
        error: "Gagal menghubungi server untuk cek status",
      });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      checkConnection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  function copyText(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-white/15 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center font-bold text-sm shadow-md">
              ⚡
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">
                Hubungkan Supabase ke Vercel
              </h3>
              <p className="text-xs text-slate-400">
                Panduan konfigurasi Environment Variables agar Supabase aktif di Vercel
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 overflow-y-auto text-xs sm:text-sm">
          {/* Status Banner */}
          <div
            className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              testResult.connected
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-300"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${
                  testResult.connected ? "bg-emerald-400 animate-ping" : "bg-amber-400"
                }`}
              />
              <div>
                <div className="font-semibold text-white flex items-center gap-2">
                  <span>
                    {testResult.connected
                      ? "Supabase Berhasil Terhubung!"
                      : "Supabase Belum Terhubung di Environment Ini"}
                  </span>
                  {testResult.host && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-white/10 font-mono text-slate-300">
                      {testResult.host}
                    </span>
                  )}
                </div>
                <div className="text-xs opacity-90 mt-0.5">
                  {testResult.connected
                    ? "Koneksi database PostgreSQL, Auth, dan tabel PRD aktif normal."
                    : "File .env.local tidak di-upload ke GitHub demi keamanan. Anda perlu memasukkan variabel ini di Vercel Dashboard."}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={checkConnection}
              disabled={isChecking}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 disabled:opacity-50"
            >
              <svg
                className={`w-3.5 h-3.5 ${isChecking ? "animate-spin" : ""}`}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
              </svg>
              <span>{isChecking ? "Mengecek..." : "Cek Ulang Status"}</span>
            </button>
          </div>

          {/* Step By Step Guide */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <span>📋 3 Langkah Mudah Menghubungkan ke Vercel</span>
            </h4>

            <div className="grid grid-cols-1 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  1
                </span>
                <div>
                  <span className="font-semibold text-slate-200">
                    Buka Pengaturan Environment di Vercel:
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Kunjungi{" "}
                    <a
                      href="https://vercel.com/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-brand-400 underline hover:text-brand-300 inline-flex items-center gap-1"
                    >
                      vercel.com/dashboard
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                        <polyline points="15 3 21 3 21 9" />
                        <line x1="10" y1="14" x2="21" y2="3" />
                      </svg>
                    </a>{" "}
                    &rarr; pilih project <strong>prd-generator</strong> &rarr; buka tab <strong>Settings</strong> &rarr;{" "}
                    <strong>Environment Variables</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  2
                </span>
                <div>
                  <span className="font-semibold text-slate-200">
                    Copy & Paste Variabel di Bawah Ini:
                  </span>
                  <p className="text-slate-400 mt-0.5">
                    Klik tombol <strong>&quot;Salin Semua Variabel&quot;</strong> di bawah, lalu paste langsung ke kotak
                    input Vercel (Vercel otomatis memecahnya jadi key-value pair). Pastikan mencentang <em>Production</em>,{" "}
                    <em>Preview</em>, dan <em>Development</em>.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-white/5 flex gap-3 items-start">
                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 font-bold flex items-center justify-center shrink-0 text-xs">
                  3
                </span>
                <div>
                  <span className="font-semibold text-slate-200">Redeploy Project Anda di Vercel:</span>
                  <p className="text-slate-400 mt-0.5">
                    Buka tab <strong>Deployments</strong> di Vercel &rarr; klik menu titik tiga (<strong>...</strong>) di deployment
                    teratas &rarr; pilih <strong>Redeploy</strong>. Tunggu 1 menit, selesai! Supabase & AI langsung aktif!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Copy All Block */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-200">
                📦 Format Cepat (Salin Semua Sekaligus)
              </span>
              <button
                type="button"
                onClick={() => copyText(RAW_ENV_BLOCK, "all_env")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                  copiedKey === "all_env"
                    ? "bg-emerald-500 text-white"
                    : "bg-brand-500 hover:bg-brand-600 text-white"
                }`}
              >
                {copiedKey === "all_env" ? (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span>Tersalin ke Clipboard!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    <span>Salin Semua Variabel</span>
                  </>
                )}
              </button>
            </div>

            <pre className="p-3.5 bg-slate-950 rounded-xl border border-white/10 text-[11px] font-mono text-slate-300 overflow-x-auto select-all max-h-36">
              {RAW_ENV_BLOCK}
            </pre>
          </div>

          {/* Individual Key List */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <span className="text-xs font-semibold text-slate-300">
              🔑 Daftar Variabel Satuan:
            </span>
            <div className="space-y-2">
              {ENV_VARIABLES.map((item) => (
                <div
                  key={item.key}
                  className="p-2.5 rounded-xl bg-slate-950/60 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="truncate pr-2">
                    <div className="font-mono font-bold text-xs text-brand-300 flex items-center gap-2">
                      <span>{item.key}</span>
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-slate-400 font-sans font-normal">
                        {item.type === "supabase" ? "Database" : "AI"}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5 font-mono">
                      {item.placeholder}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Sumber: {item.source}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => copyText(item.key, item.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1 ${
                      copiedKey === item.key
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                        : "bg-white/5 hover:bg-white/15 text-slate-300 border border-white/10"
                    }`}
                  >
                    {copiedKey === item.key ? "Tersalin!" : "Salin Nama Key"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-white/10 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] text-slate-500">
            Project Ref: <span className="font-mono text-slate-400">zsvsqekmcdrvyctqqmuo</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
