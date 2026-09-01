import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { reportService } from "../services/reportService";
import { bookingService } from "../services/bookingService";
import { guestService } from "../services/guestService";
import { formatCurrency, formatDate } from "../utils/formatters";
import { PROPERTY_METADATA } from "../utils/constants";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { 
  Crown, 
  Building2, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Calendar, 
  BedDouble, 
  ArrowUpRight, 
  ShieldCheck, 
  BarChart3, 
  RefreshCw, 
  CheckCircle, 
  XCircle,
  Clock,
  Eye,
  SlidersHorizontal
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

export const OwnerDashboard = () => {
  const { showSuccess, showError } = useToast();

  const [portfolioStats, setPortfolioStats] = useState([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState("all");
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentGuests, setRecentGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const from = "2025-01-01";
      const to = "2026-12-31";

      // 1. Fetch Property Reports for all properties
      const stats = await Promise.all([1, 2, 3].map(async (pId) => {
        const [occ, adr, rev] = await Promise.all([
          reportService.getOccupancyReport(pId, from, to),
          reportService.getAdrReport(pId, from, to),
          reportService.getRevParReport(pId, from, to)
        ]);
        return {
          id: pId,
          meta: PROPERTY_METADATA[pId],
          occupancy: occ,
          adr: adr,
          revpar: rev
        };
      }));
      setPortfolioStats(stats);

      // 2. Fetch Recent Bookings
      const bParams = { limit: 10 };
      if (selectedPropertyId !== "all") {
        bParams.property_id = parseInt(selectedPropertyId);
      }
      const bData = await bookingService.getBookings(bParams);
      setRecentBookings(bData.items || []);

      // 3. Fetch Recent Guests
      const gData = await guestService.getGuests({ limit: 6 });
      setRecentGuests(gData.items || []);

    } catch (err) {
      console.error("Failed to load owner dashboard data", err);
      showError(err.message || "Failed to load executive metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPropertyId]);

  const handleUpdateStatus = async (bookingId, newStatus) => {
    setUpdatingId(bookingId);
    try {
      await bookingService.updateBookingStatus(bookingId, newStatus);
      showSuccess(`Booking #${bookingId} status updated to ${newStatus}`);
      fetchDashboardData();
    } catch (err) {
      showError(err.message || "Failed to update booking status");
    } finally {
      setUpdatingId(null);
    }
  };

  const totalProperties = portfolioStats.length || 3;
  const totalPortfolioRevenue = portfolioStats.reduce((sum, item) => sum + (item.adr?.room_revenue || 0), 0);
  const avgOccupancy = portfolioStats.length > 0
    ? portfolioStats.reduce((sum, item) => sum + (item.occupancy?.occupancy_percent || 0), 0) / portfolioStats.length
    : 0;

  // Chart data for revenue comparison across hotels
  const barChartData = portfolioStats.map((item) => ({
    name: item.meta?.city || `Hotel #${item.id}`,
    Revenue: item.adr?.room_revenue || 0,
    RevPAR: item.revpar?.revpar || 0
  }));

  const pieData = portfolioStats.map((item) => ({
    name: item.meta?.name || `Hotel #${item.id}`,
    value: item.adr?.room_revenue || 1
  }));

  const COLORS = ["#2C4A3E", "#C59B27", "#3B82F6"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Executive Command Banner */}
      <div className="bg-[#2C4A3E] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C59B27] uppercase tracking-wider">
            <Crown className="w-5 h-5 text-[#C59B27]" />
            <span>Executive Command Center • Owner Role</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            Kaveri Group Management & Operations
          </h1>
          <p className="text-stone-200 text-xs sm:text-sm max-w-2xl">
            Full operational authority: Monitor resort revenues, manage staff bookings, control room availability, and review guest directory.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-2xl transition-colors shrink-0 flex items-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* QUICK OPERATIONS DASHBOARD CONTROL BAR */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-3">
          <h3 className="font-serif text-lg font-bold text-[#1C1917] flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#2C4A3E]" />
            Executive Quick Action Control Hub
          </h3>
          <span className="text-xs font-semibold text-[#C59B27] uppercase">Full System Access</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <Link
            to="/manager"
            className="p-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#2C4A3E] hover:text-white text-[#1C1917] border border-[#E8DFD1] transition-all group flex flex-col justify-between space-y-2"
          >
            <BarChart3 className="w-6 h-6 text-[#2C4A3E] group-hover:text-[#C59B27]" />
            <div>
              <span className="font-bold text-xs block">Financial Analytics</span>
              <span className="text-[10px] text-stone-500 group-hover:text-stone-200">ADR & RevPAR Reports &rarr;</span>
            </div>
          </Link>

          <Link
            to="/staff/bookings"
            className="p-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#2C4A3E] hover:text-white text-[#1C1917] border border-[#E8DFD1] transition-all group flex flex-col justify-between space-y-2"
          >
            <Calendar className="w-6 h-6 text-[#C59B27] group-hover:text-white" />
            <div>
              <span className="font-bold text-xs block">Bookings Operations</span>
              <span className="text-[10px] text-stone-500 group-hover:text-stone-200">Manage Reservations &rarr;</span>
            </div>
          </Link>

          <Link
            to="/staff/guests"
            className="p-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#2C4A3E] hover:text-white text-[#1C1917] border border-[#E8DFD1] transition-all group flex flex-col justify-between space-y-2"
          >
            <Users className="w-6 h-6 text-indigo-600 group-hover:text-white" />
            <div>
              <span className="font-bold text-xs block">Guest Directory</span>
              <span className="text-[10px] text-stone-500 group-hover:text-stone-200">Manage Guests List &rarr;</span>
            </div>
          </Link>

          <Link
            to="/staff/rooms"
            className="p-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#2C4A3E] hover:text-white text-[#1C1917] border border-[#E8DFD1] transition-all group flex flex-col justify-between space-y-2"
          >
            <BedDouble className="w-6 h-6 text-amber-600 group-hover:text-white" />
            <div>
              <span className="font-bold text-xs block">Room Inventories</span>
              <span className="text-[10px] text-stone-500 group-hover:text-stone-200">All Hotel Suites &rarr;</span>
            </div>
          </Link>

          <Link
            to="/staff"
            className="p-4 rounded-2xl bg-[#FAF8F5] hover:bg-[#2C4A3E] hover:text-white text-[#1C1917] border border-[#E8DFD1] transition-all group flex flex-col justify-between space-y-2"
          >
            <ShieldCheck className="w-6 h-6 text-emerald-600 group-hover:text-white" />
            <div>
              <span className="font-bold text-xs block">Front Desk Portal</span>
              <span className="text-[10px] text-stone-500 group-hover:text-stone-200">Check In / Check Out &rarr;</span>
            </div>
          </Link>
        </div>
      </div>

      {/* PORTFOLIO HIGHER-LEVEL KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Total Managed Properties</span>
          <div className="text-3xl font-extrabold text-[#2C4A3E]">{totalProperties} Resorts</div>
          <span className="text-[11px] text-stone-400 block">Ooty, Alleppey, Coorg</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Consolidated Revenue</span>
          <div className="text-3xl font-extrabold text-emerald-800">{formatCurrency(totalPortfolioRevenue)}</div>
          <span className="text-[11px] text-stone-400 block">All property room earnings</span>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-2">
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider block">Portfolio Occupancy Avg</span>
          <div className="text-3xl font-extrabold text-[#C59B27]">{avgOccupancy.toFixed(1)}%</div>
          <span className="text-[11px] text-stone-400 block">Across all active rooms</span>
        </div>
      </div>

      {/* RESORT PORTFOLIO PERFORMANCE TABLE & SWITCHER */}
      <div className="bg-white rounded-3xl border border-[#E8DFD1] p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E8DFD1] pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Resorts Overview & Controls</h3>
            <p className="text-xs text-stone-500">View performance breakdown or select a specific hotel to filter operations.</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-stone-500">Filter Hotel:</span>
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#E8DFD1] text-xs font-bold text-[#2C4A3E]"
            >
              <option value="all">All Kaveri Hotels</option>
              <option value="1">Kaveri Hilltop (Ooty)</option>
              <option value="2">Kaveri Backwater (Alleppey)</option>
              <option value="3">Kaveri Riverside (Coorg)</option>
            </select>
          </div>
        </div>

        {loading ? (
          <TableSkeleton rows={3} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#FAF8F5] text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#E8DFD1]">
                <tr>
                  <th className="py-3.5 px-4">Resort Name</th>
                  <th className="py-3.5 px-4">City</th>
                  <th className="py-3.5 px-4">Rooms</th>
                  <th className="py-3.5 px-4">Occupancy %</th>
                  <th className="py-3.5 px-4">ADR Rate</th>
                  <th className="py-3.5 px-4">RevPAR</th>
                  <th className="py-3.5 px-4 text-right">Total Revenue</th>
                  <th className="py-3.5 px-4 text-right">Hotel Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {portfolioStats.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/50">
                    <td className="py-4 px-4 font-bold text-stone-900">{item.meta?.name}</td>
                    <td className="py-4 px-4 font-semibold text-stone-700">{item.meta?.city}</td>
                    <td className="py-4 px-4 font-semibold text-stone-800">{item.occupancy?.total_rooms || 0}</td>
                    <td className="py-4 px-4 font-bold text-amber-700">{(item.occupancy?.occupancy_percent || 0).toFixed(1)}%</td>
                    <td className="py-4 px-4 font-bold text-stone-900">{formatCurrency(item.adr?.adr || 0)}</td>
                    <td className="py-4 px-4 font-bold text-[#2C4A3E]">{formatCurrency(item.revpar?.revpar || 0)}</td>
                    <td className="py-4 px-4 font-extrabold text-emerald-800 text-right">{formatCurrency(item.adr?.room_revenue || 0)}</td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        to={`/properties/${item.id}`}
                        className="px-3 py-1.5 bg-[#2C4A3E] hover:bg-[#3D6454] text-white rounded-lg font-semibold text-[11px] inline-flex items-center gap-1"
                      >
                        <span>View Hotel</span>
                        <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RECENT RESERVATIONS OPERATIONAL CONTROL PANEL */}
      <div className="bg-white rounded-3xl border border-[#E8DFD1] p-8 shadow-xs space-y-6">
        <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-4">
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Live Operations Control (Reservations)</h3>
            <p className="text-xs text-stone-500">Perform direct check-in, check-out, or cancellation operations.</p>
          </div>

          <Link to="/staff/bookings" className="text-xs font-bold text-[#2C4A3E] hover:underline flex items-center gap-1">
            <span>View All Bookings</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <TableSkeleton rows={5} />
        ) : recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-[#FAF8F5] text-stone-500 uppercase text-[10px] font-bold tracking-wider border-b border-[#E8DFD1]">
                <tr>
                  <th className="py-3.5 px-4">Booking ID</th>
                  <th className="py-3.5 px-4">Property</th>
                  <th className="py-3.5 px-4">Guest ID</th>
                  <th className="py-3.5 px-4">Room #</th>
                  <th className="py-3.5 px-4">Dates</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Owner Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {recentBookings.map((b) => (
                  <tr key={b.booking_id} className="hover:bg-stone-50/50">
                    <td className="py-4 px-4 font-bold text-stone-900">#{b.booking_id}</td>
                    <td className="py-4 px-4 font-semibold text-stone-800">Hotel #{b.property_id}</td>
                    <td className="py-4 px-4 font-semibold text-stone-800">Guest #{b.guest_id}</td>
                    <td className="py-4 px-4 font-bold text-[#2C4A3E]">Room #{b.room_id}</td>
                    <td className="py-4 px-4">{formatDate(b.check_in)} – {formatDate(b.check_out)}</td>
                    <td className="py-4 px-4"><StatusBadge status={b.status} /></td>
                    <td className="py-4 px-4 text-right space-x-1">
                      {b.status === "confirmed" && (
                        <>
                          <button
                            onClick={() => handleUpdateStatus(b.booking_id, "checked_in")}
                            disabled={updatingId === b.booking_id}
                            className="px-2.5 py-1 bg-amber-600 text-white rounded-lg font-bold text-[10px]"
                          >
                            Check In
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(b.booking_id, "cancelled")}
                            disabled={updatingId === b.booking_id}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-lg font-bold text-[10px]"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {b.status === "checked_in" && (
                        <button
                          onClick={() => handleUpdateStatus(b.booking_id, "checked_out")}
                          disabled={updatingId === b.booking_id}
                          className="px-2.5 py-1 bg-[#2C4A3E] text-white rounded-lg font-bold text-[10px]"
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
          <div className="p-6 text-center text-xs text-stone-500">No recent reservations found.</div>
        )}
      </div>

      {/* FINANCIAL ANALYTICS & CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Revenue Bar Chart */}
        <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-4">
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Property Revenue Yield Comparison</h3>
            <Link to="/manager" className="text-xs font-semibold text-[#2C4A3E] hover:underline">
              Detailed Reports &rarr;
            </Link>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD1" />
                <XAxis dataKey="name" stroke="#57534E" fontSize={12} />
                <YAxis stroke="#57534E" fontSize={12} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
                <Bar dataKey="Revenue" fill="#2C4A3E" radius={[6, 6, 0, 0]} />
                <Bar dataKey="RevPAR" fill="#C59B27" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Share Pie Chart */}
        <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-6">
          <div className="border-b border-[#E8DFD1] pb-4">
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Portfolio Revenue Share</h3>
            <p className="text-xs text-stone-400">By Hotel Location</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};
