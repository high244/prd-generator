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

export interface SavedChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  extracted?: {
    nama: string;
    ide: string;
    category: string;
    target: string;
    stack: string;
    timeline: string;
    features: FeatureItem[];
  };
  timestamp: string;
  discoveryDimension?: string | null;
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
  source: "gemini" | "claude" | "openrouter" | "fallback";
  depthLevel?: "standard" | "ultra_deep";
  chatHistory?: SavedChatMessage[];
  chatMode?: "quick" | "discovery";
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export type AIEngineOption =
  | "gemini-3.6-flash"
  | "gemini-3.1-flash-lite"
  | "gemini-3.8-flash"
  | "claude-3-5-sonnet"
  | "openrouter-claude-3.5-sonnet"
  | "openrouter-deepseek-r1"
  | "openrouter-gpt-4o"
  | "openrouter-llama-3.3-70b"
  | "fallback";

export interface AIEngineMeta {
  id: AIEngineOption;
  name: string;
  provider: "Google Gemini" | "Anthropic Claude" | "OpenRouter.ai" | "Smart Offline";
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
    id: "openrouter-claude-3.5-sonnet",
    name: "Claude 3.5 Sonnet (OpenRouter)",
    provider: "OpenRouter.ai",
    badge: "OpenRouter SOTA",
    description: "Model nomor 1 dunia untuk arsitektur software & PRD enterprise via gateway OpenRouter.",
  },
  {
    id: "openrouter-deepseek-r1",
    name: "DeepSeek R1 (OpenRouter)",
    provider: "OpenRouter.ai",
    badge: "Reasoning Jenius",
    description: "Model penalaran matematika & logika arsitektur tingkat tinggi dengan efisiensi biaya maksimal.",
  },
  {
    id: "openrouter-gpt-4o",
    name: "GPT-4o (OpenRouter)",
    provider: "OpenRouter.ai",
    badge: "OpenAI Flagship",
    description: "Model serbaguna tercanggih OpenAI untuk membedah kebutuhan produk end-to-end.",
  },
  {
    id: "openrouter-llama-3.3-70b",
    name: "Llama 3.3 70B (OpenRouter)",
    provider: "OpenRouter.ai",
    badge: "Open Source Power",
    description: "Model open-source terkuat Meta dengan latensi rendah dan pemahaman konteks luas.",
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
    name: "Claude 3.5 Sonnet (Direct)",
    provider: "Anthropic Claude",
    badge: "Direct Anthropic API",
    description: "Koneksi langsung ke Anthropic API resmi menggunakan ANTHROPIC_API_KEY.",
  },
  {
    id: "fallback",
    name: "Smart Architecture Engine",
    provider: "Smart Offline",
    badge: "Offline & Standalone",
    description: "Engine cerdas tanpa kuota atau API key eksternal. Selalu aktif dan siap pakai.",
  },
];
