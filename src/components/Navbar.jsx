import { Suspense } from "react";
import Link from "next/link";
import { LuShoppingCart, LuLogOut } from "react-icons/lu";
import MobileMenu from "@/components/MobileMenu";
import {
  CategoryDropdown,
  DesktopNavLinks,
  DesktopSearchSlot,
  MobileSearchSlot,
} from "@/components/NavbarInteractive";
import { getCurrentUser } from "@/lib/auth";
import { getCartCount, getCategories } from "@/lib/queries";
import { logout } from "@/actions/auth";

export default async function Navbar() {
  const [user, categories] = await Promise.all([getCurrentUser(), getCategories()]);
  const cartCount = user?.role === "buyer" ? await getCartCount(user.id) : 0;

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/produk", label: "Semua Produk" },
    { href: "/toko", label: "Toko Resmi" },
  ];
  if (!user) links.push({ href: "/login", label: "Masuk" }, { href: "/register", label: "Daftar" });
  if (user?.role === "buyer") {
    links.push(
      { href: "/keranjang", label: "Keranjang" },
      { href: "/buyer/dashboard", label: "Dashboard" },
      { href: "/buyer/pesanan", label: "Pesanan Saya" },
      { href: "/buyer/wishlist", label: "Wishlist" },
      { href: "/buyer/profil", label: "Profil" }
    );
  }
  if (user?.role === "seller") {
    links.push({
      href: user.seller_status === "approved" ? "/seller/dashboard" : "/seller/pending",
      label: "Dashboard Toko",
    });
  }
  if (user?.role === "admin") links.push({ href: "/admin/dashboard", label: "Panel Admin" });

  const dashboardHref =
    user?.role === "admin"
      ? "/admin/dashboard"
      : user?.seller_status === "approved"
        ? "/seller/dashboard"
        : "/seller/pending";

  const CartBadge = cartCount > 0 && (
    <span className="absolute -top-0.5 -right-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold text-white shadow-sm">
      {cartCount}
    </span>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/75 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-1480px items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 transition-transform duration-200 hover:scale-[1.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.svg" alt="UnhasCorner" className="h-9 w-auto" />
        </Link>

        {/* Dropdown kategori (desktop - menutup otomatis saat kursor keluar) */}
        <Suspense fallback={null}>
          <CategoryDropdown categories={categories} />
        </Suspense>

        {/* Pencarian (desktop - otomatis sembunyi di halaman Login/Register/Dashboard) */}
        <DesktopSearchSlot />

        {/* Menu kanan (desktop) */}
        <nav className="ml-auto hidden shrink-0 items-center gap-1.5 md:flex">
          <Suspense fallback={null}>
            <DesktopNavLinks user={user} cartCount={cartCount} dashboardHref={dashboardHref} />
          </Suspense>

          {user && (
            <form action={logout}>
              <button
                aria-label="Keluar"
                title="Keluar"
                className="rounded-full p-2.5 text-muted transition-all duration-200 hover:bg-status-danger-bg hover:text-status-danger-text"
              >
                <LuLogOut size={20} />
              </button>
            </form>
          )}
        </nav>

        {/* Menu kanan (HP) */}
        <div className="ml-auto flex items-center gap-1 md:hidden">
          {user?.role === "buyer" && (
            <Link href="/keranjang" aria-label="Keranjang" className="relative rounded-full p-2">
              <LuShoppingCart size={22} />
              {CartBadge}
            </Link>
          )}
          <MobileMenu links={links} loggedIn={Boolean(user)} />
        </div>
      </div>

      {/* Pencarian (HP - otomatis sembunyi di halaman Login/Register/Dashboard) */}
      <MobileSearchSlot />
    </header>
  );
}