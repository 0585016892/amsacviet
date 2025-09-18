// src/api/userApi.js
import axios from "axios";
import API_URL from "./config";
// Hàm gọi API đăng nhập
export const loginUser = async (email, password) => {
  try {
    const { data } = await axios.post(`${API_URL}/auth/user/login`, {
      email,
      password,
    });
    return data; // { token, user }
  } catch (error) {
    console.error("Lỗi login:", error);
    throw error.response?.data?.message || "Đăng nhập thất bại";
  }
};

// Lấy token từ localStorage
const getToken = () => localStorage.getItem("token");

// Gắn token vào header
const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

const userApi = {
  // Lấy thông tin người dùng
  getProfile: async () => {
    const { data } = await axios.get(`${API_URL}/users/me`, {
      headers: getHeaders(),
    });
    return data;
  },

  // Lịch sử mua hàng
  getOrderHistory: async () => {
    const { data } = await axios.get(`${API_URL}/users/orders/history`, {
      headers: getHeaders(),
    });
    return data;
  },

  // Đơn hàng đang xử lý
  getPendingOrders: async () => {
    const { data } = await axios.get(`${API_URL}/users/orders/pending`, {
      headers: getHeaders(),
    });
    return data;
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async (payload) => {
    const { data } = await axios.put(`${API_URL}/users/update`, payload, {
      headers: getHeaders(),
    });
    return data;
  },

  // Đổi mật khẩu
  changePassword: async (payload) => {
    const { data } = await axios.put(`${API_URL}/users/change-password`, payload, {
      headers: getHeaders(),
    });
    return data;
  },

  // Lấy tất cả voucher
  allVoucher: async () => {
    const { data } = await axios.get(`${API_URL}/coupons`, {
      headers: getHeaders(),
    });
    return data;
  },

  // 🔔 Lấy thông báo khách hàng
  getNotifications: async (userId) => {
    const { data } = await axios.get(`${API_URL}/users/${userId}/notifications`, {
      headers: getHeaders(),
    });
    return data; // { success, notifications }
  },

  // 🔔 Đánh dấu 1 thông báo đã đọc
  markNotificationAsRead: async (notifId) => {
    const { data } = await axios.put(
      `${API_URL}/users/notifications/${notifId}/read`,
      {},
      { headers: getHeaders() }
    );
    return data;
  },

  // 🔔 Đánh dấu tất cả thông báo đã đọc
  markAllNotificationsAsRead: async (userId) => {
    const { data } = await axios.put(
      `${API_URL}/users/${userId}/notifications/read-all`,
      {},
      { headers: getHeaders() }
    );
    return data;
  },
};

export default userApi;
