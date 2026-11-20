"use client";
import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { updateProfile } from "@/actions/profile";

export default function ProfileForm({ user }) {
  const [state, action] = useActionState(updateProfile, null);
  return (
    <form action={action} className="card max-w-xl space-y-4 p-5">
      {state?.error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{state.error}</p>}
      {state?.ok && <p className="rounded-lg bg-status-success-bg px-3 py-2 text-sm text-status-success-text">{state.ok}</p>}
      <div>
        <label className="label">Email</label>
        <input value={user.email} disabled className="input bg-surface" />
      </div>
      <div>
        <label className="label" htmlFor="name">Nama</label>
        <input id="name" name="name" defaultValue={user.name} required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Telepon</label>
        <input id="phone" name="phone" defaultValue={user.phone ?? ""} className="input" />
      </div>
      <div>
        <label className="label" htmlFor="newPassword">Password baru (kosongkan jika tidak diganti)</label>
        <input id="newPassword" name="newPassword" type="password" minLength={6} className="input" />
      </div>
      <SubmitButton>Simpan Perubahan</SubmitButton>
    </form>
  );
}
