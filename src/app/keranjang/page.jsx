import Link from "next/link";
import { Trash2 } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import SubmitButton from "@/components/SubmitButton";
import Notice from "@/components/Notice";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { checkout, removeCartItem, updateCartQty } from "@/actions/cart";
import { redirect } from "next/navigation";

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
  const storeNames = [...new Set(items.map((i) => i.store_name))];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-5 text-2xl font-bold">Keranjang Belanja</h1>
      <Notice ok={sp.ok} err={sp.err} />

      {items.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-muted">Keranjang kamu masih kosong.</p>
          <Link href="/produk" className="btn btn-primary mt-4">Mulai Belanja</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-4">
            {storeNames.map((store) => (
              <div key={store} className="card overflow-hidden">
                <p className="border-b border-line bg-primary-soft px-4 py-2 text-sm font-semibold text-primary">{store}</p>
                {items
                  .filter((i) => i.store_name === store)
                  .map((i) => (
                    <div key={i.id} className="flex gap-3 border-b border-line p-4 last:border-0">
                      <SafeImage src={i.image_url} alt={i.name} className="h-20 w-20 rounded-lg object-cover" />
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <Link href={`/produk/${i.product_id}`} className="truncate text-sm font-semibold hover:text-primary">{i.name}</Link>
                        <p className="text-sm font-bold text-primary">{formatRupiah(i.price)}</p>
                        <p className="text-xs text-muted">Stok: {i.stock}</p>
                        <div className="mt-auto flex flex-wrap items-center gap-2">
                          <form action={updateCartQty} className="flex items-center gap-2">
                            <input type="hidden" name="cartItemId" value={i.id} />
                            <input type="number" name="quantity" min="1" max={i.stock} defaultValue={i.quantity} className="input !w-20 !py-1" />
                            <SubmitButton className="btn btn-outline btn-sm" pendingText="...">Ubah</SubmitButton>
                          </form>
                          <form action={removeCartItem}>
                            <input type="hidden" name="cartItemId" value={i.id} />
                            <button className="btn btn-danger btn-sm" aria-label="Hapus"><Trash2 size={14} /></button>
                          </form>
                          <span className="ml-auto text-sm font-semibold">{formatRupiah(i.price * i.quantity)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          <form action={checkout} className="card h-fit space-y-4 p-5">
            <h2 className="font-semibold">Ringkasan Pesanan</h2>
            <div className="flex justify-between text-sm">
              <span className="text-muted">Total ({items.reduce((s, i) => s + i.quantity, 0)} barang)</span>
              <span className="text-lg font-bold text-primary">{formatRupiah(total)}</span>
            </div>
            <p className="text-xs text-muted">Pesanan akan dipecah otomatis menjadi {storeNames.length} order (satu per toko).</p>

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
            <SubmitButton className="btn btn-primary w-full" pendingText="Memproses...">Checkout</SubmitButton>
          </form>
        </div>
      )}
    </div>
  );
}
