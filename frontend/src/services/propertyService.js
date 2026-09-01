import api from "./api";

export const propertyService = {
  // GET /properties/{property_id}/availability
  getAvailability: async (propertyId, fromDate, toDate, roomType = null) => {
    const params = {
      from: fromDate,
      to: toDate
    };
    if (roomType) {
      params.room_type = roomType;
    }
    const response = await api.get(`/properties/${propertyId}/availability`, { params });
    return response.data;
  },

  // Returns defined properties with rich metadata
  getProperties: async () => {
    // Properties in backend database: 1 (Kaveri Hilltop), 2 (Kaveri Backwater), 3 (Kaveri Riverside)
    return [
      {
        id: 1,
        name: "Kaveri Hilltop",
        city: "Ooty",
        starRating: 5,
        startingPrice: 3500,
        image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
        description: "Panoramic tea garden vistas, crisp Nilgiri mountain breeze, and refined luxury suites.",
        amenities: ["Valley View Balcony", "Heated Pool", "Fireplace Lounge", "Artisanal Dining"]
      },
      {
        id: 2,
        name: "Kaveri Backwater",
        city: "Alleppey",
        starRating: 4,
        startingPrice: 2800,
        image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=80",
        description: "Tranquil waterfront luxury surrounded by palm groves and private infinity decks.",
        amenities: ["Waterfront View", "Ayurvedic Spa", "Houseboat Diners", "Sunset Deck"]
      },
      {
        id: 3,
        name: "Kaveri Riverside",
        city: "Coorg",
        starRating: 4,
        startingPrice: 3200,
        image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=1200&q=80",
        description: "Lush coffee plantation estate along the pristine Kaveri river with private open-air jacuzzis.",
        amenities: ["Riverfront Deck", "Coffee Trail Walks", "Open-Air Jacuzzi", "Bonfire Dinners"]
      }
    ];
  }
};
