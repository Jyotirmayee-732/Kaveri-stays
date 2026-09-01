import api from "./api";

export const authService = {
  login: async (email, password) => {
    const response = await api.post("/auth/login", { email, password });
    return response.data;
  },

  register: async (userData) => {
    // userData: { full_name, email, phone, city, password }
    const response = await api.post("/auth/register", userData);
    return response.data;
  },

  getMe: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },

  refresh: async (refreshToken) => {
    const response = await api.post("/auth/refresh", { refresh_token: refreshToken });
    return response.data;
  },

  logout: async (refreshToken) => {
    if (!refreshToken) return { message: "Logged out locally" };
    try {
      const response = await api.post("/auth/logout", { refresh_token: refreshToken });
      return response.data;
    } catch {
      return { message: "Logged out" };
    }
  }
};
