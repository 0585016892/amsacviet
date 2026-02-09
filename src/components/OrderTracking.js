import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Spinner, Button, Badge } from 'react-bootstrap';
import {
  FaBoxOpen, FaCheckCircle, FaTruck, FaMapMarkerAlt,
  FaInfoCircle, FaTimesCircle, FaArrowLeft, FaStore, FaWallet
} from 'react-icons/fa';
import { useLocation, useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { motion } from 'framer-motion';
import orderApi from '../api/orderApi';

const OrderTracking = () => {
  const URL = process.env.REACT_APP_WEB_URL || ""; // Tránh lỗi undefined khi nối chuỗi URL
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const { order: stateOrder } = location.state || {};

  const [order, setOrder] = useState(stateOrder || null);
  const [loading, setLoading] = useState(!stateOrder);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Nếu chưa có dữ liệu từ state thì mới gọi API
    if (!order && id) {
      setLoading(true);
      orderApi.getOrder(id)
        .then(res => {
          // Kiểm tra cấu trúc dữ liệu trả về để tránh lỗi null/undefined
          if (res && res.success && res.order) {
            setOrder(res.order);
          } else {
            setError(res?.message || "Không thể lấy thông tin đơn hàng.");
          }
        })
        .catch(err => {
          console.error("Lỗi Fetching:", err);
          setError("Đã xảy ra lỗi kết nối với máy chủ.");
        })
        .finally(() => setLoading(false));
    }
  }, [id, order]);

  // Các bước xử lý trạng thái an toàn
  const steps = [
    { key: "chờ xử lý", label: "Đã Đặt Hàng", icon: <FaBoxOpen /> },
    { key: "đã xác nhận", label: "Xác Nhận", icon: <FaCheckCircle /> },
    { key: "đang giao", label: "Đang Giao", icon: <FaTruck /> },
    { key: "đã giao", label: "Đã Giao", icon: <FaMapMarkerAlt /> },
    { key: "hoàn thành", label: "Hoàn Thành", icon: <FaCheckCircle /> },
  ];

  // Sử dụng Optional Chaining (?.) để tránh "Script Error" khi gọi toLowerCase() trên dữ liệu null
  const orderStatus = order?.status?.toLowerCase() || "";
  const statusMap = { "chờ xử lý": 1, "đã xác nhận": 2, "đang giao": 3, "đã giao": 4, "hoàn thành": 5 };
  const currentStepIndex = statusMap[orderStatus] || 0;

  if (loading) return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh" }}>
      <Spinner animation="border" variant="danger" />
    </div>
  );

  if (error || !order) return (
    <Container className="text-center mt-5">
      <FaTimesCircle size={50} color="red" />
      <p className="mt-3 text-danger fw-bold">{error || "Dữ liệu đơn hàng không tồn tại!"}</p>
      <Button variant="outline-dark" onClick={() => navigate('/blog')}>Quay lại</Button>
    </Container>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      style={{ background: '#f8f9fa', minHeight: '100vh', padding: '100px 0' }}
    >
      <Container>
        {/* Header Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Button variant="link" className="text-dark p-0 text-decoration-none fw-bold" onClick={() => navigate(-1)}>
            <FaArrowLeft className="me-2" /> TRỞ LẠI
          </Button>
          <div className="text-end">
            <div className="text-muted small">MÃ ĐƠN HÀNG: <span className="text-dark fw-bold">#ASM{order.id}</span></div>
            <Badge bg={orderStatus === 'đã hủy' ? 'danger' : 'success'} className="text-uppercase p-2">
              {order.status || "N/A"}
            </Badge>
          </div>
        </div>

        {/* Stepper logic with safe index checking */}
        <Card className="border-0 shadow-sm rounded-4 mb-4">
          <Card.Body className="py-5">
            <div className="d-flex justify-content-between position-relative stepper-wrapper flex-wrap">
              {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex - 1;

                return (
                  <div key={step.key} className="text-center flex-fill position-relative z-index-2 mb-3">
                    <div className={`step-icon mx-auto mb-3 ${isCompleted ? 'bg-danger text-white' : 'bg-light text-muted'}`}>
                      {step.icon}
                    </div>
                    <div className={`small fw-bold ${isCompleted ? 'text-dark' : 'text-muted'}`}>{step.label}</div>
                    {/* Vẽ line nối giữa các bước */}
                    {index < steps.length - 1 && (
                      <div className={`step-connector d-none d-md-block ${index < currentStepIndex - 1 ? 'active' : ''}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </Card.Body>
        </Card>

        <Row className="g-4">
          <Col lg={4}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <h6 className="fw-bold mb-4 d-flex align-items-center">
                  <FaMapMarkerAlt className="text-danger me-2" /> ĐỊA CHỈ NHẬN HÀNG
                </h6>
                <div className="mb-3">
                  <div className="fw-bold fs-5">{order.customer_name || "Khách hàng"}</div>
                  <div className="text-secondary">{order.customer_phone || "Không có SĐT"}</div>
                </div>
                <div className="text-muted small lh-base">{order.address || "Chưa cập nhật địa chỉ"}</div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={8}>
            <Card className="border-0 shadow-sm rounded-4">
              <Card.Body className="p-4">
                <div className="d-flex align-items-center mb-4">
                  <FaStore className="me-2 text-secondary" />
                  <span className="fw-bold">Âm Sắc Việt</span>
                </div>

                <div className="product-list mb-4">
                  {/* Kiểm tra mảng items trước khi map */}
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    order.items.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center py-3 border-bottom">
                        <img 
                          src={item.image ? `${URL}/uploads/${item.image}` : "https://via.placeholder.com/80"} 
                          alt={item.name} 
                          className="rounded-3 border" 
                          style={{ width: '80px', height: '80px', objectFit: 'cover' }} 
                        />
                        <div className="ms-3 flex-grow-1">
                          <div className="fw-bold text-truncate" style={{ maxWidth: '250px' }}>{item.name}</div>
                          <div className="text-muted small">Số lượng: {item.quantity}</div>
                        </div>
                        <div className="text-end fw-bold text-danger">
                          ₫{Number(item.price || 0).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted">Không có thông tin sản phẩm.</p>
                  )}
                </div>

                <div className="bg-light p-4 rounded-4">
                  <Row className="gy-2">
                    <Col xs={7}>Tổng tiền hàng</Col>
                    <Col xs={5} className="text-end">₫{Number(order.total || 0).toLocaleString()}</Col>
                    <Col xs={7}>Phí vận chuyển</Col>
                    <Col xs={5} className="text-end">₫{Number(order.shipping || 0).toLocaleString()}</Col>
                    <Col xs={7} className="text-muted">Voucher</Col>
                    <Col xs={5} className="text-end text-success">-₫{Number(order.discount || 0).toLocaleString()}</Col>
                    <Col xs={12}><hr /></Col>
                    <Col xs={7} className="fw-bold">Thành tiền</Col>
                    <Col xs={5} className="text-end fw-bold text-danger fs-5">
                      ₫{Number(order.final_total || 0).toLocaleString()}
                    </Col>
                  </Row>
                </div>

                <div className="mt-4 p-3 border-start border-4 border-primary bg-primary bg-opacity-10 rounded-end">
                   <div className="d-flex align-items-center">
                      <FaWallet className="text-primary me-3 fs-4" />
                      <div>
                        <div className="small fw-bold">Phương thức Thanh toán</div>
                        <div className="text-primary fw-bold text-uppercase">
                          {order.payment_method === "COD" ? "Thanh toán khi nhận hàng" : order.payment_method}
                        </div>
                      </div>
                   </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .stepper-wrapper { padding: 0 20px; }
        .step-icon { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; position: relative; z-index: 5; }
        .step-connector { position: absolute; top: 25px; left: 50%; width: 100%; height: 3px; background: #e9ecef; z-index: 1; transition: background 0.5s ease; }
        .step-connector.active { background: #dc3545; }
        .rounded-4 { border-radius: 1rem !important; }
        @media (max-width: 768px) {
          .stepper-wrapper { flex-direction: column; align-items: flex-start; }
          .step-connector { display: none; }
        }
      `}</style>
    </motion.div>
  );
};

export default OrderTracking;