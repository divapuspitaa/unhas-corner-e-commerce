import Link from "next/link";
import { LuPencil, LuPlus } from "react-icons/lu";
import ConfirmButton from "@/components/ConfirmButton";
import SafeImage from "@/components/SafeImage";
import { requireApprovedSeller } from "@/lib/auth";
import { query } from "@/lib/db";
import { LOW_STOCK_LIMIT, formatRupiah } from "@/lib/format";
import { deleteProduct } from "@/actions/products";

export const metadata = { title: "Produk Saya" };
export const dynamic = "force-dynamic";

const SORT_OPTIONS = [
  ["stok", "Stok Tersedikit", "p.stock ASC, p.price DESC, p.id DESC"],
  ["stok_terbanyak", "Stok Terbanyak", "p.stock DESC, p.price DESC, p.id DESC"],
  ["harga_termurah", "Harga Termurah", "p.price ASC, p.stock ASC, p.id DESC"],
  ["harga_termahal", "Harga Termahal", "p.price DESC, p.stock ASC, p.id DESC"],
];

export default async function SellerProductsPage({ searchParams }) {
  const sp = await searchParams;
  const user = await requireApprovedSeller();
  const currentSort = SORT_OPTIONS.find(([k]) => k === sp.sort) ?? SORT_OPTIONS[0];
  const { rows } = await query(
    `SELECT p.*, c.name AS category_name FROM products p
     JOIN stores s ON s.id = p.store_id LEFT JOIN categories c ON c.id = p.category_id
     WHERE s.user_id = $1 ORDER BY ${currentSort[2]}`,
    [user.id]
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Produk Saya ({rows.length})</h2>
        <Link href="/seller/produk/baru" className="btn btn-primary"><LuPlus size={16} /> Tambah Produk</Link>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs font-semibold text-muted">Urutkan (stok &amp; harga):</span>
        {SORT_OPTIONS.map(([key, label]) => (
          <Link
            key={key}
            href={key === SORT_OPTIONS[0][0] ? "/seller/produk" : `/seller/produk?sort=${key}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all ${
              currentSort[0] === key
                ? "bg-primary font-semibold text-white shadow-xs"
                : "border border-line bg-white text-ink hover:border-primary hover:bg-primary-soft hover:text-primary"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-160 text-left text-sm">
          <thead className="border-b border-line bg-surface text-xs text-muted">
            <tr>
              <th className="p-3">Produk</th>
              <th className="p-3">Kategori</th>
              <th className="p-3">Harga</th>
              <th className="p-3">Stok</th>
              <th className="p-3 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr><td colSpan={5} className="p-6 text-center text-muted">Belum ada produk.</td></tr>
            )}
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="p-3">
                  <div className="flex items-center gap-3">
                    <SafeImage src={p.image_url} alt={p.name} className="h-10 w-10 rounded object-cover" />
                    <span className="font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="p-3 text-muted">{p.category_name ?? "-"}</td>
                <td className="p-3">{formatRupiah(p.price)}</td>
                <td className="p-3">
                  {p.stock <= LOW_STOCK_LIMIT ? (
                    <span className="inline-flex items-center gap-1.5">
                      <span className="font-bold text-yellow-500">{p.stock}</span>
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-bold text-yellow-600">
                        {p.stock === 0 ? "Habis" : "Stok menipis"}
                      </span>
                    </span>
                  ) : (
                    p.stock
                  )}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/seller/produk/${p.id}/edit`} className="btn btn-outline btn-sm"><LuPencil size={13} /> Edit</Link>
                    <form action={deleteProduct}>
                      <input type="hidden" name="id" value={p.id} />
                      <ConfirmButton message={`Hapus "${p.name}"?`}>Hapus</ConfirmButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
