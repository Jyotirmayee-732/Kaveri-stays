import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { paymentService } from "../services/paymentService";
import { StatusBadge } from "../components/StatusBadge";
import { useToast } from "../context/ToastContext";
import { PROPERTY_METADATA } from "../utils/constants";
import { formatDate, formatCurrency } from "../utils/formatters";
import { 
  Building2, 
  Calendar, 
  Users, 
  CreditCard, 
  ArrowLeft, 
  Star, 
  AlertTriangle,
  Receipt,
  XCircle
} from "lucide-react";

export const BookingDetails = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const [booking, setBooking] = useState(null);
  const [payments, setPayments] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  const idNum = parseInt(bookingId);

  const fetchDetails = async () => {
    setLoading(true);
    try {
      // GET /bookings/{booking_id}
      const bData = await bookingService.getBookingDetail(idNum);
      setBooking(bData);

      // GET /bookings/{booking_id}/payments
      try {
        const pData = await paymentService.getPayments(idNum);
        setPayments(pData);
      } catch {
        // Payments fetch optional
      }
    } catch (err) {
      showError(err.message || "Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [idNum]);

  const handleCancelBooking = async () => {
    if (!window.confirm("Are you sure you want to cancel this booking reservation?")) return;

    setCancelling(true);
    try {
      await bookingService.updateBookingStatus(idNum, "cancelled");
      showSuccess("Booking reservation cancelled successfully.");
      fetchDetails();
    } catch (err) {
      showError(err.message || "Failed to cancel booking.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#2C4A3E] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4 shadow-lg">
        <h3 className="font-serif text-2xl font-bold text-stone-900">Booking Not Found</h3>
        <p className="text-xs text-stone-500">We couldn't retrieve booking #{bookingId}. It may have been deleted or you lack access.</p>
        <Link to="/dashboard" className="inline-block px-5 py-2.5 bg-[#2C4A3E] text-white rounded-xl text-xs font-semibold">
          Back to My Dashboard
        </Link>
      </div>
    );
  }

  const propertyMeta = PROPERTY_METADATA[booking.property_id] || PROPERTY_METADATA[1];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Back link */}
      <div>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-xs font-semibold text-[#2C4A3E] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to My Bookings</span>
        </Link>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-[#E8DFD1] p-8 shadow-xl space-y-8">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E8DFD1] pb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">
                Reservation #{booking.booking_id}
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold text-[#1C1917] mt-1">
              {propertyMeta.name}
            </h1>
            <p className="text-xs text-stone-500">{propertyMeta.locationText}</p>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={booking.status} />
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8DFD1]">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase text-stone-500 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#2C4A3E]" /> Check-In / Check-Out
            </span>
            <p className="text-sm font-bold text-stone-900">
              {formatDate(booking.check_in)} – {formatDate(booking.check_out)}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase text-stone-500 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-[#C59B27]" /> Room Number
            </span>
            <p className="text-sm font-bold text-stone-900">
              Room #{booking.room_id}
            </p>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase text-stone-500 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-[#C59B27]" /> Guest Capacity
            </span>
            <p className="text-sm font-bold text-stone-900">
              {booking.guest_count} Guest(s)
            </p>
          </div>
        </div>

        {/* Financial & Payment History Section */}
        {payments && (
          <div className="space-y-4 pt-4 border-t border-[#E8DFD1]">
            <h3 className="font-serif text-xl font-bold text-[#1C1917] flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#2C4A3E]" />
              Payment Summary
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100 space-y-1">
                <span className="text-xs font-semibold text-emerald-800 uppercase">Total Amount Paid</span>
                <p className="text-2xl font-extrabold text-emerald-900">{formatCurrency(payments.total_paid)}</p>
              </div>

              <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-1">
                <span className="text-xs font-semibold text-amber-800 uppercase">Balance Remaining</span>
                <p className="text-2xl font-extrabold text-amber-900">{formatCurrency(payments.balance)}</p>
              </div>
            </div>

            {/* Payments List Table */}
            {payments.items && payments.items.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-500">Transaction History</h4>
                <div className="bg-white rounded-xl border border-[#E8DFD1] overflow-hidden text-xs">
                  {payments.items.map((p) => (
                    <div key={p.id} className="p-3 border-b border-stone-100 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-stone-900">{formatCurrency(p.amount)}</span>
                        <span className="text-stone-400 capitalize ml-2">via {p.method}</span>
                      </div>
                      <span className="text-stone-500">{formatDate(p.paid_at)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* State Machine Action Controls */}
        <div className="pt-6 border-t border-[#E8DFD1] flex flex-wrap items-center justify-between gap-4">
          <div className="text-xs text-stone-500 italic">
            Status: <span className="font-semibold capitalize text-stone-800">{booking.status}</span>
          </div>

          <div className="flex items-center gap-3">
            {booking.status === "confirmed" && (
              <>
                <button
                  onClick={handleCancelBooking}
                  disabled={cancelling}
                  className="px-4 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{cancelling ? "Cancelling..." : "Cancel Booking"}</span>
                </button>

                <Link
                  to={`/bookings/${booking.booking_id}/payment`}
                  className="px-5 py-2.5 bg-[#2C4A3E] hover:bg-[#3D6454] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Make Payment</span>
                </Link>
              </>
            )}

            {booking.status === "checked_out" && (
              <Link
                to={`/bookings/${booking.booking_id}/review`}
                className="px-5 py-2.5 bg-[#C59B27] hover:bg-[#B0881E] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm"
              >
                <Star className="w-4 h-4 fill-white" />
                <span>Write Stay Review</span>
              </Link>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
