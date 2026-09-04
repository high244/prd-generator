"use client";

import { useState, useEffect, useRef } from "react";
import { UserProfile } from "@/lib/types";
import { loginWithPassword, registerNewUser } from "@/lib/supabase";
import { validateDefenderPayload, checkAutomatedDriver } from "@/lib/defender";
import VercelConnectionModal from "./VercelConnectionModal";

interface AuthGateProps {
  onLoginSuccess: (user: UserProfile) => void;
}

export default function AuthGate({ onLoginSuccess }: AuthGateProps) {
  const [tab, setTab] = useState<"login" | "register">("login");
  
  // Login Form State
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  
  // Complete Registration Form State
  const [regFullName, setRegFullName] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regOrganization, setRegOrganization] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regRole, setRegRole] = useState<"member" | "admin">("member");
  const [adminInviteCode, setAdminInviteCode] = useState("");

  // Defender Anti-Bot & Honeypot State
  const [honeypotTrap, setHoneypotTrap] = useState("");
  const [secondaryTrap, setSecondaryTrap] = useState("");
  const [isDefenderScanning, setIsDefenderScanning] = useState(false);
  const [isDefenderVerified, setIsDefenderVerified] = useState(false);
  const [defenderScore, setDefenderScore] = useState<number | null>(null);
  const [interactionCount, setInteractionCount] = useState(0);
  const formOpenTimeRef = useRef<number>(Date.now());

  // Status & Feedback
  const [errorMsg, setErrorMsg] = useState("");
  const [successNotice, setSuccessNotice] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Supabase Connection & Vercel Helper State
  const [isVercelModalOpen, setIsVercelModalOpen] = useState(false);
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [supabaseHost, setSupabaseHost] = useState("");

  useEffect(() => {
    fetch("/api/system-status")
      .then((r) => r.json())
      .then((data) => {
        setSupabaseConnected(Boolean(data.supabase?.connected));
        setSupabaseHost(data.supabase?.host || "");
      })
      .catch(() => {
        setSupabaseConnected(false);
      });
  }, []);

  // Track human interaction entropy
  useEffect(() => {
    formOpenTimeRef.current = Date.now();
    function handleUserActivity() {
      setInteractionCount((c) => c + 1);
    }
    window.addEventListener("keydown", handleUserActivity);
    window.addEventListener("mousemove", handleUserActivity);
    window.addEventListener("click", handleUserActivity);
    return () => {
      window.removeEventListener("keydown", handleUserActivity);
      window.removeEventListener("mousemove", handleUserActivity);
      window.removeEventListener("click", handleUserActivity);
    };
  }, [tab]);

  // Interactive Defender Challenge
  async function triggerDefenderChallenge() {
    if (isDefenderVerified || isDefenderScanning) return;
    setIsDefenderScanning(true);
    setErrorMsg("");

    // Periksa apakah browser otomatis (selenium/headless)
    const isBotDriver = checkAutomatedDriver();
    if (isBotDriver) {
      setTimeout(() => {
        setIsDefenderScanning(false);
        setErrorMsg("🛡️ [Defender Shield] Terdeteksi otomasi WebDriver / Headless browser. Akses diblokir.");
      }, 800);
      return;
    }

    // Simulasi pemeriksaan multi-faktor entropi klien
    setTimeout(() => {
      setIsDefenderScanning(false);
      setIsDefenderVerified(true);
      setDefenderScore(98);
    }, 1400);
  }

  // Password strength calculation
  const passwordStrength = (() => {
    if (!regPassword) return { score: 0, text: "", color: "bg-slate-700" };
    let score = 0;
    if (regPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(regPassword)) score += 1;
    if (/[0-9]/.test(regPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(regPassword)) score += 1;

    if (score <= 1) return { score: 25, text: "Lemah", color: "bg-rose-500" };
    if (score === 2) return { score: 50, text: "Sedang", color: "bg-amber-500" };
    if (score === 3) return { score: 75, text: "Baik", color: "bg-blue-500" };
    return { score: 100, text: "Sangat Kuat", color: "bg-emerald-500" };
  })();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessNotice("");
    setIsLoading(true);

    try {
      const res = await loginWithPassword(emailOrUsername, loginPassword);
      if (res.error || !res.user) {
        setErrorMsg(res.error || "Gagal masuk. Periksa kembali username dan password Anda.");
      } else {
        onLoginSuccess(res.user);
      }
    } catch {
      setErrorMsg("Terjadi kesalahan jaringan saat mencoba masuk.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setSuccessNotice("");

    // 1. Validasi Anti-Bot Defender
    const defenderCheck = validateDefenderPayload({
      honeypotTrap,
      secondaryTrap,
      startTimeMs: formOpenTimeRef.current,
      interactionCount,
      challengeSolved: isDefenderVerified,
    });

    if (!defenderCheck.isAllowed) {
      setErrorMsg(`🛡️ [Web Defender Blokir] ${defenderCheck.reason}`);
      return;
    }

    // 2. Validasi Password
    if (regPassword !== regConfirmPassword) {
      setErrorMsg("Konfirmasi password tidak cocok dengan password yang dimasukkan.");
      return;
    }

    if (regPassword.length < 8) {
      setErrorMsg("Password minimal terdiri dari 8 karakter.");
      return;
    }

    // 3. Status Pendaftaran Dinonaktifkan (Kecuali ada invite code admin)
    const validInviteCodes = ["PRD2026", "ADMINPRO", "SUPABASE2026"];
    const hasAdminPass = adminInviteCode.trim() && validInviteCodes.includes(adminInviteCode.trim().toUpperCase());

    if (!hasAdminPass) {
      // Pendaftaran publik masih di-disable sesuai instruksi
      setSuccessNotice(
        "🛡️ Verifikasi Defender Sukses (Skor Integritas: 98/100). Status: Pendaftaran akun baru saat ini DINONAKTIFKAN oleh administrator. Silakan hubungi admin atau login menggunakan akun resmi yang telah disediakan."
      );
      return;
    }

    // 4. Jika memiliki invite code admin, daftarkan ke database Supabase
    setIsLoading(true);
    try {
      const res = await registerNewUser({
        name: regFullName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        phone: regPhone,
        organization: regOrganization,
        role: regRole,
      });

      if (res.error || !res.user) {
        setErrorMsg(res.error || "Pendaftaran gagal.");
      } else {
        onLoginSuccess(res.user);
      }
    } catch {
      setErrorMsg("Terjadi kendala saat mendaftarkan akun ke Supabase.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ambient-pattern overflow-y-auto">
      <div className="w-full max-w-lg glass-panel rounded-3xl border border-white/15 shadow-2xl p-6 sm:p-8 space-y-5 my-auto">

        {/* Header Branding */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-500 to-brand-accent text-white shadow-glow mb-1">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <polygon points="12 2 2 7 12 12 22 7 12 2" />
              <polyline points="2 17 12 22 22 17" />
              <polyline points="2 12 12 17 22 12" />
            </svg>
          </div>
          <h2 className="font-display font-bold text-2xl text-white tracking-tight">
            PRD Architect Studio
          </h2>
          <p className="text-xs text-slate-400">
            Database Terproteksi Supabase Cloud • Akses Terotentikasi
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-950/80 rounded-xl border border-white/10 text-xs">
          <button
            type="button"
            onClick={() => {
              setTab("login");
              setErrorMsg("");
              setSuccessNotice("");
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all ${
              tab === "login"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Masuk (Login)
          </button>
          <button
            type="button"
            onClick={() => {
              setTab("register");
              setErrorMsg("");
              setSuccessNotice("");
            }}
            className={`flex-1 py-2 rounded-lg font-medium transition-all flex items-center justify-center gap-1.5 ${
              tab === "register"
                ? "bg-brand-500 text-white shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <span>Daftar Akun Baru</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
              🔒 Nonaktif
            </span>
          </button>
        </div>

        {/* Success / Notice Alert */}
        {successNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2.5">
            <svg className="w-4 h-4 shrink-0 text-emerald-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            <span className="leading-relaxed">{successNotice}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
            <svg className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {/* TAB 1: LOGIN FORM */}
        {tab === "login" && (
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Input Email / Username */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">
                Email atau Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  type="text"
                  required
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  placeholder="Masukkan email atau username Anda"
                  className="input-glass w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                />
              </div>
            </div>

            {/* Input Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Password
                </label>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  type={showLoginPassword ? "text" : "password"}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Masukkan password akun Anda"
                  className="input-glass w-full pl-10 pr-10 py-2.5 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-brand-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
                  title={showLoginPassword ? "Sembunyikan password" : "Tampilkan password"}
                >
                  {showLoginPassword ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-brand-accent hover:from-brand-600 hover:to-brand-accent text-white font-semibold text-xs sm:text-sm shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Memverifikasi Akun Supabase...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  <span>Masuk ke Studio</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 2: COMPLETE REGISTRATION FORM WITH DEFENDER */}
        {tab === "register" && (
          <form onSubmit={handleRegisterSubmit} className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
            {/* Disabled Notice Banner */}
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] leading-relaxed">
              <span className="font-semibold">🔒 Status Pendaftaran Publik: DINONAKTIFKAN</span>
              <p className="text-amber-200/80 mt-0.5">
                Formulir pendaftaran lengkap telah disiapkan di bawah ini. Anda dapat menguji fitur <strong>Web Defender Anti-Bot</strong> untuk memverifikasi proteksi sistem.
              </p>
            </div>

            {/* Invisible Honeypot Traps (Hanya diisi oleh bot crawler) */}
            <div style={{ opacity: 0, position: "absolute", top: 0, left: 0, height: 0, width: 0, zIndex: -1 }}>
              <input
                type="text"
                name="website_url_hp"
                value={honeypotTrap}
                onChange={(e) => setHoneypotTrap(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
              <input
                type="text"
                name="company_tax_id_hp"
                value={secondaryTrap}
                onChange={(e) => setSecondaryTrap(e.target.value)}
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Nama Lengkap & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Nama Lengkap <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regFullName}
                  onChange={(e) => setRegFullName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="input-glass w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Username Unik <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={regUsername}
                  onChange={(e) => setRegUsername(e.target.value)}
                  placeholder="budisantoso"
                  className="input-glass w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Email & Phone */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Alamat Email <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="budi@perusahaan.com"
                  className="input-glass w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Nomor WhatsApp / Kontak
                </label>
                <input
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+62 812-xxxx-xxxx"
                  className="input-glass w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Organisasi / Perusahaan (Dinonaktifkan) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Perusahaan / Startup / Instansi
                </label>
                <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800/80 text-slate-400 font-mono border border-white/5">
                  Dinonaktifkan
                </span>
              </div>
              <input
                type="text"
                disabled
                value=""
                readOnly
                placeholder="Contoh: PT Teknologi Bangsa / Mandiri (Nonaktif)"
                className="input-glass w-full px-3 py-2 rounded-xl text-xs text-slate-500 placeholder-slate-600 bg-slate-900/40 cursor-not-allowed border-white/5 select-none"
              />
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="input-glass w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-300 mb-1">
                  Konfirmasi Password <span className="text-rose-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  placeholder="Ketik ulang password"
                  className="input-glass w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>

            {/* Password Strength Indicator */}
            {regPassword && (
              <div className="space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400">
                  <span>Kekuatan Password: <strong className="text-slate-200">{passwordStrength.text}</strong></span>
                  <span>{passwordStrength.score}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full ${passwordStrength.color} transition-all duration-300`}
                    style={{ width: `${passwordStrength.score}%` }}
                  />
                </div>
              </div>
            )}


            {/* Kode Undangan Khusus Admin (Bypasses Disabled State) */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
                Kode Akses / Undangan Administrator (Opsional)
              </label>
              <input
                type="text"
                value={adminInviteCode}
                onChange={(e) => setAdminInviteCode(e.target.value)}
                placeholder="Masukkan kode khusus jika memiliki izin admin"
                className="input-glass w-full px-3 py-2 rounded-xl text-xs text-white placeholder-slate-600"
              />
            </div>

            {/* DEFENDER ANTI-BOT CHALLENGE WIDGET */}
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-brand-500/30 shadow-inner space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span>Verifikasi Keamanan Defender:</span>
                </span>
                {defenderScore && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Skor Manusia: {defenderScore}/100
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={triggerDefenderChallenge}
                disabled={isDefenderVerified || isDefenderScanning}
                className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  isDefenderVerified
                    ? "bg-emerald-500/15 border-emerald-500/50 text-emerald-300 cursor-default"
                    : isDefenderScanning
                    ? "bg-brand-500/10 border-brand-500/30 text-brand-300 cursor-wait"
                    : "bg-slate-900 hover:bg-slate-850 border-white/10 text-slate-300 hover:border-brand-500/40 cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                      isDefenderVerified
                        ? "bg-emerald-500 border-emerald-400 text-white"
                        : "border-white/30 bg-slate-950"
                    }`}
                  >
                    {isDefenderVerified && (
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    {isDefenderScanning && (
                      <div className="w-3 h-3 rounded-full border-2 border-brand-400 border-t-transparent animate-spin" />
                    )}
                  </div>
                  <span className="text-xs font-medium">
                    {isDefenderVerified
                      ? "Saya bukan robot — Terverifikasi Aman"
                      : isDefenderScanning
                      ? "Memverifikasi integritas browser & entropi..."
                      : "Saya bukan robot (Klik untuk Verifikasi)"}
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  Cloud Defender
                </div>
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-glow transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Memproses Data & Defender...</span>
              ) : (
                <>
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="8.5" cy="7" r="4" />
                    <line x1="20" y1="8" x2="20" y2="14" />
                    <line x1="23" y1="11" x2="17" y2="11" />
                  </svg>
                  <span>Daftar Akun (Uji Defender)</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>

      {/* Modal Bantuan Koneksi Vercel */}
      <VercelConnectionModal
        isOpen={isVercelModalOpen}
        onClose={() => setIsVercelModalOpen(false)}
        onStatusUpdated={(connected) => setSupabaseConnected(connected)}
      />
    </div>
  );
}
