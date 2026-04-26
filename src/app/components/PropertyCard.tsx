"use client";

import { Star, MapPin, Wifi, AirVent, ShowerHead, ChevronRight } from "lucide-react";
import { RoomStatus } from "@prisma/client";

// ============================================================
// PropertyCard — Visual-first, image 70%, Gen-Z friendly
// ============================================================

interface PropertyCardProps {
  room: {
    id: string;
    roomNumber: string;
    description: string | null;
    price: number;
    depositAmount: number;
    status: RoomStatus;
    property: {
      id: string;
      name: string;
      address: string;
      city: string;
      imageUrl: string | null;
    };
  };
  index?: number;
}

// Gradient palettes for cards without real images
const CARD_GRADIENTS = [
  "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
  "linear-gradient(135deg, #667EEA 0%, #764BA2 100%)",
  "linear-gradient(135deg, #11998E 0%, #38EF7D 100%)",
  "linear-gradient(135deg, #F7971E 0%, #FFD200 100%)",
  "linear-gradient(135deg, #FC5C7D 0%, #6A82FB 100%)",
  "linear-gradient(135deg, #4CA1AF 0%, #C4E0E5 100%)",
];

// Fake amenity icons per card (cycled by index)
const AMENITY_SETS = [
  [Wifi, AirVent, ShowerHead],
  [Wifi, ShowerHead],
  [AirVent, ShowerHead],
  [Wifi, AirVent],
];

// Fake ratings (demo data, cycled by index)
const RATINGS = [4.9, 4.8, 4.7, 4.6, 4.8, 4.9];

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

function StatusBadge({ status }: { status: RoomStatus }) {
  if (status === RoomStatus.AVAILABLE) {
    return (
      <span className="badge status-available">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
        Tersedia
      </span>
    );
  }
  if (status === RoomStatus.ON_HOLD) {
    return (
      <span className="badge status-hold">
        🔒 Di-hold
      </span>
    );
  }
  return (
    <span className="badge status-booked">
      ✅ Sudah penuh
    </span>
  );
}

export default function PropertyCard({ room, index = 0 }: PropertyCardProps) {
  const gradient = CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  const AmenityIcons = AMENITY_SETS[index % AMENITY_SETS.length];
  const rating = RATINGS[index % RATINGS.length];
  const isAvailable = room.status === RoomStatus.AVAILABLE;

  return (
    <article
      className="kos-card group"
      id={`kos-card-${room.id}`}
      aria-label={`Kamar ${room.roomNumber} di ${room.property.name}`}
    >
      {/* ── Image area (70% of card visually) ── */}
      <div className="relative h-[220px] overflow-hidden">
        {room.property.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={room.property.imageUrl}
            alt={`Foto ${room.property.name}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="w-full h-full flex items-end"
            style={{ background: gradient }}
          >
            {/* Decorative emoji overlay */}
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <span className="text-[120px] select-none">🏠</span>
            </div>
          </div>
        )}

        {/* Dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

        {/* Rating badge — top left */}
        <div className="absolute top-3 left-3">
          <span
            className="badge"
            style={{
              background: "rgba(255,255,255,0.92)",
              color: "#1F2937",
              backdropFilter: "blur(8px)",
            }}
          >
            <Star size={11} fill="#F59E0B" className="text-amber-400" />
            {rating}
          </span>
        </div>

        {/* Status badge — top right */}
        <div className="absolute top-3 right-3">
          <StatusBadge status={room.status} />
        </div>

        {/* Amenity icons — bottom left */}
        <div className="absolute bottom-3 left-3 flex gap-1.5">
          {AmenityIcons.map((Icon, i) => (
            <span
              key={i}
              className="flex h-7 w-7 items-center justify-center rounded-full"
              style={{
                background: "rgba(255,255,255,0.2)",
                backdropFilter: "blur(8px)",
              }}
            >
              <Icon size={13} className="text-white" />
            </span>
          ))}
        </div>
      </div>

      {/* ── Card body ── */}
      <div className="p-5">
        {/* Property name & location */}
        <div className="mb-3">
          <h3 className="text-[15px] font-800 text-[#1F2937] truncate">
            {room.property.name} — Kamar {room.roomNumber}
          </h3>
          <p className="flex items-center gap-1 text-xs font-600 text-[#9CA3AF] mt-0.5">
            <MapPin size={11} className="text-[#FF6B6B] shrink-0" />
            {room.property.city}
            {room.property.address ? `, ${room.property.address}` : ""}
          </p>
          {room.description && (
            <p className="text-xs text-[#6B7280] mt-1.5 line-clamp-2 leading-relaxed">
              {room.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-1.5 mb-4">
          <span className="text-2xl font-800 text-[#FF6B6B]">
            {formatRupiah(room.price)}
          </span>
          <span className="text-xs font-600 text-[#9CA3AF]">/bulan</span>
        </div>

        {/* CTA button */}
        {isAvailable ? (
          <a
            href={`#booking-${room.id}`}
            id={`btn-lihat-${room.id}`}
            className="btn-primary w-full text-sm"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById(`booking-${room.id}`)
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Lihat Detail & Pesan
            <ChevronRight size={16} />
          </a>
        ) : (
          <div className="w-full flex items-center justify-center gap-2 rounded-full border-2 border-[#E5E7EB] py-3 text-sm font-700 text-[#9CA3AF] cursor-not-allowed">
            {room.status === RoomStatus.ON_HOLD ? "🔒 Sedang di-hold" : "✅ Kamar Penuh"}
          </div>
        )}

        {/* Deposit info */}
        {isAvailable && (
          <p className="text-center text-[10px] text-[#9CA3AF] mt-2.5 font-600">
            Deposit hold: {formatRupiah(room.depositAmount)} · 30 menit
          </p>
        )}
      </div>
    </article>
  );
}
