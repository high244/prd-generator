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

// Key Sesi Pengguna di Browser
const AUTH_SESSION_KEY = "prd_architect_user_session_v2";

export async function loginWithPassword(
  emailOrUsername: string,
  pass: string
): Promise<{ user: UserProfile | null; error?: string }> {
  const cleanInput = emailOrUsername.trim().toLowerCase();
  const cleanPass = pass.trim();

  if (!cleanInput || !cleanPass) {
    return { user: null, error: "Email/Username dan Password wajib diisi." };
  }

  // Cek jika Supabase Client aktif
  if (!supabaseInstance) {
    return {
      user: null,
      error: "Layanan database Supabase belum terkonfigurasi.",
    };
  }

  try {
    let emailToUse = cleanInput;

    // Jika pengguna login menggunakan username (tanpa @), cari emailnya di database profiles
    if (!cleanInput.includes("@")) {
      try {
        const { data: profile } = await supabaseInstance
          .from("profiles")
          .select("email")
          .eq("username", cleanInput)
          .maybeSingle();

        if (profile?.email) {
          emailToUse = profile.email;
        } else {
          // Format email bawaan sistem jika username sesuai
          emailToUse =
            cleanInput === "admin"
              ? "admin@prdarchitect.com"
              : cleanInput === "member"
              ? "member@prdarchitect.com"
              : `${cleanInput}@prdarchitect.com`;
        }
      } catch {
        emailToUse = `${cleanInput}@prdarchitect.com`;
      }
    }

    // Autentikasi langsung ke database Supabase Auth
    const { data, error } = await supabaseInstance.auth.signInWithPassword({
      email: emailToUse,
      password: cleanPass,
    });

    if (error || !data.user) {
      return {
        user: null,
        error: "Username/Email atau Password salah. Silakan periksa kembali.",
      };
    }

    // Ambil data profil dari database public.profiles
    let dbProfile: any = null;
    try {
      const { data: p } = await supabaseInstance
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .maybeSingle();
      dbProfile = p;
    } catch {}

    const metadata = data.user.user_metadata || {};
    const role = dbProfile?.role || metadata.role || (emailToUse.includes("admin") ? "admin" : "member");
    const plan = dbProfile?.plan || metadata.plan || (role === "admin" ? "pro" : "free");
    const name = dbProfile?.name || metadata.name || (role === "admin" ? "Jonathan (Admin)" : "User Member");
    const username = dbProfile?.username || metadata.username || cleanInput;

    const userProfile: UserProfile = {
      id: data.user.id,
      email: data.user.email || emailToUse,
      name,
      username,
      phone: dbProfile?.phone || metadata.phone,
      organization: dbProfile?.organization || metadata.organization,
      role,
      plan,
    };

    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userProfile));
    }

    return { user: userProfile };
  } catch (sbErr: any) {
    console.warn("Supabase Auth sign-in failed:", sbErr);
    return {
      user: null,
      error: sbErr?.message || "Gagal menghubungi database otentikasi. Silakan periksa koneksi internet Anda.",
    };
  }
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
  input: RegisterNewUserData
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

  // Autentikasi pendaftaran ke database Supabase
  if (!supabaseInstance) {
    return {
      user: null,
      error: "Layanan database Supabase belum terkonfigurasi.",
    };
  }

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

    if (error || !data.user) {
      return { user: null, error: error?.message || "Pendaftaran gagal pada database Supabase." };
    }

    // Simpan ke tabel public.profiles di database
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
      // Abaikan jika trigger handle_new_user sudah mengeksekusi
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

    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userProfile));
    }
    return { user: userProfile };
  } catch (sbErr: any) {
    console.warn("Supabase Auth sign-up error:", sbErr);
    return { user: null, error: sbErr?.message || "Terjadi kesalahan saat mendaftarkan akun ke database." };
  }
}

export function getCurrentUserSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.user) return parsed.user;
    return parsed;
  } catch {
    return null;
  }
}

export function logoutUserSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(AUTH_SESSION_KEY);
    if (supabaseInstance) {
      supabaseInstance.auth.signOut().catch(() => {});
    }
  } catch (err) {
    console.warn("Logout error:", err);
  }
}
