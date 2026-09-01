import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Star, ArrowRight, Shield } from "lucide-react";
import { PROPERTY_METADATA } from "../utils/constants";
import { formatCurrency } from "../utils/formatters";

export const PropertyCard = ({ property }) => {
  const meta = PROPERTY_METADATA[property.id] || {
    heroImage: property.image,
    description: property.description,
    amenities: property.amenities || []
  };

  return (
    <div className="group bg-white rounded-3xl border border-[#E8DFD1] overflow-hidden shadow-xs hover:shadow-2xl transition-all duration-500 flex flex-col h-full transform hover:-translate-y-1">
      {/* Property Image Container */}
      <div className="relative h-64 w-full overflow-hidden bg-stone-200">
        <img
          src={meta.heroImage || property.image}
          alt={property.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* City Badge */}
        <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-[#1C1917] flex items-center gap-1.5 shadow-md">
          <MapPin className="w-3.5 h-3.5 text-[#C59B27]" />
          {property.city}
        </div>

        {/* Star Rating Badge */}
        <div className="absolute top-4 right-4 bg-[#1C1917]/80 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-semibold text-white flex items-center gap-1 shadow-md">
          <Star className="w-3.5 h-3.5 fill-[#C59B27] text-[#C59B27]" />
          <span>{property.starRating || 5}.0</span>
        </div>

        {/* Tagline on image */}
        {meta.tagline && (
          <div className="absolute bottom-4 left-4 right-4 text-white text-xs font-medium truncate drop-shadow-sm">
            {meta.tagline}
          </div>
        )}
      </div>

      {/* Property Details Content */}
      <div className="p-6 flex flex-col flex-grow justify-between space-y-5">
        <div className="space-y-2">
          <h3 className="font-serif text-2xl font-bold text-[#1C1917] group-hover:text-[#2C4A3E] transition-colors">
            {property.name}
          </h3>
          <p className="text-sm text-[#57534E] line-clamp-2 leading-relaxed">
            {meta.description || property.description}
          </p>
        </div>

        {/* Amenities Chips */}
        {meta.amenities && meta.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {meta.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="px-2.5 py-1 bg-[#FAF8F5] text-[#57534E] text-[11px] font-medium rounded-lg border border-[#E8DFD1]/60"
              >
                {amenity}
              </span>
            ))}
            {meta.amenities.length > 3 && (
              <span className="px-2 py-1 text-[11px] font-medium text-[#C59B27]">
                +{meta.amenities.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Pricing and Action */}
        <div className="pt-4 border-t border-[#E8DFD1]/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase tracking-wider text-[#57534E] block">
              Rates Starting From
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold text-[#2C4A3E]">
                {formatCurrency(property.startingPrice || 3500)}
              </span>
              <span className="text-xs text-[#57534E]">/ night</span>
            </div>
          </div>

          <Link
            to={`/properties/${property.id}`}
            className="px-5 py-2.5 bg-[#2C4A3E] hover:bg-[#3D6454] text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
          >
            <span>View Stays</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
