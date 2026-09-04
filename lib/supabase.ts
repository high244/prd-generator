import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { UserProfile } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
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

// Key Local Storage
const AUTH_SESSION_KEY = "prd_architect_user_session_v2";
const REGISTERED_USERS_KEY = "prd_architect_registered_users_v2";

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

export async function loginWithPassword(
  emailOrUsername: string,
  pass: string
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

        if (typeof window !== "undefined") {
          localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userProfile));
        }
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

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userProfile));
  }

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
        // Simpan ke tabel public.user_profiles
        try {
          await supabaseInstance.from("user_profiles").upsert({
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
          // Abaikan jika tabel belum di-create manual
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

  if (typeof window !== "undefined") {
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify(userProfile));
  }

  return { user: userProfile };
}

export function getCurrentUserSession(): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
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
