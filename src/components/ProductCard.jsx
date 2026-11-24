import Link from "next/link";
import { LuStore, LuStar, LuShoppingCart, LuCreditCard, LuFlame } from "react-icons/lu";
import SafeImage from "@/components/SafeImage";
import SubmitButton from "@/components/SubmitButton";
import WishlistButton from "@/components/WishlistButton";
import { addToCart } from "@/actions/cart";
import { formatRupiah } from "@/lib/format";

// showStats: tampilkan rating (skala 1-5) dan jumlah terjual secara eksplisit. rank: nomor urut (Produk Terlaris).
export default function ProductCard({ product, user, wished = false, returnTo = "/", showStats = false, rank }) {
  const p = product;
  const outOfStock = p.stock <= 0;
  const canBuy = !user || user.role === "buyer";

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white transition hover:shadow-md">
      <Link href={`/produk/${p.id}`} className="relative block aspect-square overflow-hidden bg-primary-soft">
        <SafeImage src={p.image_url} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        {rank && (
          <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 rounded-full bg-accent px-2 py-0.5 text-[11px] font-extrabold text-primary-dark shadow">
            <LuFlame size={12} /> #{rank}
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
            Stok habis
          </span>
        )}
      </Link>

      {user?.role === "buyer" && (
        <WishlistButton productId={p.id} initialWished={wished} />
      )}

      <div className="flex flex-1 flex-col space-y-1 p-2.5">
        <Link href={`/produk/${p.id}`} className="line-clamp-2 min-h-10 text-sm hover:text-primary">
          {p.name}
        </Link>
        <p className="text-base font-bold">{formatRupiah(p.price)}</p>
        <Link href={`/toko/${p.store_id}`} className="flex items-center gap-1 text-xs text-muted hover:text-primary">
          <LuStore size={12} /> <span className="truncate">{p.store_name}</span>
        </Link>
        {showStats ? (
          <div className="space-y-0.5 text-xs text-muted">
            <p className="flex items-center gap-1">
              <LuStar size={12} className="fill-accent text-accent" />
              {p.review_count > 0 ? (
                <span>
                  Rating <strong className="text-ink">{Number(p.avg_rating).toFixed(1)}</strong> / 5
                  <span> ({p.review_count} ulasan)</span>
                </span>
              ) : (
                <span>Belum ada rating</span>
              )}
            </p>
            <p>
              <strong className="text-ink">{p.sold_count}</strong> terjual
            </p>
          </div>
        ) : (
          <p className="flex items-center gap-1 text-xs text-muted">
            <LuStar size={12} className="fill-accent text-accent" />
            {p.review_count > 0 ? Number(p.avg_rating).toFixed(1) : "-"}
            {p.sold_count > 0 && <span>· {p.sold_count} terjual</span>}
          </p>
        )}

        {canBuy && (
          <form action={addToCart} className="mt-auto pt-2">
            <input type="hidden" name="productId" value={p.id} />
            <input type="hidden" name="quantity" value="1" />
            <input type="hidden" name="returnTo" value={returnTo} />
            <div className="grid grid-cols-2 gap-1.5">
              <SubmitButton
                name="mode"
                value="cart"
                disabled={outOfStock}
                className="btn btn-outline btn-sm w-full"
                pendingText="..."
                aria-label="Tambah ke keranjang"
                title="Tambah ke keranjang"
              >
                <LuShoppingCart size={16} />
              </SubmitButton>
              <SubmitButton
                name="mode"
                value="buy"
                disabled={outOfStock}
                className="btn btn-primary btn-sm w-full"
                pendingText="..."
                aria-label="Checkout sekarang"
                title="Checkout sekarang"
              >
                <LuCreditCard size={16} />
              </SubmitButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}