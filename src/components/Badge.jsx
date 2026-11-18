import { ORDER_STATUS } from "@/lib/format";

export function StatusBadge({ status }) {
  const s = ORDER_STATUS[status] ?? { label: status, cls: "bg-gray-100 text-gray-700" };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.cls}`}>{s.label}</span>;
}

export function SellerBadge({ status }) {
  const map = {
    pending: "bg-status-pending-bg text-status-pending-text",
    approved: "bg-status-success-bg text-status-success-text",
    rejected: "bg-status-danger-bg text-status-danger-text",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${map[status]}`}>{status}</span>;
}

export function Tag({ children }) {
  return <span className="inline-block rounded bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary">{children}</span>;
}
