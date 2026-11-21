"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LuSearch } from "react-icons/lu";
import { formatRupiah } from "@/lib/format";

export default function SearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const boxRef = useRef(null);

  // Pencarian instan (debounce 250 ms) ke route handler /api/products
  useEffect(() => {
    if (q.trim().length < 2) {
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(q.trim())}`);
        const data = await res.json();
        setResults(data.products ?? []);
        setOpen(true);
      } catch {
        setResults([]);
      }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function onClick(e) {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function onSubmit(e) {
    e.preventDefault();
    setOpen(false);
    router.push(q.trim() ? `/produk?q=${encodeURIComponent(q.trim())}` : "/produk");
  }

  return (
    <div ref={boxRef} className="relative w-full">
      <form onSubmit={onSubmit} className="relative">
        <input
          value={q}
          onChange={(e) => {
            const val = e.target.value;
            setQ(val);
            if (val.trim().length < 2) {
              setResults([]);
              setOpen(false);
            }
          }}
          onFocus={() => results.length && setOpen(true)}
          placeholder="Cari jas almamater, kalkulator, lanyard..."
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-3 pr-12 text-sm outline-none focus:border-primary"
          suppressHydrationWarning
        />
        <button
          type="submit"
          aria-label="Cari"
          className="absolute right-1 top-1/2 -translate-y-1/2 rounded-md bg-primary px-3 py-1.5 text-white hover:bg-primary-hover"
        >
          <LuSearch size={16} />
        </button>
      </form>
      {open && results.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-line bg-white shadow-lg">
          {results.map((p) => (
            <li key={p.id}>
              <a
                href={`/produk/${p.id}`}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm hover:bg-primary-soft"
              >
                <span className="truncate">{p.name}</span>
                <span className="shrink-0 text-xs font-semibold text-primary">{formatRupiah(p.price)}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
