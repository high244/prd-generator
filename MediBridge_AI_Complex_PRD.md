# PRD: MediBridge AI — Clinical EHR & Telemedicine Ecosystem
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
- `/ (Landing Page)`: Pengenalan faskes/layanan, profil dokter spesialis, jadwal poliklinik, dan tombol registrasi cepat.
- `/login` & `/auth/verify-nik`: Autentikasi aman terintegrasi verifikasi NIK dan OTP WhatsApp.
- `/pasien/antrean`: Status nomor antrean aktif secara real-time dengan audio-chime notifikasi.
- `/pasien/telemed/[sessionId]`: Ruang telekonsultasi interaktif WebRTC dengan enkripsi E2EE, countdown timer, dan media share.
- `/pasien/resep-digital`: Detail obat yang diresepkan, aturan pakai, dan tombol pelunasan/pengiriman apotek.

### 2. Portal Dokter & Tenaga Medis (Authenticated)
- `/portal/worklist`: Daftar antrean pasien poliklinik hari ini dengan badge prioritas triase (Merah/Kuning/Hijau).
- `/portal/rme/[encounterId]`: Formulir RME komprehensif (SOAP: Subjective, Objective, Assessment, Plan), riwayat alergi, grafik tanda vital, dan selector ICD-10.
- `/portal/e-prescribing`: Formulir peresepan obat dengan drug-interaction warning dan otentikasi digital signature.

### 3. Portal Manajemen Faskes & Administrator (Protected)
- `/admin/satusehat-bridge`: Monitoring pipeline sync FHIR (Resource Encounter, Condition, Medication) lengkap dengan error inspector & auto-retry.
- `/admin/bpjs-vclaim`: Integrasi SEP, mapping poli, dan rekonsiliasi berkas klaim INA-CBG.
- `/admin/audit-logs`: Immutable log pemantauan siapa mengakses data rekam medis pasien mana, waktu, dan IP address (Kepatuhan UU PDP).
- `/admin/analytics`: Dashboard metrik BOR (Bed Occupancy Rate), LOS (Length of Stay), dan utilisasi konsultasi.

---

## 5. Rancangan Skema Database (Data Modeling)

Berikut rancangan skema basis data relasional PostgreSQL dengan standar interoperabilitas HL7/FHIR:

```sql
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
```

---

## 6. Arsitektur Teknis & Tech Stack Rationale

- **Frontend & App Framework:** Next.js 14+ (App Router, Server Actions, Dynamic Server Components).
- **Styling:** Tailwind CSS + Lucide Icons + Headless UI / Radix Primitives.
- **WebRTC Engine:** LiveKit Cloud / LiveKit SFU (latency < 150ms, adaptive bitrate, end-to-end media encryption).
- **Database & State:** Supabase PostgreSQL dengan Row Level Security (RLS) terisolasi per Faskes ID, Redis Upstash untuk antrean state & rate limiting.
- **Background Worker & Asynchronous Tasks:** Upstash QStash / BullMQ untuk pengiriman webhook Kemenkes SatuSehat dan integrasi BPJS V-Claim tanpa membebani thread antarmuka dokter.
- **Security & Keamanan:** Enkripsi AES-256-GCM data rekam medis saat diam (at rest), TLS 1.3 saat transmisi (in transit), serta autentikasi berbasis JWT dengan rotasi berkala.

### Struktur Folder yang Disarankan
```text
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
```

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

```markdown
Halo AI Assistant, kamu bertindak sebagai Principal Fullstack Healthcare Architect & Senior Security Engineer.
Saya ingin membangun sistem enterprise bernama "MediBridge AI — Clinical EHR & Telemedicine Ecosystem".
Tech stack yang akan digunakan: Next.js 14 + Tailwind CSS + Supabase (PostgreSQL) + LiveKit WebRTC + Redis Upstash.

Konteks Kebutuhan & Regulasi:
Aplikasi ini adalah platform Telemedicine dan Rekam Medis Elektronik (RME) berstandar Kemenkes SatuSehat FHIR v4.0 dan terintegrasi BPJS V-Claim dengan tingkat keamanan data medis tertinggi (UU PDP No. 27/2022).

Fitur MVP Inti (P0):
| **P0** | Compliance & Regulasi | Integrasi Kemenkes SatuSehat FHIR v4.0 | Sinkronisasi resource Patient, Encounter, Condition, Medication, dan Observation sesuai regulasi Kemenkes. |
| **P0** | Telehealth | Telekonsultasi Audio-Video WebRTC E2EE | Ruang konsultasi video interaktif low-latency dengan fitur live chat, screen share, dan consent pasien. |
| **P0** | Clinical AI | Smart Clinical Triage & ICD-10 Coding Assistant | Analisis keluhan klinis berbasis AI untuk rekomendasi derajat triase kedaruratan dan auto-suggest kode ICD-10. |
| **P0** | Farmasi & Medis | E-Prescription & Modul Farmasi Terenkripsi | Penerbitan resep obat digital dengan tanda tangan elektronik dokter terintegrasi inventory apotek faskes. |

Langkah Eksekusi Tahap 1:
1. Analisis skema database di atas (tabel organizations, practitioners, patients, encounters, medical_records, prescriptions, satusehat_sync_logs, audit_access_logs). Buatkan file migrasi PostgreSQL / schema.prisma lengkap dengan relasi dan indeks performa.
2. Buatkan service serializer FHIR JSON helper untuk mengonversi entitas Encounter dan Condition ke format HL7 FHIR v4.0.0 siap kirim ke API SatuSehat Kemenkes.
3. Buatkan halaman dashboard poliklinik dokter modern menggunakan Next.js 14 App Router dan Tailwind CSS yang menampilkan antrean pasien dan antarmuka input formulir SOAP berkecepatan tinggi.
Mari kita mulai dari langkah 1 sekarang!
```
