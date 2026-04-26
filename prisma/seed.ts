import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcryptjs from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const RoomStatus = {
    AVAILABLE: "AVAILABLE" as const,
    ON_HOLD: "ON_HOLD" as const,
    BOOKED: "BOOKED" as const,
};

async function main() {
    console.log("🌱 Seeding database for KosSolution (with Admin Role)...\n");

    await prisma.reservation.deleteMany();
    await prisma.room.deleteMany();
    await prisma.property.deleteMany();
    await prisma.user.deleteMany();

    const hashedAdminPassword = await bcryptjs.hash("admin123", 10);
    const hashedTenantPassword = await bcryptjs.hash("tenant123", 10);

    // 1. Create a Realistic Admin User (Must be first)
    const admin = await prisma.user.create({
        data: {
            id: "admin-owner-id",
            name: "Bapak Surya (Admin)",
            email: "admin@kossolution.id",
            password: hashedAdminPassword,
            phone: "081234567890",
            role: "ADMIN",
        },
    });
    console.log(`✅ Created ADMIN user: ${admin.email} (password: admin123)`);

    // Create a demo tenant user
    const tenant = await prisma.user.create({
        data: {
            id: "demo-user-id",
            name: "Mahasiswa Tester",
            email: "mahasiswa@example.com",
            password: hashedTenantPassword,
            phone: "089876543210",
            role: "USER",
        },
    });
    console.log(`✅ Created USER tenant: ${tenant.email} (password: tenant123)\n`);

    // 2. Create 3 Distinct Properties (Malang Locations)
    const propertiesData = [
        {
            name: "KosSolution Suhat Premium",
            address: "Jl. Soekarno Hatta No. 45, Jatimulyo",
            city: "Malang",
            imageUrl: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&w=800&q=80",
            ownerId: admin.id,
            rooms: [
                {
                    roomNumber: "S-101",
                    type: "Kamar VIP",
                    description: "Kamar luas dengan jendela besar, AC dingin, Smart TV 32 inch, meja belajar ergonomis, lemari pakaian besar, dan kamar mandi dalam dengan water heater.",
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
                }
            ]
        },
        {
            name: "KosSolution Sigura-gura Asri",
            address: "Jl. Sigura-gura Barat No. 12, Karangbesuki",
            city: "Malang",
            imageUrl: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80",
            ownerId: admin.id,
            rooms: [
                {
                    roomNumber: "A-01",
                    type: "Kamar Standard",
                    description: "Kosan nyaman lingkungan tenang. Fasilitas: Kipas Angin, Kasur, Lemari, Meja, Kamar mandi luar (sharing).",
                    price: 800000,
                    depositAmount: 200000,
                    status: RoomStatus.AVAILABLE,
                }
            ]
        },
        {
            name: "KosSolution Dinoyo Executive",
            address: "Jl. MT. Haryono No. 189, Dinoyo",
            city: "Malang",
            imageUrl: "https://images.unsplash.com/photo-1554995207-c18c203602cb?auto=format&fit=crop&w=800&q=80",
            ownerId: admin.id,
            rooms: [
                {
                    roomNumber: "V-01",
                    type: "Kamar VIP",
                    description: "Eksklusif dan strategis dekat kampus UB & UMM. Fasilitas Sultan: AC, Smart TV 43\", Bed Queen Size, Kulkas Mini, Kamar Mandi Dalam.",
                    price: 2500000,
                    depositAmount: 800000,
                    status: RoomStatus.AVAILABLE,
                }
            ]
        }
    ];

    for (const propData of propertiesData) {
        const { rooms, ...propertyDetails } = propData;
        const property = await prisma.property.create({ data: propertyDetails });
        console.log(`🏢 Created property: ${property.name}`);
        for (const roomData of rooms) {
            const room = await prisma.room.create({ data: { ...roomData, propertyId: property.id } });
            console.log(`  🛏️  Room ${room.roomNumber} (${room.type})`);
        }
    }

    console.log("\n✨ Seeding complete! Database is populated with realistic KosSolution data.");
}

main()
    .catch((e) => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
