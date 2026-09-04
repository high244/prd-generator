import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const plexSans = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-body",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "PRD Architect — AI-Powered Product Requirements Document Generator",
  description:
    "Ubah ide mentah menjadi Dokumen Kebutuhan Produk (PRD) berstandar industri dengan AI. Dilengkapi fitur discovery cerdas dan prompt siap pakai untuk Cursor / Claude Code.",
  keywords: ["PRD Generator", "Product Requirements Document", "Claude AI", "Cursor AI", "Software Architecture"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="id"
      className={`${fraunces.variable} ${plexSans.variable} ${plexMono.variable} dark`}
    >
      <body className="bg-ambient-pattern min-h-screen text-slate-100 antialiased selection:bg-brand-500/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
