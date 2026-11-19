import Link from "next/link";
import { requireApprovedSeller } from "@/lib/auth";
import { query } from "@/lib/db";
import { getStoreByUser } from "@/lib/queries";
import { formatRupiah } from "@/lib/format";

export const metadata = { title: "Ringkasan Toko" };
export const dynamic = "force-dynamic";

export default async function SellerHome() {
  const user = await requireApprovedSeller();
  const store = await getStoreByUser(user.id);

  if (!store) {
    return (
      <div className="card p-6">
        <p>Anda belum mengisi data toko.</p>
        <Link href="/seller/toko" className="btn btn-primary mt-3">Lengkapi Toko</Link>
      </div>
    );
  }

  const [{ rows: prod }, { rows: ord }, { rows: rev }] = await Promise.all([
    query("SELECT COUNT(*)::int AS n, COALESCE(SUM(stock),0)::int AS stock FROM products WHERE store_id = $1", [store.id]),
    query("SELECT status, COUNT(*)::int AS n FROM orders WHERE store_id = $1 GROUP BY status", [store.id]),
    query("SELECT COALESCE(SUM(total_price),0) AS total FROM orders WHERE store_id = $1 AND status = 'selesai'", [store.id]),
  ]);
  const byStatus = Object.fromEntries(ord.map((o) => [o.status, o.n]));

  const stats = [
    ["Produk", prod[0].n],
    ["Total stok", prod[0].stock],
    ["Perlu diproses", (byStatus.menunggu_pembayaran ?? 0) + (byStatus.diproses ?? 0)],
    ["Pendapatan (selesai)", formatRupiah(rev[0].total)],
  ];

  return (
    <div>
      <h2 className="mb-1 text-lg font-semibold">{store.name}</h2>
      <p className="mb-4 text-sm text-muted">{store.description}</p>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(([label, value]) => (
          <div key={label} className="card p-4">
            <p className="text-xs text-muted">{label}</p>
            <p className="mt-1 text-xl font-bold text-primary">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
