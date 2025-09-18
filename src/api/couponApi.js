import { api } from "./config";

const couponApi = {
  // Lấy voucher với description = "0"
  getZeroDescriptionCoupons: async () => {
    try {
      const res = await api.get("/coupons");
      // Lọc trực tiếp những coupon có description === "0"
      return res.data.coupons.filter(coupon => coupon.description === "0");
    } catch (err) {
      console.error("Error fetching coupons:", err);
      throw err;
    }
  },
};

export default couponApi;
