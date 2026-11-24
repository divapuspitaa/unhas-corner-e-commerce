import ConfirmButton from "@/components/ConfirmButton";
import { query } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { adminDeleteProduct } from "@/actions/admin";

export const metadata = { title: "Moderasi Produk" };
export const dynamic = "force-dynamic";

const SORT_OPTIONS = [
  ["stok", "Stok Tersedikit", "p.stock ASC, p.price DESC, p.id DESC"],
  ["stok_terbanyak", "Stok Terbanyak", "p.stock DESC, p.price DESC, p.id DESC"],
  ["harga_termurah", "Harga Termurah", "p.price ASC, p.stock ASC, p.id DESC"],
  ["harga_termahal", "Harga Termahal", "p.price DESC, p.stock ASC, p.id DESC"],
];

export default async function AdminProductsPage({ searchParams }) {
  const sp = await searchParams;
  const q = (sp.q ?? "").trim();
  const currentSort = SORT_OPTIONS.find(([k]) => k === sp.sort) ?? SORT_OPTIONS[0];
  const { rows } = await query(
    `SELECT p.id, p.name, p.price, p.stock, s.name AS store_name FROM products p
     JOIN stores s ON s.id = p.store_id
     WHERE p.name ILIKE $1 ORDER BY ${currentSort[2]} LIMIT 100`,
    [`%${q}%`]
  );

  return (
    <div>
      <h2 className="mb-3 text-lg font-semibold">Moderasi Produk</h2>
      <form className="mb-3 flex gap-2">
        <input name="q" defaultValue={q} placeholder="Cari produk..." className="input max-w-xs" />
        <select name="sort" defaultValue={currentSort[0]} className="input max-w-200px" aria-label="Urutkan berdasarkan stok dan harga">
          {SORT_OPTIONS.map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <button className="btn btn-outline">Cari</button>
      </form>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-560px text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs text-muted">
            <tr>
              <th className="p-3">Produk</th>
              <th className="p-3">Toko</th>
              <th className="p-3">Harga</th>
              <th className="p-3">Stok</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-muted">{p.store_name}</td>
                <td className="p-3">{formatRupiah(p.price)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3 text-right">
                  <form action={adminDeleteProduct}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmButton message={`Hapus produk "${p.name}" dari platform?`}>Hapus</ConfirmButton>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}