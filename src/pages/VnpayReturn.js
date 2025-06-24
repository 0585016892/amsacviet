import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Spinner } from "react-bootstrap";

const VnpayReturn = () => {
  const { search } = useLocation();
  const [message, setMessage] = useState("⏳ Đang xử lý...");

  useEffect(() => {
    const params = new URLSearchParams(search);
    const responseCode = params.get("vnp_ResponseCode");
    const txnRef = params.get("vnp_TxnRef");

    if (!responseCode) {
      setMessage("❌ Không nhận được thông tin từ VNPay.");
      return;
    }

    if (responseCode === "00") {
      setMessage(`✅ Thanh toán thành công! Mã đơn hàng: ${txnRef}`);
    } else {
      setMessage("❌ Thanh toán thất bại hoặc bị huỷ.");
    }
  }, [search]);

  return (
    <div className="container mt-5 text-center">
      <h3>Kết quả thanh toán</h3>
      <div className="mt-4">
        <Spinner animation="border" variant="primary" className="me-2" />
        <strong>{message}</strong>
      </div>
    </div>
  );
};

export default VnpayReturn;
