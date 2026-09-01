import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { SearchWidget } from "../components/SearchWidget";
import { PropertyCard } from "../components/PropertyCard";
import { propertyService } from "../services/propertyService";
import { 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  CreditCard, 
  Award, 
  Star, 
  ArrowRight, 
  Compass, 
  Quote 
} from "lucide-react";

export const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      try {
        const data = await propertyService.getProperties();
        setProperties(data);
      } catch (err) {
        console.error("Failed to load properties", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, []);

  return (
    <div className="space-y-20 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative min-h-[85vh] flex items-center justify-center bg-stone-900 text-white pt-12 pb-24 px-4 overflow-hidden rounded-b-[40px] shadow-2xl">
        {/* Hero Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85"
            alt="Kaveri Stays Resort"
            className="w-full h-full object-cover opacity-40 scale-105 animate-in fade-in duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917] via-[#1C1917]/50 to-transparent"></div>
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#C59B27]/20 border border-[#C59B27]/40 backdrop-blur-md text-[#F59E0B] text-xs font-semibold uppercase tracking-widest shadow-lg">
            <Sparkles className="w-4 h-4" />
            <span>South India's Premier Resort Collection</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-tight">
            Stay Beautifully. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FAF8F5] via-[#E8DFD1] to-[#C59B27]">
              Travel Effortlessly.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-stone-300 max-w-2xl mx-auto font-light leading-relaxed">
            Immerse yourself in authentic Indian hospitality. From mist-covered Nilgiri tea estates to peaceful backwater lagoons and riverfront coffee groves.
          </p>

          {/* Booking / Search Widget Container */}
          <div className="pt-6 max-w-4xl mx-auto">
            <SearchWidget />
          </div>
        </div>
      </section>

      {/* FEATURED PROPERTIES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">
            Sanctuaries of Luxury
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
            Featured Kaveri Destinations
          </h2>
          <p className="text-sm text-[#57534E]">
            Each stay is meticulously designed to reflect the natural heritage and tranquil beauty of South India.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      </section>

      {/* WHY CHOOSE KAVERI STAYS */}
      <section className="bg-[#E8DFD1]/30 py-20 border-y border-[#E8DFD1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-2xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2C4A3E]">
              Excellence in Hospitality
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">
              Why Choose Kaveri Stays
            </h2>
            <p className="text-sm text-[#57534E]">
              We redefine luxury through personalized concierge care, transparent booking, and seamless comfort.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#2C4A3E]/10 text-[#2C4A3E] flex items-center justify-center mx-auto">
                <Award className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">Comfortable Rooms</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Plush bedding, handcrafted wooden furnishings, rainfall showers, and breathtaking private balcony views.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-[#C59B27]/10 text-[#C59B27] flex items-center justify-center mx-auto">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">Trusted Service</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                24/7 dedicated butler service, authentic local culinary dining, and curated regional excursion guides.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <Clock className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">Easy Booking</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Real-time backend availability check, transparent nightly rate calculations, and instant digital confirmations.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4 text-center hover:shadow-lg transition-shadow">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center mx-auto">
                <CreditCard className="w-7 h-7" />
              </div>
              <h3 className="font-serif text-xl font-bold text-[#1C1917]">Secure Payments</h3>
              <p className="text-xs text-[#57534E] leading-relaxed">
                Idempotent payment gateway supporting Card, UPI, and Bank Transfers with instant receipt generation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* EXPLORE OUR STAYS BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row items-end justify-between gap-4 border-b border-[#E8DFD1] pb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">Curated Collections</span>
            <h2 className="font-serif text-3xl font-bold text-[#1C1917] mt-1">Explore Our Stays</h2>
          </div>
          <Link to="/properties" className="text-sm font-semibold text-[#2C4A3E] hover:underline flex items-center gap-1">
            <span>Browse All Properties</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer shadow-md">
            <img
              src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80"
              alt="Mountain Retreats"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end">
              <span className="text-xs font-bold text-[#C59B27] uppercase tracking-wider">Ooty • Highland</span>
              <h3 className="font-serif text-2xl font-bold text-white">Hilltop Villas & Tea Gardens</h3>
              <p className="text-xs text-stone-300 mt-1">Cozy fireplaces and high-altitude mist.</p>
            </div>
          </div>

          <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer shadow-md">
            <img
              src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
              alt="Waterfront Resorts"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end">
              <span className="text-xs font-bold text-[#C59B27] uppercase tracking-wider">Alleppey • Lagoons</span>
              <h3 className="font-serif text-2xl font-bold text-white">Backwater Sanctuary Suites</h3>
              <p className="text-xs text-stone-300 mt-1">Infinity lake decks and sunset cruises.</p>
            </div>
          </div>

          <div className="relative h-80 rounded-3xl overflow-hidden group cursor-pointer shadow-md">
            <img
              src="https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=800&q=80"
              alt="Coffee Estates"
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-6 flex flex-col justify-end">
              <span className="text-xs font-bold text-[#C59B27] uppercase tracking-wider">Coorg • Plantation</span>
              <h3 className="font-serif text-2xl font-bold text-white">Riverside Coffee Estates</h3>
              <p className="text-xs text-stone-300 mt-1">Open-air jacuzzis and aroma walks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* GUEST REVIEWS SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27]">Guest Experiences</span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#1C1917]">Stories from Our Guests</h2>
          <p className="text-sm text-[#57534E]">Real reviews from verified stays across Kaveri properties.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4 relative">
            <Quote className="w-10 h-10 text-[#C59B27]/20 absolute top-6 right-6" />
            <div className="flex items-center gap-1 text-[#C59B27]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#C59B27]" />
              ))}
            </div>
            <p className="text-sm text-[#1C1917] italic leading-relaxed">
              "Kaveri Hilltop in Ooty was pure magic. Waking up to tea estate clouds right outside our balcony was unforgettable. Truly world-class service!"
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1C1917]">Ananya Sharma</p>
                <p className="text-[11px] text-stone-500">Verified Guest • Kaveri Hilltop</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4 relative">
            <Quote className="w-10 h-10 text-[#C59B27]/20 absolute top-6 right-6" />
            <div className="flex items-center gap-1 text-[#C59B27]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#C59B27]" />
              ))}
            </div>
            <p className="text-sm text-[#1C1917] italic leading-relaxed">
              "The backwater views in Alleppey were breath-taking. Seamless booking process and the staff arranged a private sunset boat trip for us."
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1C1917]">Vikram Rao</p>
                <p className="text-[11px] text-stone-500">Verified Guest • Kaveri Backwater</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4 relative">
            <Quote className="w-10 h-10 text-[#C59B27]/20 absolute top-6 right-6" />
            <div className="flex items-center gap-1 text-[#C59B27]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-[#C59B27]" />
              ))}
            </div>
            <p className="text-sm text-[#1C1917] italic leading-relaxed">
              "Coorg Kaveri Riverside was standard of luxury redefined. Beautiful wooden suite, excellent Kodava food, and crisp mountain river breezes."
            </p>
            <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1C1917]">Deepika Nair</p>
                <p className="text-[11px] text-stone-500">Verified Guest • Kaveri Riverside</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#2C4A3E] rounded-3xl p-10 sm:p-16 text-white text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight">
              Ready for Your Next Stay?
            </h2>
            <p className="text-stone-200 text-sm sm:text-base leading-relaxed">
              Book directly with Kaveri Stays for guaranteed best rates, complimentary breakfast upgrades, and flexible cancellation.
            </p>
            <div className="pt-4">
              <Link
                to="/properties"
                className="inline-flex items-center gap-3 px-8 py-4 bg-[#C59B27] hover:bg-[#B0881E] text-white rounded-2xl font-bold text-sm shadow-xl transition-all transform hover:-translate-y-1"
              >
                <Compass className="w-5 h-5" />
                <span>Explore All Stays</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
