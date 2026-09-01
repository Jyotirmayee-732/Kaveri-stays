import api from "./api";

export const bookingService = {
  // POST /bookings
  createBooking: async (bookingData) => {
    // bookingData: { property_id, guest_id, room_id, check_in, check_out, guest_count, deposit }
    const response = await api.post("/bookings", bookingData);
    return response.data;
  },

  // GET /bookings
  getBookings: async (params = {}) => {
    // params: { guest_id, property_id, status, check_in_from, check_in_to, limit, offset }
    const response = await api.get("/bookings", { params });
    return response.data;
  },

  // GET /bookings/{booking_id}
  getBookingDetail: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}`);
    return response.data;
  },

  // PATCH /bookings/{booking_id}/status
  updateBookingStatus: async (bookingId, newStatus) => {
    const response = await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
    return response.data;
  }
};
