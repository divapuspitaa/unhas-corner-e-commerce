import { StatusBadge } from "@/components/Badge";
import OrderTabs, { filterOrders } from "@/components/OrderTabs";
import OrderTimeline from "@/components/OrderTimeline";
import SubmitButton from "@/components/SubmitButton";
import { requireApprovedSeller } from "@/lib/auth";
import { query } from "@/lib/db";
import { ACTIVE_ORDER_STATUSES, NEXT_STATUS, ORDER_STATUS, formatDate, formatRupiah } from "@/lib/format";
import { updateOrderStatus } from "@/actions/orders";

export const metadata = { title: "Pesanan Masuk" };
export const dynamic = "force-dynamic";

export default async function SellerOrdersPage({ searchParams }) {
  const sp = await searchParams;
  const user = await requireApprovedSeller();
  const { rows: allOrders } = await query(
    `SELECT o.*, u.name AS buyer_name FROM orders o
     JOIN stores s ON s.id = o.store_id JOIN users u ON u.id = o.buyer_id
     WHERE s.user_id = $1 ORDER BY o.created_at DESC, o.id DESC`,
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
  const [itemsRes, logsRes] = ids.length
    ? await Promise.all([
        query("SELECT * FROM order_items WHERE order_id = ANY($1) ORDER BY id", [ids]),
        query("SELECT * FROM order_status_logs WHERE order_id = ANY($1) ORDER BY created_at, id", [ids]),
      ])
    : [{ rows: [] }, { rows: [] }];
  const items = itemsRes.rows;
  const logs = logsRes.rows;

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pesanan Masuk</h2>
      <OrderTabs basePath="/seller/pesanan" tab={tab} counts={counts} />
      {orders.length === 0 && (
        <div className="card p-8 text-center text-muted">
          {allOrders.length === 0 ? "Belum ada pesanan masuk." : "Tidak ada pesanan pada kategori ini."}
        </div>
      )}

      {orders.map((o) => (
        <div key={o.id} className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{o.order_code}</p>
              <p className="text-xs text-muted">{o.buyer_name} · {formatDate(o.created_at)}</p>
            </div>
            <StatusBadge status={o.status} />
          </div>
          <div className="space-y-3 p-4 text-sm">
            <div className="space-y-1">
              {items.filter((i) => i.order_id === o.id).map((i) => (
                <div key={i.id} className="flex justify-between">
                  <span>{i.product_name} × {i.quantity}</span>
                  <span className="text-muted">{formatRupiah(i.subtotal)}</span>
                </div>
              ))}
              <p className="pt-2 text-xs text-muted">
                Kirim ke: {o.shipping_recipient} ({o.shipping_phone}), {o.shipping_address}
              </p>
              {o.note && <p className="text-xs text-muted">Catatan: {o.note}</p>}
            </div>

            <OrderTimeline
              status={o.status}
              logs={logs.filter((l) => l.order_id === o.id)}
            />
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line p-4">
            <p className="font-bold text-primary">{formatRupiah(o.total_price)}</p>
            <div className="flex flex-wrap items-center gap-2">
              {o.status === "dikirim" && (
                <span className="rounded-full bg-status-shipping-bg px-3 py-1 text-xs font-medium text-status-shipping-text">
                  Sedang dikirim ke pembeli
                </span>
              )}
              {o.status === "selesai" && (
                <span className="rounded-full bg-status-success-bg px-3 py-1 text-xs font-medium text-status-success-text">
                  Pesanan telah diterima &amp; diselesaikan oleh pembeli
                </span>
              )}
              {NEXT_STATUS[o.status].map((s) => (
                <form key={`${o.id}-${o.status}-${s}`} action={updateOrderStatus}>
                  <input type="hidden" name="orderId" value={o.id} />
                  <input type="hidden" name="status" value={s} />
                  <SubmitButton
                    className={s === "dibatalkan" ? "btn btn-danger btn-sm" : "btn btn-primary btn-sm"}
                    pendingText="Memproses..."
                  >
                    {s === "dibatalkan" ? "Batalkan" : `Tandai ${ORDER_STATUS[s].label}`}
                  </SubmitButton>
                </form>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}