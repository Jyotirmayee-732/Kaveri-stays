import React, { useState, useEffect } from "react";
import { roomService } from "../services/roomService";
import { useAuth } from "../context/AuthContext";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { PROPERTY_METADATA } from "../utils/constants";
import { Building2, BedDouble, Users, Filter, ChevronLeft, ChevronRight } from "lucide-react";

export const StaffRooms = () => {
  const { propertyId } = useAuth();
  const { showError } = useToast();

  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || 1);
  const [rooms, setRooms] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [offset, setOffset] = useState(0);
  const limit = 15;

  const fetchRooms = async () => {
    setLoading(true);
    try {
      // GET /properties/{property_id}/rooms
      const data = await roomService.getRoomsByProperty(selectedPropertyId, { limit, offset });
      setRooms(data.items || []);
      setTotal(data.meta?.total || (data.items || []).length);
    } catch (err) {
      showError(err.message || "Failed to fetch property room inventory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, [selectedPropertyId, offset]);

  const propertyMeta = PROPERTY_METADATA[selectedPropertyId] || PROPERTY_METADATA[1];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">Property Inventory</span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917]">Rooms & Suites Inventory</h1>
        </div>

        {/* Property Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-500 uppercase">Property:</label>
          <select
            value={selectedPropertyId}
            onChange={(e) => {
              setSelectedPropertyId(parseInt(e.target.value));
              setOffset(0);
            }}
            className="bg-white p-2.5 rounded-xl border border-[#E8DFD1] text-xs font-bold text-[#2C4A3E]"
          >
            <option value={1}>Kaveri Hilltop (Ooty)</option>
            <option value={2}>Kaveri Backwater (Alleppey)</option>
            <option value={3}>Kaveri Riverside (Coorg)</option>
          </select>
        </div>
      </div>

      {/* Property Summary Bar */}
      <div className="bg-[#2C4A3E] text-white p-6 rounded-3xl shadow-md flex items-center justify-between">
        <div>
          <h3 className="font-serif text-xl font-bold">{propertyMeta.name}</h3>
          <p className="text-xs text-stone-300">{propertyMeta.locationText}</p>
        </div>
        <div className="text-right">
          <span className="text-xs text-[#C59B27] font-semibold uppercase block">Total Registered Rooms</span>
          <span className="text-2xl font-extrabold">{total} Rooms</span>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#E8DFD1] p-8 shadow-xs space-y-6">
        {loading ? (
          <TableSkeleton rows={8} />
        ) : rooms.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#FAF8F5] text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#E8DFD1]">
                <tr>
                  <th className="py-3.5 px-4">Room ID</th>
                  <th className="py-3.5 px-4">Room #</th>
                  <th className="py-3.5 px-4">Room Type</th>
                  <th className="py-3.5 px-4">Max Occupancy</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rooms.map((r) => (
                  <tr key={r.id} className="hover:bg-stone-50/50">
                    <td className="py-4 px-4 font-bold text-stone-900">#{r.id}</td>
                    <td className="py-4 px-4 font-bold text-[#2C4A3E]">Room #{r.room_number}</td>
                    <td className="py-4 px-4 font-semibold text-stone-800">{r.room_type?.name}</td>
                    <td className="py-4 px-4 font-semibold text-stone-800">{r.room_type?.max_occupancy} Guests</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-stone-500">No rooms listed for this property.</div>
        )}

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-[#E8DFD1] pt-4 text-xs">
          <button
            disabled={offset === 0}
            onClick={() => setOffset(Math.max(0, offset - limit))}
            className="px-4 py-2 bg-stone-100 disabled:opacity-50 text-stone-700 font-semibold rounded-xl flex items-center gap-1"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          <span className="text-stone-500 font-medium">Page {Math.floor(offset / limit) + 1}</span>
          <button
            disabled={offset + limit >= total}
            onClick={() => setOffset(offset + limit)}
            className="px-4 py-2 bg-stone-100 disabled:opacity-50 text-stone-700 font-semibold rounded-xl flex items-center gap-1"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};
