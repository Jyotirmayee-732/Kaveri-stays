import React, { useState, useEffect } from "react";
import { guestService } from "../services/guestService";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { Users, Search, Mail, Phone, MapPin, ChevronLeft, ChevronRight } from "lucide-react";

export const StaffGuests = () => {
  const { showError } = useToast();

  const [guests, setGuests] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  const [searchName, setSearchName] = useState("");
  const [searchEmail, setSearchEmail] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 15;

  const fetchGuests = async () => {
    setLoading(true);
    try {
      const params = { limit, offset };
      if (searchName) params.name = searchName;
      if (searchEmail) params.email = searchEmail;

      const data = await guestService.getGuests(params);
      setGuests(data.items || []);
      setTotal(data.meta?.total || (data.items || []).length);
    } catch (err) {
      showError(err.message || "Failed to fetch guests list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGuests();
  }, [offset, searchName, searchEmail]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">Guest Management</span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917]">Registered Guests Directory</h1>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search guest by name..."
            value={searchName}
            onChange={(e) => {
              setSearchName(e.target.value);
              setOffset(0);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-xs text-stone-900"
          />
        </div>

        <div className="relative">
          <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by email address..."
            value={searchEmail}
            onChange={(e) => {
              setSearchEmail(e.target.value);
              setOffset(0);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-xs text-stone-900"
          />
        </div>
      </div>

      {/* Guest Table */}
      <div className="bg-white rounded-3xl border border-[#E8DFD1] p-8 shadow-xs space-y-6">
        {loading ? (
          <TableSkeleton rows={8} />
        ) : guests.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#FAF8F5] text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#E8DFD1]">
                <tr>
                  <th className="py-3.5 px-4">Guest ID</th>
                  <th className="py-3.5 px-4">Full Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4">City</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {guests.map((g) => (
                  <tr key={g.id} className="hover:bg-stone-50/50">
                    <td className="py-4 px-4 font-bold text-stone-900">#{g.id}</td>
                    <td className="py-4 px-4 font-bold text-[#2C4A3E]">{g.full_name}</td>
                    <td className="py-4 px-4 text-stone-600">{g.email}</td>
                    <td className="py-4 px-4 text-stone-600">{g.phone || "—"}</td>
                    <td className="py-4 px-4 font-semibold text-stone-800">{g.city || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-stone-500">No guests found in the directory.</div>
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
