// src/api/slideApi.js
import { api } from "./config";// axios instance có sẵn baseURL, headers

export const getSlidesByArea = async (display_area) => {
  try {
    const { data } = await api.get("/slides/show", {
      params: { display_area },
    });
    return data.slides || []; // fallback mảng rỗng để UI không crash
  } catch (error) {
    console.error("Lỗi khi lấy slides:", error);
    throw error; // quăng lỗi lên để component tự xử lý
  }
};
