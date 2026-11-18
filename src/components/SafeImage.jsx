"use client";
import { useState } from "react";

// Gambar dengan fallback otomatis jika file belum ada di /public
export default function SafeImage({ src, alt, className = "" }) {
  const [failed, setFailed] = useState(false);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={failed || !src ? "/images/placeholder.svg" : src}
      alt={alt}
      onError={() => setFailed(true)}
      className={className}
      loading="lazy"
    />
  );
}
