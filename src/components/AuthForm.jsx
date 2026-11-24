"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuShieldAlert, LuSend, LuCircleCheck, LuEye, LuEyeOff } from "react-icons/lu";
import { requestAccountReactivation } from "@/actions/auth";

function useAuthSubmit(endpoint) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [deactivatedData, setDeactivatedData] = useState(null);

  async function submit(e, extra = {}) {
    e.preventDefault();
    setError("");
    setDeactivatedData(null);
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
        if (json.deactivated) {
          setDeactivatedData({
            email: data.email,
            password: data.password,
            alreadyRequested: Boolean(json.alreadyRequested),
          });
        }
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
  return { error, pending, submit, deactivatedData, setDeactivatedData };
}

const ErrorBox = ({ msg }) =>
  msg ? (
    <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">
      {msg}
    </p>
  ) : null;

function PasswordInput({ id, name, placeholder, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        className="input pr-10"
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
        title={show ? "Sembunyikan password" : "Tampilkan password"}
        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted transition-colors hover:text-primary"
      >
        {show ? <LuEyeOff size={18} /> : <LuEye size={18} />}
      </button>
    </div>
  );
}

export function LoginForm({ next }) {
  const { error, pending, submit, deactivatedData, setDeactivatedData } = useAuthSubmit("/api/login");
  const [reason, setReason] = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [requestErr, setRequestErr] = useState("");
  const [isSending, startSending] = useTransition();

  const handleReactivationSubmit = (e) => {
    e.preventDefault();
    if (!deactivatedData) return;
    setRequestErr("");

    startSending(async () => {
      const res = await requestAccountReactivation({
        email: deactivatedData.email,
        password: deactivatedData.password,
        reason,
      });

      if (!res?.ok) {
        setRequestErr(res?.error || "Gagal mengirim permohonan aktivasi.");
        return;
      }

      setRequestSent(true);
      setDeactivatedData((prev) => (prev ? { ...prev, alreadyRequested: true } : null));
      window.dispatchEvent(
        new CustomEvent("unhas-toast", {
          detail: {
            type: "ok",
            title: "Permohonan Terkirim",
            message: res.message,
          },
        })
      );
    });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={(e) => submit(e, { next: next ?? "" })} className="space-y-4">
        <ErrorBox msg={error} />
        <div>
          <label className="label" htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="input"
            placeholder="Contoh: nama@student.unhas.ac.id"
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <PasswordInput id="password" name="password" placeholder="Masukkan password akun Anda" />
        </div>
        <button type="submit" disabled={pending} className="btn btn-primary w-full">
          {pending ? "Masuk..." : "Masuk"}
        </button>
      </form>

      {deactivatedData && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-4 text-sm">
          {deactivatedData.alreadyRequested || requestSent ? (
            <div className="flex items-start gap-2.5 text-amber-900">
              <LuCircleCheck size={18} className="mt-0.5 shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold">Pengajuan Aktif Kembali Sedang Ditinjau</p>
                <p className="mt-1 text-xs leading-relaxed text-amber-800">
                  Permohonan aktivasi akun <strong>{deactivatedData.email}</strong> telah masuk ke antrean Admin. Silakan coba masuk kembali setelah Admin menyetujuinya.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleReactivationSubmit} className="space-y-3">
              <div className="flex items-start gap-2 text-amber-900">
                <LuShieldAlert size={18} className="mt-0.5 shrink-0 text-amber-600" />
                <div>
                  <p className="font-bold">Ajukan Aktivasi Akun Kembali</p>
                  <p className="mt-0.5 text-xs text-amber-800">
                    Kirim alasan permohonan ke Admin agar akun Anda dapat diaktifkan kembali.
                  </p>
                </div>
              </div>

              {requestErr && (
                <p className="rounded-lg bg-status-danger-bg px-2.5 py-1.5 text-xs text-status-danger-text">
                  {requestErr}
                </p>
              )}

              <div>
                <label className="label text-xs" htmlFor="reactivation-reason">
                  Alasan pengajuan
                </label>
                <textarea
                  id="reactivation-reason"
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="input bg-white text-xs"
                  placeholder="Contoh: Saya mahasiswa aktif Unhas dan ingin menggunakan akun ini kembali untuk transaksi kampus."
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="btn btn-primary btn-sm w-full"
              >
                <LuSend size={13} />
                {isSending ? "Mengirim pengajuan..." : "Ajukan Aktif Kembali"}
              </button>
            </form>
          )}
        </div>
      )}

      <p className="text-center text-sm text-muted">
        Belum punya akun? <Link href="/register" className="font-semibold text-primary">Daftar</Link>
      </p>
    </div>
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
        <input
          id="name"
          name="name"
          required
          className="input"
          placeholder="Masukkan nama lengkap sesuai identitas"
        />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          required
          className="input"
          placeholder="Contoh: nama@student.unhas.ac.id"
        />
      </div>
      <div>
        <label className="label" htmlFor="phone">No. telepon (opsional)</label>
        <input
          id="phone"
          name="phone"
          className="input"
          placeholder="Contoh: 081234567890"
        />
      </div>
      {role === "seller" && (
        <div>
          <label className="label" htmlFor="storeName">Nama toko</label>
          <input
            id="storeName"
            name="storeName"
            required
            className="input"
            placeholder="Contoh: Koperasi Mahasiswa / Toko Fakultas"
          />
          <p className="mt-1 text-xs text-muted">Akun seller akan berstatus pending sampai disetujui admin.</p>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="password">Password</label>
          <PasswordInput id="password" name="password" minLength={6} placeholder="Minimal 6 karakter" />
        </div>
        <div>
          <label className="label" htmlFor="confirm">Konfirmasi</label>
          <PasswordInput id="confirm" name="confirm" minLength={6} placeholder="Ulangi password" />
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