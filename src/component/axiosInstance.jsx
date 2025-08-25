import axios from "axios";
import Cookies from "js-cookie";

const axiosInstance = axios.create({
  baseURL: "http://127.0.0.1:8000/",
});

// Attach access token to headers
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = Cookies.get("authToken"); // ✅ Get from cookies
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Refresh token handler
const refreshAccessToken = async () => {
  try {
    const refreshToken = Cookies.get("refreshToken"); // ✅ Get from cookies
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    const response = await axios.post(
      "http://127.0.0.1:8000/api/auth/refresh/",
      {
        refresh_token: refreshToken,
      }
    );

    const { access_token } = response.data;

    // ✅ Set new access token in cookies
    Cookies.set("authToken", access_token, {
      secure: true,
      sameSite: "Strict",
    });

    return access_token;
  } catch (error) {
    Cookies.remove("refreshToken");
    Cookies.remove("authToken");
    console.error("Error refreshing access token:", error);
    throw new Error("Failed to refresh access token");
  }
};

// Handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      const newToken = await refreshAccessToken();
      if (newToken) {
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
