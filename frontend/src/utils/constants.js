// Property details metadata, high-resolution imagery, and amenities mapping
export const PROPERTY_METADATA = {
  1: {
    name: "Kaveri Hilltop",
    city: "Ooty",
    tagline: "Highland Elegance & Misty Valley Panoramas",
    description: "Nestled in the serene Nilgiri mountains, Kaveri Hilltop offers panoramic tea garden vistas, cozy colonial luxury, and crisp mountain air.",
    starRating: 5,
    heroImage: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Valley View Balcony", "Heated Pool", "Fireplace Lounge", "Artisanal Dining", "Spa & Wellness", "Free High-Speed Wi-Fi"],
    locationText: "Charing Cross Heights, Ooty, Tamil Nadu 643001"
  },
  2: {
    name: "Kaveri Backwater",
    city: "Alleppey",
    tagline: "Serene Lakefront Sanctuaries & Floating Luxury",
    description: "Experience the tranquility of Kerala's backwaters with private infinity deck access, traditional wooden architecture, and sunset boat tours.",
    starRating: 4,
    heroImage: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1563911302283-d2bc129e7570?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Private Canal View", "Ayurvedic Spa", "Houseboat Dining", "Infinity Pool", "24/7 Butler Service", "Organic Garden"],
    locationText: "Punnamada Lake Promenade, Alleppey, Kerala 688006"
  },
  3: {
    name: "Kaveri Riverside",
    city: "Coorg",
    tagline: "Coffee Plantation Splendor along the Kaveri",
    description: "Immerse yourself in lush coffee estates bordering the pristine river. Features open-air jacuzzi villas and authentic Kodava cuisine.",
    starRating: 4,
    heroImage: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1600&q=80",
    gallery: [
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80"
    ],
    amenities: ["Riverfront Deck", "Coffee Trail Walks", "Open-Air Jacuzzi", "Bonfire Dinners", "Kayaking", "Luxury Cabanas"],
    locationText: "Siddapur Road, Madikeri, Coorg, Karnataka 571201"
  }
};

export const DEFAULT_PROPERTY_IMAGE = "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80";

export const ROOM_TYPE_DETAILS = {
  Standard: {
    description: "Comfortable and elegant room equipped with king-size bedding, luxury linens, rainfall shower, and scenic window views.",
    image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80",
    badge: "Best Value"
  },
  Deluxe: {
    description: "Spacious sanctuary featuring a private balcony, workstation, espresso machine, and opulent bathroom amenities.",
    image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
    badge: "Popular Choice"
  },
  Suite: {
    description: "The pinnacle of indulgence. Separate lounge area, panoramic terrace, complimentary mini-bar, and personalized butler concierge.",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    badge: "Luxury Premium"
  }
};

export const STATUS_COLORS = {
  confirmed: {
    bg: "bg-emerald-50 text-emerald-800 border-emerald-200",
    dot: "bg-emerald-500",
    label: "Confirmed"
  },
  checked_in: {
    bg: "bg-amber-50 text-amber-800 border-amber-200",
    dot: "bg-amber-500",
    label: "Checked In"
  },
  checked_out: {
    bg: "bg-stone-100 text-stone-700 border-stone-200",
    dot: "bg-stone-400",
    label: "Checked Out"
  },
  cancelled: {
    bg: "bg-rose-50 text-rose-800 border-rose-200",
    dot: "bg-rose-500",
    label: "Cancelled"
  },
  no_show: {
    bg: "bg-purple-50 text-purple-800 border-purple-200",
    dot: "bg-purple-500",
    label: "No Show"
  }
};
