import DashboardShell from "@/components/DashboardShell";
import { requireApprovedSeller } from "@/lib/auth";

export default async function SellerLayout({ children }) {
  await requireApprovedSeller();
  return (
    <DashboardShell
      title="Dashboard Toko"
      links={[
        { href: "/seller/dashboard", label: "Ringkasan" },
        { href: "/seller/toko", label: "Informasi Toko" },
        { href: "/seller/produk", label: "Produk Saya" },
        { href: "/seller/pesanan", label: "Pesanan Masuk" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
