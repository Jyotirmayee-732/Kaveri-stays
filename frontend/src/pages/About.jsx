import React from "react";
import { Link } from "react-router-dom";
import { Building2, Sparkles, HeartHandshake, ShieldCheck, Award, ArrowRight } from "lucide-react";

export const About = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">
          The Heritage of Kaveri Stays
        </span>
        <h1 className="font-serif text-4xl sm:text-6xl font-bold text-[#1C1917]">
          Crafting Authentic South Indian Sanctuaries
        </h1>
        <p className="text-stone-600 text-sm sm:text-base leading-relaxed">
          Founded on the philosophy of <span className="italic">"Atithi Devo Bhava"</span> (Guest is Divine), Kaveri Stays blends classical regional architecture with modern luxury.
        </p>
      </div>

      {/* Brand Image Banner */}
      <div className="relative h-96 rounded-3xl overflow-hidden shadow-2xl">
        <img
          src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80"
          alt="Kaveri Stays Resort Grounds"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-8 sm:p-12">
          <div className="text-white space-y-2 max-w-2xl">
            <h3 className="font-serif text-2xl sm:text-3xl font-bold">Inspired by River Kaveri</h3>
            <p className="text-stone-300 text-xs sm:text-sm">
              Flowing through verdant hills, ancient forests, and peaceful lagoons, the Kaveri river defines our locations.
            </p>
          </div>
        </div>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#2C4A3E]/10 text-[#2C4A3E] flex items-center justify-center">
            <HeartHandshake className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1C1917]">Warm Hospitality</h3>
          <p className="text-stone-500 text-xs leading-relaxed">
            Every guest is welcomed with traditional tea, fresh spices, and personal attention from our resort concierges.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#C59B27]/10 text-[#C59B27] flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1C1917]">Unspoiled Settings</h3>
          <p className="text-stone-500 text-xs leading-relaxed">
            Nestled far from urban noise: high-altitude tea gardens in Ooty, tranquil Alleppey waters, and Coorg coffee estates.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-xl font-bold text-[#1C1917]">Authoritative Booking</h3>
          <p className="text-stone-500 text-xs leading-relaxed">
            Our state-of-the-art reservation system communicates directly with property front desks to guarantee live rates and inventory.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-[#FAF8F5] p-10 rounded-3xl border border-[#E8DFD1] flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <h3 className="font-serif text-2xl font-bold text-[#1C1917]">Experience Kaveri Stays</h3>
          <p className="text-stone-600 text-xs">Discover our three premier resort locations across Tamil Nadu, Kerala, and Karnataka.</p>
        </div>
        <Link
          to="/properties"
          className="px-6 py-3.5 bg-[#2C4A3E] text-white rounded-xl font-semibold text-xs flex items-center gap-2 hover:bg-[#3D6454] transition-all shadow-md shrink-0"
        >
          <span>Explore Properties</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};
