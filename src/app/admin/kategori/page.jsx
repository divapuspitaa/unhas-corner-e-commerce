import Notice from "@/components/Notice";
import { getCategories } from "@/lib/queries";
import { deleteCategory, saveCategory } from "@/actions/admin";

export const metadata = { title: "Kelola Kategori" };
export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage({ searchParams }) {
  const sp = await searchParams;
  const categories = await getCategories();

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold">Kategori Produk</h2>
      <Notice ok={sp.ok} err={sp.err} />

      <form action={saveCategory} className="card grid gap-3 p-4 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
        <div>
          <label className="label">Nama kategori baru</label>
          <input name="name" required className="input" />
        </div>
        <div>
          <label className="label">Deskripsi</label>
          <input name="description" className="input" />
        </div>
        <button className="btn btn-primary">Tambah</button>
      </form>

      <div className="space-y-3">
        {categories.map((c) => (
          <div key={c.id} className="card p-4">
            <form action={saveCategory} className="grid gap-3 sm:grid-cols-[1fr_2fr_auto_auto] sm:items-end">
              <input type="hidden" name="id" value={c.id} />
              <div>
                <label className="label">Nama</label>
                <input name="name" defaultValue={c.name} required className="input" />
              </div>
              <div>
                <label className="label">Deskripsi</label>
                <input name="description" defaultValue={c.description ?? ""} className="input" />
              </div>
              <button className="btn btn-outline">Simpan</button>
              <button formAction={deleteCategory} className="btn btn-danger">Hapus</button>
            </form>
            <p className="mt-2 text-xs text-muted">{c.product_count} produk memakai kategori ini</p>
          </div>
        ))}
      </div>
    </div>
  );
}
