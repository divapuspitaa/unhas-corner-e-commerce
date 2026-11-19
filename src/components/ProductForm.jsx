"use client";
import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { createProduct, updateProduct } from "@/actions/products";

export default function ProductForm({ categories, product }) {
  const [state, action] = useActionState(product ? updateProduct : createProduct, null);
  return (
    <form action={action} className="card max-w-2xl space-y-4 p-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      {state?.error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{state.error}</p>}
      <div>
        <label className="label" htmlFor="name">Nama produk</label>
        <input id="name" name="name" defaultValue={product?.name ?? ""} required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="description">Deskripsi</label>
        <textarea id="description" name="description" defaultValue={product?.description ?? ""} required rows={4} className="input" />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="price">Harga (Rp)</label>
          <input id="price" name="price" type="number" min="0" defaultValue={product?.price ?? ""} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="stock">Stok</label>
          <input id="stock" name="stock" type="number" min="0" step="1" defaultValue={product?.stock ?? ""} required className="input" />
        </div>
        <div>
          <label className="label" htmlFor="category_id">Kategori</label>
          <select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""} required className="input">
            <option value="" disabled>Pilih kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label" htmlFor="image_url">Gambar produk (URL atau path)</label>
        <input
          id="image_url"
          name="image_url"
          defaultValue={product?.image_url ?? ""}
          required
          className="input"
          placeholder="/images/products/nama-produk.jpg atau https://..."
        />
      </div>
      <SubmitButton>{product ? "Simpan Perubahan" : "Tambah Produk"}</SubmitButton>
    </form>
  );
}
