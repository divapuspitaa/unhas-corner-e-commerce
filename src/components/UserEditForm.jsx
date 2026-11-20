"use client";
import { useActionState } from "react";
import SubmitButton from "@/components/SubmitButton";
import { updateUser } from "@/actions/admin";

export default function UserEditForm({ user }) {
  const [state, action] = useActionState(updateUser, null);
  return (
    <form action={action} className="card max-w-xl space-y-4 p-5">
      <input type="hidden" name="id" value={user.id} />
      {state?.error && <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">{state.error}</p>}
      <div>
        <label className="label">Role</label>
        <input value={user.role} disabled className="input bg-surface capitalize" />
      </div>
      <div>
        <label className="label" htmlFor="name">Nama</label>
        <input id="name" name="name" defaultValue={user.name} required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" defaultValue={user.email} required className="input" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Telepon</label>
        <input id="phone" name="phone" defaultValue={user.phone ?? ""} className="input" />
      </div>
      <SubmitButton>Simpan</SubmitButton>
    </form>
  );
}
