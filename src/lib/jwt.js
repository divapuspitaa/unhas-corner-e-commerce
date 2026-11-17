// Konstanta & kunci JWT yang dipakai bersama oleh lib/auth.js dan middleware.js.
// File ini sengaja TIDAK mengimpor pg / db (middleware dilarang memanggil PostgreSQL).
export const COOKIE_NAME = "uc_session";
export const MAX_AGE = 60 * 60 * 24 * 7; // 7 hari

export function secretKey() {
  return new TextEncoder().encode(process.env.JWT_SECRET || "dev-secret-ganti-di-env");
}
