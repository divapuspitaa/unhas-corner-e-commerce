import Link from "next/link";
import { LuStore } from "react-icons/lu";
import { getStores } from "@/lib/queries";

export const metadata = { title: "Toko Resmi Kampus" };
export const dynamic = "force-dynamic";

export default async function StoresPage() {
  const stores = await getStores();
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold">Toko Resmi Kampus</h1>
      <p className="mb-6 text-sm text-muted">Merchant terverifikasi di lingkungan Universitas Hasanuddin.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stores.map((s) => (
          <Link key={s.id} href={`/toko/${s.id}`} className="card flex items-start gap-3 p-5 transition hover:shadow-md">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary font-bold text-white">
              {s.name.slice(0, 2).toUpperCase()}
            </span>
            <div>
              <p className="font-semibold">{s.name}</p>
              <p className="text-sm text-muted">{s.description}</p>
              <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <LuStore size={12} /> {s.product_count} produk
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
