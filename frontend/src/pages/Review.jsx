import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { reviewService } from "../services/reviewService";
import { useToast } from "../context/ToastContext";
import { PROPERTY_METADATA } from "../utils/constants";
import { Star, ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";

export const Review = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const idNum = parseInt(bookingId);

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  // Review Form
  const [rating, setRating] = useState(5);
  const [comments, setComments] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      setLoading(true);
      try {
        const bData = await bookingService.getBookingDetail(idNum);
        setBooking(bData);
      } catch (err) {
        showError(err.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [idNum]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();

    if (booking?.status !== "checked_out") {
      showError("Reviews can only be submitted after your booking has been checked out.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await reviewService.createReview(idNum, {
        rating: rating,
        comments: comments
      });
      showSuccess("Thank you! Your stay review has been submitted successfully.");
      setExistingReview(res);
    } catch (err) {
      if (err.status === 409) {
        showError(err.message || "A review has already been submitted for this booking.");
      } else {
        showError(err.message || "Failed to submit review.");
      }
    } finally {
      setSubmitting(false);
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
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-rose-200 text-center space-y-4 shadow-lg">
        <h3 className="font-serif text-xl font-bold text-stone-900">Booking Not Found</h3>
        <Link to="/dashboard" className="inline-block px-4 py-2 bg-[#2C4A3E] text-white rounded-xl text-xs">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  const propertyMeta = PROPERTY_METADATA[booking.property_id] || PROPERTY_METADATA[1];
  const isCheckedOut = booking.status === "checked_out";

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <Link to={`/bookings/${idNum}`} className="inline-flex items-center gap-2 text-xs font-semibold text-[#2C4A3E] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reservation Details</span>
        </Link>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-2xl space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2 border-b border-[#E8DFD1] pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">Guest Feedback</span>
          <h1 className="font-serif text-3xl font-bold text-[#1C1917]">Review Your Stay</h1>
          <p className="text-xs text-stone-500">{propertyMeta.name} • Booking #{booking.booking_id}</p>
        </div>

        {/* Validation Notice */}
        {!isCheckedOut ? (
          <div className="p-6 bg-amber-50 rounded-2xl border border-amber-200 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-amber-900">Review Pending Checkout</h4>
            <p className="text-xs text-amber-800 leading-relaxed max-w-md mx-auto">
              Reviews can only be submitted after your stay is completed and checked out by property staff. Current status: <span className="font-bold capitalize">{booking.status}</span>.
            </p>
          </div>
        ) : existingReview ? (
          /* Submitted State */
          <div className="p-8 bg-emerald-50 rounded-2xl border border-emerald-200 text-center space-y-4">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="font-serif text-2xl font-bold text-emerald-950">Review Published</h3>
            <div className="flex justify-center gap-1">
              {[...Array(existingReview.rating || rating)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-[#C59B27] text-[#C59B27]" />
              ))}
            </div>
            <p className="text-sm text-emerald-900 italic">"{existingReview.comments || comments}"</p>
          </div>
        ) : (
          /* Review Form */
          <form onSubmit={handleSubmitReview} className="space-y-6">
            
            {/* Rating Stars Selector */}
            <div className="space-y-2 text-center">
              <label className="text-xs font-semibold uppercase text-stone-500 block">Overall Rating</label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-[#C59B27] hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating ? "fill-[#C59B27]" : "text-stone-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-[#2C4A3E] block">
                {rating === 5 ? "Excellent (5 Stars)" : rating === 4 ? "Very Good (4 Stars)" : rating === 3 ? "Average (3 Stars)" : "Below Expectation"}
              </span>
            </div>

            {/* Comments Box */}
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase text-stone-500">Your Experience Comments</label>
              <textarea
                rows={5}
                required
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your thoughts about room cleanliness, food quality, staff hospitality, and location..."
                className="w-full p-4 bg-[#FAF8F5] rounded-2xl border border-[#E8DFD1] text-sm text-[#1C1917] focus:outline-none focus:border-[#2C4A3E]"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 bg-[#2C4A3E] hover:bg-[#3D6454] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <Send className="w-4 h-4 text-[#C59B27]" />
              <span>{submitting ? "Submitting..." : "Submit Review"}</span>
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
