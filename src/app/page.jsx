import Link from "next/link";
import { LuStore } from "react-icons/lu";
import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import { getCurrentUser } from "@/lib/auth";
import { TOP_MIN_RATING, TOP_MIN_REVIEWS, getCategories, getStores, getWishlistIds, randomProducts, topProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const user = await getCurrentUser();
  const [forYou, top, categories, stores, wished] = await Promise.all([
    randomProducts(12),
    topProducts(10),
    getCategories(),
    getStores(),
    getWishlistIds(user?.role === "buyer" ? user.id : null),
  ]);
  // Produk terlaris = rating tinggi + ulasan banyak (kriteria ada di lib/queries.js)
  const bestSellers = top;
  const hasSales = bestSellers.length > 0;

  return (
    <div className="mx-auto max-w-[1480px] space-y-8 px-4 pt-5 pb-2 sm:px-6 lg:px-8">
      {/* Hero Banner sejajar lurus dengan batas kiri-kanan Navbar */}
      <HeroBanner />

      {/* Spotlight Produk Terlaris */}
      {hasSales && (
        <section className="relative overflow-hidden rounded-2xl bg-primary p-5 shadow-lg md:p-7">

          <div className="relative mb-5 flex flex-wrap items-end justify-between gap-2">
            <div>
              <h2 className="text-xl font-bold text-white md:text-2xl">Produk Terlaris</h2>
              <p className="mt-1 text-xs text-white/85 md:text-sm">
                Dipilih berdasarkan <strong className="text-accent">rating tinggi</strong> dan{" "}
                <strong className="text-accent">ulasan terbanyak</strong> dari pembeli (minimal {TOP_MIN_REVIEWS} ulasan dan rating{" "}
                {TOP_MIN_RATING.toFixed(1)}/5 ke atas). Makin tinggi rating dan makin banyak ulasan, makin atas urutannya.
              </p>
            </div>
            <Link
              href="/produk?sort=terlaris"
              className="inline-flex items-center justify-center rounded-full bg-white px-5 py-2 text-xs font-bold text-primary shadow-md transition hover:bg-accent hover:text-primary-dark sm:text-sm"
            >
              Lihat semua
            </Link>
          </div>

          <div className="relative flex snap-x snap-mandatory no-scrollbar flex gap-3.5 overflow-x-auto pb-2">
            {bestSellers.map((p, idx) => (
              <div
                key={p.id}
                className="w-44 shrink-0 snap-start transition-transform duration-300 hover:-translate-y-1 sm:w-48"
              >
                <ProductCard product={p} user={user} wished={wished.has(p.id)} returnTo="/" showStats rank={idx + 1} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Toko Resmi Kampus */}
      <section className="rounded-2xl border border-line/80 bg-white p-5 shadow-sm md:p-7">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold tracking-wider text-primary uppercase">Merchant Terverifikasi</p>
            <h2 className="text-xl font-bold md:text-2xl">Toko Resmi Kampus</h2>
          </div>
          <Link
            href="/toko"
            className="btn btn-primary btn-sm rounded-full px-5"
          >
            Lihat semua
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <Link
              key={s.id}
              href={`/toko/${s.id}`}
              className="group flex items-start gap-3.5 rounded-xl border border-line/80 bg-surface/30 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white hover:shadow-lg"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                {s.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-1.5 text-sm font-semibold transition-colors group-hover:text-primary">
                  <span className="truncate">{s.name}</span>
                  <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 text-[10px] font-extrabold text-primary-dark">
                    OFFICIAL
                  </span>
                </p>
                <p className="mt-0.5 line-clamp-2 text-xs text-muted">{s.description}</p>
                <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-muted">
                  <LuStore size={13} className="text-primary" /> {s.product_count} produk
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Untuk Anda */}
      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-xl font-bold md:text-2xl">Untuk Anda</h2>
          <div className="no-scrollbar flex gap-2 overflow-x-auto px-1 py-1.5">
            <span className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white shadow-sm">
              Semua Pilihan
            </span>
            {categories.map((c) => (
              <Link
                key={c.id}
                href={`/produk?category=${c.id}`}
                className="shrink-0 rounded-full border border-line bg-white px-4 py-1.5 text-sm transition-colors duration-200 hover:border-primary hover:bg-primary-soft hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
          {forYou.map((p) => (
            <div key={p.id} className="transition-transform duration-300 hover:-translate-y-1">
              <ProductCard product={p} user={user} wished={wished.has(p.id)} returnTo="/" />
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/produk"
            className="btn btn-outline rounded-full px-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            Jelajahi Semua Produk
          </Link>
        </div>
      </section>
    </div>
  );
}