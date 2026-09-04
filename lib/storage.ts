import { SavedPRDProject, AIEngineOption } from "./types";

const STORAGE_KEY_PRD_LIST = "prd_architect_saved_projects_v2";
const STORAGE_KEY_AI_ENGINE = "prd_architect_active_engine_v2";

export const SAMPLE_MEDIBRIDGE_PRD: SavedPRDProject = {
  id: "medibridge-enterprise-seed",
  userId: "usr-admin-01", // Pro (Admin)
  nama: "MediBridge AI — Clinical EHR & Telemedicine Ecosystem",
  ide: "Platform enterprise SaaS terintegrasi untuk Rumah Sakit & Jaringan Faskes: Rekam Medis Elektronik (RME) berstandar Kemenkes SatuSehat FHIR v4.0, Telekonsultasi WebRTC E2EE, Asisten Triase Klinis AI (ICD-10/ICD-9-CM), E-Resep Farmasi Digital Terenkripsi, dan Automasi Bridging Klaim BPJS Kesehatan (V-Claim API).",
  category: "medis",
  target: "Direktur Medis & IT Rumah Sakit, Dokter Spesialis, Manajemen SIMRS, Apoteker, Pasien Rawat Jalan",
  stack: "Next.js 14 + Tailwind CSS + Supabase (PostgreSQL) + LiveKit WebRTC + Redis Upstash",
  timeline: "2-4 Minggu (Fokus MVP)",
  features: [
    {
      id: "f-1",
      title: "Integrasi Kemenkes SatuSehat FHIR v4.0",
      description: "Sinkronisasi otomatis rekam medis ke server Kemenkes SatuSehat sesuai regulasi Permenkes No. 24 Tahun 2022.",
      priority: "P0",
      category: "Compliance & Regulasi",
      selected: true,
    },
    {
      id: "f-2",
      title: "Telekonsultasi Audio-Video WebRTC E2EE",
      description: "Konsultasi medis jarak jauh dengan enkripsi end-to-end, live chat klinis, dan integrasi catatan SOAP.",
      priority: "P0",
      category: "Telehealth",
      selected: true,
    },
    {
      id: "f-3",
      title: "Smart Clinical Triage & ICD-10 Assistant",
      description: "Asisten AI untuk klasifikasi kegawatan pasien dan rekomendasi kode ICD-10/ICD-9 saat pengisian resep.",
      priority: "P0",
      category: "Clinical AI",
      selected: true,
    },
    {
      id: "f-4",
      title: "E-Prescription & Modul Farmasi Terenkripsi",
      description: "Resep digital dengan tanda tangan elektronik dokter tersertifikasi BSrE langsung ke instalasi farmasi.",
      priority: "P0",
      category: "Farmasi & Medis",
      selected: true,
    },
    {
      id: "f-5",
      title: "Bridging BPJS Kesehatan V-Claim & Antrean",
      description: "Verifikasi kepesertaan instan, penerbitan SEP otomatis, dan sinkronisasi antrean Mobile JKN.",
      priority: "P1",
      category: "Interoperabilitas",
      selected: true,
    },
    {
      id: "f-6",
      title: "Audit Trail UU PDP & Analitik Rumah Sakit",
      description: "Log akses medis tak dapat dimanipulasi (immutable audit logs) dan dashboard indikator BOR/LOS.",
      priority: "P2",
      category: "Security & Ops",
      selected: true,
    },
  ],
  markdown: `# PRD: MediBridge AI — Clinical EHR & Telemedicine Ecosystem
*Dokumen Kebutuhan Produk (Product Requirement Document) — Enterprise Clinical Standard v1.0 (MVP Ready)*
*Regulasi Kepatuhan: Permenkes No. 24 Tahun 2022 (RME) & UU Pelindungan Data Pribadi (UU PDP No. 27/2022)*

---

## 1. Ringkasan Eksekutif & Value Proposition
**MediBridge AI — Clinical EHR & Telemedicine Ecosystem** dirancang sebagai ekosistem digital terintegrasi untuk menjawab tantangan: *"Platform enterprise SaaS terintegrasi untuk Rumah Sakit & Jaringan Faskes: Rekam Medis Elektronik (RME) berstandar Kemenkes SatuSehat FHIR v4.0, Telekonsultasi WebRTC E2EE, Asisten Triase Klinis AI (ICD-10/ICD-9-CM), E-Resep Farmasi Digital Terenkripsi, dan Automasi Bridging Klaim BPJS Kesehatan (V-Claim API)."*.

Platform ini mengintegrasikan seluruh titik temu faskes: mulai dari registrasi & triase awal, konsultasi medis tatap muka maupun jarak jauh (telemedicine WebRTC low-latency), dokumentasi Rekam Medis Elektronik (RME) terakreditasi, e-resep farmasi terenkripsi, hingga sinkronisasi otomatis ke platform SatuSehat Kemenkes RI dan bridging BPJS Kesehatan (V-Claim API).

- **Visi Produk:** Menjadi tulang punggung digital operasional faskes yang menjamin keselamatan pasien (*patient safety*), efisiensi dokter, dan interoperabilitas data kesehatan nasional.
- **Value Proposition:** Memangkas waktu administratif tenaga medis hingga 50%, meniadakan entri data ganda (*zero double-entry*), serta menjamin kepatuhan regulasi hukum kesehatan nasional secara otomatis.

---

## 2. Target Persona & User Story

### Persona Utama
1. **dr. Farhan, Sp.PD (Dokter Spesialis Rawat Jalan)**
   - **Pain Points:** Terlalu banyak waktu terbuang untuk menulis dokumen fisik dan entri manual yang berulang di SIMRS & SatuSehat; kesulitan mencari riwayat alergi atau rekam medis pasien di masa lalu.
   - **Goals:** Antarmuka pencatatan SOAP cepat dengan auto-suggest diagnosa ICD-10/ICD-9, tombol langsung kirim e-resep ke instalasi farmasi, dan visualisasi riwayat vital pasien.

2. **Siti Nurhaliza (Pasien Rawat Jalan / Penyakit Kronis)**
   - **Pain Points:** Antrean rumah sakit yang memakan waktu berjam-jam hanya untuk konsultasi rutin dan penebusan obat; resep kertas sering hilang atau tidak terbaca.
   - **Goals:** Telekonsultasi berkualitas HD dari smartphone, antrean online transparan dengan perkiraan waktu panggil, resep digital langsung terverifikasi, dan opsi pembayaran aman (QRIS/BPJS).

3. **Budi Setiawan, S.Kom (Kepala SIMRS & Manajer Klaim Faskes)**
   - **Pain Points:** Penolakan klaim BPJS (fraud/berkas tidak lengkap) dan kegagalan sinkronisasi API SatuSehat Kemenkes yang mengancam akreditasi faskes.
   - **Goals:** Dashboard validasi SEP real-time, audit trail akses data medis pasien tanpa celah (immutable access logs), dan pipeline sinkronisasi FHIR otomatis dengan mekanisme retry cerdas.

---

## 3. Spesifikasi Fitur & Prioritas (MoSCoW)

| Prioritas | Modul | Fitur | Kriteria Penerimaan (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **P0** | Compliance & Regulasi | Integrasi Kemenkes SatuSehat FHIR v4.0 | Sinkronisasi resource Patient, Encounter, Condition, Medication, dan Observation sesuai regulasi Kemenkes. |
| **P0** | Telehealth | Telekonsultasi Audio-Video WebRTC E2EE | Ruang konsultasi video interaktif low-latency dengan fitur live chat, screen share, dan consent pasien. |
| **P0** | Clinical AI | Smart Clinical Triage & ICD-10 Coding Assistant | Analisis keluhan klinis berbasis AI untuk rekomendasi derajat triase kedaruratan dan auto-suggest kode ICD-10. |
| **P0** | Farmasi & Medis | E-Prescription & Modul Farmasi Terenkripsi | Penerbitan resep obat digital dengan tanda tangan elektronik dokter terintegrasi inventory apotek faskes. |
| **P1** | Interoperabilitas | Bridging BPJS Kesehatan V-Claim & Antrean Online | Verifikasi kepesertaan BPJS instan, auto-generate Surat Eligibilitas Peserta (SEP), dan antrean Mobile JKN. |
| **P2** | Security & Ops | Audit Trail UU PDP/HIPAA & Executive Hospital Analytics | Immutable access logs untuk kepatuhan perlindungan data pribadi dan dashboard indikator BOR, LOS, TOI RS. |

---

## 4. Arsitektur Informasi & Alur Halaman (Sitemap)

### 1. Portal Publik & Pasien
- \`/ (Landing Page)\`: Pengenalan faskes/layanan, profil dokter spesialis, jadwal poliklinik, dan tombol registrasi cepat.
- \`/login\` & \`/auth/verify-nik\`: Autentikasi aman terintegrasi verifikasi NIK dan OTP WhatsApp.
- \`/pasien/antrean\`: Status nomor antrean aktif secara real-time dengan audio-chime notifikasi.
- \`/pasien/telemed/[sessionId]\`: Ruang telekonsultasi interaktif WebRTC dengan enkripsi E2EE, countdown timer, dan media share.

---

## 5. Rancangan Skema Database (PostgreSQL / Supabase)

\`\`\`sql
-- 1. Master Patients Table
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ihs_number VARCHAR(64) UNIQUE,
  nik VARCHAR(16) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Clinical Encounters
CREATE TABLE clinical_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  satusehat_sync_status VARCHAR(32) DEFAULT 'pending',
  started_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

---

## 6. Prompt Siap Pakai untuk AI Coding Agent (Cursor / Claude Code)
\`\`\`markdown
Halo AI Assistant, kamu bertindak sebagai Principal Fullstack Engineer.
Bangun fondasi sistem "MediBridge AI" menggunakan Next.js 14, Tailwind CSS, dan Supabase PostgreSQL.
\`\`\``,
  model: "gemini-3.6-flash",
  source: "gemini",
  createdAt: "2026-09-04T09:00:00.000Z",
  updatedAt: "2026-09-04T09:00:00.000Z",
};

