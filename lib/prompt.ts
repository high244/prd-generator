export interface FeatureItem {
  id: string;
  title: string;
  description: string;
  priority: "P0" | "P1" | "P2"; // P0: Core MVP, P1: Growth/Engage, P2: Admin/Ops
  category: string;
  selected?: boolean;
}

export interface PRDInput {
  nama: string;
  ide: string;
  fitur: string | FeatureItem[];
  target: string;
  stack: string;
  timeline?: string;
  businessModel?: string;
}

export function buildPrompt({
  nama,
  ide,
  fitur,
  target,
  stack,
  timeline,
  businessModel,
}: PRDInput) {
  let fiturString = "";
  if (Array.isArray(fitur)) {
    fiturString = fitur
      .map(
        (f) =>
          `- [${f.priority}] **${f.title}** (${f.category}): ${f.description}`
      )
      .join("\n");
  } else {
    fiturString = fitur;
  }

  const system = `Kamu adalah Principal Product Manager dan Senior Software Architect kelas dunia.
Tugasmu adalah menyusun Product Requirement Document (PRD) yang padat, terstruktur rapi, berdensitas informasi tinggi (*high signal-to-noise ratio*), dan siap dieksekusi oleh AI Coding Assistant (seperti Claude Code, Cursor, Copilot Workspace) maupun software engineer profesional.

Aturan Penting Format & Kepadatan:
- Tulis dalam Bahasa Indonesia profesional, tegas, dan ringkas. Hindari kalimat pembuka basa-basi atau paragraf bertele-tele.
- Utamakan tabel, bullet points, dan blok kode terformat agar mudah dibaca cepat (*scannable*).
- Jangan membuat dokumen terlalu panjang tanpa alasan. Buat setiap section padat, esensial, dan langsung pada inti teknis.

PRD HARUS mencakup 10 bagian berikut secara berurutan dengan heading level 2 (##):

## 1. Ringkasan Eksekutif & Value Proposition
- Visi produk dalam 2-3 kalimat tegas.
- Masalah utama yang dipecahkan & keunggulan solusi dibanding alternatif yang ada.

## 2. Target Persona & User Story
- 2 profil pengguna utama (kebutuhan & pain points ringkas).
- 3-4 User Stories kunci format: "Sebagai [persona], saya ingin [tindakan] sehingga [manfaat]".

## 3. Spesifikasi Fitur & Prioritas (MoSCoW)
- Buat dalam tabel rapi: Kolom [Prioritas (P0/P1/P2) | Modul | Fitur | Kriteria Penerimaan (Acceptance Criteria)].
- P0: Must-Have untuk MVP.
- P1: Should-Have untuk engagement/retensi.
- P2: Nice-to-Have / Admin / Ops.

## 4. Arsitektur Informasi & Alur Halaman (Sitemap)
- Daftar routing halaman utama (Public vs Authenticated vs Admin).
- User Flow ringkas step-by-step dari landing hingga tercapainya core value.

## 5. Rancangan Skema Database (Data Modeling)
- Skema PostgreSQL DDL ringkas (3-5 tabel esensial dengan PK, FK, dan constraint penting).

## 6. Arsitektur Teknis & Tech Stack Rationale
- Rincian stack (Frontend, Backend, DB, Auth, Integrasi pihak ketiga).
- Struktur direktori project ringkas.

## 7. Keamanan & Kebutuhan Non-Fungsional (NFR)
- Aspek keamanan (Auth, CORS, Rate Limit, Enkripsi data).
- Performa & reliabilitas (Target latency, SLA, Caching).

## 8. Roadmap Peluncuran MVP (3 Milestones)
- Milestone 1: Fondasi & Auth (Minggu 1)
- Milestone 2: Fitur Inti P0 & Integrasi (Minggu 2-3)
- Milestone 3: Testing, Hardening, & Go-Live (Minggu 4)

## 9. Metrik Keberhasilan (KPIs)
- 3-4 indikator kuantitatif spesifik (misal: Latency <200ms, Conversion Rate >15%, Error Rate <0.1%).

## 10. Prompt Siap Pakai untuk AI Coding Agent (Cursor / Claude Code)
Sajikan dalam blok kode \`\`\`markdown yang berisi instruksi ringkas siap copy untuk AI Coding Agent:
"Instruksi project untuk AI: Bangun aplikasi [Nama] dengan stack [Stack] ... alur pengerjaan step-by-step..."

Instruksi penting:
- Jangan tambahkan sapaan sebelum atau sesudah dokumen. Langsung mulai dari judul PRD level 1 (# PRD: [Nama Website]) lalu ke ## 1.`;

  const user = `Informasi Project:
- Nama Aplikasi/Website: ${nama}
- Ide & Problem Statement: ${ide}
- Target Pengguna: ${target || "Pengguna umum / sesuai konteks ide"}
- Preferensi Tech Stack: ${stack || "Next.js + Tailwind CSS + Supabase / PostgreSQL"}
- Model Bisnis / Skala: ${businessModel || "Freemium / Standar SaaS / Web App"}
- Target Timeline MVP: ${timeline || "2-4 Minggu"}

Daftar Fitur yang Diinginkan:
${fiturString}

Susun PRD berstandar industri yang detail, jelas, dan siap pakai untuk project di atas.`;

  return { system, user };
}

