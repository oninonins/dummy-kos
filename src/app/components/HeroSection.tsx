"use client";

import { useState } from "react";
import { Search, MapPin, Sparkles, ShieldCheck } from "lucide-react";

// Komponen HeroSection untuk landing page.

const POPULAR_SEARCHES = ["Depok", "Jogja", "Bandung", "Surabaya", "Malang"];

export default function HeroSection() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const popular = document.getElementById("popular");
    popular?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="hero"
      className="relative overflow-hidden min-h-screen flex items-center"
      style={{
        background:
          "linear-gradient(145deg, #fff5f5 0%, #fffbf5 40%, #f5f8ff 100%)",
      }}
    >
      {/* Decorative blobs */}
      <div
        className="hero-blob"
        style={{
          width: 600,
          height: 600,
          background: "#FF6B6B",
          top: -200,
          right: -150,
        }}
      />
      <div
        className="hero-blob"
        style={{
          width: 400,
          height: 400,
          background: "#FFB347",
          bottom: -100,
          left: -100,
        }}
      />
      <div
        className="hero-blob"
        style={{
          width: 300,
          height: 300,
          background: "#818CF8",
          top: "30%",
          left: "40%",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-5 pt-28 pb-20 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left column, Copy & Search */}
          <div>
            {/* Label pill */}
            <div className="flex items-center gap-2 mb-5">
              <span
                className="badge"
                style={{
                  background: "#ffeded",
                  color: "#FF6B6B",
                }}
              >
                <Sparkles size={12} />
                Platform Kos #1 Indonesia
              </span>
              <span
                className="badge"
                style={{
                  background: "#e8fdf0",
                  color: "#16a34a",
                }}
              >
                <ShieldCheck size={12} />
                Bayar Aman 
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-[2.8rem] md:text-[3.5rem] font-800 leading-[1.1] tracking-tight text-[#1F2937] mb-5">
              Selamat datang di{" "}
              <span
                className="relative"
                style={{
                  background:
                    "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                KosSolution
              </span>
              <br />
              Cari Kos Makin Gampang!{" "}
              <span className="inline-block animate-bounce">🎉</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg text-[#6B7280] leading-relaxed mb-8 max-w-lg">
              Cari kos, lihat foto, cek harga, dan pesan kamar dalam hitungan
              menit. Pembayaran 100% aman terverifikasi otomatis,
              kamarmu langsung dikunci! 🔒
            </p>

            {/* Search bar */}
            <form onSubmit={handleSearch} id="hero-search-form">
              <div className="search-bar">
                <MapPin size={18} className="text-[#FF6B6B] shrink-0" />
                <input
                  id="hero-search-input"
                  type="text"
                  placeholder="Cari kosan di kota atau area favoritmu..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                />
                <button
                  type="submit"
                  id="hero-search-btn"
                  className="btn-primary shrink-0 text-sm px-5 py-2.5"
                >
                  <Search size={16} />
                  Cari Kos
                </button>
              </div>
            </form>

            {/* Quick search pills */}
            <div className="flex flex-wrap items-center gap-2 mt-4">
              <span className="text-xs font-600 text-[#9CA3AF]">
                Populer:
              </span>
              {POPULAR_SEARCHES.map((city) => (
                <button
                  key={city}
                  id={`quick-search-${city.toLowerCase()}`}
                  onClick={() => {
                    setQuery(city);
                    document
                      .getElementById("popular")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-xs font-700 bg-white text-[#374151] border border-[#E5E7EB] rounded-full px-3 py-1.5 hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all"
                >
                  📍 {city}
                </button>
              ))}
            </div>

            {/* Social proof stats */}
            <div className="flex gap-8 mt-10 pt-8 border-t border-[#E5E7EB]">
              {[
                { number: "1.200+", label: "Kos tersedia" },
                { number: "15rb+", label: "Penghuni senang 😊" },
                { number: "50+", label: "Kota di Indonesia" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-800 text-[#1F2937]">
                    {stat.number}
                  </p>
                  <p className="text-xs font-600 text-[#9CA3AF] mt-0.5">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right column, floating card visuals */}
          <div className="hidden lg:block relative">
            <HeroVisualCards />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---- Decorative floating cards on the right of the hero ----
function HeroVisualCards() {
  return (
    <div className="relative h-[520px]">
      {/* Main large card */}
      <div
        className="absolute top-8 left-8 right-0 rounded-3xl overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.12)]"
        style={{ height: 340 }}
      >
        <div className="relative w-full h-full bg-gray-200">
          <img
            src="https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80"
            alt="Kos Mawar Indah"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/80 via-black/20 to-transparent">
            {/* Rating badge */}
            <div
              className="badge mb-3 self-start backdrop-blur-md"
              style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
            >
              ⭐ 4.9 · Super Popular
            </div>
            <h3 className="text-white text-xl font-800">Kos Mawar Indah</h3>
            <p className="text-white/80 text-sm mt-1">📍 Depok, Jawa Barat</p>
            <div className="flex items-baseline gap-1 mt-2">
              <span className="text-white text-2xl font-800">Rp 1,5jt</span>
              <span className="text-white/70 text-sm">/bulan</span>
            </div>
          </div>
        </div>
      </div>

      {/* Floating mini card di kanan atas */}
      <div
        className="absolute top-4 right-4 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4"
        style={{ minWidth: 180 }}
      >
        <div className="flex items-center gap-2 mb-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#FF6B6B] to-[#FF8E53] flex items-center justify-center">
            <span className="text-white text-sm">🏠</span>
          </div>
          <div>
            <p className="text-xs font-700 text-[#1F2937]">Baru dikunci!</p>
            <p className="text-[10px] text-[#9CA3AF]">2 menit lalu</p>
          </div>
        </div>
        <p className="text-xs text-[#6B7280]">
          Kamar A3 di{" "}
          <span className="font-700 text-[#1F2937]">Kos Melati</span> sudah
          dipesan! 🎉
        </p>
      </div>

      {/* Floating mini card di kiri bawah */}
      <div
        className="absolute bottom-8 left-0 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-4"
        style={{ minWidth: 200 }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <ShieldCheck size={14} className="text-[#16a34a]" />
          <span className="text-xs font-700 text-[#16a34a]">
            Pembayaran Aman
          </span>
        </div>
        <p className="text-[11px] text-[#6B7280] leading-relaxed">
          Transaksi terenkripsi & aman. Bebas pilih metode bayar, kamar
          langsung dikunci 30 menit! 🛡️
        </p>
        <div className="flex gap-2 mt-2 items-center">
          {/* Fake Midtrans logo pills */}
          {["QRIS", "GoPay", "OVO", "Transfer"].map((m) => (
            <span
              key={m}
              className="text-[9px] font-700 bg-gray-100 text-gray-500 rounded-full px-2 py-0.5"
            >
              {m}
            </span>
          ))}
        </div>
      </div>

      {/* Floating review mini card */}
      <div
        className="absolute bottom-32 right-4 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-3"
        style={{ minWidth: 160 }}
      >
        <div className="flex gap-0.5 mb-1">
          {"⭐⭐⭐⭐⭐".split("").map((s, i) => (
            <span key={i} className="text-xs">
              {s}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-[#374151] font-600">
          &ldquo;Tempatnya bersih banget, worth it!&rdquo;
        </p>
        <p className="text-[10px] text-[#9CA3AF] mt-1"> Rina, Mahasiswa UI</p>
      </div>
    </div>
  );
}
