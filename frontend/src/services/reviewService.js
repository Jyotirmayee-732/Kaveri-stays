import api from "./api";

export const reviewService = {
  // POST /bookings/{booking_id}/review
  createReview: async (bookingId, reviewData) => {
    // reviewData: { rating, comments }
    const response = await api.post(`/bookings/${bookingId}/review`, reviewData);
    return response.data;
  }
};
