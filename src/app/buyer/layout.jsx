import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";

export default async function BuyerLayout({ children }) {
  await requireUser("buyer");
  return (
    <DashboardShell
      title="Dashboard Mahasiswa"
      links={[
        { href: "/buyer/dashboard", label: "Dashboard" },
        { href: "/buyer/pesanan", label: "Riwayat Pesanan" },
        { href: "/buyer/wishlist", label: "Wishlist" },
        { href: "/buyer/alamat", label: "Alamat Pengiriman" },
        { href: "/buyer/profil", label: "Profil" },
        { href: "/keranjang", label: "Keranjang" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
