import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import {
  FaBoxOpen,
  FaCheckCircle,
  FaTruck,
  FaMapMarkerAlt,
  FaInfoCircle,
  FaTimesCircle,
} from 'react-icons/fa';
import { useLocation, useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { motion, AnimatePresence } from 'framer-motion';
import orderApi from '../api/orderApi'; // API gọi backend lấy order theo id
const OrderTracking = () => {
  const URL = process.env.REACT_APP_WEB_URL; 
  dayjs.extend(utc);
  dayjs.extend(timezone);

  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { order: stateOrder } = location.state || {};

  const [order, setOrder] = useState(stateOrder || null);
  const [loading, setLoading] = useState(!stateOrder);

useEffect(() => {
  if (!order && id) {
    setLoading(true);
    orderApi.getOrder(id)
      .then(res => {
        if (res.success) {         // res = { success, order }
          setOrder(res.order);     // chỉ set phần order
        } else {
          console.error(res.message || "Không tìm thấy dữ liệu order");
        }
      })
      .catch(err => {
        console.error("Lỗi khi lấy đơn hàng:", err);
      })
      .finally(() => setLoading(false));
  }
}, [id, order]);

  if (loading) {
    return <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
            }}
          >
            <Spinner animation="border" variant="warning" />
          </div>;
  }

  if (!order) {
    return <p className="text-center mt-5 text-danger">Không tìm thấy đơn hàng!</p>;
  }
  

  return (
     <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      transition={{ duration: 0.5 }}
    >
<Container className="p-4 bg-light profile" style={{ height: "800px" }}>
      {/* Header và nút */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div className="d-flex align-items-center">
          <span className="text-secondary me-2" style={{ cursor:'pointer'}} onClick={() => navigate(-1)}>← TRỞ LẠI</span>
          
        </div>
        <div className="d-flex">
          <span className="ms-3 text-secondary">MÃ ĐƠN HÀNG: {`DH18072003${order.id} `}</span>
          <span className="ms-3 text-danger fw-bold">| ĐƠN HÀNG {order.status.toUpperCase()}</span>
        </div>
      </div>

      {/* Thanh trạng thái đơn hàng */}
      <Card className="mb-4 shadow-sm">
        <Card.Body>
            <div className="order-timeline d-flex justify-content-between align-items-start">
              <AnimatePresence>
                {[
                { key: "ordered", label: "Đơn Hàng Đã Đặt", icon: <FaBoxOpen /> },
                { key: "confirmed", label: "Đã Xác Nhận Thông Tin Thanh Toán", icon: <FaCheckCircle /> },
                { key: "shipped", label: "Đã Giao Cho ĐVC", icon: <FaTruck /> },
                { key: "delivered", label: "Đã Nhận Được Hàng", icon: <FaMapMarkerAlt /> },
              ].map((step, index, arr) => {
                const statusMap = {
                  "chờ xử lý": 1,
                  "đang giao": 3,
                  "đã giao": 4,
                  "hoàn thành": 5,
                };
                const currentStep = statusMap[order.status?.toLowerCase()] || 0;
                const isActive = index < currentStep;

                return (
                   <motion.div
                      key={step.key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.2 }}
                      className="step text-center flex-fill position-relative"
                    >
                    <div key={step.key} className="step text-center flex-fill position-relative">
                      <div className={`circle ${isActive ? "active" : ""}`}>
                        {step.icon}
                      </div>
                      {index < arr.length - 1 && (
                        <div className={`line ${index < currentStep - 1 ? "active" : ""}`} />
                      )}
                      <div style={{fontSize:'11px'}} className={`label mt-2 ${isActive ? "text-dark fw-bold" : "text-muted"}`}>
                        {step.label}
                      </div>
                    </div>
                    </motion.div>
                  
                );
              })}
              </AnimatePresence>
           
          </div>

          <AnimatePresence>
              {order.status?.toLowerCase() === 'đã hủy' && (
                <motion.div
                  key="cancelled"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.4 }}
                  className="text-center w-100 mt-3 text-danger fw-bold"
                >
                  <FaTimesCircle className="me-2" />
                  ĐƠN HÀNG ĐÃ HỦY
                </motion.div>
              )}
            </AnimatePresence>
        </Card.Body>

      </Card>
      <p className="text-center text-muted small mt-2">Cảm ơn bạn đã mua sắm tại Âm Sắc Việt!</p>

        {/* Thông tin vận chuyển */}
        <AnimatePresence>
          {order.items && order.items.length > 0 && (
             <motion.div
              key="shipping-card"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.5 }}
            >
          <Card className="mb-4 shadow-sm">
                  <Card.Body>
                    <Row>
                      <Col md={4}>
                        <div className="p-3 border rounded shadow-sm bg-white h-100">
                          <h5 className="fw-bold mb-3 ">📍 Địa Chỉ Nhận Hàng</h5>
                          <div className="text-secondary small">
                            <div className="fw-bold text-dark fs-6 mb-1">{order.customer_name}</div>
                            <div className="mb-1">📞 {order.customer_phone}</div>
                            <div className="text-wrap">🏠 {order.address}</div>
                          </div>
                        </div>
                      </Col>
                      <Col md={8} className="ps-5">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="fw-bold">ASM Express</div>
                        </div>
                        {/* Timeline vận chuyển */}
                        <div className="d-flex flex-column border-start ps-3">
                        <Card className="shadow-sm">
                            <Card.Body>
                              {/* Header chi tiết sản phẩm */}
                              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                                <div className="d-flex align-items-center">
                                  {Number(order.shipping) !== 0 && (
                                      <>
                                        {order.payment_method === "MOMO" ? (
                                          <div className="text-success small d-flex align-items-center">
                                            <FaInfoCircle className="me-2" />
                                            Bạn đã chọn thanh toán qua MoMo.
                                          </div>
                                        ) : (
                                          <div className="text-warning small d-flex align-items-center">
                                            <FaInfoCircle className="me-2" />
                                            Vui lòng thanh toán
                                            <span className="text-danger ms-1">
                                              {Number(order.final_total).toLocaleString("vi-VN")} VND 
                                            </span>
                                            {" "} khi nhận hàng.
                                          </div>
                                        )}
                                      </>
                                    )}
                                </div>
                                <div className="text-secondary small">
                                  <FaInfoCircle className="me-1" />
                                  HOÀN THÀNH
                                </div>
                              </div>

                              {/* Thông tin sản phẩm */}
                              {order.items.map((item) => (
                            <Row className="mb-3" key={item.id}>
                              <Col md={9}>
                                <Row>
                                  <Col xs="auto">
                                    <motion.img
                                      src={`${URL}/uploads/${item.image}`}
                                      alt={item.name}
                                      style={{ width: '80px' }}
                                      initial={{ opacity: 0, scale: 0.9 }}
                                      animate={{ opacity: 1, scale: 1 }}
                                      transition={{ duration: 0.3 }}
                                    />
                                  </Col>
                                  <Col>
                                    <p className="mb-0">{item.name}</p>
                                    <p className="mb-0 text-muted small">
                                      Phân loại hàng: {item.size || "Không có"}
                                    </p>
                                    <p className="mb-0 text-muted small">x {item.quantity}</p>
                                  </Col>
                                </Row>
                              </Col>
                              <Col
                                md={3}
                                className="d-flex justify-content-end align-items-center"
                              >
                                {/* Nếu muốn chia đều discount cho mỗi item */}
                                <span className="text-muted text-decoration-line-through small me-2">
                                  ₫{(Number(order.discount) / order.items.length).toLocaleString("vi-VN")}
                                </span>
                                <span className="text-danger fw-bold">
                                  ₫{Number(item.price).toLocaleString("vi-VN")}
                                </span>
                              </Col>
                            </Row>
                          ))}

                              
                            {/* Tổng kết giá */}
                             <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.8 }}
                          className="mt-3 pt-3 border-top"
                        >
                              <div className="mt-3 pt-3 border-top">
                                <Row className="justify-content-end mb-2">
                                  <Col xs="auto" className="text-end">
                                    <div className="text-secondary small">Tổng tiền hàng</div>
                                    <div className="text-secondary small">Phí vận chuyển</div>
                                    <div className="text-secondary small">Voucher từ Âm Sắc Việt</div>
                                    <div className="fw-bold mt-2">Thành tiền</div>
                                  </Col>
                                  <Col xs="auto" className="text-end">
                                    <div className="small">₫{Number(order.total).toLocaleString("vi-VN")}</div>
                                    <div className="small">₫{Number(order.shipping).toLocaleString("vi-VN")}</div>
                                    <div className="small">-₫{Number(order.discount).toLocaleString("vi-VN")}</div>
                                    <div className="text-danger fw-bold mt-2 fs-5">₫{(Number(order.total) + Number(order.shipping) - Number(order.discount)).toLocaleString("vi-VN")}</div>
                                  </Col>
                                </Row>
                              </div>
                              </motion.div>
                              {/* Footer Card */}
                              <div className="d-flex justify-content-between align-items-center mt-3 border-top pt-3">
                                <div className="d-flex align-items-center">
                                  <div className="me-3 text-secondary small">Phương thức Thanh toán</div>
                                  <div className="fw-bold">
                                      {order.payment_method === "COD"
                                        ? "Thanh toán khi nhận hàng"
                                        : order.payment_method === "MOMO"
                                        ? "Thanh toán qua MoMo"
                                        : "Phương thức khác"}
                                    </div>
                                </div>
                              </div>
                            </Card.Body>
                          </Card>
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
              </Card>
              </motion.div>
          )}
      
      </AnimatePresence>
      {/* Chi tiết đơn hàng */}
      
    </Container>
    </motion.div>
    
  );
};

export default OrderTracking;