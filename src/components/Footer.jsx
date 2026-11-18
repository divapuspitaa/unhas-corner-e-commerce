import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-3">
        <div>
          <p className="font-heading text-lg font-bold text-primary">UnhasCorner</p>
          <p className="mt-2 text-sm text-muted">
            Marketplace atribut, merchandise, dan perlengkapan akademik mahasiswa Universitas Hasanuddin.
          </p>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Jelajahi</p>
          <ul className="space-y-1 text-sm text-muted">
            <li><Link href="/produk" className="hover:text-primary">Semua Produk</Link></li>
            <li><Link href="/toko" className="hover:text-primary">Toko Resmi Kampus</Link></li>
            <li><Link href="/register" className="hover:text-primary">Daftar Jadi Seller</Link></li>
          </ul>
        </div>
        <div>
          <p className="mb-2 text-sm font-semibold">Lokasi</p>
          <p className="text-sm text-muted">Kampus Tamalanrea, Universitas Hasanuddin, Makassar.</p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} UnhasCorner — Proyek Final Praktikum Pemrograman Web.
      </div>
    </footer>
  );
}
