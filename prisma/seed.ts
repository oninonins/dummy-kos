import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

// Seed needs dotenv for standalone execution
import "dotenv/config";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Re-import enums locally to avoid import issues in seed context
const UserRole = { TENANT: "TENANT" as const, OWNER: "OWNER" as const };
const RoomStatus = {
    AVAILABLE: "AVAILABLE" as const,
    ON_HOLD: "ON_HOLD" as const,
    BOOKED: "BOOKED" as const,
};

async function main() {
    console.log("🌱 Seeding database for KosSolution...\n");

    // Clean existing data to avoid unique constraint errors during multiple runs
    await prisma.reservation.deleteMany();
    await prisma.room.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();

    // 1. Create a Realistic Admin/Owner User
    const owner = await prisma.user.create({
        data: {
            id: "admin-owner-id",
            name: "Bapak Surya (Admin)",
            email: "surya@kossolution.id",
            phone: "081234567890",
            role: UserRole.OWNER,
        },
    });
    console.log(`✅ Created owner: ${owner.name}`);

    // Create a demo tenant user for testing bookings later
    const tenant = await prisma.user.create({
        data: {
            id: "demo-user-id",
            name: "Mahasiswa Tester",
            email: "mahasiswa@example.com",
            phone: "089876543210",
            role: UserRole.TENANT,
        },
    });
    console.log(`✅ Created demo tenant: ${tenant.name}\n`);

    // 2. Create 3 Distinct Properties (Malang Locations)
    const propertiesData = [
        {
            name: "KosSolution Suhat Premium",
            address: "Jl. Soekarno Hatta No. 45, Jatimulyo",
            city: "Malang",
            imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
            ownerId: owner.id,
            rooms: [
                {
                    roomNumber: "S-101",
                    type: "Kamar VIP",
                    description: "Kamar luas dengan jendela besar, AC dingin, Smart TV 32 inch, meja belajar ergonomis, lemari pakaian besar, dan kamar mandi dalam dengan water heater. Free WiFi 100Mbps.",
                    price: 2000000,
                    depositAmount: 500000,
                    status: RoomStatus.AVAILABLE,
                },
                {
                    roomNumber: "S-102",
                    type: "Kamar Standard",
                    description: "Kamar nyaman dengan AC, kasur springbed ukuran single, meja belajar, kursi, lemari pakaian, dan kamar mandi dalam. Free WiFi.",
                    price: 1500000,
                    depositAmount: 400000,
                    status: RoomStatus.AVAILABLE,
                },
                {
                    roomNumber: "S-201",
                    type: "Kamar Standard",
                    description: "Kamar di lantai 2 dengan balkon mini. Fasilitas lengkap: AC, kasur single, meja belajar, lemari, kamar mandi dalam. Free WiFi.",
                    price: 1600000,
                    depositAmount: 400000,
                    status: RoomStatus.AVAILABLE,
                }
            ]
        },
        {
            name: "KosSolution Sigura-gura Asri",
            address: "Jl. Sigura-gura Barat No. 12, Karangbesuki",
            city: "Malang",
            imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
            ownerId: owner.id,
            rooms: [
                {
                    roomNumber: "A-01",
                    type: "Kamar Standard",
                    description: "Kosan nyaman lingkungan tenang. Fasilitas: Kipas Angin, Kasur, Lemari, Meja, Kamar mandi luar (sharing). Dapur bersama dan parkir motor luas.",
                    price: 800000,
                    depositAmount: 200000,
                    status: RoomStatus.AVAILABLE,
                },
                {
                    roomNumber: "A-02",
                    type: "Kamar Deluxe",
                    description: "Kamar agak luas. Fasilitas: AC, Kasur, Lemari, Meja, Kamar mandi luar. Akses 24 jam dengan kunci gerbang sendiri.",
                    price: 1100000,
                    depositAmount: 300000,
                    status: RoomStatus.AVAILABLE,
                }
            ]
        },
        {
            name: "KosSolution Dinoyo Executive",
            address: "Jl. MT. Haryono No. 189, Dinoyo",
            city: "Malang",
            imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
            ownerId: owner.id,
            rooms: [
                {
                    roomNumber: "V-01",
                    type: "Kamar VIP",
                    description: "Eksklusif dan strategis dekat kampus UB & UMM. Fasilitas Sultan: AC, Smart TV 43\", Bed Queen Size, Kulkas Mini, Kamar Mandi Dalam (Water Heater). Free Laundry 10kg/bulan.",
                    price: 2500000,
                    depositAmount: 800000,
                    status: RoomStatus.AVAILABLE,
                },
                {
                    roomNumber: "V-02",
                    type: "Kamar VIP",
                    description: "Kamar eksklusif dengan view kota. Fasilitas: AC, TV, Bed Queen Size, Lemari Custom, Kamar Mandi Dalam. Cocok untuk profesional atau mahasiswa eksekutif.",
                    price: 2400000,
                    depositAmount: 800000,
                    status: RoomStatus.AVAILABLE,
                },
                {
                    roomNumber: "D-01",
                    type: "Kamar Deluxe",
                    description: "Nyaman dan bersih. Fasilitas: AC, Kasur Single, Meja, Lemari, Kamar Mandi Dalam. Free WiFi kencang 24/7.",
                    price: 1800000,
                    depositAmount: 500000,
                    status: RoomStatus.ON_HOLD, // Intentionally put one on hold to show UI states
                }
            ]
        }
    ];

    for (const propData of propertiesData) {
        // Extract rooms array to create separately
        const { rooms, ...propertyDetails } = propData;

        // Create Property
        const property = await prisma.property.create({
            data: propertyDetails
        });
        console.log(`🏢 Created property: ${property.name}`);

        // Create Rooms for this Property
        for (const roomData of rooms) {
            const room = await prisma.room.create({
                data: {
                    ...roomData,
                    propertyId: property.id
                }
            });
            console.log(`  🛏️  Room ${room.roomNumber} (${room.type}) — Rp ${room.price.toLocaleString("id-ID")} ${room.status === 'ON_HOLD' ? '[ON HOLD]' : ''}`);
        }
        console.log(""); // Empty line for readability
    }

    console.log("✨ Seeding complete! Database is populated with realistic KosSolution data.");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
