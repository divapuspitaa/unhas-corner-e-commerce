import Link from "next/link";
import { LuShoppingCart, LuHeart, LuLayoutDashboard, LuLogOut, LuUser, LuLayoutGrid } from "react-icons/lu";
import SearchBar from "@/components/SearchBar";
import MobileMenu from "@/components/MobileMenu";
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
    <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold text-white shadow-sm">
      {cartCount}
    </span>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-white/75 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0 transition-transform duration-200 hover:scale-[1.02]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="UnhasCorner" className="h-9 w-auto" />
        </Link>

        {/* Dropdown kategori (desktop) */}
        <details className="relative hidden shrink-0 md:block">
          <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-colors duration-200 hover:bg-primary-soft hover:text-primary">
            <LuLayoutGrid size={16} /> Kategori
          </summary>
          <ul className="absolute left-0 top-full z-50 mt-2 w-64 rounded-2xl border border-black/5 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/produk?category=${c.id}`}
                  className="block rounded-xl px-3.5 py-2 text-sm transition-colors duration-150 hover:bg-primary-soft hover:text-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </details>

        {/* Pencarian (desktop) */}
        <div className="hidden min-w-0 flex-1 md:block">
          <SearchBar />
        </div>

        {/* Menu kanan (desktop) */}
        <nav className="ml-auto hidden shrink-0 items-center gap-1.5 md:flex">
          {user?.role === "buyer" && (
            <Link
              href="/buyer/wishlist"
              aria-label="Wishlist"
              className="rounded-full p-2.5 transition-all duration-200 hover:bg-primary-soft hover:text-primary"
            >
              <LuHeart size={20} />
            </Link>
          )}
          {(!user || user.role === "buyer") && (
            <Link
              href="/keranjang"
              aria-label="Keranjang"
              className="relative rounded-full p-2.5 transition-all duration-200 hover:bg-primary-soft hover:text-primary"
            >
              <LuShoppingCart size={20} />
              {CartBadge}
            </Link>
          )}

          <span className="mx-1.5 h-6 w-px bg-line/80" />

          {!user && (
            <>
              <Link href="/login" className="btn btn-outline rounded-full">Masuk</Link>
              <Link href="/register" className="btn btn-primary rounded-full">Daftar</Link>
            </>
          )}

          {user?.role === "buyer" && (
            <Link
              href="/buyer/dashboard"
              className="inline-flex items-center gap-1.5 rounded-full bg-surface/80 px-3.5 py-2 text-sm font-medium transition-all duration-200 hover:bg-primary-soft hover:text-primary"
            >
              <LuUser size={16} /> {user.name.split(" ")[0]}
            </Link>
          )}

          {(user?.role === "seller" || user?.role === "admin") && (
            <Link href={dashboardHref} className="btn btn-outline rounded-full">
              <LuLayoutDashboard size={16} /> Dashboard
            </Link>
          )}

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

      {/* Pencarian (HP) */}
      <div className="px-4 pb-3 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}