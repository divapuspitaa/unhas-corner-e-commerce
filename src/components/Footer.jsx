import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

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

export default async function Footer() {
  const user = await getCurrentUser();
  if (user?.role === "admin" || user?.role === "seller") return null;

  return (
    <footer className="mt-8 border-t border-primary-dark bg-primary text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
        {COLUMNS.map((col) => (
          <div key={col.title}>
            <p className="mb-3 text-sm font-semibold text-accent">{col.title}</p>
            <ul className="space-y-2 text-sm text-white/80">
              {col.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-white hover:underline">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <p className="mb-3 text-sm font-semibold text-accent">Lokasi</p>
          <p className="text-sm text-white/80">Kampus Tamalanrea, Universitas Hasanuddin, Makassar.</p>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-s text-accent">
        © {new Date().getFullYear()} UnhasCorner by Diva Puspita
      </div>
    </footer>
  );
}
