"use client";

import { useState } from "react";
import { LuMinus, LuPlus } from "react-icons/lu";

// Pengatur jumlah dengan tombol ikon (+) dan (-). Nilai dikirim lewat input hidden "quantity".
export default function QuantityStepper({ name = "quantity", max = 1, initial = 1 }) {
  const limit = Math.max(1, max);
  const [qty, setQty] = useState(Math.min(Math.max(1, initial), limit));

  return (
    <div className="inline-flex items-center overflow-hidden rounded-full border border-line bg-white">
      <input type="hidden" name={name} value={qty} />
      <button
        type="button"
        onClick={() => setQty((q) => Math.max(1, q - 1))}
        disabled={qty <= 1}
        aria-label="Kurangi jumlah"
        className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <LuMinus size={16} />
      </button>
      <span className="min-w-10 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button
        type="button"
        onClick={() => setQty((q) => Math.min(limit, q + 1))}
        disabled={qty >= limit}
        aria-label="Tambah jumlah"
        className="flex h-9 w-9 items-center justify-center text-ink transition-colors hover:bg-primary-soft hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
      >
        <LuPlus size={16} />
      </button>
    </div>
  );
}
