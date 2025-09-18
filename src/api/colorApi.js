// src/api/colorApi.js
import { api } from "./config"; // dùng instance thay vì axios
import API_URL from "./config";

// Lấy tất cả màu (không phân trang, dùng cho export hoặc dropdown)
export const getAllColors = async () => {
  try {
    const res = await api.get("/colors/all"); // tự động nối với API_URL + header ngrok
    return res.data;
  } catch (err) {
    // 👉 QUAN TRỌNG: quăng lỗi lên để component xử lý
    throw err;
  }
};
