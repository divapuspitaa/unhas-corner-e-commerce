import Link from "next/link";
import { notFound } from "next/navigation";
import {
  LuArrowLeft,
  LuChevronRight,
  LuShieldCheck,
  LuStore,
  LuPackageOpen,
  LuChevronLeft,
} from "react-icons/lu";
import ProductCard from "@/components/ProductCard";
import { getCurrentUser } from "@/lib/auth";
import { PAGE_SIZE, getStore, getWishlistIds, listProducts } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const store = Number(id) ? await getStore(Number(id)) : null;
  return { title: store ? store.name : "Toko tidak ditemukan" };
}

export default async function StoreDetailPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const storeId = Number(id);
  if (!Number.isInteger(storeId)) notFound();

  const store = await getStore(storeId);
  if (!store) notFound();

  const page = Math.max(1, Number(sp?.page) || 1);
  const user = await getCurrentUser();

  const [{ products, total }, wished] = await Promise.all([
    listProducts({ store: storeId, page }),
    getWishlistIds(user?.role === "buyer" ? user.id : null),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentUrl = page > 1 ? `/toko/${storeId}?page=${page}` : `/toko/${storeId}`;

  return (
    <div className="mx-auto max-w-1480px px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumb & Tombol Kembali ke Beranda */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4">
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-muted">
          <Link href="/toko" className="hover:text-primary">
            Toko Resmi
          </Link>
          <LuChevronRight size={14} />
          <span className="font-medium text-ink">{store.name}</span>
        </nav>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <LuArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>

      {/* Header Profil Toko */}
      <div className="card mb-6 flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-white shadow-xs">
            {store.name.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-ink">{store.name}</h1>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                <LuShieldCheck size={13} /> Toko Resmi Kampus
              </span>
            </div>
            <p className="mt-1 text-sm text-muted">
              {store.description || "Merchant resmi di lingkungan Universitas Hasanuddin."}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3.5 py-1.5 text-xs font-semibold text-primary">
          <LuStore size={14} /> {total} produk tersedia
        </span>
      </div>

      {/* Etalase Produk Toko */}
      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <LuPackageOpen size={24} />
          </span>
          <p className="mt-3 text-base font-bold text-ink">Belum ada produk di toko ini</p>
          <p className="mt-1 max-w-md text-xs text-muted">
            Toko ini belum menambahkan produk ke etalase saat ini.
          </p>
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
            <Link
              href={`/toko/${storeId}?page=${page - 1}`}
              className="btn btn-outline btn-sm rounded-full"
            >
              <LuChevronLeft size={15} /> Sebelumnya
            </Link>
          )}
          <span className="rounded-full bg-white px-3.5 py-1.5 text-xs font-medium text-muted ring-1 ring-line">
            Halaman <strong className="text-ink">{page}</strong> dari {totalPages}
          </span>
          {page < totalPages && (
            <Link
              href={`/toko/${storeId}?page=${page + 1}`}
              className="btn btn-outline btn-sm rounded-full"
            >
              Berikutnya <LuChevronRight size={15} />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}