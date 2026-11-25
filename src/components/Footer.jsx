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
      <div className="mx-auto flex max-w-[1480px] flex-col justify-between gap-8 px-4 py-10 sm:px-6 md:flex-row md:items-start lg:px-8">
        {/* Identitas kiri */}
        <Link href="/" className="shrink-0 leading-none">
          <span className="block font-heading text-2xl font-extrabold tracking-tight text-accent">
            Unhas
          </span>
          <span className="block font-heading text-2xl font-extrabold tracking-tight text-white">
            Corner
          </span>
        </Link>

        {/* Kolom kanan sejajar */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4 md:gap-8 lg:gap-10">
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="mb-2.5 text-sm font-semibold text-accent">{col.title}</p>
              <ul className="space-y-1.5 text-sm text-white/85">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="hover:text-white hover:underline">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="max-w-[220px]">
            <p className="mb-2.5 text-sm font-semibold text-accent">Lokasi</p>
            <p className="text-sm leading-relaxed text-white/85">
              Kampus Tamalanrea, Universitas Hasanuddin, Makassar.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 py-4 text-center text-sm text-accent">
        © {new Date().getFullYear()} UnhasCorner by Diva Puspita
      </div>
    </footer>
  );
}
