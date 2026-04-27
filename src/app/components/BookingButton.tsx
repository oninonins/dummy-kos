"use client";

import { useState } from "react";
import { CreditCard, CheckCircle2, Clock, XCircle, Loader2, ShieldCheck } from "lucide-react";

// Komponen BookingButton
// 1. Calls POST /api/booking to get a Snap token
// 2. Opens Midtrans Snap popup for payment
// ============================================================

declare global {
  interface Window {
    snap: {
      pay: (
        token: string,
        options: {
          onSuccess?: (result: Record<string, unknown>) => void;
          onPending?: (result: Record<string, unknown>) => void;
          onError?: (result: Record<string, unknown>) => void;
          onClose?: () => void;
        }
      ) => void;
    };
  }
}

interface BookingButtonProps {
  roomId: string;
  userId: string;
  depositAmount: number;
  roomNumber: string;
  propertyName: string;
}

type BookingStatus = "idle" | "loading" | "success" | "pending" | "error" | "closed";

function formatRupiah(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
}

const STATUS_CONFIG: Record<
  BookingStatus,
  { bg: string; border: string; text: string; emoji: string; label: string }
> = {
  idle: { bg: "", border: "", text: "", emoji: "", label: "" },
  loading: {
    bg: "#eff6ff",
    border: "#bfdbfe",
    text: "#2563eb",
    emoji: "⏳",
    label: "Memproses reservasi...",
  },
  success: {
    bg: "#f0fdf4",
    border: "#bbf7d0",
    text: "#16a34a",
    emoji: "🎉",
    label: "Yeay! Kamar berhasil di-booking!",
  },
  pending: {
    bg: "#fffbeb",
    border: "#fde68a",
    text: "#d97706",
    emoji: "⏰",
    label: "Menunggu pembayaran. Selesaikan ya!",
  },
  error: {
    bg: "#fff5f5",
    border: "#fecaca",
    text: "#dc2626",
    emoji: "😢",
    label: "Waduh, ada yang salah nih.",
  },
  closed: {
    bg: "#f9fafb",
    border: "#e5e7eb",
    text: "#6b7280",
    emoji: "💭",
    label: "Popup ditutup. Mau lanjut bayar?",
  },
};

