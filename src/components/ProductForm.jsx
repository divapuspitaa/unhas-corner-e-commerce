"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { LuImagePlus, LuUpload } from "react-icons/lu";
import SubmitButton from "@/components/SubmitButton";
import { createProduct, updateProduct } from "@/actions/products";

export default function ProductForm({ categories, product }) {
  const [state, action] = useActionState(product ? updateProduct : createProduct, null);
  const [previewUrl, setPreviewUrl] = useState(product?.image_url ?? "");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const categoryRef = useRef(null);

  // Field dikontrol lewat state agar isian TIDAK hilang saat form gagal disimpan
  // (mis. foto produk lupa diunggah)
  const [values, setValues] = useState({
    name: product?.name ?? "",
    description: product?.description ?? "",
    price: product?.price ?? "",
    stock: product?.stock ?? "",
    category_id: product?.category_id ?? "",
  });
  const setField = (key) => (e) => setValues((v) => ({ ...v, [key]: e.target.value }));

  // Jika server menolak, input file selalu dikosongkan browser: samakan pratinjau dengan kondisi sebenarnya
  useEffect(() => {
    // Pastikan pilihan kategori tetap tampil setelah form di-reset otomatis oleh React
    if (state?.error && categoryRef.current) categoryRef.current.value = String(values.category_id ?? "");
    if (state?.error && !fileInputRef.current?.files?.length) {
      setFileName("");
      setPreviewUrl(product?.image_url ?? "");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, product?.image_url]);

  const handleFileSelect = (file) => {
    if (!file) return;
    setFileName(file.name);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer?.files?.[0];
    if (!file || !fileInputRef.current) return;

    const dt = new DataTransfer();
    dt.items.add(file);
    fileInputRef.current.files = dt.files;
    handleFileSelect(file);
  };

  return (
    <form action={action} className="card max-w-2xl space-y-4 p-5">
      {product && <input type="hidden" name="id" value={product.id} />}
      {state?.error && (
        <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">
          {state.error}
        </p>
      )}

      <div>
        <label className="label" htmlFor="name">Nama produk</label>
        <input
          id="name"
          name="name"
          value={values.name}
          onChange={setField("name")}
          required
          placeholder="Contoh: Jas Almamater Unhas / Jas Lab Lengan Panjang"
          className="input"
        />
      </div>

      <div>
        <label className="label" htmlFor="description">Deskripsi</label>
        <textarea
          id="description"
          name="description"
          value={values.description}
          onChange={setField("description")}
          required
          rows={4}
          placeholder="Tuliskan spesifikasi bahan, ukuran yang tersedia, kondisi produk, serta informasi pengambilan di kampus..."
          className="input"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="price">Harga (Rp)</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            value={values.price}
            onChange={setField("price")}
            required
            placeholder="Contoh: 150000"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="stock">Stok</label>
          <input
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            value={values.stock}
            onChange={setField("stock")}
            required
            placeholder="Contoh: 25"
            className="input"
          />
        </div>
        <div>
          <label className="label" htmlFor="category_id">Kategori</label>
          <select
            ref={categoryRef}
            id="category_id"
            name="category_id"
            value={values.category_id}
            onChange={setField("category_id")}
            required
            className="input"
          >
            <option value="" disabled>Pilih kategori produk</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kotak Placeholder Peletakan Foto Produk */}
      <div>
        <span className="label">Foto Produk (JPG/PNG/WEBP, maks. 2 MB)</span>
        <input type="hidden" name="current_image" value={product?.image_url ?? ""} />

        <label
          htmlFor="image"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`mt-1 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 text-center transition-all ${
            isDragging
              ? "border-primary bg-primary-soft/60"
              : "border-line bg-surface/40 hover:border-primary/60 hover:bg-primary-soft/20"
          }`}
        >
          {previewUrl ? (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Pratinjau foto produk"
                className="h-24 w-24 shrink-0 rounded-lg border border-line bg-white object-cover shadow-sm"
              />
              <div className="space-y-1">
                <p className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                  <LuUpload size={15} /> Klik atau seret gambar baru ke kotak ini untuk mengganti
                </p>
                <p className="text-xs text-muted">
                  {fileName
                    ? `File dipilih: ${fileName}`
                    : "Foto saat ini terpasang. Biarkan jika tidak ingin mengganti."}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-1.5 py-2">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary">
                <LuImagePlus size={22} />
              </span>
              <p className="text-sm font-semibold text-ink">
                Letakkan foto produk di sini, atau <span className="text-primary underline">pilih file</span>
              </p>
              <p className="text-xs text-muted">
                Mendukung format JPG, PNG, atau WEBP (maksimal ukuran 2 MB)
              </p>
            </div>
          )}

          <input
            ref={fileInputRef}
            id="image"
            name="image"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            required={!product?.image_url}
            onChange={(e) => handleFileSelect(e.target.files?.[0])}
            className="sr-only"
          />
        </label>
      </div>

      <SubmitButton>{product ? "Simpan Perubahan" : "Tambah Produk"}</SubmitButton>
    </form>
  );
}