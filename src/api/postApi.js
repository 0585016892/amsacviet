// src/api/postApi.js
import api from "./api"; // dùng chung axios instance

const postApi = {
  // Lấy danh sách bài viết
  async getAll() {
    try {
      const { data } = await api.get("/posts");
      return data; // giả sử backend trả { posts: [...], totalPosts, totalPages }
    } catch (err) {
      console.error("Lỗi lấy danh sách bài viết:", err);
      return { posts: [], totalPosts: 0, totalPages: 0 };
    }
  },

  // Lấy bài viết theo id
  async getById(id) {
    try {
      const { data } = await api.get(`/posts/${id}`);
      return data; // giả sử backend trả { post: {...} }
    } catch (err) {
      console.error(`Lỗi lấy bài viết id=${id}:`, err);
      return null;
    }
  },

  // Lấy bài viết theo slug
  async getBySlug(slug) {
    try {
      const { data } = await api.get(`/posts/slug/${slug}`);
      return data.post; 
    } catch (err) {
      console.error(`Lỗi lấy bài viết slug=${slug}:`, err);
      return null;
    }
  },
};

export default postApi;