// Fallback generator cerdas jika API key Anthropic belum diset atau kuota habis
export function generateFallbackPRD(input: PRDInput): string {
  const { nama, ide, target, stack } = input;
  const projectName = nama || "Modern Web Platform";
  const userStack = stack || "Next.js 14 (App Router) + TypeScript + Tailwind CSS + PostgreSQL";
  const userTarget = target || "Pengguna aktif digital, profesional muda, dan pemilik bisnis";

  // Fitur parser
  let featureRows: string[] = [];
  if (Array.isArray(input.fitur)) {
    featureRows = input.fitur.map(
      (f) => `| **${f.priority}** | ${f.category} | ${f.title} | ${f.description} |`
    );
  } else if (typeof input.fitur === "string" && input.fitur.trim()) {
    featureRows = input.fitur
      .split("\n")
      .filter((line) => line.trim())
      .map((line, idx) => {
        const priority = idx < 3 ? "P0" : idx < 6 ? "P1" : "P2";
        const clean = line.replace(/^[-*•\d.]+\s*/, "").trim();
        return `| **${priority}** | Modul Inti | ${clean} | Berfungsi responsif, terintegrasi database, lolos validasi |`;
      });
  }

  if (featureRows.length === 0) {
    featureRows = [
      "| **P0** | Autentikasi | Registrasi & Login Aman | Mendukung email/password & OAuth (Google), sesi tersimpan aman |",
      "| **P0** | Katalog & Konten | Tampilan List & Detail | Menampilkan data secara dinamis dengan filter & pencarian instan |",
      "| **P0** | Interaksi Inti | Manajemen Transaksi / Aksi | Pengguna dapat melakukan aksi utama sesuai ide produk |",
      "| **P1** | Notifikasi | Realtime Alerts | Notifikasi in-app & email status transaksi atau update penting |",
      "| **P2** | Dashboard Admin | Analitik & Manajemen Data | Monitoring pengguna aktif, laporan aktivitas, dan moderasi konten |",
    ];
  }

  const query = `${projectName} ${ide || ""} ${userTarget}`.toLowerCase();
  const isHealthDomain =
    query.includes("medis") ||
    query.includes("health") ||
    query.includes("telemed") ||
    query.includes("satusehat") ||
    query.includes("klinik") ||
    query.includes("dokter") ||
    query.includes("pasien") ||
    query.includes("rumah sakit") ||
    query.includes("rme") ||
    query.includes("ehr");

  // Jika Domain Healthcare / Medis / SatuSehat terdeteksi
  if (isHealthDomain) {
    return `# PRD: ${projectName}
*Dokumen Kebutuhan Produk (Product Requirement Document) — Enterprise Clinical Standard v1.0 (MVP Ready)*
*Regulasi Kepatuhan: Permenkes No. 24 Tahun 2022 (RME) & UU Pelindungan Data Pribadi (UU PDP No. 27/2022)*

---

## 1. Ringkasan Eksekutif & Value Proposition
**${projectName}** dirancang sebagai ekosistem digital terintegrasi untuk menjawab tantangan: *"${ide || "Menghadirkan layanan telemedicine dan rekam medis elektronik berstandar Kemenkes SatuSehat FHIR v4.0 dengan otomasi alur klinis dan klaim."}"*.

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
${featureRows.join("\n")}

---

## 4. Arsitektur Informasi & Alur Halaman (Sitemap)

### 1. Portal Publik & Pasien
- \`/ (Landing Page)\`: Pengenalan faskes/layanan, profil dokter spesialis, jadwal poliklinik, dan tombol registrasi cepat.
- \`/login\` & \`/auth/verify-nik\`: Autentikasi aman terintegrasi verifikasi NIK dan OTP WhatsApp.
- \`/pasien/antrean\`: Status nomor antrean aktif secara real-time dengan audio-chime notifikasi.
- \`/pasien/telemed/[sessionId]\`: Ruang telekonsultasi interaktif WebRTC dengan enkripsi E2EE, countdown timer, dan media share.
- \`/pasien/resep-digital\`: Detail obat yang diresepkan, aturan pakai, dan tombol pelunasan/pengiriman apotek.

### 2. Portal Dokter & Tenaga Medis (Authenticated)
- \`/portal/worklist\`: Daftar antrean pasien poliklinik hari ini dengan badge prioritas triase (Merah/Kuning/Hijau).
- \`/portal/rme/[encounterId]\`: Formulir RME komprehensif (SOAP: Subjective, Objective, Assessment, Plan), riwayat alergi, grafik tanda vital, dan selector ICD-10.
- \`/portal/e-prescribing\`: Formulir peresepan obat dengan drug-interaction warning dan otentikasi digital signature.

### 3. Portal Manajemen Faskes & Administrator (Protected)
- \`/admin/satusehat-bridge\`: Monitoring pipeline sync FHIR (Resource Encounter, Condition, Medication) lengkap dengan error inspector & auto-retry.
- \`/admin/bpjs-vclaim\`: Integrasi SEP, mapping poli, dan rekonsiliasi berkas klaim INA-CBG.
- \`/admin/audit-logs\`: Immutable log pemantauan siapa mengakses data rekam medis pasien mana, waktu, dan IP address (Kepatuhan UU PDP).
- \`/admin/analytics\`: Dashboard metrik BOR (Bed Occupancy Rate), LOS (Length of Stay), dan utilisasi konsultasi.

---

## 5. Rancangan Skema Database (Data Modeling)

Berikut rancangan skema basis data relasional PostgreSQL dengan standar interoperabilitas HL7/FHIR:

\`\`\`sql
-- 1. Faskes / Organization Table
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  satusehat_org_id VARCHAR(100) UNIQUE NOT NULL,
  bpjs_faskes_code VARCHAR(50),
  name VARCHAR(200) NOT NULL,
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Practitioners / Doctors Table
CREATE TABLE practitioners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  satusehat_ihs_id VARCHAR(100) UNIQUE,
  full_name VARCHAR(150) NOT NULL,
  specialty VARCHAR(100) NOT NULL,
  sip_number VARCHAR(100) NOT NULL,
  signature_cert_id VARCHAR(100), -- BSrE Digital Certificate
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Patients Table (Identity & Demographics)
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nik VARCHAR(16) UNIQUE NOT NULL,
  satusehat_patient_ihs VARCHAR(100) UNIQUE,
  bpjs_card_number VARCHAR(20),
  full_name VARCHAR(150) NOT NULL,
  gender VARCHAR(10) NOT NULL, -- 'male', 'female'
  birth_date DATE NOT NULL,
  blood_type VARCHAR(5),
  allergies JSONB DEFAULT '[]'::jsonb,
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Clinical Encounters (Kunjungan Pasien)
CREATE TABLE encounters (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES organizations(id),
  patient_id UUID REFERENCES patients(id) ON DELETE RESTRICT,
  practitioner_id UUID REFERENCES practitioners(id),
  encounter_type VARCHAR(50) NOT NULL, -- 'telemedicine', 'in-person', 'emergency'
  triage_level VARCHAR(20) DEFAULT 'green', -- 'red', 'yellow', 'green'
  status VARCHAR(50) DEFAULT 'arrived', -- 'arrived', 'in-progress', 'finished', 'cancelled'
  satusehat_encounter_id VARCHAR(100),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  finished_at TIMESTAMP WITH TIME ZONE
);

-- 5. Electronic Medical Records (SOAP & Diagnosis)
CREATE TABLE medical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID UNIQUE REFERENCES encounters(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id),
  practitioner_id UUID REFERENCES practitioners(id),
  subjective_notes TEXT NOT NULL,
  objective_vital_signs JSONB NOT NULL, -- {bp_systolic, bp_diastolic, hr, rr, temp, spo2}
  assessment_icd10 JSONB NOT NULL,     -- [{code: 'I10', display: 'Essential Hypertension'}]
  plan_procedure_icd9 JSONB DEFAULT '[]'::jsonb,
  clinical_triage_score NUMERIC(5, 2),
  is_locked BOOLEAN DEFAULT FALSE,
  locked_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Prescriptions Table (E-Resep)
CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID REFERENCES encounters(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES patients(id),
  practitioner_id UUID REFERENCES practitioners(id),
  prescription_items JSONB NOT NULL, -- [{drug_name, dose, frequency, duration, notes}]
  digital_signature_hash TEXT,
  dispense_status VARCHAR(50) DEFAULT 'prescribed', -- 'prescribed', 'dispensed', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. SatuSehat FHIR Sync Logs
CREATE TABLE satusehat_sync_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  encounter_id UUID REFERENCES encounters(id),
  resource_type VARCHAR(50) NOT NULL, -- 'Patient', 'Encounter', 'Condition', 'Medication'
  fhir_payload JSONB NOT NULL,
  response_code INTEGER,
  response_body JSONB,
  status VARCHAR(20) DEFAULT 'pending', -- 'success', 'failed', 'retrying'
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Immutable PDP Access Logs (Audit Trail Kepatuhan UU PDP)
CREATE TABLE audit_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  accessor_user_id UUID NOT NULL,
  patient_id UUID NOT NULL,
  action_type VARCHAR(50) NOT NULL, -- 'READ_RME', 'UPDATE_SOAP', 'EXPORT_DATA'
  ip_address VARCHAR(45) NOT NULL,
  user_agent TEXT,
  integrity_hash VARCHAR(128) NOT NULL, -- SHA-256 integrity check
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

---

## 6. Arsitektur Teknis & Tech Stack Rationale

- **Frontend & App Framework:** Next.js 14+ (App Router, Server Actions, Dynamic Server Components).
- **Styling:** Tailwind CSS + Lucide Icons + Headless UI / Radix Primitives.
- **WebRTC Engine:** LiveKit Cloud / LiveKit SFU (latency < 150ms, adaptive bitrate, end-to-end media encryption).
- **Database & State:** Supabase PostgreSQL dengan Row Level Security (RLS) terisolasi per Faskes ID, Redis Upstash untuk antrean state & rate limiting.
- **Background Worker & Asynchronous Tasks:** Upstash QStash / BullMQ untuk pengiriman webhook Kemenkes SatuSehat dan integrasi BPJS V-Claim tanpa membebani thread antarmuka dokter.
- **Security & Keamanan:** Enkripsi AES-256-GCM data rekam medis saat diam (at rest), TLS 1.3 saat transmisi (in transit), serta autentikasi berbasis JWT dengan rotasi berkala.

### Struktur Folder yang Disarankan
\`\`\`text
├── app/
│   ├── (public)/          # Landing page faskes, pendaftaran antrean
│   ├── (patient)/         # Portal pasien, telemed session room
│   ├── (clinical)/        # Portal poliklinik dokter, RME SOAP input
│   ├── (admin)/           # Dashboard SatuSehat bridge, audit logs, analitik
│   ├── api/
│   │   ├── satusehat/     # Webhook & FHIR sync endpoints
│   │   ├── bpjs/          # V-Claim bridging endpoints
│   │   └── livekit/       # Token generator WebRTC room
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── clinical/          # Form RME SOAP, ICD-10 autocomplete, vital signs chart
│   ├── webrtc/            # Video consultation player, screen share, mic/cam toggle
│   └── ui/                # Reusable design system components
├── lib/
│   ├── fhir/              # Serializer JSON resource HL7 FHIR v4.0.0
│   ├── satusehat-client.ts # Auth OAuth2 & REST client SatuSehat
│   ├── bpjs-vclaim.ts     # Generate SEP & signature BPJS
│   └── audit.ts           # Helper pencatatan log audit immutable
\`\`\`

---

## 7. Keamanan & Kebutuhan Non-Fungsional (NFR)

1. **Kepatuhan Regulasi Kesehatan:** Memenuhi 100% persyaratan PMK No. 24/2022 (Sistem Rekam Medis Elektronik) dan UU Pelindungan Data Pribadi (UU PDP No. 27/2022).
2. **Kerahasiaan Medis (Medical Confidentiality):** Tidak ada data rekam medis terbuka publik. Akses diatur dengan Role-Based Access Control (RBAC) dan Row Level Security (RLS).
3. **Integritas Rekam Medis:** Dokumen RME yang telah ditandatangani dokter terkunci secara permanen (*immutable locked status*). Koreksi hanya diizinkan via addendum resmi dengan timestamp audit trail.
4. **Ketersediaan & Keandalan (High Availability):** Target uptime 99.95% dengan failover database multi-region.
5. **Performa Telemed:** Setup WebRTC dengan fallback TURN server memastikan konsultasi video berjalan lancar bahkan pada koneksi 3G/4G terbatas (bitrate dinamis 250kbps - 1.5Mbps).

---

## 8. Roadmap Peluncuran MVP (3 Milestones)

- **Milestone 1: Fondasi Keamanan, Autentikasi Nakes & Modul RME SOAP (Bulan 1 - M1 & M2)**
  - Setup skema database PostgreSQL dengan enkripsi AES-256 data at rest.
  - Implementasi formulir pencatatan rekam medis SOAP interaktif dengan auto-suggest ICD-10/ICD-9.
  - Sistem autentikasi NIK pasien dan registrasi dokter dengan nomor SIP.
- **Milestone 2: Telemed WebRTC, E-Resep & Integrasi SatuSehat FHIR (Bulan 1 - M3 & M4)**
  - Implementasi ruang telekonsultasi audio-video WebRTC terenkripsi low-latency.
  - Modul e-prescribing dengan verifikasi digital signature dokter.
  - Integrasi konektor SatuSehat Kemenkes (Resource Patient, Encounter, dan Condition).
- **Milestone 3: Bridging BPJS V-Claim, Audit Trail PDP, & UAT Rumah Sakit (Bulan 2)**
  - Implementasi bridging BPJS V-Claim untuk penerbitan SEP otomatis.
  - Audit logging komprehensif untuk verifikasi kepatuhan regulasi PDP.
  - Pengujian performa, uji penetrasi keamanan (*penetration testing*), dan peluncuran pilot project faskes.

---

## 9. Metrik Keberhasilan (KPIs)
- **Clinical Efficiency:** Waktu pengisian RME dan peresepan obat berkurang dari rata-rata 8 menit menjadi < 2.5 menit per pasien.
- **SatuSehat Sync Rate:** > 99.5% encounter pasien berhasil tersinkronisasi ke server SatuSehat Kemenkes dalam 15 menit pasca-konsultasi.
- **Teleconsultation Stability:** < 1% insiden panggilan terputus (*call drop rate*) pada telekonsultasi WebRTC.
- **Kepatuhan Audit:** 0 celah pelanggaran kebocoran data (*zero security breach*) pada pemeriksaan audit trail UU PDP.

---

## 10. Prompt Siap Pakai untuk AI Coding Agent (Cursor / Claude Code)

Salin prompt di bawah ini langsung ke **Cursor Composer**, **Claude Code**, atau **Windsurf** untuk mulai membangun project:

\`\`\`markdown
Halo AI Assistant, kamu bertindak sebagai Principal Fullstack Healthcare Architect & Senior Security Engineer.
Saya ingin membangun sistem enterprise bernama "${projectName}".
Tech stack yang akan digunakan: ${userStack}.

Konteks Kebutuhan & Regulasi:
Aplikasi ini adalah platform Telemedicine dan Rekam Medis Elektronik (RME) berstandar Kemenkes SatuSehat FHIR v4.0 dan terintegrasi BPJS V-Claim dengan tingkat keamanan data medis tertinggi (UU PDP No. 27/2022).

Fitur MVP Inti (P0):
${featureRows.filter((r) => r.includes("**P0**")).join("\n")}

Langkah Eksekusi Tahap 1:
1. Analisis skema database di atas (tabel organizations, practitioners, patients, encounters, medical_records, prescriptions, satusehat_sync_logs, audit_access_logs). Buatkan file migrasi PostgreSQL / schema.prisma lengkap dengan relasi dan indeks performa.
2. Buatkan service serializer FHIR JSON helper untuk mengonversi entitas Encounter dan Condition ke format HL7 FHIR v4.0.0 siap kirim ke API SatuSehat Kemenkes.
3. Buatkan halaman dashboard poliklinik dokter modern menggunakan Next.js 14 App Router dan Tailwind CSS yang menampilkan antrean pasien dan antarmuka input formulir SOAP berkecepatan tinggi.
Mari kita mulai dari langkah 1 sekarang!
\`\`\`
`;
  }

  // Template Generik / Non-Healthcare
  return `# PRD: ${projectName}
*Dokumen Kebutuhan Produk (Product Requirement Document) — Versi 1.0 (MVP Ready)*

---

## 1. Ringkasan Eksekutif & Value Proposition
**${projectName}** dirancang untuk menjawab tantangan: *"${ide || "Memberikan solusi digital yang cepat, efisien, dan ramah pengguna."}"*. 
Aplikasi ini berfokus pada kecepatan akses, antarmuka yang intuitif, serta alur kerja yang memangkas friksi pengguna dari onboarding hingga penyelesaian tugas utama.

- **Visi Produk:** Menjadi solusi nomor satu yang andal dan mudah diadopsi oleh ${userTarget}.
- **Value Proposition:** Menggabungkan kemudahan antarmuka modern dengan arsitektur data yang scalable dan terotomasi.

---

## 2. Target Persona & User Story

### Persona Utama
- **Profil:** ${userTarget}
- **Pain Points:** Proses konvensional yang lambat, informasi yang terfragmentasi, dan kurangnya visibilitas status secara real-time.
- **Goals:** Solusi terpusat yang bisa diakses via mobile & desktop dalam hitungan detik.

### User Stories Kunci
1. *Sebagai pengguna baru*, saya ingin mendaftar dengan akun Google secara cepat agar saya tidak perlu mengingat banyak password.
2. *Sebagai pengguna aktif*, saya ingin mengeksplorasi layanan dan melakukan aksi utama tanpa kebingungan alur (zero learning curve).
3. *Sebagai pengguna*, saya ingin menerima konfirmasi dan pembaruan instan atas aktivitas saya.
4. *Sebagai admin*, saya ingin memantau metrik performa aplikasi dan mengelola data pengguna dari dashboard terpusat.

---

## 3. Spesifikasi Fitur & Prioritas (MoSCoW)

| Prioritas | Modul | Fitur | Kriteria Penerimaan (Acceptance Criteria) |
| :--- | :--- | :--- | :--- |
${featureRows.join("\n")}

---

## 4. Arsitektur Informasi & Alur Halaman (Sitemap)

### 1. Halaman Publik
- \`/ (Landing Page)\`: Hero section, keunggulan fitur, testimoni/demo interaktif, CTA jelas.
- \`/login\` & \`/register\`: Form autentikasi dengan proteksi bot & validasi input real-time.
- \`/about\` & \`/faq\`: Pusat bantuan dan penjelasan layanan.

### 2. Halaman Pengguna (Authenticated)
- \`/dashboard\`: Ringkasan aktivitas, status transaksi terkini, dan shortcut aksi cepat.
- \`/explore\` / \`/catalog\`: Eksplorasi fitur utama dengan filter, sorting, dan pagination.
- \`/detail/[id]\`: Informasi lengkap item/transaksi dengan opsi interaksi.
- \`/settings\`: Pengaturan profil, preferensi notifikasi, dan keamanan akun.

### 3. Halaman Admin (Protected)
- \`/admin/overview\`: Metrik pertumbuhan pengguna dan grafik aktivitas.
- \`/admin/management\`: Tabel CRUD data dengan search, export CSV, dan status switcher.

---

## 5. Rancangan Skema Database (Data Modeling)

\`\`\`sql
-- 1. Users Table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(150),
  avatar_url TEXT,
  role VARCHAR(20) DEFAULT 'user', -- 'user', 'admin'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Items / Services Table (Katalog Inti)
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  price NUMERIC(12, 2) DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Transactions / Activities Table
CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  item_id UUID REFERENCES items(id),
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'cancelled'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Audit & Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
\`\`\`

---

## 6. Arsitektur Teknis & Tech Stack Rationale

- **Framework:** ${userStack.includes("Next.js") ? "Next.js 14+ (App Router, Server Actions, API Routes)" : userStack}
- **Styling & UI:** Tailwind CSS + Radix UI / Lucide Icons (desain responsif, clean dark/light mode ready).
- **Database & Backend:** Supabase / PostgreSQL dengan Prisma ORM atau Drizzle ORM untuk type-safety end-to-end.
- **Autentikasi:** NextAuth.js / Supabase Auth (dukungan JWT, session handling aman, role-based access control).
- **Hosting & Deployment:** Vercel untuk zero-config continuous deployment dan edge performance.

### Struktur Folder yang Disarankan
\`\`\`text
├── app/
│   ├── (auth)/         # Halaman login, register
│   ├── (dashboard)/    # Area aplikasi pengguna
│   ├── (admin)/        # Area dashboard admin
│   ├── api/            # REST API endpoints & Webhooks
│   ├── layout.tsx
│   └── page.tsx        # Landing page
├── components/
│   ├── ui/             # Reusable primitives (Button, Modal, Input)
│   ├── forms/          # Form validasi (Zod + React Hook Form)
│   └── layout/         # Navbar, Sidebar, Footer
├── lib/
│   ├── db.ts           # Koneksi database ORM
│   ├── auth.ts         # Konfigurasi otentikasi
│   └── utils.ts        # Helper fungsi
\`\`\`

---

## 7. Keamanan & Kebutuhan Non-Fungsional (NFR)

1. **Validasi Input:** Gunakan schema validation (Zod) di semua Server Actions & API routes untuk mencegah SQL Injection & XSS.
2. **Rate Limiting:** Proteksi endpoint publik dengan Redis / Upstash Rate Limiting untuk menghindari spamming.
3. **Environment Security:** Kunci rahasia (API Keys, DB URLs) hanya diakses di environment server (tidak bocor ke bundle client).
4. **Performa:** Skor Google Lighthouse > 90 pada Desktop & Mobile, First Contentful Paint < 1.2 detik.
5. **Aksesibilitas (a11y):** Dukungan keyboard navigation dan screen reader compliance (WCAG 2.1 AA).

---

## 8. Roadmap Peluncuran MVP (3 Milestones)

- **Milestone 1 (Minggu 1 - Setup & Auth):**
  - Setup repository, Tailwind CSS, konfigurasi database & migrasi.
  - Implementasi alur autentikasi dan middleware proteksi rute.
- **Milestone 2 (Minggu 2 - Core Features):**
  - Pembuatan fitur P0 (katalog, CRUD data, aksi utama pengguna).
  - Integrasi API dan penyimpanan file/media jika diperlukan.
- **Milestone 3 (Minggu 3 - Polish, Testing & Launch):**
  - Dashboard analitik admin dan notifikasi.
  - Error boundary, responsive QA, SEO meta tags, dan deployment ke production.

---

## 9. Metrik Keberhasilan (KPIs)
- **User Activation:** > 60% pengguna yang mendaftar menyelesaikan alur aksi inti pertama dalam 24 jam.
- **System Uptime:** 99.9% availability dengan rata-rata response time API < 200ms.
- **Task Success Rate:** > 90% transaksi/aksi diselesaikan tanpa kendala teknis.

---

## 10. Prompt Siap Pakai untuk AI Coding Agent (Cursor / Claude Code)

Salin prompt di bawah ini langsung ke **Cursor Composer**, **Claude Code**, atau **Windsurf** untuk mulai membangun project:

\`\`\`markdown
Halo AI Assistant, kamu berperan sebagai Senior Fullstack Engineer.
Saya ingin membangun project baru bernama "${projectName}".
Tech stack yang akan digunakan: ${userStack}.

Berikut adalah ringkasan kebutuhan dari PRD:
1. Masalah yang diselesaikan: ${ide}
2. Fitur MVP (P0):
${featureRows.filter((r) => r.includes("**P0**")).join("\n")}
3. Skema Database: Gunakan tabel users, items, activities, dan notifications sesuai rancangan PRD di atas.

Langkah pertama:
- Analisis kebutuhan di atas, lalu buatkan struktur direktori project yang rapi.
- Buatkan skema database (misalnya schema.prisma atau file migrasi SQL).
- Buatkan landing page modern yang menarik dan responsif dengan Tailwind CSS.
Mari kita mulai dari langkah setup awal terlebih dahulu!
\`\`\`
`;
}

