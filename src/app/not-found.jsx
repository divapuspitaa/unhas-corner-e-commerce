import Link from "next/link";
import { LuSearchX, LuArrowLeft, LuShoppingBag } from "react-icons/lu";

export const metadata = {
  title: "404 - Halaman Tidak Ditemukan",
};

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
      <div className="card w-full p-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft text-primary">
          <LuSearchX size={32} />
        </span>

        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-primary">
          Error 404
        </p>
        <h1 className="mt-1 text-2xl font-bold">Halaman Tidak Ditemukan</h1>
        <p className="mt-2 text-sm text-muted">
          Maaf, halaman atau produk yang kamu cari tidak tersedia, sudah dihapus, atau alamat URL-nya keliru.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/" className="btn btn-primary">
            <LuArrowLeft size={16} /> Kembali ke Beranda
          </Link>
          <Link href="/produk" className="btn btn-outline">
            <LuShoppingBag size={16} /> Lihat Katalog
          </Link>
        </div>
      </div>
    </div>
  );
}