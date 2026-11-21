"use server";

import { redirect } from "next/navigation";
import { query, withTransaction } from "@/lib/db";
import { getCurrentUser, requireUser, safePath } from "@/lib/auth";
import { makeOrderCode } from "@/lib/format";
import { withMsg } from "@/lib/flash";

export async function addToCart(formData) {
  const productId = Number(formData.get("productId"));
  const quantity = Math.max(1, Number(formData.get("quantity")) || 1);
  const returnTo = safePath(String(formData.get("returnTo") ?? ""), `/produk/${productId}`);

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  if (user.role !== "buyer") redirect(withMsg(returnTo, "err", "Hanya akun Buyer yang bisa berbelanja."));

  const { rows } = await query("SELECT stock FROM products WHERE id = $1", [productId]);
  if (!rows[0]) redirect(withMsg(returnTo, "err", "Produk tidak ditemukan."));
  if (rows[0].stock <= 0) redirect(withMsg(returnTo, "err", "Stok produk habis."));

  await query(
    `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, LEAST($3, $4))
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = LEAST(cart_items.quantity + $3, $4)`,
    [user.id, productId, quantity, rows[0].stock]
  );
  if (formData.get("mode") === "buy") redirect("/keranjang");
  redirect(withMsg(returnTo, "ok", "Produk ditambahkan ke keranjang."));
}

export async function updateCartQty(formData) {
  const user = await requireUser("buyer");
  const id = Number(formData.get("cartItemId"));
  const qty = Number(formData.get("quantity"));

  if (!Number.isFinite(qty) || qty < 1) {
    await query("DELETE FROM cart_items WHERE id = $1 AND user_id = $2", [id, user.id]);
  } else {
    await query(
      `UPDATE cart_items c SET quantity = LEAST($1, p.stock)
       FROM products p WHERE c.id = $2 AND c.user_id = $3 AND p.id = c.product_id`,
      [qty, id, user.id]
    );
  }
  redirect("/keranjang");
}

export async function removeCartItem(formData) {
  const user = await requireUser("buyer");
  await query("DELETE FROM cart_items WHERE id = $1 AND user_id = $2", [Number(formData.get("cartItemId")), user.id]);
  redirect("/keranjang");
}

// Checkout: satu order per toko, snapshot produk, kurangi stok, kosongkan keranjang
export async function checkout(formData) {
  const user = await requireUser("buyer");
  const addressId = Number(formData.get("addressId"));
  const note = String(formData.get("note") ?? "").trim() || null;

  if (!addressId) redirect(withMsg("/keranjang", "err", "Pilih alamat pengiriman terlebih dahulu."));

  let failure = null;
  try {
    await withTransaction(async (client) => {
      const addr = (await client.query("SELECT * FROM addresses WHERE id = $1 AND user_id = $2", [addressId, user.id])).rows[0];
      if (!addr) throw new Error("Alamat tidak ditemukan.");

      const items = (
        await client.query(
          `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock, p.image_url, p.store_id
           FROM cart_items ci JOIN products p ON p.id = ci.product_id
           WHERE ci.user_id = $1 ORDER BY p.store_id FOR UPDATE OF p`,
          [user.id]
        )
      ).rows;
      if (items.length === 0) throw new Error("Keranjang kosong.");

      for (const it of items) {
        if (it.quantity > it.stock) throw new Error(`Stok "${it.name}" tidak mencukupi (sisa ${it.stock}).`);
      }

      const byStore = new Map();
      for (const it of items) {
        if (!byStore.has(it.store_id)) byStore.set(it.store_id, []);
        byStore.get(it.store_id).push(it);
      }

      const shippingAddress = `${addr.full_address}, ${addr.city}${addr.postal_code ? " " + addr.postal_code : ""}`;

      for (const [storeId, list] of byStore) {
        const total = list.reduce((s, it) => s + it.price * it.quantity, 0);
        let code = makeOrderCode();
        for (let i = 0; i < 5; i++) {
          const dup = await client.query("SELECT 1 FROM orders WHERE order_code = $1", [code]);
          if (dup.rowCount === 0) break;
          code = makeOrderCode();
        }
        const order = (
          await client.query(
            `INSERT INTO orders (order_code, buyer_id, store_id, address_id, shipping_recipient, shipping_phone,
                                 shipping_address, total_price, status, note)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'menunggu_pembayaran',$9) RETURNING id`,
            [code, user.id, storeId, addr.id, addr.recipient_name, addr.phone, shippingAddress, total, note]
          )
        ).rows[0];

        for (const it of list) {
          await client.query(
            `INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
             VALUES ($1,$2,$3,$4,$5,$6,$7)`,
            [order.id, it.product_id, it.name, it.image_url, it.price, it.quantity, it.price * it.quantity]
          );
          await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [it.quantity, it.product_id]);
        }
        await client.query(
          "INSERT INTO order_status_logs (order_id, status, changed_by, note) VALUES ($1,'menunggu_pembayaran',$2,'Pesanan dibuat')",
          [order.id, user.id]
        );
      }
      await client.query("DELETE FROM cart_items WHERE user_id = $1", [user.id]);
    });
  } catch (err) {
    failure = err.message || "Checkout gagal.";
  }

  if (failure) redirect(withMsg("/keranjang", "err", failure));
  redirect(withMsg("/buyer/pesanan", "ok", "Checkout berhasil! Pesanan dibuat per toko."));
}
