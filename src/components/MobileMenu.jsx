"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuMenu, LuX } from "react-icons/lu";
import { logout } from "@/actions/auth";

export default function MobileMenu({ links, loggedIn }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        aria-label="Buka menu"
        className="rounded-lg p-2 transition-colors hover:bg-primary-soft"
      >
        <LuMenu size={22} />
      </button>
      {open &&
        createPortal(
        <div className="fixed inset-0 z-60 flex flex-col bg-white/60 backdrop-blur-2xl">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-3">
            <span className="font-heading text-lg font-bold text-primary">UnhasCorner</span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Tutup menu"
              className="rounded-lg p-2 transition-colors hover:bg-primary-soft"
            >
              <LuX size={22} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {links.map((l) => {
              const isActive =
                l.href === "/"
                  ? pathname === "/"
                  : pathname === l.href || pathname.startsWith(`${l.href}/`);

              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={isActive ? "page" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between rounded-lg px-3 py-3 text-base transition-colors ${
                    isActive
                      ? "bg-primary-soft font-semibold text-primary"
                      : "font-medium hover:bg-white/60 hover:text-primary"
                  }`}
                >
                  <span>{l.label}</span>
                  {isActive && <span className="h-2 w-2 rounded-full bg-primary" />}
                </Link>
              );
            })}
            {loggedIn && (
              <form action={logout} className="mt-2 border-t border-line pt-2">
                <button className="w-full rounded-lg px-3 py-3 text-left text-base font-medium text-status-danger-text transition-colors hover:bg-status-danger-bg">
                  Keluar
                </button>
              </form>
            )}
          </nav>
        </div>,
        document.body
      )}
    </div>
  );
}