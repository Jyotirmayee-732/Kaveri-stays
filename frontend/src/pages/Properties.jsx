import React, { useState, useEffect } from "react";
import { propertyService } from "../services/propertyService";
import { PropertyCard } from "../components/PropertyCard";
import { PropertySkeletonCard } from "../components/LoadingSkeleton";
import { Search, Filter, MapPin, Building2, SlidersHorizontal } from "lucide-react";

export const Properties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("all");
  const [maxPrice, setMaxPrice] = useState(10000);

  useEffect(() => {
    const fetchProperties = async () => {
      setLoading(true);
      try {
        const data = await propertyService.getProperties();
        setProperties(data);
      } catch (err) {
        console.error("Failed to load properties", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  }, []);

  const filteredProperties = properties.filter((prop) => {
    const matchesSearch =
      prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCity = selectedCity === "all" || prop.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesPrice = (prop.startingPrice || 0) <= maxPrice;

    return matchesSearch && matchesCity && matchesPrice;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header Banner */}
      <div className="bg-[#2C4A3E] text-white rounded-3xl p-8 sm:p-12 space-y-4 shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="text-xs font-bold uppercase tracking-widest text-[#C59B27] block">
            South Indian Hospitality Collection
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-white mt-1">
            Our Luxury Stays & Resorts
          </h1>
          <p className="text-stone-200 text-sm sm:text-base leading-relaxed mt-2">
            Explore handpicked properties in Ooty, Alleppey, and Coorg. Book direct for real-time room availability and best rates.
          </p>
        </div>
      </div>

      {/* Filter and Search Control Bar */}
      <div className="bg-white p-6 rounded-3xl border border-[#E8DFD1] shadow-xs space-y-4 md:space-y-0 md:flex items-center justify-between gap-4">
        
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-5 h-5 text-stone-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by resort name, city, or feature..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-[#FAF8F5] rounded-2xl border border-[#E8DFD1] text-sm text-[#1C1917] placeholder-stone-400 focus:outline-none focus:border-[#2C4A3E] transition-colors"
          />
        </div>

        {/* City Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedCity("all")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCity === "all"
                ? "bg-[#2C4A3E] text-white shadow-sm"
                : "bg-[#FAF8F5] text-stone-600 border border-[#E8DFD1] hover:bg-[#E8DFD1]/50"
            }`}
          >
            All Cities
          </button>
          <button
            onClick={() => setSelectedCity("Ooty")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCity === "Ooty"
                ? "bg-[#2C4A3E] text-white shadow-sm"
                : "bg-[#FAF8F5] text-stone-600 border border-[#E8DFD1] hover:bg-[#E8DFD1]/50"
            }`}
          >
            Ooty
          </button>
          <button
            onClick={() => setSelectedCity("Alleppey")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCity === "Alleppey"
                ? "bg-[#2C4A3E] text-white shadow-sm"
                : "bg-[#FAF8F5] text-stone-600 border border-[#E8DFD1] hover:bg-[#E8DFD1]/50"
            }`}
          >
            Alleppey
          </button>
          <button
            onClick={() => setSelectedCity("Coorg")}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              selectedCity === "Coorg"
                ? "bg-[#2C4A3E] text-white shadow-sm"
                : "bg-[#FAF8F5] text-stone-600 border border-[#E8DFD1] hover:bg-[#E8DFD1]/50"
            }`}
          >
            Coorg
          </button>
        </div>

      </div>

      {/* Grid of Properties */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <PropertySkeletonCard />
          <PropertySkeletonCard />
          <PropertySkeletonCard />
        </div>
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProperties.map((prop) => (
            <PropertyCard key={prop.id} property={prop} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-[#E8DFD1] p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-[#FAF8F5] text-stone-400 rounded-2xl flex items-center justify-center mx-auto">
            <Building2 className="w-8 h-8" />
          </div>
          <h3 className="font-serif text-2xl font-bold text-[#1C1917]">No Stays Found</h3>
          <p className="text-stone-500 text-xs leading-relaxed">
            We couldn't find any properties matching your search criteria. Try clearing your filters or searching for a different destination.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCity("all");
            }}
            className="px-5 py-2.5 bg-[#2C4A3E] text-white text-xs font-semibold rounded-xl hover:bg-[#3D6454] transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}

    </div>
  );
};
