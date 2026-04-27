// ============================================================
//
// The CSS-only hover effect (group-hover:-translate-y-1, group-hover:scale-110)
// is handled entirely by Tailwind + CSS, not JavaScript.
// ============================================================

import { Search, CreditCard, KeyRound, PartyPopper } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    color: "#FF6B6B",
    bg: "#ffeded",
    number: "01",
    title: "Cari Kosan",
    desc: "Browsing kosan di kotamu. Filter harga, lokasi, dan fasilitas sesuai budget kamu.",
  },
  {
    icon: CreditCard,
    color: "#7C3AED",
    bg: "#ede9fe",
    number: "02",
    title: "Pilih & Deposit",
    desc: "Suka? Langsung bayar deposit. Aman, cepat, dan banyak pilihan bayar!",
  },
  {
    icon: KeyRound,
    color: "#0891B2",
    bg: "#e0f2fe",
    number: "03",
    title: "Kamar Di-hold",
    desc: "Kamarmu langsung dikunci 30 menit. Tenang, nggak bakal ada yang ambil dulu!",
  },
  {
    icon: PartyPopper,
    color: "#16a34a",
    bg: "#f0fdf4",
    number: "04",
    title: "Check-in! 🎉",
    desc: "Selesaikan pembayaran dan langsung check-in. Selamat di kosan baru!",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="py-20 px-5"
      style={{ background: "linear-gradient(180deg, #FAFAFA 0%, #fff 100%)" }}
    >
      <div className="mx-auto max-w-7xl">
        {/* Heading */}
        <div className="text-center mb-14">
          <span className="section-label">Cara Pesan</span>
          <h2 className="text-3xl md:text-4xl font-800 text-[#1F2937] tracking-tight">
            Mudah banget, cuma{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #FF6B6B, #FF8E53)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              4 langkah!
            </span>
          </h2>
          <p className="mt-3 text-[#6B7280] text-base max-w-md mx-auto leading-relaxed">
            Dari cari sampai check-in, semua bisa dilakukan lewat HP kamu. No
            ribet, no antri!
          </p>
        </div>

        {/* Steps grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                id={`how-step-${i + 1}`}
                className="relative group"
              >
                {/* Connector line (hidden on last) */}
                {i < STEPS.length - 1 && (
                  <div
                    className="hidden lg:block absolute top-10 left-[calc(100%-12px)] w-6 border-t-2 border-dashed z-10"
                    style={{ borderColor: "#E5E7EB" }}
                  />
                )}

                <div
                  className="rounded-3xl p-6 h-full transition-all duration-300 group-hover:-translate-y-1"
                  style={{
                    background: "#ffffff",
                    boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
                    border: `2px solid ${step.bg}`,
                  }}
                >
                  {/* Icon */}
                  <div
                    className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: step.bg }}
                  >
                    <Icon size={26} style={{ color: step.color }} />
                  </div>

                  {/* Step number */}
                  <p
                    className="text-xs font-800 uppercase tracking-widest mb-2"
                    style={{ color: step.color }}
                  >
                    Langkah {step.number}
                  </p>

                  {/* Title & description */}
                  <h3 className="text-lg font-800 text-[#1F2937] mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
