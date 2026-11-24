"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LuTriangleAlert, LuX } from "react-icons/lu";

export default function ConfirmButton({
  message = "Apakah Anda yakin ingin menghapus data ini?",
  title = "Konfirmasi Hapus",
  confirmLabel = "OK",
  cancelLabel = "Cancel",
  className = "btn btn-danger btn-sm",
  onConfirm,
  children,
  ...props
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const buttonRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const handleTriggerClick = (e) => {
    e.preventDefault();
    setOpen(true);
  };

  const handleConfirm = () => {
    setOpen(false);
    if (onConfirm) {
      onConfirm();
      return;
    }
    const btn = buttonRef.current;
    const form = btn?.closest("form");
    if (form) {
      form.requestSubmit(btn);
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="submit"
        onClick={handleTriggerClick}
        className={className}
        {...props}
      >
        {children}
      </button>

      {mounted &&
        open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 p-4 backdrop-blur-[1px]"
            onClick={() => setOpen(false)}
          >
            <div
              className="w-full max-w-sm rounded-2xl border border-line bg-white p-5 shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-status-danger-bg text-status-danger-text">
                    <LuTriangleAlert size={20} />
                  </span>
                  <h3 id="confirm-modal-title" className="text-base font-bold text-ink">
                    {title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Tutup dialog"
                  className="rounded-lg p-1 text-muted transition hover:bg-surface hover:text-ink"
                >
                  <LuX size={18} />
                </button>
              </div>

              <p className="mt-3 text-sm leading-relaxed text-ink/85">{message}</p>

              <div className="mt-5 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn btn-outline btn-sm px-4"
                >
                  {cancelLabel}
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="btn btn-danger btn-sm px-4"
                  autoFocus
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}