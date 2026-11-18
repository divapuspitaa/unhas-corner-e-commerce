"use client";
import { useFormStatus } from "react-dom";

export default function SubmitButton({ children, pendingText = "Memproses...", className = "btn btn-primary", disabled = false, ...props }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending || disabled} className={className} {...props}>
      {pending ? pendingText : children}
    </button>
  );
}
