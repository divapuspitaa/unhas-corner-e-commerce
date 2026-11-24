import Link from "next/link";
import {
  LuArrowLeft,
  LuSlidersHorizontal,
  LuSearchX,
  LuRotateCcw,
  LuChevronLeft,
  LuChevronRight,
} from "react-icons/lu";
import ProductCard from "@/components/ProductCard";
import { getCurrentUser } from "@/lib/auth";
import { PAGE_SIZE, getCategories, getStores, getWishlistIds, listProducts } from "@/lib/queries";

export const metadata = { title: "Semua Produk" };
export const dynamic = "force-dynamic";

const SORT_OPTIONS = [
  ["terbaru", "Terbaru"],
  ["terlaris", "Terlaris"],
  ["termurah", "Harga Terendah"],
  ["termahal", "Harga Tertinggi"],
  ["rating", "Rating Tertinggi"],
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
  const keep = {
    q: sp.q,
    category: sp.category,
    store: sp.store,
    min: sp.min,
    max: sp.max,
    sort: sp.sort,
  };

  const buildHref = (extra) => {
    const u = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...keep, ...extra })) {
      if (v) u.set(k, String(v));
    }
    const s = u.toString();
    return s ? `/produk?${s}` : "/produk";
  };
  const currentUrl = buildHref(page > 1 ? { page } : {});

  const activeCategoryObj = categories.find((c) => String(c.id) === String(sp.category));
  const activeStoreObj = stores.find((s) => String(s.id) === String(sp.store));
  const hasActiveFilter = Boolean(sp.q || sp.category || sp.store || sp.min || sp.max);

  return (
    <div className="mx-auto max-w-1480px px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Katalog & Tombol Kembali ke Beranda */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">
            {sp.q
              ? `Hasil pencarian "${sp.q}"`
              : activeCategoryObj
                ? `Kategori: ${activeCategoryObj.name}`
                : activeStoreObj
                  ? `Produk Toko: ${activeStoreObj.name}`
                  : "Semua Produk"}
          </h1>
          <p className="mt-0.5 text-sm text-muted">
            Menampilkan <span className="font-semibold text-ink">{total}</span> produk tersedia di UnhasCorner
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <LuArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[260px_1fr]">
        {/* Panel Filter Samping */}
        <form
          method="GET"
          className="h-fit space-y-4 rounded-2xl border border-line bg-white p-4 shadow-xs lg:sticky lg:top-20"
        >
          {sp.sort && <input type="hidden" name="sort" value={sp.sort} />}

          <div className="flex items-center justify-between border-b border-line/70 pb-2.5">
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <LuSlidersHorizontal size={15} className="text-primary" /> Filter Produk
            </p>
            {hasActiveFilter && (
              <Link
                href={sp.sort ? `/produk?sort=${sp.sort}` : "/produk"}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <LuRotateCcw size={12} /> Reset
              </Link>
            )}
          </div>

          <div>
            <label className="label" htmlFor="q">Nama produk</label>
            <input
              id="q"
              name="q"
              defaultValue={sp.q ?? ""}
              className="input"
              placeholder="Contoh: Jas almamater, pulpen"
            />
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
            <label className="label" htmlFor="store">Toko resmi</label>
            <select id="store" name="store" defaultValue={sp.store ?? ""} className="input">
              <option value="">Semua toko</option>
              {stores.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <p className="label">Rentang Harga (Rp)</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                name="min"
                type="number"
                min="0"
                defaultValue={sp.min ?? ""}
                className="input"
                placeholder="Min"
                aria-label="Harga minimum"
              />
              <input
                name="max"
                type="number"
                min="0"
                defaultValue={sp.max ?? ""}
                className="input"
                placeholder="Maks"
                aria-label="Harga maksimum"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn btn-primary flex-1">
              Terapkan
            </button>
            <Link href="/produk" className="btn btn-outline">
              Reset
            </Link>
          </div>
        </form>

        {/* Area Katalog Utama */}
        <div className="min-w-0 space-y-4">
          {/* Bar Urutan */}
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-line bg-white px-4 py-2.5 text-sm shadow-xs">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="mr-1 text-xs font-semibold text-muted">Urutkan:</span>
              {SORT_OPTIONS.map(([v, label]) => (
                <Link
                  key={v}
                  href={buildHref({ sort: v, page: undefined })}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
                    currentSort === v
                      ? "bg-primary font-semibold text-white shadow-xs"
                      : "border border-line bg-surface/50 text-ink hover:border-primary hover:bg-primary-soft hover:text-primary"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <span className="text-xs text-muted">
                Hal. <strong className="text-ink">{page}</strong> / {totalPages}
              </span>
            )}
          </div>

          {/* Grid Produk Rapat */}
          {products.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-white px-6 py-14 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
                <LuSearchX size={24} />
              </span>
              <p className="mt-3 text-base font-bold text-ink">Produk tidak ditemukan</p>
              <p className="mt-1 max-w-md text-xs text-muted">
                Coba ubah kata kunci pencarian, pilih kategori lain, atau atur ulang rentang harga filter.
              </p>
              <Link href="/produk" className="btn btn-primary btn-sm mt-4 rounded-full">
                Reset Semua Filter
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5">
              {products.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  user={user}
                  wished={wished.has(p.id)}
                  returnTo={currentUrl}
                />
              ))}
            </div>
          )}

          {/* Paginasi */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 pt-2">
              {page > 1 && (
                <Link href={buildHref({ page: page - 1 })} className="btn btn-outline btn-sm rounded-full">
                  <LuChevronLeft size={15} /> Sebelumnya
                </Link>
              )}
              <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-muted ring-1 ring-line">
                Halaman <strong className="text-ink">{page}</strong> dari {totalPages}
              </span>
              {page < totalPages && (
                <Link href={buildHref({ page: page + 1 })} className="btn btn-outline btn-sm rounded-full">
                  Berikutnya <LuChevronRight size={15} />
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}