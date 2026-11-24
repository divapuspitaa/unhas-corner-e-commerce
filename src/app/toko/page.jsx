import Link from "next/link";
import { LuArrowLeft, LuStore, LuShieldCheck } from "react-icons/lu";
import { getStores } from "@/lib/queries";

export const metadata = { title: "Toko Resmi Kampus" };
export const dynamic = "force-dynamic";

export default async function StoresPage() {
  const stores = await getStores();

  return (
    <div className="mx-auto max-w-1480px px-4 py-6 sm:px-6 lg:px-8">
      {/* Header & Tombol Kembali ke Beranda */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4">
        <div>
          <h1 className="text-2xl font-bold text-ink">Toko Resmi Kampus</h1>
          <p className="mt-0.5 text-sm text-muted">
            Merchant dan unit usaha terverifikasi di lingkungan Universitas Hasanuddin.
          </p>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <LuArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>

      {stores.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-white px-6 py-14 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-soft text-primary">
            <LuStore size={24} />
          </span>
          <p className="mt-3 text-base font-bold text-ink">Belum ada toko terdaftar</p>
          <p className="mt-1 max-w-md text-xs text-muted">
            Daftar toko resmi kampus akan tampil di halaman ini setelah diverifikasi oleh admin.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {stores.map((s) => (
            <Link
              key={s.id}
              href={`/toko/${s.id}`}
              className="card group flex items-start gap-3.5 p-5 transition-all hover:border-primary/40 hover:shadow-md"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-white shadow-xs transition-transform group-hover:scale-105">
                {s.name.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="truncate font-bold text-ink group-hover:text-primary">{s.name}</p>
                  <LuShieldCheck size={15} className="shrink-0 text-emerald-600" title="Terverifikasi" />
                </div>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                  {s.description || "Toko resmi penyedia kebutuhan mahasiswa Unhas."}
                </p>
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-2.5 py-0.5 text-xs font-semibold text-primary">
                  <LuStore size={12} /> {s.product_count} produk
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}