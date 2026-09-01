import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Calendar as CalendarIcon, Users, Search } from "lucide-react";

export const SearchWidget = ({ initialPropertyId = "", initialFrom = "", initialTo = "", initialGuests = 2 }) => {
  const navigate = useNavigate();

  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getNextWeekStr = (days = 3) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const [propertyId, setPropertyId] = useState(initialPropertyId);
  const [fromDate, setFromDate] = useState(initialFrom || getTodayStr());
  const [toDate, setToDate] = useState(initialTo || getNextWeekStr(3));
  const [guests, setGuests] = useState(initialGuests);

  const handleSearch = (e) => {
    e.preventDefault();
    if (propertyId) {
      navigate(`/properties/${propertyId}?from=${fromDate}&to=${toDate}&guests=${guests}`);
    } else {
      navigate(`/properties?from=${fromDate}&to=${toDate}&guests=${guests}`);
    }
  };

  return (
    <form
      onSubmit={handleSearch}
      className="bg-white/95 backdrop-blur-xl p-4 sm:p-6 rounded-3xl border border-[#E8DFD1] shadow-2xl grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-center"
    >
      {/* Property / Location Field */}
      <div className="space-y-1 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8DFD1]/60 focus-within:border-[#2C4A3E] transition-colors">
        <label className="text-[11px] font-semibold tracking-wider text-[#57534E] uppercase flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-[#C59B27]" />
          Destination / Property
        </label>
        <select
          value={propertyId}
          onChange={(e) => setPropertyId(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-[#1C1917] focus:outline-none cursor-pointer"
        >
          <option value="">All Destinations</option>
          <option value="1">Kaveri Hilltop — Ooty</option>
          <option value="2">Kaveri Backwater — Alleppey</option>
          <option value="3">Kaveri Riverside — Coorg</option>
        </select>
      </div>

      {/* Check-in Date */}
      <div className="space-y-1 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8DFD1]/60 focus-within:border-[#2C4A3E] transition-colors">
        <label className="text-[11px] font-semibold tracking-wider text-[#57534E] uppercase flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#C59B27]" />
          Check-In Date
        </label>
        <input
          type="date"
          min={getTodayStr()}
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-[#1C1917] focus:outline-none cursor-pointer"
          required
        />
      </div>

      {/* Check-out Date */}
      <div className="space-y-1 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8DFD1]/60 focus-within:border-[#2C4A3E] transition-colors">
        <label className="text-[11px] font-semibold tracking-wider text-[#57534E] uppercase flex items-center gap-1.5">
          <CalendarIcon className="w-3.5 h-3.5 text-[#C59B27]" />
          Check-Out Date
        </label>
        <input
          type="date"
          min={fromDate || getTodayStr()}
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="w-full bg-transparent text-sm font-semibold text-[#1C1917] focus:outline-none cursor-pointer"
          required
        />
      </div>

      {/* Guests & Search Button */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="w-full space-y-1 bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E8DFD1]/60 focus-within:border-[#2C4A3E] transition-colors">
          <label className="text-[11px] font-semibold tracking-wider text-[#57534E] uppercase flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#C59B27]" />
            Guests
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            className="w-full bg-transparent text-sm font-semibold text-[#1C1917] focus:outline-none cursor-pointer"
          >
            <option value={1}>1 Guest</option>
            <option value={2}>2 Guests</option>
            <option value={3}>3 Guests</option>
            <option value={4}>4 Guests</option>
            <option value={5}>5 Guests</option>
            <option value={6}>6 Guests</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full sm:w-auto h-full min-h-[58px] px-6 bg-[#2C4A3E] hover:bg-[#3D6454] text-white font-semibold rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-0.5 shrink-0"
        >
          <Search className="w-5 h-5 text-[#C59B27]" />
          <span className="hidden lg:inline text-sm whitespace-nowrap">Search Stays</span>
        </button>
      </div>
    </form>
  );
};
