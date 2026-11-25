"use client";

import { useEffect, useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LuHeart } from "react-icons/lu";
import { toggleWishlistAction } from "@/actions/wishlist";

export default function WishlistButton({ productId, initialWished = false }) {
  const [wished, setWished] = useState(initialWished);
  const [isPending, startTransition] = useTransition();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    setWished(initialWished);
  }, [initialWished]);

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const nextState = !wished;
    setWished(nextState);

    startTransition(async () => {
      const res = await toggleWishlistAction(productId);

      if (res?.requireLogin) {
        setWished(!nextState);
        router.push(`/login?next=${encodeURIComponent(pathname || "/")}&reason=wishlist`);
        return;
      }

      if (!res?.ok) {
        setWished(!nextState);
        window.dispatchEvent(
          new CustomEvent("unhas-toast", {
            detail: {
              type: "err",
              title: "Tidak Dapat Menyimpan",
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
            title: res.wished ? "Wishlist Bertambah" : "Dihapus dari Wishlist",
            message: res.message,
          },
        })
      );

      if (pathname === "/wishlist") {
        router.refresh();
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-label={wished ? "Hapus dari wishlist" : "Tambah ke wishlist"}
      className="absolute top-2 right-2 z-10 rounded-full bg-white/90 p-1.5 shadow transition-transform duration-150 hover:scale-110 hover:bg-white active:scale-95 disabled:opacity-70"
    >
      <LuHeart
        size={16}
        className={`transition-colors duration-200 ${
          wished ? "fill-primary text-primary" : "text-muted"
        }`}
      />
    </button>
  );
}