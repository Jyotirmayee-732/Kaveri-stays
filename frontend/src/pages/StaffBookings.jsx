import React, { useState, useEffect } from "react";
import { bookingService } from "../services/bookingService";
import { StatusBadge } from "../components/StatusBadge";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { formatDate } from "../utils/formatters";
import { Calendar, Search, Filter, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";

export const StaffBookings = () => {
  const { showSuccess, showError } = useToast();

  const [bookings, setBookings] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filters & Pagination
  const [statusFilter, setStatusFilter] = useState("");
  const [offset, setOffset] = useState(0);
  const limit = 15;

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = { limit, offset };
      if (statusFilter) params.status = statusFilter;

      const data = await bookingService.getBookings(params);
      setBookings(data.items || []);
      setTotalCount(data.meta?.total || (data.items || []).length);
    } catch (err) {
      showError(err.message || "Failed to fetch bookings list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [offset, statusFilter]);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await bookingService.updateBookingStatus(id, newStatus);
      showSuccess(`Booking #${id} status updated to ${newStatus}`);
      fetchBookings();
    } catch (err) {
      showError(err.message || "Failed to update booking status");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">Administration</span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917]">Booking Management</h1>
        </div>
        <button onClick={fetchBookings} className="p-2.5 bg-white border border-[#E8DFD1] rounded-xl hover:bg-stone-50 text-stone-700">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-stone-500 uppercase">Filter Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setOffset(0);
            }}
            className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8DFD1] text-xs font-semibold text-stone-900"
          >
            <option value="">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>

        <div className="text-xs font-semibold text-stone-500">
          Showing {bookings.length} of {totalCount} total bookings
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#E8DFD1] p-8 shadow-xs space-y-6">
        {loading ? (
          <TableSkeleton rows={8} />
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#FAF8F5] text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#E8DFD1]">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Property ID</th>
                  <th className="py-3.5 px-4">Guest ID</th>
                  <th className="py-3.5 px-4">Room #</th>
                  <th className="py-3.5 px-4">Stay Period</th>
                  <th className="py-3.5 px-4">Guests</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-stone-50/50">
                    <td className="py-4 px-4 font-bold text-stone-900">#{b.booking_id}</td>
                    <td className="py-4 px-4 font-semibold text-stone-800">Prop #{b.property_id}</td>
                    <td className="py-4 px-4 font-semibold text-stone-800">Guest #{b.guest_id}</td>
                    <td className="py-4 px-4 font-bold text-[#2C4A3E]">Room #{b.room_id}</td>
                    <td className="py-4 px-4">{formatDate(b.check_in)} – {formatDate(b.check_out)}</td>
                    <td className="py-4 px-4">{b.guest_count}</td>
                    <td className="py-4 px-4"><StatusBadge status={b.status} /></td>
                    <td className="py-4 px-4 text-right space-x-1">
                      {b.status === "confirmed" && (
                        <button
                          onClick={() => handleStatusUpdate(b.booking_id, "checked_in")}
                          className="px-2.5 py-1 bg-amber-600 text-white rounded-lg text-[10px] font-bold"
                        >
                          Check In
                        </button>
                      )}
                      {b.status === "checked_in" && (
                        <button
                          onClick={() => handleStatusUpdate(b.booking_id, "checked_out")}
                          className="px-2.5 py-1 bg-[#2C4A3E] text-white rounded-lg text-[10px] font-bold"
                        >
                          Check Out
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-stone-500">No bookings match the specified criteria.</div>
        )}

        {/* Pagination Controls */}
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
            disabled={offset + limit >= totalCount}
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
