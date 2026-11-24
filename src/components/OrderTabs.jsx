import Link from "next/link";

export const ORDER_TABS = [
  ["semua", "Semua"],
  ["berjalan", "Sedang Berjalan"],
  ["selesai", "Selesai"],
  ["dibatalkan", "Dibatalkan"],
];

// Filter pesanan per tab. "Sedang Berjalan" TIDAK memuat pesanan selesai maupun dibatalkan.
export function filterOrders(orders, tab, activeStatuses) {
  if (tab === "berjalan") return orders.filter((o) => activeStatuses.includes(o.status));
  if (tab === "selesai") return orders.filter((o) => o.status === "selesai");
  if (tab === "dibatalkan") return orders.filter((o) => o.status === "dibatalkan");
  return orders;
}

export default function OrderTabs({ basePath, tab, counts }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ORDER_TABS.map(([key, label]) => (
        <Link
          key={key}
          href={key === "semua" ? basePath : `${basePath}?tab=${key}`}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-all ${
            tab === key
              ? "bg-primary font-semibold text-white shadow-xs"
              : "border border-line bg-white text-ink hover:border-primary hover:bg-primary-soft hover:text-primary"
          }`}
        >
          {label} <span className="opacity-80">({counts[key] ?? 0})</span>
        </Link>
      ))}
    </div>
  );
}
