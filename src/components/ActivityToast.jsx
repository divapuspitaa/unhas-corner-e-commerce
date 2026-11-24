"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { LuCircleCheck, LuCircleAlert, LuX } from "react-icons/lu";

function getLoginRedirectMessage(nextPath, reason) {
  if (reason === "wishlist" || nextPath.includes("wishlist")) {
    return "Anda harus login terlebih dahulu untuk menyimpan atau melihat daftar wishlist.";
  }
  if (nextPath === "/keranjang") {
    return "Anda harus login terlebih dahulu untuk mengakses keranjang belanja.";
  }
  if (nextPath.startsWith("/produk/")) {
    return "Anda harus login terlebih dahulu untuk menambahkan produk ke keranjang.";
  }
  if (nextPath.startsWith("/admin")) {
    return "Silakan login menggunakan akun Admin untuk mengakses halaman tersebut.";
  }
  if (nextPath.startsWith("/seller")) {
    return "Silakan login menggunakan akun Seller untuk mengakses halaman tersebut.";
  }
  return "Anda harus login terlebih dahulu untuk melanjutkan aksi tersebut.";
}

export default function ActivityToast() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const [toast, setToast] = useState(null);
  const lastHandledKey = useRef("");

  const ok = searchParams.get("ok");
  const err = searchParams.get("err");
  const next = searchParams.get("next");
  const reason = searchParams.get("reason");

  useEffect(() => {
    const cleanParams = new URLSearchParams(searchParams.toString());
    cleanParams.delete("ok");
    cleanParams.delete("err");
    cleanParams.delete("reason");
    const cleanQuery = cleanParams.toString();
    const cleanRouteKey = cleanQuery ? `${pathname}?${cleanQuery}` : pathname;

    // 1. Pop-up hasil aksi (tambah keranjang, hapus produk, nonaktifkan user, dll.)
    if (ok || err) {
      lastHandledKey.current = `${cleanRouteKey}:${ok || err}`;
      setToast({
        type: err ? "err" : "ok",
        title: err ? "Terjadi Kendala" : "Berhasil",
        message: err || ok,
      });
      window.history.replaceState(null, "", cleanRouteKey);
      return;
    }

    // 2. Pop-up saat guest diarahkan ke halaman login dari fitur terkunci
    if (pathname === "/login" && (next || reason)) {
      const loginKey = `login:${next || ""}:${reason || ""}`;
      if (lastHandledKey.current === loginKey) return;
      lastHandledKey.current = loginKey;
      setToast({
        type: "warn",
        title: "Perlu Login",
        message: getLoginRedirectMessage(next || "", reason || ""),
      });
      if (reason) {
        window.history.replaceState(null, "", cleanRouteKey);
      }
    }
  }, [ok, err, next, reason, pathname, searchParams]);

  // 3. Pop-up aksi langsung tanpa reload halaman (seperti klik ikon Wishlist)
  useEffect(() => {
    const onCustomToast = (event) => {
      const { type = "ok", title, message } = event.detail || {};
      if (!message) return;
      setToast({
        type,
        title: title || (type === "err" ? "Terjadi Kendala" : "Berhasil"),
        message,
      });
    };
    window.addEventListener("unhas-toast", onCustomToast);
    return () => window.removeEventListener("unhas-toast", onCustomToast);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast]);

  if (!toast) return null;

  const badgeStyle =
    toast.type === "err"
      ? "bg-red-100 text-red-600"
      : toast.type === "warn"
        ? "bg-amber-100 text-amber-700"
        : "bg-emerald-100 text-emerald-600";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-20 right-4 z-50 flex w-[calc(100vw-2rem)] max-w-sm items-start gap-3 rounded-2xl border border-black/10 bg-white/95 p-4 shadow-2xl backdrop-blur-xl transition-all duration-300 sm:right-6"
    >
      <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${badgeStyle}`}>
        {toast.type === "ok" ? (
          <LuCircleCheck size={18} />
        ) : (
          <LuCircleAlert size={18} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-ink">{toast.title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted">{toast.message}</p>
      </div>

      <button
        type="button"
        onClick={() => setToast(null)}
        aria-label="Tutup notifikasi"
        className="rounded-lg p-1 text-muted transition hover:bg-black/5 hover:text-ink"
      >
        <LuX size={16} />
      </button>
    </div>
  );
}