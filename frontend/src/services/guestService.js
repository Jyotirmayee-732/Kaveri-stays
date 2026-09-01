import api from "./api";

export const guestService = {
  // GET /guests
  getGuests: async (params = {}) => {
    // params: { limit, offset, email, name }
    const response = await api.get("/guests", { params });
    return response.data;
  },

  // GET /guests/{guest_id}
  getGuestById: async (guestId) => {
    const response = await api.get(`/guests/${guestId}`);
    return response.data;
  }
};
