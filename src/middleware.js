import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { COOKIE_NAME, secretKey } from "@/lib/jwt";

// Middleware berjalan di server SEBELUM halaman dimuat.
// Hanya membaca cookie JWT (bukan localStorage) dan TIDAK memanggil PostgreSQL.
// Pengecekan detail (mis. seller sudah approved) tetap dilakukan di layout masing-masing.
export async function middleware(request) {
  const { pathname, search } = request.nextUrl;

  let role = null;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      const { payload } = await jwtVerify(token, secretKey());
      role = payload.role ?? null;
    } catch {
      role = null; // token rusak / kedaluwarsa
    }
  }

  // Belum login -> ke halaman login
  if (!role) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", pathname + search);
    return NextResponse.redirect(url);
  }

  // Role yang dibutuhkan per area
  let needed = null;
  if (pathname.startsWith("/admin")) needed = "admin";
  else if (pathname.startsWith("/seller")) needed = "seller";
  else if (pathname.startsWith("/buyer") || pathname === "/keranjang") needed = "buyer";

  // Salah role -> kembali ke /dashboard (pengarah sesuai role)
  if (needed && role !== needed) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard", "/keranjang", "/admin/:path*", "/seller/:path*", "/buyer/:path*"],
};
