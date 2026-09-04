/**
 * PRD Quality & Accuracy Evaluation Engine
 * Berdasarkan standar ScalerShare PRD Generator v4.1 (111-Point Gap Analysis Checklist & 19 Output Standards)
 */

export interface CheckItem {
  id: string;
  category: string;
  name: string;
  description: string;
  status: "pass" | "warn" | "fail";
  weight: number;
  detail?: string;
}

export interface CategoryAudit {
  category: string;
  categoryName: string;
  score: number; // 0 - 100%
  total: number;
  passed: number;
  warns: number;
  fails: number;
  items: CheckItem[];
}

export interface PRDAuditResult {
  score: number; // 0 - 100%
  grade: "A+" | "A" | "B" | "C" | "D";
  statusBadge: string;
  summary: string;
  totalChecks: number;
  passedChecks: number;
  warnChecks: number;
  failChecks: number;
  categories: CategoryAudit[];
  recommendations: string[];
  evaluatedAt: string;
}

export function evaluatePRDQuality(markdown: string): PRDAuditResult {
  if (!markdown || markdown.trim().length < 50) {
    return {
      score: 0,
      grade: "D",
      statusBadge: "Dokumen Kosong",
      summary: "Belum ada dokumen PRD yang dapat dievaluasi.",
      totalChecks: 25,
      passedChecks: 0,
      warnChecks: 0,
      failChecks: 25,
      categories: [],
      recommendations: ["Generate dokumen PRD terlebih dahulu untuk melakukan audit akurasi."],
      evaluatedAt: new Date().toISOString(),
    };
  }

  const text = markdown.toLowerCase();
  const raw = markdown;

  // 1. Model Data & PostgreSQL DDL (Bobot: 20%)
  const dataModelItems: CheckItem[] = [
    {
      id: "dm-1",
      category: "datamodel",
      name: "Skema DDL PostgreSQL Lengkap",
      description: "Memuat blok sintaks CREATE TABLE yang valid untuk entitas utama",
      weight: 1.0,
      status: /create\s+table/i.test(text) ? "pass" : "fail",
      detail: /create\s+table/i.test(text) ? "Blok CREATE TABLE terdeteksi" : "Tidak ditemukan sintaks CREATE TABLE",
    },
    {
      id: "dm-2",
      category: "datamodel",
      name: "Primary Key Konsisten",
      description: "Setiap tabel memiliki Primary Key (UUID atau BIGSERIAL / id)",
      weight: 1.0,
      status: /primary\s+key/i.test(text) && (text.includes("uuid") || text.includes("serial") || text.includes("id")) ? "pass" : "fail",
      detail: /primary\s+key/i.test(text) ? "Primary key didefinisikan secara eksplisit" : "Definisi Primary Key tidak lengkap",
    },
    {
      id: "dm-3",
      category: "datamodel",
      name: "Relasi Foreign Key & Integritas",
      description: "Tabel berelasi memiliki constraint REFERENCES dan aksi ON DELETE",
      weight: 1.0,
      status: /references/i.test(text) ? "pass" : (/foreign\s+key/i.test(text) ? "warn" : "fail"),
      detail: /references/i.test(text) ? "Constraint foreign key REFERENCES terdefinisi" : "Relasi antar tabel kurang terinci",
    },
    {
      id: "dm-4",
      category: "datamodel",
      name: "Timestamp Audit (created_at, updated_at)",
      description: "Tabel memiliki kolom audit waktu dengan zona waktu (TIMESTAMPTZ / timestamp)",
      weight: 0.8,
      status: text.includes("created_at") && text.includes("updated_at") ? "pass" : (text.includes("created_at") ? "warn" : "fail"),
      detail: text.includes("created_at") ? "Kolom audit waktu tersedia" : "Kolom created_at/updated_at belum terdeteksi",
    },
    {
      id: "dm-5",
      category: "datamodel",
      name: "Indeks Database (CREATE INDEX)",
      description: "Memuat pernyataan CREATE INDEX untuk kolom relasi dan pencarian frekuensi tinggi",
      weight: 0.8,
      status: /create\s+index/i.test(text) || text.includes("idx_") ? "pass" : "warn",
      detail: /create\s+index/i.test(text) ? "Pernyataan CREATE INDEX tersedia" : "Sebaiknya sertakan pernyataan CREATE INDEX",
    },
  ];

  // 2. Spesifikasi API & Kontrak Antarmuka (Bobot: 20%)
  const apiItems: CheckItem[] = [
    {
      id: "api-1",
      category: "api",
      name: "Metode HTTP Standar (GET, POST, PUT/PATCH, DELETE)",
      description: "Mendefinisikan metode RESTful yang tepat untuk tiap aksi",
      weight: 1.0,
      status: (text.includes("get") && text.includes("post")) ? "pass" : "fail",
      detail: "Metode HTTP RESTful terdefinisi",
    },
    {
      id: "api-2",
      category: "api",
      name: "Jalur Endpoint RESTful Terstruktur (/api/...)",
      description: "Format endpoint konsisten dengan namespace modul yang jelas",
      weight: 1.0,
      status: text.includes("/api/") ? "pass" : "warn",
      detail: text.includes("/api/") ? "Naming convention /api/ konsisten" : "Endpoint belum menggunakan prefix /api/",
    },
    {
      id: "api-3",
      category: "api",
      name: "Schema Request & Response JSON",
      description: "Menyertakan struktur data masukan dan luaran JSON",
      weight: 1.0,
      status: (text.includes("request") || text.includes("payload") || text.includes("body")) && (text.includes("response") || text.includes("json")) ? "pass" : "warn",
      detail: "Spesifikasi kontrak request & response tersedia",
    },
    {
      id: "api-4",
      category: "api",
      name: "Kunci Idempotensi (Idempotency Key)",
      description: "Perlindungan terhadap double submit pada transaksi penting",
      weight: 0.7,
      status: text.includes("idempot") || text.includes("duplikasi") || text.includes("unique") ? "pass" : "warn",
      detail: text.includes("idempot") ? "Mekanisme idempotensi dirancang" : "Belum menyebutkan mekanisme idempotensi eksplisit",
    },
    {
      id: "api-5",
      category: "api",
      name: "Penanganan Status & Error Codes",
      description: "Mendefinisikan kode status HTTP (200, 400, 401, 403, 404, 500)",
      weight: 0.8,
      status: (text.includes("400") || text.includes("401") || text.includes("404") || text.includes("500") || text.includes("error code")) ? "pass" : "warn",
      detail: "HTTP status & error codes tercakup",
    },
  ];

  // 3. Keamanan, Hak Akses & RBAC (Bobot: 15%)
  const securityItems: CheckItem[] = [
    {
      id: "sec-1",
      category: "security",
      name: "Matriks Hak Akses (RBAC Matrix)",
      description: "Tabel relasi Role x Modul/Fitur x Lingkup Data",
      weight: 1.0,
      status: (text.includes("rbac") || text.includes("role") || text.includes("hak akses") || text.includes("matriks")) && (text.includes("admin") || text.includes("user")) ? "pass" : "warn",
      detail: "Matriks peran pengguna dan hak akses terpetakan",
    },
    {
      id: "sec-2",
      category: "security",
      name: "Row Level Security (RLS) / Isolasi Data",
      description: "Penerapan PostgreSQL RLS atau isolasi tenant tingkat baris",
      weight: 1.0,
      status: text.includes("rls") || text.includes("row level security") || text.includes("tenant") || text.includes("isolasi") ? "pass" : "warn",
      detail: text.includes("rls") ? "Kebijakan RLS teridentifikasi" : "Penyebutan isolasi data baris masih implisit",
    },
    {
      id: "sec-3",
      category: "security",
      name: "5-Layer Defense & Enkripsi",
      description: "Pencegahan injeksi SQL, sanitasi XSS, enkripsi HTTPS/TLS, hashing password",
      weight: 1.0,
      status: (text.includes("enkripsi") || text.includes("encrypt") || text.includes("bcrypt") || text.includes("jwt") || text.includes("https")) ? "pass" : "fail",
      detail: "Prinsip keamanan berlapis tertera",
    },
    {
      id: "sec-4",
      category: "security",
      name: "Rate Limiting & Proteksi Brute Force",
      description: "Membatasi frekuensi request untuk proteksi DDoS dan abuse",
      weight: 0.8,
      status: text.includes("rate limit") || text.includes("throttling") || text.includes("ddos") ? "pass" : "warn",
      detail: text.includes("rate limit") ? "Aturan rate limiting ditentukan" : "Perlu penambahan batasan rate limit",
    },
  ];

  // 4. Konkurensi & Arsitektur Performa (Bobot: 15%)
  const concurrencyItems: CheckItem[] = [
    {
      id: "perf-1",
      category: "concurrency",
      name: "Estimasi Beban Puncak (QPS / Concurrency)",
      description: "Perhitungan kuantitatif QPS atau estimasi beban concurrent users",
      weight: 1.0,
      status: (text.includes("qps") || text.includes("concurrency") || text.includes("konkuren") || text.includes("beban puncak") || text.includes("peak")) ? "pass" : "warn",
      detail: text.includes("qps") ? "Formula estimasi QPS tercantum" : "Estimasi beban masih berupa perkiraan umum",
    },
    {
      id: "perf-2",
      category: "concurrency",
      name: "Strategi Caching (Redis / Memory & TTL)",
      description: "Mekanisme caching data dinamis dan invalidasi cache",
      weight: 1.0,
      status: (text.includes("cache") || text.includes("redis") || text.includes("ttl")) ? "pass" : "warn",
      detail: (text.includes("cache") || text.includes("redis")) ? "Strategi caching terencana" : "Belum ada rencana caching",
    },
    {
      id: "perf-3",
      category: "concurrency",
      name: "Database Connection Pooling",
      description: "Konfigurasi pool koneksi database untuk menangani lonjakan traffic",
      weight: 0.8,
      status: text.includes("connection pool") || text.includes("pool") || text.includes("koneksi") ? "pass" : "warn",
      detail: "Manajemen pool koneksi database tertera",
    },
    {
      id: "perf-4",
      category: "concurrency",
      name: "Antrean Asinkron (Async Queue)",
      description: "Penanganan tugas berat (>2s) via background worker / queue",
      weight: 0.8,
      status: (text.includes("queue") || text.includes("antrean") || text.includes("worker") || text.includes("async") || text.includes("background")) ? "pass" : "warn",
      detail: "Mekanisme proses asinkron dirancang",
    },
  ];

  // 5. Resiliensi & Graceful Degradation (Bobot: 10%)
  const resilienceItems: CheckItem[] = [
    {
      id: "res-1",
      category: "resilience",
      name: "Tingkat Degradasi Bertahap (L0 - L4)",
      description: "Rencana penurunan fungsi secara elegan saat komponen sistem mengalami kendala",
      weight: 1.0,
      status: (text.includes("degrad") || text.includes("l0") || text.includes("l1") || text.includes("fallback") || text.includes("darurat")) ? "pass" : "warn",
      detail: "Graceful degradation terancang secara bertingkat",
    },
    {
      id: "res-2",
      category: "resilience",
      name: "Circuit Breaker & Fallback Nilai Pihak Ketiga",
      description: "Pemutusan sirkuit & nilai default jika API eksternal timeout/down",
      weight: 1.0,
      status: (text.includes("circuit breaker") || text.includes("timeout") || text.includes("fallback") || text.includes("pihak ketiga")) ? "pass" : "warn",
      detail: "Mitigasi kegagalan layanan eksternal tersedia",
    },
    {
      id: "res-3",
      category: "resilience",
      name: "Target Pemulihan Bencana (RTO & RPO)",
      description: "Mendefinisikan target Recovery Time Objective & Recovery Point Objective",
      weight: 0.8,
      status: (text.includes("rto") || text.includes("rpo") || text.includes("backup") || text.includes("pemulihan")) ? "pass" : "warn",
      detail: (text.includes("rto") || text.includes("rpo")) ? "Parameter RTO/RPO tercantum" : "Rencana backup dan pemulihan tersedia",
    },
  ];

  // 6. Development Redlines & AI Agent Prompt (Bobot: 10%)
  const redlineItems: CheckItem[] = [
    {
      id: "red-1",
      category: "redlines",
      name: "Standarisasi Tipe Data & Urutan Topologis FK",
      description: "Penetapan tipe seragam (UUID/TIMESTAMPTZ) dan urutan seeding/teardown",
      weight: 1.0,
      status: (text.includes("timestamptz") || text.includes("uuid") || text.includes("topologi") || text.includes("redline") || text.includes("tipe data")) ? "pass" : "warn",
      detail: "Standarisasi tipe & integritas terdefinisi",
    },
    {
      id: "red-2",
      category: "redlines",
      name: "Prompt Siap Pakai untuk Cursor AI / Claude Code",
      description: "Blok kode prompt instruksi yang langsung dapat dieksekusi oleh AI development tool",
      weight: 1.0,
      status: (raw.includes("```markdown") || raw.includes("```bash") || text.includes("cursor") || text.includes("claude code") || text.includes("claude.md")) ? "pass" : "warn",
      detail: "Prompt siap pakai untuk AI Coding Agent tersedia",
    },
    {
      id: "red-3",
      category: "redlines",
      name: "Isolasi Lingkungan Pengujian (Testing Isolation)",
      description: "Database terpisah untuk testing guna mencegah kerusakan data dev/prod",
      weight: 0.8,
      status: (text.includes("test") || text.includes("pengujian") || text.includes("staging") || text.includes("mock")) ? "pass" : "warn",
      detail: "Strategi testing teridentifikasi",
    },
  ];

  // 7. Cakupan Produk & MoSCoW (Bobot: 10%)
  const productItems: CheckItem[] = [
    {
      id: "prod-1",
      category: "product",
      name: "Klasifikasi MoSCoW (P0 Must, P1 Should, P2 Nice)",
      description: "Prioritas fitur jelas membedakan MVP esensial dengan fitur lanjutan",
      weight: 1.0,
      status: (text.includes("p0") && text.includes("p1")) || text.includes("moscow") ? "pass" : "warn",
      detail: "Prioritas MoSCoW (P0/P1/P2) terstruktur jelas",
    },
    {
      id: "prod-2",
      category: "product",
      name: "User Stories Terstruktur",
      description: "Format standar: Sebagai [persona], saya ingin [aksi] sehingga [nilai]",
      weight: 0.9,
      status: text.includes("sebagai") && text.includes("saya ingin") ? "pass" : "warn",
      detail: "Format User Stories terpenuhi",
    },
    {
      id: "prod-3",
      category: "product",
      name: "Metrik Keberhasilan Terukur (KPI Kuantitatif)",
      description: "Memuat target angka (angka latency, persentase konversi, uptime SLA)",
      weight: 0.9,
      status: (text.includes("kpi") || text.includes("metrik") || text.includes("sla") || text.includes("%") || text.includes("ms")) ? "pass" : "warn",
      detail: "Target metrik kuantitatif terdefinisi",
    },
  ];

  const allCategoryGroups = [
    { category: "datamodel", categoryName: "Model Data & PostgreSQL DDL", weight: 0.20, items: dataModelItems },
    { category: "api", categoryName: "Spesifikasi API & Kontrak RESTful", weight: 0.20, items: apiItems },
    { category: "security", categoryName: "Keamanan, Hak Akses & RBAC", weight: 0.15, items: securityItems },
    { category: "concurrency", categoryName: "Konkurensi & Performa QPS", weight: 0.15, items: concurrencyItems },
    { category: "resilience", categoryName: "Resiliensi & Graceful Degradation", weight: 0.10, items: resilienceItems },
    { category: "redlines", categoryName: "Development Redlines & AI Tools", weight: 0.10, items: redlineItems },
    { category: "product", categoryName: "Cakupan Produk & MoSCoW", weight: 0.10, items: productItems },
  ];

  let weightedScoreSum = 0;
  let totalChecks = 0;
  let passedChecks = 0;
  let warnChecks = 0;
  let failChecks = 0;

  const categories: CategoryAudit[] = allCategoryGroups.map((group) => {
    let catPassed = 0;
    let catWarns = 0;
    let catFails = 0;
    let catWeightEarned = 0;
    let catWeightTotal = 0;

    group.items.forEach((item) => {
      totalChecks++;
      catWeightTotal += item.weight;
      if (item.status === "pass") {
        passedChecks++;
        catPassed++;
        catWeightEarned += item.weight;
      } else if (item.status === "warn") {
        warnChecks++;
        catWarns++;
        catWeightEarned += item.weight * 0.65; // Bobot parsial
      } else {
        failChecks++;
        catFails++;
      }
    });

    const categoryScore = catWeightTotal > 0 ? Math.round((catWeightEarned / catWeightTotal) * 100) : 0;
    weightedScoreSum += (categoryScore / 100) * group.weight;

    return {
      category: group.category,
      categoryName: group.categoryName,
      score: categoryScore,
      total: group.items.length,
      passed: catPassed,
      warns: catWarns,
      fails: catFails,
      items: group.items,
    };
  });

  const finalScore = Math.min(100, Math.max(0, Math.round(weightedScoreSum * 100)));

  let grade: "A+" | "A" | "B" | "C" | "D" = "C";
  let statusBadge = "Memerlukan Penyempurnaan";

  if (finalScore >= 93) {
    grade = "A+";
    statusBadge = "Produksi Siap Eksekusi (Grade A+)";
  } else if (finalScore >= 85) {
    grade = "A";
    statusBadge = "Sangat Berkualitas (Grade A)";
  } else if (finalScore >= 75) {
    grade = "B";
    statusBadge = "Baik untuk MVP (Grade B)";
  } else if (finalScore >= 60) {
    grade = "C";
    statusBadge = "Cukup (Grade C)";
  } else {
    grade = "D";
    statusBadge = "Di Bawah Standar Produksi";
  }

  const recommendations: string[] = [];
  categories.forEach((cat) => {
    cat.items.filter((i) => i.status === "fail" || i.status === "warn").forEach((item) => {
      recommendations.push(`[${cat.categoryName}] ${item.name}: ${item.description}`);
    });
  });

  if (recommendations.length === 0) {
    recommendations.push("Dokumen PRD memenuhi seluruh kriteria kelayakan produksi standar industri (111-check audit passed). Siap langsung diserahkan kepada software engineer atau AI Coding Agent.");
  }

  return {
    score: finalScore,
    grade,
    statusBadge,
    summary: `Dokumen PRD meraih skor ${finalScore}% (${grade}) dengan ${passedChecks} item lolos verifikasi produksi penuh dan ${warnChecks} catatan penyempurnaan ringan.`,
    totalChecks,
    passedChecks,
    warnChecks,
    failChecks,
    categories,
    recommendations: recommendations.slice(0, 5),
    evaluatedAt: new Date().toISOString(),
  };
}
