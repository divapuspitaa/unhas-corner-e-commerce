import { NextResponse } from "next/server";
import { query } from "@/lib/db";

// GET /api/products?q=jas  ->  saran pencarian instan (maks. 6 produk)
export async function GET(request) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim();
  if (q.length < 2) return NextResponse.json({ products: [] });

  const { rows } = await query(
    `SELECT p.id, p.name, p.price, p.image_url, s.name AS store_name
     FROM products p JOIN stores s ON s.id = p.store_id
     WHERE p.name ILIKE $1 ORDER BY p.name ASC LIMIT 6`,
    [`%${q}%`]
  );
  return NextResponse.json({ products: rows });
}
