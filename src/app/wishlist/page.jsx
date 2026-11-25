import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft, LuHeart } from "react-icons/lu";
import ProductCard from "@/components/ProductCard";
import { getCurrentUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata = { title: "Wishlist" };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/wishlist");
  if (user.role !== "buyer") redirect("/forbidden");

  const { rows } = await query(
    `SELECT p.id, p.name, p.price, p.stock, p.image_url, p.store_id, s.name AS store_name, c.name AS category_name,
            COALESCE(r.avg_rating,0) AS avg_rating, COALESCE(r.review_count,0)::int AS review_count
     FROM wishlists w
     JOIN products p ON p.id = w.product_id
     JOIN stores s ON s.id = p.store_id
     LEFT JOIN categories c ON c.id = p.category_id
     LEFT JOIN (SELECT product_id, AVG(rating) AS avg_rating, COUNT(*) AS review_count FROM reviews GROUP BY product_id) r
       ON r.product_id = p.id
     WHERE w.user_id = $1 ORDER BY w.created_at DESC`,
    [user.id]
  );

  return (
    <div className="mx-auto max-w-1480px px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Wishlist</h1>
          <p className="mt-0.5 text-sm text-muted">
            {rows.length > 0
              ? `${rows.length} produk favorit tersimpan`
              : "Simpan produk favoritmu agar mudah ditemukan kembali"}
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <LuArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>

      {rows.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-white px-6 py-16 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
            <LuHeart size={26} />
          </span>
          <h2 className="mt-4 text-base font-bold text-ink">Belum ada produk favorit</h2>
          <p className="mt-1 max-w-md text-xs text-muted">
            Klik ikon hati pada produk yang kamu sukai untuk menyimpannya di halaman wishlist ini.
          </p>
          <Link href="/produk" className="btn btn-primary mt-5 rounded-full">
            Jelajahi Produk
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {rows.map((p) => (
            <ProductCard key={p.id} product={p} user={user} wished returnTo="/wishlist" />
          ))}
        </div>
      )}
    </div>
  );
}
