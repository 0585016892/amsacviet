import axios from "axios";
import { API_URL, api } from "./config";


const productApi = {
  // ----------------- REVIEWS -----------------

  // Lấy danh sách đánh giá theo sản phẩm
  getReviews: async (productId, filters = {}) => {
  const params = {};
  if (filters.rating) params.rating = filters.rating;
  if (filters.hasImage) params.hasImage = true;
  if (filters.hasVideo) params.hasVideo = true;
  if (filters.page) params.page = filters.page;
  if (filters.limit) params.limit = filters.limit;

  const res = await axios.get(`${API_URL}/reviews/${productId}`, { params });
  return res.data; // chỉ trả data, không trả cả axios response
},


  // Upload ảnh đánh giá (trả về danh sách file path string)
  uploadReviewImages: async (files) => {
    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append("images", files[i]);
    }
    const res = await axios.post(`${API_URL}/reviews/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data.files; // => array of string
  },

  // Gửi đánh giá (có thể kèm ảnh/video/variant)
  createReview: async (data) => {
    const payload = {
      product_id: String(data.product_id),
      user_id: String(data.user_id),
      rating: String(data.rating),
      content: data.content || "",
      images: data.images ? JSON.stringify(data.images) : "[]",
      videos: data.videos ? JSON.stringify(data.videos) : "[]",
      variant: data.variant ? String(data.variant) : null,
    };

    const res = await axios.post(`${API_URL}/reviews`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return res.data;
  },

  // Đánh dấu review hữu ích
  likeReview: async (reviewId) => {
    const res = await axios.put(`${API_URL}/reviews/${reviewId}/helpful`);
    return res.data;
  },

  // Shop phản hồi review
  replyReview: async (reviewId, reply_content) => {
    const res = await axios.post(`${API_URL}/reviews/${reviewId}/reply`, {
      reply_content: String(reply_content || ""),
    });
    return res.data;
  },
};

export default productApi;
