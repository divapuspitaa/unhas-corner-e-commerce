"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { destroySession, getCurrentUser } from "@/lib/auth";

export async function logout() {
  await destroySession();
  redirect("/");
}

// Seller yang ditolak boleh menghapus akunnya sendiri
export async function deleteRejectedAccount() {
  const user = await getCurrentUser();
  if (user && user.role === "seller" && user.seller_status === "rejected") {
    await query("DELETE FROM users WHERE id = $1", [user.id]);
    await destroySession();
  }
  redirect("/");
}

// Pengguna yang dinonaktifkan mengajukan permohonan aktif kembali ke Admin
export async function requestAccountReactivation({ email, password, reason }) {
  const cleanEmail = String(email ?? "").trim().toLowerCase();
  const cleanPassword = String(password ?? "");
  const cleanReason = String(reason ?? "").trim();

  if (!cleanEmail || !cleanPassword) {
    return { ok: false, error: "Masukkan email dan password akun untuk mengajukan aktivasi." };
  }
  if (cleanReason.length < 10) {
    return { ok: false, error: "Tuliskan alasan pengajuan minimal 10 karakter." };
  }

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reactivation_requested_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reactivation_reason TEXT
  `);

  const { rows } = await query(
    "SELECT id, password_hash, is_active FROM users WHERE email = $1",
    [cleanEmail]
  );
  const user = rows[0];

  if (!user || !(await bcrypt.compare(cleanPassword, user.password_hash))) {
    return { ok: false, error: "Verifikasi email atau password gagal." };
  }
  if (user.is_active !== false) {
    return { ok: false, error: "Akun ini sudah dalam status aktif. Silakan masuk kembali." };
  }

  await query(
    `UPDATE users
     SET reactivation_requested_at = NOW(),
         reactivation_reason = $1,
         updated_at = NOW()
     WHERE id = $2`,
    [cleanReason.slice(0, 500), user.id]
  );

  return {
    ok: true,
    message: "Permohonan aktif kembali berhasil dikirim. Silakan tunggu persetujuan Admin.",
  };
}