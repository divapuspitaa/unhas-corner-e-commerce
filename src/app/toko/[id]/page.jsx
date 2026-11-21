import { notFound } from "next/navigation";
import ProductCard from "@/components/ProductCard";
import { getCurrentUser } from "@/lib/auth";
import { getStore, getWishlistIds, listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function StoreDetailPage({ params }) {
  const { id } = await params;
  const storeId = Number(id);
  if (!Number.isInteger(storeId)) notFound();
  const store = await getStore(storeId);
  if (!store) notFound();

  const user = await getCurrentUser();
  const [{ products }, wished] = await Promise.all([
    listProducts({ store: storeId, sort: "nama" }),
    getWishlistIds(user?.role === "buyer" ? user.id : null),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="card mb-6 flex items-center gap-4 p-5">
        <span className="flex h-14 w-14 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
          {store.name.slice(0, 2).toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-bold">{store.name}</h1>
          <p className="text-sm text-muted">{store.description}</p>
        </div>
      </div>
      {products.length === 0 ? (
        <p className="text-muted">Toko ini belum memiliki produk.</p>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-5">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} user={user} wished={wished.has(p.id)} returnTo={`/toko/${storeId}`} />
          ))}
        </div>
      )}
    </div>
  );
}
