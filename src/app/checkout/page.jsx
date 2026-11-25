import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuStore } from "react-icons/lu";
import SafeImage from "@/components/SafeImage";
import CheckoutForm from "@/components/CheckoutForm";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { checkout } from "@/actions/cart";

export const metadata = { title: "Konfirmasi Pesanan" };
export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/keranjang");
  if (user.role !== "buyer") redirect("/");

  // ?items=1,2 -> checkout hanya item tersebut. Tanpa parameter -> semua isi keranjang.
  const rawItems = Array.isArray(sp.items) ? sp.items.join(",") : typeof sp.items === "string" ? sp.items : "";
  const itemIds = rawItems
    ? [...new Set(rawItems.split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0))]
    : null;
  if (rawItems && itemIds.length === 0) redirect("/keranjang");

  const [{ rows: items }, { rows: addresses }] = await Promise.all([
    query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock, p.image_url,
              s.name AS store_name, u.is_active AS store_active
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       JOIN stores s ON s.id = p.store_id
       JOIN users u ON u.id = s.user_id
       WHERE ci.user_id = $1 AND ($2::int[] IS NULL OR ci.id = ANY($2::int[]))
       ORDER BY s.name, ci.id`,
      [user.id, itemIds]
    ),
    query("SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id", [user.id]),
  ]);

  if (items.length === 0) redirect("/keranjang");

  const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const storeNames = [...new Set(items.map((i) => i.store_name))];
  const hasStockIssue = items.some((i) => i.store_active === false || i.stock <= 0 || i.quantity > i.stock);

  return (
    <div className="mx-auto max-w-1480px px-4 py-6 pb-48 sm:px-6 lg:px-8 lg:pb-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Konfirmasi Pesanan</h1>
          <p className="mt-0.5 text-sm text-muted">
            Periksa kembali produk, jumlah, alamat pengiriman, dan total sebelum membuat pesanan.
          </p>
        </div>
        <Link
          href="/keranjang"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <LuArrowLeft size={14} /> Kembali ke Keranjang
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {storeNames.map((store) => (
            <div key={store} className="overflow-hidden rounded-2xl border border-line bg-white shadow-xs">
              <p className="flex items-center gap-2 border-b border-line bg-surface/40 px-4 py-3 text-sm font-bold text-ink">
                <LuStore size={16} className="text-primary" /> {store}
              </p>
              {items
                .filter((i) => i.store_name === store)
                .map((i) => (
                  <div key={i.id} className="flex gap-3.5 border-b border-line p-4 last:border-0">
                    <SafeImage
                      src={i.image_url}
                      alt={i.name}
                      className="h-20 w-20 shrink-0 rounded-xl border border-line/60 object-cover"
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <Link
                        href={`/produk/${i.product_id}`}
                        className="line-clamp-2 text-sm font-medium text-ink hover:text-primary"
                      >
                        {i.name}
                      </Link>
                      <p className="text-sm text-muted">
                        {i.quantity} × {formatRupiah(i.price)}
                      </p>
                      <p className="text-base font-bold text-primary">
                        {formatRupiah(Number(i.price) * i.quantity)}
                      </p>
                      {i.store_active === false && (
                        <span className="text-xs font-semibold text-status-danger-text">
                          Toko sedang dinonaktifkan sementara
                        </span>
                      )}
                      {i.store_active !== false && i.stock <= 0 && (
                        <span className="text-xs font-semibold text-status-danger-text">Stok habis</span>
                      )}
                      {i.store_active !== false && i.stock > 0 && i.quantity > i.stock && (
                        <span className="text-xs font-semibold text-status-danger-text">
                          Stok tidak mencukupi (sisa {i.stock})
                        </span>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>

        <CheckoutForm
          action={checkout}
          itemIds={itemIds ? itemIds.join(",") : null}
          count={totalQty}
          storeCount={storeNames.length}
          total={total}
          items={items.map((i) => ({ name: i.name, qty: i.quantity }))}
          canSubmit={addresses.length > 0 && !hasStockIssue}
          blockedReason={
            hasStockIssue
              ? "Ada produk yang stoknya tidak cukup atau tokonya nonaktif. Kembali ke keranjang untuk menyesuaikan."
              : addresses.length === 0
                ? "Tambahkan alamat pengiriman terlebih dahulu."
                : ""
          }
        >
          <div>
            <label className="label" htmlFor="addressId">Alamat pengiriman</label>
            {addresses.length === 0 ? (
              <p className="text-sm text-status-danger-text">
                Belum ada alamat tersimpan.{" "}
                <Link href="/buyer/alamat" className="font-semibold underline">
                  Tambah alamat sekarang
                </Link>
              </p>
            ) : (
              <select id="addressId" name="addressId" required className="input" defaultValue={addresses[0].id}>
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} — {a.recipient_name}, {a.full_address.slice(0, 40)}
                  </option>
                ))}
              </select>
            )}
            <Link href="/buyer/alamat" className="mt-1.5 inline-block text-xs text-muted underline hover:text-primary">
              Kelola alamat tersimpan
            </Link>
          </div>

          <div>
            <label className="label" htmlFor="note">Catatan untuk penjual (opsional)</label>
            <textarea
              id="note"
              name="note"
              rows={2}
              placeholder="Contoh: Titip di pos satpam / ukuran L / ambil saat jam istirahat"
              className="input"
            />
          </div>
        </CheckoutForm>
      </div>
    </div>
  );
}
