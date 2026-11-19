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
          <label className="label">Label</label>
          <input name="label" placeholder="Kos / Rumah / Kampus" className="input" />
        </div>
        <div>
          <label className="label">Nama penerima</label>
          <input name="recipient_name" required className="input" />
        </div>
        <div>
          <label className="label">Telepon</label>
          <input name="phone" required className="input" />
        </div>
        <div>
          <label className="label">Kota</label>
          <input name="city" required className="input" />
        </div>
      </div>
      <div>
        <label className="label">Alamat lengkap</label>
        <textarea name="full_address" required rows={2} className="input" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Kode pos</label>
          <input name="postal_code" className="input" maxLength={5} />
        </div>
        <label className="flex items-end gap-2 pb-2 text-sm">
          <input type="checkbox" name="is_default" /> Jadikan alamat utama
        </label>
      </div>
      <SubmitButton>Simpan Alamat</SubmitButton>
    </form>
  );
}
