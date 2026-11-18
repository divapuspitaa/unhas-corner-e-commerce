"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { logout } from "@/actions/auth";

export default function MobileMenu({ links, loggedIn }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button onClick={() => setOpen(true)} aria-label="Buka menu" className="rounded-lg p-2 hover:bg-primary-soft">
        <Menu size={22} />
      </button>
      {open && (
        <div className="fixed inset-0 z-60 flex flex-col bg-white">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <span className="font-heading text-lg font-bold text-primary">UnhasCorner</span>
            <button onClick={() => setOpen(false)} aria-label="Tutup menu" className="rounded-lg p-2 hover:bg-primary-soft">
              <X size={22} />
            </button>
          </div>
          <nav className="flex flex-col gap-1 p-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium hover:bg-primary-soft"
              >
                {l.label}
              </Link>
            ))}
            {loggedIn && (
              <form action={logout}>
                <button className="w-full rounded-lg px-3 py-3 text-left text-base font-medium text-status-danger-text hover:bg-status-danger-bg">
                  Keluar
                </button>
              </form>
            )}
          </nav>
        </div>
      )}
    </div>
  );
}
