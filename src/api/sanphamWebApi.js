// src/api/productService.js
import api from "./api"; // axios instance (đã set baseURL = API_URL)

export const getCategoryData = async (slug) => {
  try {
    const { data } = await api.get(`/products/category/${slug}`);
    return data;
  } catch (error) {
    console.error("Error fetching category data:", error);
    return { products: [] }; // fallback an toàn
  }
};

// --- Lấy 1 sản phẩm theo slug ---
export const getProductBySlug = async (slug) => {
  try {
    const { data } = await api.get(`/products/products/${slug}`);
    return data;
  } catch (error) {
    console.error("Error fetching product by slug:", error);
    return null;
  }
};

// --- Tìm kiếm sản phẩm theo từ khóa ---
export const searchProducts = async (keyword) => {
  try {
    const { data } = await api.get("/products/search", {
      params: { keyword },
    });
    return data;
  } catch (error) {
    console.error("Error searching products:", error);
    return { products: [] };
  }
};
