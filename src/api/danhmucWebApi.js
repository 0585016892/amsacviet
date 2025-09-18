// api/categoryService.js
import { api } from "./config"; // dùng instance thay vì axios

const categoryService = {
  /**
   * Lấy danh sách danh mục theo cấu trúc cha-con.
   * @returns {Promise} - Promise chứa dữ liệu danh mục.
   */
  async getCategories() {
    try {
      const { data } = await api.get("/categories/danhmucWeb");
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Lấy danh sách bộ sưu tập (collection).
   * @returns {Promise} - Promise chứa dữ liệu collection.
   */
  async getCollection() {
    try {
      const { data } = await api.get("/collections");
      return data;
    } catch (error) {
      throw error;
    }
  },
};

export default categoryService;
