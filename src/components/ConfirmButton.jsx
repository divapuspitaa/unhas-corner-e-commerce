"use client";

// Tombol submit dengan konfirmasi browser (untuk aksi hapus)
export default function ConfirmButton({ children, message = "Yakin?", className = "btn btn-danger btn-sm" }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
