import Link from "next/link";
import { redirect } from "next/navigation";
import { LuTrash2, LuStore } from "react-icons/lu";
import SafeImage from "@/components/SafeImage";
import SubmitButton from "@/components/SubmitButton";
import Notice from "@/components/Notice";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { checkout, removeCartItem, updateCartQty } from "@/actions/cart";

export const metadata = { title: "Keranjang Belanja" };
export const dynamic = "force-dynamic";

export default async function CartPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/keranjang");
  if (user.role !== "buyer") redirect("/");

  const [{ rows: items }, { rows: addresses }] = await Promise.all([
    query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock, p.image_url, s.name AS store_name
       FROM cart_items ci JOIN products p ON p.id = ci.product_id JOIN stores s ON s.id = p.store_id
       WHERE ci.user_id = $1 ORDER BY s.name, ci.id`,
      [user.id]
    ),
    query("SELECT * FROM addresses WHERE user_id = $1 ORDER BY is_default DESC, id", [user.id]),
  ]);

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const storeNames = [...new Set(items.map((i) => i.store_name))];

  return (
    <div className="mx-auto max-w-6xl px-4 py-5">
      <h1 className="mb-4 text-xl font-bold">Keranjang</h1>
      <Notice ok={sp.ok} err={sp.err} />

      {items.length === 0 ? (
        <div className="rounded-xl border border-line bg-white p-10 text-center">
          <p className="text-muted">Keranjang kamu masih kosong.</p>
          <Link href="/produk" className="btn btn-primary mt-4">Mulai Belanja</Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            {storeNames.map((store) => (
              <div key={store} className="overflow-hidden rounded-xl border border-line bg-white">
                <p className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-sm font-semibold">
                  <LuStore size={16} className="text-primary" /> {store}
                </p>
                {items
                  .filter((i) => i.store_name === store)
                  .map((i) => (
                    <div key={i.id} className="flex gap-3 border-b border-line p-3 last:border-0">
                      <SafeImage src={i.image_url} alt={i.name} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <Link href={`/produk/${i.product_id}`} className="line-clamp-2 text-sm hover:text-primary">{i.name}</Link>
                        <p className="text-sm font-bold">{formatRupiah(i.price)}</p>
                        <div className="mt-auto flex flex-wrap items-center gap-2">
                          <form action={updateCartQty} className="flex items-center gap-2">
                            <input type="hidden" name="cartItemId" value={i.id} />
                            <input type="number" name="quantity" min="1" max={i.stock} defaultValue={i.quantity} className="input w-20! py-1!" />
                            <SubmitButton className="btn btn-outline btn-sm" pendingText="...">Ubah</SubmitButton>
                          </form>
                          <form action={removeCartItem}>
                            <input type="hidden" name="cartItemId" value={i.id} />
                            <button className="btn btn-danger btn-sm" aria-label="Hapus"><LuTrash2 size={14} /></button>
                          </form>
                          <span className="ml-auto text-xs text-muted">Stok {i.stock}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          {/* Ringkasan belanja (sticky) */}
          <form action={checkout} className="h-fit space-y-4 rounded-xl border border-line bg-white p-4 lg:sticky lg:top-28">
            <h2 className="font-semibold">Ringkasan belanja</h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Total harga ({totalQty} barang)</span>
              <span className="text-lg font-bold">{formatRupiah(total)}</span>
            </div>
            <p className="text-xs text-muted">Pesanan dipecah otomatis menjadi {storeNames.length} order (satu per toko).</p>

            <div>
              <label className="label" htmlFor="addressId">Alamat pengiriman</label>
              {addresses.length === 0 ? (
                <p className="text-sm text-status-danger-text">
                  Belum ada alamat. <Link href="/buyer/alamat" className="font-semibold underline">Tambah alamat</Link>
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
            </div>
            <div>
              <label className="label" htmlFor="note">Catatan (opsional)</label>
              <textarea id="note" name="note" rows={2} className="input" />
            </div>
            <SubmitButton className="btn btn-primary w-full" pendingText="Memproses...">Beli ({totalQty})</SubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}
