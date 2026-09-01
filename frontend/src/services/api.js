import axios from "axios";

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

// Request Interceptor: Attach bearer token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("kaveri_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle auth refresh & centralized error formatting
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (originalRequest.url.includes("/auth/login") || originalRequest.url.includes("/auth/refresh")) {
        return Promise.reject(formatError(error));
      }

      const refreshToken = localStorage.getItem("kaveri_refresh_token");

      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(formatError(err)));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refresh_token: refreshToken
          });

          const { access_token, refresh_token: newRefreshToken } = res.data;

          localStorage.setItem("kaveri_access_token", access_token);
          if (newRefreshToken) {
            localStorage.setItem("kaveri_refresh_token", newRefreshToken);
          }

          api.defaults.headers.common.Authorization = `Bearer ${access_token}`;
          originalRequest.headers.Authorization = `Bearer ${access_token}`;

          processQueue(null, access_token);
          isRefreshing = false;

          return api(originalRequest);
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          isRefreshing = false;

          // Clear auth state on refresh failure
          localStorage.removeItem("kaveri_access_token");
          localStorage.removeItem("kaveri_refresh_token");
          localStorage.removeItem("kaveri_user");
          
          if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
            window.location.href = "/login?expired=true";
          }
          return Promise.reject(formatError(refreshErr));
        }
      } else {
        localStorage.removeItem("kaveri_access_token");
        localStorage.removeItem("kaveri_refresh_token");
        localStorage.removeItem("kaveri_user");
      }
    }

    return Promise.reject(formatError(error));
  }
);

// Map backend error responses to friendly user messages
function formatError(error) {
  if (!error.response) {
    return {
      status: 0,
      message: "Unable to connect to Kaveri Stays servers. Please check your connection."
    };
  }

  const status = error.response.status;
  const data = error.response.data;

  let message = "An unexpected error occurred. Please try again.";

  if (typeof data?.detail === "string") {
    message = data.detail;
  } else if (Array.isArray(data?.detail)) {
    // Pydantic validation errors
    message = data.detail.map((err) => `${err.loc.join(".")}: ${err.msg}`).join(", ");
  }

  // HTTP Status Specific Messages
  switch (status) {
    case 401:
      if (!message || message.includes("Not authenticated")) {
        message = "Your session has expired or is invalid. Please log in again.";
      }
      break;
    case 403:
      message = message || "You don't have permission to perform this action.";
      break;
    case 404:
      message = message || "The requested stay or booking resource could not be found.";
      break;
    case 409:
      message = message || "This room or request has a conflict (e.g. unavailable dates or duplicate action).";
      break;
    case 422:
      message = message || "Please check the information you entered.";
      break;
    case 429:
      message = "Too many requests. Please wait a moment before trying again.";
      break;
    case 500:
      message = "Internal server error. Our engineering team has been notified.";
      break;
    default:
      break;
  }

  return {
    status,
    message,
    raw: data
  };
}

export default api;
