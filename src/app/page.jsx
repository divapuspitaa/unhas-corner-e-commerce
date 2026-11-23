import Link from "next/link";
import { LuStore, LuSparkles, LuArrowUpRight } from "react-icons/lu";
import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import Notice from "@/components/Notice";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getStores, getWishlistIds, randomProducts, topProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const [forYou, top, categories, stores, wished] = await Promise.all([
    randomProducts(10),
    topProducts(10),
    getCategories(),
    getStores(),
    getWishlistIds(user?.role === "buyer" ? user.id : null),
  ]);
  const hasSales = top.some((p) => p.sold_count > 0);

  return (
    <div className="pb-12">
      {/* Full-Bleed Hero Banner menyatu langsung di bawah Navbar */}
      <HeroBanner />

      <div className="mx-auto max-w-7xl space-y-10 px-4 pt-6 sm:px-6 lg:px-8">
        <Notice ok={sp.ok} err={sp.err} />

        {/* Spotlight Produk Terlaris */}
        {hasSales && (
          <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#6E0D0D] via-[#871414] to-[#450707] p-5 shadow-lg md:p-7">
            {/* Aksen cahaya ambient */}
            <div className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#C59E56]/20 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-black/30 blur-3xl" />

            <div className="relative mb-5 flex flex-wrap items-end justify-between gap-2">
              <div>
                <span className="mb-1 inline-flex items-center gap-1.5 rounded-full border border-[#C59E56]/40 bg-[#C59E56]/15 px-3 py-0.5 text-xs font-semibold text-[#F3D596]">
                  <LuSparkles size={13} /> Pilihan Favorit Mahasiswa
                </span>
                <h2 className="text-xl font-bold text-white md:text-2xl">Produk Terlaris</h2>
              </div>
              <Link
                href="/produk?sort=terlaris"
                className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md transition hover:bg-white/20 sm:text-sm"
              >
                Lihat semua <LuArrowUpRight size={15} />
              </Link>
            </div>

            <div className="relative flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2">
              {top.map((p) => (
                <div
                  key={p.id}
                  className="w-44 shrink-0 snap-start transition-transform duration-300 hover:-translate-y-1 sm:w-48"
                >
                  <ProductCard product={p} user={user} wished={wished.has(p.id)} returnTo="/" />
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
              className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition hover:opacity-80"
            >
              Lihat semua <LuArrowUpRight size={16} />
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s) => (
              <Link
                key={s.id}
                href={`/toko/${s.id}`}
                className="group flex items-start gap-3.5 rounded-xl border border-line/80 bg-surface/30 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-white hover:shadow-lg"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-[#4A0707] text-sm font-bold text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
                  {s.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-1.5 text-sm font-semibold transition-colors group-hover:text-primary">
                    <span className="truncate">{s.name}</span>
                    <span className="shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[10px] font-bold text-accent">
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
            <div className="flex gap-2 overflow-x-auto pb-1">
              <span className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white shadow-sm">
                Semua Pilihan
              </span>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/produk?category=${c.id}`}
                  className="shrink-0 rounded-full border border-line bg-white px-4 py-1.5 text-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-sm"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-5">
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
    </div>
  );
}