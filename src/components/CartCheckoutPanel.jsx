"use client";

import { useEffect, useState } from "react";
import { LuCreditCard } from "react-icons/lu";

const rupiah = (n) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

// Panel ringkasan + tombol checkout untuk item keranjang yang DICENTANG.
// Checkbox item berada di server component dan terhubung lewat atribut form="cart-select-form"
// (data-cart-check dengan data-price & data-qty). Di layar HP, bar checkout menempel (sticky) di bawah layar.
export default function CartCheckoutPanel({ initialCount, initialTotal, storeCount, selectableCount }) {
  const [sel, setSel] = useState({ count: initialCount, total: initialTotal, stores: storeCount });

  useEffect(() => {
    const recompute = () => {
      const checks = [...document.querySelectorAll("input[data-cart-check]")];
      let count = 0;
      let total = 0;
      const stores = new Set();
      for (const c of checks) {
        if (!c.checked || c.disabled) continue;
        const qty = Number(c.dataset.qty);
        count += qty;
        total += Number(c.dataset.price) * qty;
        stores.add(c.dataset.store);
      }
      const all = document.querySelector("input[data-cart-all]");
      if (all) {
        const enabled = checks.filter((c) => !c.disabled);
        all.checked = enabled.length > 0 && enabled.every((c) => c.checked);
      }
      setSel({ count, total, stores: stores.size });
    };

    const onChange = (e) => {
      const t = e.target;
      if (t.matches?.("input[data-cart-all]")) {
        document
          .querySelectorAll("input[data-cart-check]:not(:disabled)")
          .forEach((c) => (c.checked = t.checked));
        recompute();
      } else if (t.matches?.("input[data-cart-check]")) {
        recompute();
      }
    };

    document.addEventListener("change", onChange);
    recompute();
    return () => document.removeEventListener("change", onChange);
  }, []);

  const disabled = sel.count === 0;
  const label = disabled ? "Pilih produk dulu" : `Checkout (${sel.count})`;

  return (
    <form id="cart-select-form" action="/checkout" method="get" className="contents">
      {/* Ringkasan (desktop & HP) */}
      <div className="h-fit space-y-4 rounded-2xl border border-line bg-white p-5 shadow-xs lg:sticky lg:top-20">
        <h2 className="border-b border-line/70 pb-3 text-base font-bold text-ink">Ringkasan Belanja</h2>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted">Total dipilih ({sel.count} barang)</span>
          <span className="text-xl font-bold text-primary">{rupiah(sel.total)}</span>
        </div>
        <p className="rounded-lg bg-surface/60 px-3 py-2 text-xs text-muted">
          {sel.count === 0 ? (
            "Centang produk yang ingin di-checkout."
          ) : (
            <>
              Pesanan dipecah otomatis menjadi <strong>{sel.stores} order</strong> (satu per toko).
            </>
          )}
        </p>
        <p className="text-xs text-muted">
          Centang <strong>satu atau beberapa produk</strong> lalu checkout sekaligus, atau pakai tombol{" "}
          <strong>Checkout</strong> di tiap produk untuk membeli satu per satu.
        </p>
        <button type="submit" disabled={disabled} className="btn btn-primary hidden w-full lg:inline-flex">
          <LuCreditCard size={16} /> {label}
        </button>
      </div>

      {/* Bar checkout menempel di bawah layar (khusus HP / tablet) */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-white/95 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="mx-auto flex max-w-1480px items-center justify-between gap-3 px-4 py-3">
          <div className="min-w-0">
            <p className="text-lg leading-tight font-bold text-ink">{rupiah(sel.total)}</p>
            <p className="text-xs text-muted">
              {sel.count} barang dipilih{selectableCount > 0 ? ` dari ${selectableCount} produk` : ""}
            </p>
          </div>
          <button type="submit" disabled={disabled} className="btn btn-primary shrink-0 rounded-full px-5 py-2.5">
            <LuCreditCard size={16} /> {disabled ? "Pilih produk" : "Checkout"}
          </button>
        </div>
      </div>
    </form>
  );
}
