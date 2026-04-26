# NV Kos — Setup Guide (Windows PowerShell)

Panduan langkah demi langkah untuk menjalankan project ini di Windows.

## Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop/)
- PowerShell / CMD

---

## Langkah 1: Start PostgreSQL via Docker

```powershell
# Pastikan Docker Desktop sudah running, lalu:
docker-compose up -d
```

Verifikasi container berjalan:
```powershell
docker ps
# Harus terlihat container "nvkos-postgres" dengan status "healthy"
```

---

## Langkah 2: Setup Environment Variables

```powershell
# Copy file .env.example ke .env (jika belum ada)
Copy-Item .env.example .env
```

Edit `.env` dan ganti Midtrans keys dengan keys dari [Midtrans Dashboard](https://dashboard.midtrans.com):
```
MIDTRANS_SERVER_KEY="SB-Mid-server-YOUR_KEY"
MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_KEY"
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY="SB-Mid-client-YOUR_KEY"
```

---

## Langkah 3: Install Dependencies

```powershell
npm install
```

---

## Langkah 4: Generate Prisma Client & Push Schema

```powershell
# Generate Prisma client (membuat types berdasarkan schema)
npx prisma generate

# Push schema ke database (membuat tabel)
npx prisma db push
```

---

## Langkah 5: Seed Database (Data Demo)

```powershell
npx prisma db seed
```

Ini akan membuat:
- 1 user tenant (Budi Santoso)
- 1 user owner (Ibu Sari)
- 1 property (Kos Melati Indah)
- 6 kamar dengan harga berbeda

---

## Langkah 6: Jalankan Dev Server

```powershell
npm run dev
```

Buka browser: **http://localhost:3000**

---

## (Optional) Explore Database

```powershell
npx prisma studio
```

Buka browser: **http://localhost:5555** — GUI untuk melihat dan edit data langsung.

---

## Troubleshooting

| Masalah | Solusi |
|---|---|
| `npx` tidak bisa dijalankan | Jalankan: `Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy Bypass` |
| Docker error | Pastikan Docker Desktop running dan WSL 2 backend enabled |
| Port 5432 sudah dipakai | Stop service PostgreSQL lokal atau ubah port di `docker-compose.yml` |
| Midtrans Snap tidak muncul | Pastikan `NEXT_PUBLIC_MIDTRANS_CLIENT_KEY` sudah benar di `.env` |
