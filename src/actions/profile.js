"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { query, withTransaction } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withMsg } from "@/lib/flash";

const isPosInt = (n) => Number.isInteger(n) && n > 0;

export async function updateProfile(prevState, formData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const newPassword = String(formData.get("newPassword") ?? "");

  if (name.length < 3) return { error: "Nama minimal 3 karakter." };
  if (phone && !/^[0-9+\-\s]{8,20}$/.test(phone)) return { error: "Nomor telepon tidak valid." };
  if (newPassword && newPassword.length < 6) return { error: "Password baru minimal 6 karakter." };

  if (newPassword) {
    const hash = await bcrypt.hash(newPassword, 10);
    await query("UPDATE users SET name=$1, phone=$2, password_hash=$3, updated_at=NOW() WHERE id=$4", [name, phone || null, hash, user.id]);
  } else {
    await query("UPDATE users SET name=$1, phone=$2, updated_at=NOW() WHERE id=$3", [name, phone || null, user.id]);
  }
  return { ok: "Profil berhasil diperbarui." };
}

export async function changePassword(prevState, formData) {
  const user = await requireUser();
  const currentPassword = String(formData.get("currentPassword") ?? "");
  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  if (!currentPassword) return { error: "Password saat ini wajib diisi." };
  if (newPassword.length < 6) return { error: "Password baru minimal 6 karakter." };
  if (newPassword !== confirmPassword) return { error: "Konfirmasi password baru tidak sama." };

  const { rows } = await query("SELECT password_hash FROM users WHERE id = $1", [user.id]);
  if (!rows[0] || !(await bcrypt.compare(currentPassword, rows[0].password_hash))) {
    return { error: "Password saat ini salah." };
  }

  const hash = await bcrypt.hash(newPassword, 10);
  await query("UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2", [hash, user.id]);
  return { ok: "Password berhasil diubah." };
}

export async function addAddress(prevState, formData) {
  const user = await requireUser("buyer");
  const label = String(formData.get("label") ?? "").trim() || "Rumah";
  const recipient = String(formData.get("recipient_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const fullAddress = String(formData.get("full_address") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const postal = String(formData.get("postal_code") ?? "").trim();
  const makeDefault = formData.get("is_default") === "on";

  if (!recipient || !phone || !fullAddress || !city) return { error: "Nama penerima, telepon, alamat, dan kota wajib diisi." };
  if (!/^[0-9+\-\s]{8,20}$/.test(phone)) return { error: "Nomor telepon tidak valid." };
  if (postal && !/^[0-9]{5}$/.test(postal)) return { error: "Kode pos harus 5 digit." };

  await withTransaction(async (client) => {
    const count = (await client.query("SELECT COUNT(*)::int AS n FROM addresses WHERE user_id = $1", [user.id])).rows[0].n;
    const isDefault = makeDefault || count === 0;
    if (isDefault) await client.query("UPDATE addresses SET is_default = FALSE WHERE user_id = $1", [user.id]);
    await client.query(
      `INSERT INTO addresses (user_id, label, recipient_name, phone, full_address, city, postal_code, is_default)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [user.id, label, recipient, phone, fullAddress, city, postal || null, isDefault]
    );
  });
  return { ok: "Alamat ditambahkan." };
}

export async function deleteAddress(formData) {
  const user = await requireUser("buyer");
  const id = Number(formData.get("id"));
  if (!isPosInt(id)) redirect(withMsg("/buyer/alamat", "err", "ID alamat tidak valid."));

  await query("DELETE FROM addresses WHERE id = $1 AND user_id = $2", [id, user.id]);
  redirect(withMsg("/buyer/alamat", "ok", "Alamat dihapus."));
}

export async function setDefaultAddress(formData) {
  const user = await requireUser("buyer");
  const id = Number(formData.get("id"));
  if (!isPosInt(id)) redirect(withMsg("/buyer/alamat", "err", "ID alamat tidak valid."));

  await withTransaction(async (client) => {
    await client.query("UPDATE addresses SET is_default = FALSE WHERE user_id = $1", [user.id]);
    await client.query("UPDATE addresses SET is_default = TRUE WHERE id = $1 AND user_id = $2", [id, user.id]);
  });
  redirect(withMsg("/buyer/alamat", "ok", "Alamat utama diubah."));
}