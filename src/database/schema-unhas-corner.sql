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


-- =====================================================================
-- UnhasCorner - Seed Data (INSERT INTO) untuk PostgreSQL
-- Jalankan SETELAH schema.sql.
-- Password semua akun contoh: password123 (sudah di-hash bcrypt)
-- Harga produk & stok hanyalah ESTIMASI - sesuaikan dengan kondisi asli.
-- =====================================================================

-- 1. USERS
INSERT INTO users (id, name, email, password_hash, phone, role, seller_status) VALUES
(1, 'Admin UnhasCorner', 'admin@unhascorner.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081200000001', 'admin', NULL),
(2, 'Seller Hadin', 'hadin@unhascorner.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081200000002', 'seller', 'approved'),
(3, 'Seller SEMA', 'sema@unhascorner.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081200000003', 'seller', 'approved'),
(4, 'Seller Oxi', 'oxi@unhascorner.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081200000004', 'seller', 'approved'),
(5, 'Seller Kopma', 'kopma@unhascorner.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081200000005', 'seller', 'approved'),
(6, 'Seller Sumber Rezeki', 'sumberrezeki@unhascorner.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081200000006', 'seller', 'approved'),
(7, 'Seller Aesculapius', 'aesculapius@unhascorner.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081200000007', 'seller', 'approved'),
(8, 'Calon Seller Pending', 'pending@unhascorner.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081200000008', 'seller', 'pending'),
(9, 'Calon Seller Ditolak', 'rejected@unhascorner.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081200000009', 'seller', 'rejected'),
(10, 'Andi Rahman', 'andi@student.unhas.ac.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081300000001', 'buyer', NULL),
(11, 'Siti Nurhaliza', 'siti@student.unhas.ac.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081300000002', 'buyer', NULL),
(12, 'Muh. Fadil', 'fadil@student.unhas.ac.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081300000003', 'buyer', NULL),
(13, 'Rina Kartika', 'rina@student.unhas.ac.id', '$2b$10$77aOm4AkG5L7Bd4AbpIIxeAvqJIE2B6e.fxacuAJHvxv40aKv6SqC', '081300000004', 'buyer', NULL);

-- 2. STORES
INSERT INTO stores (id, user_id, name, description, image_url) VALUES
(1, 2, 'Hadin', 'Toko atribut resmi Unhas: almamater, jas, toga, jaket KKN, dan merchandise.', '/images/stores/hadin.jpg'),
(2, 3, 'SEMA', 'Toko Senat Mahasiswa: merchandise dan atribut kegiatan kampus.', '/images/stores/sema.jpg'),
(3, 4, 'Oxi', 'Toko alat tulis dan perlengkapan kuliah harian.', '/images/stores/oxi.jpg'),
(4, 5, 'Kopma', 'Koperasi mahasiswa: alat tulis, alat gambar, dan perlengkapan praktikum teknik.', '/images/stores/kopma.jpg'),
(5, 6, 'Sumber Rezeki', 'Toko perlengkapan laboratorium dan praktikum sains.', '/images/stores/sumber-rezeki.jpg'),
(6, 7, 'Aesculapius', 'Toko perlengkapan praktikum dan klinik kedokteran serta kedokteran gigi.', '/images/stores/aesculapius.jpg');

-- 3. CATEGORIES
INSERT INTO categories (id, name, description) VALUES
(1, 'Atribut & Seragam', 'Jas almamater, jas hitam, baju putih, jaket KKN, toga.'),
(2, 'Alat Tulis & Praktikum', 'Alat tulis, alat gambar, alat ukur, dan perlengkapan praktikum.'),
(3, 'Atribut Wisuda & Seremonial', 'Toga, jubah wisuda, dan perlengkapan seremonial.'),
(4, 'Merchandise & Aksesoris', 'Tumbler, gantungan kunci, dan aksesoris kampus.');

