"use server";

import { redirect } from "next/navigation";
import { query, withTransaction } from "@/lib/db";
import { requireApprovedSeller, requireUser } from "@/lib/auth";
import { NEXT_STATUS } from "@/lib/format";
import { changeOrderStatus } from "@/lib/orders";
import { withMsg } from "@/lib/flash";

// ---------- Buyer ----------
export async function cancelOrder(formData) {
  const user = await requireUser("buyer");
  const orderId = Number(formData.get("orderId"));

  let msg = null;
  await withTransaction(async (client) => {
    const { rows } = await client.query("SELECT status FROM orders WHERE id = $1 AND buyer_id = $2 FOR UPDATE", [orderId, user.id]);
    if (!rows[0] || rows[0].status !== "menunggu_pembayaran") {
      msg = "Pesanan hanya bisa dibatalkan saat menunggu pembayaran.";
      return;
    }
    await changeOrderStatus(client, orderId, "dibatalkan", user.id, "Dibatalkan oleh pembeli");
  });
  redirect(msg ? withMsg("/buyer/pesanan", "err", msg) : withMsg("/buyer/pesanan", "ok", "Pesanan dibatalkan."));
}

export async function confirmReceived(formData) {
  const user = await requireUser("buyer");
  const orderId = Number(formData.get("orderId"));

  let msg = null;
  await withTransaction(async (client) => {
    const { rows } = await client.query("SELECT status FROM orders WHERE id = $1 AND buyer_id = $2 FOR UPDATE", [orderId, user.id]);
    if (!rows[0] || rows[0].status !== "dikirim") {
      msg = "Pesanan belum berstatus dikirim.";
      return;
    }
    await changeOrderStatus(client, orderId, "selesai", user.id, "Pesanan diterima pembeli");
  });
  redirect(msg ? withMsg("/buyer/pesanan", "err", msg) : withMsg("/buyer/pesanan", "ok", "Terima kasih! Silakan beri ulasan produk."));
}

export async function submitReview(formData) {
  const user = await requireUser("buyer");
  const orderId = Number(formData.get("orderId"));
  const productId = Number(formData.get("productId"));
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    redirect(withMsg("/buyer/pesanan", "err", "Rating harus 1 sampai 5."));
  }

  const { rows } = await query(
    `SELECT 1 FROM orders o JOIN order_items oi ON oi.order_id = o.id
     WHERE o.id = $1 AND o.buyer_id = $2 AND o.status = 'selesai' AND oi.product_id = $3`,
    [orderId, user.id, productId]
  );
  if (rows.length === 0) redirect(withMsg("/buyer/pesanan", "err", "Ulasan hanya untuk produk dari pesanan yang sudah selesai."));

  await query(
    `INSERT INTO reviews (product_id, buyer_id, order_id, rating, comment) VALUES ($1,$2,$3,$4,$5)
     ON CONFLICT (buyer_id, product_id, order_id) DO UPDATE SET rating = EXCLUDED.rating, comment = EXCLUDED.comment`,
    [productId, user.id, orderId, rating, comment || null]
  );
  redirect(withMsg("/buyer/pesanan", "ok", "Ulasan tersimpan."));
}

// ---------- Seller ----------
export async function updateOrderStatus(formData) {
  const user = await requireApprovedSeller();
  const orderId = Number(formData.get("orderId"));
  const status = String(formData.get("status") ?? "");

  let msg = null;
  await withTransaction(async (client) => {
    const { rows } = await client.query(
      `SELECT o.status FROM orders o JOIN stores s ON s.id = o.store_id
       WHERE o.id = $1 AND s.user_id = $2 FOR UPDATE OF o`,
      [orderId, user.id]
    );
    if (!rows[0]) {
      msg = "Pesanan tidak ditemukan.";
      return;
    }
    if (!(NEXT_STATUS[rows[0].status] ?? []).includes(status)) {
      msg = "Perubahan status tidak diizinkan.";
      return;
    }
    await changeOrderStatus(client, orderId, status, user.id, "Status diperbarui oleh seller");
  });
  redirect(msg ? withMsg("/seller/pesanan", "err", msg) : withMsg("/seller/pesanan", "ok", "Status pesanan diperbarui."));
}
