import { evaluatePRDQuality } from "../lib/evaluator";
import { generateFallbackPRD } from "../lib/prompt";

const sampleInput = {
  nama: "MediBridge AI",
  ide: "Platform EHR dan Telemedicine Kemenkes SatuSehat",
  fitur: "Registrasi Pasien, Telekonsultasi, Rekam Medis Elektronik, E-Resep, Bridging BPJS, Audit Trail",
  target: "Dokter, Pasien, Manajemen RS",
  stack: "Next.js 14 + PostgreSQL + LiveKit WebRTC",
};

const generated = generateFallbackPRD(sampleInput);
const audit = evaluatePRDQuality(generated);

console.log("=== HASIL EVALUASI AKURASI PRD GENERATOR (ScalerShare 111-Check Standard) ===");
console.log("Skor Akhir:", audit.score + "%");
console.log("Grade:", audit.grade);
console.log("Status:", audit.statusBadge);
console.log("Total Checks:", audit.totalChecks);
console.log("Passed:", audit.passedChecks);
console.log("Warnings:", audit.warnChecks);
console.log("Failed:", audit.failChecks);
console.log("\nRincian per Kategori:");
audit.categories.forEach((cat) => {
  console.log(`- ${cat.categoryName}: ${cat.score}% (${cat.passed}/${cat.total} Passed)`);
});
console.log("\nRekomendasi Peningkatan:", audit.recommendations);