-- 4. PRODUCTS
INSERT INTO products (id, store_id, category_id, name, description, price, stock, image_url) VALUES
(1, 1, 1, 'Almet (Jas Almamater) Unhas', 'Jas almamater resmi Universitas Hasanuddin warna merah marun, tersedia berbagai ukuran.', 185000, 40, '/images/products/almet-jas-almamater-unhas.jpg'),
(2, 1, 1, 'Jas Hitam', 'Jas hitam formal untuk seminar, sidang, dan acara resmi kampus.', 250000, 25, '/images/products/jas-hitam.jpg'),
(3, 1, 1, 'Baju Putih', 'Kemeja putih polos untuk kegiatan akademik dan sidang.', 95000, 60, '/images/products/baju-putih.jpg'),
(4, 1, 1, 'Jaket KKN Unhas', 'Jaket KKN dengan logo Unhas, bahan fleece nyaman.', 165000, 50, '/images/products/jaket-kkn-unhas.jpg'),
(5, 1, 3, 'Toga + Jubah Wisuda', 'Satu set toga dan jubah wisuda lengkap dengan topi.', 350000, 20, '/images/products/toga-jubah-wisuda.jpg'),
(6, 1, 4, 'Tumbler Unhas', 'Tumbler stainless 500 ml dengan logo Unhas.', 75000, 80, '/images/products/tumbler-unhas.jpg'),
(7, 1, 4, 'Ganci Unhas', 'Gantungan kunci akrilik logo Universitas Hasanuddin.', 10000, 200, '/images/products/ganci-unhas.jpg'),
(8, 2, 1, 'Jaket KKN (SEMA)', 'Jaket KKN versi SEMA, tersedia warna merah marun.', 170000, 30, '/images/products/jaket-kkn-sema.jpg'),
(9, 2, 4, 'Tumbler Unhas (SEMA)', 'Tumbler eksklusif edisi SEMA, 600 ml.', 80000, 45, '/images/products/tumbler-unhas-sema.jpg'),
(10, 2, 4, 'Ganci SEMA', 'Gantungan kunci resmi SEMA Unhas.', 8000, 150, '/images/products/ganci-sema.jpg'),
(11, 3, 2, 'Kertas HVS A4 (1 rim)', 'Kertas HVS A4 80 gsm isi 500 lembar.', 52000, 60, '/images/products/kertas-hvs-a4-1-rim.jpg'),
(12, 3, 2, 'Pulpen', 'Pulpen tinta hitam 0.5 mm, tulisan halus.', 3500, 300, '/images/products/pulpen.jpg'),
(13, 3, 2, 'Tipe-X', 'Correction tape 5 mm x 8 m.', 7000, 150, '/images/products/tipe-x.jpg'),
(14, 3, 2, 'Kertas Binder A5', 'Refill kertas binder A5 isi 50 lembar.', 12000, 100, '/images/products/kertas-binder-a5.jpg'),
(15, 3, 2, 'Kertas Binder B5', 'Refill kertas binder B5 isi 50 lembar.', 15000, 100, '/images/products/kertas-binder-b5.jpg'),
(16, 3, 2, 'Mistar 30 cm', 'Mistar plastik transparan 30 cm.', 4000, 120, '/images/products/mistar-30-cm.jpg'),
(17, 3, 2, 'Pensil 2B', 'Pensil kayu 2B untuk menulis dan ujian.', 3000, 250, '/images/products/pensil-2b.jpg'),
(18, 3, 2, 'Penghapus', 'Penghapus putih tidak meninggalkan noda.', 2500, 250, '/images/products/penghapus.jpg'),
(19, 3, 2, 'Rautan', 'Rautan pensil logam.', 3000, 200, '/images/products/rautan.jpg'),
(20, 3, 2, 'Hekter', 'Hekter kecil dengan isi staples.', 12000, 80, '/images/products/hekter.jpg'),
(21, 3, 2, 'Clipboard', 'Clipboard papan jalan ukuran A4.', 15000, 70, '/images/products/clipboard.jpg'),
(22, 3, 2, 'Double Tape', 'Double tape 12 mm x 10 m.', 5000, 150, '/images/products/double-tape.jpg'),
(23, 3, 4, 'Tumbler Unhas (Oxi)', 'Tumbler 500 ml dengan desain kampus.', 70000, 40, '/images/products/tumbler-unhas-oxi.jpg'),
(24, 4, 2, 'Pensil Warna 24 Warna', 'Pensil warna isi 24 untuk gambar teknik dan desain.', 45000, 60, '/images/products/pensil-warna-24-warna.jpg'),
(25, 4, 2, 'Kertas Kalkir', 'Kertas kalkir A3 untuk gambar teknik, per lembar.', 3000, 300, '/images/products/kertas-kalkir.jpg'),
(26, 4, 2, 'Busur 180 Derajat', 'Busur derajat setengah lingkaran 180°.', 5000, 100, '/images/products/busur-180-derajat.jpg'),
(27, 4, 2, 'Busur 360 Derajat', 'Busur derajat lingkaran penuh 360°.', 7000, 100, '/images/products/busur-360-derajat.jpg'),
(28, 4, 2, 'Jangka', 'Jangka besi untuk gambar teknik.', 20000, 60, '/images/products/jangka.jpg'),
(29, 4, 2, 'Drawing Pen 0.5', 'Drawing pen tinta hitam ukuran 0.5 mm.', 18000, 80, '/images/products/drawing-pen-0-5.jpg'),
(30, 4, 2, 'Drawing Pen 0.1', 'Drawing pen tinta hitam ukuran 0.1 mm.', 18000, 80, '/images/products/drawing-pen-0-1.jpg'),
(31, 4, 2, 'Penggaris Trapesium', 'Penggaris trapesium/segitiga untuk gambar teknik.', 9000, 70, '/images/products/penggaris-trapesium.jpg'),
(32, 4, 2, 'Kantong Sampel A3', 'Kantong sampel plastik ukuran A3 untuk praktikum lapangan.', 2500, 200, '/images/products/kantong-sampel-a3.jpg'),
(33, 4, 2, 'Pensil 2B (Kopma)', 'Pensil 2B kualitas gambar.', 3500, 200, '/images/products/pensil-2b-kopma.jpg'),
(34, 4, 2, 'Hekter (Kopma)', 'Hekter besar untuk dokumen tebal.', 18000, 40, '/images/products/hekter-kopma.jpg'),
(35, 4, 4, 'Ganci Kopma', 'Gantungan kunci resmi Kopma Unhas.', 7000, 120, '/images/products/ganci-kopma.jpg'),
(36, 5, 2, 'Handscoon', 'Sarung tangan lateks isi 100 pcs.', 85000, 60, '/images/products/handscoon.jpg'),
(37, 5, 2, 'Pinset', 'Pinset stainless untuk praktikum.', 15000, 70, '/images/products/pinset.jpg'),
(38, 5, 2, 'Tabung Reaksi', 'Tabung reaksi kaca ukuran standar, per buah.', 3000, 300, '/images/products/tabung-reaksi.jpg'),
(39, 5, 2, 'Chip Blower', 'Alat tiup pembersih debu untuk praktikum.', 25000, 40, '/images/products/chip-blower.jpg'),
(40, 5, 2, 'Alas Putih', 'Alas putih untuk pengamatan sampel praktikum.', 12000, 80, '/images/products/alas-putih.jpg'),
(41, 5, 2, 'Masker', 'Masker medis 3 ply isi 50 pcs.', 30000, 100, '/images/products/masker.jpg'),
(42, 5, 2, 'Bunsen', 'Pembakar bunsen untuk laboratorium.', 120000, 15, '/images/products/bunsen.jpg'),
(43, 5, 2, 'Alat Uji Kekerasan', 'Alat uji kekerasan mineral/batuan untuk praktikum geologi.', 95000, 15, '/images/products/alat-uji-kekerasan.jpg'),
(44, 5, 2, 'Komparator Batuan Beku', 'Komparator butir batuan beku untuk praktikum geologi.', 35000, 30, '/images/products/komparator-batuan-beku.jpg'),
(45, 5, 2, 'Komparator Batuan Sedimen', 'Komparator butir batuan sedimen untuk praktikum geologi.', 35000, 30, '/images/products/komparator-batuan-sedimen.jpg'),
(46, 5, 2, 'Loupe', 'Kaca pembesar loupe 10x.', 45000, 50, '/images/products/loupe.jpg'),
(47, 5, 2, 'HCl 0.1 M', 'Larutan asam klorida 0.1 M, 100 ml.', 20000, 50, '/images/products/hcl-0-1-m.jpg'),
(48, 5, 2, 'Pipet Tetes', 'Pipet tetes kaca dengan karet.', 5000, 150, '/images/products/pipet-tetes.jpg'),
(49, 5, 2, 'Batang Pengaduk', 'Batang pengaduk kaca 20 cm.', 6000, 120, '/images/products/batang-pengaduk.jpg'),
(50, 5, 2, 'Cover Glass', 'Cover glass preparat isi 100 pcs.', 25000, 60, '/images/products/cover-glass.jpg'),
(51, 6, 2, 'Gunting Bedah', 'Gunting bedah stainless untuk praktikum.', 45000, 40, '/images/products/gunting-bedah.jpg'),
(52, 6, 2, 'Scalpel', 'Gagang scalpel stainless nomor 3.', 25000, 60, '/images/products/scalpel.jpg'),
(53, 6, 2, 'Silet', 'Silet/blade bedah steril isi 100 pcs.', 55000, 40, '/images/products/silet.jpg'),
(54, 6, 2, 'Alat Oral Diagnostik', 'Set alat oral diagnostik (kaca mulut, sonde, pinset).', 120000, 25, '/images/products/alat-oral-diagnostik.jpg'),
(55, 6, 2, 'Tang Adam', 'Tang adam untuk praktikum kedokteran gigi.', 85000, 20, '/images/products/tang-adam.jpg'),
(56, 6, 2, 'Tang Bulat', 'Tang bulat stainless untuk ortodonti.', 90000, 20, '/images/products/tang-bulat.jpg'),
(57, 6, 2, 'Tang Potong', 'Tang potong kawat ortodonti.', 110000, 20, '/images/products/tang-potong.jpg'),
(58, 6, 2, 'Tang Bulat Setengah', 'Tang bulat setengah untuk ortodonti.', 95000, 20, '/images/products/tang-bulat-setengah.jpg'),
(59, 6, 2, 'Besi Kawat Gigi (Wire)', 'Kawat ortodonti stainless untuk praktikum.', 35000, 50, '/images/products/besi-kawat-gigi-wire.jpg'),
(60, 6, 2, 'Handscoon (Aesculapius)', 'Sarung tangan medis steril isi 50 pasang.', 110000, 40, '/images/products/handscoon-aesculapius.jpg'),
(61, 6, 2, 'Masker Medis (Aesculapius)', 'Masker medis 3 ply isi 50 pcs.', 32000, 80, '/images/products/masker-medis-aesculapius.jpg');

