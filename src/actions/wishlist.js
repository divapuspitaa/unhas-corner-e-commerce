"use server";

import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { requireUser, safePath } from "@/lib/auth";

export async function toggleWishlist(formData) {
  const user = await requireUser("buyer");
  const productId = Number(formData.get("productId"));
  const returnTo = safePath(String(formData.get("returnTo") ?? ""), "/buyer/wishlist");
  if (!Number.isInteger(productId) || productId <= 0) redirect(returnTo);

  const del = await query("DELETE FROM wishlists WHERE user_id = $1 AND product_id = $2", [user.id, productId]);
  if (del.rowCount === 0) {
    await query("INSERT INTO wishlists (user_id, product_id) VALUES ($1, $2) ON CONFLICT DO NOTHING", [user.id, productId]);
  }
  redirect(returnTo);
}