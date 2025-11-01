// src/api/orderApi.js
import { api } from "./config";

const orderApi = {
  // Lấy chi tiết đơn hàng theo id
  async getOrder(id) {
    try {
      const { data } = await api.get(`/orders/${id}`);
      return data; 
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      throw error;
    }
  },
};

export default orderApi;
