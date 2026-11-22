import Link from "next/link";
import { LuShieldAlert, LuLayoutDashboard, LuArrowLeft } from "react-icons/lu";
import { getCurrentUser, homePathFor } from "@/lib/auth";

export const metadata = {
  title: "403 - Akses Ditolak",
};

export default async function ForbiddenPage() {
  const user = await getCurrentUser();

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg items-center px-4 py-12">
      <div className="card w-full p-8 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-status-danger-bg text-status-danger-text">
          <LuShieldAlert size={32} />
        </span>

        <p className="mt-4 text-xs font-bold uppercase tracking-widest text-status-danger-text">
          Error 403 · Forbidden
        </p>
        <h1 className="mt-1 text-2xl font-bold">Akses Ditolak</h1>
        <p className="mt-2 text-sm text-muted">
          {user ? (
            <>
              Akun kamu saat ini masuk sebagai <span className="font-semibold capitalize text-ink">{user.role}</span> dan tidak memiliki izin untuk membuka halaman ini.
            </>
          ) : (
            "Kamu tidak memiliki izin untuk mengakses halaman ini."
          )}
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {user ? (
            <Link href={homePathFor(user)} className="btn btn-primary">
              <LuLayoutDashboard size={16} /> Dashboard Saya
            </Link>
          ) : (
            <Link href="/login" className="btn btn-primary">
              Masuk ke Akun
            </Link>
          )}
          <Link href="/" className="btn btn-outline">
            <LuArrowLeft size={16} /> Ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
}