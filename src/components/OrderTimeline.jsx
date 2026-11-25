import { LuCircleCheck, LuCircleX, LuClock, LuPackage, LuTruck } from "react-icons/lu";
import { StatusBadge } from "@/components/Badge";
import { formatDate } from "@/lib/format";

const STEPS = [
  { key: "menunggu_pembayaran", label: "Menunggu Verifikasi", icon: LuClock },
  { key: "diproses", label: "Diproses Seller", icon: LuPackage },
  { key: "dikirim", label: "Dikirim", icon: LuTruck },
  { key: "selesai", label: "Selesai (Diterima)", icon: LuCircleCheck },
];

export default function OrderTimeline({ status, logs = [] }) {
  const isCancelled = status === "dibatalkan";
  const currentIdx = STEPS.findIndex((s) => s.key === status);

  return (
    <div className="space-y-2.5 rounded-xl border border-line/80 bg-surface/60 p-3">
      <p className="text-xs font-semibold text-ink">Alur &amp; Lacak Pesanan</p>

      {isCancelled ? (
        <div className="flex items-center gap-2 rounded-lg bg-status-danger-bg px-3 py-2 text-xs font-semibold text-status-danger-text">
          <LuCircleX size={15} className="shrink-0" />
          <span>Pesanan Dibatalkan</span>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const reached = currentIdx >= idx;
            const isCurrent = currentIdx === idx;
            return (
              <div
                key={step.key}
                className={`flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-colors ${
                  isCurrent
                    ? "border-primary bg-primary-soft font-semibold text-primary"
                    : reached
                      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                      : "border-line bg-white text-muted"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="leading-tight">{step.label}</span>
              </div>
            );
          })}
        </div>
      )}

      {logs.length > 0 && (
        <ol className="space-y-1.5 border-l-2 border-primary-soft pl-3 text-xs">
          {logs.map((l) => (
            <li key={l.id} className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <StatusBadge status={l.status} />
              {l.note && <span className="text-ink">{l.note}</span>}
              <span className="text-muted">· {formatDate(l.created_at)}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
