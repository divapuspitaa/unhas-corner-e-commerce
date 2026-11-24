"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { query, withTransaction } from "@/lib/db";
import { getCurrentUser, requireUser, safePath } from "@/lib/auth";
import { makeOrderCode } from "@/lib/format";
import { withMsg } from "@/lib/flash";

const isPosInt = (n) => Number.isInteger(n) && n > 0;

export async function addToCart(formData) {
  const productId = Number(formData.get("productId"));
  if (!isPosInt(productId)) redirect("/produk");

  const quantity = Math.max(1, Math.floor(Number(formData.get("quantity")) || 1));
  const returnTo = safePath(String(formData.get("returnTo") ?? ""), `/produk/${productId}`);

  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  if (user.role !== "buyer") redirect(withMsg(returnTo, "err", "Hanya akun Buyer yang bisa berbelanja."));

  const { rows } = await query(
    `SELECT p.name, p.stock, u.is_active AS store_active
     FROM products p
     JOIN stores s ON s.id = p.store_id
     JOIN users u ON u.id = s.user_id
     WHERE p.id = $1`,
    [productId]
  );
  if (!rows[0]) redirect(withMsg(returnTo, "err", "Produk tidak ditemukan."));
  if (rows[0].store_active === false) {
    redirect(withMsg(returnTo, "err", "Toko sedang tidak aktif sementara."));
  }
  if (rows[0].stock <= 0) redirect(withMsg(returnTo, "err", "Stok produk habis."));

  const isBuyNow = formData.get("mode") === "buy";

  // "Beli Langsung": jumlah diganti sesuai pilihan; "Keranjang": jumlah ditambahkan ke yang sudah ada
  const { rows: saved } = await query(
    `INSERT INTO cart_items (user_id, product_id, quantity) VALUES ($1, $2, LEAST($3::int, $4::int))
     ON CONFLICT (user_id, product_id)
     DO UPDATE SET quantity = CASE WHEN $5::boolean THEN LEAST($3::int, $4::int)
                                   ELSE LEAST(cart_items.quantity + $3::int, $4::int) END
     RETURNING id`,
    [user.id, productId, quantity, rows[0].stock, isBuyNow]
  );

  revalidatePath("/", "layout");

  // Beli langsung -> masuk ke halaman checkout hanya untuk produk ini
  if (isBuyNow) {
    redirect(`/checkout?items=${saved[0].id}`);
  }
  redirect(withMsg(returnTo, "ok", `Keranjang Anda bertambah! "${rows[0].name}" berhasil ditambahkan.`));
}

export async function updateCartQty(formData) {
  const user = await requireUser("buyer");
  const id = Number(formData.get("cartItemId"));
  const qty = Number(formData.get("quantity"));
  if (!isPosInt(id)) redirect("/keranjang");

  if (!Number.isFinite(qty) || qty < 1) {
    await query("DELETE FROM cart_items WHERE id = $1 AND user_id = $2", [id, user.id]);
    revalidatePath("/", "layout");
    redirect(withMsg("/keranjang", "ok", "Item berhasil dihapus dari keranjang."));
  } else {
    await query(
      `UPDATE cart_items c SET quantity = LEAST($1::int, p.stock)
       FROM products p WHERE c.id = $2 AND c.user_id = $3 AND p.id = c.product_id AND p.stock > 0`,
      [Math.floor(qty), id, user.id]
    );
    revalidatePath("/", "layout");
    redirect(withMsg("/keranjang", "ok", "Jumlah item di keranjang diperbarui."));
  }
}

export async function removeCartItem(formData) {
  const user = await requireUser("buyer");
  const id = Number(formData.get("cartItemId"));
  if (isPosInt(id)) {
    await query("DELETE FROM cart_items WHERE id = $1 AND user_id = $2", [id, user.id]);
    revalidatePath("/", "layout");
    redirect(withMsg("/keranjang", "ok", "Item berhasil dihapus dari keranjang."));
  }
  redirect("/keranjang");
}

// Checkout: satu order per toko, snapshot produk, kurangi stok, kosongkan keranjang
// itemIds (opsional, dipisah koma) = hanya item keranjang tersebut yang di-checkout; kosong = semua
export async function checkout(formData) {
  const user = await requireUser("buyer");
  const addressId = Number(formData.get("addressId"));
  const note = String(formData.get("note") ?? "").trim() || null;
  const rawItems = String(formData.get("itemIds") ?? "").trim();
  const itemIds = rawItems
    ? [...new Set(rawItems.split(",").map(Number).filter(isPosInt))]
    : null;
  const backTo = itemIds ? `/checkout?items=${itemIds.join(",")}` : "/checkout";

  if (rawItems && itemIds.length === 0) redirect("/keranjang");
  if (!isPosInt(addressId)) {
    redirect(withMsg(backTo, "err", "Pilih alamat pengiriman terlebih dahulu."));
  }

  let failure = null;
  try {
    await withTransaction(async (client) => {
      const addr = (await client.query("SELECT * FROM addresses WHERE id = $1 AND user_id = $2", [addressId, user.id])).rows[0];
      if (!addr) throw new Error("Alamat tidak ditemukan.");

      const items = (
        await client.query(
          `SELECT ci.product_id, ci.quantity, p.name, p.price, p.stock, p.image_url, p.store_id,
                  u.is_active AS store_active
           FROM cart_items ci
           JOIN products p ON p.id = ci.product_id
           JOIN stores s ON s.id = p.store_id
           JOIN users u ON u.id = s.user_id
           WHERE ci.user_id = $1 AND ($2::int[] IS NULL OR ci.id = ANY($2::int[]))
           ORDER BY p.store_id FOR UPDATE OF p`,
          [user.id, itemIds]
        )
      ).rows;
      if (items.length === 0) throw new Error("Keranjang kosong.");

      for (const it of items) {
        if (it.store_active === false) {
          throw new Error(`Toko untuk "${it.name}" sedang dinonaktifkan sementara. Hapus item ini terlebih dahulu.`);
        }
        if (it.quantity > it.stock) throw new Error(`Stok "${it.name}" tidak mencukupi (sisa ${it.stock}).`);
      }

      const byStore = new Map();
      for (const it of items) {
        if (!byStore.has(it.store_id)) byStore.set(it.store_id, []);
        byStore.get(it.store_id).push(it);
      }

      const shippingAddress = `${addr.full_address}, ${addr.city}${addr.postal_code ? " " + addr.postal_code : ""}`;

      for (const [storeId, list] of byStore) {
        const total = list.reduce((s, it) => s + Number(it.price) * it.quantity, 0);
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
            [order.id, it.product_id, it.name, it.image_url, it.price, it.quantity, Number(it.price) * it.quantity]
          );
          await client.query("UPDATE products SET stock = stock - $1 WHERE id = $2", [it.quantity, it.product_id]);
        }
        await client.query(
          "INSERT INTO order_status_logs (order_id, status, changed_by, note) VALUES ($1,'menunggu_pembayaran',$2,'Pesanan dibuat')",
          [order.id, user.id]
        );
      }
      await client.query(
        "DELETE FROM cart_items WHERE user_id = $1 AND ($2::int[] IS NULL OR id = ANY($2::int[]))",
        [user.id, itemIds]
      );
    });
  } catch (err) {
    failure = err.message || "Checkout gagal.";
  }

  if (failure) redirect(withMsg(backTo, "err", failure));
  revalidatePath("/", "layout");
  redirect(withMsg("/buyer/pesanan", "ok", "Checkout berhasil! Pesanan Anda telah dibuat."));
}