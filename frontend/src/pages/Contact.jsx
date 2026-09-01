import React, { useState } from "react";
import { useToast } from "../context/ToastContext";
import { Mail, Phone, MapPin, Send, MessageSquare, Clock } from "lucide-react";

export const Contact = () => {
  const { showSuccess } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      showSuccess("Thank you for contacting Kaveri Stays! Our concierge desk will respond within 2 hours.");
      setName("");
      setEmail("");
      setMessage("");
    }, 600);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">Concierge Desk</span>
        <h1 className="font-serif text-4xl sm:text-5xl font-bold text-[#1C1917]">Get in Touch</h1>
        <p className="text-stone-600 text-xs sm:text-sm">
          Have a question about room rates, special occasion arrangements, or resort transfers? We are here to assist.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF8F5] p-8 rounded-3xl border border-[#E8DFD1] space-y-6">
            <h3 className="font-serif text-xl font-bold text-[#1C1917]">Resort Contacts</h3>

            <div className="space-y-4 text-xs text-stone-600">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C59B27] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1C1917]">Central Reservation Desk</p>
                  <p>Kaveri Hospitality Promenade, Lavelle Road, Bangalore 560001</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-[#2C4A3E] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1C1917]">Direct Support</p>
                  <p>+91 (080) 4567-8900 / Toll Free: 1800-KAVERI-STAYS</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-[#C59B27] shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1C1917]">Email Concierge</p>
                  <p>reservations@kaveristays.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#1C1917]">Hours</p>
                  <p>24 Hours / 7 Days a Week</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-7 bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-6">
          <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Send an Inquiry</h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#57534E] uppercase">Your Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rohan Sharma"
                  className="w-full p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-sm text-[#1C1917] focus:outline-none focus:border-[#2C4A3E]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-[#57534E] uppercase">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rohan@example.com"
                  className="w-full p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-sm text-[#1C1917] focus:outline-none focus:border-[#2C4A3E]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-[#57534E] uppercase">Message</label>
              <textarea
                rows={5}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your upcoming trip or inquiry..."
                className="w-full p-3 bg-[#FAF8F5] rounded-xl border border-[#E8DFD1] text-sm text-[#1C1917] focus:outline-none focus:border-[#2C4A3E]"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="py-3 px-6 bg-[#2C4A3E] hover:bg-[#3D6454] text-white font-semibold text-sm rounded-xl flex items-center gap-2 shadow-md transition-all"
            >
              <Send className="w-4 h-4 text-[#C59B27]" />
              <span>{loading ? "Sending..." : "Submit Inquiry"}</span>
            </button>
          </form>
        </div>
      </div>

    </div>
  );
};