-- 5. ADDRESSES
INSERT INTO addresses (id, user_id, label, recipient_name, phone, full_address, city, postal_code, is_default) VALUES
(1, 10, 'Kos', 'Andi Rahman', '081300000001', 'Jl. Perintis Kemerdekaan Km. 10 No. 5, Tamalanrea', 'Makassar', '90245', TRUE),
(2, 10, 'Rumah', 'Andi Rahman', '081300000001', 'Jl. Sultan Alauddin No. 21', 'Makassar', '90221', FALSE),
(3, 11, 'Kos', 'Siti Nurhaliza', '081300000002', 'Jl. Politeknik No. 12, Tamalanrea', 'Makassar', '90245', TRUE),
(4, 12, 'Kampus', 'Muh. Fadil', '081300000003', 'Fakultas Teknik Unhas, Jl. Poros Malino, Bontomarannu', 'Gowa', '92171', TRUE),
(5, 13, 'Rumah', 'Rina Kartika', '081300000004', 'Jl. Pettarani No. 45', 'Makassar', '90222', TRUE);

-- 6. ORDERS
INSERT INTO orders (id, order_code, buyer_id, store_id, address_id, shipping_recipient, shipping_phone, shipping_address, total_price, status, note, created_at, updated_at) VALUES
(1, 'UC-20261110-0001', 10, 3, 1, 'Andi Rahman', '081300000001', 'Jl. Perintis Kemerdekaan Km. 10 No. 5, Tamalanrea, Makassar 90245', 19000, 'selesai', NULL, '2026-11-10 09:15', '2026-11-10 09:15'),
(2, 'UC-20261112-0002', 10, 1, 1, 'Andi Rahman', '081300000001', 'Jl. Perintis Kemerdekaan Km. 10 No. 5, Tamalanrea, Makassar 90245', 185000, 'dikirim', NULL, '2026-11-12 14:30', '2026-11-12 14:30'),
(3, 'UC-20261114-0003', 11, 6, 3, 'Siti Nurhaliza', '081300000002', 'Jl. Politeknik No. 12, Tamalanrea, Makassar 90245', 135000, 'diproses', NULL, '2026-11-14 10:05', '2026-11-14 10:05'),
(4, 'UC-20261116-0004', 12, 5, 4, 'Muh. Fadil', '081300000003', 'Fakultas Teknik Unhas, Jl. Poros Malino, Bontomarannu, Gowa 92171', 25000, 'menunggu_pembayaran', NULL, '2026-11-16 16:45', '2026-11-16 16:45'),
(5, 'UC-20261105-0005', 11, 1, 3, 'Siti Nurhaliza', '081300000002', 'Jl. Politeknik No. 12, Tamalanrea, Makassar 90245', 370000, 'selesai', NULL, '2026-11-05 08:20', '2026-11-05 08:20');

