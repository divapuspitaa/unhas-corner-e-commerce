import { StatusBadge } from "@/components/Badge";
import { requireApprovedSeller } from "@/lib/auth";
import { query } from "@/lib/db";
import { NEXT_STATUS, ORDER_STATUS, formatDate, formatRupiah } from "@/lib/format";
import { updateOrderStatus } from "@/actions/orders";

export const metadata = { title: "Pesanan Masuk" };
export const dynamic = "force-dynamic";

export default async function SellerOrdersPage({ searchParams }) {
  const sp = await searchParams;
  const user = await requireApprovedSeller();
  const { rows: orders } = await query(
    `SELECT o.*, u.name AS buyer_name FROM orders o
     JOIN stores s ON s.id = o.store_id JOIN users u ON u.id = o.buyer_id
     WHERE s.user_id = $1 ORDER BY o.created_at DESC, o.id DESC`,
    [user.id]
  );
  const ids = orders.map((o) => o.id);
  const items = ids.length ? (await query("SELECT * FROM order_items WHERE order_id = ANY($1) ORDER BY id", [ids])).rows : [];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Pesanan Masuk</h2>
      {orders.length === 0 && <div className="card p-8 text-center text-muted">Belum ada pesanan masuk.</div>}

      {orders.map((o) => (
        <div key={o.id} className="card overflow-hidden">
          <div className="sticky top-20 z-30 rounded-2xl border border-black/10 bg-white/95 p-2.5 shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-4 py-3">
            <div>
              <p className="text-sm font-semibold">{o.order_code}</p>
              <p className="text-xs text-muted">{o.buyer_name} · {formatDate(o.created_at)}</p>
            </div>
            <StatusBadge status={o.status} />
          </div>
          <div className="space-y-1 p-4 text-sm">
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
          <div className="sticky top-20 z-30 rounded-2xl border border-black/10 bg-white/95 p-2.5 shadow-sm backdrop-blur-md flex flex-wrap items-center justify-between gap-2 border-t border-line p-4">
            <p className="font-bold text-primary">{formatRupiah(o.total_price)}</p>
            <div className="flex gap-2">
              {NEXT_STATUS[o.status].map((s) => (
                <form key={s} action={updateOrderStatus}>
                  <input type="hidden" name="orderId" value={o.id} />
                  <input type="hidden" name="status" value={s} />
                  <button className={s === "dibatalkan" ? "btn btn-danger btn-sm" : "btn btn-primary btn-sm"}>
                    {s === "dibatalkan" ? "Batalkan" : `Tandai ${ORDER_STATUS[s].label}`}
                  </button>
                </form>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
