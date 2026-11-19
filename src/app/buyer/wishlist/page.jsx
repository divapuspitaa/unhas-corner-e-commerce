import ProductCard from "@/components/ProductCard";
import { requireUser } from "@/lib/auth";
import { query } from "@/lib/db";

export const metadata = { title: "Wishlist" };
export const dynamic = "force-dynamic";

export default async function WishlistPage() {
  const user = await requireUser("buyer");
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
    <div>
      <h2 className="mb-3 text-lg font-semibold">Wishlist</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">Belum ada produk favorit.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
          {rows.map((p) => (
            <ProductCard key={p.id} product={p} user={user} wished returnTo="/buyer/wishlist" />
          ))}
        </div>
      )}
    </div>
  );
}
