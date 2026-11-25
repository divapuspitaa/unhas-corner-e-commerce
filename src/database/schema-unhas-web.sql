-- =====================================================================
-- UnhasCorner - Database Schema (PostgreSQL)
-- Hanya CREATE TABLE (tanpa data). Data diisi manual setelah website jadi.
-- Simpan file ini di luar folder /app (mis. /database/schema.sql)
-- Jalankan di pgAdmin: Query Tool -> buka file -> Execute (F5)
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. USERS
--    Satu tabel untuk admin, seller, buyer.
--    seller_status hanya dipakai untuk role 'seller' (pending/approved/rejected).
--    Buyer & admin: seller_status = NULL.
-- ---------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS users (
    id   SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password_hash   VARCHAR(255)  NOT NULL,              
    phone           VARCHAR(20),
    role            VARCHAR(10) NOT NULL DEFAULT 'buyer' CHECK (role IN ('admin', 'seller', 'buyer')),
    seller_status   VARCHAR(10) CHECK (seller_status IN ('pending', 'approved', 'rejected')),
    -- soft delete: akun dinonaktifkan admin (bukan dihapus), produk toko ikut disembunyikan
    is_active       BOOLEAN       NOT NULL DEFAULT TRUE,
    -- pengajuan aktif kembali dari akun yang dinonaktifkan
    reactivation_requested_at TIMESTAMPTZ,
    reactivation_reason       TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    -- seller wajib punya status, non-seller wajib NULL
    CONSTRAINT chk_seller_status_role CHECK (
        (role = 'seller' AND seller_status IS NOT NULL)
        OR (role <> 'seller' AND seller_status IS NULL)
    )
);

-- ---------------------------------------------------------------------
-- 2. STORES
--    Toko resmi (Hadin, Sema, Oxi, Kopma, Sumber Rezeki, Aesculapius, dst).
--    Relasi 1-ke-1 dengan seller (user_id UNIQUE).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS stores (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER       NOT NULL UNIQUE
                    REFERENCES users(id) ON DELETE CASCADE,
    name            VARCHAR(100)  NOT NULL UNIQUE,
    description     TEXT,
    image_url       VARCHAR(255),
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 3. CATEGORIES (dikelola Admin)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(100)  NOT NULL UNIQUE,
    description     TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 4. PRODUCTS
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id              SERIAL PRIMARY KEY,
    store_id        INTEGER       NOT NULL
                    REFERENCES stores(id) ON DELETE CASCADE,
    category_id     INTEGER
                    REFERENCES categories(id) ON DELETE SET NULL,
    name            VARCHAR(150)  NOT NULL,
    description     TEXT          NOT NULL,
    price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),
    stock           INTEGER       NOT NULL DEFAULT 0 CHECK (stock >= 0),
    image_url       VARCHAR(255),
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 5. ADDRESSES (alamat pengiriman buyer)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS addresses (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER       NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
    label           VARCHAR(50)   NOT NULL DEFAULT 'Rumah',   -- Rumah / Kos / Kampus
    recipient_name  VARCHAR(100)  NOT NULL,
    phone           VARCHAR(20)   NOT NULL,
    full_address    TEXT          NOT NULL,
    city            VARCHAR(100)  NOT NULL,
    postal_code     VARCHAR(10),
    is_default      BOOLEAN       NOT NULL DEFAULT FALSE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 6. CART_ITEMS (keranjang belanja)
--    Satu produk hanya muncul satu baris per user (quantity yang berubah).
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS cart_items (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER       NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
    product_id      INTEGER       NOT NULL
                    REFERENCES products(id) ON DELETE CASCADE,
    quantity        INTEGER       NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- 7. WISHLISTS (favorit, terpisah dari keranjang)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS wishlists (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER       NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
    product_id      INTEGER       NOT NULL
                    REFERENCES products(id) ON DELETE CASCADE,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    UNIQUE (user_id, product_id)
);

-- ---------------------------------------------------------------------
-- 8. ORDERS (satu order per toko saat checkout)
--    Data alamat disimpan sebagai snapshot supaya tetap utuh
--    walaupun alamat di tabel addresses diubah/dihapus.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
    id                  SERIAL PRIMARY KEY,
    order_code          VARCHAR(30)   NOT NULL UNIQUE,        -- mis. UC-20261117-0001
    buyer_id            INTEGER       NOT NULL
                        REFERENCES users(id) ON DELETE CASCADE,
    store_id            INTEGER       NOT NULL
                        REFERENCES stores(id) ON DELETE CASCADE,
    address_id          INTEGER
                        REFERENCES addresses(id) ON DELETE SET NULL,
    shipping_recipient  VARCHAR(100),
    shipping_phone      VARCHAR(20),
    shipping_address    TEXT,
    total_price         NUMERIC(12,2) NOT NULL CHECK (total_price >= 0),
    status              VARCHAR(20)   NOT NULL DEFAULT 'menunggu_pembayaran'
                        CHECK (status IN ('menunggu_pembayaran', 'diproses',
                                          'dikirim', 'selesai', 'dibatalkan')),
    note                TEXT,
    created_at          TIMESTAMP     NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 9. ORDER_ITEMS (snapshot nama & harga produk saat checkout)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
    id              SERIAL PRIMARY KEY,
    order_id        INTEGER       NOT NULL
                    REFERENCES orders(id) ON DELETE CASCADE,
    product_id      INTEGER
                    REFERENCES products(id) ON DELETE SET NULL,
    product_name    VARCHAR(150)  NOT NULL,                   -- snapshot
    product_image   VARCHAR(255),                             -- snapshot
    price           NUMERIC(12,2) NOT NULL CHECK (price >= 0),-- snapshot
    quantity        INTEGER       NOT NULL CHECK (quantity > 0),
    subtotal        NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0)
);

