import { query } from "@/lib/db";

const PRODUCT_SELECT = `
  SELECT p.id, p.name, p.description, p.price, p.stock, p.image_url, p.store_id, p.category_id,
         s.name AS store_name, c.name AS category_name,
         COALESCE(r.avg_rating, 0) AS avg_rating, COALESCE(r.review_count, 0)::int AS review_count,
         COALESCE(sd.sold_count, 0)::int AS sold_count
  FROM products p
  JOIN stores s ON s.id = p.store_id
  LEFT JOIN categories c ON c.id = p.category_id
  LEFT JOIN (
    SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS review_count
    FROM reviews GROUP BY product_id
  ) r ON r.product_id = p.id
  LEFT JOIN (
    SELECT oi.product_id, SUM(oi.quantity) AS sold_count
    FROM order_items oi JOIN orders o ON o.id = oi.order_id
    WHERE o.status = 'selesai'
    GROUP BY oi.product_id
  ) sd ON sd.product_id = p.id`;

const SORTS = {
  terbaru: "p.id DESC",
  termurah: "p.price ASC, p.id DESC",
  termahal: "p.price DESC, p.id DESC",
  nama: "p.name ASC",
  rating: "avg_rating DESC, review_count DESC",
  terlaris: "sold_count DESC, p.id DESC"
};

export const PAGE_SIZE = 12;

// Daftar produk dengan pencarian, filter kategori/toko/harga, sorting, dan pagination
export async function listProducts({ q, category, store, minPrice, maxPrice, sort = "terbaru", page = 1 } = {}) {
  const where = [];
  const params = [];
  if (q) {
    params.push(`%${q}%`);
    where.push(`p.name ILIKE $${params.length}`);
  }
  if (category) {
    params.push(Number(category));
    where.push(`p.category_id = $${params.length}`);
  }
  if (store) {
    params.push(Number(store));
    where.push(`p.store_id = $${params.length}`);
  }
  if (minPrice !== undefined && minPrice !== "" && !Number.isNaN(Number(minPrice))) {
    params.push(Number(minPrice));
    where.push(`p.price >= $${params.length}`);
  }
  if (maxPrice !== undefined && maxPrice !== "" && !Number.isNaN(Number(maxPrice))) {
    params.push(Number(maxPrice));
    where.push(`p.price <= $${params.length}`);
  }
  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  const orderSql = SORTS[sort] ?? SORTS.terbaru;
  const offset = (Math.max(1, Number(page) || 1) - 1) * PAGE_SIZE;

  const countRes = await query(`SELECT COUNT(*)::int AS total FROM products p ${whereSql}`, params);
  const { rows } = await query(
    `${PRODUCT_SELECT} ${whereSql} ORDER BY ${orderSql} LIMIT ${PAGE_SIZE} OFFSET ${offset}`,
    params
  );
  return { products: rows, total: countRes.rows[0].total };
}

// Rekomendasi acak untuk homepage
export async function randomProducts(limit = 8) {
  const { rows } = await query(`${PRODUCT_SELECT} WHERE p.stock > 0 ORDER BY RANDOM() LIMIT $1`, [limit]);
  return rows;
}

// Produk terlaris untuk homepage
export async function topProducts(limit = 10) {
  const { rows } = await query(
    `${PRODUCT_SELECT} WHERE p.stock > 0 ORDER BY sold_count DESC, p.id DESC LIMIT $1`,
    [limit]
  );
  return rows;
}

export async function getProduct(id) {
  const { rows } = await query(`${PRODUCT_SELECT} WHERE p.id = $1`, [id]);
  return rows[0] ?? null;
}

export async function getReviews(productId) {
  const { rows } = await query(
    `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS buyer_name
     FROM reviews r JOIN users u ON u.id = r.buyer_id
     WHERE r.product_id = $1 ORDER BY r.created_at DESC`,
    [productId]
  );
  return rows;
}

export async function getCategories() {
  const { rows } = await query(
    `SELECT c.id, c.name, c.description, COUNT(p.id)::int AS product_count
     FROM categories c LEFT JOIN products p ON p.category_id = c.id
     GROUP BY c.id ORDER BY c.id`
  );
  return rows;
}

export async function getStores() {
  const { rows } = await query(
    `SELECT s.id, s.name, s.description, s.image_url, COUNT(p.id)::int AS product_count
     FROM stores s LEFT JOIN products p ON p.store_id = s.id
     JOIN users u ON u.id = s.user_id AND u.seller_status = 'approved'
     GROUP BY s.id ORDER BY s.id`
  );
  return rows;
}

export async function getStore(id) {
  const { rows } = await query("SELECT id, name, description, image_url FROM stores WHERE id = $1", [id]);
  return rows[0] ?? null;
}

export async function getStoreByUser(userId) {
  const { rows } = await query("SELECT id, name, description, image_url FROM stores WHERE user_id = $1", [userId]);
  return rows[0] ?? null;
}

export async function getWishlistIds(userId) {
  if (!userId) return new Set();
  const { rows } = await query("SELECT product_id FROM wishlists WHERE user_id = $1", [userId]);
  return new Set(rows.map((r) => r.product_id));
}

export async function getCartCount(userId) {
  const { rows } = await query("SELECT COALESCE(SUM(quantity),0)::int AS n FROM cart_items WHERE user_id = $1", [userId]);
  return rows[0].n;
}
