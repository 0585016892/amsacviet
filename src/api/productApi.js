// src/api/productApi.js
import { api } from "./config"; // axios instance có sẵn baseURL + headers

const productApi = {
  // ----------------- REVIEWS -----------------

  // Lấy danh sách đánh giá theo sản phẩm
  async getReviews(productId, filters = {}) {
    try {
      const params = {};
      if (filters.rating) params.rating = filters.rating;
      if (filters.hasImage) params.hasImage = true;
      if (filters.hasVideo) params.hasVideo = true;
      if (filters.page) params.page = filters.page;
      if (filters.limit) params.limit = filters.limit;

      const { data } = await api.get(`/reviews/${productId}`, { params });
      return data;
    } catch (err) {
      console.error("Lỗi getReviews:", err);
      return { reviews: [], total: 0 }; // fallback an toàn
    }
  },

  // Upload ảnh đánh giá (trả về danh sách file path string)
  async uploadReviewImages(files) {
    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      const { data } = await api.post("/reviews/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data.files || [];
    } catch (err) {
      console.error("Lỗi uploadReviewImages:", err);
      return [];
    }
  },

  // Gửi đánh giá (có thể kèm ảnh/video/variant)
  async createReview(review) {
    try {
      const payload = {
        product_id: review.product_id,
        user_id: review.user_id,
        rating: review.rating,
        content: review.content || "",
        images: review.images ? JSON.stringify(review.images) : "[]",
        videos: review.videos ? JSON.stringify(review.videos) : "[]",
        variant: review.variant || null,
      };

      const { data } = await api.post("/reviews", payload, {
        headers: { "Content-Type": "application/json" },
      });
      return data;
    } catch (err) {
      console.error("Lỗi createReview:", err);
      return null;
    }
  },

  // Đánh dấu review hữu ích
  async likeReview(reviewId) {
    try {
      const { data } = await api.put(`/reviews/${reviewId}/helpful`);
      return data;
    } catch (err) {
      console.error("Lỗi likeReview:", err);
      return null;
    }
  },

  // Shop phản hồi review
  async replyReview(reviewId, reply_content) {
    try {
      const { data } = await api.post(`/reviews/${reviewId}/reply`, {
        reply_content: reply_content || "",
      });
      return data;
    } catch (err) {
      console.error("Lỗi replyReview:", err);
      return null;
    }
  },
};

export default productApi;
