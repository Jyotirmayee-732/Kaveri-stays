import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingService } from "../services/bookingService";
import { StatusBadge } from "../components/StatusBadge";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { useToast } from "../context/ToastContext";
import { PROPERTY_METADATA } from "../utils/constants";
import { formatDate } from "../utils/formatters";
import { 
  ShieldCheck, 
  Users, 
  Calendar, 
  Building2, 
  LogOut, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Search,
  ArrowRight
} from "lucide-react";

export const StaffDashboard = () => {
  const { user, propertyId } = useAuth();
  const { showSuccess, showError } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchPropertyBookings = async () => {
    setLoading(true);
    try {
      // GET /bookings?property_id=...
      const data = await bookingService.getBookings({ property_id: propertyId || 1, limit: 20 });
      setBookings(data.items || []);
    } catch (err) {
      showError(err.message || "Failed to fetch property bookings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPropertyBookings();
  }, [propertyId]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      // PATCH /bookings/{booking_id}/status
      await bookingService.updateBookingStatus(bookingId, newStatus);
      showSuccess(`Booking #${bookingId} status updated to ${newStatus}`);
      fetchPropertyBookings();
    } catch (err) {
      showError(err.message || "Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const propertyMeta = PROPERTY_METADATA[propertyId || 1] || PROPERTY_METADATA[1];

  const countConfirmed = bookings.filter((b) => b.status === "confirmed").length;
  const countCheckedIn = bookings.filter((b) => b.status === "checked_in").length;
  const countCheckedOut = bookings.filter((b) => b.status === "checked_out").length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Staff Header Banner */}
      <div className="bg-[#1C1917] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-stone-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C59B27] uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Staff Desk • {propertyMeta.name}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            Front Desk Operations
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm">
            Manage check-ins, check-outs, guest lists, and room statuses for {propertyMeta.name} ({propertyMeta.city}).
          </p>
        </div>

        {/* Quick Nav Links */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/staff/bookings"
            className="px-4 py-2.5 bg-[#2C4A3E] hover:bg-[#3D6454] text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>All Bookings</span>
          </Link>
          <Link
            to="/staff/guests"
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-stone-700"
          >
            <Users className="w-4 h-4" />
            <span>Guests Directory</span>
          </Link>
          <Link
            to="/staff/rooms"
            className="px-4 py-2.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 border border-stone-700"
          >
            <Building2 className="w-4 h-4" />
            <span>Rooms Inventory</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Arrivals / Confirmed</span>
          <div className="text-3xl font-extrabold text-[#2C4A3E]">{countConfirmed}</div>
          <span className="text-[11px] text-stone-400 block">Pending check-in at front desk</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">In-House Guests</span>
          <div className="text-3xl font-extrabold text-amber-600">{countCheckedIn}</div>
          <span className="text-[11px] text-stone-400 block">Currently occupying rooms</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Completed Stays</span>
          <div className="text-3xl font-extrabold text-stone-700">{countCheckedOut}</div>
          <span className="text-[11px] text-stone-400 block">Checked out</span>
        </div>
      </div>

      {/* Active Front Desk Bookings Management Table */}
      <div className="bg-white rounded-3xl border border-[#E8DFD1] p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Front Desk Reservations</h3>
            <p className="text-xs text-stone-500">Perform state machine actions: Check In, Check Out, Cancel, No-Show.</p>
          </div>
          <button
            onClick={fetchPropertyBookings}
            className="p-2 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-100"
            title="Refresh Table"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : bookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#FAF8F5] text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#E8DFD1]">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Guest ID</th>
                  <th className="py-3.5 px-4">Room #</th>
                  <th className="py-3.5 px-4">Check-In / Out</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">State Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {bookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-4 px-4 font-bold text-stone-900">#{b.booking_id}</td>
                    <td className="py-4 px-4 font-semibold text-stone-800">Guest #{b.guest_id}</td>
                    <td className="py-4 px-4 font-bold text-[#2C4A3E]">Room #{b.room_id}</td>
                    <td className="py-4 px-4">{formatDate(b.check_in)} – {formatDate(b.check_out)}</td>
                    <td className="py-4 px-4"><StatusBadge status={b.status} /></td>
                    <td className="py-4 px-4 text-right space-x-2">
                      {b.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(b.booking_id, "checked_in")}
                            disabled={updatingId === b.booking_id}
                            className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shadow-xs"
                          >
                            Check In
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.booking_id, "cancelled")}
                            disabled={updatingId === b.booking_id}
                            className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold text-[11px]"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.booking_id, "no_show")}
                            disabled={updatingId === b.booking_id}
                            className="px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg font-bold text-[11px]"
                          >
                            No-Show
                          </button>
                        </>
                      )}

                      {b.status === "checked_in" && (
                        <button
                          onClick={() => handleUpdateStatus(b.booking_id, "checked_out")}
                          disabled={updatingId === b.booking_id}
                          className="px-3 py-1.5 bg-[#2C4A3E] hover:bg-[#3D6454] text-white rounded-lg font-bold text-[11px] shadow-xs"
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
          <div className="p-8 text-center text-xs text-stone-500">No bookings available for front desk management.</div>
        )}
      </div>

    </div>
  );
};
