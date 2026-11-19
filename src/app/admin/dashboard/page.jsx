import Link from "next/link";
import { query } from "@/lib/db";

export const metadata = { title: "Panel Admin" };
export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const { rows } = await query(`
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'buyer')::int AS buyers,
      (SELECT COUNT(*) FROM users WHERE role = 'seller' AND seller_status = 'approved')::int AS sellers,
      (SELECT COUNT(*) FROM users WHERE role = 'seller' AND seller_status = 'pending')::int AS pending,
      (SELECT COUNT(*) FROM products)::int AS products,
      (SELECT COUNT(*) FROM orders)::int AS orders`);
  const s = rows[0];
  const stats = [
    ["Buyer", s.buyers],
    ["Seller aktif", s.sellers],
    ["Menunggu verifikasi", s.pending],
    ["Produk", s.products],
    ["Pesanan", s.orders],
  ];
  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {stats.map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-2xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>
      {s.pending > 0 && (
        <Link href="/admin/verifikasi" className="btn btn-primary mt-5">
          Tinjau {s.pending} seller pending
        </Link>
      )}
    </div>
  );
}
