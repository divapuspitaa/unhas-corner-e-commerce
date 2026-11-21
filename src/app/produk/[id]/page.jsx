import Link from "next/link";
import { notFound } from "next/navigation";
import { LuHeart } from "react-icons/lu";
import SafeImage from "@/components/SafeImage";
import PurchaseCard from "@/components/PurchaseCard";
import Notice from "@/components/Notice";
import Stars from "@/components/Stars";
import { Tag } from "@/components/Badge";
import { getCurrentUser } from "@/lib/auth";
import { getProduct, getReviews, getWishlistIds } from "@/lib/queries";
import { formatDate, formatRupiah } from "@/lib/format";
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
    <div className="mx-auto max-w-7xl px-4 py-5">
      <nav className="mb-4 text-sm text-muted">
        <Link href="/produk" className="hover:text-primary">Produk</Link>
        {product.category_name && (
          <>
            {" / "}
            <Link href={`/produk?category=${product.category_id}`} className="hover:text-primary">{product.category_name}</Link>
          </>
        )}
        {" / "}
        <span className="text-ink">{product.name}</span>
      </nav>
      <Notice ok={sp.ok} err={sp.err} />

      <div className="grid gap-5 lg:grid-cols-[360px_1fr_300px]">
        {/* Kolom 1: gambar */}
        <div className="h-fit lg:sticky lg:top-28">
          <div className="aspect-square overflow-hidden rounded-xl border border-line bg-primary-soft">
            <SafeImage src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Kolom 2: info */}
        <div className="space-y-4">
          <div>
            {product.category_name && <Tag>{product.category_name}</Tag>}
            <h1 className="mt-2 text-xl font-bold md:text-2xl">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Stars value={product.avg_rating} />
              <span>{product.review_count > 0 ? `${Number(product.avg_rating).toFixed(1)} (${product.review_count} ulasan)` : "Belum ada ulasan"}</span>
              {product.sold_count > 0 && <span>· {product.sold_count} terjual</span>}
            </div>
            <p className="mt-3 text-3xl font-bold">{formatRupiah(product.price)}</p>
          </div>

          <Link href={`/toko/${product.store_id}`} className="flex items-center gap-3 rounded-xl border border-line bg-white p-3 hover:shadow-md">
            <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
              {product.store_name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="text-sm font-semibold">{product.store_name}</p>
              <p className="text-xs text-muted">Kunjungi toko</p>
            </div>
          </Link>

          <div className="rounded-xl border border-line bg-white p-4">
            <h2 className="mb-2 font-semibold">Deskripsi Produk</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink/80">{product.description}</p>
          </div>
        </div>

        {/* Kolom 3: kartu pembelian */}
        <aside className="h-fit space-y-3 lg:sticky lg:top-28">
          {canBuy ? (
            <PurchaseCard productId={product.id} price={product.price} stock={product.stock} path={path} />
          ) : (
            <div className="rounded-xl border border-line bg-white p-4 text-sm text-muted">
              Pembelian hanya tersedia untuk akun Buyer.
            </div>
          )}
          {user?.role === "buyer" && (
            <form action={toggleWishlist}>
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="returnTo" value={path} />
              <button className="btn btn-outline w-full">
                <LuHeart size={16} className={isWished ? "fill-primary" : ""} /> {isWished ? "Di Wishlist" : "Tambah ke Wishlist"}
              </button>
            </form>
          )}
          {!user && <p className="text-center text-xs text-muted">Masuk sebagai Buyer untuk membeli produk ini.</p>}
        </aside>
      </div>

      {/* Ulasan */}
      <section className="mt-8">
        <h2 className="text-lg font-semibold">Ulasan Pembeli</h2>
        <div className="mt-3 space-y-3">
          {reviews.length === 0 && <p className="text-sm text-muted">Belum ada ulasan untuk produk ini.</p>}
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-line bg-white p-4">
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
