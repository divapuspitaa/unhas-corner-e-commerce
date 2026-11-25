"use client";

import { useState } from "react";
import { LuMessageSquare } from "react-icons/lu";
import Stars from "@/components/Stars";

export default function ProductReviews({ reviews }) {
  const [showAll, setShowAll] = useState(false);
  const visibleReviews = showAll ? reviews : reviews.slice(0, 5);

  return (
    <section className="mt-8 rounded-2xl border border-line bg-white p-5 shadow-xs">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-ink">Ulasan Pembeli ({reviews.length})</h2>
        {reviews.length > 5 && (
          <button
            type="button"
            onClick={() => setShowAll((v) => !v)}
            className="btn btn-outline btn-sm rounded-full"
          >
            {showAll ? "Tampilkan 5 ulasan" : `Lihat semua (${reviews.length})`}
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        {reviews.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-line bg-surface/40 px-4 py-8 text-center">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <LuMessageSquare size={20} />
            </span>
            <p className="mt-2.5 text-sm font-semibold text-ink">Belum ada ulasan</p>
            <p className="mt-0.5 text-xs text-muted">
              Jadilah pembeli pertama yang memberikan ulasan untuk produk ini.
            </p>
          </div>
        ) : (
          visibleReviews.map((r) => (
            <div key={r.id} className="rounded-xl border border-line/80 bg-surface/30 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-ink">{r.buyer_name}</p>
                <span className="text-xs text-muted">{r.formattedDate}</span>
              </div>
              <div className="mt-1">
                <Stars value={r.rating} size={13} />
              </div>
              {r.comment && <p className="mt-2 text-sm text-ink/85">{r.comment}</p>}
            </div>
          ))
        )}
      </div>
    </section>
  );
}
