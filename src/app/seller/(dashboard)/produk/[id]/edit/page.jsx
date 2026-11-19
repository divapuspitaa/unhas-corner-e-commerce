import { notFound } from "next/navigation";
import ProductForm from "@/components/ProductForm";
import { requireApprovedSeller } from "@/lib/auth";
import { query } from "@/lib/db";
import { getCategories } from "@/lib/queries";

export const metadata = { title: "Edit Produk" };
export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }) {
  const { id } = await params;
  const user = await requireApprovedSeller();
  const productId = Number(id);
  if (!Number.isInteger(productId)) notFound();

  const { rows } = await query(
    "SELECT p.* FROM products p JOIN stores s ON s.id = p.store_id WHERE p.id = $1 AND s.user_id = $2",
    [productId, user.id]
  );
  if (!rows[0]) notFound();
  const categories = await getCategories();

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Edit Produk</h2>
      <ProductForm categories={categories} product={rows[0]} />
    </div>
  );
}
