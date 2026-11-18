"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Kirim JSON ke route handler, lalu pindah halaman sesuai { redirect }
function useAuthSubmit(endpoint) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(e, extra = {}) {
    e.preventDefault();
    setError("");
    setPending(true);
    const data = { ...Object.fromEntries(new FormData(e.currentTarget)), ...extra };
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Terjadi kesalahan.");
        setPending(false);
        return;
      }
      router.push(json.redirect);
      router.refresh();
    } catch {
      setError("Tidak dapat terhubung ke server.");
      setPending(false);
    }
  }
  return { error, pending, submit };
}

const ErrorBox = ({ msg }) =>
  msg ? <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{msg}</p> : null;

export function LoginForm({ next }) {
  const { error, pending, submit } = useAuthSubmit("/api/login");
  return (
    <form onSubmit={(e) => submit(e, { next: next ?? "" })} className="space-y-4">
      <ErrorBox msg={error} />
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="input" placeholder="nama@student.unhas.ac.id" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required className="input" />
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Masuk..." : "Masuk"}
      </button>
      <p className="text-center text-sm text-muted">
        Belum punya akun? <Link href="/register" className="font-semibold text-primary">Daftar</Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const { error, pending, submit } = useAuthSubmit("/api/register");
  const [role, setRole] = useState("buyer");
  return (
    <form onSubmit={(e) => submit(e, { role })} className="space-y-4">
      <ErrorBox msg={error} />

      <div className="grid grid-cols-2 gap-2">
        {[
          ["buyer", "Mahasiswa / Pembeli"],
          ["seller", "Pengelola Toko"],
        ].map(([v, label]) => (
          <label
            key={v}
            className={`cursor-pointer rounded-lg border px-3 py-2 text-center text-sm font-semibold ${
              role === v ? "border-primary bg-primary-soft text-primary" : "border-line"
            }`}
          >
            <input type="radio" value={v} checked={role === v} onChange={() => setRole(v)} className="sr-only" />
            {label}
          </label>
        ))}
      </div>

      <div>
        <label className="label" htmlFor="name">Nama lengkap</label>
        <input id="name" name="name" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="phone">No. telepon (opsional)</label>
        <input id="phone" name="phone" className="input" placeholder="08xxxxxxxxxx" />
      </div>
      {role === "seller" && (
        <div>
          <label className="label" htmlFor="storeName">Nama toko</label>
          <input id="storeName" name="storeName" required className="input" />
          <p className="mt-1 text-xs text-muted">Akun seller akan berstatus pending sampai disetujui admin.</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required minLength={6} className="input" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Konfirmasi</label>
          <input id="confirm" name="confirm" type="password" required minLength={6} className="input" />
        </div>
      </div>
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? "Mendaftar..." : "Daftar"}
      </button>
      <p className="text-center text-sm text-muted">
        Sudah punya akun? <Link href="/login" className="font-semibold text-primary">Masuk</Link>
      </p>
    </form>
  );
}
