import Link from "next/link";
import { Pencil, Plus } from "lucide-react";
import ConfirmButton from "@/components/ConfirmButton";
import Notice from "@/components/Notice";
import SafeImage from "@/components/SafeImage";
import { requireApprovedSeller } from "@/lib/auth";
import { query } from "@/lib/db";
import { formatRupiah } from "@/lib/format";
import { deleteProduct } from "@/actions/products";

export const metadata = { title: "Produk Saya" };
export const dynamic = "force-dynamic";

export default async function SellerProductsPage({ searchParams }) {
  const sp = await searchParams;
  const user = await requireApprovedSeller();
  const { rows } = await query(
    `SELECT p.*, c.name AS category_name FROM products p
     JOIN stores s ON s.id = p.store_id LEFT JOIN categories c ON c.id = p.category_id
     WHERE s.user_id = $1 ORDER BY p.id DESC`,
    [user.id]
  );

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Produk Saya ({rows.length})</h2>
        <Link href="/seller/produk/baru" className="btn btn-primary"><Plus size={16} /> Tambah Produk</Link>
      </div>
      <Notice ok={sp.ok} err={sp.err} />

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-line bg-base text-xs text-muted">
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
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    <Link href={`/seller/produk/${p.id}/edit`} className="btn btn-outline btn-sm"><Pencil size={13} /> Edit</Link>
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
