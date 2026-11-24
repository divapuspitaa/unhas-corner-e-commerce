"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LuArrowLeft, LuChevronRight } from "react-icons/lu";

export default function DashboardShell({ title, links, children }) {
  const pathname = usePathname();

  const activeLink = links.find(
    (l) =>
      pathname === l.href ||
      (!l.href.endsWith("/dashboard") && pathname.startsWith(`${l.href}/`))
  );

  return (
    <div className="mx-auto max-w-1480px px-4 py-6 sm:px-6 lg:px-8">
      {/* Header Dashboard */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-line/70 pb-4">
        <div>
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <span>{title}</span>
            {activeLink && (
              <>
                <LuChevronRight size={13} />
                <span className="font-semibold text-primary">{activeLink.label}</span>
              </>
            )}
          </div>
          <h1 className="mt-0.5 text-2xl font-bold text-ink">
            {activeLink ? activeLink.label : title}
          </h1>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-semibold text-ink transition hover:border-primary hover:bg-primary-soft hover:text-primary"
        >
          <LuArrowLeft size={14} /> Kembali ke Beranda
        </Link>
      </div>

      {/* Grid Sidebar & Konten Utama */}
      <div className="grid items-start gap-5 md:grid-cols-[230px_1fr]">
        <nav
          aria-label={title}
          className="card flex gap-1.5 overflow-x-auto p-2 md:sticky md:top-20 md:flex-col"
        >
          {links.map((l) => {
            const isActive =
              pathname === l.href ||
              (!l.href.endsWith("/dashboard") && pathname.startsWith(`${l.href}/`));

            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={isActive ? "page" : undefined}
                className={`flex items-center justify-between whitespace-nowrap rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-primary font-semibold text-white shadow-sm"
                    : "font-medium text-ink hover:bg-primary-soft hover:text-primary"
                }`}
              >
                <span>{l.label}</span>
                {isActive && (
                  <span className="ml-2 hidden h-1.5 w-1.5 rounded-full bg-white md:inline-block" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0 space-y-5">{children}</div>
      </div>
    </div>
  );
}