-- 7. ORDER_ITEMS
INSERT INTO order_items (id, order_id, product_id, product_name, product_image, price, quantity, subtotal) VALUES
(1, 1, 12, 'Pulpen', '/images/products/pulpen.jpg', 3500, 2, 7000),
(2, 1, 14, 'Kertas Binder A5', '/images/products/kertas-binder-a5.jpg', 12000, 1, 12000),
(3, 2, 1, 'Almet (Jas Almamater) Unhas', '/images/products/almet-jas-almamater-unhas.jpg', 185000, 1, 185000),
(4, 3, 52, 'Scalpel', '/images/products/scalpel.jpg', 25000, 1, 25000),
(5, 3, 60, 'Handscoon (Aesculapius)', '/images/products/handscoon-aesculapius.jpg', 110000, 1, 110000),
(6, 4, 38, 'Tabung Reaksi', '/images/products/tabung-reaksi.jpg', 3000, 5, 15000),
(7, 4, 48, 'Pipet Tetes', '/images/products/pipet-tetes.jpg', 5000, 2, 10000),
(8, 5, 5, 'Toga + Jubah Wisuda', '/images/products/toga-jubah-wisuda.jpg', 350000, 1, 350000),
(9, 5, 7, 'Ganci Unhas', '/images/products/ganci-unhas.jpg', 10000, 2, 20000);

