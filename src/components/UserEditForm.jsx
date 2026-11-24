"use client";
import { useActionState } from "react";
import Link from "next/link";
import SubmitButton from "@/components/SubmitButton";
import { updateUser } from "@/actions/admin";

export default function UserEditForm({ user }) {
  const [state, action] = useActionState(updateUser, null);
  return (
    <form action={action} className="card max-w-xl space-y-4 p-5">
      <input type="hidden" name="id" value={user.id} />
      {state?.error && (
        <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">
          {state.error}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Role</label>
          <input value={user.role} disabled className="input bg-surface capitalize" />
        </div>
        <div>
          <label className="label" htmlFor="is_active">Status Akun</label>
          <select
            id="is_active"
            name="is_active"
            defaultValue={user.is_active === false ? "false" : "true"}
            className="input"
          >
            <option value="true">Aktif</option>
            <option value="false">Nonaktif</option>
          </select>
        </div>
      </div>

      {user.is_active === false && user.reactivation_reason && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
          <p className="font-semibold">Alasan Pengajuan Aktif Kembali:</p>
          <p className="mt-1">{user.reactivation_reason}</p>
        </div>
      )}

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
        <input
          id="phone"
          name="phone"
          defaultValue={user.phone ?? ""}
          placeholder="Contoh: 081234567890"
          className="input"
        />
      </div>

      <div className="flex items-center gap-2 pt-1">
        <SubmitButton>Simpan Perubahan</SubmitButton>
        <Link href="/admin/users" className="btn btn-outline">
          Batal
        </Link>
      </div>
    </form>
  );
}