import React from "react";
import { Link } from "react-router-dom";
import { Building2, Phone, Mail, MapPin, Globe, Share2, MessageCircle, ShieldCheck } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-[#1C1917] text-[#FAF8F5] pt-16 pb-12 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-stone-800">
          
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#2C4A3E] text-[#C59B27] flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6" />
              </div>
              <span className="font-serif text-2xl font-bold tracking-tight text-white">
                Kaveri Stays
              </span>
            </div>
            <p className="text-stone-400 text-sm leading-relaxed max-w-sm">
              Stay beautifully. Travel effortlessly. Experience authentic South Indian hospitality across curated mountain sanctuaries, lakeside villas, and plantation retreats.
            </p>
            <div className="flex items-center gap-4 text-stone-400 pt-2">
              <a href="#website" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-[#2C4A3E] hover:text-white transition-colors" title="Official Portal">
                <Globe className="w-4 h-4" />
              </a>
              <a href="#share" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-[#2C4A3E] hover:text-white transition-colors" title="Share Stays">
                <Share2 className="w-4 h-4" />
              </a>
              <a href="#chat" className="w-9 h-9 rounded-full bg-stone-800 flex items-center justify-center hover:bg-[#2C4A3E] hover:text-white transition-colors" title="Concierge Chat">
                <MessageCircle className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Stays Destinations */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Our Destinations</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/properties/1" className="hover:text-[#C59B27] transition-colors">Kaveri Hilltop (Ooty)</Link>
              </li>
              <li>
                <Link to="/properties/2" className="hover:text-[#C59B27] transition-colors">Kaveri Backwater (Alleppey)</Link>
              </li>
              <li>
                <Link to="/properties/3" className="hover:text-[#C59B27] transition-colors">Kaveri Riverside (Coorg)</Link>
              </li>
              <li>
                <Link to="/properties" className="text-[#C59B27] hover:underline font-medium block pt-1">
                  View All Stays &rarr;
                </Link>
              </li>
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm text-stone-400">
              <li>
                <Link to="/" className="hover:text-[#C59B27] transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-[#C59B27] transition-colors">About Our Brand</Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-[#C59B27] transition-colors">Guest Support & Contact</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-[#C59B27] transition-colors">Guest Portal Login</Link>
              </li>
              <li>
                <Link to="/staff" className="hover:text-[#C59B27] transition-colors text-xs font-semibold text-stone-500 uppercase tracking-wider block pt-2">
                  Staff & Management
                </Link>
              </li>
            </ul>
          </div>

          {/* Concierge Contact */}
          <div>
            <h4 className="font-serif text-lg font-semibold text-white mb-4">Concierge Desk</h4>
            <div className="space-y-3 text-sm text-stone-400">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#C59B27] shrink-0 mt-1" />
                <span>HQ: Promenade Heights, Bangalore, India</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-[#C59B27] shrink-0" />
                <span>+91 (080) 4567-8900</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#C59B27] shrink-0" />
                <span>concierge@kaveristays.com</span>
              </div>
              <div className="pt-2 flex items-center gap-2 text-xs text-stone-500">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Official Kaveri Stays Hospitality</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-stone-500">
          <p>&copy; {new Date().getFullYear()} Kaveri Stays Hospitality Ltd. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-stone-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-stone-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-stone-400 cursor-pointer">Cancellation Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
