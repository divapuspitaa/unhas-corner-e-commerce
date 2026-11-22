import Link from "next/link";
import { LuShoppingCart, LuHeart, LuLayoutDashboard, LuLogOut, LuUser, LuLayoutGrid } from "react-icons/lu";
import SearchBar from "@/components/SearchBar";
import MobileMenu from "@/components/MobileMenu";
import { getCurrentUser } from "@/lib/auth";
import { getCartCount, getCategories } from "@/lib/queries";
import { logout } from "@/actions/auth";

const KEYWORDS = ["Jas Almamater", "Toga", "Jaket KKN", "Drawing Pen", "Handscoon"];

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
    <span className="absolute -right-0.5 -top-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold text-white">
      {cartCount}
    </span>
  );

  return (
    <>
      {/* Baris tipis di paling atas (desktop) */}
      <div className="hidden border-b border-line bg-surface text-xs text-muted md:block">
        <div className="mx-auto flex max-w-7xl justify-between px-4 py-1.5">
          <span>Marketplace resmi perlengkapan kampus Unhas</span>
          <div className="flex gap-4">
            <Link href="/toko" className="hover:text-primary">Toko Resmi</Link>
            <Link href="/register" className="hover:text-primary">Jadi Seller</Link>
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-line">
        <div className="absolute inset-0 bg-white/90 backdrop-blur" />

        <div className="relative mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
          <Link href="/" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/images/logo.png" alt="UnhasCorner" className="h-9 w-auto" />
          </Link>

          {/* Dropdown kategori (desktop) */}
          <details className="relative hidden shrink-0 md:block">
            <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary-soft">
              <LuLayoutGrid size={16} /> Kategori
            </summary>
            <ul className="absolute left-0 top-full z-50 mt-1 w-60 rounded-lg border border-line bg-white p-1 shadow-lg">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/produk?category=${c.id}`} className="block rounded px-3 py-2 text-sm hover:bg-primary-soft">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>

          {/* Pencarian (desktop) + kata kunci populer */}
          <div className="hidden min-w-0 flex-1 md:block">
            <SearchBar />
            <div className="mt-1 flex gap-3 overflow-hidden whitespace-nowrap text-xs text-muted">
              {KEYWORDS.map((k) => (
                <Link key={k} href={`/produk?q=${encodeURIComponent(k)}`} className="hover:text-primary">
                  {k}
                </Link>
              ))}
            </div>
          </div>

          {/* Menu kanan (desktop) */}
          <nav className="ml-auto hidden shrink-0 items-center gap-1 md:flex">
            {user?.role === "buyer" && (
              <Link href="/buyer/wishlist" aria-label="Wishlist" className="rounded-lg p-2 hover:bg-primary-soft">
                <LuHeart size={20} />
              </Link>
            )}
            {(!user || user.role === "buyer") && (
              <Link href="/keranjang" aria-label="Keranjang" className="relative rounded-lg p-2 hover:bg-primary-soft">
                <LuShoppingCart size={20} />
                {CartBadge}
              </Link>
            )}

            <span className="mx-2 h-6 w-px bg-line" />

            {!user && (
              <>
                <Link href="/login" className="btn btn-outline">Masuk</Link>
                <Link href="/register" className="btn btn-primary">Daftar</Link>
              </>
            )}

            {user?.role === "buyer" && (
              <Link href="/buyer/dashboard" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary-soft">
                <LuUser size={16} /> {user.name.split(" ")[0]}
              </Link>
            )}

            {(user?.role === "seller" || user?.role === "admin") && (
              <Link href={dashboardHref} className="btn btn-outline">
                <LuLayoutDashboard size={16} /> Dashboard
              </Link>
            )}

            {user && (
              <form action={logout}>
                <button aria-label="Keluar" title="Keluar" className="rounded-lg p-2 text-muted hover:bg-status-danger-bg hover:text-status-danger-text">
                  <LuLogOut size={20} />
                </button>
              </form>
            )}
          </nav>

          {/* Menu kanan (HP) */}
          <div className="ml-auto flex items-center gap-1 md:hidden">
            {user?.role === "buyer" && (
              <Link href="/keranjang" aria-label="Keranjang" className="relative rounded-lg p-2">
                <LuShoppingCart size={22} />
                {CartBadge}
              </Link>
            )}
            <MobileMenu links={links} loggedIn={Boolean(user)} />
          </div>
        </div>

        {/* Pencarian (HP) */}
        <div className="relative px-4 pb-3 md:hidden">
          <SearchBar />
        </div>
      </header>
    </>
  );
}