export const SAMPLE_KOPI_PRD: SavedPRDProject = {
  id: "kopi-nusantara-seed",
  userId: "usr-member-01", // Free (Member)
  nama: "Kopi Nusantara Hub — Self-Order & Loyalty System",
  ide: "Aplikasi pemesanan kopi online untuk kedai lokal. Pelanggan bisa melihat menu kopi spesial, pesan pickup/dine-in tanpa antre, bayar instan via QRIS, serta mengumpulkan poin loyalitas. Pemilik kedai memiliki dashboard kasir untuk pantau pesanan dapur.",
  category: "commerce",
  target: "Pencinta kopi usia 20-35 tahun, pekerja kantoran, dan mahasiswa",
  stack: "Next.js 14 + Tailwind CSS + Supabase (PostgreSQL)",
  timeline: "2-4 Minggu (Fokus MVP)",
  features: [
    {
      id: "f-kopi-1",
      title: "Menu Digital & QR Meja",
      description: "Pelanggan scan QR code di meja untuk melihat menu dan varian kopi.",
      priority: "P0",
      category: "Pemesanan",
      selected: true,
    },
    {
      id: "f-kopi-2",
      title: "Pembayaran Instan QRIS",
      description: "Integrasi payment gateway QRIS dinamis untuk checkout tanpa antre di kasir.",
      priority: "P0",
      category: "Pembayaran",
      selected: true,
    },
    {
      id: "f-kopi-3",
      title: "Dashboard Dapur / Barista",
      description: "Layar monitor pesanan masuk secara real-time dengan status antrean kopi.",
      priority: "P0",
      category: "Operasional",
      selected: true,
    },
    {
      id: "f-kopi-4",
      title: "Poin Loyalitas & Stempel Digital",
      description: "Kumpulkan 10 stempel digital untuk mendapatkan 1 cangkir kopi gratis.",
      priority: "P1",
      category: "Retensi",
      selected: true,
    },
  ],
  markdown: `# PRD: Kopi Nusantara Hub — Self-Order & Loyalty System

## 1. Ringkasan Eksekutif & Value Proposition
**Kopi Nusantara Hub** adalah platform pemesanan mandiri (self-order) dan loyalitas pelanggan untuk kedai kopi modern.
- **Visi:** Menghilangkan antrean kasir dan meningkatkan repeat order kedai kopi melalui pemesanan mandiri via scan QR dan sistem poin terintegrasi.
- **Masalah:** Antrean kasir panjang di jam sibuk dan hilangnya data retensi pelanggan setia.

## 2. Target Persona & User Story
- **Persona:** Pekerja kantoran yang ingin pesan kopi kilat sebelum masuk kantor.
- **User Story:** Sebagai pelanggan, saya ingin memesan kopi langsung dari meja lewat scan QR agar tidak perlu mengantre di depan kasir.

## 3. Spesifikasi Fitur (MoSCoW)
| Prioritas | Modul | Fitur | Kriteria Penerimaan |
| :--- | :--- | :--- | :--- |
| **P0** | Order | Menu Digital & Scan QR | Menampilkan daftar menu, varian susu/sugar level, dan keranjang belanja. |
| **P0** | Pembayaran | Integrasi QRIS Instan | Notifikasi webhook pembayaran berhasil dalam <3 detik. |
| **P0** | Dapur | Order Display Barista | Antrean tiket pesanan update otomatis tanpa refresh halaman. |
| **P1** | Retensi | Kartu Stempel Digital | Riwayat poin tersimpan aman per nomor WhatsApp pelanggan. |

## 4. Skema Database Ringkas
\`\`\`sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number VARCHAR(10) NOT NULL,
  total_amount NUMERIC NOT NULL,
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

## 5. Prompt Coding Agent
\`\`\`markdown
Bangun aplikasi self-order Kopi Nusantara Hub menggunakan Next.js 14, Tailwind CSS, dan Supabase PostgreSQL.
\`\`\``,
  model: "gemini-3.6-flash",
  source: "gemini",
  createdAt: "2026-09-04T09:15:00.000Z",
  updatedAt: "2026-09-04T09:15:00.000Z",
};

