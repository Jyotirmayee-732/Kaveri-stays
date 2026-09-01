import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { propertyService } from "../services/propertyService";
import { bookingService } from "../services/bookingService";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { RoomCard } from "../components/RoomCard";
import { PROPERTY_METADATA } from "../utils/constants";
import { formatDate, calculateNights, formatCurrency } from "../utils/formatters";
import { 
  MapPin, 
  Star, 
  Calendar as CalendarIcon, 
  Users, 
  Check, 
  ShieldCheck, 
  Search, 
  X, 
  ArrowRight,
  Info
} from "lucide-react";

export const PropertyDetails = () => {
  const { propertyId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated, guestId } = useAuth();
  const { showSuccess, showError, showWarning } = useToast();

  const idNum = parseInt(propertyId) || 1;
  const meta = PROPERTY_METADATA[idNum] || PROPERTY_METADATA[1];

  const getTodayStr = () => new Date().toISOString().split("T")[0];
  const getNextWeekStr = (days = 3) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split("T")[0];
  };

  const initialFrom = searchParams.get("from") || getTodayStr();
  const initialTo = searchParams.get("to") || getNextWeekStr(3);
  const initialGuests = parseInt(searchParams.get("guests") || "2");

  const [fromDate, setFromDate] = useState(initialFrom);
  const [toDate, setToDate] = useState(initialTo);
  const [guestsCount, setGuestsCount] = useState(initialGuests);
  const [roomTypeFilter, setRoomTypeFilter] = useState("");

  const [availableRooms, setAvailableRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // Modal booking state
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Perform availability search against FastAPI backend
  const fetchAvailability = async () => {
    if (new Date(toDate) <= new Date(fromDate)) {
      showWarning("Check-out date must be after Check-in date");
      return;
    }

    setLoadingRooms(true);
    setHasSearched(true);
    try {
      const data = await propertyService.getAvailability(
        idNum,
        fromDate,
        toDate,
        roomTypeFilter || null
      );
      setAvailableRooms(data.items || []);
    } catch (err) {
      showError(err.message || "Failed to check room availability");
      setAvailableRooms([]);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    // Initial fetch on mount
    fetchAvailability();
  }, [idNum]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams({ from: fromDate, to: toDate, guests: guestsCount });
    fetchAvailability();
  };

  // Confirm booking action
  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      showWarning("Please log in to complete your booking reservation.");
      navigate(`/login?redirect=/properties/${idNum}`);
      return;
    }

    if (!guestId) {
      showError("Guest account not found. Please log in as a guest.");
      return;
    }

    setBookingLoading(true);
    try {
      const payload = {
        property_id: idNum,
        guest_id: parseInt(guestId),
        room_id: selectedRoomForBooking.room_id,
        check_in: fromDate,
        check_out: toDate,
        guest_count: guestsCount
      };

      const res = await bookingService.createBooking(payload);
      showSuccess(`Booking reservation #${res.booking_id} created successfully!`);
      setSelectedRoomForBooking(null);
      // Navigate to payment page for booking
      navigate(`/bookings/${res.booking_id}/payment`);
    } catch (err) {
      showError(err.message || "Failed to create booking reservation.");
    } finally {
      setBookingLoading(false);
    }
  };

  const nights = calculateNights(fromDate, toDate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Title & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#C59B27] uppercase tracking-widest mb-1">
            <MapPin className="w-4 h-4" />
            <span>{meta.city}, South India</span>
          </div>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold text-[#1C1917]">
            {meta.name}
          </h1>
          <p className="text-sm text-[#57534E] mt-1">{meta.locationText}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-[#2C4A3E]/10 border border-[#2C4A3E]/20 px-4 py-2 rounded-2xl flex items-center gap-2">
            <Star className="w-5 h-5 fill-[#C59B27] text-[#C59B27]" />
            <span className="font-bold text-[#1C1917]">{meta.starRating}.0 Rating</span>
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Main Banner Photo */}
        <div className="lg:col-span-8 h-[420px] rounded-3xl overflow-hidden bg-stone-200 shadow-md">
          <img
            src={meta.gallery[selectedPhotoIndex] || meta.heroImage}
            alt={meta.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
        </div>

        {/* Thumbnail Gallery */}
        <div className="lg:col-span-4 grid grid-cols-2 lg:grid-cols-1 gap-4 h-[420px]">
          {meta.gallery.slice(0, 3).map((imgUrl, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedPhotoIndex(idx)}
              className={`relative h-[130px] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                selectedPhotoIndex === idx ? "border-[#C59B27] ring-2 ring-[#C59B27]/40 scale-[0.98]" : "border-transparent opacity-85 hover:opacity-100"
              }`}
            >
              <img src={imgUrl} alt="Resort Thumbnail" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      </div>

      {/* Overview & Amenities Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8 space-y-8">
          
          <div className="space-y-4">
            <h2 className="font-serif text-2xl font-bold text-[#1C1917]">About the Resort</h2>
            <p className="text-stone-600 text-sm leading-relaxed">
              {meta.description}
            </p>
          </div>

          {/* Amenities List */}
          <div className="space-y-4 pt-4 border-t border-[#E8DFD1]">
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Signature Amenities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {meta.amenities.map((amenity, idx) => (
                <div key={idx} className="flex items-center gap-2.5 bg-[#FAF8F5] p-3 rounded-2xl border border-[#E8DFD1]/60 text-xs font-semibold text-[#1C1917]">
                  <Check className="w-4 h-4 text-[#2C4A3E]" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Quick Help Card */}
        <div className="lg:col-span-4">
          <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E8DFD1] space-y-4">
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Hospitality Guarantee</h3>
            <ul className="space-y-3 text-xs text-[#57534E]">
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2C4A3E] shrink-0 mt-0.5" />
                <span>Backend authoritative rates & live check-in calendar.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2C4A3E] shrink-0 mt-0.5" />
                <span>Complimentary high-speed Wi-Fi and artisan breakfast.</span>
              </li>
              <li className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#2C4A3E] shrink-0 mt-0.5" />
                <span>Flexible cancellation up to 24 hours prior to check-in.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* AVAILABILITY SEARCH & ROOM SELECTION SECTION */}
      <section className="bg-white rounded-3xl border border-[#E8DFD1] p-8 shadow-sm space-y-8">
        <div className="space-y-2 border-b border-[#E8DFD1] pb-6">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">Live Backend Inventory</span>
          <h2 className="font-serif text-3xl font-bold text-[#1C1917]">Check Room Availability</h2>
        </div>

        {/* Availability Form */}
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end bg-[#FAF8F5] p-6 rounded-2xl border border-[#E8DFD1]">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#57534E] uppercase">Check-In</label>
            <input
              type="date"
              min={getTodayStr()}
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full bg-white p-3 rounded-xl border border-[#E8DFD1] text-sm font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#57534E] uppercase">Check-Out</label>
            <input
              type="date"
              min={fromDate || getTodayStr()}
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full bg-white p-3 rounded-xl border border-[#E8DFD1] text-sm font-medium"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-[#57534E] uppercase">Room Type Filter</label>
            <select
              value={roomTypeFilter}
              onChange={(e) => setRoomTypeFilter(e.target.value)}
              className="w-full bg-white p-3 rounded-xl border border-[#E8DFD1] text-sm font-medium"
            >
              <option value="">All Room Types</option>
              <option value="Standard">Standard</option>
              <option value="Deluxe">Deluxe</option>
              <option value="Suite">Suite</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loadingRooms}
            className="py-3 px-6 bg-[#2C4A3E] hover:bg-[#3D6454] text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          >
            <Search className="w-4 h-4 text-[#C59B27]" />
            <span>{loadingRooms ? "Checking..." : "Check Availability"}</span>
          </button>
        </form>

        {/* Results List */}
        {loadingRooms ? (
          <div className="space-y-4 py-8 text-center">
            <div className="w-10 h-10 border-4 border-[#2C4A3E] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs font-medium text-stone-500">Querying backend real-time availability...</p>
          </div>
        ) : availableRooms.length > 0 ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-xs text-stone-500">
              <span>Showing {availableRooms.length} available room(s) for {fromDate} to {toDate} ({nights} night(s))</span>
            </div>
            <div className="space-y-6">
              {availableRooms.map((room) => (
                <RoomCard
                  key={room.room_id}
                  room={room}
                  property={meta}
                  checkIn={fromDate}
                  checkOut={toDate}
                  onSelectRoom={(r) => setSelectedRoomForBooking(r)}
                />
              ))}
            </div>
          </div>
        ) : hasSearched ? (
          <div className="p-8 text-center bg-[#FAF8F5] rounded-2xl border border-rose-100 space-y-3">
            <Info className="w-8 h-8 text-rose-500 mx-auto" />
            <h4 className="font-serif text-lg font-bold text-stone-900">No Rooms Available</h4>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              There are no available rooms at {meta.name} for the selected dates ({fromDate} to {toDate}). Please try different stay dates.
            </p>
          </div>
        ) : null}
      </section>

      {/* BOOKING CONFIRMATION MODAL */}
      {selectedRoomForBooking && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 space-y-6 shadow-2xl relative border border-[#E8DFD1]">
            <button
              onClick={() => setSelectedRoomForBooking(null)}
              className="absolute top-6 right-6 p-2 text-stone-400 hover:text-stone-800 rounded-full hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">Reservation Summary</span>
              <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Confirm Your Stay</h3>
            </div>

            <div className="space-y-3 bg-[#FAF8F5] p-5 rounded-2xl border border-[#E8DFD1] text-xs space-y-2">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Resort</span>
                <span className="font-semibold text-stone-900">{meta.name} ({meta.city})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Selected Room</span>
                <span className="font-semibold text-stone-900">Room #{selectedRoomForBooking.room_number} ({selectedRoomForBooking.room_type?.name})</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Stay Duration</span>
                <span className="font-semibold text-stone-900">{formatDate(fromDate)} – {formatDate(toDate)} ({nights} nights)</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Guests</span>
                <span className="font-semibold text-stone-900">{guestsCount} Guest(s)</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-[#2C4A3E]">
                <span>Total Stay Rate (Backend Computed)</span>
                <span>{formatCurrency(parseFloat(selectedRoomForBooking.total_rate))}</span>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600 shrink-0" />
                <span>You will be prompted to log in or register before finalizing your booking.</span>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedRoomForBooking(null)}
                className="w-1/2 py-3 bg-stone-100 text-stone-700 font-semibold text-xs rounded-xl hover:bg-stone-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBooking}
                disabled={bookingLoading}
                className="w-1/2 py-3 bg-[#2C4A3E] text-white font-semibold text-xs rounded-xl hover:bg-[#3D6454] transition-all flex items-center justify-center gap-2 shadow-md"
              >
                <span>{bookingLoading ? "Reserving..." : "Proceed to Payment"}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
