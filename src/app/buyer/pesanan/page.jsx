import Link from "next/link";
import ConfirmButton from "@/components/ConfirmButton";
import ReviewForm from "@/components/ReviewForm";
import SafeImage from "@/components/SafeImage";
import { StatusBadge } from "@/components/Badge";
import OrderTabs, { filterOrders } from "@/components/OrderTabs";
import OrderTimeline from "@/components/OrderTimeline";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { ACTIVE_ORDER_STATUSES, formatDate, formatRupiah } from "@/lib/format";
import { cancelOrder, confirmReceived } from "@/actions/orders";

export const metadata = { title: "Riwayat Pesanan" };
export const dynamic = "force-dynamic";

export default async function BuyerOrdersPage({ searchParams }) {
  const sp = await searchParams;
  const user = await requireUser("buyer");

  const { rows: allOrders } = await query(
    `SELECT o.*, s.name AS store_name FROM orders o JOIN stores s ON s.id = o.store_id
     WHERE o.buyer_id = $1 ORDER BY o.created_at DESC, o.id DESC`,
    [user.id]
  );
  const tab = ["berjalan", "selesai", "dibatalkan"].includes(sp.tab) ? sp.tab : "semua";
  const counts = {
    semua: allOrders.length,
    berjalan: filterOrders(allOrders, "berjalan", ACTIVE_ORDER_STATUSES).length,
    selesai: filterOrders(allOrders, "selesai", ACTIVE_ORDER_STATUSES).length,
    dibatalkan: filterOrders(allOrders, "dibatalkan", ACTIVE_ORDER_STATUSES).length,
  };
  const orders = filterOrders(allOrders, tab, ACTIVE_ORDER_STATUSES);
  const ids = orders.map((o) => o.id);
  const [items, logs, reviews] = ids.length
    ? await Promise.all([
        query("SELECT * FROM order_items WHERE order_id = ANY($1) ORDER BY id", [ids]),
        query("SELECT * FROM order_status_logs WHERE order_id = ANY($1) ORDER BY created_at, id", [ids]),
        query("SELECT * FROM reviews WHERE buyer_id = $1 AND order_id = ANY($2)", [user.id, ids]),
      ])
    : [{ rows: [] }, { rows: [] }, { rows: [] }];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Riwayat Pesanan</h2>
      <OrderTabs basePath="/buyer/pesanan" tab={tab} counts={counts} />
      {orders.length === 0 && allOrders.length === 0 && (
        <div className="card p-8 text-center text-muted">
          Belum ada pesanan. <Link href="/produk" className="font-semibold text-primary">Belanja sekarang</Link>
        </div>
      )}
      {orders.length === 0 && allOrders.length > 0 && (
        <div className="card p-8 text-center text-muted">Tidak ada pesanan pada kategori ini.</div>
      )}

      {orders.map((o) => (
        <div key={o.id} className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{o.order_code}</p>
              <p className="text-xs text-muted">{o.store_name} · {formatDate(o.created_at)}</p>
            </div>
            <StatusBadge status={o.status} />
          </div>

          <div className="divide-y divide-line">
            {items.rows.filter((i) => i.order_id === o.id).map((i) => {
              const rv = reviews.rows.find((r) => r.order_id === o.id && r.product_id === i.product_id);
              return (
                <div key={i.id} className="p-4">
                  <div className="flex gap-3">
                    <SafeImage src={i.product_image} alt={i.product_name} className="h-14 w-14 rounded-lg object-cover" />
                    <div className="min-w-0 flex-1 text-sm">
                      <p className="font-medium">{i.product_name}</p>
                      <p className="text-muted">{i.quantity} × {formatRupiah(i.price)}</p>
                    </div>
                    <p className="text-sm font-semibold">{formatRupiah(i.subtotal)}</p>
                  </div>
                  {o.status === "selesai" && i.product_id && (
                    rv ? (
                      <div className="mt-2 rounded-lg bg-surface/70 px-3 py-2 text-xs">
                        <p className="font-semibold text-primary">Ulasanmu: {rv.rating}★</p>
                        {rv.comment && <p className="mt-0.5 text-muted">{rv.comment}</p>}
                      </div>
                    ) : (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs font-semibold text-primary">
                          Beri ulasan
                        </summary>
                        <ReviewForm orderId={o.id} productId={i.product_id} initialRating={0} initialComment="" />
                      </details>
                    )
                  )}
                </div>
              );
            })}
          </div>

          <div className="space-y-3 border-t border-line p-4 text-sm">
            <p className="text-muted"><span className="font-medium text-ink">Dikirim ke:</span> {o.shipping_recipient}, {o.shipping_address}</p>

            <OrderTimeline
              status={o.status}
              logs={logs.rows.filter((l) => l.order_id === o.id)}
            />

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-primary">Total: {formatRupiah(o.total_price)}</p>
              <div className="flex flex-wrap items-center gap-2">
                {o.status === "menunggu_pembayaran" && (
                  <form action={cancelOrder}>
                    <input type="hidden" name="orderId" value={o.id} />
                    <ConfirmButton message="Batalkan pesanan ini?">Batalkan</ConfirmButton>
                  </form>
                )}
                {o.status === "dikirim" && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted">Sudah terima barang dari seller?</span>
                    <form action={confirmReceived}>
                      <input type="hidden" name="orderId" value={o.id} />
                      <button className="btn btn-primary btn-sm">Pesanan Diterima (Selesai)</button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}