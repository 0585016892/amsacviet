// api/axiosInstance.js
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.message === "Network Error") {
      window.location.href = "/server-down"; // xử lý toàn app
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
