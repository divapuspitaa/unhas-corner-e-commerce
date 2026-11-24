import DashboardShell from "@/components/DashboardShell";
import { requireUser } from "@/lib/auth";

export default async function AdminLayout({ children }) {
  await requireUser("admin");
  return (
    <DashboardShell
      title="Panel Admin"
      showHomeLink={false}
      links={[
        { href: "/admin/dashboard", label: "Dashboard" },
        { href: "/admin/verifikasi", label: "Verifikasi Seller" },
        { href: "/admin/users", label: "Manajemen User" },
        { href: "/admin/kategori", label: "Kategori" },
        { href: "/admin/produk", label: "Moderasi Produk" },
      ]}
    >
      {children}
    </DashboardShell>
  );
}
