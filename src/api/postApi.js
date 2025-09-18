import axios from 'axios';

import { API_URL, api } from "./config";
 // sửa nếu backend bạn dùng prefix khác

const postApi = {
  getAll: async () => {
    try {
      const res = await axios.get(`${API_URL}/posts`);
      return res.data;
    } catch (err) {
      console.error('Lỗi lấy danh sách bài viết:', err);
      return { posts: [], totalPosts: 0, totalPages: 0 };
    }
  },

  getById: async (id) => {
    try {
      const res = await axios.get(`${API_URL}/${id}`);
      return res.data;
    } catch (err) {
      console.error(`Lỗi lấy bài viết id=${id}:`, err);
      return null;
    }
  },
  getBySlug: async (slug) => {
    const res = await axios.get(`${API_URL}/posts/slug/${slug}`);
    return res.data.post;
  },
};

export default postApi;
