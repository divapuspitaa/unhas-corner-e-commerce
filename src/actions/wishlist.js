"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { getCurrentUser, requireUser, safePath } from "@/lib/auth";

export async function toggleWishlistAction(productId) {
  const user = await getCurrentUser();
  if (!user) {
    return { ok: false, requireLogin: true };
  }
  if (user.role !== "buyer") {
    return { ok: false, error: "Fitur wishlist hanya tersedia untuk akun Mahasiswa (Buyer)." };
  }

  const id = Number(productId);
  if (!Number.isInteger(id) || id <= 0) {
    return { ok: false, error: "Produk tidak valid." };
  }

  const prodRes = await query("SELECT name FROM products WHERE id = $1", [id]);
  const productName = prodRes.rows[0]?.name || "Produk";

  const del = await query("DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2", [user.id, id]);
  revalidatePath("/wishlist");

  if (del.rowCount === 0) {
    await query("INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [user.id, id]);
    return {
      ok: true,
      wished: true,
      message: `Wishlist Anda bertambah! "${productName}" berhasil disimpan.`,
    };
  }

  return {
    ok: true,
    wished: false,
    message: `"${productName}" berhasil dihapus dari wishlist.`,
  };
}

export async function toggleWishlist(formData) {
  const user = await requireUser("buyer");
  const productId = Number(formData.get("productId"));
  const returnTo = safePath(String(formData.get("returnTo") ?? ""), "/wishlist");
  if (!Number.isInteger(productId) || productId <= 0) redirect(returnTo);

  const del = await query("DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2", [user.id, productId]);
  if (del.rowCount === 0) {
    await query("INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [user.id, productId]);
  }
  redirect(returnTo);
}