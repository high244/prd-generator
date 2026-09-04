import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UserProfile } from "./types";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

let supabaseInstance: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith("http")) {
  try {
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  } catch (err) {
    console.warn("Inisialisasi Supabase client gagal:", err);
  }
}

export function getSupabase(): SupabaseClient | null {
  return supabaseInstance;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseInstance);
}

export function getSupabaseConfigInfo(): {
  isConfigured: boolean;
  hasUrl: boolean;
  hasAnonKey: boolean;
  urlHost?: string;
} {
  let urlHost: string | undefined;
  if (supabaseUrl) {
    try {
      urlHost = new URL(supabaseUrl).hostname;
    } catch {
      urlHost = supabaseUrl.replace(/https?:\/\//, "").split("/")[0];
    }
  }
  return {
    isConfigured: Boolean(supabaseInstance),
    hasUrl: Boolean(supabaseUrl),
    hasAnonKey: Boolean(supabaseAnonKey),
    urlHost,
  };
}

export async function checkSupabaseHealth(): Promise<{
  configured: boolean;
  connected: boolean;
  urlHost?: string;
  error?: string;
}> {
  const info = getSupabaseConfigInfo();
  if (!supabaseInstance) {
    return {
      configured: false,
      connected: false,
      error: "Variabel NEXT_PUBLIC_SUPABASE_URL atau NEXT_PUBLIC_SUPABASE_ANON_KEY belum diset di Vercel.",
    };
  }

  try {
    const { error } = await supabaseInstance.from("profiles").select("count").limit(1);
    if (error && error.code !== "PGRST116") {
      return {
        configured: true,
        connected: false,
        urlHost: info.urlHost,
        error: error.message,
      };
    }
    return {
      configured: true,
      connected: true,
      urlHost: info.urlHost,
    };
  } catch (err: any) {
    return {
      configured: true,
      connected: false,
      urlHost: info.urlHost,
      error: err?.message || "Koneksi ke Supabase gagal",
    };
  }
}

// Key Local Storage & Timeout Settings
export const AUTH_SESSION_KEY = "prd_architect_user_session_v2";
export const REGISTERED_USERS_KEY = "prd_architect_registered_users_v2";
export const SESSION_EXPIRED_KEY = "prd_architect_session_expired_notice";
export const DEFAULT_SESSION_TIMEOUT_MINUTES = 15;

export interface StoredSessionPayload {
  user: UserProfile;
  loginAt: number;
  lastActiveAt: number;
  timeoutMinutes: number;
}

// Akun Bawaan Sistem
export const SEED_ACCOUNTS = [
  {
    id: "usr-admin-01",
    email: "admin@prdarchitect.com",
    username: "admin",
    password: "admin123",
    name: "Jonathan (Admin)",
    role: "admin" as const,
    plan: "pro" as const,
  },
  {
    id: "usr-member-01",
    email: "member@prdarchitect.com",
    username: "member",
    password: "member123",
    name: "User Member",
    role: "member" as const,
    plan: "free" as const,
  },
];

function getStoredUsers() {
  if (typeof window === "undefined") return SEED_ACCOUNTS;
  try {
    const raw = localStorage.getItem(REGISTERED_USERS_KEY);
    if (!raw) {
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(SEED_ACCOUNTS));
      return SEED_ACCOUNTS;
    }
    return JSON.parse(raw);
  } catch {
    return SEED_ACCOUNTS;
  }
}

export function saveUserSession(
  user: UserProfile,
  timeoutMinutes: number = DEFAULT_SESSION_TIMEOUT_MINUTES
): void {
  if (typeof window === "undefined") return;
  const validMinutes = timeoutMinutes > 0 ? timeoutMinutes : DEFAULT_SESSION_TIMEOUT_MINUTES;
  const payload: StoredSessionPayload = {
    user,
    loginAt: Date.now(),
    lastActiveAt: Date.now(),
    timeoutMinutes: validMinutes,
  };
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(payload));
  // Hapus notice expired sebelumnya jika berhasil login baru
  localStorage.removeItem(SESSION_EXPIRED_KEY);
}

