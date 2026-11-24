import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME, secretKey } from "@/lib/jwt";

// Middleware berjalan di server SEBELUM halaman dimuat.
// Hanya membaca cookie JWT (bukan localStorage) dan TIDAK memanggil PostgreSQL.
export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  let role = null;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey());
      role = payload.role ?? null;
    } catch {
      role = null;
    }
  }

  // Halaman katalog publik: admin & seller tidak punya akses, langsung ke dashboard
  const isCatalog =
    pathname === "/" || pathname.startsWith("/produk") || pathname.startsWith("/toko");
  if (isCatalog) {
    if (role === "admin") return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    if (role === "seller") return NextResponse.redirect(new URL("/seller/dashboard", request.url));
    return NextResponse.next();
  }

  // Belum login -> arahkan ke halaman login
  if (!role) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // Role yang dibutuhkan per area
  let needed = null;
  if (pathname.startsWith("/admin")) needed = "admin";
  else if (pathname.startsWith("/seller")) needed = "seller";
  else if (pathname.startsWith("/buyer") || pathname === "/keranjang" || pathname === "/checkout") needed = "buyer";

  // Sudah login tetapi salah role -> tampilkan halaman 403 Forbidden
  if (needed && role !== needed) {
    return NextResponse.redirect(new URL("/forbidden", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/produk/:path*",
    "/toko/:path*",
    "/dashboard",
    "/keranjang",
    "/checkout",
    "/admin/:path*",
    "/seller/:path*",
    "/buyer/:path*",
  ],
};