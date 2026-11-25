"use client";

import { useActionState, useState } from "react";
import { LuEye, LuEyeOff, LuLock } from "react-icons/lu";
import SubmitButton from "@/components/SubmitButton";
import { changePassword } from "@/actions/profile";

function PasswordField({ id, name, label, placeholder, minLength }) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="label" htmlFor={id}>{label}</label>
      <div className="relative">
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required
          minLength={minLength}
          className="input pr-10"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          aria-label={show ? "Sembunyikan password" : "Tampilkan password"}
          className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1.5 text-muted transition-colors hover:text-primary"
        >
          {show ? <LuEyeOff size={18} /> : <LuEye size={18} />}
        </button>
      </div>
    </div>
  );
}

export default function ChangePasswordForm() {
  const [state, action] = useActionState(changePassword, null);

  return (
    <form action={action} className="card max-w-xl space-y-4 p-5">
      <div className="flex items-center gap-2 border-b border-line pb-3">
        <LuLock size={18} className="text-primary" />
        <h3 className="font-semibold text-ink">Ganti Password</h3>
      </div>

      {state?.error && (
        <p className="rounded-lg bg-status-danger-bg px-3 py-2 text-sm text-status-danger-text">
          {state.error}
        </p>
      )}
      {state?.ok && (
        <p className="rounded-lg bg-status-success-bg px-3 py-2 text-sm text-status-success-text">
          {state.ok}
        </p>
      )}

      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label="Password Saat Ini"
        placeholder="Masukkan password saat ini"
      />
      <PasswordField
        id="newPassword"
        name="newPassword"
        label="Password Baru"
        minLength={6}
        placeholder="Minimal 6 karakter"
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label="Konfirmasi Password Baru"
        minLength={6}
        placeholder="Ulangi password baru"
      />

      <SubmitButton>Simpan Password</SubmitButton>
    </form>
  );
}
