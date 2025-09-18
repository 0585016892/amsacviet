// src/api/orderApi.js
import api from "./api";

const orderApi = {
  // Lấy chi tiết đơn hàng theo id
  async getOrder(id) {
    try {
      const { data } = await api.get(`/orders/${id}`);
      console.log("Chi tiết đơn hàng:", data);
      return data; 
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      throw error;
    }
  },
};

export default orderApi;
