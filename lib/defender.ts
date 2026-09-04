"use client";

/**
 * Web Defender Shield v3.2 — Sistem Proteksi Anti-Bot & Brute-Force
 * Melindungi form pendaftaran & autentikasi dari bot crawler, selenium, puppeteer, dan brute-force scripts.
 */

export interface DefenderCheckPayload {
  honeypotTrap?: string;
  secondaryTrap?: string;
  startTimeMs: number;
  interactionCount: number;
  challengeSolved: boolean;
}

export interface DefenderValidationResult {
  isAllowed: boolean;
  score: number; // 0 (pasti bot) - 100 (manusia valid)
  reason?: string;
  threatLevel: "AMANKAN" | "WASPADA" | "BLOKIR";
}

const MIN_HUMAN_INTERACTION_MS = 2500; // Minimal 2.5 detik untuk mengisi form lengkap
const RATE_LIMIT_WINDOW_MS = 3 * 60 * 1000; // 3 menit
const MAX_ATTEMPTS_PER_WINDOW = 5;

const STORAGE_KEY_RATE_LIMIT = "prd_architect_defender_rate_v1";

export function checkAutomatedDriver(): boolean {
  if (typeof window === "undefined") return false;
  // Deteksi headless browser / selenium / puppeteer
  const nav = window.navigator as unknown as { webdriver?: boolean; __webdriver_script_function?: unknown };
  if (nav.webdriver) return true;
  if ("__webdriver_script_function" in nav) return true;
  if (/HeadlessChrome|PhantomJS|Selenium|Puppeteer/i.test(navigator.userAgent)) return true;
  return false;
}

export function validateDefenderPayload(payload: DefenderCheckPayload): DefenderValidationResult {
  const now = Date.now();
  const elapsed = now - payload.startTimeMs;

  // 1. Cek Honeypot Trap (Kolom tersembunyi yang hanya diisi bot)
  if (payload.honeypotTrap && payload.honeypotTrap.trim().length > 0) {
    return {
      isAllowed: false,
      score: 0,
      reason: "Terdeteksi aktivitas bot otomatis (Honeypot Trap terpicu).",
      threatLevel: "BLOKIR",
    };
  }

  if (payload.secondaryTrap && payload.secondaryTrap.trim().length > 0) {
    return {
      isAllowed: false,
      score: 0,
      reason: "Terdeteksi pengisian skrip otomatis (Decoy field filled).",
      threatLevel: "BLOKIR",
    };
  }

  // 2. Cek Driver Otomatis (Selenium / Puppeteer / Headless)
  if (checkAutomatedDriver()) {
    return {
      isAllowed: false,
      score: 5,
      reason: "Sistem mendeteksi lingkungan browser otomatis (Headless Driver / Bot).",
      threatLevel: "BLOKIR",
    };
  }

  // 3. Cek Waktu Pengisian (Bot biasanya instan < 1 detik)
  if (elapsed < MIN_HUMAN_INTERACTION_MS) {
    return {
      isAllowed: false,
      score: 20,
      reason: `Waktu pengisian formulir terlalu instan (${(elapsed / 1000).toFixed(1)}s). Diperlukan verifikasi manual.`,
      threatLevel: "WASPADA",
    };
  }

  // 4. Cek Interaktivitas (Jumlah ketikan / pergerakan mouse / fokus)
  if (payload.interactionCount < 5) {
    return {
      isAllowed: false,
      score: 35,
      reason: "Aktivitas interaksi manusia tidak mencukupi standar keamanan.",
      threatLevel: "WASPADA",
    };
  }

  // 5. Cek Tantangan Verifikasi Manusia (Challenge Shield)
  if (!payload.challengeSolved) {
    return {
      isAllowed: false,
      score: 40,
      reason: "Selesaikan verifikasi Defender Shield ('Saya bukan robot') sebelum melanjutkan.",
      threatLevel: "WASPADA",
    };
  }

  // 6. Cek Rate Limiting (Mencegah spam pendaftaran masal)
  const isLimited = checkClientRateLimit();
  if (isLimited) {
    return {
      isAllowed: false,
      score: 10,
      reason: "Terlalu banyak percobaan dalam waktu singkat. Mohon tunggu 3 menit.",
      threatLevel: "BLOKIR",
    };
  }

  // Rekam percobaan
  recordRateLimitAttempt();

  return {
    isAllowed: true,
    score: 98,
    threatLevel: "AMANKAN",
  };
}

function checkClientRateLimit(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RATE_LIMIT);
    if (!raw) return false;
    const history: number[] = JSON.parse(raw);
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
    const recent = history.filter((ts) => ts > cutoff);
    return recent.length >= MAX_ATTEMPTS_PER_WINDOW;
  } catch {
    return false;
  }
}

function recordRateLimitAttempt(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RATE_LIMIT);
    const history: number[] = raw ? JSON.parse(raw) : [];
    const cutoff = Date.now() - RATE_LIMIT_WINDOW_MS;
    const recent = history.filter((ts) => ts > cutoff);
    recent.push(Date.now());
    localStorage.setItem(STORAGE_KEY_RATE_LIMIT, JSON.stringify(recent));
  } catch {
    // ignore
  }
}
