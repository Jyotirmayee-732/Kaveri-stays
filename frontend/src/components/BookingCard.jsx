import React from "react";
import { Link } from "react-router-dom";
import { StatusBadge } from "./StatusBadge";
import { PROPERTY_METADATA } from "../utils/constants";
import { formatDate, formatCurrency } from "../utils/formatters";
import { Calendar, Users, MapPin, ArrowRight, CreditCard, Star } from "lucide-react";

export const BookingCard = ({ booking, onStatusChange }) => {
  const propertyMeta = PROPERTY_METADATA[booking.property_id] || {
    name: `Property #${booking.property_id}`,
    city: "South India"
  };

  return (
    <div className="bg-white rounded-3xl border border-[#E8DFD1] p-6 shadow-xs hover:shadow-lg transition-all duration-300 space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8DFD1]/60 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#C59B27]">
              Booking #{booking.booking_id}
            </span>
            <span className="text-stone-300">•</span>
            <span className="text-xs text-stone-500">
              Booked on {formatDate(booking.created_at)}
            </span>
          </div>
          <h4 className="font-serif text-xl font-bold text-[#1C1917] mt-1">
            {propertyMeta.name}
          </h4>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
        <div className="space-y-1">
          <span className="text-stone-400 font-medium uppercase tracking-wider block">City</span>
          <div className="flex items-center gap-1.5 text-stone-800 font-semibold">
            <MapPin className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>{propertyMeta.city}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-stone-400 font-medium uppercase tracking-wider block">Stay Dates</span>
          <div className="flex items-center gap-1.5 text-stone-800 font-semibold">
            <Calendar className="w-3.5 h-3.5 text-[#2C4A3E]" />
            <span>{formatDate(booking.check_in)} – {formatDate(booking.check_out)}</span>
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-stone-400 font-medium uppercase tracking-wider block">Room</span>
          <span className="text-stone-800 font-bold text-sm block">
            Room #{booking.room_id}
          </span>
        </div>

        <div className="space-y-1">
          <span className="text-stone-400 font-medium uppercase tracking-wider block">Guests</span>
          <div className="flex items-center gap-1 text-stone-800 font-semibold">
            <Users className="w-3.5 h-3.5 text-[#C59B27]" />
            <span>{booking.guest_count} Guest(s)</span>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-4 border-t border-[#E8DFD1]/60 flex flex-wrap items-center justify-between gap-3">
        <Link
          to={`/bookings/${booking.booking_id}`}
          className="text-xs font-semibold text-[#2C4A3E] hover:text-[#3D6454] flex items-center gap-1.5"
        >
          <span>View Full Booking Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>

        <div className="flex items-center gap-2">
          {booking.status === "confirmed" && (
            <Link
              to={`/bookings/${booking.booking_id}/payment`}
              className="px-4 py-2 bg-[#2C4A3E] hover:bg-[#3D6454] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Make Payment</span>
            </Link>
          )}

          {booking.status === "checked_out" && (
            <Link
              to={`/bookings/${booking.booking_id}/review`}
              className="px-4 py-2 bg-[#C59B27] hover:bg-[#B0881E] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Star className="w-3.5 h-3.5 fill-white" />
              <span>Write Review</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
