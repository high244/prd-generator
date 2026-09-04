# PRD Generator

Web app buat generate Product Requirement Document (PRD) dari ide website kamu, pakai Claude. Dibangun dengan Next.js (App Router) + TypeScript + Tailwind CSS.

## Cara kerja

1. Kamu isi form: nama website, ide & masalah, fitur utama, target pengguna, preferensi tech stack.
2. Form dikirim ke API route `/api/generate-prd` di server Next.js.
3. Server manggil Claude API pakai API key yang disimpan di environment variable (jadi API key **tidak pernah** kelihatan di browser).
4. Hasilnya (PRD dalam format Markdown) dikirim balik dan dirender di halaman.
5. Kamu bisa salin atau unduh PRD-nya sebagai file `.md`.

## Menjalankan di lokal

**Prasyarat:** Node.js 18 ke atas, dan API key dari Anthropic.

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ambil API key:
   - Buka [platform.claude.com](https://platform.claude.com), login atau bikin akun.
   - Masuk ke **Settings → API keys**, klik **Create key**, kasih nama, lalu salin key-nya (dimulai dengan `sk-ant-`). Key cuma ditampilkan sekali, jadi simpan baik-baik.
   - Tambahkan payment method di **Plans and Billing** kalau belum ada, biar API key-nya bisa dipakai.

3. Salin file environment variable:
   ```bash
   cp .env.local.example .env.local
   ```
   Buka `.env.local`, isi `ANTHROPIC_API_KEY` dengan key yang tadi kamu salin.

4. Jalankan development server:
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000) di browser.

## Deploy ke Vercel

Cara paling gampang buat deploy Next.js adalah lewat [Vercel](https://vercel.com) (dibuat oleh tim yang sama dengan Next.js).

**Lewat GitHub (rekomendasi):**

1. Push folder project ini ke repo GitHub baru.
2. Buka [vercel.com/new](https://vercel.com/new), login (bisa pakai akun GitHub), lalu pilih repo yang barusan kamu push.
3. Vercel otomatis mendeteksi ini project Next.js — biarkan pengaturan default.
4. Sebelum klik **Deploy**, buka bagian **Environment Variables**, tambahkan:
   - Key: `ANTHROPIC_API_KEY`
   - Value: API key kamu (`sk-ant-...`)
5. Klik **Deploy**. Tunggu beberapa menit, nanti dapat URL live seperti `nama-project.vercel.app`.

**Lewat CLI:**

```bash
npm install -g vercel
vercel login
vercel
vercel env add ANTHROPIC_API_KEY
vercel --prod
```

## Struktur project

```
app/
  layout.tsx              # root layout, font, metadata
  page.tsx                # halaman utama
  globals.css             # style global + Tailwind
  api/generate-prd/
    route.ts              # API route, manggil Claude API di server
components/
  PRDGenerator.tsx         # form + hasil PRD (client component)
lib/
  prompt.ts                # penyusun system/user prompt buat Claude
```

## Ganti model AI

Model yang dipakai diset di `app/api/generate-prd/route.ts`, di bagian `model: "claude-sonnet-5"`. Ganti sesuai kebutuhan (misalnya ke model Claude lain) — lihat daftar model terbaru di [docs.claude.com](https://docs.claude.com/en/docs/about-claude/models/overview).

## Catatan keamanan

- API key **hanya** disimpan di environment variable server, tidak pernah dikirim ke browser.
- Jangan commit file `.env.local` ke git (sudah masuk `.gitignore`).
- Kalau app ini bakal diakses publik, pertimbangkan tambah rate limiting di `app/api/generate-prd/route.ts` biar API key nggak kepakai berlebihan oleh orang lain.
