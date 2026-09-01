import api from "./api";

export const paymentService = {
  // POST /bookings/{booking_id}/payments
  createPayment: async (bookingId, paymentData, idempotencyKey) => {
    // paymentData: { amount, method, reference }
    // Header: Idempotency-Key
    const response = await api.post(`/bookings/${bookingId}/payments`, paymentData, {
      headers: {
        "Idempotency-Key": idempotencyKey
      }
    });
    return response.data;
  },

  // GET /bookings/{booking_id}/payments
  getPayments: async (bookingId) => {
    const response = await api.get(`/bookings/${bookingId}/payments`);
    return response.data;
  }
};
