"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LuArrowLeft,
  LuShoppingCart,
  LuHeart,
  LuLayoutDashboard,
  LuUser,
  LuLayoutGrid,
  LuChevronDown,
} from "react-icons/lu";
import SearchBar from "@/components/SearchBar";

function isSearchRelevant(pathname) {
  if (!pathname) return true;
  const hiddenExact = ["/login", "/register", "/checkout"];
  if (hiddenExact.includes(pathname)) return false;

  const hiddenPrefixes = ["/buyer", "/seller", "/admin"];
  return !hiddenPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export function DesktopSearchSlot() {
  const pathname = usePathname();
  if (!isSearchRelevant(pathname)) {
    return <div className="hidden flex-1 md:block" />;
  }
  return (
    <div className="hidden min-w-0 flex-1 md:block">
      <SearchBar />
    </div>
  );
}

export function MobileSearchSlot() {
  const pathname = usePathname();
  if (!isSearchRelevant(pathname)) return null;
  return (
    <div className="px-4 pb-3 md:hidden">
      <SearchBar />
    </div>
  );
}

export function CategoryDropdown({ categories }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const closeTimeoutRef = useRef(null);

  const activeCategory = pathname === "/produk" ? searchParams.get("category") : null;
  const isProdukPage = pathname === "/produk";

  const clearCloseTimer = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleMouseEnter = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const handleMouseLeave = () => {
    clearCloseTimer();
    closeTimeoutRef.current = setTimeout(() => {
      setOpen(false);
    }, 160);
  };

  useEffect(() => {
    setOpen(false);
  }, [pathname, activeCategory]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      clearCloseTimer();
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative hidden shrink-0 md:block"
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className={`flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition-all duration-200 ${
          isProdukPage
            ? "bg-primary-soft font-semibold text-primary ring-1 ring-primary/20"
            : "hover:bg-primary-soft hover:text-primary"
        }`}
      >
        <LuLayoutGrid size={16} />
        <span>Kategori</span>
        <LuChevronDown
          size={14}
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 pt-2">
          <ul className="w-64 rounded-2xl border border-black/5 bg-white/95 p-1.5 shadow-xl backdrop-blur-xl">
            <li>
              <Link
                href="/produk"
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-sm transition-colors duration-150 ${
                  isProdukPage && !activeCategory
                    ? "bg-primary-soft font-semibold text-primary"
                    : "hover:bg-primary-soft hover:text-primary"
                }`}
              >
                <span>Semua Produk</span>
                {isProdukPage && !activeCategory && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                )}
              </Link>
            </li>
            <li className="my-1 border-t border-line/60" />
            {categories.map((c) => {
              const isSelected = String(c.id) === activeCategory;
              return (
                <li key={c.id}>
                  <Link
                    href={`/produk?category=${c.id}`}
                    onClick={() => setOpen(false)}
                    className={`flex items-center justify-between rounded-xl px-3.5 py-2 text-sm transition-colors duration-150 ${
                      isSelected
                        ? "bg-primary-soft font-semibold text-primary"
                        : "hover:bg-primary-soft hover:text-primary"
                    }`}
                  >
                    <span>{c.name}</span>
                    {isSelected && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}

export function DesktopNavLinks({ user, cartCount, dashboardHref }) {
  const pathname = usePathname();

  const isHome = pathname === "/";
  const isWishlist = pathname === "/buyer/wishlist" || pathname.startsWith("/buyer/wishlist/");
  const isCart = pathname === "/keranjang" || pathname === "/checkout";
  const isBuyerArea = pathname.startsWith("/buyer") && !isWishlist;
  const isStaffArea = pathname.startsWith("/seller") || pathname.startsWith("/admin");
  const isLogin = pathname === "/login";
  const isRegister = pathname === "/register";

  const CartBadge = cartCount > 0 && (
    <span className="absolute -top-0.5 -right-0.5 min-w-4 rounded-full bg-primary px-1 text-center text-[10px] font-bold text-white shadow-sm">
      {cartCount}
    </span>
  );

  return (
    <>
      {!isHome && (
        <Link
          href="/"
          title="Kembali ke Beranda"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-ink transition-all duration-200 hover:bg-primary-soft hover:text-primary"
        >
          <LuArrowLeft size={16} />
          <span>Beranda</span>
        </Link>
      )}

      {user?.role === "buyer" && (
        <Link
          href="/buyer/wishlist"
          aria-label="Wishlist"
          aria-current={isWishlist ? "page" : undefined}
          title="Wishlist"
          className={`relative rounded-full p-2.5 transition-all duration-200 ${
            isWishlist
              ? "bg-primary-soft text-primary ring-1 ring-primary/25"
              : "hover:bg-primary-soft hover:text-primary"
          }`}
        >
          <LuHeart size={20} className={isWishlist ? "fill-primary text-primary" : ""} />
          {isWishlist && (
            <span className="absolute bottom-1 left-1/2 h-1 w-3 -translate-x-1/2 rounded-full bg-primary" />
          )}
        </Link>
      )}

      {(!user || user.role === "buyer") && (
        <Link
          href="/keranjang"
          aria-label="Keranjang"
          aria-current={isCart ? "page" : undefined}
          title="Keranjang"
          className={`relative rounded-full p-2.5 transition-all duration-200 ${
            isCart
              ? "bg-primary-soft text-primary ring-1 ring-primary/25"
              : "hover:bg-primary-soft hover:text-primary"
          }`}
        >
          <LuShoppingCart size={20} />
          {CartBadge}
          {isCart && (
            <span className="absolute bottom-1 left-1/2 h-1 w-3 -translate-x-1/2 rounded-full bg-primary" />
          )}
        </Link>
      )}

      <span className="mx-1.5 h-6 w-px bg-line/80" />

      {!user && (
        <>
          <Link
            href="/login"
            aria-current={isLogin ? "page" : undefined}
            className={`btn rounded-full transition-all ${
              isLogin
                ? "border-primary bg-primary-soft font-semibold text-primary ring-2 ring-primary/20"
                : "btn-outline"
            }`}
          >
            Masuk
          </Link>
          <Link
            href="/register"
            aria-current={isRegister ? "page" : undefined}
            className={`btn btn-primary rounded-full transition-all ${
              isRegister ? "ring-2 ring-primary/35 ring-offset-1" : ""
            }`}
          >
            Daftar
          </Link>
        </>
      )}

      {user?.role === "buyer" && (
        <Link
          href="/buyer/dashboard"
          aria-current={isBuyerArea ? "page" : undefined}
          className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-sm transition-all duration-200 ${
            isBuyerArea
              ? "bg-primary font-semibold text-white shadow-sm"
              : "bg-surface/80 font-medium hover:bg-primary-soft hover:text-primary"
          }`}
        >
          <LuUser size={16} /> {user.name.split(" ")[0]}
        </Link>
      )}

      {(user?.role === "seller" || user?.role === "admin") && (
        <Link
          href={dashboardHref}
          aria-current={isStaffArea ? "page" : undefined}
          className={`btn rounded-full transition-all ${
            isStaffArea
              ? "border-primary bg-primary-soft font-semibold text-primary ring-1 ring-primary/25"
              : "btn-outline"
          }`}
        >
          <LuLayoutDashboard size={16} /> Dashboard
        </Link>
      )}
    </>
  );
}