import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/AuthForm";
import { getCurrentUser, homePathFor } from "@/lib/auth";

export const metadata = { title: "Daftar" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(homePathFor(user));

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <div className="card p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Buat Akun Baru</h1>
        <p className="mb-5 mt-1 text-sm text-muted">Daftar sebagai pembeli atau pengelola toko kampus.</p>
        <RegisterForm />
      </div>
    </div>
  );
}
