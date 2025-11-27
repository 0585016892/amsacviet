import { api } from "./config"; // axios instance đã có baseURL, headers

// Lấy tất cả settings
export const getSettingsAPI = async () => {
  try {
    const { data } = await api.get("/settings"); // GET /settings
    return data || {}; // fallback về object rỗng nếu backend không trả
  } catch (error) {
    console.error("Lỗi khi lấy settings:", error);
    throw error; // quăng lỗi để component tự xử lý
  }
};