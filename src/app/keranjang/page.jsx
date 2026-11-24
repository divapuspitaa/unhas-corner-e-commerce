import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuTrash2, LuStore, LuShoppingBag, LuMinus, LuPlus, LuCreditCard } from "react-icons/lu";
import SafeImage from "@/components/SafeImage";
import SubmitButton from "@/components/SubmitButton";
import ConfirmButton from "@/components/ConfirmButton";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { removeCartItem, updateCartQty } from "@/actions/cart";

export const metadata = { title: "Keranjang Belanja" };
export const dynamic = "force-dynamic";

export default async function CartPage({ searchParams }) {
  await searchParams;
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/keranjang");
  if (user.role !== "buyer") redirect("/");

  const { rows: items } = await query(
      `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock, p.image_url,
              s.name AS store_name, u.is_active AS store_active
       FROM cart_items ci
       JOIN products p ON p.id = ci.product_id
       JOIN stores s ON s.id = p.store_id
       JOIN users u ON u.id = s.user_id
       WHERE ci.user_id = $1 ORDER BY s.name, ci.id`,
    [user.id]
  );

  const total = items.reduce((s, i) => s + Number(i.price) * i.quantity, 0);
  const totalQty = items.reduce((s, i) => s + i.quantity, 0);
  const storeNames = [...new Set(items.map((i) => i.store_name))];
  const hasStockIssue = items.some((i) => i.store_active === false || i.stock <= 0 || i.quantity > i.stock);

  return (
    <div className="mx-auto max-w-1480px px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Keranjang Belanja</h1>
          <p className="mt-0.5 text-sm text-muted">
            {totalQty > 0
              ? `${totalQty} item dari ${storeNames.length} toko siap untuk dipesan`
              : "Periksa kembali produk pilihanmu sebelum checkout"}
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <LuArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-white px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <LuShoppingBag size={26} />
          </span>
          <h2 className="mt-4 text-base font-bold text-ink">Keranjang kamu masih kosong</h2>
          <p className="mt-1 max-w-md text-xs text-muted">
            Yuk, temukan jas almamater, alat praktikum, dan perlengkapan kuliah lainnya di UnhasCorner.
          </p>
          <Link href="/produk" className="btn btn-primary mt-5 rounded-full">
            Mulai Belanja
          </Link>
        </div>
      ) : (
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
                        <p className="text-base font-bold text-primary">{formatRupiah(i.price)}</p>
                        <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                          {i.store_active === false ? (
                            <span className="text-xs font-semibold text-status-danger-text">
                              Toko sedang dinonaktifkan sementara, hapus item ini
                            </span>
                          ) : i.stock > 0 ? (
                            <div className="inline-flex items-center overflow-hidden rounded-full border border-line bg-white">
                              <form action={updateCartQty}>
                                <input type="hidden" name="cartItemId" value={i.id} />
                                <input type="hidden" name="quantity" value={Math.min(i.quantity, i.stock) - 1} />
                                <SubmitButton
                                  disabled={Math.min(i.quantity, i.stock) <= 1}
                                  className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                  pendingText="…"
                                  aria-label="Kurangi jumlah"
                                >
                                  <LuMinus size={15} />
                                </SubmitButton>
                              </form>
                              <span className="min-w-8 text-center text-sm font-semibold tabular-nums">
                                {Math.min(i.quantity, i.stock)}
                              </span>
                              <form action={updateCartQty}>
                                <input type="hidden" name="cartItemId" value={i.id} />
                                <input type="hidden" name="quantity" value={Math.min(i.quantity, i.stock) + 1} />
                                <SubmitButton
                                  disabled={Math.min(i.quantity, i.stock) >= i.stock}
                                  className="flex h-8 w-8 items-center justify-center transition-colors hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
                                  pendingText="…"
                                  aria-label="Tambah jumlah"
                                >
                                  <LuPlus size={15} />
                                </SubmitButton>
                              </form>
                            </div>
                          ) : (
                            <span className="text-xs font-semibold text-status-danger-text">
                              Stok habis, hapus item ini
                            </span>
                          )}
                          <form action={removeCartItem}>
                            <input type="hidden" name="cartItemId" value={i.id} />
                            <ConfirmButton
                              message={`Apakah Anda yakin ingin menghapus "${i.name}" dari keranjang?`}
                              className="btn btn-danger btn-sm"
                              aria-label="Hapus item"
                            >
                              <LuTrash2 size={14} />
                            </ConfirmButton>
                          </form>
                          {i.store_active !== false && i.stock > 0 && (
                            <Link
                              href={`/checkout?items=${i.id}`}
                              className="btn btn-primary btn-sm"
                              title="Checkout hanya produk ini"
                            >
                              <LuCreditCard size={14} /> Checkout
                            </Link>
                          )}
                          <span className="ml-auto text-xs text-muted">Sisa stok: {i.stock}</span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            ))}
          </div>

          <div className="h-fit space-y-4 rounded-2xl border border-line bg-white p-5 shadow-xs lg:sticky lg:top-20">
            <h2 className="border-b border-line/70 pb-3 text-base font-bold text-ink">
              Ringkasan Belanja
            </h2>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Total harga ({totalQty} barang)</span>
              <span className="text-xl font-bold text-primary">{formatRupiah(total)}</span>
            </div>
            <p className="rounded-lg bg-surface/60 px-3 py-2 text-xs text-muted">
              Pesanan dipecah otomatis menjadi <strong>{storeNames.length} order</strong> (satu per toko).
            </p>
            <p className="text-xs text-muted">
              Checkout semua belanjaan sekaligus, atau pilih tombol <strong>Checkout</strong> di tiap produk untuk membeli satu per satu.
            </p>
            {hasStockIssue ? (
              <>
                <button type="button" disabled className="btn btn-primary w-full">
                  Checkout Semua ({totalQty})
                </button>
                <p className="text-xs text-status-danger-text">
                  Hapus produk yang stoknya habis / tokonya nonaktif untuk checkout semua, atau checkout produk lain satu per satu.
                </p>
              </>
            ) : (
              <Link href="/checkout" className="btn btn-primary w-full">
                <LuCreditCard size={16} /> Checkout Semua ({totalQty})
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}