"use client";
import { useActionState, useRef } from "react";
import SubmitButton from "@/components/SubmitButton";
import { addAddress } from "@/actions/profile";

export default function AddressForm() {
  const formRef = useRef(null);
  const [state, action] = useActionState(async (prev, fd) => {
    const res = await addAddress(prev, fd);
    if (res?.ok) formRef.current?.reset();
    return res;
  }, null);

  return (
    <form ref={formRef} action={action} className="card space-y-3 p-5">
      <h2 className="font-semibold">Tambah Alamat Baru</h2>
      {state?.error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-status-success-bg px-3 py-2 text-sm text-status-success-text">{state.ok}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Label alamat</label>
          <input name="label" placeholder="Contoh: Kos Tamalanrea / Fakultas / Rumah" className="input" />
        </div>
        <div>
          <label className="label">Nama penerima</label>
          <input name="recipient_name" required placeholder="Nama lengkap penerima pesanan" className="input" />
        </div>
        <div>
          <label className="label">Telepon</label>
          <input name="phone" required placeholder="Contoh: 081234567890" className="input" />
        </div>
        <div>
          <label className="label">Kota / Kabupaten</label>
          <input name="city" required placeholder="Contoh: Makassar" className="input" />
        </div>
      </div>
      <div>
        <label className="label">Alamat lengkap & patokan</label>
        <textarea
          name="full_address"
          required
          rows={2}
          placeholder="Contoh: Jl. Perintis Kemerdekaan Km. 10, Pondokan Melati No. 12, Tamalanrea"
          className="input"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Kode pos</label>
          <input name="postal_code" maxLength={5} placeholder="Contoh: 90245" className="input" />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" name="is_default" /> Jadikan alamat utama
        </label>
      </div>
      <SubmitButton>Simpan Alamat</SubmitButton>
    </form>
  );
}