import Link from "next/link";
import { Store, Heart, ShoppingCart } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import SubmitButton from "@/components/SubmitButton";
import { Tag } from "@/components/Badge";
import Stars from "@/components/Stars";
import { addToCart } from "@/actions/cart";
import { toggleWishlist } from "@/actions/wishlist";
import { formatRupiah } from "@/lib/format";

export default function ProductCard({ product, user, wished = false, returnTo = "/" }) {
  const p = product;
  const canBuy = !user || user.role === "buyer";
  const outOfStock = p.stock <= 0;

  return (
    <div className="card group relative flex flex-col overflow-hidden shadow-sm transition hover:shadow-md">
      <Link href={`/produk/${p.id}`} className="relative block aspect-square overflow-hidden bg-primary-soft">
        <SafeImage src={p.image_url} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        {p.category_name && (
          <span className="absolute left-2 top-2">
            <Tag>{p.category_name}</Tag>
          </span>
        )}
      </Link>

      {canBuy && user?.role === "buyer" && (
        <form action={toggleWishlist} className="absolute right-2 top-2">
          <input type="hidden" name="productId" value={p.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button type="submit" aria-label="Wishlist" className="rounded-full bg-white/90 p-1.5 shadow hover:bg-white">
            <Heart size={16} className={wished ? "fill-primary text-primary" : "text-muted"} />
          </button>
        </form>
      )}

      <div className="flex flex-1 flex-col gap-1.5 p-3">
        <Link href={`/produk/${p.id}`} className="line-clamp-2 min-h-10 text-sm font-semibold hover:text-primary">
          {p.name}
        </Link>
        <p className="text-base font-bold text-primary">{formatRupiah(p.price)}</p>
        <div className="flex items-center justify-between text-xs text-muted">
          <Link href={`/toko/${p.store_id}`} className="inline-flex items-center gap-1 hover:text-primary">
            <Store size={12} /> {p.store_name}
          </Link>
          <span className="inline-flex items-center gap-1">
            <Stars value={p.avg_rating} size={11} />
            <span>{p.review_count > 0 ? Number(p.avg_rating).toFixed(1) : "-"}</span>
          </span>
        </div>
        <p className={`text-xs ${outOfStock ? "text-status-danger-text" : "text-muted"}`}>
          {outOfStock ? "Stok habis" : `Stok tersisa ${p.stock}`}
        </p>

        {canBuy && (
          <form action={addToCart} className="mt-auto pt-2">
            <input type="hidden" name="productId" value={p.id} />
            <input type="hidden" name="quantity" value="1" />
            <input type="hidden" name="returnTo" value={returnTo} />
            <SubmitButton className="btn btn-outline w-full !py-1.5 text-xs" pendingText="Menambah...">
              <ShoppingCart size={14} /> Keranjang
            </SubmitButton>
          </form>
        )}
      </div>
    </div>
  );
}
