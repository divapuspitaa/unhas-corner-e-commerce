import Link from "next/link";
import { notFound } from "next/navigation";
import { LuHeart, LuShoppingCart, LuStore } from "react-icons/lu";
import SafeImage from "@/components/SafeImage";
import SubmitButton from "@/components/SubmitButton";
import Notice from "@/components/Notice";
import Stars from "@/components/Stars";
import { Tag } from "@/components/Badge";
import { getCurrentUser } from "@/lib/auth";
import { getProduct, getReviews, getWishlistIds } from "@/lib/queries";
import { formatDate, formatRupiah } from "@/lib/format";
import { addToCart } from "@/actions/cart";
import { toggleWishlist } from "@/actions/wishlist";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = Number(id) ? await getProduct(Number(id)) : null;
  return { title: p ? p.name : "Produk tidak ditemukan" };
}

export default async function ProductDetailPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const product = await getProduct(productId);
  if (!product) notFound();

  const user = await getCurrentUser();
  const [reviews, wished] = await Promise.all([
    getReviews(productId),
    getWishlistIds(user?.role === "buyer" ? user.id : null),
  ]);
  const isWished = wished.has(productId);
  const canBuy = !user || user.role === "buyer";
  const path = `/produk/${productId}`;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/produk" className="hover:text-primary">Produk</Link> / <span>{product.name}</span>
      </nav>
      <Notice ok={sp.ok} err={sp.err} />

      <div className="grid gap-8 md:grid-cols-2">
        <div className="card aspect-square overflow-hidden bg-primary-soft">
          <SafeImage src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
        </div>

        <div>
          {product.category_name && <Tag>{product.category_name}</Tag>}
          <h1 className="mt-2 text-2xl font-bold md:text-3xl">{product.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-sm text-muted">
            <Stars value={product.avg_rating} />
            <span>
              {product.review_count > 0 ? `${Number(product.avg_rating).toFixed(1)} (${product.review_count} ulasan)` : "Belum ada ulasan"}
            </span>
          </div>
          <p className="mt-4 text-3xl font-bold text-primary">{formatRupiah(product.price)}</p>

          <Link href={`/toko/${product.store_id}`} className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium hover:text-primary">
            <LuStore size={16} /> {product.store_name}
          </Link>

          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink/80">{product.description}</p>
          <p className={`mt-4 text-sm font-medium ${product.stock > 0 ? "text-status-success-text" : "text-status-danger-text"}`}>
            {product.stock > 0 ? `Stok tersedia: ${product.stock}` : "Stok habis"}
          </p>

          {canBuy && (
            <div className="mt-5 flex flex-wrap items-end gap-3">
              <form action={addToCart} className="flex items-end gap-3">
                <input type="hidden" name="productId" value={product.id} />
                <input type="hidden" name="returnTo" value={path} />
                <div>
                  <label className="label" htmlFor="quantity">Jumlah</label>
                  <input
                    id="quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    max={Math.max(product.stock, 1)}
                    defaultValue="1"
                    className="input w-24"
                  />
                </div>
                <SubmitButton pendingText="Menambah..." >
                  <LuShoppingCart size={16} /> {user ? "Tambah ke Keranjang" : "Masuk untuk Membeli"}
                </SubmitButton>
              </form>
              {user?.role === "buyer" && (
                <form action={toggleWishlist}>
                  <input type="hidden" name="productId" value={product.id} />
                  <input type="hidden" name="returnTo" value={path} />
                  <button className="btn btn-outline">
                    <LuHeart size={16} className={isWished ? "fill-primary" : ""} /> {isWished ? "Di Wishlist" : "Wishlist"}
                  </button>
                </form>
              )}
            </div>
          )}
          {!user && <p className="mt-3 text-xs text-muted">Anda perlu login sebagai Buyer untuk menambahkan ke keranjang.</p>}
        </div>
      </div>

      {/* Ulasan */}
      <section className="mt-12">
        <h2 className="text-xl font-semibold">Ulasan Pembeli</h2>
        <div className="mt-4 space-y-3">
          {reviews.length === 0 && <p className="text-sm text-muted">Belum ada ulasan untuk produk ini.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="card p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{r.buyer_name}</p>
                <span className="text-xs text-muted">{formatDate(r.created_at)}</span>
              </div>
              <Stars value={r.rating} size={13} />
              {r.comment && <p className="mt-1.5 text-sm text-ink/80">{r.comment}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
