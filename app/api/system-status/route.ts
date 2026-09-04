import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

export async function GET() {
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

  const geminiKey = process.env.GEMINI_API_KEY || "";
  const anthropicKey = process.env.ANTHROPIC_API_KEY || "";

  let supabaseConnected = false;
  let supabaseError: string | null = null;
  let host = "";

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const sb = createClient(supabaseUrl, supabaseAnonKey);
      const { error } = await sb.from("profiles").select("count").limit(1);
      if (!error || error.code === "PGRST116") {
        supabaseConnected = true;
      } else {
        supabaseError = error.message;
      }
      try {
        host = new URL(supabaseUrl).hostname;
      } catch {
        host = supabaseUrl;
      }
    } catch (err: any) {
      supabaseError = err?.message || "Koneksi gagal";
    }
  }

  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || "development",
    supabase: {
      configured: Boolean(supabaseUrl && supabaseAnonKey),
      connected: supabaseConnected,
      host: host || null,
      error: supabaseError,
      hasUrl: Boolean(supabaseUrl),
      hasAnonKey: Boolean(supabaseAnonKey),
    },
    ai: {
      geminiConfigured: Boolean(geminiKey),
      anthropicConfigured: Boolean(anthropicKey),
    },
  });
}
