import axios from "axios";
import API_URL from "./config";

export const getActiveFooters = async () => {
  try {
    const response = await axios.get(`${API_URL}/footer`); // bỏ dấu "/" cuối nếu API không yêu cầu
    const { footers } = response.data || {};

    // ép về mảng an toàn
    const footerArray = Array.isArray(footers) ? footers : [];

    const activeFooters = footerArray
      .filter((parent) => parent.status === "active")
      .map((parent) => ({
        ...parent,
        children: (parent.children || []).filter(
          (child) => child.status === "active"
        ),
      }));

    return activeFooters;
  } catch (error) {
    console.error("Error getActiveFooters:", error.message);
    return []; // tránh throw để UI không crash
  }
};
