import Link from "next/link";
import { notFound } from "next/navigation";
import { LuArrowLeft, LuChevronRight, LuMessageSquare, LuShieldAlert, LuShoppingCart, LuCreditCard } from "react-icons/lu";
import SafeImage from "@/components/SafeImage";
import SubmitButton from "@/components/SubmitButton";
import WishlistDetailButton from "@/components/WishlistDetailButton";
import Stars from "@/components/Stars";
import QuantityStepper from "@/components/QuantityStepper";
import { Tag } from "@/components/Badge";
import { getCurrentUser } from "@/lib/auth";
import { getProduct, getReviews, getWishlistIds } from "@/lib/queries";
import { formatDate, formatRupiah } from "@/lib/format";
import { addToCart } from "@/actions/cart";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const p = Number(id) ? await getProduct(Number(id)) : null;
  return { title: p ? p.name : "Produk tidak ditemukan" };
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
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
  const isStoreActive = product.store_active !== false;
  const path = `/produk/${productId}`;

  return (
    <div className="mx-auto max-w-1480px px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb & Tombol Kembali ke Beranda */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4">
        <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-muted">
          <Link href="/produk" className="hover:text-primary">Produk</Link>
          {product.category_name && (
            <>
              <LuChevronRight size={14} />
              <Link href={`/produk?category=${product.category_id}`} className="hover:text-primary">
                {product.category_name}
              </Link>
            </>
          )}
          <LuChevronRight size={14} />
          <span className="line-clamp-1 font-medium text-ink">{product.name}</span>
        </nav>

        <Link
          href="/"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <LuArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[400px_1fr_320px]">
        {/* Kolom 1: Gambar Produk */}
        <div className="h-fit lg:sticky lg:top-20">
          <div className="aspect-square overflow-hidden rounded-2xl border border-line bg-primary-soft shadow-xs">
            <SafeImage src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Kolom 2: Informasi & Deskripsi */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
            {product.category_name && <Tag>{product.category_name}</Tag>}
            <h1 className="mt-2.5 text-xl font-bold text-ink md:text-2xl">{product.name}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted">
              <Stars value={product.avg_rating} />
              <span>
                {product.review_count > 0
                  ? `${Number(product.avg_rating).toFixed(1)} (${product.review_count} ulasan)`
                  : "Belum ada ulasan"}
              </span>
              {product.sold_count > 0 && <span>· {product.sold_count} terjual</span>}
            </div>
            <p className="mt-4 text-3xl font-bold text-primary">{formatRupiah(product.price)}</p>
          </div>

          {isStoreActive ? (
            <Link
              href={`/toko/${product.store_id}`}
              className="flex items-center gap-3.5 rounded-2xl border border-line bg-white p-4 shadow-xs transition hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white">
                {product.store_name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{product.store_name}</p>
                <p className="text-xs text-muted">Kunjungi etalase toko resmi kampus</p>
              </div>
            </Link>
          ) : (
            <div className="flex items-center gap-3.5 rounded-2xl border border-amber-200 bg-amber-50/60 p-4">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted text-sm font-bold text-white">
                {product.store_name.slice(0, 2).toUpperCase()}
              </span>
              <div>
                <p className="text-sm font-bold text-ink">{product.store_name}</p>
                <p className="text-xs font-medium text-amber-800">Toko sedang dinonaktifkan sementara</p>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-line bg-white p-5 shadow-xs">
            <h2 className="mb-2.5 font-bold text-ink">Deskripsi Produk</h2>
            <p className="whitespace-pre-line text-sm leading-relaxed text-ink/85">{product.description}</p>
          </div>
        </div>

        {/* Kolom 3: Kartu Pembelian */}
        <aside className="h-fit space-y-3 lg:sticky lg:top-20">
          {!isStoreActive ? (
            <div className="space-y-2 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950 shadow-xs">
              <p className="flex items-center gap-1.5 font-bold text-amber-900">
                <LuShieldAlert size={16} className="shrink-0 text-amber-600" />
                Toko Tidak Aktif Sementara
              </p>
              <p className="text-xs leading-relaxed text-amber-800">
                Produk ini tidak dapat dibeli untuk sementara waktu karena akun toko sedang dinonaktifkan oleh Admin.
              </p>
            </div>
          ) : canBuy ? (
            <form action={addToCart} className="space-y-3.5 rounded-2xl border border-line bg-white p-5 shadow-xs">
              <input type="hidden" name="productId" value={product.id} />
              <input type="hidden" name="returnTo" value={path} />
              <p className="text-sm font-bold text-ink">Atur Jumlah Pembelian</p>
              <div className="flex items-center gap-3">
                <QuantityStepper max={product.stock} />
                <span className="text-xs font-medium text-muted">
                  {product.stock > 0 ? `Stok tersedia: ${product.stock}` : "Stok habis"}
                </span>
              </div>
              <SubmitButton
                name="mode"
                value="buy"
                disabled={product.stock <= 0}
                className="btn btn-primary w-full"
                pendingText="Memproses..."
              >
                <LuCreditCard size={16} /> Beli Langsung
              </SubmitButton>
              <SubmitButton
                name="mode"
                value="cart"
                disabled={product.stock <= 0}
                className="btn btn-outline w-full"
                pendingText="Memproses..."
              >
                <LuShoppingCart size={16} /> Tambah ke Keranjang
              </SubmitButton>
            </form>
          ) : (
            <div className="rounded-2xl border border-line bg-white p-4 text-sm text-muted shadow-xs">
              Pembelian hanya tersedia untuk akun Mahasiswa (Buyer).
            </div>
          )}

          {user?.role === "buyer" && (
            <WishlistDetailButton productId={product.id} initialWished={isWished} />
          )}

          {!user && isStoreActive && (
            <p className="rounded-xl bg-surface/60 p-3 text-center text-xs text-muted">
              <Link href={`/login?next=${path}`} className="font-semibold text-primary underline">
                Masuk
              </Link>{" "}
              sebagai Mahasiswa untuk membeli atau menyimpan produk ini.
            </p>
          )}
        </aside>
      </div>

      {/* Ulasan Pembeli */}
      <section className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-xs">
        <h2 className="text-lg font-bold text-ink">Ulasan Pembeli ({reviews.length})</h2>
        <div className="mt-4 space-y-3">
          {reviews.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface/40 px-4 py-8 text-center">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
                <LuMessageSquare size={20} />
              </span>
              <p className="mt-2.5 text-sm font-semibold text-ink">Belum ada ulasan</p>
              <p className="mt-0.5 text-xs text-muted">
                Jadilah pembeli pertama yang memberikan ulasan untuk produk ini.
              </p>
            </div>
          ) : (
            reviews.map((r) => (
              <div key={r.id} className="rounded-xl border border-line/80 bg-surface/30 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-ink">{r.buyer_name}</p>
                  <span className="text-xs text-muted">{formatDate(r.created_at)}</span>
                </div>
                <div className="mt-1">
                  <Stars value={r.rating} size={13} />
                </div>
                {r.comment && <p className="mt-2 text-sm text-ink/85">{r.comment}</p>}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}