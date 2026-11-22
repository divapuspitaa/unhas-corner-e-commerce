import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SignJWT, jwtVerify } from "jose";
import { query } from "@/lib/db";
import { COOKIE_NAME, MAX_AGE, secretKey } from "@/lib/jwt";

// Token berisi id (sub) dan role, agar middleware bisa membaca role tanpa query database
export async function createSession(user) {
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(secretKey());

  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function destroySession() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

// Ambil user terbaru dari DB (role/status selalu fresh), di-cache per request
export const getCurrentUser = cache(async () => {
  const store = await cookies();
  const token = store.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey());
    const { rows } = await query(
      "SELECT id, name, email, phone, role, seller_status FROM users WHERE id = $1",
      [Number(payload.sub)]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
});

// Guard untuk halaman/aksi yang butuh login dengan role tertentu
export async function requireUser(role) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (role && user.role !== role) redirect("/forbidden");
  return user;
}

// Seller harus sudah di-approve admin
export async function requireApprovedSeller() {
  const user = await requireUser("seller");
  if (user.seller_status !== "approved") redirect("/seller/pending");
  return user;
}

export function homePathFor(user) {
  if (user.role === "admin") return "/admin/dashboard";
  if (user.role === "seller") return user.seller_status === "approved" ? "/seller/dashboard" : "/seller/pending";
  return "/buyer/dashboard";
}

// Cegah open redirect: hanya path internal
export function safePath(path, fallback = "/") {
  if (typeof path === "string" && path.startsWith("/") && !path.startsWith("//")) return path;
  return fallback;
}
