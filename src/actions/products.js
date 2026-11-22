"use server";

import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { requireApprovedSeller } from "@/lib/auth";
import { getStoreByUser } from "@/lib/queries";
import { withMsg } from "@/lib/flash";

// Ubah "Ganci Unhas!" menjadi "ganci-unhas"
function slugify(text) {
  return (
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 50) || "produk"
  );
}

// Simpan file gambar ke public/images/products (fungsi biasa, TIDAK di-export)
async function saveImage(file, productName) {
  if (!file || typeof file === "string" || file.size === 0) return null;
  const types = { "image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp" };
  const ext = types[file.type];
  if (!ext) throw new Error("Format gambar harus JPG, PNG, atau WEBP.");
  if (file.size > 2 * 1024 * 1024) throw new Error("Ukuran gambar maksimal 2 MB.");

  const dir = path.join(process.cwd(), "public", "images", "products");
  await mkdir(dir, { recursive: true });
  const name = `${slugify(productName)}-${Date.now().toString(36)}${ext}`;
  await writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));
  return `/images/products/${name}`;
}

// Validasi bersama untuk create & edit produk (semua field wajib)
async function parseProduct(formData) {
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const stock = Number(formData.get("stock"));
  const categoryId = Number(formData.get("category_id"));

  if (name.length < 3) return { error: "Nama produk minimal 3 karakter." };
  if (!description) return { error: "Deskripsi wajib diisi." };
  if (!Number.isFinite(price) || price < 0 || formData.get("price") === "") return { error: "Harga harus angka dan tidak negatif." };
  if (!Number.isInteger(stock) || stock < 0 || formData.get("stock") === "") return { error: "Stok harus bilangan bulat tidak negatif." };
  if (!categoryId) return { error: "Kategori wajib dipilih." };

  const cat = await query("SELECT 1 FROM categories WHERE id = $1", [categoryId]);
  if (cat.rowCount === 0) return { error: "Kategori tidak valid." };

  // Gambar disimpan paling akhir, setelah semua validasi lolos
  let imageUrl = String(formData.get("current_image") ?? "").trim();
  try {
    const uploaded = await saveImage(formData.get("image"), name);
    if (uploaded) imageUrl = uploaded;
  } catch (err) {
    return { error: err.message };
  }
  if (!imageUrl) return { error: "Gambar produk wajib diunggah." };

  return { data: { name, description, price, stock, imageUrl, categoryId } };
}

export async function createProduct(prevState, formData) {
  const user = await requireApprovedSeller();
  const store = await getStoreByUser(user.id);
  if (!store) redirect(withMsg("/seller/toko", "err", "Lengkapi data toko terlebih dahulu."));

  const { error, data } = await parseProduct(formData);
  if (error) return { error };

  await query(
    `INSERT INTO products (store_id, category_id, name, description, price, stock, image_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7)`,
    [store.id, data.categoryId, data.name, data.description, data.price, data.stock, data.imageUrl]
  );
  redirect(withMsg("/seller/produk", "ok", "Produk berhasil ditambahkan."));
}

export async function updateProduct(prevState, formData) {
  const user = await requireApprovedSeller();
  const id = Number(formData.get("id"));
  const { error, data } = await parseProduct(formData);
  if (error) return { error };

  const res = await query(
    `UPDATE products p SET category_id=$1, name=$2, description=$3, price=$4, stock=$5, image_url=$6, updated_at=NOW()
     FROM stores s WHERE p.id = $7 AND p.store_id = s.id AND s.user_id = $8`,
    [data.categoryId, data.name, data.description, data.price, data.stock, data.imageUrl, id, user.id]
  );
  if (res.rowCount === 0) return { error: "Produk tidak ditemukan atau bukan milik Anda." };
  redirect(withMsg("/seller/produk", "ok", "Produk berhasil diperbarui."));
}

export async function deleteProduct(formData) {
  const user = await requireApprovedSeller();
  const id = Number(formData.get("id"));
  await query(
    "DELETE FROM products p USING stores s WHERE p.id = $1 AND p.store_id = s.id AND s.user_id = $2",
    [id, user.id]
  );
  redirect(withMsg("/seller/produk", "ok", "Produk dihapus."));
}