export function refreshUserSessionActivity(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.user) {
      parsed.lastActiveAt = Date.now();
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(parsed));
    }
  } catch {}
}

export function getSessionTimeoutMinutes(): number {
  if (typeof window === "undefined") return DEFAULT_SESSION_TIMEOUT_MINUTES;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return DEFAULT_SESSION_TIMEOUT_MINUTES;
    const parsed = JSON.parse(raw);
    return parsed?.timeoutMinutes || DEFAULT_SESSION_TIMEOUT_MINUTES;
  } catch {
    return DEFAULT_SESSION_TIMEOUT_MINUTES;
  }
}

export function getSessionRemainingSeconds(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.user) return 0;
    const timeoutMs = (parsed.timeoutMinutes || DEFAULT_SESSION_TIMEOUT_MINUTES) * 60 * 1000;
    const elapsed = Date.now() - (parsed.lastActiveAt || parsed.loginAt || Date.now());
    const remainingMs = timeoutMs - elapsed;
    return Math.max(0, Math.floor(remainingMs / 1000));
  } catch {
    return 0;
  }
}

export function getSessionExpiredNotice(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(SESSION_EXPIRED_KEY);
  } catch {
    return null;
  }
}

export function clearSessionExpiredNotice(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_EXPIRED_KEY);
  } catch {}
}

export async function loginWithPassword(
  emailOrUsername: string,
  pass: string,
  timeoutMinutes: number = DEFAULT_SESSION_TIMEOUT_MINUTES
): Promise<{ user: UserProfile | null; error?: string }> {
  const cleanInput = emailOrUsername.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanInput || !cleanPass) {
    return { user: null, error: "Email/Username dan Password wajib diisi." };
  }

  // 1. Cek jika Supabase Client aktif
  if (supabaseInstance) {
    try {
      const emailToUse = cleanInput.includes("@")
        ? cleanInput
        : cleanInput === "admin"
        ? "admin@prdarchitect.com"
        : cleanInput === "member"
        ? "member@prdarchitect.com"
        : `${cleanInput}@prdarchitect.com`;

      const { data, error } = await supabaseInstance.auth.signInWithPassword({
        email: emailToUse,
        password: cleanPass,
      });

      if (!error && data.user) {
        const metadata = data.user.user_metadata || {};
        const role = metadata.role || (emailToUse.includes("admin") ? "admin" : "member");
        const plan = metadata.plan || (role === "admin" ? "pro" : "free");

        const userProfile: UserProfile = {
          id: data.user.id,
          email: data.user.email || emailToUse,
          name: metadata.name || (role === "admin" ? "Jonathan (Admin)" : "User Member"),
          role,
          plan,
        };

        saveUserSession(userProfile, timeoutMinutes);
        return { user: userProfile };
      }
    } catch (sbErr) {
      console.warn("Supabase Auth sign-in failed, fallback to local database:", sbErr);
    }
  }

  // 2. Database Akun Terproteksi (Admin Pro & Member Free)
  const allUsers = getStoredUsers();
  const found = allUsers.find(
    (u: typeof SEED_ACCOUNTS[0]) =>
      (u.email.toLowerCase() === cleanInput || u.username.toLowerCase() === cleanInput) &&
      u.password === cleanPass
  );

  if (!found) {
    return {
      user: null,
      error: "Username/Email atau Password salah. Silakan coba kembali.",
    };
  }

  const userProfile: UserProfile = {
    id: found.id,
    email: found.email,
    name: found.name,
    role: found.role,
    plan: found.plan,
  };

  saveUserSession(userProfile, timeoutMinutes);
  return { user: userProfile };
}

export interface RegisterNewUserData {
  name: string;
  email: string;
  password: string;
  username?: string;
  phone?: string;
  organization?: string;
  role?: "admin" | "member";
}

