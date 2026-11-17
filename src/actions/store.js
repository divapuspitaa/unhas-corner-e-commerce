"use server";

import { query } from "@/lib/db";
import { requireApprovedSeller } from "@/lib/auth";

export async function saveStore(prevState, formData) {
  const user = await requireApprovedSeller();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const imageUrl = String(formData.get("image_url") ?? "").trim();

  if (name.length < 3) return { error: "Nama toko minimal 3 karakter." };
  if (!description) return { error: "Deskripsi toko wajib diisi." };
  if (imageUrl && !(imageUrl.startsWith("/") || /^https?:\/\//.test(imageUrl))) {
    return { error: "Gambar harus berupa URL http(s) atau path yang diawali /." };
  }

  try {
    await query(
      `INSERT INTO stores (user_id, name, description, image_url) VALUES ($1,$2,$3,$4)
       ON CONFLICT (user_id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
         image_url = EXCLUDED.image_url, updated_at = NOW()`,
      [user.id, name, description, imageUrl || null]
    );
  } catch (err) {
    if (err.code === "23505") return { error: "Nama toko sudah dipakai toko lain." };
    throw err;
  }
  return { ok: "Informasi toko tersimpan." };
}
