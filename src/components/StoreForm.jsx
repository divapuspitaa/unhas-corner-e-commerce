"use client";
import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { saveStore } from "@/actions/store";

export default function StoreForm({ store }) {
  const [state, action] = useActionState(saveStore, null);
  return (
    <form action={action} className="card max-w-xl space-y-4 p-5">
      {state?.error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-status-success-bg px-3 py-2 text-sm text-status-success-text">{state.ok}</p>}
      <div>
        <label className="label" htmlFor="name">Nama toko</label>
        <input id="name" name="name" defaultValue={store?.name ?? ""} required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="description">Deskripsi</label>
        <textarea id="description" name="description" defaultValue={store?.description ?? ""} required rows={3} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="image">Gambar toko (JPG/PNG/WEBP, maks. 2 MB, opsional)</label>
        <input type="hidden" name="current_image" value={store?.image_url ?? ""} />
        <input id="image" name="image" type="file" accept="image/png,image/jpeg,image/webp" className="input" />
        {store?.image_url && (
          <p className="mt-1 text-xs text-muted">Gambar saat ini: {store.image_url}. Kosongkan jika tidak ingin mengganti.</p>
        )}
      </div>
      <SubmitButton>Simpan Toko</SubmitButton>
    </form>
  );
}