export async function registerNewUser(
  input: RegisterNewUserData,
  timeoutMinutes: number = DEFAULT_SESSION_TIMEOUT_MINUTES
): Promise<{ user: UserProfile | null; error?: string }> {
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanPass = input.password.trim();
  const cleanName = input.name.trim();
  const cleanUsername = (input.username || cleanEmail.split("@")[0]).trim();
  const role = input.role || "member";
  const plan = role === "admin" ? "pro" : "free";

  if (!cleanEmail || !cleanPass || !cleanName) {
    return { user: null, error: "Nama, email, dan password wajib diisi." };
  }

  // 1. Coba daftar via Supabase jika terhubung
  if (supabaseInstance) {
    try {
      const { data, error } = await supabaseInstance.auth.signUp({
        email: cleanEmail,
        password: cleanPass,
        options: {
          data: {
            name: cleanName,
            username: cleanUsername,
            phone: input.phone,
            organization: input.organization,
            role,
            plan,
          },
        },
      });

      if (!error && data.user) {
        // Simpan ke tabel public.profiles
        try {
          await supabaseInstance.from("profiles").upsert({
            id: data.user.id,
            name: cleanName,
            username: cleanUsername,
            email: cleanEmail,
            phone: input.phone || null,
            organization: input.organization || null,
            role,
            plan,
          });
        } catch {
          // Abaikan jika trigger handle_new_user sudah handle
        }

        const userProfile: UserProfile = {
          id: data.user.id,
          email: cleanEmail,
          name: cleanName,
          username: cleanUsername,
          phone: input.phone,
          organization: input.organization,
          role,
          plan,
        };

        saveUserSession(userProfile, timeoutMinutes);
        return { user: userProfile };
      } else if (error) {
        return { user: null, error: error.message };
      }
    } catch (sbErr) {
      console.warn("Supabase Auth sign-up error, fallback to local database:", sbErr);
    }
  }

  // 2. Fallback ke database akun lokal
  const allUsers = getStoredUsers();
  if (allUsers.some((u: typeof SEED_ACCOUNTS[0]) => u.email.toLowerCase() === cleanEmail)) {
    return { user: null, error: "Email ini sudah terdaftar. Silakan gunakan email lain atau login." };
  }

  const newId = `usr-${Date.now()}`;
  const newUser = {
    id: newId,
    email: cleanEmail,
    username: cleanUsername,
    password: cleanPass,
    name: cleanName,
    phone: input.phone,
    organization: input.organization,
    role,
    plan,
  };

  const updated = [...allUsers, newUser];
  if (typeof window !== "undefined") {
    localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updated));
  }

  const userProfile: UserProfile = {
    id: newId,
    email: cleanEmail,
    name: cleanName,
    username: cleanUsername,
    phone: input.phone,
    organization: input.organization,
    role,
    plan,
  };

  saveUserSession(userProfile, timeoutMinutes);
  return { user: userProfile };
}

export function getCurrentUserSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);

    // Format StoredSessionPayload: { user, loginAt, lastActiveAt, timeoutMinutes }
    if (parsed && parsed.user) {
      const timeoutMinutes = parsed.timeoutMinutes || DEFAULT_SESSION_TIMEOUT_MINUTES;
      const timeoutMs = timeoutMinutes * 60 * 1000;
      const lastActive = parsed.lastActiveAt || parsed.loginAt || 0;
      const now = Date.now();

      if (now - lastActive > timeoutMs) {
        // Waktu habis! Sesi berakhir dan user harus login ulang (tidak boleh masuk dashboard)
        logoutUserSession(
          `Sesi Anda telah berakhir karena tidak ada aktivitas selama ${timeoutMinutes} menit. Silakan login kembali untuk masuk ke dashboard.`
        );
        return null;
      }

      return parsed.user;
    }

    // Format lama: langsung UserProfile (migrasikan ke format baru)
    if (parsed && parsed.id && parsed.email) {
      saveUserSession(parsed, DEFAULT_SESSION_TIMEOUT_MINUTES);
      return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

export function logoutUserSession(expiredReason?: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
    if (expiredReason) {
      localStorage.setItem(SESSION_EXPIRED_KEY, expiredReason);
    } else {
      localStorage.removeItem(SESSION_EXPIRED_KEY);
    }
    if (supabaseInstance) {
      supabaseInstance.auth.signOut().catch(() => {});
    }
  } catch (err) {
    console.warn("Logout error:", err);
  }
}
