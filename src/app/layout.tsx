import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KosSolution: Cari Kosan Nyaman, Mudah & Aman 🏠",
  description:
    "Temukan kosan impianmu dengan mudah! Pesan kamar kos secara online, bayar deposit lewat Midtrans, dan kunci kamarmu dalam 30 menit.",
  keywords: ["kos", "kosan", "sewa kamar", "kos mahasiswa", "kos pelajar"],
  authors: [{ name: "KosSolution Team" }],
  openGraph: {
    title: "KosSolution: Cari Kosan Nyaman",
    description: "Platform reservasi kos modern untuk mahasiswa & pelajar.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
