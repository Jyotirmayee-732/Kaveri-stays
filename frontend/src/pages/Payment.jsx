import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { bookingService } from "../services/bookingService";
import { paymentService } from "../services/paymentService";
import { useToast } from "../context/ToastContext";
import { PROPERTY_METADATA } from "../utils/constants";
import { formatDate, formatCurrency } from "../utils/formatters";
import { 
  CreditCard, 
  ShieldCheck, 
  Building2, 
  Calendar, 
  ArrowLeft, 
  CheckCircle2, 
  QrCode, 
  Landmark, 
  Banknote,
  Lock
} from "lucide-react";

export const Payment = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { showSuccess, showError } = useToast();

  const idNum = parseInt(bookingId);

  const [booking, setBooking] = useState(null);
  const [paymentMeta, setPaymentMeta] = useState(null);
  const [loading, setLoading] = useState(true);

  // Form State
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [referenceNotes, setReferenceNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Generate UUID for Idempotency
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  const fetchPaymentDetails = async () => {
    setLoading(true);
    try {
      const bData = await bookingService.getBookingDetail(idNum);
      setBooking(bData);

      const pData = await paymentService.getPayments(idNum);
      setPaymentMeta(pData);

      const bal = parseFloat(pData.balance || "0");
      if (bal > 0) {
        setAmount(bal.toFixed(2));
      } else {
        setAmount("0.00");
      }
    } catch (err) {
      showError(err.message || "Failed to load payment details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPaymentDetails();
  }, [idNum]);

  const handleSubmitPayment = async (e) => {
    e.preventDefault();

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) {
      showError("Please enter a valid payment amount greater than 0.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        amount: amtNum,
        method: paymentMethod,
        reference: referenceNotes || `Payment for booking #${idNum}`
      };

      // POST /bookings/{booking_id}/payments with Idempotency-Key
      const res = await paymentService.createPayment(idNum, payload, idempotencyKey);
      showSuccess(`Payment of ${formatCurrency(res.amount)} completed successfully!`);

      // Refresh payment metadata
      await fetchPaymentDetails();

      // Navigate back to booking details
      setTimeout(() => {
        navigate(`/bookings/${idNum}`);
      }, 1500);
    } catch (err) {
      if (err.status === 409) {
        showError(err.message || "Idempotent payment conflict or overpayment detected.");
      } else if (err.status === 429) {
        showError("Too many payment attempts. Please wait a minute before retrying.");
      } else {
        showError(err.message || "Payment processing failed. Please verify your details.");
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
  const balanceNum = parseFloat(paymentMeta?.balance || "0");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      <div>
        <Link to={`/bookings/${idNum}`} className="inline-flex items-center gap-2 text-xs font-semibold text-[#2C4A3E] hover:underline">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Reservation Details</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Booking Checkout Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF8F5] p-6 rounded-3xl border border-[#E8DFD1] space-y-6 shadow-xs">
            
            <div className="space-y-1 border-b border-[#E8DFD1] pb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">Checkout Summary</span>
              <h2 className="font-serif text-2xl font-bold text-[#1C1917]">{propertyMeta.name}</h2>
              <p className="text-xs text-stone-500">{propertyMeta.locationText}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Booking ID</span>
                <span className="font-bold text-stone-900">#{booking.booking_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Stay Range</span>
                <span className="font-semibold text-stone-900">{formatDate(booking.check_in)} – {formatDate(booking.check_out)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-stone-200">
                <span className="text-stone-500">Already Paid</span>
                <span className="font-bold text-emerald-700">{formatCurrency(paymentMeta?.total_paid || 0)}</span>
              </div>
              <div className="flex justify-between py-2 text-sm font-bold text-[#2C4A3E]">
                <span>Remaining Balance</span>
                <span>{formatCurrency(balanceNum)}</span>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Idempotent 256-Bit SSL Encrypted Checkout</span>
            </div>

          </div>
        </div>

        {/* Right Column: Payment Method & Action Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xl space-y-6">
          <div className="space-y-1">
            <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Payment Details</h3>
            <p className="text-xs text-stone-500">Select your preferred payment method and enter amount to pay.</p>
          </div>

          <form onSubmit={handleSubmitPayment} className="space-y-6">
            
            {/* Amount Field */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#57534E] uppercase">Amount to Pay (INR ₹)</label>
              <input
                type="number"
                step="0.01"
                min="1"
                max={balanceNum > 0 ? balanceNum : 999999}
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-lg font-bold text-[#2C4A3E] focus:outline-none focus:border-[#2C4A3E]"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-[#57534E] uppercase block">Select Payment Method</label>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === "card"
                      ? "border-[#2C4A3E] bg-[#2C4A3E]/10 ring-2 ring-[#2C4A3E]/30"
                      : "border-[#E8DFD1] bg-[#FAF8F5] hover:bg-[#E8DFD1]/30"
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-[#2C4A3E]" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Credit / Debit Card</span>
                    <span className="text-[10px] text-stone-500">Visa, Mastercard, RuPay</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("upi")}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === "upi"
                      ? "border-[#2C4A3E] bg-[#2C4A3E]/10 ring-2 ring-[#2C4A3E]/30"
                      : "border-[#E8DFD1] bg-[#FAF8F5] hover:bg-[#E8DFD1]/30"
                  }`}
                >
                  <QrCode className="w-5 h-5 text-[#C59B27]" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">UPI Instant</span>
                    <span className="text-[10px] text-stone-500">GPay, PhonePe, Paytm</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("bank_transfer")}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === "bank_transfer"
                      ? "border-[#2C4A3E] bg-[#2C4A3E]/10 ring-2 ring-[#2C4A3E]/30"
                      : "border-[#E8DFD1] bg-[#FAF8F5] hover:bg-[#E8DFD1]/30"
                  }`}
                >
                  <Landmark className="w-5 h-5 text-indigo-600" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Net Banking</span>
                    <span className="text-[10px] text-stone-500">NEFT / IMPS</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("cash")}
                  className={`p-4 rounded-2xl border text-left flex items-center gap-3 transition-all ${
                    paymentMethod === "cash"
                      ? "border-[#2C4A3E] bg-[#2C4A3E]/10 ring-2 ring-[#2C4A3E]/30"
                      : "border-[#E8DFD1] bg-[#FAF8F5] hover:bg-[#E8DFD1]/30"
                  }`}
                >
                  <Banknote className="w-5 h-5 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-stone-900 block">Cash at Desk</span>
                    <span className="text-[10px] text-stone-500">Front desk settlement</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Reference notes */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#57534E] uppercase">Reference Notes (Optional)</label>
              <input
                type="text"
                value={referenceNotes}
                onChange={(e) => setReferenceNotes(e.target.value)}
                placeholder="Transaction reference ID or memo"
                className="w-full p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-xs text-[#1C1917]"
              />
            </div>

            <button
              type="submit"
              disabled={submitting || balanceNum <= 0}
              className="w-full py-4 bg-[#2C4A3E] hover:bg-[#3D6454] text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
            >
              <ShieldCheck className="w-5 h-5 text-[#C59B27]" />
              <span>{submitting ? "Processing Payment..." : `Pay ${formatCurrency(parseFloat(amount || "0"))} Now`}</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};
