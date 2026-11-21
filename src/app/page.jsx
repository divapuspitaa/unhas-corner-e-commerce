import Link from "next/link";
import { LuArrowRight, LuShirt, LuFlaskConical, LuGraduationCap, LuGift, LuStore } from "react-icons/lu";
import ProductCard from "@/components/ProductCard";
import Notice from "@/components/Notice";
import { getCurrentUser, homePathFor } from "@/lib/auth";
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

      {/* Banner + kartu sapaan */}
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <section className="rounded-xl bg-primary bg-linear-to-br from-primary-dark via-primary to-primary-hover p-6 text-white md:p-10">
          <span className="inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
            Pusat Resmi Perlengkapan Kampus Tamalanrea
          </span>
          <h1 className="mt-4 max-w-xl text-2xl font-bold leading-tight md:text-4xl">
            Satu Pintu Kebutuhan Akademik &amp; Atribut Mahasiswa Unhas
          </h1>
          <p className="mt-3 max-w-lg text-sm text-white/85 md:text-base">
            Jas almamater, alat praktikum, alat tulis, toga wisuda, hingga merchandise resmi dari toko-toko kampus terverifikasi.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/produk" className="btn bg-white text-primary hover:bg-primary-soft">
              Jelajahi Katalog <LuArrowRight size={16} />
            </Link>
            <Link href="/toko" className="btn border border-white/40 text-white hover:bg-white/10">
              Lihat Toko Mitra
            </Link>
          </div>
        </section>

        <aside className="hidden rounded-xl border border-line bg-white p-5 lg:block">
          {user ? (
            <>
              <p className="text-xs text-muted">Selamat datang kembali</p>
              <p className="mt-1 text-lg font-semibold">{user.name}</p>
              <p className="text-xs capitalize text-muted">{user.role}</p>
              <Link href={homePathFor(user)} className="btn btn-primary mt-4 w-full">Buka Dashboard</Link>
              {user.role === "buyer" && (
                <div className="mt-3 grid grid-cols-2 gap-2 text-center text-sm">
                  <Link href="/buyer/pesanan" className="rounded-lg border border-line py-2 hover:border-primary hover:text-primary">Pesanan</Link>
                  <Link href="/keranjang" className="rounded-lg border border-line py-2 hover:border-primary hover:text-primary">Keranjang</Link>
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-lg font-semibold">Gabung UnhasCorner</p>
              <p className="mt-1 text-sm text-muted">Masuk untuk belanja perlengkapan kampus dan melacak pesananmu.</p>
              <Link href="/login" className="btn btn-primary mt-4 w-full">Masuk</Link>
              <Link href="/register" className="btn btn-outline mt-2 w-full">Daftar</Link>
            </>
          )}
        </aside>
      </div>

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
