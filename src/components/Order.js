import { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Import Bootstrap CSS
import { Spinner, Alert } from "react-bootstrap";
import { MdOutlineCreditCard } from "react-icons/md";
import { FaAmazonPay } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../assets/Order.css";
import { Container, Row, Col, Form, Button } from "react-bootstrap";
import { FiXCircle } from "react-icons/fi";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
const Order = () => {
  const API_URL_USER = "http://localhost:5000/api/";
  const { user } = useAuth();

  const { clearOrder } = useCart();
  const [orderItems, setOrderItems] = useState([]);
  const navigate = useNavigate();
  const [total, setTotal] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(20000);
  const [showCoupons, setShowCoupons] = useState(false);
  const [productDiscount, setProductDiscount] = useState(0);
  // Loading + success
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  useEffect(() => {
    const savedOrder = localStorage.getItem("order");
    if (savedOrder) {
      const items = JSON.parse(savedOrder);
      setOrderItems(items);

      let totalPrice = 0;
      let discountAmount = 0;
      let totalQuantity = 0;

      items.forEach((item) => {
        const itemPrice = Number(item.price);
        const quantity = Number(item.quantity);
        totalQuantity += quantity;

        // Tính giảm giá cho từng sản phẩm nếu có
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

        // Tổng tiền sau khi trừ giảm giá từng sản phẩm
        totalPrice += finalItemPrice * quantity;
        
      });

      setTotal(totalPrice);
      setProductDiscount(discountAmount); // dùng để hiển thị riêng nếu muốn
      setShipping(totalQuantity >= 2 ? 0 : 20000); // miễn phí ship nếu có từ 2 sản phẩm
    }
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
    fetch("https://provinces.open-api.vn/api/?depth=1")
      .then((res) => res.json())
      .then(setProvinces)
      .catch((err) => setSuccessMsg("Lỗi tải tỉnh:", err));
  }, []);

  // Lấy danh sách quận/huyện khi chọn tỉnh
  useEffect(() => {
    if (selectedProvince) {
      fetch(`https://provinces.open-api.vn/api/p/${selectedProvince}?depth=2`)
        .then((res) => res.json())
        .then((data) => setDistricts(data.districts))
        .catch((err) => setSuccessMsg("Lỗi tải quận/huyện:", err));
    } else {
      setDistricts([]);
      setWards([]);
    }
  }, [selectedProvince]);

  // Lấy danh sách phường/xã khi chọn huyện
  useEffect(() => {
    if (selectedDistrict) {
      fetch(`https://provinces.open-api.vn/api/d/${selectedDistrict}?depth=2`)
        .then((res) => res.json())
        .then((data) => setWards(data.wards))
        .catch((err) => setSuccessMsg("Lỗi tải phường/xã:", err));
    } else {
      setWards([]);
    }
  }, [selectedDistrict]);
  // coupon
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [coupons, setCoupons] = useState([]);
  useEffect(() => {
    axios
      .get(
        "https://finlyapi-production.up.railway.app/api/coupons?description=0"
      )
      .then((res) => {
        const filteredCoupons = res.data.coupons.filter(
          (coupon) => coupon.description === "0"
        );
        setCoupons(filteredCoupons);
      });
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

  //   post
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
      provinces.find((p) => p.code === Number(selectedProvince))?.name || "";
    const districtName =
      districts.find((d) => d.code === Number(selectedDistrict))?.name || "";
    const wardName =
      wards.find((w) => w.code === Number(selectedWard))?.name || "";
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
console.log(orderData);

    if (selectedCoupon) {
      orderData.coupon_id = selectedCoupon.id;
    }

    try {
      if (paymentMethod === "COD") {
        // Gửi đơn hàng luôn
        const res = await fetch(
          "https://finlyapi-production.up.railway.app/api/orders/add",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
            credentials: "include", // ← Thêm dòng này để CORS hoạt động đúng nếu backend có credentials
          }
        );

        const data = await res.json();
        if (res.ok) {
          if (selectedCoupon) {
            await fetch(
              `https://finlyapi-production.up.railway.app/api/coupons/use/${selectedCoupon.id}`,
              {
                method: "PATCH",
              }
            );
          }
          clearOrder();
          setSuccessMsg(
            "🎉 Đặt hàng thành công! Bạn sẽ được chuyển về trang chủ..."
          );
          setTimeout(() => {
            navigate("/");
          }, 1500);
        } else {
          setSuccessMsg("Lỗi: " + data.message);
        }
      } else if (paymentMethod === "VNPAY") {
        // Gọi API tạo link thanh toán
        const res = await fetch(
          "https://finlyapi-production.up.railway.app/api/orders/create-vnpay",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
          }
        );

        const data = await res.json();
        // console.log("🔍 Dữ liệu trả về từ API create-vnpay:", data);
        // console.log(data.paymentUrl);
        // console.log(res.ok);

        if (res.ok && data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          setSuccessMsg("Không tạo được link thanh toán.");
        }
      }
    } catch (err) {
      // console.error("Lỗi khi xử lý đơn hàng:", err);
      setSuccessMsg("Không thể gửi đơn hàng.");
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
      {successMsg && (
        <Alert variant="success" className="text-center">
          {successMsg}
        </Alert>
      )}
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-7">
            <div className="card p-3 mb-3">
              <h5>Thông tin người nhận</h5>
              {user ? (
                <div className="alert alert-info mt-2">
                  Đã tự động điền thông tin từ tài khoản đăng nhập.
                </div>
              ) : (
                <div className="alert alert-info mt-2">
                  Khách hàng dùng email để đăng nhập, mật khẩu được gửi về email
                  khách hàng!
                </div>
              )}

              <div className="mb-2">
                <label htmlFor="name" className="form-label">
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
                <label htmlFor="phone" className="form-label">
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
                <label htmlFor="email" className="form-label">
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
                <div>
                  <div className="mb-3">
                    <label className="form-label">Địa chỉ giao hàng</label>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <select
                          className="form-select"
                          value={selectedProvince}
                          onChange={(e) => setSelectedProvince(e.target.value)}
                        >
                          <option value="">-- Chọn Tỉnh/Thành phố --</option>
                          {provinces?.map((province) => (
                            <option key={province.code} value={province.code}>
                              {province.name}
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
                          <option value="">-- Chọn Quận/Huyện --</option>
                          {districts?.map((district) => (
                            <option key={district.code} value={district.code}>
                              {district.name}
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
                          <option value="">-- Chọn Phường/Xã --</option>
                          {wards?.map((ward) => (
                            <option key={ward.code} value={ward.code}>
                              {ward.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="mt-3">
                      <strong>Địa chỉ đã chọn:</strong>{" "}
                      {selectedProvince && selectedDistrict && selectedWard ? (
                        <>
                          {
                            provinces.find(
                              (p) => p.code === Number(selectedProvince)
                            )?.name
                          }
                          ,{" "}
                          {
                            districts.find(
                              (d) => d.code === Number(selectedDistrict)
                            )?.name
                          }
                          ,{" "}
                          {
                            wards.find((w) => w.code === Number(selectedWard))
                              ?.name
                          }
                        </>
                      ) : (
                        <span>Chưa chọn đầy đủ</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mb-2">
                <label htmlFor="note" className="form-label">
                  Nhập ghi chú (không bắt buộc)
                </label>
                <textarea
                  className="form-control"
                  id="note"
                  rows="3"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>
            </div>
            <div className="card p-3 mb-3">
              <h5>Chi tiết đơn hàng</h5>
              {orderItems?.map((item, index) => (
                <div key={index}>
                  <div className="d-flex align-items-center mb-2">
                    <img
                      src={`https://finlyapi-production.up.railway.app/uploads/${item.image}`}
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
            <div className="card p-3">
              <Button
                onClick={() => setShowCoupons(!showCoupons)}
                style={{
                  background: "transparent",
                  border: "1px solid #a7a7a7",
                  borderRadius: "15px",
                }}
                className="d-flex p-2 justify-content-between align-items-center mb-3"
              >
                <div style={{ width: "100%" }} className="d-flex">
                  <MdOutlineCreditCard
                    size={25}
                    className="mx-3"
                    style={{ color: "blue" }}
                  />
                  <div
                    style={{
                      color: "black",
                    }}
                  >
                    Chọn khuyến mãi
                  </div>
                </div>
                <button className="btn btn-sm">></button>
              </Button>
              <Button
                onClick={() => setShowPayments(true)}
                style={{
                  background: "transparent",
                  border: "1px solid #a7a7a7",
                  borderRadius: "15px",
                }}
                className="d-flex p-2 justify-content-between align-items-center mb-3"
              >
                <div style={{ width: "100%" }} className="d-flex">
                  <MdOutlineCreditCard
                    size={25}
                    className="mx-3"
                    style={{ color: "blue" }}
                  />
                  <div style={{ color: "black" }}>
                    {paymentMethod === "COD"
                      ? "COD - Thanh toán khi nhận hàng"
                      : "VNPAY - Chuyển khoản"}
                  </div>
                </div>
                <button className="btn btn-sm">{">"}</button>
              </Button>

              <hr className="mb-3" />

              <div>
                <h5>Chi tiết đơn hàng</h5>
                <div className="d-flex justify-content-between mb-2">
                  <span>Tổng tiền</span>
                  <span>{total.toLocaleString("vi-VN")}đ</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Giảm giá</span>
                  <span className="text-danger">
                    -{discount.toLocaleString("vi-VN")}đ
                  </span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Phí vận chuyển</span>
                  <span>{shipping.toLocaleString("vi-VN")}đ</span>
                </div>
                <hr className="mb-2" />
                <div className="d-flex justify-content-between fw-bold mb-3">
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

              <div className="alert alert-info mt-3" role="alert">
                Đơn từ 2 sản phẩm được miễn phí vận chuyển nhé!
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
            <div className="d-flex justify-content-between m-2">
              <h6>Chọn mã giảm giá</h6>
              <button
                style={{
                  color: "black",
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                }}
                onClick={() => setShowCoupons(false)}
              >
                <FiXCircle style={{ color: "#575151" }} size={30} />
              </button>
            </div>
            <hr />
            {coupons?.map(
              (coupon) =>
                total >= coupon.min_order_total &&
                coupon.status === "active" && (
                  <div key={coupon.id} className="coupon-item">
                    <div className="d-flex">
                      <div className="rounded-circle">%</div>
                      <div>
                        <div className="font-weight-bold">
                          {coupon.code || "Ưu đãi đặc biệt"}
                        </div>
                        <div className="text-secondary">
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
                    {coupon.quantity > 0 && (
                      <Form.Check
                        type="radio"
                        name="promotion"
                        onChange={() => setSelectedCoupon(coupon)}
                        checked={selectedCoupon?.id === coupon.id}
                      />
                    )}
                  </div>
                )
            )}
          </div>
        </>
      )}
      {showPayments && (
        <>
          <div
            className={`coupon-overlay ${showPayments ? "show" : ""}`}
            onClick={() => setShowPayments(false)}
          ></div>

          <div className={`coupon-list ${showPayments ? "show" : ""}`}>
            <div className="d-flex justify-content-between m-2">
              <h6>Chọn phương thức thanh toán</h6>
              <button
                style={{
                  color: "black",
                  borderRadius: "50%",
                  background: "transparent",
                  border: "none",
                }}
                onClick={() => setShowPayments(false)}
              >
                <FiXCircle style={{ color: "#575151" }} size={30} />
              </button>
            </div>
            <hr />

            <div className="coupon-item d-flex justify-content-between align-items-center">
              <div className="d-flex">
                <div className="rounded-circle">
                  <FaAmazonPay size={20} />
                </div>
                <div className="ms-2">
                  <div className="fw-bold">COD</div>
                  <div className="text-secondary">Thanh toán khi nhận hàng</div>
                </div>
              </div>
              <Form.Check
                type="radio"
                name="payment"
                onChange={() => setPaymentMethod("COD")}
                checked={paymentMethod === "COD"}
              />
            </div>

            <div className="coupon-item d-flex justify-content-between align-items-center">
              <div className="d-flex">
                <div className="rounded-circle">
                  <MdOutlineCreditCard size={20} />
                </div>
                <div className="ms-2">
                  <div className="fw-bold">VNPAY</div>
                  <div className="text-secondary">Chuyển khoản qua VNPAY</div>
                </div>
              </div>
              <Form.Check
                type="radio"
                name="payment"
                onChange={() => setPaymentMethod("VNPAY")}
                checked={paymentMethod === "VNPAY"}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Order;