-- ---------------------------------------------------------------------
-- 10. ORDER_STATUS_LOGS (riwayat perubahan status untuk order tracking)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_logs (
    id              SERIAL PRIMARY KEY,
    order_id        INTEGER       NOT NULL
                    REFERENCES orders(id) ON DELETE CASCADE,
    status          VARCHAR(20)   NOT NULL
                    CHECK (status IN ('menunggu_pembayaran', 'diproses',
                                      'dikirim', 'selesai', 'dibatalkan')),
    changed_by      INTEGER
                    REFERENCES users(id) ON DELETE SET NULL,
    note            TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- 11. REVIEWS (rating 1-5, hanya setelah order selesai - dicek di backend)
--     Satu review per buyer per produk per order.
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
    id              SERIAL PRIMARY KEY,
    product_id      INTEGER       NOT NULL
                    REFERENCES products(id) ON DELETE CASCADE,
    buyer_id        INTEGER       NOT NULL
                    REFERENCES users(id) ON DELETE CASCADE,
    order_id        INTEGER       NOT NULL
                    REFERENCES orders(id) ON DELETE CASCADE,
    rating          SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment         TEXT,
    created_at      TIMESTAMP     NOT NULL DEFAULT NOW(),
    UNIQUE (buyer_id, product_id, order_id)
);

-- ---------------------------------------------------------------------
-- INDEX (mempercepat query yang sering dipakai)
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_store     ON products(store_id);
CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_name      ON products(name);
CREATE INDEX IF NOT EXISTS idx_orders_buyer       ON orders(buyer_id);
CREATE INDEX IF NOT EXISTS idx_orders_store       ON orders(store_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order  ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_status_logs_order  ON order_status_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_reviews_product    ON reviews(product_id);

-- ---------------------------------------------------------------------
-- UNTUK DATABASE LAMA (tabel users sudah ada): tambahkan kolom yang dipakai aplikasi.
-- Aman dijalankan berulang kali.
-- ---------------------------------------------------------------------
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reactivation_requested_at TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS reactivation_reason TEXT;

-- ---------------------------------------------------------------------
-- VIEW: PERINGKAT PRODUK TERLARIS
-- Produk terlaris ditentukan dari ULASAN & RATING pembeli (bukan sekadar jumlah terjual):
--   * memenuhi_syarat = minimal 3 ulasan DAN rata-rata rating >= 4.0 (skala 1-5)
--   * skor = (n * rata_rating + 3 * 4.0) / (n + 3)
--     -> rating dirata-ratakan dengan nilai prior 4.0 sehingga produk dengan 1-2 ulasan
--        tidak mengalahkan produk yang ulasannya banyak dan konsisten bagus.
--   * urutan: skor tertinggi, lalu jumlah ulasan terbanyak, lalu jumlah terjual.
-- Rumus yang sama dipakai aplikasi di src/lib/queries.js (topProducts).
-- Contoh pemakaian:
--   SELECT * FROM v_produk_terlaris WHERE memenuhi_syarat
--   ORDER BY skor DESC, jumlah_ulasan DESC, jumlah_terjual DESC LIMIT 10;
-- ---------------------------------------------------------------------
CREATE OR REPLACE VIEW v_produk_terlaris AS
SELECT
    p.id                                   AS product_id,
    p.name                                 AS nama_produk,
    st.name                                AS nama_toko,
    COUNT(r.id)::int                       AS jumlah_ulasan,
    ROUND(COALESCE(AVG(r.rating), 0), 2)   AS rata_rating,
    ROUND((COUNT(r.id) * COALESCE(AVG(r.rating), 0) + 3 * 4.0) / (COUNT(r.id) + 3), 3) AS skor,
    COALESCE(sd.terjual, 0)::int           AS jumlah_terjual,
    COALESCE(COUNT(r.id) >= 3 AND AVG(r.rating) >= 4.0, FALSE) AS memenuhi_syarat
FROM products p
JOIN stores st ON st.id = p.store_id
LEFT JOIN reviews r ON r.product_id = p.id
LEFT JOIN (
    SELECT oi.product_id, SUM(oi.quantity) AS terjual
    FROM order_items oi
    JOIN orders o ON o.id = oi.order_id
    WHERE o.status = 'selesai'
    GROUP BY oi.product_id
) sd ON sd.product_id = p.id
GROUP BY p.id, p.name, st.name, sd.terjual;
