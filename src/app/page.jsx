import Link from "next/link";
import { LuShirt, LuFlaskConical, LuGraduationCap, LuGift, LuStore } from "react-icons/lu";
import HeroBanner from "@/components/HeroBanner";
import ProductCard from "@/components/ProductCard";
import Notice from "@/components/Notice";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getStores, getWishlistIds, randomProducts, topProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

const ICONS = [LuShirt, LuFlaskConical, LuGraduationCap, LuGift];

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
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-4">
      <Notice ok={sp.ok} err={sp.err} />

      {/* Hero Banner Carousel ala Tokopedia */}
      <HeroBanner />

      {/* Ikon kategori */}
      <section className="rounded-xl border border-line bg-white p-4 md:p-5">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold">Kategori</h2>
          <Link href="/produk" className="text-sm font-semibold text-primary hover:underline">Lihat semua</Link>
        </div>
        <div className="flex gap-5 overflow-x-auto pb-1">
          {categories.map((c, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <Link key={c.id} href={`/produk?category=${c.id}`} className="flex w-24 shrink-0 flex-col items-center gap-2 text-center text-xs">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Icon size={24} />
                </span>
                <span className="line-clamp-2">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Produk terlaris (hanya jika sudah ada penjualan) */}
      {hasSales && (
        <section className="rounded-xl border border-line bg-white p-4 md:p-5">
          <div className="mb-3 flex items-end justify-between">
            <h2 className="text-lg font-semibold">Produk Terlaris</h2>
            <Link href="/produk?sort=terlaris" className="text-sm font-semibold text-primary hover:underline">Lihat semua</Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {top.filter((p) => p.sold_count > 0).map((p) => (
              <div key={p.id} className="w-44 shrink-0">
                <ProductCard product={p} user={user} wished={wished.has(p.id)} returnTo="/" />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Toko resmi */}
      <section className="rounded-xl border border-line bg-white p-4 md:p-5">
        <div className="mb-3 flex items-end justify-between">
          <h2 className="text-lg font-semibold">Toko Resmi Kampus</h2>
          <Link href="/toko" className="text-sm font-semibold text-primary hover:underline">Lihat semua</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {stores.map((s) => (
            <Link key={s.id} href={`/toko/${s.id}`} className="flex items-start gap-3 rounded-lg border border-line p-3 transition hover:shadow-md">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                {s.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-sm font-semibold">
                  {s.name}
                  <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">OFFICIAL</span>
                </p>
                <p className="line-clamp-2 text-xs text-muted">{s.description}</p>
                <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
                  <LuStore size={12} /> {s.product_count} produk
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Untuk Anda */}
      <section>
        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          <span className="shrink-0 rounded-full bg-primary px-4 py-1.5 text-sm font-medium text-white">Untuk Anda</span>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/produk?category=${c.id}`}
              className="shrink-0 rounded-full border border-line bg-white px-4 py-1.5 text-sm hover:border-primary hover:text-primary"
            >
              {c.name}
            </Link>
          ))}
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:gap-3 lg:grid-cols-5">
          {forYou.map((p) => (
            <ProductCard key={p.id} product={p} user={user} wished={wished.has(p.id)} returnTo="/" />
          ))}
        </div>
        <div className="mt-6 text-center">
          <Link href="/produk" className="btn btn-outline px-8">Muat Lebih Banyak</Link>
        </div>
      </section>
    </div>
  );
}