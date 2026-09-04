import { FeatureItem } from "./prompt";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  organization?: string;
  role: "admin" | "member";
  plan: "pro" | "free";
  createdAt?: string;
}

export interface SavedPRDProject {
  id: string;
  userId?: string; // Isolasi riwayat per akun
  nama: string;
  ide: string;
  category: string;
  target: string;
  stack: string;
  timeline: string;
  features: FeatureItem[];
  markdown: string;
  model: string;
  source: "gemini" | "claude" | "fallback";
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type AIEngineOption =
  | "gemini-3.6-flash"
  | "gemini-3.1-flash-lite"
  | "gemini-3.8-flash"
  | "claude-3-5-sonnet"
  | "fallback";

export interface AIEngineMeta {
  id: AIEngineOption;
  name: string;
  provider: "Google Gemini" | "Anthropic Claude" | "Smart Offline";
  badge: string;
  description: string;
  recommended?: boolean;
}

export const AI_ENGINE_OPTIONS: AIEngineMeta[] = [
  {
    id: "gemini-3.6-flash",
    name: "Gemini 3.6 Flash",
    provider: "Google Gemini",
    badge: "Super Cepat & Cerdas",
    description: "Model unggulan Google untuk analisis arsitektur, User Stories, dan skema database presisi.",
    recommended: true,
  },
  {
    id: "gemini-3.1-flash-lite",
    name: "Gemini 3.1 Flash-Lite",
    provider: "Google Gemini",
    badge: "Ultra Low Latency",
    description: "Kecepatan eksekusi kilat (<2.5 detik), cocok untuk brainstorming fitur instan.",
  },
  {
    id: "gemini-3.8-flash",
    name: "Gemini 3.8 Flash",
    provider: "Google Gemini",
    badge: "Eksperimental",
    description: "Model versi preview Google. Memiliki failover otomatis jika server sedang antre.",
  },
  {
    id: "claude-3-5-sonnet",
    name: "Claude 3.5 Sonnet",
    provider: "Anthropic Claude",
    badge: "State-of-the-Art",
    description: "Model penalaran mendalam dari Anthropic untuk spesifikasi sistem berskala besar.",
  },
  {
    id: "fallback",
    name: "Smart Architecture Engine",
    provider: "Smart Offline",
    badge: "Offline & Standalone",
    description: "Engine cerdas tanpa kuota atau API key eksternal. Selalu aktif dan siap pakai.",
  },
];
