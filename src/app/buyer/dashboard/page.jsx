import Link from "next/link";
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
       WHERE o.buyer_id = $1 ORDER BY o.created_at DESC LIMIT 3`,
      [user.id]
    ),
  ]);
  const s = c[0];
  const stats = [
    ["Item di keranjang", s.cart, "/keranjang"],
    ["Pesanan berjalan", s.active, "/buyer/pesanan"],
    ["Total pesanan", s.orders, "/buyer/pesanan"],
    ["Wishlist", s.wishlist, "/buyer/wishlist"],
  ];

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">Halo, {user.name}!</h2>
      <p className="mb-4 text-sm text-muted">Ringkasan aktivitas belanja kamu.</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value, href]) => (
          <Link key={label} href={href} className="card p-4 transition hover:shadow-md">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
          </Link>
        ))}
      </div>

      <h3 className="mb-2 mt-6 font-semibold">Pesanan terbaru</h3>
      {recent.length === 0 ? (
        <p className="text-sm text-muted">Belum ada pesanan.</p>
      ) : (
        <div className="space-y-2">
          {recent.map((o) => (
            <Link key={o.id} href="/buyer/pesanan" className="card flex items-center justify-between p-3 text-sm hover:shadow-md">
              <div>
                <p className="font-semibold">{o.order_code}</p>
                <p className="text-xs text-muted">{formatDate(o.created_at)}</p>
              </div>
              <div className="text-right">
                <StatusBadge status={o.status} />
                <p className="mt-1 font-bold text-primary">{formatRupiah(o.total_price)}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
