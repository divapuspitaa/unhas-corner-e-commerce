import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query, withTransaction } from "@/lib/db";
import { createSession, homePathFor } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fail = (error, status = 400) => NextResponse.json({ error }, { status });

// POST /api/register  { name, email, phone?, password, confirm, role, storeName? }  ->  { redirect }
export async function POST(request) {
  let b;
  try {
    b = await request.json();
  } catch {
    return fail("Request tidak valid.");
  }

  const name = String(b.name ?? "").trim();
  const email = String(b.email ?? "").trim().toLowerCase();
  const phone = String(b.phone ?? "").trim();
  const password = String(b.password ?? "");
  const confirm = String(b.confirm ?? "");
  const role = String(b.role ?? "buyer");
  const storeName = String(b.storeName ?? "").trim();

  if (name.length < 3) return fail("Nama minimal 3 karakter.");
  if (!EMAIL_RE.test(email)) return fail("Format email tidak valid.");
  if (phone && !/^[0-9+\-\s]{8,20}$/.test(phone)) return fail("Nomor telepon tidak valid.");
  if (password.length < 6) return fail("Password minimal 6 karakter.");
  if (password !== confirm) return fail("Konfirmasi password tidak sama.");
  if (!["buyer", "seller"].includes(role)) return fail("Role tidak valid.");
  if (role === "seller" && storeName.length < 3) return fail("Nama toko minimal 3 karakter.");

  if ((await query("SELECT 1 FROM users WHERE email = $1", [email])).rowCount > 0) return fail("Email sudah terdaftar.", 409);
  if (role === "seller" && (await query("SELECT 1 FROM stores WHERE LOWER(name) = LOWER($1)", [storeName])).rowCount > 0) {
    return fail("Nama toko sudah dipakai.", 409);
  }

  const hash = await bcrypt.hash(password, 10);
  const user = await withTransaction(async (client) => {
    const res = await client.query(
      `INSERT INTO users (name, email, password_hash, phone, role, seller_status)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING id, role, seller_status`,
      [name, email, hash, phone || null, role, role === "seller" ? "pending" : null]
    );
    if (role === "seller") {
      await client.query("INSERT INTO stores (user_id, name, description) VALUES ($1,$2,$3)", [
        res.rows[0].id,
        storeName,
        "Toko baru di UnhasCorner.",
      ]);
    }
    return res.rows[0];
  });

  await createSession(user);
  return NextResponse.json({ redirect: homePathFor(user) }, { status: 201 });
}
