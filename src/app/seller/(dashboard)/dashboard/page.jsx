import Link from "next/link";
import {
  LuPackage,
  LuLayers,
  LuClock,
  LuWallet,
  LuPlus,
  LuStore,
  LuArrowRight,
  LuShoppingBag,
} from "react-icons/lu";
import { StatusBadge } from "@/components/Badge";
import { requireApprovedSeller } from "@/lib/auth";
import { query } from "@/lib/db";
import { getStoreByUser } from "@/lib/queries";
import { formatDate, formatRupiah } from "@/lib/format";

export const metadata = { title: "Ringkasan Toko" };
export const dynamic = "force-dynamic";

export default async function SellerHome() {
  const user = await requireApprovedSeller();
  const store = await getStoreByUser(user.id);

  if (!store) {
    return (
      <div className="card flex flex-col items-center justify-center border-2 border-dashed border-line p-8 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
          <LuStore size={24} />
        </span>
        <h2 className="mt-3 text-base font-bold text-ink">Profil Toko Belum Lengkap</h2>
        <p className="mt-1 max-w-md text-xs text-muted">
          Lengkapi nama, deskripsi, dan identitas toko kampus Anda agar produk dapat mulai dipasarkan.
        </p>
        <Link href="/seller/toko" className="btn btn-primary mt-4 rounded-full">
          Lengkapi Profil Toko
        </Link>
      </div>
    );
  }

  const [{ rows: prod }, { rows: ord }, { rows: rev }, { rows: recentOrders }] = await Promise.all([
    query("SELECT COUNT(*)::int AS n, COALESCE(SUM(stock),0)::int AS stock FROM products WHERE store_id = $1", [store.id]),
    query("SELECT status, COUNT(*)::int AS n FROM orders WHERE store_id = $1 GROUP BY status", [store.id]),
    query("SELECT COALESCE(SUM(total_price),0) AS total FROM orders WHERE store_id = $1 AND status = 'selesai'", [store.id]),
    query(
      `SELECT o.id, o.order_code, o.status, o.total_price, o.created_at, u.name AS buyer_name
       FROM orders o
       JOIN users u ON u.id = o.buyer_id
       WHERE o.store_id = $1
       ORDER BY o.created_at DESC
       LIMIT 5`,
      [store.id]
    ),
  ]);

  const byStatus = Object.fromEntries(ord.map((o) => [o.status, o.n]));
  const needAction = (byStatus.menunggu_pembayaran ?? 0) + (byStatus.diproses ?? 0);

  const stats = [
    { label: "Total Produk", value: prod[0].n, href: "/seller/produk", icon: LuPackage },
    { label: "Total Stok Tersedia", value: prod[0].stock, href: "/seller/produk", icon: LuLayers },
    { label: "Perlu Diproses", value: needAction, href: "/seller/pesanan", icon: LuClock },
    { label: "Pendapatan Selesai", value: formatRupiah(rev[0].total), href: "/seller/pesanan", icon: LuWallet },
  ];

  return (
    <div className="space-y-5">
      {/* Header Profil Toko & Aksi Cepat */}
      <div className="card flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-primary-soft/60 via-white to-white p-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-ink">{store.name}</h2>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
              Toko Aktif
            </span>
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted">
            {store.description || "Kelola katalog produk dan pesanan mahasiswa Universitas Hasanuddin."}
          </p>
        </div>

        <div className="sticky top-20 z-30 rounded-2xl border border-black/10 bg-white/95 p-2.5 shadow-sm backdrop-blur-md sticky top-20 z-30 rounded-2xl border border-black/10 bg-white/95 p-2.5 shadow-sm backdrop-blur-md flex flex-wrap gap-2">
          <Link href="/seller/produk/baru" className="btn btn-primary btn-sm rounded-full">
            <LuPlus size={15} /> Tambah Produk
          </Link>
          <Link href="/seller/toko" className="btn btn-outline btn-sm rounded-full">
            <LuStore size={14} /> Edit Toko
          </Link>
        </div>
      </div>

      {/* Kartu Statistik Toko */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="card group flex items-center justify-between gap-2 p-4 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div className="min-w-0">
              <p className="text-xs font-medium text-muted">{label}</p>
              <p className="mt-1 truncate text-xl font-bold text-primary">{value}</p>
            </div>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-105">
              <Icon size={20} />
            </span>
          </Link>
        ))}
      </div>

      {/* Daftar Pesanan Masuk Terbaru */}
      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-ink">Pesanan Masuk Terbaru</h3>
          {recentOrders.length > 0 && (
            <Link
              href="/seller/pesanan"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Kelola semua pesanan <LuArrowRight size={13} />
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface/40 px-4 py-8 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
              <LuShoppingBag size={22} />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">Belum ada pesanan masuk</p>
            <p className="mt-1 max-w-sm text-xs text-muted">
              Pastikan foto dan deskripsi produk Anda lengkap agar menarik pembeli di kampus.
            </p>
            <Link href="/seller/produk/baru" className="btn btn-outline btn-sm mt-4 rounded-full">
              Tambah Produk Baru
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-line/70">
            {recentOrders.map((o) => (
              <Link
                key={o.id}
                href="/seller/pesanan"
                className="flex flex-wrap items-center justify-between gap-3 py-3 transition-colors first:pt-1 last:pb-1 hover:text-primary"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {o.order_code} <span className="font-normal text-muted">· {o.buyer_name}</span>
                  </p>
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