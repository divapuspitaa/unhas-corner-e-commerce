"use client";

import { useState, useTransition } from "react";
import { LuHeart } from "react-icons/lu";
import { toggleWishlistAction } from "@/actions/wishlist";

export default function WishlistDetailButton({ productId, initialWished = false }) {
  const [wished, setWished] = useState(initialWished);
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const nextState = !wished;
    setWished(nextState);

    startTransition(async () => {
      const res = await toggleWishlistAction(productId);
      if (!res?.ok) {
        setWished(!nextState);
        window.dispatchEvent(
          new CustomEvent("unhas-toast", {
            detail: {
              type: "err",
              title: "Gagal Memperbarui Wishlist",
              message: res?.error || "Terjadi kesalahan saat menyimpan wishlist.",
            },
          })
        );
        return;
      }

      setWished(res.wished);
      window.dispatchEvent(
        new CustomEvent("unhas-toast", {
          detail: {
            type: "ok",
            title: res.wished ? "Ditambahkan ke Wishlist" : "Dihapus dari Wishlist",
            message: res.message,
          },
        })
      );
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={`btn w-full transition-all ${
        wished
          ? "border-primary bg-primary-soft font-semibold text-primary"
          : "btn-outline"
      }`}
    >
      <LuHeart size={16} className={wished ? "fill-primary text-primary" : ""} />
      {wished ? "Tersimpan di Wishlist" : "Tambah ke Wishlist"}
    </button>
  );
}