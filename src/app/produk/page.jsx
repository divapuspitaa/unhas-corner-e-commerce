import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Notice from "@/components/Notice";
import { getCurrentUser } from "@/lib/auth";
import { PAGE_SIZE, getCategories, getStores, getWishlistIds, listProducts } from "@/lib/queries";

export const metadata = { title: "Semua Produk" };
export const dynamic = "force-dynamic";

export default async function ProductListPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const page = Math.max(1, Number(sp.page) || 1);

  const [{ products, total }, categories, stores, wished] = await Promise.all([
    listProducts({
      q: sp.q?.trim(),
      category: sp.category,
      store: sp.store,
      minPrice: sp.min,
      maxPrice: sp.max,
      sort: sp.sort,
      page,
    }),
    getCategories(),
    getStores(),
    getWishlistIds(user?.role === "buyer" ? user.id : null),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const keep = { q: sp.q, category: sp.category, store: sp.store, min: sp.min, max: sp.max, sort: sp.sort };
  const pageHref = (n) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(keep)) if (v) u.set(k, v);
    u.set("page", String(n));
    return `/produk?${u.toString()}`;
  };
  const currentUrl = (() => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries(keep)) if (v) u.set(k, v);
    if (page > 1) u.set("page", String(page));
    const s = u.toString();
    return s ? `/produk?${s}` : "/produk";
  })();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold">{sp.q ? `Hasil pencarian "${sp.q}"` : "Semua Produk"}</h1>
      <p className="mb-5 text-sm text-muted">{total} produk ditemukan</p>
      <Notice ok={sp.ok} err={sp.err} />

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* Filter (form GET) */}
        <form method="GET" className="card h-fit space-y-4 p-4">
          <div>
            <label className="label" htmlFor="q">Cari nama produk</label>
            <input id="q" name="q" defaultValue={sp.q ?? ""} className="input" placeholder="mis. pulpen" />
          </div>
          <div>
            <label className="label" htmlFor="category">Kategori</label>
            <select id="category" name="category" defaultValue={sp.category ?? ""} className="input">
              <option value="">Semua kategori</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="store">Toko</label>
            <select id="store" name="store" defaultValue={sp.store ?? ""} className="input">
              <option value="">Semua toko</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="label" htmlFor="min">Harga min</label>
              <input id="min" name="min" type="number" min="0" defaultValue={sp.min ?? ""} className="input" />
            </div>
            <div>
              <label className="label" htmlFor="max">Harga maks</label>
              <input id="max" name="max" type="number" min="0" defaultValue={sp.max ?? ""} className="input" />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="sort">Urutkan</label>
            <select id="sort" name="sort" defaultValue={sp.sort ?? "terbaru"} className="input">
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Harga terendah</option>
              <option value="termahal">Harga tertinggi</option>
              <option value="nama">Nama A–Z</option>
              <option value="rating">Rating tertinggi</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary flex-1">Terapkan</button>
            <Link href="/produk" className="btn btn-outline">Reset</Link>
          </div>
        </form>

        <div>
          {products.length === 0 ? (
            <div className="card p-10 text-center text-muted">Tidak ada produk yang cocok dengan filter.</div>
          ) : (
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} user={user} wished={wished.has(p.id)} returnTo={currentUrl} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {page > 1 && <Link href={pageHref(page - 1)} className="btn btn-outline btn-sm">← Sebelumnya</Link>}
              <span className="text-sm text-muted">Halaman {page} dari {totalPages}</span>
              {page < totalPages && <Link href={pageHref(page + 1)} className="btn btn-outline btn-sm">Berikutnya →</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
