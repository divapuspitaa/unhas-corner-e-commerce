import Link from "next/link";

const COLUMNS = [
  {
    title: "Tentang UnhasCorner",
    links: [
      { href: "/", label: "Beranda" },
      { href: "/toko", label: "Toko Resmi Kampus" },
      { href: "/register", label: "Bergabung" },
    ],
  },
  {
    title: "Beli",
    links: [
      { href: "/produk", label: "Semua Produk" },
      { href: "/keranjang", label: "Keranjang" },
      { href: "/buyer/pesanan", label: "Pesanan Saya" },
    ],
  },
  {
    title: "Jual",
    links: [
      { href: "/register", label: "Daftar Jadi Seller" },
      { href: "/seller/dashboard", label: "Dashboard Toko" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-line bg-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-sm font-semibold">{col.title}</p>
            <ul className="space-y-2 text-sm text-muted">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-primary">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="mb-3 text-sm font-semibold">Lokasi</p>
          <p className="text-sm text-muted">Kampus Tamalanrea, Universitas Hasanuddin, Makassar.</p>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} UnhasCorner — Proyek Final Praktikum Pemrograman Web.
      </div>
    </footer>
  );
}
