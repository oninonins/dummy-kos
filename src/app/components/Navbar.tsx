"use client";

import { useState, useEffect } from "react";
import { Home, Search, Heart, Bell, Menu, X } from "lucide-react";

// ============================================================
// Navbar — Sticky, transparent-to-frosted on scroll
// ============================================================

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-gray-100 bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
          : "bg-transparent"
      }`}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-3.5">
        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group" id="nav-logo">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] shadow-[0_4px_14px_rgba(255,107,107,0.4)] transition-transform duration-200 group-hover:scale-105">
            <Home size={17} className="text-white" />
          </div>
          <div className="leading-tight">
            <span className="block text-base font-800 text-[#1F2937] tracking-tight">
              Kos<span className="text-[#FF6B6B]">Solution</span>
            </span>
            <span className="block text-[10px] font-600 text-[#9CA3AF] -mt-0.5 tracking-wide">
              Cari kosan nyaman 🏠
            </span>
          </div>
        </a>

        {/* Desktop nav links */}
        <ul className="hidden md:flex items-center gap-1">
          {[
            { label: "Beranda", href: "#hero" },
            { label: "Kosan", href: "#popular" },
            { label: "Cara Pesan", href: "#how" },
            { label: "Tentang", href: "#about" },
          ].map((item) => (
            <li key={item.label}>
              <a
                href={item.href}
                className="nav-link rounded-full px-4 py-2 text-sm hover:bg-[#ffeded] transition-colors"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-3">
          <button
            id="nav-wishlist"
            className="flex items-center gap-1.5 text-sm font-600 text-[#6B7280] hover:text-[#FF6B6B] transition-colors"
          >
            <Heart size={16} />
            Favorit
          </button>
          <button
            id="nav-notif"
            className="relative p-2 rounded-full hover:bg-gray-100 transition-colors text-[#6B7280] hover:text-[#FF6B6B]"
          >
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#FF6B6B]" />
          </button>
          <a href="#popular" className="btn-primary text-sm px-5 py-2.5" id="nav-cta">
            Cari Kosan
            <Search size={15} />
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          id="nav-mobile-toggle"
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? (
            <X size={22} className="text-[#1F2937]" />
          ) : (
            <Menu size={22} className="text-[#1F2937]" />
          )}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl px-5 py-4 flex flex-col gap-2">
          {[
            { label: "🏠 Beranda", href: "#hero" },
            { label: "🔍 Kosan", href: "#popular" },
            { label: "📋 Cara Pesan", href: "#how" },
            { label: "❤️ Favorit", href: "#" },
          ].map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="py-2.5 px-4 rounded-xl text-sm font-600 text-[#374151] hover:bg-[#ffeded] hover:text-[#FF6B6B] transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </a>
          ))}
          <a href="#popular" className="btn-primary mt-2 text-sm" id="nav-mobile-cta">
            Cari Kosan Sekarang
          </a>
        </div>
      )}
    </header>
  );
}
