import React from "react";
import { Users, BedDouble, Sparkles, CheckCircle, ArrowRight } from "lucide-react";
import { ROOM_TYPE_DETAILS } from "../utils/constants";
import { formatCurrency } from "../utils/formatters";

export const RoomCard = ({ room, property, checkIn, checkOut, onSelectRoom }) => {
  const typeName = room.room_type?.name || "Standard";
  const details = ROOM_TYPE_DETAILS[typeName] || ROOM_TYPE_DETAILS.Standard;

  const totalRateNum = parseFloat(room.total_rate || "0");
  const nights = room.nights || 1;
  const avgNightly = nights > 0 ? totalRateNum / nights : totalRateNum;

  return (
    <div className="bg-white rounded-3xl border border-[#E8DFD1] p-6 shadow-xs hover:shadow-xl transition-all duration-300 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
      {/* Room Image Thumbnail */}
      <div className="lg:col-span-4 relative rounded-2xl overflow-hidden h-48 bg-stone-100">
        <img
          src={details.image}
          alt={typeName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 left-3 bg-[#2C4A3E] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
          Room #{room.room_number}
        </div>
        {details.badge && (
          <div className="absolute bottom-3 right-3 bg-[#C59B27] text-white text-[11px] font-bold px-2.5 py-1 rounded-lg shadow-md uppercase tracking-wider">
            {details.badge}
          </div>
        )}
      </div>

      {/* Room Specification Content */}
      <div className="lg:col-span-5 space-y-3">
        <div className="flex items-center gap-3">
          <h4 className="font-serif text-2xl font-bold text-[#1C1917]">
            {typeName} Suite
          </h4>
        </div>

        <p className="text-xs text-[#57534E] leading-relaxed">
          {details.description}
        </p>

        {/* Feature Icons */}
        <div className="flex items-center gap-4 text-xs text-[#1C1917] pt-1">
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8DFD1]/60">
            <Users className="w-4 h-4 text-[#C59B27]" />
            <span>Max Occupancy: {room.room_type?.max_occupancy || 2} Guests</span>
          </div>
          <div className="flex items-center gap-1.5 bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#E8DFD1]/60">
            <BedDouble className="w-4 h-4 text-[#2C4A3E]" />
            <span>King Bed</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-emerald-700 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Backend Verified Available for Selected Dates</span>
        </div>
      </div>

      {/* Pricing & Booking CTA */}
      <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-[#E8DFD1] pt-4 lg:pt-0 lg:pl-6 flex flex-col justify-between h-full text-right space-y-4">
        <div>
          <span className="text-[11px] font-semibold text-[#57534E] uppercase tracking-wider block">
            Rate for {nights} {nights === 1 ? "Night" : "Nights"}
          </span>
          <div className="text-2xl font-extrabold text-[#2C4A3E]">
            {formatCurrency(totalRateNum)}
          </div>
          {nights > 1 && (
            <span className="text-xs text-[#57534E] block mt-0.5">
              ({formatCurrency(avgNightly)} / night avg)
            </span>
          )}
          <span className="text-[10px] text-stone-400 block mt-1">
            Includes taxes & service fees
          </span>
        </div>

        <button
          onClick={() => onSelectRoom(room)}
          className="w-full py-3.5 px-4 bg-[#2C4A3E] hover:bg-[#3D6454] text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5"
        >
          <span>Select Room</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
