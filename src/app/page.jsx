import Link from "next/link";
import { ArrowRight, Shirt, FlaskConical, GraduationCap, Gift, Store } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import Notice from "@/components/Notice";
import { getCurrentUser } from "@/lib/auth";
import { getCategories, getStores, getWishlistIds, randomProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

const ICONS = [Shirt, FlaskConical, GraduationCap, Gift];

export default async function HomePage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  const [products, categories, stores, wished] = await Promise.all([
    randomProducts(8),
    getCategories(),
    getStores(),
    getWishlistIds(user?.role === "buyer" ? user.id : null),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-linear-to from-primary-dark via-primary to-primary-hover text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 md:py-20">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            Pusat Resmi Perlengkapan Kampus Tamalanrea
          </span>
          <h1 className="mt-4 max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
            Satu Pintu Kebutuhan Akademik &amp; Atribut Mahasiswa Unhas
          </h1>
          <p className="mt-4 max-w-xl text-white/85">
            Jas almamater, alat praktikum, alat tulis, toga wisuda, hingga merchandise resmi dari toko-toko kampus terverifikasi.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/produk" className="btn bg-white text-primary hover:bg-primary-soft">
              Jelajahi Katalog <ArrowRight size={16} />
            </Link>
            <Link href="/toko" className="btn border border-white/40 text-white hover:bg-white/10">
              Lihat Toko Mitra
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4">
        <div className="pt-6">
          <Notice ok={sp.ok} err={sp.err} />
        </div>

        {/* Kategori */}
        <section className="py-10">
          <h2 className="text-2xl font-semibold">Kategori Pilihan Mahasiswa</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((c, i) => {
              const Icon = ICONS[i % ICONS.length];
              return (
                <Link key={c.id} href={`/produk?category=${c.id}`} className="card p-5 transition hover:shadow-md">
                  <span className="inline-flex rounded-lg bg-primary-soft p-2.5 text-primary">
                    <Icon size={22} />
                  </span>
                  <h3 className="mt-3 font-semibold">{c.name}</h3>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{c.description}</p>
                  <p className="mt-3 text-xs font-semibold text-primary">{c.product_count} produk →</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Toko */}
        <section className="pb-10">
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold">Toko Resmi Kampus</h2>
            <Link href="/toko" className="text-sm font-semibold text-primary hover:underline">Lihat semua</Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((s) => (
              <Link key={s.id} href={`/toko/${s.id}`} className="card flex items-start gap-3 p-4 transition hover:shadow-md">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">
                  {s.name.slice(0, 2).toUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 font-semibold">
                    {s.name}
                    <span className="rounded bg-accent-soft px-1.5 py-0.5 text-[10px] font-bold text-accent">OFFICIAL</span>
                  </p>
                  <p className="line-clamp-2 text-sm text-muted">{s.description}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted">
                    <Store size={12} /> {s.product_count} produk
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Rekomendasi acak */}
        <section>
          <div className="flex items-end justify-between">
            <h2 className="text-2xl font-semibold">Rekomendasi untuk Kamu</h2>
            <Link href="/produk" className="text-sm font-semibold text-primary hover:underline">Lihat semua</Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} user={user} wished={wished.has(p.id)} returnTo="/" />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
