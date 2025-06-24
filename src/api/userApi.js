import axios from "axios";
import API_URL from "./config";

// Hàm gọi API đăng nhập
export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/user/login`, {
      email,
      password,
    });

    return response.data; // { token, user }
  } catch (error) {
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
    const res = await axios.get(`${API_URL}/users/me`, {
      headers: getHeaders(),
    });
    return res.data;
  },

  // Lịch sử mua hàng
  getOrderHistory: async () => {
    const res = await axios.get(`${API_URL}/users/orders/history`, {
      headers: getHeaders(),
    });
    return res.data;
  },

  // Đơn hàng đang xử lý
  getPendingOrders: async () => {
    const res = await axios.get(`${API_URL}/users/orders/pending`, {
      headers: getHeaders(),
    });
    return res.data;
  },

  // Cập nhật thông tin cá nhân
  updateProfile: async (data) => {
    const res = await axios.put(`${API_URL}/users/update`, data, {
      headers: getHeaders(),
    });
    return res.data;
  },

  // Đổi mật khẩu
  changePassword: async (data) => {
    const res = await axios.put(`${API_URL}/users/change-password`, data, {
      headers: getHeaders(),
    });
    console.log(data);

    return res.data;
  },
};

export default userApi;
