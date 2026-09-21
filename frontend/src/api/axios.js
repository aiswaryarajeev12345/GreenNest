import axios from "axios";

// ======================================================
// GREENNEST BACKEND API
// ======================================================

export const API_BASE_URL =
  "http://127.0.0.1:8000/api/v1";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Accept: "application/json",
  },
});

// ======================================================
// TOKEN STORAGE
// ======================================================

const ACCESS_KEY = "greennest_access";
const REFRESH_KEY = "greennest_refresh";

export const tokenStorage = {
  getAccess: () => {
    return localStorage.getItem(ACCESS_KEY);
  },

  getRefresh: () => {
    return localStorage.getItem(REFRESH_KEY);
  },

  setTokens: (access, refresh) => {
    localStorage.setItem(ACCESS_KEY, access);

    if (refresh) {
      localStorage.setItem(REFRESH_KEY, refresh);
    }
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ======================================================
// REQUEST INTERCEPTOR
// Adds JWT access token to authenticated requests
// ======================================================

api.interceptors.request.use(
  (config) => {
    const accessToken = tokenStorage.getAccess();

    if (accessToken) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// ======================================================
// TOKEN REFRESH
// ======================================================

let isRefreshing = false;
let pendingQueue = [];

function processQueue(error, token = null) {
  pendingQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  pendingQueue = [];
}

// ======================================================
// RESPONSE INTERCEPTOR
// Automatically refreshes expired access tokens
// ======================================================

api.interceptors.response.use(
  (response) => {
    return response;
  },

  async (error) => {
    const originalRequest = error.config;

    // No response means this is usually a connection/network problem.
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // Only refresh when Django returns 401.
    if (
      status !== 401 ||
      originalRequest?._retry ||
      !tokenStorage.getRefresh()
    ) {
      return Promise.reject(error);
    }

    // If another request is already refreshing the token,
    // wait for it.
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve,
          reject,
        });
      }).then((newAccessToken) => {
        originalRequest.headers =
          originalRequest.headers || {};

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`;

        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = tokenStorage.getRefresh();

      const response = await axios.post(
        `${API_BASE_URL}/auth/token/refresh/`,
        {
          refresh: refreshToken,
        }
      );

      const newAccessToken = response.data.access;

      tokenStorage.setTokens(
        newAccessToken,
        refreshToken
      );

      processQueue(null, newAccessToken);

      originalRequest.headers =
        originalRequest.headers || {};

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      tokenStorage.clear();

      processQueue(refreshError, null);

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
