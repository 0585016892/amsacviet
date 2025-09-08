// src/api/orderApi.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const orderApi = {
  // Lấy chi tiết đơn hàng theo id
  getOrder: async (id) => {
    try {
        const response = await axios.get(`${API_URL}/orders/${id}`);
        console.log(response.data);
        return response.data; // giả sử backend trả về object { data: {...order} }
        
    } catch (error) {
      console.error("Lỗi khi lấy đơn hàng:", error);
      throw error;
    }
  },
};

export default orderApi;
