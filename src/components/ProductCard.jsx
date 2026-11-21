import Link from "next/link";
import { LuStore, LuHeart, LuStar } from "react-icons/lu";
import SafeImage from "@/components/SafeImage";
import { toggleWishlist } from "@/actions/wishlist";
import { formatRupiah } from "@/lib/format";

export default function ProductCard({ product, user, wished = false, returnTo = "/" }) {
  const p = product;
  const outOfStock = p.stock <= 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-line bg-white transition hover:shadow-md">
      <Link href={`/produk/${p.id}`} className="relative block aspect-square overflow-hidden bg-primary-soft">
        <SafeImage src={p.image_url} alt={p.name} className="h-full w-full object-cover transition group-hover:scale-105" />
        {outOfStock && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-semibold text-white">
            Stok habis
          </span>
        )}
      </Link>

      {user?.role === "buyer" && (
        <form action={toggleWishlist} className="absolute right-2 top-2">
          <input type="hidden" name="productId" value={p.id} />
          <input type="hidden" name="returnTo" value={returnTo} />
          <button type="submit" aria-label="Wishlist" className="rounded-full bg-white/90 p-1.5 shadow hover:bg-white">
            <LuHeart size={16} className={wished ? "fill-primary text-primary" : "text-muted"} />
          </button>
        </form>
      )}

      <div className="space-y-1 p-2.5">
        <Link href={`/produk/${p.id}`} className="line-clamp-2 min-h-10 text-sm hover:text-primary">
          {p.name}
        </Link>
        <p className="text-base font-bold">{formatRupiah(p.price)}</p>
        <Link href={`/toko/${p.store_id}`} className="flex items-center gap-1 text-xs text-muted hover:text-primary">
          <LuStore size={12} /> <span className="truncate">{p.store_name}</span>
        </Link>
        <p className="flex items-center gap-1 text-xs text-muted">
          <LuStar size={12} className="fill-accent text-accent" />
          {p.review_count > 0 ? Number(p.avg_rating).toFixed(1) : "-"}
          {p.sold_count > 0 && <span>· {p.sold_count} terjual</span>}
        </p>
      </div>
    </div>
  );
}
