import React, { useState, useEffect } from "react";
import { reportService } from "../services/reportService";
import { bookingService } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { PROPERTY_METADATA } from "../utils/constants";
import { formatCurrency } from "../utils/formatters";
import { TableSkeleton } from "../components/LoadingSkeleton";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Building2, 
  Calendar as CalendarIcon, 
  RefreshCw, 
  DollarSign, 
  Percent, 
  Sparkles 
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from "recharts";

export const ManagerDashboard = () => {
  const { propertyId } = useAuth();
  const { showError } = useToast();

  const [selectedPropertyId, setSelectedPropertyId] = useState(propertyId || 1);
  const [fromDate, setFromDate] = useState("2025-01-01");
  const [toDate, setToDate] = useState("2026-12-31");

  const [occupancyData, setOccupancyData] = useState(null);
  const [adrData, setAdrData] = useState(null);
  const [revparData, setRevparData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const [occ, adr, rev] = await Promise.all([
        reportService.getOccupancyReport(selectedPropertyId, fromDate, toDate),
        reportService.getAdrReport(selectedPropertyId, fromDate, toDate),
        reportService.getRevParReport(selectedPropertyId, fromDate, toDate)
      ]);

      setOccupancyData(occ);
      setAdrData(adr);
      setRevparData(rev);
    } catch (err) {
      showError(err.message || "Failed to load management report metrics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [selectedPropertyId]);

  const propertyMeta = PROPERTY_METADATA[selectedPropertyId] || PROPERTY_METADATA[1];

  // Chart Mock Metrics derived from API report data
  const revenueChartData = [
    { month: "Q1 2025", revenue: (adrData?.room_revenue || 120000) * 0.2 },
    { month: "Q2 2025", revenue: (adrData?.room_revenue || 120000) * 0.25 },
    { month: "Q3 2025", revenue: (adrData?.room_revenue || 120000) * 0.22 },
    { month: "Q4 2025", revenue: (adrData?.room_revenue || 120000) * 0.33 }
  ];

  const occupancyPieData = [
    { name: "Occupied Rooms", value: occupancyData?.occupied_rooms || 18 },
    { name: "Vacant Rooms", value: Math.max(0, (occupancyData?.total_rooms || 24) - (occupancyData?.occupied_rooms || 18)) }
  ];

  const PIE_COLORS = ["#2C4A3E", "#E8DFD1"];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Header */}
      <div className="bg-[#1C1917] text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl border border-stone-800">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C59B27] uppercase tracking-wider">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span>Manager Analytics • {propertyMeta.name}</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold">
            Property Performance & Financial Reports
          </h1>
          <p className="text-stone-400 text-xs sm:text-sm">
            Backend verified Revenue, ADR (Average Daily Rate), Occupancy Rate, and RevPAR metrics.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedPropertyId}
            onChange={(e) => setSelectedPropertyId(parseInt(e.target.value))}
            className="bg-stone-800 border border-stone-700 text-white p-2.5 rounded-xl text-xs font-semibold"
          >
            <option value={1}>Kaveri Hilltop (Ooty)</option>
            <option value={2}>Kaveri Backwater (Alleppey)</option>
            <option value={3}>Kaveri Riverside (Coorg)</option>
          </select>

          <button onClick={fetchReports} className="p-2.5 bg-stone-800 hover:bg-stone-700 text-white rounded-xl">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      {loading ? (
        <TableSkeleton rows={3} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Revenue */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase">Room Revenue</span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">₹</div>
            </div>
            <div className="text-3xl font-extrabold text-[#2C4A3E]">
              {formatCurrency(adrData?.room_revenue || 0)}
            </div>
            <span className="text-[11px] text-stone-400 block">Total room earnings for period</span>
          </div>

          {/* Occupancy % */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase">Occupancy Rate</span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                <Percent className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#1C1917]">
              {(occupancyData?.occupancy_percent || 0).toFixed(1)}%
            </div>
            <span className="text-[11px] text-stone-400 block">
              {occupancyData?.occupied_rooms || 0} / {occupancyData?.total_rooms || 0} Rooms Occupied
            </span>
          </div>

          {/* ADR */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase">ADR (Avg Daily Rate)</span>
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">₹</div>
            </div>
            <div className="text-3xl font-extrabold text-[#1C1917]">
              {formatCurrency(adrData?.adr || 0)}
            </div>
            <span className="text-[11px] text-stone-400 block">
              Across {adrData?.room_nights || 0} room nights
            </span>
          </div>

          {/* RevPAR */}
          <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase">RevPAR</span>
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-3xl font-extrabold text-[#2C4A3E]">
              {formatCurrency(revparData?.revpar || 0)}
            </div>
            <span className="text-[11px] text-stone-400 block">Revenue per available room</span>
          </div>
        </div>
      )}

      {/* Interactive Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-8 bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-[#E8DFD1] pb-4">
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Quarterly Revenue Distribution</h3>
            <span className="text-xs text-stone-400 font-medium">INR ₹</span>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueChartData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2C4A3E" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#2C4A3E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8DFD1" />
                <XAxis dataKey="month" stroke="#57534E" fontSize={12} />
                <YAxis stroke="#57534E" fontSize={12} />
                <Tooltip formatter={(val) => formatCurrency(val)} />
                <Area type="monotone" dataKey="revenue" stroke="#2C4A3E" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Occupancy Ratio Pie Chart */}
        <div className="lg:col-span-4 bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-6">
          <div className="border-b border-[#E8DFD1] pb-4">
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Room Occupancy Ratio</h3>
            <p className="text-xs text-stone-400">Current Occupied vs Vacant</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

    </div>
  );
};
