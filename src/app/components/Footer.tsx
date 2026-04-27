"use client";

// ============================================================
// Footer.tsx, "use client" dibutuhkan karena:
//   1. onMouseEnter / onMouseLeave are DOM event handlers
//   2. new Date().getFullYear() can cause a hydration mismatch
//      (server renders at one second, client rehydrates at another).
//      We fix this by using useState + useEffect to set the year
//      only after hydration.
//
// Rule of thumb: if your component has ANY of these, it's a Client Component:
//   - Event handlers (onClick, onMouseEnter, onChange, ...)
//   - React hooks (useState, useEffect, useRef, ...)
//   - Browser-only APIs (window, document, localStorage, ...)
// ============================================================

import { useState, useEffect } from "react";
import { Home, Globe, MessageCircle, Mail, ShieldCheck, Heart } from "lucide-react";

// Data link sosial
// every render. The `color` will be applied via inline style on hover.
const SOCIAL_LINKS = [
  { Icon: Globe,         label: "Website",   color: "#6366F1" },
  { Icon: MessageCircle, label: "WhatsApp",  color: "#25D366" },
  { Icon: Mail,          label: "Email",     color: "#FF6B6B" },
] as const;

const NAV_LINKS = [
  { label: "🏠 Beranda",      href: "#hero"    },
  { label: "🔍 Cari Kosan",   href: "#popular" },
  { label: "📋 Cara Pesan",   href: "#how"     },
  { label: "❓ FAQ",           href: "#"        },
  { label: "📞 Hubungi Kami", href: "#"        },
] as const;

export default function Footer() {
  // ── Hydration-safe year ──────────────────────────────────────────────────
  // Problem: If we write `new Date().getFullYear()` directly in JSX, the
  // server me-render "2026" dan klien juga me-rehydrate "2026", biasanya aman.
  // BUT at exactly midnight on Jan 1st, the server might render "2025" while
  // the client renders "2026", causing React to throw a hydration warning.
  //
  // Fix: Start with `null` (server renders nothing), then set the real year
  // in useEffect (runs only on the client, after hydration is complete).
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer
      id="about"
      className="border-t"
      style={{ borderColor: "#F3F4F6", background: "#FAFAFA" }}
    >
      <div className="mx-auto max-w-7xl px-5 py-14">
        <div className="grid md:grid-cols-3 gap-10 mb-12">

          {/* ── Brand column ── */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53]">
                <Home size={17} className="text-white" />
              </div>
              <span className="text-lg font-800 text-[#1F2937]">
                Kos<span className="text-[#FF6B6B]">Solution</span>
              </span>
            </div>
            <p className="text-sm text-[#6B7280] leading-relaxed max-w-xs">
              Platform reservasi kos paling santai buat mahasiswa &amp; pelajar.
              Cari, pesan, dan check-in, semua dari HP! 📱
            </p>

            {/* Midtrans safety badge */}
            <div
              className="inline-flex items-center gap-2 mt-5 rounded-full px-4 py-2"
              style={{ background: "#f0fdf4", border: "1.5px solid #bbf7d0" }}
            >
              <ShieldCheck size={14} className="text-[#16a34a]" />
              <span className="text-xs font-700 text-[#16a34a]">
                Pembayaran Aman 
              </span>
            </div>
          </div>

          {/* ── Navigation column ── */}
          <div>
            <h4 className="text-sm font-800 text-[#1F2937] uppercase tracking-widest mb-4">
              Navigasi
            </h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-[#6B7280] hover:text-[#FF6B6B] transition-colors font-600"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Social & contact column ── */}
          <div>
            <h4 className="text-sm font-800 text-[#1F2937] uppercase tracking-widest mb-4">
              Ikuti Kami
            </h4>

            {/* Tombol ikon sosial */}
            <div className="flex gap-3 mb-5">
              {SOCIAL_LINKS.map(({ Icon, label, color }) => (
                <SocialIconButton
                  key={label}
                  Icon={Icon}
                  label={label}
                  color={color}
                />
              ))}
            </div>

            <div className="rounded-2xl p-4" style={{ background: "#fff5f5" }}>
              <p className="text-xs font-700 text-[#FF6B6B] mb-1">
                💌 Mau kolaborasi?
              </p>
              <p className="text-xs text-[#6B7280] leading-relaxed">
                Punya kos dan mau listing? Hubungi kami di{" "}
                <a
                  href="mailto:halo@kosolution.id"
                  className="font-700 text-[#FF6B6B] hover:underline"
                >
                  halo@kosolution.id
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* ── Bottom bar ── */}
        <div
          className="flex flex-col md:flex-row items-center justify-between pt-6 border-t gap-3"
          style={{ borderColor: "#E5E7EB" }}
        >
          <p className="text-xs text-[#9CA3AF] font-600">
            {/*
              Render a non-breaking space while `year` is null (server-side),
              then swap in the real year after hydration. This prevents both a
              hydration mismatch AND a layout shift.
            */}
            © {year ?? "\u00A0\u00A0\u00A0\u00A0"} KosSolution, Dibuat dengan{" "}
            <Heart
              size={10}
              className="inline text-[#FF6B6B] fill-[#FF6B6B]"
            />{" "}
            untuk mahasiswa Indonesia
          </p>
          <p className="text-xs text-[#9CA3AF] font-600">
            Demo · Next.js 16 · Prisma · Midtrans Sandbox
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── SocialIconButton ─────────────────────────────────────────────────────────
// SocialIconButton
// Uses React state for hover effects to handle dynamic colors.
//
// Why not use pure CSS :hover?
// Because the border color is a dynamic value. We cannot write
// static Tailwind classes for arbitrary hex values. So we use JS state to toggle inline styles.

interface SocialIconButtonProps {
  Icon: React.ElementType;
  label: string;
  color: string;
}

function SocialIconButton({ Icon, label, color }: SocialIconButtonProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <a
      href="#"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-xl border transition-all hover:scale-110"
      style={{
        borderColor: hovered ? color : "#E5E7EB",
        background: "#fff",
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Icon size={16} style={{ color }} />
    </a>
  );
}
