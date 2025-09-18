import { api } from "./config";

// Lấy token từ localStorage
const getToken = () => localStorage.getItem("token");

// Gắn token vào header
const getHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
});

export const loginUser = async (email, password) => {
  try {
    const response = await api.post(`/auth/user/login`, { email, password });
    return response.data; // { token, user }
  } catch (error) {
    throw error.response?.data?.message || "Đăng nhập thất bại";
  }
};

const userApi = {
  getProfile: async () => {
    const res = await api.get(`/users/me`, { headers: getHeaders() });
    return res.data;
  },

  getOrderHistory: async () => {
    const res = await api.get(`/users/orders/history`, { headers: getHeaders() });
    return res.data;
  },

  getPendingOrders: async () => {
    const res = await api.get(`/users/orders/pending`, { headers: getHeaders() });
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.put(`/users/update`, data, { headers: getHeaders() });
    return res.data;
  },

  changePassword: async (data) => {
    const res = await api.put(`/users/change-password`, data, { headers: getHeaders() });
    return res.data;
  },

  allVoucher: async () => {
    const res = await api.get(`/coupons`, { headers: getHeaders() });
    return res.data;
  },

  getNotifications: async (userId) => {
    const res = await api.get(`/users/${userId}`, { headers: getHeaders() });
    return res.data;
  },

  markNotificationAsRead: async (notifId) => {
    const res = await api.put(`/users/${notifId}/read`, {}, { headers: getHeaders() });
    return res.data;
  },

  markAllNotificationsAsRead: async (userId) => {
    const res = await api.put(`/users/user/${userId}/read-all`, {}, { headers: getHeaders() });
    return res.data;
  },
};

export default userApi;
