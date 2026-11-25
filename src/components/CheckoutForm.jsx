"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LuArrowRight, LuCircleCheck, LuX } from "react-icons/lu";
import FloatingOrderBar from "@/components/FloatingOrderBar";
import { formatRupiah } from "@/lib/format";

// Form checkout + dialog "Konfirmasi Pesanan" supaya pembeli tidak membuat pesanan karena salah klik.
// children = kolom alamat & catatan (dirender server).
export default function CheckoutForm({ action, itemIds, count, storeCount, total, items, canSubmit, blockedReason, children }) {
  const formRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => setMounted(true), []);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !submitting && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, submitting]);

  const openConfirm = () => {
    // pastikan alamat sudah dipilih sebelum menampilkan dialog konfirmasi
    if (formRef.current && !formRef.current.reportValidity()) return;
    setOpen(true);
  };

  const confirm = () => {
    setSubmitting(true);
    formRef.current?.requestSubmit();
  };

  const submitBtn = (cls) => (
    <button type="button" onClick={openConfirm} disabled={!canSubmit} className={cls}>
      Buat Pesanan <LuArrowRight size={16} />
    </button>
  );

  return (
    <form ref={formRef} action={action} className="contents">
      {itemIds && <input type="hidden" name="itemIds" value={itemIds} />}

      <div className="h-fit space-y-4 rounded-2xl border border-line bg-white p-5 shadow-xs lg:sticky lg:top-20">
        <h2 className="border-b border-line/70 pb-3 text-base font-bold text-ink">Ringkasan Pesanan</h2>
        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Barang</dt>
            <dd className="font-medium text-ink">{count}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Toko (jumlah order)</dt>
            <dd className="font-medium text-ink">{storeCount}</dd>
          </div>
        </dl>
        <div className="flex items-center justify-between border-t border-line/70 pt-3">
          <span className="text-sm font-semibold text-ink">Total Pembayaran</span>
          <span className="text-xl font-bold text-primary">{formatRupiah(total)}</span>
        </div>

        {children}

        {!canSubmit && blockedReason && (
          <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-xs text-status-danger-text">{blockedReason}</p>
        )}
        {submitBtn("btn btn-primary hidden w-full lg:inline-flex")}
      </div>

      {/* Kartu ringkasan melayang di bawah layar (HP / tablet) */}
      <FloatingOrderBar
        title="Ringkasan Pesanan"
        countText={`${count} barang`}
        subText={`${storeCount} toko · ${storeCount} order`}
        total={formatRupiah(total)}
        caption="Total pembayaran"
      >
        {submitBtn("btn btn-primary shrink-0 rounded-xl px-5 py-3")}
      </FloatingOrderBar>

      {mounted &&
        open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-confirm-title"
            className="fixed inset-0 z-60 flex items-end justify-center bg-black/45 p-4 backdrop-blur-[1px] sm:items-center"
            onClick={() => !submitting && setOpen(false)}
          >
            <div
              className="w-full max-w-md rounded-2xl border border-line bg-white p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                    <LuCircleCheck size={22} />
                  </span>
                  <h3 id="order-confirm-title" className="text-base font-bold text-ink">
                    Konfirmasi Pesanan
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  aria-label="Tutup dialog"
                  className="rounded-lg p-1 text-muted transition hover:bg-surface hover:text-ink"
                >
                  <LuX size={18} />
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink/85">
                Kamu akan membuat pesanan untuk <strong>{count} barang</strong> dari <strong>{storeCount} toko</strong> dengan
                total <strong className="text-primary">{formatRupiah(total)}</strong>. Pastikan produk, jumlah, dan alamat
                sudah benar sebelum melanjutkan.
              </p>

              <ul className="mt-3 max-h-40 space-y-1 overflow-y-auto rounded-xl bg-surface/70 p-3 text-xs text-ink">
                {items.map((i, idx) => (
                  <li key={idx} className="flex justify-between gap-3">
                    <span className="truncate">{i.name}</span>
                    <span className="shrink-0 font-semibold">× {i.qty}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={submitting}
                  className="btn btn-outline btn-sm px-4"
                >
                  Periksa Lagi
                </button>
                <button type="button" onClick={confirm} disabled={submitting} className="btn btn-primary btn-sm px-4" autoFocus>
                  {submitting ? "Memproses..." : "Ya, Buat Pesanan"}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </form>
  );
}
