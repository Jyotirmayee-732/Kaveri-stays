import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem("kaveri_access_token") || null);
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem("kaveri_refresh_token") || null);
  const [loading, setLoading] = useState(true);

  // Synchronize state with current JWT session
  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem("kaveri_access_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem("kaveri_user", JSON.stringify(userData));
    } catch {
      // Token invalid or failed
      logoutLocally();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    const { access_token, refresh_token, role, account_id, guest_id } = data;

    localStorage.setItem("kaveri_access_token", access_token);
    localStorage.setItem("kaveri_refresh_token", refresh_token);
    setAccessToken(access_token);
    setRefreshToken(refresh_token);

    // Fetch full account info (/auth/me)
    try {
      const meData = await authService.getMe();
      setUser(meData);
      localStorage.setItem("kaveri_user", JSON.stringify(meData));
      return meData;
    } catch {
      const fallbackUser = { id: guest_id || account_id, email, role, guest_id };
      setUser(fallbackUser);
      localStorage.setItem("kaveri_user", JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  };

  const register = async (userData) => {
    const res = await authService.register(userData);
    return res;
  };

  const logoutLocally = () => {
    localStorage.removeItem("kaveri_access_token");
    localStorage.removeItem("kaveri_refresh_token");
    localStorage.removeItem("kaveri_user");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  const logout = async () => {
    const storedRefresh = localStorage.getItem("kaveri_refresh_token");
    try {
      await authService.logout(storedRefresh);
    } catch {
      // Continue cleanup regardless
    } finally {
      logoutLocally();
    }
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    loading,
    isAuthenticated: !!user && !!accessToken,
    role: user?.role || null,
    guestId: user?.id || user?.guest_id || null,
    propertyId: user?.property_id || null,
    login,
    register,
    logout,
    refreshMe: fetchMe
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
