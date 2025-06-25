// src/api/colorApi.js
import axios from "axios";
import API_URL from "./config";

// Lấy tất cả màu (không phân trang, dùng cho export hoặc dropdown)
export const getAllColors = async () => {
  try {
    const res = await axios.get(`${API_URL}/colors/all`);
    return res.data;
  } catch (err) {
    throw err; // 👉 QUAN TRỌNG: quăng lỗi lên để component xử lý
  }
};