export default function BookingButton({
  roomId,
  userId,
  depositAmount,
  roomNumber,
  propertyName,
}: BookingButtonProps) {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<BookingStatus>("idle");
  const [message, setMessage] = useState("");

  const handleBooking = async () => {
    setLoading(true);
    setStatus("loading");
    setMessage("");

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId, userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Gagal membuat reservasi");
      }

      if (window.snap) {
        window.snap.pay(data.data.snapToken, {
          onSuccess: (result) => {
            console.log("Payment success:", result);
            setStatus("success");
            setMessage("Pembayaran berhasil! Kamar sudah jadi milik kamu!");
          },
          onPending: (result) => {
            console.log("Payment pending:", result);
            setStatus("pending");
            setMessage("Pembayaran sedang diproses. Kamar di-hold 30 menit!");
          },
          onError: (result) => {
            console.error("Payment error:", result);
            setStatus("error");
            setMessage("Pembayaran gagal. Tenang, coba lagi ya!");
          },
          onClose: () => {
            console.log("Payment popup closed");
            setStatus("closed");
            setMessage("Kamu menutup popup. Kamar masih di-hold, lanjut bayar?");
          },
        });
      } else {
        throw new Error("Midtrans Snap belum siap. Coba refresh dulu ya!");
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
      setStatus("error");
      setMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const cfg = STATUS_CONFIG[status];
  const isBooked = status === "success";

  return (
    <div
      id={`booking-${roomId}`}
      className="rounded-3xl border-2 p-6 transition-all duration-300"
      style={{
        background: "#ffffff",
        borderColor: "#F3F4F6",
        boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
      }}
    >
      {/* Room info */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p
            className="text-xs font-700 uppercase tracking-widest mb-1"
            style={{ color: "#FF6B6B" }}
          >
            {propertyName}
          </p>
          <h3 className="text-xl font-800 text-[#1F2937]">
            Kamar {roomNumber}
          </h3>
        </div>
        <div
          className="badge"
          style={{ background: "#f0fdf4", color: "#16a34a" }}
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#16a34a]" />
          Tersedia
        </div>
      </div>

      {/* Deposit box */}
      <div
        className="rounded-2xl p-4 mb-5"
        style={{
          background: "linear-gradient(135deg, #fff5f5 0%, #ffede8 100%)",
          border: "1.5px dashed #FECACA",
        }}
      >
        <div className="flex items-center gap-2 mb-1">
          <CreditCard size={14} style={{ color: "#FF6B6B" }} />
          <p className="text-xs font-700 uppercase tracking-wider text-[#9CA3AF]">
            Deposit Hold
          </p>
        </div>
        <p className="text-3xl font-800 text-[#1F2937]">
          {formatRupiah(depositAmount)}
        </p>
        <p className="text-xs text-[#9CA3AF] mt-1 font-600">
          Kamar dikunci selama{" "}
          <span className="font-700 text-[#FF6B6B]">30 menit</span> setelah
          pesan. Aman! 🔒
        </p>
      </div>

      {/* Midtrans payment badge */}
      <div
        className="flex items-center gap-2 rounded-2xl px-4 py-3 mb-5"
        style={{ background: "#f0fdf4" }}
      >
        <ShieldCheck size={16} className="text-[#16a34a] shrink-0" />
        <div>
          <p className="text-xs font-700 text-[#16a34a]">Pembayaran Aman</p>
          <p className="text-[10px] text-[#6B7280]">
            Diproses dengan QRIS, GoPay, OVO, Transfer
            Bank
          </p>
        </div>
      </div>

      {/* Status message */}
      {status !== "idle" && (
        <div
          className="rounded-2xl border px-4 py-3 mb-4 flex items-start gap-2"
          style={{
            background: cfg.bg,
            borderColor: cfg.border,
          }}
        >
          <span className="text-lg leading-tight">{cfg.emoji}</span>
          <div>
            <p className="text-sm font-700" style={{ color: cfg.text }}>
              {STATUS_CONFIG[status].label}
            </p>
            {message && message !== STATUS_CONFIG[status].label && (
              <p className="text-xs mt-0.5" style={{ color: cfg.text, opacity: 0.8 }}>
                {message}
              </p>
            )}
          </div>
          {status === "success" && (
            <CheckCircle2 size={18} className="ml-auto shrink-0 text-[#16a34a]" />
          )}
          {status === "pending" && (
            <Clock size={18} className="ml-auto shrink-0 text-[#d97706]" />
          )}
          {status === "error" && (
            <XCircle size={18} className="ml-auto shrink-0 text-[#dc2626]" />
          )}
        </div>
      )}

      {/* CTA button */}
      <button
        id={`booking-btn-${roomId}`}
        onClick={handleBooking}
        disabled={loading || isBooked}
        className={`w-full flex items-center justify-center gap-2 rounded-full py-4 text-base font-800 transition-all duration-300 ${
          isBooked
            ? "cursor-not-allowed"
            : loading
            ? "cursor-wait"
            : "btn-primary"
        }`}
        style={
          isBooked
            ? { background: "#f0fdf4", color: "#16a34a" }
            : loading
            ? {
                background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                color: "#fff",
                opacity: 0.7,
              }
            : undefined
        }
      >
        {loading && <Loader2 size={18} className="animate-spin" />}
        {isBooked
          ? "✓ Kamar Sudah Kamu Booking!"
          : loading
          ? "Memproses..."
          : "Pesan Kamar Sekarang 🚀"}
      </button>

      {/* Fine print */}
      {!isBooked && (
        <p className="text-center text-[10px] text-[#9CA3AF] mt-3 font-600 leading-relaxed">
          Dengan menekan tombol ini, kamu setuju dengan{" "}
          <span className="underline cursor-pointer hover:text-[#FF6B6B]">
            syarat & ketentuan
          </span>{" "}
          kami.
        </p>
      )}
    </div>
  );
}
