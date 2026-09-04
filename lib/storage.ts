import { SavedPRDProject, AIEngineOption } from "./types";

const STORAGE_KEY_PRD_LIST = "prd_architect_saved_projects_v2";
const STORAGE_KEY_AI_ENGINE = "prd_architect_active_engine_v2";

export const SAMPLE_MEDIBRIDGE_PRD: SavedPRDProject = {
  id: "medibridge-enterprise-seed",
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

### User Stories Kunci
- *Sebagai dokter spesialis*, saya ingin sistem memberikan rekomendasi kode ICD-10 otomatis saat saya mengetikkan diagnosis klinis sehingga saya dapat menyelesaikan pengisian form rekam medis dalam waktu kurang dari 2 menit.
- *Sebagai pasien*, saya ingin bergabung ke sesi telekonsultasi terenkripsi melalui satu klik link tanpa perlu install aplikasi rumit sehingga saya dapat berkonsultasi tepat waktu.
- *Sebagai apoteker faskes*, saya ingin menerima resep digital yang telah dibubuhi tanda tangan elektronik tersertifikasi (BSrE) sehingga obat dapat segera disiapkan tanpa risiko salah baca resep manual.
- *Sebagai staf IT faskes*, saya ingin seluruh encounter pasien otomatis diubah ke payload FHIR JSON dan terkirim ke server Kemenkes SatuSehat dengan status keberhasilan tercatat di log audit.

---

## 3. Spesifikasi Fitur & Prioritas (MoSCoW)

| Prioritas | Modul | Fitur | Kriteria Penerimaan (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
| **P0** | Compliance & Regulasi | Integrasi Kemenkes SatuSehat FHIR v4.0 | Sinkronisasi resource Patient, Encounter, Condition, Medication, dan Observation sesuai regulasi Kemenkes. |
| **P0** | Telehealth | Telekonsultasi Audio-Video WebRTC E2EE | Ruang konsultasi video interaktif low-latency dengan fitur live chat, screen share, dan consent pasien. |
| **P0** | Clinical AI | Smart Clinical Triage & ICD-10 Coding Assistant | Analisis keluhan klinis berbasis AI untuk rekomendasi derajat triase kedaruratan dan auto-suggest kode ICD-10. |
| **P0** | Farmasi & Medis | E-Prescription & Modul Farmasi Terenkripsi | Penerbitan resep obat digital dengan tanda tangan elektronik dokter terintegrasi inventory apotek faskes. |
| **P1** | Interoperabilitas | Bridging BPJS Kesehatan V-Claim & Antrean Online | Verifikasi kepesertaan BPJS instan, auto-generate Surat Eligibilitas Peserta (SEP), dan antrean Mobile JKN. |
| **P1** | Financial Ops | Multi-Channel Payment Gateway & Billing Split | Pembayaran terotomasi via QRIS, Virtual Account, dan asuransi swasta dengan kalkulasi fee jasa medis. |
| **P2** | Security & Ops | Audit Trail UU PDP/HIPAA & Executive Hospital Analytics | Immutable access logs untuk kepatuhan perlindungan data pribadi dan dashboard indikator BOR, LOS, TOI RS. |

---

## 4. Arsitektur Informasi & Alur Halaman (Sitemap)

### 1. Portal Publik & Pasien
- \`/ (Landing Page)\`: Pengenalan faskes/layanan, profil dokter spesialis, jadwal poliklinik, dan tombol registrasi cepat.
- \`/login\` & \`/auth/verify-nik\`: Autentikasi aman terintegrasi verifikasi NIK dan OTP WhatsApp.
- \`/pasien/antrean\`: Status nomor antrean aktif secara real-time dengan audio-chime notifikasi.
- \`/pasien/telemed/[sessionId]\`: Ruang telekonsultasi interaktif WebRTC dengan enkripsi E2EE, countdown timer, dan media share.
- \`/pasien/rekam-medis\`: Riwayat resume medis, hasil laboratorium, dan QR-code e-resep farmasi.

### 2. Portal Klinis & Tenaga Medis (Dokter & Perawat)
- \`/klinik/triase\`: Dashboard penerimaan pasien IGD & Rawat Jalan dengan kalkulasi scoring kegawatan AI (ESI Score).
- \`/klinik/konsultasi/[encounterId]\`: Workspace SOAP interaktif (Subjective, Objective, Assessment, Plan), integrasi auto-complete ICD-10, dan pad e-resep.
- \`/farmasi/dispensing\`: Antrean resep obat masuk, verifikasi interaksi obat (drug-drug interaction warning), dan status penyerahan.

### 3. Portal Administrasi & SIMRS Back-Office
- \`/admin/satusehat-bridge\`: Monitoring pipeline pengiriman data HL7 FHIR ke Kemenkes, retry queue, dan log status HTTP.
- \`/admin/bpjs-vclaim\`: Monitoring pembuatan SEP, validasi klaim INA-CBGs, dan rekonsiliasi pembayaran.
- \`/admin/audit-log\`: Catatan akses riwayat medis yang tidak dapat dihapus (*immutable log*) sesuai UU PDP.

---

## 5. Rancangan Skema Database (PostgreSQL / Supabase)

\`\`\`sql
-- 1. Master Patients Table (Terintegrasi Kemenkes SatuSehat)
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ihs_number VARCHAR(64) UNIQUE, -- Nomor IHS resmi Kemenkes
  nik VARCHAR(16) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  birth_date DATE NOT NULL,
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  phone_number VARCHAR(20) NOT NULL,
  blood_type VARCHAR(5),
  allergies JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Medical Practitioners (Dokter & Nakes)
CREATE TABLE practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ihs_practitioner_id VARCHAR(64) UNIQUE,
  str_number VARCHAR(64) NOT NULL,
  sip_number VARCHAR(64) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  specialization VARCHAR(100) NOT NULL,
  digital_signature_cert_id VARCHAR(128),
  is_active BOOLEAN DEFAULT TRUE
);

-- 3. Clinical Encounters (Kunjungan Medis & SatuSehat Mapping)
CREATE TABLE clinical_encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
  practitioner_id UUID NOT NULL REFERENCES practitioners(id),
  encounter_type VARCHAR(32) NOT NULL CHECK (encounter_type IN ('inpatient', 'outpatient', 'telemedicine', 'emergency')),
  status VARCHAR(32) NOT NULL DEFAULT 'in-progress' CHECK (status IN ('planned', 'in-progress', 'finished', 'cancelled')),
  satusehat_encounter_id VARCHAR(128),
  satusehat_sync_status VARCHAR(32) DEFAULT 'pending' CHECK (satusehat_sync_status IN ('pending', 'synced', 'failed')),
  bpjs_sep_number VARCHAR(64),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);
\`\`\`

---

## 6. Arsitektur Teknis & Tech Stack Rationale
- **Frontend App:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Database & Backend:** Supabase (Managed PostgreSQL) + Row Level Security (RLS)
- **Telemedicine Engine:** LiveKit Cloud (WebRTC SFU dengan sub-100ms latency & E2EE)
- **Job Queue & Caching:** Upstash Redis + BullMQ (Penjadwalan sinkronisasi SatuSehat Kemenkes)
- **AI Assist:** Google Gemini API untuk asisten ICD-10 dan peringatan interaksi obat

---

## 7. Keamanan & Kebutuhan Non-Fungsional (NFR)
- **Enkripsi Data:** AES-256 pada database volume dan TLS 1.3 pada transmisi jaringan.
- **Kepatuhan Regulasi:** UU Perlindungan Data Pribadi (UU PDP No. 27/2022) & Permenkes No. 24/2022.
- **Uptime SLA:** Minimal 99.95% ketersediaan layanan sistem rumah sakit.

---

## 8. Roadmap Peluncuran MVP (3 Milestones)
- **Milestone 1 (Minggu 1-2):** Fondasi Autentikasi NIK, Database Pasien, & Integrasi SatuSehat Auth.
- **Milestone 2 (Minggu 3-4):** Modul Rekam Medis SOAP Dokter, E-Prescription, & Telemed LiveKit.
- **Milestone 3 (Minggu 5):** Bridging BPJS V-Claim, Uji Beban, dan Simulasi Audit Kemenkes.

---

## 9. Metrik Keberhasilan (KPIs)
- **Waktu Input Medis SOAP:** Turun dari rata-rata 7 menit menjadi < 2 menit per pasien.
- **Tingkat Sinkronisasi SatuSehat:** 99.8% transaksi FHIR berhasil terkirim tanpa kegagalan unhandled.
- **Kepatuhan E-Prescription:** 100% resep terverifikasi tanda tangan digital sah.

---

## 10. Prompt Siap Pakai untuk AI Coding Agent (Cursor / Claude Code)
\`\`\`markdown
Halo AI Assistant, kamu bertindak sebagai Principal Fullstack Engineer.
Bangun fondasi sistem "MediBridge AI" menggunakan Next.js 14 (App Router), TypeScript, Tailwind CSS, dan Supabase PostgreSQL.
1. Siapkan tabel patients, practitioners, dan clinical_encounters dengan RLS aktif.
2. Buat REST endpoint /api/satusehat/encounter untuk validasi payload HL7 FHIR v4.0.
3. Buat antarmuka SOAP sederhana di /klinik/konsultasi/[encounterId] dengan fitur pencarian ICD-10.
\`\`\``,
  model: "gemini-3.6-flash",
  source: "gemini",
  createdAt: "2026-09-04T09:00:00.000Z",
  updatedAt: "2026-09-04T09:00:00.000Z",
};

export function loadSavedProjects(): SavedPRDProject[] {
  if (typeof window === "undefined") return [SAMPLE_MEDIBRIDGE_PRD];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRD_LIST);
    if (!raw) {
      // Inisialisasi dengan proyek template awal
      localStorage.setItem(STORAGE_KEY_PRD_LIST, JSON.stringify([SAMPLE_MEDIBRIDGE_PRD]));
      return [SAMPLE_MEDIBRIDGE_PRD];
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [SAMPLE_MEDIBRIDGE_PRD];
    }
    return parsed;
  } catch (err) {
    console.warn("Gagal membaca saved projects dari localStorage:", err);
    return [SAMPLE_MEDIBRIDGE_PRD];
  }
}

export function saveProject(project: SavedPRDProject): SavedPRDProject[] {
  if (typeof window === "undefined") return [];
  try {
    const current = loadSavedProjects();
    const existingIndex = current.findIndex((p) => p.id === project.id);
    let updated: SavedPRDProject[];
    if (existingIndex >= 0) {
      updated = [...current];
      updated[existingIndex] = {
        ...project,
        updatedAt: new Date().toISOString(),
      };
    } else {
      updated = [
        {
          ...project,
          createdAt: project.createdAt || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        ...current,
      ];
    }
    localStorage.setItem(STORAGE_KEY_PRD_LIST, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.error("Gagal menyimpan project ke localStorage:", err);
    return [];
  }
}

export function deleteProject(id: string): SavedPRDProject[] {
  if (typeof window === "undefined") return [];
  try {
    const current = loadSavedProjects();
    const filtered = current.filter((p) => p.id !== id);
    localStorage.setItem(STORAGE_KEY_PRD_LIST, JSON.stringify(filtered));
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
