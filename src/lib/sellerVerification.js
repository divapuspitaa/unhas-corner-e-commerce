import { stat } from "node:fs/promises";
import path from "node:path";
import { query } from "@/lib/db";

export async function ensureSellerVerificationColumns() {
  await Promise.all([
    query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS nik TEXT,
      ADD COLUMN IF NOT EXISTS ktp_image_url TEXT,
      ADD COLUMN IF NOT EXISTS selfie_image_url TEXT,
      ADD COLUMN IF NOT EXISTS ktp_blur_score DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS selfie_blur_score DOUBLE PRECISION,
      ADD COLUMN IF NOT EXISTS rejection_reason TEXT
    `),
    query(`
      ALTER TABLE stores
      ADD COLUMN IF NOT EXISTS address TEXT
    `),
  ]);
}

async function isSmallOrMissingFile(imageUrl) {
  if (!imageUrl || !imageUrl.startsWith("/")) return true;
  try {
    const abs = path.join(process.cwd(), "public", imageUrl.replace(/^\/+/, ""));
    const info = await stat(abs);
    return info.size < 15 * 1024;
  } catch {
    return false;
  }
}

/**
 * Evaluasi kelengkapan & kualitas data identitas pendaftar seller (NIK, Foto KTP, Foto Diri).
 * Mengembalikan daftar peringatan yang ditampilkan di Dashboard Admin dan Verifikasi Seller.
 */
export async function analyzeSellerVerification(u) {
  const issues = [];
  const rawNik = String(u.nik ?? "").trim();
  const digits = rawNik.replace(/\D/g, "");

  if (!rawNik) {
    issues.push("NIK belum diisi");
  } else {
    if (digits.length !== rawNik.length) {
      issues.push("NIK mengandung karakter selain angka");
    }
    if (digits.length < 16) {
      issues.push(`Angka NIK kurang (${digits.length}/16 digit)`);
    } else if (digits.length > 16) {
      issues.push(`Angka NIK berlebih (${digits.length}/16 digit)`);
    }
  }

  if (!u.ktp_image_url) {
    issues.push("Foto KTP belum diunggah");
  } else {
    const smallKtp = await isSmallOrMissingFile(u.ktp_image_url);
    const lowSharpness =
      typeof u.ktp_blur_score === "number" && Number.isFinite(u.ktp_blur_score) && u.ktp_blur_score < 60;
    if (smallKtp || lowSharpness) {
      issues.push("Foto KTP terindikasi blur / resolusi terlalu rendah");
    }
  }

  if (!u.selfie_image_url) {
    issues.push("Foto diri (selfie) belum diunggah");
  } else {
    const smallSelfie = await isSmallOrMissingFile(u.selfie_image_url);
    const lowSharpness =
      typeof u.selfie_blur_score === "number" &&
      Number.isFinite(u.selfie_blur_score) &&
      u.selfie_blur_score < 45;
    if (smallSelfie || lowSharpness) {
      issues.push("Foto diri terindikasi blur / resolusi terlalu rendah");
    }
  }

  return issues;
}
