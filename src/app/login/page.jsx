import Link from "next/link";
import { redirect } from "next/navigation";
import { LuArrowLeft } from "react-icons/lu";
import { LoginForm } from "@/components/AuthForm";
import { getCurrentUser, homePathFor } from "@/lib/auth";

export const metadata = { title: "Masuk" };

export default async function LoginPage({ searchParams }) {
  const sp = await searchParams;
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user));

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-1.5 text-xs font-semibold text-ink transition hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <LuArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>
      <div className="card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Masuk ke UnhasCorner</h1>
        <p className="mb-5 mt-1 text-sm text-muted">Masuk sebagai Buyer, Seller, atau Admin.</p>
        <LoginForm next={sp.next} />
        <div className="mt-5 rounded-lg bg-accent-soft p-3 text-xs text-muted">
          <p className="font-semibold text-ink">Akun contoh (password: password123)</p>
          <p>admin@unhascorner.id · hadin@unhascorner.id · andi@student.unhas.ac.id · pending@unhascorner.id</p>
        </div>
      </div>
    </div>
  );
}