const DEFAULT_SEED_PROJECTS = [SAMPLE_MEDIBRIDGE_PRD, SAMPLE_KOPI_PRD];

export function loadSavedProjects(userId?: string): SavedPRDProject[] {
  if (typeof window === "undefined") {
    if (userId === "usr-member-01") return [SAMPLE_KOPI_PRD];
    return [SAMPLE_MEDIBRIDGE_PRD];
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRD_LIST);
    let allProjects: SavedPRDProject[];
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRD_LIST, JSON.stringify(DEFAULT_SEED_PROJECTS));
      allProjects = DEFAULT_SEED_PROJECTS;
    } else {
      allProjects = JSON.parse(raw);
    }

    if (!Array.isArray(allProjects) || allProjects.length === 0) {
      allProjects = DEFAULT_SEED_PROJECTS;
    }

    // Isolasi proyek berdasarkan userId akun yang sedang login!
    if (userId) {
      const userProjects = allProjects.filter((p) => {
        if (p.userId === userId) return true;
        // Map Admin Supabase ID (5288bcdc-e821-4276-bcef-9413d1d4261b) or usr-admin-01
        if (
          (userId === "5288bcdc-e821-4276-bcef-9413d1d4261b" || userId === "usr-admin-01") &&
          (p.userId === "5288bcdc-e821-4276-bcef-9413d1d4261b" || p.userId === "usr-admin-01")
        ) {
          return true;
        }
        // Map Member Supabase ID (f5e174aa-3d50-4446-8890-b63420cb06e0) or usr-member-01
        if (
          (userId === "f5e174aa-3d50-4446-8890-b63420cb06e0" || userId === "usr-member-01") &&
          (p.userId === "f5e174aa-3d50-4446-8890-b63420cb06e0" || p.userId === "usr-member-01")
        ) {
          return true;
        }
        return false;
      });
      return userProjects;
    }

    return allProjects;
  } catch (err) {
    console.warn("Gagal membaca saved projects dari localStorage:", err);
    return [SAMPLE_MEDIBRIDGE_PRD];
  }
}

