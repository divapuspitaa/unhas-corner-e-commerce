<div align="center">

<img src="public/images/logo.svg" alt="Logo UnhasCorner" width="120" />

# UnhasCorner

> Platform E-Commerce Resmi Kampus Universitas Hasanuddin — Menghubungkan Mahasiswa dengan Merchant & Koperasi Kampus Terverifikasi.

[![Next.js](https://img.shields.io/badge/Next.js-16.4.6-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

[Tentang Proyek](#-about-the-project) · [Fitur Utama](#-features) · [Tech Stack](#-tech-stack) · [Memulai](#-getting-started) · [Struktur Proyek](#-project-structure) · [Cara Penggunaan](#-usage)

</div>

<!-- Project Banner -->

---

## About The Project

**UnhasCorner** adalah aplikasi web marketplace kampus yang dirancang khusus untuk ekosistem **Universitas Hasanuddin (Unhas)**. Platform ini memfasilitasi jual-beli atribut resmi kampus (jas almamater, toga, jaket KKN), perlengkapan praktikum, alat tulis, dan merchandise mahasiswa dari toko serta koperasi kampus yang telah terverifikasi oleh Admin.

### Masalah yang Diselesaikan
- Mahasiswa sering kesulitan mencari atribut resmi kampus dan perlengkapan praktikum yang terpercaya dalam satu tempat.
- Pengelola toko/koperasi kampus membutuhkan kanal digital terstruktur untuk mengelola katalog produk, stok, serta memproses pesanan secara transparan.
- Admin kampus memerlukan sistem verifikasi identitas pendaftar toko (NIK, Foto KTP, Foto Diri) dan moderasi katalog agar transaksi tetap aman.

---

## Features

- **Katalog Produk & Pencarian Pintar**: Jelajahi produk berdasarkan kategori, toko resmi kampus, spotlight **Produk Terlaris**, pencarian cepat, serta sorting stok/harga.
- **Multi-Role Authentication (JWT Cookie)**: Pemisahan akses yang aman antara **Buyer (Pembeli)**, **Seller (Pengelola Toko)**, dan **Admin** melalui `middleware.js` dan `jose`.
- **Pendaftaran Toko 3 Langkah & Verifikasi Identitas**:
  - Registrasi khusus email resmi `@unhascorner.id` dengan wizard **Data Diri → Info Toko → Verifikasi (NIK, Foto KTP, Foto Diri)**.
  - Deteksi otomatis kelengkapan NIK & ketajaman/blur foto yang langsung tampil sebagai notifikasi di Dashboard Admin.
  - Alasan penolakan tercatat dan tampil pada halaman status toko beserta kontak `admin@unhascorner.id`.
- **Keranjang, Wishlist Mandiri, & Checkout Multi-Alamat**: Kelola daftar produk favorit di halaman `/wishlist`, atur alamat pengiriman di `/buyer/alamat`, dan checkout langsung maupun dari keranjang.
- **Alur Lacak & Proses Pesanan Transparan**:
  - Stepper status real-time: *Menunggu Verifikasi → Diproses Seller → Dikirim → Selesai (Diterima)*.
  - Penyelesaian pesanan hanya dapat dikonfirmasi oleh **Buyer** setelah barang diterima, lalu Buyer dapat memberikan ulasan bintang & komentar (sekali kirim, permanen).
- **Dashboard Seller & Moderasi Admin**:
  - Seller dapat memantau ringkasan pendapatan, peringatan stok menipis, memperbarui profil toko, mengganti password, serta mengelola produk & pesanan masuk.
  - Admin dapat memverifikasi pendaftar toko, mengelola pengajuan aktivasi akun, kategori, pengguna, dan moderasi produk (produk yang memiliki riwayat pesanan terkunci dari penghapusan).

---

## Tech Stack

- **Frontend:** Next.js 16 (App Router, Server & Client Components), React 19, Tailwind CSS v4 (`@tailwindcss/postcss`), React Icons (`react-icons/lu`)
- **Backend:** Next.js Route Handlers (`/api/*`) & Server Actions (`src/actions/*`), `bcryptjs`, `jose` (JWT)
- **Database:** PostgreSQL (`pg` connection pool)
- **Tools:** ESLint 9 (`eslint-config-next`), Node.js, npm

---

## Getting Started

### Prerequisites

- **Node.js** (v18 atau lebih baru)
- **npm**
- **PostgreSQL** (lokal atau cloud)

### Installation

1. Clone the repository.

```bash
git clone https://github.com/divapuspitaa/unhas-corner-ecommerce.git
```

2. Navigate to the project directory.

```bash
cd unhas-corner
```

3. Install dependencies.

```bash
npm install
```

4. Configure environment variables.

Buat file `.env.local` di root proyek dan sesuaikan konfigurasi database serta secret JWT Anda:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/unhas_corner
JWT_SECRET=your-secret-key
```

5. Run the development server.

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser untuk melihat aplikasi.

---

## Project Structure

```text
unhas-corner/
├── public/
│   └── images/                 # Aset gambar logo, produk, toko, & verifikasi
├── src/
│   ├── actions/                # Server Actions (admin, auth, cart, orders, products, profile, store, wishlist)
│   ├── app/
│   │   ├── (public & auth)/    # Beranda, /produk, /toko, /keranjang, /wishlist, /checkout, /login, /register
│   │   ├── admin/              # Panel Admin (/admin/dashboard, verifikasi, users, kategori, produk)
│   │   ├── api/                # Route Handlers (/api/login, /api/register, /api/products)
│   │   ├── buyer/              # Area Pembeli (/buyer/dashboard, pesanan, alamat, profil)
│   │   ├── seller/             # Area Toko (/seller/dashboard, toko, produk, pesanan, pending)
│   │   ├── globals.css         # Entry point Tailwind CSS v4 & token tema UnhasCorner
│   │   └── layout.jsx          # Root Layout aplikasi
│   ├── components/             # Komponen UI reusable (Navbar, Footer, ProductCard, OrderTimeline, AuthForm, dll.)
│   ├── lib/                    # Utilitas inti (db, auth, jwt, format, orders, queries, sellerVerification)
│   └── middleware.js           # Proteksi rute berbasis role (admin, seller, buyer)
├── eslint.config.mjs
├── next.config.mjs
├── postcss.config.mjs
├── package.json
└── README.md
```

---

## Usage

<details>
<summary><strong>Panduan Alur Pengguna (Pembeli, Toko, & Admin)</strong></summary>

1. **Pembeli (Buyer)**:
   - Daftar akun di `/register` (pilih **Pembeli**) atau masuk di `/login`.
   - Jelajahi katalog di `/` atau `/produk`, simpan produk ke **Wishlist** (`/wishlist`), atau tambahkan ke **Keranjang** (`/keranjang`).
   - Lakukan checkout, `/checkout` (tersedia pilihan **checkout langsung** dari produk, **checkout item satu per satu**, maupun **checkout semua belanjaan sekaligus** dari keranjang), pantau status pesanan secara *real-time* di `/buyer/pesanan`, klik **Pesanan Diterima (Selesai)** saat barang tiba, dan berikan ulasan produk.
2. **Pengelola Toko (Seller)**:
   - Daftar di `/register` (pilih **Toko**) menggunakan email `@unhascorner.id` melalui 3 langkah (*Data Diri → Info Toko → Verifikasi NIK, KTP & Selfie*).
   - Tunggu persetujuan Admin. Jika disetujui, kelola toko & ganti password di `/seller/toko`, tambah produk di `/seller/produk`, dan proses pesanan di `/seller/pesanan`.
3. **Admin**:
   - Pantau notifikasi kelengkapan data pendaftar seller di `/admin/dashboard` dan lakukan verifikasi (Approve / Reject dengan alasan) di `/admin/verifikasi`.
   - Kelola kategori (`/admin/kategori`), pengguna & pengajuan aktivasi (`/admin/users`), serta moderasi produk (`/admin/produk`).

</details>

---

## Demo Accounts

Berikut daftar akun pengujian yang tersedia di database (akun ID 1–16 berasal dari data seed dengan password yang sama, sedangkan akun ID 17 merupakan akun uji registrasi manual):

### Admin

| ID | Nama | Email | No. Telepon | Status | Password |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 1 | Admin UnhasCorner | `admin@unhascorner.id` | `081200000001` | Aktif | Password default seed |

### Seller (Pengelola Toko)

| ID | Nama | Email | No. Telepon | Status Seller | Password |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 2 | Seller Hadin | `hadin@unhascorner.id` | `081200000002` | `approved` | Password default seed |
| 3 | Seller SEMA | `sema@unhascorner.id` | `081200000003` | `approved` | Password default seed |
| 4 | Seller Oxi | `oxi@unhascorner.id` | `081200000004` | `approved` | Password default seed |
| 5 | Seller Kopma | `kopma@unhascorner.id` | `081200000005` | `approved` | Password default seed |
| 6 | Seller Sumber Rezeki | `sumberrezeki@unhascorner.id` | `081200000006` | `approved` | Password default seed |
| 7 | Seller Aesculapius | `aesculapius@unhascorner.id` | `081200000007` | `approved` | Password default seed |
| 8 | Calon Seller Pending | `pending@unhascorner.id` | `081200000008` | `pending` | Password default seed |
| 9 | Calon Seller Ditolak | `rejected@unhascorner.id` | `081200000009` | `rejected` | Password default seed |
| 14 | Seller Maba Mart | `mabamart@unhascorner.id` | `081200000010` | `approved` | Password default seed |
| 15 | Seller Lab Corner | `labcorner@unhascorner.id` | `081200000011` | `approved` | Password default seed |
| 17 | bibi | `bibi@unhascorner.id` | `082874373373` | `rejected` | Password registrasi manual |

### Buyer (Pembeli)

| ID | Nama | Email | No. Telepon | Status | Password |
| :-: | :--- | :--- | :--- | :--- | :--- |
| 10 | Andi Rahman | `andi@student.unhas.ac.id` | `081300000001` | Aktif | Password default seed |
| 11 | Siti Nurhaliza | `siti@student.unhas.ac.id` | `081300000002` | Aktif | Password default seed |
| 12 | Muh. Fadil | `fadil@student.unhas.ac.id` | `081300000003` | Aktif | Password default seed |
| 13 | Rina Kartika | `rina@student.unhas.ac.id` | `081300000004` | Aktif | Password default seed |
| 16 | Nurul Aini | `nurul@student.unhas.ac.id` | `081300000005` | Aktif | Password default seed |

## Contributing

Contributions, issues, and feature requests are welcome! Silakan buat *issue* atau kirim *pull request* untuk pengembangan fitur lebih lanjut.

---

## License

Proyek ini dikembangkan untuk keperluan akademik dan pembelajaran Pemrograman Web.

---

## Author

**Diva Puspita** — Universitas Hasanuddin
