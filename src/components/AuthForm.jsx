"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuShieldAlert, LuSend, LuCircleCheck, LuEye, LuEyeOff, LuCheck, LuCloudUpload } from "react-icons/lu";
import { requestAccountReactivation } from "@/actions/auth";

function useAuthSubmit(endpoint) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [deactivatedData, setDeactivatedData] = useState(null);

  async function submit(e, extra = {}, { multipart = false } = {}) {
    e.preventDefault();
    setError("");
    setDeactivatedData(null);
    setPending(true);
    const formData = new FormData(e.currentTarget);
    for (const [k, v] of Object.entries(extra)) {
      if (v !== undefined && v !== null) formData.set(k, String(v));
    }
    const data = Object.fromEntries(formData.entries());
    try {
      const res = await fetch(
        endpoint,
        multipart
          ? { method: "POST", body: formData }
          : {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(data),
            }
      );
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

function PasswordInput({ id, name, placeholder, minLength, value, onChange }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={name}
        type={show ? "text" : "password"}
        required
        minLength={minLength}
        value={value}
        onChange={onChange}
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

async function computeImageBlurScore(file) {
  if (!file || typeof window === "undefined") return null;
  try {
    const bitmap = await createImageBitmap(file);
    const w = 160;
    const h = Math.max(1, Math.round((bitmap.height / bitmap.width) * w));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(bitmap, 0, 0, w, h);
    bitmap.close();
    const { data } = ctx.getImageData(0, 0, w, h);
    const gray = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const idx = i * 4;
      gray[i] = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
    }
    let sum = 0;
    let sumSq = 0;
    let count = 0;
    for (let y = 1; y < h - 1; y++) {
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        const lap = gray[i - w] + gray[i + w] + gray[i - 1] + gray[i + 1] - 4 * gray[i];
        sum += lap;
        sumSq += lap * lap;
        count++;
      }
    }
    if (!count) return null;
    const mean = sum / count;
    return Math.round((sumSq / count - mean * mean) * 100) / 100;
  } catch {
    return null;
  }
}

function UploadDropzone({ id, label, helper, file, onSelect }) {
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <label
        htmlFor={id}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors ${
          file
            ? "border-primary bg-primary-soft/30"
            : "border-line bg-surface/50 hover:border-primary/60 hover:bg-primary-soft/20"
        }`}
      >
        <LuCloudUpload size={24} className={file ? "text-primary" : "text-muted"} />
        <span className="mt-1.5 text-xs font-medium text-ink">
          {file ? file.name : "Klik untuk unggah (JPG, PNG, WEBP · maks 5 MB)"}
        </span>
        {file && (
          <span className="mt-0.5 text-[11px] text-primary">
            {(file.size / 1024).toFixed(0)} KB · Klik untuk ganti file
          </span>
        )}
        <input
          id={id}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={onSelect}
          className="sr-only"
        />
      </label>
      {helper && <p className="mt-1 text-xs text-muted">{helper}</p>}
    </div>
  );
}

const SELLER_STEPS = [
  { num: 1, label: "Data Diri" },
  { num: 2, label: "Info Toko" },
  { num: 3, label: "Verifikasi" },
];

export function RegisterForm() {
  const router = useRouter();
  const { error: buyerError, pending: buyerPending, submit } = useAuthSubmit("/api/register");
  const [role, setRole] = useState("buyer");
  const [step, setStep] = useState(1);
  const [sellerError, setSellerError] = useState("");
  const [sellerPending, setSellerPending] = useState(false);

  // State wizard seller agar nilai terjaga saat pindah langkah
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [storeName, setStoreName] = useState("");
  const [storeAddress, setStoreAddress] = useState("");
  const [storeDescription, setStoreDescription] = useState("");
  const [nik, setNik] = useState("");
  const [ktpFile, setKtpFile] = useState(null);
  const [selfieFile, setSelfieFile] = useState(null);
  const [ktpBlurScore, setKtpBlurScore] = useState("");
  const [selfieBlurScore, setSelfieBlurScore] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleImageChange = async (e, setFile, setScore) => {
    const file = e.target.files?.[0] ?? null;
    setFile(file);
    const score = await computeImageBlurScore(file);
    setScore(score !== null ? String(score) : "");
  };

  const handleNextStep1 = () => {
    setSellerError("");
    if (name.trim().length < 3) return setSellerError("Nama lengkap minimal 3 karakter.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return setSellerError("Format email tidak valid.");
    }
    if (!email.trim().toLowerCase().endsWith("@unhascorner.id")) {
      return setSellerError("Pendaftaran Toko wajib menggunakan email @unhascorner.id.");
    }
    if (phone.trim() && !/^[0-9+\-\s]{8,20}$/.test(phone.trim())) {
      return setSellerError("Nomor telepon tidak valid.");
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    setSellerError("");
    if (storeName.trim().length < 3) return setSellerError("Nama toko minimal 3 karakter.");
    if (storeAddress.trim().length < 5) {
      return setSellerError("Alamat toko wajib diisi (minimal 5 karakter).");
    }
    setStep(3);
  };

  const handleSellerSubmit = async (e) => {
    e.preventDefault();
    setSellerError("");
    if (!nik.trim()) return setSellerError("NIK wajib diisi.");
    if (!ktpFile) return setSellerError("Foto KTP wajib diunggah.");
    if (!selfieFile) return setSellerError("Foto diri dengan KTP wajib diunggah.");
    if (password.length < 6) return setSellerError("Password minimal 6 karakter.");
    if (password !== confirm) return setSellerError("Konfirmasi password tidak sama.");

    setSellerPending(true);
    const fd = new FormData();
    fd.set("role", "seller");
    fd.set("name", name.trim());
    fd.set("email", email.trim());
    fd.set("phone", phone.trim());
    fd.set("storeName", storeName.trim());
    fd.set("storeAddress", storeAddress.trim());
    fd.set("storeDescription", storeDescription.trim());
    fd.set("nik", nik.trim());
    fd.set("ktpImage", ktpFile);
    fd.set("selfieImage", selfieFile);
    fd.set("ktpBlurScore", ktpBlurScore);
    fd.set("selfieBlurScore", selfieBlurScore);
    fd.set("password", password);
    fd.set("confirm", confirm);

    try {
      const res = await fetch("/api/register", { method: "POST", body: fd });
      const json = await res.json();
      if (!res.ok) {
        setSellerError(json.error ?? "Terjadi kesalahan.");
        setSellerPending(false);
        return;
      }
      router.push(json.redirect);
      router.refresh();
    } catch {
      setSellerError("Tidak dapat terhubung ke server.");
      setSellerPending(false);
    }
  };

  const RoleSwitcher = (
    <div className="space-y-1.5">
      <p className="text-xs font-semibold text-ink">Daftar sebagai</p>
      <div className="grid grid-cols-2 rounded-xl border border-line bg-surface p-1">
        {[
          ["buyer", "Pembeli"],
          ["seller", "Toko"],
        ].map(([v, label]) => (
          <button
            key={v}
            type="button"
            onClick={() => {
              setRole(v);
              setStep(1);
              setSellerError("");
            }}
            className={`cursor-pointer rounded-lg px-3 py-2 text-center text-sm font-semibold transition-all ${
              role === v
                ? "bg-primary text-white shadow-xs"
                : "text-muted hover:bg-primary-soft hover:text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {role === "seller" && (
        <p className="text-xs text-muted">
          Pendaftaran Toko khusus menggunakan email resmi{" "}
          <strong className="text-primary">@unhascorner.id</strong> dan memerlukan persetujuan Admin. Lengkapi dalam 3 langkah: data diri, info toko, dan verifikasi identitas.
        </p>
      )}
    </div>
  );

  if (role === "seller") {
    return (
      <div className="space-y-4">
        {RoleSwitcher}

        {/* Stepper 3 Langkah */}
        <div className="flex items-start justify-between px-2 pt-1">
          {SELLER_STEPS.map((s, idx) => {
            const done = step > s.num;
            const active = step === s.num;
            return (
              <div key={s.num} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      done
                        ? "bg-ink text-white"
                        : active
                          ? "bg-primary text-white ring-4 ring-primary-soft"
                          : "border border-line bg-white text-muted"
                    }`}
                  >
                    {done ? <LuCheck size={15} /> : s.num}
                  </span>
                  <span
                    className={`mt-1.5 whitespace-nowrap text-[11px] ${
                      active || done ? "font-semibold text-ink" : "text-muted"
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < SELLER_STEPS.length - 1 && (
                  <div
                    className={`mx-2 -mt-5 h-0.5 flex-1 ${
                      step > s.num ? "bg-ink" : "bg-line"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        <ErrorBox msg={sellerError} />

        {step === 1 && (
          <div className="space-y-3.5">
            <div>
              <label className="label" htmlFor="seller-name">Nama Lengkap</label>
              <input
                id="seller-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                placeholder="Masukkan nama lengkap sesuai KTP"
              />
            </div>
            <div>
              <label className="label" htmlFor="seller-email">Email (@unhascorner.id)</label>
              <input
                id="seller-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="Contoh: namatoko@unhascorner.id"
              />
              <p className="mt-1 text-xs text-muted">Hanya email berakhiran @unhascorner.id yang dapat mendaftar sebagai Toko.</p>
            </div>
            <div>
              <label className="label" htmlFor="seller-phone">No. Telepon</label>
              <input
                id="seller-phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="input"
                placeholder="Contoh: 081234567890"
              />
            </div>
            <button type="button" onClick={handleNextStep1} className="btn btn-primary w-full">
              Lanjut
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3.5">
            <div>
              <label className="label" htmlFor="seller-store-name">Nama Toko</label>
              <input
                id="seller-store-name"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="input"
                placeholder="Contoh: Koperasi Mahasiswa / Toko Fakultas"
              />
            </div>
            <div>
              <label className="label" htmlFor="seller-store-address">Alamat Toko</label>
              <textarea
                id="seller-store-address"
                rows={3}
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="input"
                placeholder="Masukkan alamat lengkap toko / lokasi di kampus"
              />
            </div>
            <div>
              <label className="label" htmlFor="seller-store-desc">
                Deskripsi Toko <span className="font-normal text-muted">(opsional)</span>
              </label>
              <textarea
                id="seller-store-desc"
                rows={2}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                className="input"
                placeholder="Jelaskan singkat produk yang Anda jual"
              />
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setStep(1)} className="btn btn-outline">
                Kembali
              </button>
              <button type="button" onClick={handleNextStep2} className="btn btn-primary">
                Lanjut
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <form onSubmit={handleSellerSubmit} className="space-y-3.5">
            <div>
              <label className="label" htmlFor="seller-nik">NIK (16 digit sesuai KTP)</label>
              <input
                id="seller-nik"
                inputMode="numeric"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                className="input"
                placeholder="Contoh: 7371123456780001"
              />
            </div>
            <UploadDropzone
              id="seller-ktp"
              label="Foto KTP"
              file={ktpFile}
              onSelect={(e) => handleImageChange(e, setKtpFile, setKtpBlurScore)}
              helper="Pastikan nama, NIK, dan foto terlihat jelas."
            />
            <UploadDropzone
              id="seller-selfie"
              label="Foto Diri dengan KTP (Selfie)"
              file={selfieFile}
              onSelect={(e) => handleImageChange(e, setSelfieFile, setSelfieBlurScore)}
              helper="Pegang KTP di samping wajah agar Admin dapat mencocokkan."
            />
            <div>
              <label className="label" htmlFor="seller-password">Password</label>
              <PasswordInput
                id="seller-password"
                name="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimal 6 karakter"
              />
            </div>
            <div>
              <label className="label" htmlFor="seller-confirm">Konfirmasi Password</label>
              <PasswordInput
                id="seller-confirm"
                name="confirm"
                minLength={6}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Ulangi password"
              />
            </div>
            <p className="text-xs text-muted">
              Foto identitas Anda hanya digunakan Admin untuk verifikasi pendaftaran toko.
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button type="button" onClick={() => setStep(2)} className="btn btn-outline">
                Kembali
              </button>
              <button type="submit" disabled={sellerPending} className="btn btn-primary">
                {sellerPending ? "Mendaftar..." : "Daftar"}
              </button>
            </div>
          </form>
        )}

        <p className="text-center text-sm text-muted">
          Sudah punya akun? <Link href="/login" className="font-semibold text-primary">Masuk di sini</Link>
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => submit(e, { role })}
      className="space-y-4"
    >
      {RoleSwitcher}
      <ErrorBox msg={buyerError} />

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
      <button type="submit" disabled={buyerPending} className="btn btn-primary w-full">
        {buyerPending ? "Mendaftar..." : "Daftar"}
      </button>
      <p className="text-center text-sm text-muted">
        Sudah punya akun? <Link href="/login" className="font-semibold text-primary">Masuk di sini</Link>
      </p>
    </form>
  );
}