export function saveProject(project: SavedPRDProject, userId?: string): SavedPRDProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRD_LIST);
    let allProjects: SavedPRDProject[] = raw ? JSON.parse(raw) : DEFAULT_SEED_PROJECTS;

    const projectWithUser: SavedPRDProject = {
      ...project,
      userId: userId || project.userId || "usr-admin-01",
    };

    const existingIndex = allProjects.findIndex((p) => p.id === project.id);
    let updatedAll: SavedPRDProject[];

    if (existingIndex >= 0) {
      updatedAll = [...allProjects];
      updatedAll[existingIndex] = {
        ...projectWithUser,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updatedAll = [
        {
          ...projectWithUser,
          createdAt: project.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...allProjects,
      ];
    }

    localStorage.setItem(STORAGE_KEY_PRD_LIST, JSON.stringify(updatedAll));

    // Kembalikan hanya project untuk user yang sedang aktif
    if (userId) {
      return updatedAll.filter((p) => p.userId === userId);
    }
    return updatedAll;
  } catch (err) {
    console.error("Gagal menyimpan project ke localStorage:", err);
    return [];
  }
}

export function deleteProject(id: string, userId?: string): SavedPRDProject[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRD_LIST);
    let allProjects: SavedPRDProject[] = raw ? JSON.parse(raw) : DEFAULT_SEED_PROJECTS;

    const filtered = allProjects.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PRD_LIST, JSON.stringify(filtered));

    if (userId) {
      return filtered.filter((p) => p.userId === userId);
    }
    return filtered;
  } catch (err) {
    console.error("Gagal menghapus project dari localStorage:", err);
    return [];
  }
}

export function loadActiveEngine(): AIEngineOption {
  if (typeof window === "undefined") return "gemini-3.6-flash";
  try {
    const val = localStorage.getItem(STORAGE_KEY_AI_ENGINE);
    if (val && ["gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-3.8-flash", "claude-3-5-sonnet", "fallback"].includes(val)) {
      return val as AIEngineOption;
    }
    return "gemini-3.6-flash";
  } catch {
    return "gemini-3.6-flash";
  }
}

export function saveActiveEngine(engine: AIEngineOption): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY_AI_ENGINE, engine);
  } catch (err) {
    console.warn("Gagal menyimpan active engine ke localStorage:", err);
  }
}
