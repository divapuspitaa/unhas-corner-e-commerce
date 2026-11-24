import Link from "next/link";
import {
  LuUsers,
  LuStore,
  LuClock,
  LuPackage,
  LuShoppingBag,
  LuShieldCheck,
  LuFolderTree,
  LuArrowRight,
  LuCircleCheck,
  LuUserCheck,
} from "react-icons/lu";
import { query } from "@/lib/db";

export const metadata = { title: "Dashboard Admin" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reactivation_requested_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reactivation_reason TEXT
  `);

  const [{ rows }, { rows: pendingList }, { rows: reactivationList }] = await Promise.all([
    query(`
      SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'buyer' AND is_active IS NOT FALSE)::int AS buyers,
        (SELECT COUNT(*) FROM users WHERE role = 'seller' AND seller_status = 'approved')::int AS sellers,
        (SELECT COUNT(*) FROM users WHERE role = 'seller' AND seller_status = 'pending')::int AS pending,
        (SELECT COUNT(*) FROM products)::int AS products,
        (SELECT COUNT(*) FROM orders)::int AS orders`),
    query(`
      SELECT u.id, u.name, u.email, s.name AS store_name
      FROM users u
      LEFT JOIN stores s ON s.user_id = u.id
      WHERE u.role = 'seller' AND u.seller_status = 'pending'
      ORDER BY u.id DESC
      LIMIT 5`),
    query(`
      SELECT id, name, email, role, reactivation_reason
      FROM users
      WHERE is_active = FALSE AND reactivation_requested_at IS NOT NULL
      ORDER BY reactivation_requested_at DESC
      LIMIT 5`),
  ]);

  const s = rows[0];
  const stats = [
    { label: "Pembeli Aktif", value: s.buyers, href: "/admin/users", icon: LuUsers },
    { label: "Toko Aktif", value: s.sellers, href: "/admin/users", icon: LuStore },
    { label: "Menunggu Verifikasi", value: s.pending, href: "/admin/verifikasi", icon: LuClock },
    { label: "Total Produk", value: s.products, href: "/admin/produk", icon: LuPackage },
    { label: "Total Pesanan", value: s.orders, href: "/admin/produk", icon: LuShoppingBag },
  ];

  return (
    <div className="space-y-5">
      <div className="card flex flex-wrap items-center justify-between gap-4 border-primary bg-primary p-5">
        <div>
          <h2 className="text-lg font-bold text-white">Pusat Kendali UnhasCorner</h2>
          <p className="mt-0.5 text-sm text-white/85">
            Kelola verifikasi toko resmi kampus, aktivasi akun pengguna, kategori, dan moderasi katalog.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 rounded-2xl bg-white p-2.5">
          <Link href="/admin/verifikasi" className="btn btn-primary btn-sm rounded-full">
            <LuShieldCheck size={15} /> Verifikasi Seller {s.pending > 0 ? `(${s.pending})` : ""}
          </Link>
          <Link href="/admin/users?status=pengajuan" className="btn btn-outline btn-sm rounded-full">
            <LuUserCheck size={14} /> Pengajuan Akun{" "}
            {reactivationList.length > 0 ? `(${reactivationList.length})` : ""}
          </Link>
          <Link href="/admin/kategori" className="btn btn-outline btn-sm rounded-full">
            <LuFolderTree size={14} /> Kelola Kategori
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, href, icon: Icon }) => (
          <Link
            key={label}
            href={href}
            className="card group flex items-center justify-between gap-2 p-4 transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div>
              <p className="text-xs font-medium text-muted">{label}</p>
              <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
            </div>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-105">
              <Icon size={18} />
            </span>
          </Link>
        ))}
      </div>

      {reactivationList.length > 0 && (
        <div className="card border-amber-300 bg-amber-50/40 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-bold text-ink">
              <LuUserCheck size={18} className="text-amber-600" />
              Permohonan Aktivasi Akun Kembali ({reactivationList.length})
            </h3>
            <Link
              href="/admin/users?status=pengajuan"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
            >
              Tinjau semua <LuArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-amber-200/70">
            {reactivationList.map((u) => (
              <div
                key={u.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {u.name} <span className="text-xs font-normal capitalize text-muted">({u.role})</span>
                  </p>
                  <p className="text-xs text-muted">{u.email}</p>
                  {u.reactivation_reason && (
                    <p className="mt-1 text-xs text-amber-900">“{u.reactivation_reason}”</p>
                  )}
                </div>
                <Link
                  href="/admin/users?status=pengajuan"
                  className="btn btn-primary btn-sm rounded-full"
                >
                  Tinjau Akun
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-bold text-ink">Antrean Verifikasi Seller</h3>
          <Link
            href="/admin/verifikasi"
            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Buka halaman verifikasi <LuArrowRight size={13} />
          </Link>
        </div>

        {pendingList.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface/40 px-4 py-8 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <LuCircleCheck size={22} />
            </span>
            <p className="mt-3 text-sm font-semibold text-ink">Semua pengajuan seller telah ditinjau</p>
            <p className="mt-1 max-w-sm text-xs text-muted">
              Tidak ada akun toko baru yang menunggu persetujuan saat ini.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-line/70">
            {pendingList.map((seller) => (
              <div
                key={seller.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-1 last:pb-1"
              >
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {seller.store_name || "Toko Belum Bernama"}
                  </p>
                  <p className="text-xs text-muted">
                    Pengelola: {seller.name} ({seller.email})
                  </p>
                </div>
                <Link href="/admin/verifikasi" className="btn btn-outline btn-sm rounded-full">
                  Tinjau Pengajuan
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}