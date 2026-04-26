import { prisma } from "@/lib/prisma";
import { createProperty, deleteProperty } from "@/app/actions/adminActions";
import { Building, Trash2 } from "lucide-react";

export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { rooms: true } } },
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manage Properties</h1>
        <p className="mt-1 text-sm text-gray-500">View, create, and remove kos properties.</p>
      </div>

      {/* Create Form */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Add New Property</h2>
        <form action={createProperty} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Property Name</label>
            <input
              type="text"
              name="name"
              required
              placeholder="KosSolution Sukarno Hatta"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
            <input
              type="text"
              name="city"
              required
              placeholder="Malang"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              required
              placeholder="Jl. Soekarno Hatta No. 123"
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL (Optional)</label>
            <input
              type="url"
              name="imageUrl"
              placeholder="https://images.unsplash.com/..."
              className="w-full rounded-xl border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-[#FF6B6B] focus:border-transparent outline-none"
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="bg-[#FF6B6B] text-white px-6 py-2.5 rounded-xl font-bold hover:bg-[#FF4757] transition-colors"
            >
              Save Property
            </button>
          </div>
        </form>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Property</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Location</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Rooms</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {properties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex-shrink-0 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Building size={20} className="text-gray-500" />
                    </div>
                    <div className="font-semibold text-gray-900">{property.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{property.city}</div>
                  <div className="text-sm text-gray-500 truncate max-w-xs">{property.address}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {property._count.rooms} Rooms
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <form action={deleteProperty.bind(null, property.id)}>
                    <button type="submit" className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                  No properties found. Add one above!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
