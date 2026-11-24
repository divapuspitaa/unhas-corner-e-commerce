export function formatRupiah(n) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(n) || 0);
}

export function formatDate(d) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(d));
}

// Batas stok: produk dengan stok <= nilai ini dianggap menipis
export const LOW_STOCK_LIMIT = 5;

// Status pesanan yang masih berjalan (selesai & dibatalkan TIDAK termasuk)
export const ACTIVE_ORDER_STATUSES = ["menunggu_pembayaran", "diproses", "dikirim"];

export const ORDER_STATUS = {
  menunggu_pembayaran: { label: "Menunggu Verifikasi", cls: "bg-status-pending-bg text-status-pending-text" },
  diproses: { label: "Diproses", cls: "bg-status-processing-bg text-status-processing-text" },
  dikirim: { label: "Dikirim", cls: "bg-status-shipping-bg text-status-shipping-text" },
  selesai: { label: "Selesai", cls: "bg-status-success-bg text-status-success-text" },
  dibatalkan: { label: "Dibatalkan", cls: "bg-status-danger-bg text-status-danger-text" },
};

// Alur status yang diizinkan untuk seller
export const NEXT_STATUS = {
  menunggu_pembayaran: ["diproses", "dibatalkan"],
  diproses: ["dikirim", "dibatalkan"],
  dikirim: ["selesai"],
  selesai: [],
  dibatalkan: [],
};

export function makeOrderCode() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `UC-${ymd}-${rand}`;
}
