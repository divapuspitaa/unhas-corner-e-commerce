"use server";

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireApprovedSeller } from "@/lib/auth";

// Ubah "Hadin Official!" menjadi "hadin-official"
function slugify(text) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "toko"
  );
}

// Simpan file gambar ke public/images/stores (fungsi biasa, TIDAK di-export)
async function saveImage(file, storeName) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  const types = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
  const ext = types[file.type];
  if (!ext) throw new Error("Format gambar harus JPG, PNG, atau WEBP.");
  if (file.size > 2 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 2 MB.");

  const dir = path.join(process.cwd(), "public", "images", "stores");
  await mkdir(dir, { recursive: true });
  const name = `${slugify(storeName)}-${Date.now().toString(36)}${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/images/stores/${name}`;
}

export async function saveStore(prevState, formData) {
  const user = await requireApprovedSeller();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (name.length < 3) return { error: "Nama toko minimal 3 karakter." };
  if (!description) return { error: "Deskripsi toko wajib diisi." };

  // Gambar disimpan setelah validasi lolos; kalau tidak ada file baru, pakai gambar lama
  let imageUrl = String(formData.get("current_image") ?? "").trim();
  try {
    const uploaded = await saveImage(formData.get("image"), name);
    if (uploaded) imageUrl = uploaded;
  } catch (err) {
    return { error: err.message };
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

  revalidatePath("/seller/toko");
  return { ok: "Informasi toko tersimpan." };
}