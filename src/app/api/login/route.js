import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { createSession, homePathFor, safePath } from "@/lib/auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request tidak valid." }, { status: 400 });
  }

  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
  }
  if (!password) {
    return NextResponse.json({ error: "Password wajib diisi." }, { status: 400 });
  }

  await query(`
    ALTER TABLE users
    ADD COLUMN IF NOT EXISTS reactivation_requested_at TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS reactivation_reason TEXT
  `);

  const { rows } = await query(
    `SELECT id, name, email, password_hash, role, seller_status, is_active, reactivation_requested_at
     FROM users WHERE email = $1`,
    [email]
  );
  const user = rows[0];
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
  }

  if (user.is_active === false) {
    return NextResponse.json(
      {
        error: "Akun Anda sedang dinonaktifkan oleh Admin.",
        deactivated: true,
        email: user.email,
        alreadyRequested: Boolean(user.reactivation_requested_at),
      },
      { status: 403 }
    );
  }

  await createSession(user);
  const redirect = user.role === "buyer" ? safePath(body.next, "/") : homePathFor(user);
  return NextResponse.json({ redirect });
}