import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, withTransaction } from "@/lib/db";
import { createSession, homePathFor } from "@/lib/auth";
import { ensureSellerVerificationColumns } from "@/lib/sellerVerification";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fail = (error, status = 400) => NextResponse.json({ error }, { status });

async function saveVerificationImage(file, prefix) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  const types = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
  const ext = types[file.type];
  if (!ext) throw new Error("Format foto KTP/diri harus JPG, PNG, atau WEBP.");
  if (file.size > 5 * 1024 * 1024) throw new Error("Ukuran foto maksimal 5 MB.");

  const dir = path.join(process.cwd(), "public", "images", "verifications");
  await mkdir(dir, { recursive: true });
  const filename = `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}${ext}`;
  await writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return `/images/verifications/${filename}`;
}

// POST /api/register (mendukung JSON maupun multipart/form-data untuk foto KTP & foto diri seller)
export async function POST(request) {
  await ensureSellerVerificationColumns();

  const contentType = request.headers.get("content-type") || "";
  let b = {};
  let ktpFile = null;
  let selfieFile = null;

  try {
    if (contentType.includes("multipart/form-data")) {
      const fd = await request.formData();
      b = Object.fromEntries(fd.entries());
      ktpFile = fd.get("ktpImage");
      selfieFile = fd.get("selfieImage");
    } else {
      b = await request.json();
    }
  } catch {
    return fail("Request tidak valid.");
  }

  const role = String(b.role ?? "buyer");
  const storeName = String(b.storeName ?? "").trim();
  const storeAddress = String(b.storeAddress ?? "").trim();
  const storeDescription = String(b.storeDescription ?? "").trim();
  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const phone = String(b.phone ?? "").trim();
  const password = String(b.password ?? "");
  const confirm = String(b.confirm ?? "");
  const nik = String(b.nik ?? "").trim();
  const ktpBlurRaw = Number(b.ktpBlurScore);
  const selfieBlurRaw = Number(b.selfieBlurScore);
  const ktpBlurScore = b.ktpBlurScore !== "" && Number.isFinite(ktpBlurRaw) ? ktpBlurRaw : null;
  const selfieBlurScore = b.selfieBlurScore !== "" && Number.isFinite(selfieBlurRaw) ? selfieBlurRaw : null;

  if (!["buyer", "seller"].includes(role)) return fail("Role tidak valid.");
  if (name.length < 3) return fail("Nama lengkap minimal 3 karakter.");
  if (!EMAIL_RE.test(email)) return fail("Format email tidak valid.");
  if (phone && !/^[0-9+\-\s]{8,20}$/.test(phone)) return fail("Nomor telepon tidak valid.");
  if (password.length < 6) return fail("Password minimal 6 karakter.");
  if (password !== confirm) return fail("Konfirmasi password tidak sama.");

  if (role === "seller") {
    if (!email.endsWith("@unhascorner.id")) {
      return fail("Pendaftaran Toko wajib menggunakan email @unhascorner.id.");
    }
    if (storeName.length < 3) return fail("Nama toko minimal 3 karakter.");
    if (storeAddress.length < 5) return fail("Alamat toko wajib diisi (minimal 5 karakter).");
    if (!nik) return fail("NIK wajib diisi.");
    if (!ktpFile || typeof ktpFile === "string" || ktpFile.size === 0) {
      return fail("Foto KTP wajib diunggah.");
    }
    if (!selfieFile || typeof selfieFile === "string" || selfieFile.size === 0) {
      return fail("Foto diri dengan KTP wajib diunggah.");
    }
  }

  const existingUser = await query(
    "SELECT id, role, seller_status FROM users WHERE email = $1",
    [email]
  );
  if (existingUser.rowCount > 0) {
    const ex = existingUser.rows[0];
    if (!(ex.role === "seller" && ex.seller_status === "rejected")) {
      return fail("Email sudah terdaftar.", 409);
    }
  }

  if (role === "seller") {
    const existingStore = await query(
      `SELECT s.user_id, u.role, u.seller_status
       FROM stores s JOIN users u ON u.id = s.user_id
       WHERE LOWER(s.name) = LOWER($1)`,
      [storeName]
    );
    const conflict = existingStore.rows.find(
      (r) => !(r.role === "seller" && r.seller_status === "rejected" && r.user_id === existingUser.rows[0]?.id)
    );
    if (conflict) {
      return fail("Nama toko sudah dipakai.", 409);
    }
  }

  let ktpUrl = null;
  let selfieUrl = null;
  if (role === "seller") {
    try {
      ktpUrl = await saveVerificationImage(ktpFile, "ktp");
      selfieUrl = await saveVerificationImage(selfieFile, "selfie");
    } catch (err) {
      return fail(err.message);
    }
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await withTransaction(async (client) => {
    // Jika seller sebelumnya ditolak, hapus akun lamanya agar bisa mendaftar ulang dari awal
    if (existingUser.rows[0]?.role === "seller" && existingUser.rows[0]?.seller_status === "rejected") {
      await client.query("DELETE FROM users WHERE id = $1", [existingUser.rows[0].id]);
    }

    const res = await client.query(
      `INSERT INTO users (name, email, password_hash, phone, role, seller_status, nik, ktp_image_url, selfie_image_url, ktp_blur_score, selfie_blur_score)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id, role, seller_status`,
      [
        name,
        email,
        hash,
        phone || null,
        role,
        role === "seller" ? "pending" : null,
        role === "seller" ? nik : null,
        ktpUrl,
        selfieUrl,
        ktpBlurScore,
        selfieBlurScore,
      ]
    );
    if (role === "seller") {
      await client.query(
        "INSERT INTO stores (user_id, name, address, description) VALUES ($1,$2,$3,$4)",
        [
          res.rows[0].id,
          storeName,
          storeAddress || null,
          storeDescription || "Toko baru di UnhasCorner.",
        ]
      );
    }
    return res.rows[0];
  });

  await createSession(user);
  return NextResponse.json({ redirect: homePathFor(user) }, { status: 201 });
}
