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
        <label className="label" htmlFor="image_url">Gambar toko (URL / path, opsional)</label>
        <input id="image_url" name="image_url" defaultValue={store?.image_url ?? ""} className="input" placeholder="/images/stores/hadin.jpg" />
      </div>
      <SubmitButton>Simpan Toko</SubmitButton>
    </form>
  );
}
