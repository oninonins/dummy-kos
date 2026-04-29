import { prisma } from "@/lib/prisma";
import { RoomStatus } from "@prisma/client";
import Script from "next/script";
import Navbar from "@/app/components/Navbar";
import HeroSection from "@/app/components/HeroSection";
import PropertyCard from "@/app/components/PropertyCard";
import BookingButton from "@/app/components/BookingButton";
import HowItWorks from "@/app/components/HowItWorks";
import Footer from "@/app/components/Footer";
import { MapPin, SlidersHorizontal, TrendingUp, ShieldCheck } from "lucide-react";

// ============================================================
// Halaman Utama
// Server Component: mengambil data kamar dari DB dan me-render UI
// ============================================================

// Mock user ID for demo purposes
// In production, this would come from auth session (e.g. NextAuth, Clerk)
const DEMO_USER_ID = "demo-user-id";

export default async function HomePage() {
  let rooms: Awaited<ReturnType<typeof fetchRooms>> = [];
  let error = "";

  try {
    rooms = await fetchRooms();
  } catch {
    error = "Tidak dapat memuat data kamar. Pastikan database sudah berjalan.";
  }

  const availableCount = rooms.filter((r) => r.status === RoomStatus.AVAILABLE).length;

  return (
    <>
      {/* Midtrans Snap.js SDK */}
      <Script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        strategy="afterInteractive"
      />

      {/* Navigasi */}
      <Navbar />

      {/* Hero */}
      <HeroSection />

      {/* Bagian Kosan Populer */}
      <section id="popular" className="py-20 px-5" style={{ background: "#FAFAFA" }}>
        <div className="mx-auto max-w-7xl">
          {/* Section header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
            <div>
              <span className="section-label">
                <TrendingUp
                  size={12}
                  className="inline mr-1"
                  style={{ color: "#FF6B6B" }}
                />
                Kosan Populer
              </span>
              <h2 className="text-3xl md:text-4xl font-800 text-[#1F2937] tracking-tight">
                Pilihan Kosan{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Terbaik
                </span>{" "}
                🏠
              </h2>
              <p className="mt-2 text-[#6B7280] text-sm max-w-md">
                Direkomendasikan berdasarkan rating, fasilitas, dan
                kepopulerannya. Semua udah diverifikasi!
              </p>
            </div>

            {/* Stats & filter row */}
            <div className="flex items-center gap-3 shrink-0">
              {availableCount > 0 && (
                <div
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-xs font-700"
                  style={{ background: "#f0fdf4", color: "#16a34a" }}
                >
                  <span className="h-2 w-2 rounded-full bg-[#16a34a] animate-pulse" />
                  {availableCount} kamar tersedia
                </div>
              )}
              <button
                id="btn-filter"
                className="flex items-center gap-2 rounded-full border-2 border-[#E5E7EB] bg-white px-4 py-2 text-xs font-700 text-[#6B7280] hover:border-[#FF6B6B] hover:text-[#FF6B6B] transition-all"
              >
                <SlidersHorizontal size={13} />
                Filter
              </button>
            </div>
          </div>

          {/* Error state */}
          {error ? (
            <div
              className="rounded-3xl p-10 text-center"
              style={{
                background: "#fff5f5",
                border: "2px dashed #FECACA",
              }}
            >
              <p className="text-4xl mb-4"></p>
              <p className="text-lg font-800 text-[#FF6B6B] mb-2">
              </p>
              <p className="text-sm text-[#6B7280] mb-4">
                {error}
              </p>
              <code
                className="block text-xs p-4 rounded-2xl text-left max-w-sm mx-auto font-mono text-[#374151]"
                style={{ background: "#F9FAFB", border: "1px solid #E5E7EB" }}
              >
             
              </code>
            </div>
          ) : rooms.length === 0 ? (
            /* Empty state */
            <div
              className="rounded-3xl p-14 text-center"
              style={{
                background: "#fff",
                border: "2px dashed #E5E7EB",
                boxShadow: "0 4px 24px rgba(0,0,0,0.04)",
              }}
            >
              <p className="text-5xl mb-4">🏚️</p>
              <p className="text-xl font-800 text-[#1F2937] mb-2">
                Belum ada kosan nih...
              </p>
              <p className="text-sm text-[#6B7280] mb-4">
                Jalankan seed dulu ya biar ada datanya!
              </p>
              <code
                className="inline-block text-xs px-4 py-2 rounded-full font-mono text-[#FF6B6B]"
                style={{ background: "#ffeded" }}
              >
                npx prisma db seed
              </code>
            </div>
          ) : (
            /* Kos grid */
            <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room, index) => (
                <PropertyCard key={room.id} room={room} index={index} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bagian Booking */}
      {rooms.some((r) => r.status === RoomStatus.AVAILABLE) && (
        <section
          className="py-20 px-5"
          style={{
            background: "linear-gradient(180deg, #fff5f5 0%, #FAFAFA 100%)",
          }}
        >
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-12">
              <span className="section-label">Pesan Sekarang</span>
              <h2 className="text-3xl md:text-4xl font-800 text-[#1F2937] tracking-tight mt-1">
                Kamar yang Bisa Kamu{" "}
                <span
                  style={{
                    background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Booking Hari Ini
                </span>{" "}
                🎯
              </h2>
              <p className="mt-2 text-[#6B7280] text-sm max-w-md mx-auto">
                Bayar deposit dan kamarmu langsung dikunci 30
                menit. Aman & terpercaya!
              </p>
              {/* Midtrans global badge */}
              <div
                className="inline-flex items-center gap-2 mt-4 rounded-full px-5 py-2.5"
                style={{
                  background: "#f0fdf4",
                  border: "1.5px solid #bbf7d0",
                }}
              >
                <ShieldCheck size={15} className="text-[#16a34a]" />
                <span className="text-xs font-700 text-[#16a34a]">
                  Semua pembayaran diproses aman
                </span>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rooms
                .filter((r) => r.status === RoomStatus.AVAILABLE)
                .map((room) => (
                  <div key={room.id}>
                    {/* Location hint */}
                    <div className="flex items-center gap-1.5 mb-3 px-1">
                      <MapPin size={12} style={{ color: "#FF6B6B" }} />
                      <span className="text-xs font-700 text-[#9CA3AF]">
                        {room.property.city} · {room.property.name}
                      </span>
                    </div>
                    <BookingButton
                      roomId={room.id}
                      userId={DEMO_USER_ID}
                      depositAmount={room.depositAmount}
                      roomNumber={room.roomNumber}
                      propertyName={room.property.name}
                    />
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

      {/* Cara Kerja */}
      <HowItWorks />

      {/* Footer */}
      <Footer />
    </>
  );
}

// ============================================================
// Mengambil Data
// ============================================================

async function fetchRooms() {
  return prisma.room.findMany({
    include: { property: true },
    orderBy: [{ status: "asc" }, { roomNumber: "asc" }],
  });
}