// Fallback generator cerdas untuk rekomendasi fitur
export function generateSuggestedFeatures(
  nama: string,
  ide: string,
  category?: string
): FeatureItem[] {
  const query = `${nama} ${ide} ${category || ""}`.toLowerCase();

  // Template berdasarkan pola kata kunci
  if (
    query.includes("toko") ||
    query.includes("shop") ||
    query.includes("jual") ||
    query.includes("kopi") ||
    query.includes("makan") ||
    query.includes("commerce") ||
    query.includes("produk")
  ) {
    return [
      {
        id: "feat-1",
        title: "Katalog Produk & Menu Interaktif",
        description: "Tampilan grid produk dengan foto, harga, status stok, dan filter kategori instan.",
        priority: "P0",
        category: "Katalog & Belanja",
        selected: true,
      },
      {
        id: "feat-2",
        title: "Keranjang Belanja & Checkout Instan",
        description: "Penghitungan subtotal otomatis, catatan pesanan khusus, dan ringkasan ringkas.",
        priority: "P0",
        category: "Transaksi",
        selected: true,
      },
      {
        id: "feat-3",
        title: "Pembayaran Online Multi-Channel (QRIS, E-Wallet)",
        description: "Integrasi gateway pembayaran (Midtrans/Xendit) dengan konfirmasi pembayaran otomatis.",
        priority: "P0",
        category: "Transaksi",
        selected: true,
      },
      {
        id: "feat-4",
        title: "Pelacakan Pesanan & Status Real-Time",
        description: "Timeline status: Menunggu Pembayaran -> Diproses -> Dikirim -> Selesai.",
        priority: "P1",
        category: "Pengalaman Pengguna",
        selected: true,
      },
      {
        id: "feat-5",
        title: "Notifikasi Otomatis WhatsApp / Email",
        description: "Kirim bukti transaksi dan update status langsung ke nomor WhatsApp pelanggan.",
        priority: "P1",
        category: "Notifikasi",
        selected: true,
      },
      {
        id: "feat-6",
        title: "Dashboard Manajemen Pesanan & Stok (Admin)",
        description: "Panel kasir/admin untuk mengubah status pesanan, update stok produk, dan cetak invoice.",
        priority: "P2",
        category: "Admin & Operasional",
        selected: true,
      },
      {
        id: "feat-7",
        title: "Laporan Penjualan & Analitik Harian/Bulanan",
        description: "Grafik omzet harian, produk terlaris, dan ekspor data ke Excel/CSV.",
        priority: "P2",
        category: "Admin & Operasional",
        selected: false,
      },
    ];
  }

  // Domain Healthcare / Telemed / SatuSehat
  if (
    query.includes("medis") ||
    query.includes("health") ||
    query.includes("telemed") ||
    query.includes("satusehat") ||
    query.includes("klinik") ||
    query.includes("dokter") ||
    query.includes("pasien") ||
    query.includes("rumah sakit") ||
    query.includes("rme") ||
    query.includes("ehr")
  ) {
    return [
      {
        id: "feat-1",
        title: "Integrasi Kemenkes SatuSehat FHIR v4.0",
        description: "Sinkronisasi resource Patient, Encounter, Condition, Medication, dan Observation sesuai regulasi Kemenkes.",
        priority: "P0",
        category: "Compliance & Regulasi",
        selected: true,
      },
      {
        id: "feat-2",
        title: "Telekonsultasi Audio-Video WebRTC E2EE",
        description: "Ruang konsultasi video interaktif low-latency dengan fitur live chat, screen share, dan consent pasien.",
        priority: "P0",
        category: "Telehealth",
        selected: true,
      },
      {
        id: "feat-3",
        title: "Smart Clinical Triage & ICD-10 Coding Assistant",
        description: "Analisis keluhan klinis berbasis AI untuk rekomendasi derajat triase kedaruratan dan auto-suggest kode ICD-10.",
        priority: "P0",
        category: "Clinical AI",
        selected: true,
      },
      {
        id: "feat-4",
        title: "E-Prescription & Modul Farmasi Terenkripsi",
        description: "Penerbitan resep obat digital dengan tanda tangan elektronik dokter terintegrasi inventory apotek faskes.",
        priority: "P0",
        category: "Farmasi & Medis",
        selected: true,
      },
      {
        id: "feat-5",
        title: "Bridging BPJS Kesehatan V-Claim & Antrean Online",
        description: "Verifikasi kepesertaan BPJS instan, auto-generate Surat Eligibilitas Peserta (SEP), dan antrean Mobile JKN.",
        priority: "P1",
        category: "Interoperabilitas",
        selected: true,
      },
      {
        id: "feat-6",
        title: "Multi-Channel Payment Gateway & Billing Split",
        description: "Pembayaran terotomasi via QRIS, Virtual Account, dan asuransi swasta dengan kalkulasi fee jasa medis.",
        priority: "P1",
        category: "Financial Ops",
        selected: true,
      },
      {
        id: "feat-7",
        title: "Audit Trail UU PDP/HIPAA & Executive Hospital Analytics",
        description: "Immutable access logs untuk kepatuhan perlindungan data pribadi dan dashboard indikator BOR, LOS, TOI RS.",
        priority: "P2",
        category: "Security & Ops",
        selected: true,
      },
    ];
  }

  if (
    query.includes("booking") ||
    query.includes("reservasi") ||
    query.includes("jadwal") ||
    query.includes("janji") ||
    query.includes("salon") ||
    query.includes("sewa")
  ) {
    return [
      {
        id: "feat-1",
        title: "Kalender Pemilihan Jadwal Interaktif",
        description: "Pelanggan bisa memilih tanggal dan slot jam kosong secara real-time.",
        priority: "P0",
        category: "Reservasi",
        selected: true,
      },
      {
        id: "feat-2",
        title: "Pilihan Layanan & Petugas/Dokter",
        description: "Katalog layanan dengan estimasi durasi waktu pengerjaan dan harga.",
        priority: "P0",
        category: "Katalog Layanan",
        selected: true,
      },
      {
        id: "feat-3",
        title: "Formulir Booking & Pengingat Kontak",
        description: "Input data pelanggan, nomor telepon, dan keluhan/catatan khusus.",
        priority: "P0",
        category: "Reservasi",
        selected: true,
      },
      {
        id: "feat-4",
        title: "Pengingat Otomatis via WhatsApp (H-1 & H-2 Jam)",
        description: "Mencegah no-show pelanggan dengan pengingat pesan otomatis.",
        priority: "P1",
        category: "Otomasi",
        selected: true,
      },
      {
        id: "feat-5",
        title: "Pembayaran Uang Muka (DP) / Pelunasan",
        description: "Penguncian slot jadwal setelah DP berhasil dibayar via QRIS/Transfer.",
        priority: "P1",
        category: "Transaksi",
        selected: true,
      },
      {
        id: "feat-6",
        title: "Master Kalender & Manajemen Jadwal (Admin)",
        description: "Tampilan jadwal harian/mingguan untuk staf dan pengaturan jam operasional/libur.",
        priority: "P2",
        category: "Admin & Operasional",
        selected: true,
      },
      {
        id: "feat-7",
        title: "Reschedule & Kebijakan Pembatalan Mandiri",
        description: "Pelanggan bisa memindahkan jadwal maksimal 12 jam sebelum waktu temu.",
        priority: "P2",
        category: "Pengalaman Pengguna",
        selected: false,
      },
    ];
  }

  if (
    query.includes("saas") ||
    query.includes("ai") ||
    query.includes("generator") ||
    query.includes("tool") ||
    query.includes("dashboard") ||
    query.includes("analitik")
  ) {
    return [
      {
        id: "feat-1",
        title: "Generator / Mesin Pemroses Inti",
        description: "Input interaktif dengan preview hasil instan dan proses loading interaktif.",
        priority: "P0",
        category: "Core Engine",
        selected: true,
      },
      {
        id: "feat-2",
        title: "Autentikasi Akun & Manajemen Profil",
        description: "Login cepat menggunakan Google OAuth atau Email dengan proteksi sesi aman.",
        priority: "P0",
        category: "Autentikasi",
        selected: true,
      },
      {
        id: "feat-3",
        title: "Riwayat Pembuatan (History & Library)",
        description: "Menyimpan hasil generate sebelumnya agar bisa dibuka, disalin, atau diedit ulang.",
        priority: "P0",
        category: "Manajemen Konten",
        selected: true,
      },
      {
        id: "feat-4",
        title: "Ekspor Multi-Format (PDF, Markdown, Copy to Clipboard)",
        description: "Kemudahan mendistribusikan hasil dalam berbagai format standar industri.",
        priority: "P1",
        category: "Utilitas",
        selected: true,
      },
      {
        id: "feat-5",
        title: "Sistem Kuota Kredit / Paket Langganan",
        description: "Batas pemakaian harian untuk pengguna gratis dan opsi upgrade ke Pro.",
        priority: "P1",
        category: "Monetisasi",
        selected: true,
      },
      {
        id: "feat-6",
        title: "Admin Analytics & Token Usage Monitor",
        description: "Monitoring biaya API, jumlah token/request harian, dan pengguna paling aktif.",
        priority: "P2",
        category: "Admin & Operasional",
        selected: true,
      },
    ];
  }

  // Default Universal Web App
  return [
    {
      id: "feat-1",
      title: "Landing Page Informatif & Responsif",
      description: "Halaman depan yang memikat, menjelaskan value produk dengan CTA pendaftaran yang jelas.",
      priority: "P0",
      category: "Public",
      selected: true,
    },
    {
      id: "feat-2",
      title: "Autentikasi Pengguna (Login & Daftar)",
      description: "Sistem registrasi aman dengan email/password atau login cepat via Google.",
      priority: "P0",
      category: "Autentikasi",
      selected: true,
    },
    {
      id: "feat-3",
      title: "Workspace / Dashboard Pengguna Terpusat",
      description: "Area kerja utama pengguna untuk membuat, melihat, dan mengelola aktivitas mereka.",
      priority: "P0",
      category: "Fitur Inti",
      selected: true,
    },
    {
      id: "feat-4",
      title: "Pencarian Instan & Filter Kategori",
      description: "Memudahkan pengguna menemukan data atau konten secara cepat tanpa reload halaman.",
      priority: "P1",
      category: "Navigasi",
      selected: true,
    },
    {
      id: "feat-5",
      title: "Notifikasi & Notifikasi Status Aktivitas",
      description: "Pemberitahuan real-time ketika ada pembaruan data atau tindakan yang berhasil.",
      priority: "P1",
      category: "Komunikasi",
      selected: true,
    },
    {
      id: "feat-6",
      title: "Panel Admin & Manajemen Pengguna",
      description: "Dashboard khusus pengelola untuk mengontrol data, hak akses, dan moderasi.",
      priority: "P2",
      category: "Admin & Operasional",
      selected: true,
    },
  ];
}
