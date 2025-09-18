import API_URL from "./config";
export const getCategoryData = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/products/category/${slug}`);
    if (!response.ok) {
      throw new Error("Failed to fetch category data");
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching category data:", error);
    throw error;
  }
};
// --- Thêm API này để lấy 1 sản phẩm theo slug ---
export const getProductBySlug = async (slug) => {
  try {
    const response = await fetch(`${API_URL}/products/products/${slug}`);
    if (!response.ok) {
      throw new Error("Failed to fetch product by slug");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};
// --- API tìm kiếm sản phẩm theo từ khóa ---
export const searchProducts = async (keyword) => {
  try {
    const response = await fetch(
      `${API_URL}/products/search?keyword=${encodeURIComponent(keyword)}`
    );
    if (!response.ok) {
      throw new Error("Failed to search products");
    }
    return await response.json();
  } catch (error) {
    throw error;
  }
};
