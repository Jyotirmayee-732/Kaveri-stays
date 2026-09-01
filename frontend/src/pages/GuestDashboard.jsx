import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { bookingService } from "../services/bookingService";
import { BookingCard } from "../components/BookingCard";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { Calendar, User, ShieldCheck, Plus, RefreshCw, Compass } from "lucide-react";

export const GuestDashboard = () => {
  const { user, guestId } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  const fetchUserBookings = async () => {
    if (!guestId) return;
    setLoading(true);
    try {
      // GET /bookings?guest_id=...
      const data = await bookingService.getBookings({ guest_id: guestId, limit: 50 });
      setBookings(data.items || []);
    } catch (err) {
      console.error("Failed to fetch user bookings", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [guestId]);

  const filteredBookings = bookings.filter((b) => {
    if (activeTab === "upcoming") return b.status === "confirmed" || b.status === "checked_in";
    if (activeTab === "past") return b.status === "checked_out";
    if (activeTab === "cancelled") return b.status === "cancelled" || b.status === "no_show";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Welcome Banner */}
      <div className="bg-[#2C4A3E] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C59B27] uppercase tracking-wider">
            <User className="w-4 h-4" />
            <span>Guest Member Account</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            Welcome back, {user?.full_name || user?.email || "Guest"}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm max-w-lg">
            Manage your stay reservations, check payment balances, and review completed Kaveri hospitality stays.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            to="/properties"
            className="px-5 py-3 bg-[#C59B27] hover:bg-[#B0881E] text-white text-xs font-bold rounded-2xl flex items-center gap-2 shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Book New Stay</span>
          </Link>
          <button
            onClick={fetchUserBookings}
            className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors"
            title="Refresh Bookings"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Bookings Feed */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-[#E8DFD1] pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "all"
                  ? "bg-[#2C4A3E] text-white"
                  : "bg-[#FAF8F5] text-stone-600 border border-[#E8DFD1]"
              }`}
            >
              All Stays ({bookings.length})
            </button>
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "upcoming"
                  ? "bg-[#2C4A3E] text-white"
                  : "bg-[#FAF8F5] text-stone-600 border border-[#E8DFD1]"
              }`}
            >
              Upcoming & Active
            </button>
            <button
              onClick={() => setActiveTab("past")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "past"
                  ? "bg-[#2C4A3E] text-white"
                  : "bg-[#FAF8F5] text-stone-600 border border-[#E8DFD1]"
              }`}
            >
              Past & Checked Out
            </button>
            <button
              onClick={() => setActiveTab("cancelled")}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "cancelled"
                  ? "bg-[#2C4A3E] text-white"
                  : "bg-[#FAF8F5] text-stone-600 border border-[#E8DFD1]"
              }`}
            >
              Cancelled
            </button>
          </div>

          {/* Bookings List */}
          {loading ? (
            <TableSkeleton rows={4} />
          ) : filteredBookings.length > 0 ? (
            <div className="space-y-6">
              {filteredBookings.map((b) => (
                <BookingCard key={b.booking_id} booking={b} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-[#E8DFD1] p-12 text-center space-y-4">
              <div className="w-14 h-14 bg-[#FAF8F5] text-stone-400 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-[#1C1917]">No Stays Found</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                You don't have any bookings under this view. Explore our resort sanctuaries and book your next experience.
              </p>
              <Link
                to="/properties"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2C4A3E] text-white text-xs font-semibold rounded-xl hover:bg-[#3D6454]"
              >
                <Compass className="w-4 h-4" />
                <span>Explore Stays</span>
              </Link>
            </div>
          )}

        </div>

        {/* Right Column: Guest Profile Overview */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#1C1917] border-b border-[#E8DFD1] pb-3">
              Member Profile
            </h3>

            <div className="space-y-4 text-xs">
              <div>
                <span className="text-stone-400 font-medium uppercase tracking-wider block">Full Name</span>
                <span className="font-bold text-[#1C1917] text-sm block mt-0.5">{user?.full_name || "N/A"}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium uppercase tracking-wider block">Email Address</span>
                <span className="font-bold text-[#1C1917] text-sm block mt-0.5">{user?.email || "N/A"}</span>
              </div>
              <div>
                <span className="text-stone-400 font-medium uppercase tracking-wider block">Account Role</span>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold rounded-full capitalize mt-1">
                  {user?.role || "Guest"}
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
