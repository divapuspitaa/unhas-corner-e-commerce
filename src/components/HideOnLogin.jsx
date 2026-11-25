"use client";

import { usePathname } from "next/navigation";

export default function HideOnLogin({ children }) {
  const pathname = usePathname();
  if (pathname === "/login" || pathname === "/register") return null;
  return children;
}
