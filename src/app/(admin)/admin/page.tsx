import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [totalProperties, totalRooms, totalReservations] = await Promise.all([
    prisma.property.count(),
    prisma.room.count(),
    prisma.reservation.count(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500">Total Properties</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalProperties}</p>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500">Total Rooms</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalRooms}</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-500">Total Reservations</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">{totalReservations}</p>
        </div>
      </div>
    </div>
  );
}
