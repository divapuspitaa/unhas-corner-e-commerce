import Link from "next/link";

export default function DashboardShell({ title, links, children }) {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-5 text-2xl font-bold">{title}</h1>
      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <nav className="card flex h-fit gap-1 overflow-x-auto p-2 md:flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium hover:bg-primary-soft hover:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
