"use server";

import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { withMsg } from "@/lib/flash";

const isPosInt = (n) => Number.isInteger(n) && n > 0;

// ---------- Verifikasi seller ----------
export async function setSellerStatus(formData) {
  await requireUser("admin");
  const id = Number(formData.get("userId"));
  const status = String(formData.get("status"));
  if (!isPosInt(id) || !["approved", "rejected", "pending"].includes(status)) {
    redirect(withMsg("/admin/verifikasi", "err", "Data verifikasi tidak valid."));
  }

  await query(
    "UPDATE users SET seller_status = $1, updated_at = NOW() WHERE id = $2 AND role = 'seller'",
    [status, id]
  );
  redirect(withMsg("/admin/verifikasi", "ok", `Seller ditandai ${status}.`));
}

// ---------- Manajemen user ----------
export async function updateUser(prevState, formData) {
  await requireUser("admin");
  const id = Number(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!isPosInt(id)) return { error: "ID pengguna tidak valid." };
  if (name.length < 3) return { error: "Nama minimal 3 karakter." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Format email tidak valid." };
  if (phone && !/^[0-9+\-\s]{8,20}$/.test(phone)) return { error: "Nomor telepon tidak valid." };

  try {
    await query("UPDATE users SET name=$1, email=$2, phone=$3, updated_at=NOW() WHERE id=$4", [name, email, phone || null, id]);
  } catch (err) {
    if (err.code === "23505") return { error: "Email sudah dipakai pengguna lain." };
    throw err;
  }
  redirect(withMsg("/admin/users", "ok", "Data pengguna diperbarui."));
}

export async function deleteUser(formData) {
  const admin = await requireUser("admin");
  const id = Number(formData.get("userId"));
  if (!isPosInt(id)) redirect(withMsg("/admin/users", "err", "ID pengguna tidak valid."));
  if (id === admin.id) redirect(withMsg("/admin/users", "err", "Anda tidak bisa menonaktifkan akun sendiri."));

  // Cek apakah pengguna (sebagai seller maupun buyer) masih memiliki pesanan aktif
  const { rows: activeOrders } = await query(
    `SELECT o.id
     FROM orders o
     LEFT JOIN stores s ON o.store_id = s.id
     WHERE (s.user_id = $1 OR o.buyer_id = $1)
       AND o.status IN ('menunggu_pembayaran', 'diproses', 'dikirim')
     LIMIT 1`,
    [id]
  );

  if (activeOrders.length > 0) {
    redirect(
      withMsg(
        "/admin/users",
        "err",
        "Gagal: Pengguna masih memiliki pesanan aktif yang belum selesai."
      )
    );
  }

  // Soft delete: nonaktifkan akun tanpa memutus relasi toko, produk, maupun riwayat transaksi
  await query(
    "UPDATE users SET is_active = false, updated_at = NOW() WHERE id = $1",
    [id]
  );
  redirect(withMsg("/admin/users", "ok", "Akun pengguna dinonaktifkan."));
}

// ---------- Kategori ----------
export async function saveCategory(formData) {
  await requireUser("admin");
  const rawId = formData.get("id");
  const id = rawId ? Number(rawId) : null;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (id !== null && !isPosInt(id)) redirect(withMsg("/admin/kategori", "err", "ID kategori tidak valid."));
  if (name.length < 3) redirect(withMsg("/admin/kategori", "err", "Nama kategori minimal 3 karakter."));

  try {
    if (id) {
      await query("UPDATE categories SET name=$1, description=$2 WHERE id=$3", [name, description || null, id]);
    } else {
      await query("INSERT INTO categories (name, description) VALUES ($1,$2)", [name, description || null]);
    }
  } catch (err) {
    if (err.code === "23505") redirect(withMsg("/admin/kategori", "err", "Nama kategori sudah ada."));
    throw err;
  }
  redirect(withMsg("/admin/kategori", "ok", id ? "Kategori diperbarui." : "Kategori ditambahkan."));
}

export async function deleteCategory(formData) {
  await requireUser("admin");
  const id = Number(formData.get("id"));
  if (!isPosInt(id)) redirect(withMsg("/admin/kategori", "err", "ID kategori tidak valid."));

  await query("DELETE FROM categories WHERE id = $1", [id]);
  redirect(withMsg("/admin/kategori", "ok", "Kategori dihapus (produk terkait menjadi tanpa kategori)."));
}

// ---------- Moderasi produk ----------
export async function adminDeleteProduct(formData) {
  await requireUser("admin");
  const id = Number(formData.get("id"));
  if (!isPosInt(id)) redirect(withMsg("/admin/produk", "err", "ID produk tidak valid."));

  await query("DELETE FROM products WHERE id = $1", [id]);
  redirect(withMsg("/admin/produk", "ok", "Produk dihapus."));
}