-- 8. ORDER_STATUS_LOGS
INSERT INTO order_status_logs (id, order_id, status, changed_by, note, created_at) VALUES
(1, 1, 'menunggu_pembayaran', 10, 'Pesanan dibuat', '2026-11-10 09:15'),
(2, 1, 'diproses', 4, 'Status diperbarui oleh seller', '2026-11-10 15:15'),
(3, 1, 'dikirim', 4, 'Status diperbarui oleh seller', '2026-11-10 21:15'),
(4, 1, 'selesai', 4, 'Status diperbarui oleh seller', '2026-11-11 03:15'),
(5, 2, 'menunggu_pembayaran', 10, 'Pesanan dibuat', '2026-11-12 14:30'),
(6, 2, 'diproses', 2, 'Status diperbarui oleh seller', '2026-11-12 20:30'),
(7, 2, 'dikirim', 2, 'Status diperbarui oleh seller', '2026-11-13 02:30'),
(8, 3, 'menunggu_pembayaran', 11, 'Pesanan dibuat', '2026-11-14 10:05'),
(9, 3, 'diproses', 7, 'Status diperbarui oleh seller', '2026-11-14 16:05'),
(10, 4, 'menunggu_pembayaran', 12, 'Pesanan dibuat', '2026-11-16 16:45'),
(11, 5, 'menunggu_pembayaran', 11, 'Pesanan dibuat', '2026-11-05 08:20'),
(12, 5, 'diproses', 2, 'Status diperbarui oleh seller', '2026-11-05 14:20'),
(13, 5, 'dikirim', 2, 'Status diperbarui oleh seller', '2026-11-05 20:20'),
(14, 5, 'selesai', 2, 'Status diperbarui oleh seller', '2026-11-06 02:20');

-- 9. REVIEWS
INSERT INTO reviews (product_id, buyer_id, order_id, rating, comment, created_at) VALUES
(12, 10, 1, 5, 'Pulpennya enak dipakai, tulisan halus. Pengiriman cepat.', '2026-11-11 10:00'),
(14, 10, 1, 4, 'Kertas binder bagus, sesuai deskripsi.', '2026-11-11 10:05'),
(5, 11, 5, 5, 'Toga dan jubah rapi, ukuran pas. Recommended!', '2026-11-08 15:30'),
(7, 11, 5, 4, 'Gantungan kuncinya lucu, cocok untuk oleh-oleh.', '2026-11-08 15:35');

-- 10. CART_ITEMS
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(12, 28, 1),
(12, 26, 2),
(13, 6, 1),
(10, 21, 1),
(13, 16, 1);

-- 11. WISHLISTS
INSERT INTO wishlists (user_id, product_id) VALUES
(10, 4),
(10, 55),
(11, 42),
(13, 1),
(12, 30);

-- Sinkronkan sequence SERIAL agar INSERT berikutnya (dari website) tidak bentrok ID
SELECT setval(pg_get_serial_sequence('users', 'id'), (SELECT MAX(id) FROM users));
SELECT setval(pg_get_serial_sequence('stores', 'id'), (SELECT MAX(id) FROM stores));
SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT MAX(id) FROM categories));
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products));
SELECT setval(pg_get_serial_sequence('addresses', 'id'), (SELECT MAX(id) FROM addresses));
SELECT setval(pg_get_serial_sequence('orders', 'id'), (SELECT MAX(id) FROM orders));
SELECT setval(pg_get_serial_sequence('order_items', 'id'), (SELECT MAX(id) FROM order_items));
SELECT setval(pg_get_serial_sequence('order_status_logs', 'id'), (SELECT MAX(id) FROM order_status_logs));