import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { Spinner, Alert } from "react-bootstrap";
import { getSettingsAPI } from "../api/settingsApi";
import { FaTags, FaWallet } from "react-icons/fa";
import { FiChevronRight,FiFrown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "../assets/Order.css";
import {  Form, Button } from "react-bootstrap";
import { FiXCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import MOMO from '../img/momo.png'
import COD from '../img/cod.webp'
import couponApi from "../api/couponApi";
import Swal from "sweetalert2";

const Order = () => {
  const { user } = useAuth();
  const URL = process.env.REACT_APP_WEB_URL; 
  const URL_API = process.env.REACT_APP_API_URL; 
  
  const { clearOrder } = useCart();
  const [orderItems, setOrderItems] = useState([]);
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [productDiscount, setProductDiscount] = useState(0);

  // Loading + success
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  //xử lí shipping 
    const [shippingfee, setShippingFee] = useState(null);
useEffect(() => {
  const fetchAll = async () => {
    const settings = await getSettingsAPI();
    const shippingFee = Number(settings.shipping_fee);
    setShippingFee(shippingFee);

    const savedOrder = localStorage.getItem("order");
    if (!savedOrder) return;

    const items = JSON.parse(savedOrder);
    setOrderItems(items);

    let totalPrice = 0;
    let discountAmount = 0;
    let totalQuantity = 0;

    items.forEach((item) => {
      const itemPrice = Number(item.price);
      const quantity = Number(item.quantity);
      totalQuantity += quantity;

      let finalItemPrice = itemPrice;

      if (item.discount_value) {
        if (item.discount_type === "percent") {
          const percentDiscount =
            (itemPrice * parseFloat(item.discount_value)) / 100;
          finalItemPrice -= percentDiscount;
          discountAmount += percentDiscount * quantity;
        } else if (item.discount_type === "fixed") {
          finalItemPrice -= Number(item.discount_value);
          discountAmount += Number(item.discount_value) * quantity;
        }
      }

      totalPrice += finalItemPrice * quantity;
    });

    setTotal(totalPrice);
    setProductDiscount(discountAmount);

    setShipping(totalQuantity >= 2 ? 0 : shippingFee);
  };

  fetchAll();
}, []);


  //   xử lí tỉnh huyện xã
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  const [selectedProvince, setSelectedProvince] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedWard, setSelectedWard] = useState("");

  const [showPayments, setShowPayments] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  // Lấy danh sách tỉnh
  useEffect(() => {
    fetch(" https://api.vnappmob.com/api/v2/province/")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.results)) {
          setProvinces(data.results);
        } else {
          setProvinces([]); // fallback để tránh lỗi .map
        }
      })
      .catch((err) => {
        setProvinces([]); // fallback
      });
  }, []);

  // Lấy danh sách quận/huyện khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      fetch(
        `https://api.vnappmob.com/api/v2/province/district/${selectedProvince}`
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data.results)) {
            setDistricts(data.results);
          } else {
            setDistricts([]); // fallback để tránh lỗi .map
          }
        })
        .catch((err) => setSuccessMsg("Lỗi tải quận/huyện: " + err));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  // Lấy danh sách phường/xã khi chọn huyện
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://api.vnappmob.com/api/v2/province/ward/${selectedDistrict}`)
        .then((res) => res.json())
        .then((data) => setWards(data.results))
        .catch((err) => setSuccessMsg("Lỗi tải phường/xã: " + err));
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);
  // coupon
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
 useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const data = await couponApi.getZeroDescriptionCoupons();
        setCoupons(data);
      } catch (err) {
        console.error("Failed to load coupons:", err);
      }
    };

    fetchCoupons();
  }, []);
  useEffect(() => {
    if (selectedCoupon) {
      if (selectedCoupon.discount_type === "fixed") {
        setDiscount(parseFloat(selectedCoupon.discount_value));
      } else if (selectedCoupon.discount_type === "percent") {
        const percent = parseFloat(selectedCoupon.discount_value);
        setDiscount(((total - productDiscount) * percent) / 100);
      }
    } else {
      setDiscount(0);
    }
  }, [selectedCoupon, total, productDiscount]);
  const provinceName =
    provinces.find((p) => p.province_id === selectedProvince)?.province_name ||
    "";

  const districtName =
    districts.find((d) => d.district_id === selectedDistrict)?.district_name ||
    "";

  const wardName =
    wards.find((w) => w.ward_id === selectedWard)?.ward_name || "";
  // Thông tin người dùng và địa chỉ
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (
      !name.trim() ||
      !phone.trim() ||
      !email.trim() ||
      !selectedProvince ||
      !selectedDistrict ||
      !selectedWard
    ) {
      setSuccessMsg(
        "Vui lòng điền đầy đủ thông tin và địa chỉ trước khi đặt hàng."
      );
      setLoading(false);
      return;
    }

    const provinceName =
      provinces.find((p) => p.province_id === selectedProvince)
        ?.province_name || "";
    const districtName =
      districts.find((d) => d.district_id === selectedDistrict)
        ?.district_name || "";
    const wardName =
      wards.find((w) => w.ward_id === selectedWard)?.ward_name || "";

    const fullAddress = `${wardName}, ${districtName}, ${provinceName}`;

    const detailedItems = orderItems?.map((item) => ({
      product_id: item.id,
      quantity: item.quantity,
      price: Number(item.price),
      name: item.name,
      size: item.size,
      color: item.color,
    }));

    const orderData = {
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      address: fullAddress,
      note,
      items: detailedItems,
      total,
      discount,
      shipping,
      final_total: Number(total - productDiscount - discount + shipping),
      payment_method: paymentMethod,
      status: paymentMethod === "COD" ? "Chờ xử lý" : "Đang chờ thanh toán",
    };

    if (selectedCoupon) {
      orderData.coupon_id = selectedCoupon.id;
    }

   try {
    // 1. Gửi đơn hàng
    const res = await fetch(`${URL_API}/orders/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(orderData),
      credentials: "include", // cần cho COD, Momo backend cũng nhận được cookie/session
    });

    const data = await res.json();

    if (!res.ok) {
      setSuccessMsg("Lỗi: " + (data.message || "Không thể tạo đơn hàng."));
      return;
    }

    // 2. Nếu có coupon thì đánh dấu đã dùng
    if (selectedCoupon) {
      await fetch(`${URL_API}/coupons/use/${selectedCoupon.id}`, {
        method: "PATCH",
      });
    }

    // 3. Xử lý theo phương thức thanh toán
    if (paymentMethod === "COD") {
      clearOrder();
      Swal.fire({
        title: "🎉 Đặt hàng thành công!",
        text: "Bạn sẽ được chuyển về trang chủ...",
        icon: "success",
        confirmButtonText: "OK",
        timer: 2500,
        showConfirmButton: false,
      });
      setTimeout(() => navigate("/"), 1500);
    } else if (paymentMethod === "MOMO") {
      if (data.payUrl) {
        window.location.href = data.payUrl; // redirect sang MoMo
      } else {
        setSuccessMsg("Không tạo được link thanh toán MoMo.");
      }
    }
  } catch (err) {
    setSuccessMsg("Không thể gửi đơn hàng. Vui lòng thử lại!");
  } finally {
    setLoading(false);
   }
    };
  //nếu đã đăng nhập
  useEffect(() => {
    if (user) {
      setName(user.full_name || "");
      setPhone(user.phone || "");
      setEmail(user.email || "");
    }
  }, []);
  return (
    <div style={{ marginTop: "90px" }}>
      {loading && (
        <div
          className="position-fixed top-0 start-0 vw-100 vh-100 d-flex justify-content-center align-items-center bg-black bg-opacity-50"
          style={{ zIndex: 99999999999 }}
        >
          <Spinner animation="border" variant="light" />
        </div>
      )}
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-7 mt-5">
            <div className="card p-3 mb-3 shadow-sm border-0 rounded-3">
              <h5 className="mb-3">👤 Thông tin người nhận</h5>
              {user ? (
                <div className="alert alert-success py-2 mb-3 rounded-3">
                  Đã tự động điền thông tin từ tài khoản đăng nhập.
                </div>
              ) : (
                 <div className="alert alert-info py-2 mb-3 rounded-3">
                  Khách hàng dùng email để đăng nhập, mật khẩu được gửi về email
                  khách hàng!
                </div>
              )}

              <div className="mb-3">
                <label htmlFor="name" className="form-label ">
                  Nhập tên khách hàng
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Vui lòng nhập đầy đủ họ tên...."
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label htmlFor="phone" className="form-label ">
                  Nhập số điện thoại
                </label>
                <input
                  type="tel"
                  placeholder="Vui lòng nhập số điện thoại...."
                  className="form-control"
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="mb-2">
                <label htmlFor="email" className="form-label ">
                  Nhập địa chỉ email
                </label>{" "}
                <input
                  type="email"
                  placeholder="Vui lòng dùng email thật...."
                  className="form-control"
                  id="email"
                  disabled={!!user}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />{" "}
              </div>
              <div className="mb-2">
               <div className="">
                        <label className="form-label mb-2">Địa chỉ giao hàng</label>

                        <div className="row g-2">
                          <div className="col-md-4">
                            <select
                              className="form-select"
                              value={selectedProvince}
                              onChange={(e) => setSelectedProvince(e.target.value)}
                            >
                              <option value="">-- Tỉnh/Thành phố --</option>
                              {provinces.map((province) => (
                                <option key={province.province_id} value={province.province_id}>
                                  {province.province_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-4">
                            <select
                              className="form-select"
                              value={selectedDistrict}
                              onChange={(e) => setSelectedDistrict(e.target.value)}
                              disabled={!selectedProvince}
                            >
                              <option value="">-- Quận/Huyện --</option>
                              {districts.map((district) => (
                                <option key={district.district_id} value={district.district_id}>
                                  {district.district_name}
                                </option>
                              ))}
                            </select>
                          </div>

                          <div className="col-md-4">
                            <select
                              className="form-select"
                              value={selectedWard}
                              onChange={(e) => setSelectedWard(e.target.value)}
                              disabled={!selectedDistrict}
                            >
                              <option value="">-- Phường/Xã --</option>
                              {wards.map((ward) => (
                                <option key={ward.ward_id} value={ward.ward_id}>
                                  {ward.ward_name}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="mt-3">
                          <strong>📌 Địa chỉ đã chọn: </strong>
                          {selectedProvince && selectedDistrict && selectedWard ? (
                            <span className="text-black px-3 py-2 ">
                              {[wardName, districtName, provinceName].filter((i) => i !== "").join(", ")}
                            </span>
                          ) : (
                            <span className="text-danger fst-italic">Chưa chọn đầy đủ</span>
                          )}
                        </div>
                      </div>

              </div>
              <div className="mb-2">
                <label htmlFor="note" className="form-label fw-semibold">
                  Ghi chú (không bắt buộc)
                </label>
                <textarea
                  className="form-control"
                  id="note"
                  rows="3"
                  placeholder="Ví dụ: Giao buổi sáng, gọi trước khi đến..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="card p-3 mb-3">
              <h5>Chi tiết đơn hàng</h5>
              {orderItems?.map((item, index) => (
                <div key={`${item.id}-${item.size}-${item.color}`}>
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={`${URL}/uploads/${item.image}`}
                      alt="Product"
                      className="me-2"
                      style={{
                        width: "20%",
                        height: "20%",
                        objectFit: "cover",
                      }}
                    />
                    <div
                      className="d-flex justify-content-between"
                      style={{ flexDirection: "column", height: "160px" }}
                    >
                      <div>
                        <p className="mb-0">{item.name}</p>
                        <small className="text-muted">
                          {item.color}, {item.size}
                        </small>
                      </div>
                      <div className="d-flex justify-content-between">
                        <p>X {item.quantity}</p>
                        <small className="text-muted">
                          {Number(item.price).toLocaleString("vi-VN")}đ
                        </small>
                      </div>
                      {item.discount_type && (
                        <div>
                          <small className="text-success">
                            Đã áp dụng mã: <strong>{item.code}</strong> -{" "}
                            {item.discount_type === "fixed"
                              ? `${parseFloat(
                                  item.discount_value
                                ).toLocaleString("vi-VN")}₫`
                              : `${parseFloat(
                                  item.discount_value
                                ).toLocaleString("vi-VN")}%`}
                          </small>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-md-5 mt-5">
            <div className="card p-3 shadow-sm border-0 rounded-3">
              <Button
                onClick={() => setShowCoupons(!showCoupons)}
                variant="light"
                className="d-flex justify-content-between align-items-center mb-3 shadow-sm w-100 p-3 rounded-3"
                style={{ border: "1px solid #ddd" }}
              >
                <div className="d-flex align-items-center">
                   <FaTags size={20} className="me-3 text-danger" />
                  <span className="fw-semibold text-dark">Chọn khuyến mãi</span>
                </div>
                <FiChevronRight size={20} className="text-secondary" />
              </Button>
              <Button
                onClick={() => setShowPayments(true)}
                variant="light"
                className="d-flex justify-content-between align-items-center mb-3 shadow-sm w-100 p-3 rounded-3"
                style={{ border: "1px solid #ddd" }}
              >
                <div className="d-flex align-items-center">
                   <FaWallet size={20} className="me-3 text-success" />
                  <span className="fw-semibold text-dark">
                    {paymentMethod === "COD"
                      ? "COD - Thanh toán khi nhận hàng"
                      : "MOMO - Chuyển khoản"}
                  </span>
                </div>
                <FiChevronRight size={20} className="text-secondary" />
              </Button>

              <hr className="mb-3" />

              <div className="p-3 border rounded-3 shadow-sm bg-white">
                <h5 className="mb-3">🧾 Chi tiết đơn hàng</h5>
                
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Tổng tiền</span>
                  <span className="fw-semibold">{total.toLocaleString("vi-VN")}đ</span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Giảm giá</span>
                  <span className="text-danger fw-semibold">
                    -{discount.toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">Phí vận chuyển</span>
                  <span className="fw-semibold">
                    {(shipping ?? 0).toLocaleString("vi-VN")}đ
                  </span>
                </div>

                <hr className="mb-2" />

                 <div className="d-flex justify-content-between fw-bold fs-5 mb-2">
                  <span>Thành tiền</span>
                  <span className="text-danger">
                    {(total - discount + shipping).toLocaleString("vi-VN")}đ
                  </span>
                </div>

                {discount > 0 && (
                  <small className="text-muted">
                    Tiết kiệm {discount.toLocaleString("vi-VN")}đ
                  </small>
                )}
              </div>

              <div className="alert alert-info mt-3 rounded-3 shadow-sm" role="alert">
                🚚 Đơn từ <strong>2 sản phẩm</strong> được <u>miễn phí vận chuyển</u> nhé!
              </div>
              <button
                onClick={handleSubmit}
                disabled={
                  !name.trim() ||
                  !phone.trim() ||
                  !email.trim() ||
                  !selectedProvince ||
                  !selectedDistrict ||
                  !selectedWard ||
                  loading
                }
                className="btn btn-warning w-100 py-2 fw-bold"
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    Đặt hàng
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      className="bi bi-arrow-right ms-2"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.146-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5a.5.5 0 0 1-.5-.5z"
                      />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
        {showCoupons && (
          <>
            <div
              className={`coupon-overlay ${showCoupons ? "show" : ""}`}
              onClick={() => setShowCoupons(false)}
            ></div>

            <div className={`coupon-list ${showCoupons ? "show" : ""}`}>
              <div className="d-flex justify-content-between align-items-center p-3">
                <h6 className="m-0 fw-bold">🎟️ Chọn mã giảm giá</h6>
                <button
                  style={{
                    color: "black",
                    borderRadius: "50%",
                    background: "transparent",
                    border: "none",
                  }}
                  onClick={() => setShowCoupons(false)}
                >
                  <FiXCircle style={{ color: "#575151" }} size={28} />
                </button>
              </div>
              <hr className="my-2" />

              {coupons?.filter(
                (coupon) =>
                  coupon.status === "active" &&
                  coupon.quantity > 0 &&
                  total >= coupon.min_order_total &&
                  new Date(coupon.end_date) >= new Date()
              ).length > 0 ? (
                coupons
                  .filter(
                    (coupon) =>
                      coupon.status === "active" &&
                      coupon.quantity > 0 &&
                      total >= coupon.min_order_total &&
                      new Date(coupon.end_date) >= new Date()
                  )
                  .map((coupon) => {
                    const isSelected = selectedCoupon?.id === coupon.id;

                    return (
                      <div
                        key={coupon.id}
                        onClick={() => setSelectedCoupon(coupon)}
                        className={`d-flex justify-content-between align-items-center p-3 mb-3 rounded-3 shadow-sm coupon-card ${
                          isSelected ? "selected" : ""
                        }`}
                        style={{ cursor: "pointer" }}
                      >
                        <div className="d-flex align-items-center">
                          <div
                            className="d-flex justify-content-center align-items-center rounded-circle me-3"
                            style={{
                              background: "#ffe5d0",
                              width: "45px",
                              height: "45px",
                            }}
                          >
                            <span className="fw-bold text-danger fs-5">
                              {coupon.discount_type === "percent" ? "%" : "₫"}
                            </span>
                          </div>

                          <div>
                            <div className="fw-bold text-dark">
                              {coupon.code || "Ưu đãi đặc biệt"}
                            </div>
                            <div className="text-secondary small">
                              Giảm{" "}
                              {coupon.discount_type === "fixed"
                                ? parseFloat(coupon.discount_value).toLocaleString(
                                    "vi-VN"
                                  ) + " ₫"
                                : `${parseFloat(
                                    coupon.discount_value
                                  ).toLocaleString("vi-VN")} %`}
                            </div>
                          </div>
                        </div>

                        <div>
                          <div
                            className={`coupon-check ${isSelected ? "selected" : ""}`}
                            onClick={() => setSelectedCoupon(coupon)}
                          >
                            {isSelected && <span className="check-icon">✓</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })
              ) : (
                <div className="no-coupon text-center py-5">
                  <FiFrown size={50} color="#ff6b6b" className="bounce" />
                  <p className="text-secondary mt-2 fw-bold">Không có mã giảm giá nào</p>

                  <style jsx>{`
                    .bounce {
                      display: inline-block;
                      animation: bounce 1s infinite;
                    }

                    @keyframes bounce {
                      0%, 100% { transform: translateY(0); }
                      50% { transform: translateY(-15px); }
                    }
                  `}</style>
                </div>

              )}
            </div>

            <style jsx>{`
              .coupon-check {
                width: 22px;
                height: 22px;
                border-radius: 50%;
                border: 2px solid #ccc;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s ease;
              }
              .coupon-check:hover {
                border-color: #ffc107;
              }
              .coupon-check .check-icon {
                color: white;
                font-size: 14px;
                font-weight: bold;
              }
              .coupon-check.selected {
                background-color: #ffc107;
                border-color: #ffc107;
              }
            `}</style>
          </>
        )}

      {showPayments && (
        <>
          <div
            className={`coupon-overlay ${showPayments ? "show" : ""}`}
            onClick={() => setShowPayments(false)}
          ></div>

          <div className={`coupon-list ${showPayments ? "show" : ""}`}>
            <div
              className="d-flex justify-content-between m-2  align-items-center" >
              <h6 className="m-0 fw-bold">Chọn phương thức thanh toán</h6>
              <button
                style={{
                  color: "black",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
                onClick={() => setShowPayments(false)}
              >
                <FiXCircle style={{ color: "#575151" }} size={30} />
              </button>
            </div>
            <hr />

            <div className={`coupon-item d-flex justify-content-between align-items-center p-3 mb-2 rounded-3 ${
                paymentMethod === "COD" ? "bg-light border border-success" : "border"
                  }`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setPaymentMethod("COD")}
                >
              <div className="d-flex align-items-center ">
                <div
                 style={{
                  background: "#28a74520",
                  width: "40px",
                  height: "40px",
                }}
                  className="rounded-circle d-flex justify-content-center align-items-center">
                   <img src={COD}  style={{
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                }} />
                </div>
                <div className="ms-3">
                   <div className="fw-bold text-dark">COD</div>
                    <div className="text-secondary small">Thanh toán khi nhận hàng</div>
                </div>
              </div>
              <Form.Check
                type="radio"
                name="payment"
                onChange={() => setPaymentMethod("COD")}
                checked={paymentMethod === "COD"}
                
              />
            </div>

            <div  className={`coupon-item d-flex justify-content-between align-items-center p-3 mb-2 rounded-3 ${
                  paymentMethod === "MOMO" ? "bg-light border border-danger" : "border"
                }`}
                style={{ cursor: "pointer" }}
                onClick={() => setPaymentMethod("MOMO")}
              >
              <div className="d-flex align-items-center">
                <div className="rounded-circle d-flex justify-content-center align-items-center"
                style={{
                  background: "#ff008020",
                  width: "40px",
                  height: "40px",
                }}
                >
                  <img src={MOMO}  style={{
                  borderRadius: "50%",
                  width: "40px",
                  height: "40px",
                }} />
                </div>
                <div className="ms-2">
                    <div className="fw-bold text-dark">MOMO</div>
                   <div className="text-secondary small">Chuyển khoản qua MOMO</div>
                </div>
              </div>
              <Form.Check
                type="radio"
                name="payment"
                onChange={() => setPaymentMethod("MOMO")}
                checked={paymentMethod === "MOMO"}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Order;
