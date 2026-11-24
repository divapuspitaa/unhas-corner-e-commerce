"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";

const BANNERS = [
  {
    src: "/images/banners/banner-2-stiker.png",
    alt: "Unhasku bersatu, Unhasku kuat",
    href: "/toko",
  },
  {
    src: "/images/banners/banner-3-logo-unhas.png",
    alt: "Bangga jadi bagian dari Universitas Hasanuddin",
    href: "/produk",
    ctaText: "Belanja Sekarang",
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const prevSlide = () => {
    setCurrent((prev) => (prev === 0 ? BANNERS.length - 1 : prev - 1));
  };

  const nextSlide = () => {
    setCurrent((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
  };

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev === BANNERS.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [paused]);

  return (
    <section
      aria-label="Banner Promo UnhasCorner"
      className="group relative w-full overflow-hidden rounded-2xl border border-line/80 bg-[#4A0707] shadow-md"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className="flex transition-transform duration-700 ease-out"
        style={{ transform: `translateX(-${current * 100}%)` }}
      >
        {BANNERS.map((banner, index) => {
          const isActive = current === index;
          return (
            <div key={banner.src} className="relative w-full shrink-0 overflow-hidden">
              {banner.ctaText ? (
                <>
                  <img
                    src={banner.src}
                    alt={banner.alt}
                    loading={index === 0 ? "eager" : "lazy"}
                    className={`block h-auto w-full object-cover transition-transform duration-1000 ease-out ${
                      isActive ? "scale-100" : "scale-[1.03]"
                    }`}
                  />
                  <Link
                    href={banner.href}
                    className="absolute top-[82%] left-[5.2%] z-20 inline-flex items-center justify-center rounded-md bg-[#C59E56] px-3 py-1 text-[10px] font-bold text-[#6E0D0D] shadow-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#d7b269] hover:shadow-[0_10px_25px_rgba(197,158,86,0.5)] active:translate-y-0 sm:top-[83%] sm:rounded-lg sm:px-5 sm:py-1.5 sm:text-xs md:px-7 md:py-2.5 md:text-sm"
                  >
                    {banner.ctaText}
                  </Link>
                </>
              ) : (
                <Link
                  href={banner.href}
                  className="block w-full"
                  aria-label={banner.alt}
                >
                  <img
                    src={banner.src}
                    alt={banner.alt}
                    loading={index === 0 ? "eager" : "lazy"}
                    className={`block h-auto w-full object-cover transition-transform duration-1000 ease-out ${
                      isActive ? "scale-100" : "scale-[1.03]"
                    }`}
                  />
                </Link>
              )}

              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/35 to-transparent" />
            </div>
          );
        })}
      </div>

      {/* Indikator kapsul glassmorphism */}
      <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/25 px-3 py-1.5 backdrop-blur-md sm:bottom-4">
        {BANNERS.map((banner, index) => (
          <button
            key={banner.src}
            type="button"
            onClick={() => setCurrent(index)}
            aria-label={`Tampilkan banner ${index + 1}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              current === index
                ? "w-6 bg-[#C59E56]"
                : "w-2 bg-white/60 hover:bg-white"
            }`}
          />
        ))}
      </div>

      {/* Tombol panah kiri */}
      <button
        type="button"
        onClick={prevSlide}
        aria-label="Banner sebelumnya"
        className="absolute top-1/2 left-3 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white opacity-80 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/50 hover:opacity-100 md:left-4 md:h-10 md:w-10"
      >
        <LuChevronLeft size={20} />
      </button>

      {/* Tombol panah kanan */}
      <button
        type="button"
        onClick={nextSlide}
        aria-label="Banner berikutnya"
        className="absolute top-1/2 right-3 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/30 text-white opacity-80 shadow-lg backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/50 hover:opacity-100 md:right-4 md:h-10 md:w-10"
      >
        <LuChevronRight size={20} />
      </button>
    </section>
  );
}