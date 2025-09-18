import axios from "axios";
import { API_URL, api } from "./config";


export const getSlidesByArea = async (display_area) => {
  try {
    const response = await axios.get(`${API_URL}/slides/show`, {
      params: { display_area },
    });
    return response.data.slides;
  } catch (error) {
    throw error; // 👉 QUAN TRỌNG: quăng lỗi lên để component xử lý
  }
};
