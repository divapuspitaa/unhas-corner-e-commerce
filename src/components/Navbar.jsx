import Link from "next/link";
import { ShoppingCart, Heart, LayoutDashboard, LogOut, User } from "lucide-react";
import SearchBar from "@/components/SearchBar";
import MobileMenu from "@/components/MobileMenu";
import { getCurrentUser } from "@/lib/auth";
import { getCartCount } from "@/lib/queries";
import { logout } from "@/actions/auth";

export default async function Navbar() {
  const user = await getCurrentUser();
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
  if (user?.role === "seller") links.push({ href: user.seller_status === "approved" ? "/seller/dashboard" : "/seller/pending", label: "Dashboard Toko" });
  if (user?.role === "admin") links.push({ href: "/admin/dashboard", label: "Panel Admin" });

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3">
        <Link href="/" className="shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="UnhasCorner" className="h-9 w-auto" />
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar />
        </div>

        <nav className="ml-auto hidden items-center gap-1 md:flex">
          <Link href="/produk" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary-soft">
            Produk
          </Link>
          <Link href="/toko" className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary-soft">
            Toko
          </Link>

          {!user && (
            <>
              <Link href="/login" className="btn btn-outline">
                Masuk
              </Link>
              <Link href="/register" className="btn btn-primary">
                Daftar
              </Link>
            </>
          )}

          {user?.role === "buyer" && (
            <>
              <Link href="/buyer/wishlist" aria-label="Wishlist" className="rounded-lg p-2 hover:bg-primary-soft">
                <Heart size={20} />
              </Link>
              <Link href="/keranjang" aria-label="Keranjang" className="relative rounded-lg p-2 hover:bg-primary-soft">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold text-white">
                    {cartCount}
                  </span>
                )}
              </Link>
              <Link href="/buyer/dashboard" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary-soft">
                <User size={16} /> {user.name.split(" ")[0]}
              </Link>
            </>
          )}

          {(user?.role === "seller" || user?.role === "admin") && (
            <Link
              href={user.role === "admin" ? "/admin/dashboard" : user.seller_status === "approved" ? "/seller/dashboard" : "/seller/pending"}
              className="btn btn-outline"
            >
              <LayoutDashboard size={16} /> Dashboard
            </Link>
          )}

          {user && (
            <form action={logout}>
              <button aria-label="Keluar" title="Keluar" className="rounded-lg p-2 text-muted hover:bg-status-danger-bg hover:text-status-danger-text">
                <LogOut size={20} />
              </button>
            </form>
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          {user?.role === "buyer" && (
            <Link href="/keranjang" aria-label="Keranjang" className="relative rounded-lg p-2">
              <ShoppingCart size={22} />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold text-white">
                  {cartCount}
                </span>
              )}
            </Link>
          )}
          <MobileMenu links={links} loggedIn={Boolean(user)} />
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
