import api from "./api";

export const reportService = {
  // GET /properties/{property_id}/reports/occupancy
  getOccupancyReport: async (propertyId, fromDate, toDate) => {
    const response = await api.get(`/properties/${propertyId}/reports/occupancy`, {
      params: { from: fromDate, to: toDate }
    });
    return response.data;
  },

  // GET /properties/{property_id}/reports/adr
  getAdrReport: async (propertyId, fromDate, toDate) => {
    const response = await api.get(`/properties/${propertyId}/reports/adr`, {
      params: { from: fromDate, to: toDate }
    });
    return response.data;
  },

  // GET /properties/{property_id}/reports/revpar
  getRevParReport: async (propertyId, fromDate, toDate) => {
    const response = await api.get(`/properties/${propertyId}/reports/revpar`, {
      params: { from: fromDate, to: toDate }
    });
    return response.data;
  }
};
