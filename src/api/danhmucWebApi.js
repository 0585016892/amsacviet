// api/categoryService.js
import axios from "axios";

import { API_URL, api } from "./config";


const categoryService = {
  /**
   * Lấy danh sách danh mục theo cấu trúc cha-con.
   * @returns {Promise} - Promise chứa dữ liệu danh mục.
   */
  async getCategories() {
    try {
      const { data } = await axios.get(`${API_URL}/categories/danhmucWeb`);
      return data;
    } catch (error) {
     
      throw error;
    }
  },
  async getCollection() {
    try {
      const { data } = await axios.get(`${API_URL}/collections`);
      return data;
    } catch (error) {
     
      throw error;
    }
  },
};

export default categoryService;
