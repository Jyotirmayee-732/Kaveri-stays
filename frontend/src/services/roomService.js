import api from "./api";

export const roomService = {
  // GET /properties/{property_id}/rooms
  getRoomsByProperty: async (propertyId, params = {}) => {
    // params: { limit, offset }
    const response = await api.get(`/properties/${propertyId}/rooms`, { params });
    return response.data;
  }
};
