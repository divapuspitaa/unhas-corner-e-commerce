import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createSession, homePathFor, safePath } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/login  { email, password, next? }  ->  { redirect }
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  if (!password) return NextResponse.json({ error: "Password wajib diisi." }, { status: 400 });

  const { rows } = await query("SELECT id, password_hash, role, seller_status FROM users WHERE email = $1", [email]);
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  await createSession(user);
  const redirect = user.role === "buyer" ? safePath(body.next, "/") : homePathFor(user);
  return NextResponse.json({ redirect });
}
