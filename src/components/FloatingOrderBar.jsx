import { LuShoppingBag } from "react-icons/lu";

// Kartu ringkasan melayang di bagian bawah layar (khusus HP/tablet), gaya "order summary" ala FitFound.
// children = tombol aksi (mis. Checkout / Buat Pesanan).
export default function FloatingOrderBar({ title = "Ringkasan Belanja", countText, subText, total, caption = "Total pembayaran", children }) {
  return (
    <div
      className="fixed inset-x-2 bottom-2 z-40 overflow-hidden rounded-3xl border border-line bg-white shadow-[0_8px_30px_rgba(0,0,0,0.18)] lg:hidden"
      style={{ marginBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="px-4 pt-3 pb-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-primary-soft text-primary">
              <LuShoppingBag size={16} />
            </span>
            <span className="truncate text-xs font-bold tracking-wider text-ink uppercase">{title}</span>
          </div>
          <span className="shrink-0 rounded-full border border-line bg-white px-3 py-1 text-xs font-semibold text-ink">
            {countText}
          </span>
        </div>
        <p className="mt-2 text-xs text-muted">{subText}</p>
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-line bg-white px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-xl leading-tight font-extrabold text-ink">{total}</p>
          <p className="text-[11px] text-muted">{caption}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
