import { Suspense } from "react";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ActivityToast from "@/components/ActivityToast";
import HideOnLogin from "@/components/HideOnLogin";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta" });

export const metadata = {
  title: { default: "UnhasCorner — Marketplace Kampus Unhas", template: "%s | UnhasCorner" },
  description: "E-commerce atribut, merchandise, dan perlengkapan akademik mahasiswa Universitas Hasanuddin.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-screen antialiased" suppressHydrationWarning>
        <HideOnLogin>
          <Navbar />
        </HideOnLogin>
        <Suspense fallback={null}>
          <ActivityToast />
        </Suspense>
        <main>{children}</main>
        <HideOnLogin>
          <Footer />
        </HideOnLogin>
      </body>
    </html>
  );
}