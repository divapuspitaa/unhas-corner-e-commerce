import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import Notice from "@/components/Notice";
import { getCurrentUser } from "@/lib/auth";
import { PAGE_SIZE, getCategories, getStores, getWishlistIds, listProducts } from "@/lib/queries";

export const metadata = { title: "Semua Produk" };
export const dynamic = "force-dynamic";

const SORT_OPTIONS = [
  ["terbaru", "Terbaru"],
  ["terlaris", "Terlaris"],
  ["termurah", "Harga Terendah"],
  ["termahal", "Harga Tertinggi"],
  ["rating", "Rating"],
];

export default async function ProductListPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const page = Math.max(1, Number(sp.page) || 1);
  const currentSort = sp.sort ?? "terbaru";

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

  const buildHref = (extra) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...keep, ...extra })) if (v) u.set(k, String(v));
    const s = u.toString();
    return s ? `/produk?${s}` : "/produk";
  };
  const currentUrl = buildHref(page > 1 ? { page } : {});

  return (
    <div className="mx-auto max-w-7xl px-4 py-5">
      <h1 className="text-xl font-bold">{sp.q ? `Hasil pencarian "${sp.q}"` : "Semua Produk"}</h1>
      <p className="mb-4 text-sm text-muted">{total} produk ditemukan</p>
      <Notice ok={sp.ok} err={sp.err} />

      <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
        {/* Filter */}
        <form method="GET" className="h-fit space-y-4 rounded-xl border border-line bg-white p-4 lg:sticky lg:top-28">
          {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}
          <p className="text-sm font-semibold">Filter</p>
          <div>
            <label className="label" htmlFor="q">Nama produk</label>
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
          <div>
            <p className="label">Harga (Rp)</p>
            <div className="grid grid-cols-2 gap-2">
              <input name="min" type="number" min="0" defaultValue={sp.min ?? ""} className="input" placeholder="Min" aria-label="Harga minimum" />
              <input name="max" type="number" min="0" defaultValue={sp.max ?? ""} className="input" placeholder="Maks" aria-label="Harga maksimum" />
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-primary flex-1">Terapkan</button>
            <Link href="/produk" className="btn btn-outline">Reset</Link>
          </div>
        </form>

        <div>
          {/* Urutan */}
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-muted">Urutkan:</span>
            {SORT_OPTIONS.map(([v, label]) => (
              <Link
                key={v}
                href={buildHref({ sort: v })}
                className={`rounded-full border px-3 py-1 ${
                  currentSort === v ? "border-primary bg-primary-soft text-primary" : "border-line bg-white hover:border-primary"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {products.length === 0 ? (
            <div className="rounded-xl border border-line bg-white p-10 text-center text-muted">Tidak ada produk yang cocok dengan filter.</div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-4">
              {products.map((p) => (
                <ProductCard key={p.id} product={p} user={user} wished={wished.has(p.id)} returnTo={currentUrl} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {page > 1 && <Link href={buildHref({ page: page - 1 })} className="btn btn-outline btn-sm">← Sebelumnya</Link>}
              <span className="text-sm text-muted">Halaman {page} dari {totalPages}</span>
              {page < totalPages && <Link href={buildHref({ page: page + 1 })} className="btn btn-outline btn-sm">Berikutnya →</Link>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
