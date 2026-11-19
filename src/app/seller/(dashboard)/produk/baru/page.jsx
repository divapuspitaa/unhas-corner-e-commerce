import ProductForm from "@/components/ProductForm";
import { getCategories } from "@/lib/queries";

export const metadata = { title: "Tambah Produk" };
export const dynamic = "force-dynamic";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Tambah Produk</h2>
      <ProductForm categories={categories} />
    </div>
  );
}
