import Link from "next/link";
import {
  LuShoppingCart,
  LuClock,
  LuPackageCheck,
  LuHeart,
  LuArrowRight,
  LuShoppingBag,
  LuMapPin,
} from "react-icons/lu";
import { StatusBadge } from "@/components/Badge";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatDate, formatRupiah } from "@/lib/format";

export const metadata = { title: "Dashboard Mahasiswa" };
export const dynamic = "force-dynamic";

export default async function BuyerDashboard() {
  const user = await requireUser("buyer");
  const [{ rows: c }, { rows: recent }] = await Promise.all([
    query(
      `SELECT
        (SELECT COALESCE(SUM(quantity),0)::int FROM cart_items WHERE user_id = $1) AS cart,
        (SELECT COUNT(*)::int FROM wishlists WHERE user_id = $1) AS wishlist,
        (SELECT COUNT(*)::int FROM orders WHERE buyer_id = $1) AS orders,
        (SELECT COUNT(*)::int FROM orders WHERE buyer_id = $1 AND status IN ('menunggu_pembayaran','diproses','dikirim')) AS active`,
      [user.id]
    ),
    query(
      `SELECT o.id, o.order_code, o.status, o.total_price, o.created_at FROM orders o
       WHERE o.buyer_id = $1 ORDER BY o.created_at DESC LIMIT 4`,
      [user.id]
    ),
  ]);

  const s = c[0];
  const stats = [
    { label: "Item di Keranjang", value: s.cart, href: "/keranjang", icon: LuShoppingCart },
    { label: "Pesanan Berjalan", value: s.active, href: "/buyer/pesanan", icon: LuClock },
    { label: "Total Pesanan", value: s.orders, href: "/buyer/pesanan", icon: LuPackageCheck },
    { label: "Produk Wishlist", value: s.wishlist, href: "/buyer/wishlist", icon: LuHeart },
  ];

  return (
    <div className="space-y-5">
      {/* Banner Sambutan & Pintasan Cepat */}
      <div className="card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary-soft/60 via-white to-white p-5">
        <div>
          <h2 className="text-lg font-bold text-ink">Halo, {user.name}!</h2>
          <p className="mt-0.5 text-sm text-muted">
            Pantau keranjang, status pengiriman, dan kebutuhan kuliahmu di UnhasCorner.
          </p>
        </div>
        <div className="sticky top-20 z-30 rounded-2xl border border-black/10 bg-white/95 p-2.5 shadow-sm backdrop-blur-md sticky top-20 z-30 rounded-2xl border border-black/10 bg-white/95 p-2.5 shadow-sm backdrop-blur-md flex flex-wrap gap-2">
          <Link href="/produk" className="btn btn-primary btn-sm rounded-full">
            <LuShoppingBag size={14} /> Belanja Sekarang
          </Link>
          <Link href="/buyer/alamat" className="btn btn-outline btn-sm rounded-full">
            <LuMapPin size={14} /> Atur Alamat
          </Link>
        </div>
      </div>

      {/* Kartu Statistik */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="card group flex items-center justify-between p-4 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div>
              <p className="text-xs font-medium text-muted">{label}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-105">
              <Icon size={20} />
            </span>
          </Link>
        ))}
      </div>

      {/* Daftar Pesanan Terbaru */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-ink">Pesanan Terbaru</h3>
          {recent.length > 0 && (
            <Link
              href="/buyer/pesanan"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Lihat semua <LuArrowRight size={13} />
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface/40 px-4 py-8 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
              <LuPackageCheck size={22} />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">Belum ada riwayat pesanan</p>
            <p className="mt-1 max-w-sm text-xs text-muted">
              Mulai jelajahi perlengkapan kuliah dan atribut resmi Unhas dari toko kampus terpercaya.
            </p>
            <Link href="/produk" className="btn btn-primary btn-sm mt-4 rounded-full">
              Jelajahi Produk
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line/70">
            {recent.map((o) => (
              <Link
                key={o.id}
                href="/buyer/pesanan"
                className="flex items-center justify-between gap-3 py-3 transition-colors first:pt-1 last:pb-1 hover:text-primary"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">{o.order_code}</p>
                  <p className="text-xs text-muted">{formatDate(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-3 text-right">
                  <StatusBadge status={o.status} />
                  <p className="min-w-24 text-sm font-bold text-primary">
                    {formatRupiah(o.total_price)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}