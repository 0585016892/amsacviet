  import React, { useState, useEffect } from "react";
  import { Container, Tabs, Tab, Card, Row, Col, Badge, Button, Accordion, Table,Nav, ListGroup,Form, Modal  } from "react-bootstrap";
  import userApi from "../api/userApi";
  import { FaUser, FaBell, FaShoppingCart, FaTags, FaCoins, FaStore, FaVideo, FaPlayCircle } from 'react-icons/fa';
  import { RiCoupon2Line } from "react-icons/ri";
  import { BsPencilSquare } from 'react-icons/bs'; // Icon Sửa Hồ Sơ
  import { GiStarsStack } from 'react-icons/gi'; // Icon 9.9
  import { Loading } from "../components";
  import { useAuth } from "../context/AuthContext";
  import { motion, AnimatePresence } from "framer-motion";
  import { io } from "socket.io-client";
  import { showSuccessToast ,showErrorToast} from "../utils/toastUtils";
  import noti from '../img/noti.png';
import { useNavigate } from "react-router-dom";
  

  const statusTabs = [
    { key: "all", label: "Tất cả" },
    { key: "pending", label: "Chờ xác nhận" },
    { key: "shipping", label: "Đang giao hàng" },
    { key: "completed", label: "Hoàn thành" },
    { key: "cancelled", label: "Đã hủy" },
  ];

  const ProfileOrders = () => {
    const URL = process.env.REACT_APP_WEB_URL; 
    const navigate = useNavigate();
  const socket = io(`${URL}`);

    const { logout } = useAuth();
      const [user, setUser] = useState(null);
      const [loading, setLoading] = useState(true);
    
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState("all");
    const [orderHistory, setOrderHistory] = useState([]);
    const [pendingOrders, setPendingOrders] = useState([]);

    const [activeSection, setActiveSection] = useState("orders");

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
      const [passMsg, setPassMsg] = useState("");
      const [showPasswordModal, setShowPasswordModal] = useState(false);
    
    const [updateForm, setUpdateForm] = useState({
        full_name: "",
        phone: "",
        address: "",
    });
    const [showUpdateModal, setShowUpdateModal] = useState(false);

    const [AllVoucher, setAllVoucher] = useState([])
    const [searchTerm, setSearchTerm] = useState("");

    const [notifications, setNotifications] = useState([]);

// lấy data
    useEffect(() => {
      
      const fetchOrders = async () => {
        try {
          const userData = await userApi.getProfile();
          console.log("👤 User fetched:", userData); // <-- log này
          setUser(userData);
          setUpdateForm({
            full_name: userData.full_name,
            phone: userData.phone,
            address: userData.address,
          });

          const data = await userApi.getOrderHistory();
          setOrders(data);

          const dataVouver = await userApi.allVoucher();
          setAllVoucher(dataVouver || []);
        }catch (error) {
        } finally {
          setLoading(false);
        }
      };
      fetchOrders();
    }, []);
    // thông báo
    useEffect(() => {
      const fetchNoti = async () => {
        if (user?.id) {
          const res = await userApi.getNotifications(user.id);
          if (res.success) {
            setNotifications(res.notifications);
          }
        }
      };

      fetchNoti();
    }, [user?.id]);
    useEffect(() => {
      if (!user?.id) return;

       console.log("📡 Kết nối socket, join room:", `user_${user.id}`);
        socket.emit("join", `user_${user.id}`); // giống hệt backend


      const handleNewNoti = (notif) => {
        console.log("🔔 Nhận thông báo mới:", notif);
        setNotifications((prev) => [notif, ...prev]); // cập nhật realtime
      };

      socket.on("newNotification", handleNewNoti);

      return () => {
        console.log("🛑 Ngắt lắng nghe notification");
        socket.off("newNotification", handleNewNoti);
      };
    }, [user?.id]);
    const markNotificationReadAndNavigate = async (notif) => {
      if (!notif) return;
      console.log(notif);
      
      try {
        if (userApi.markNotificationAsRead) {
          console.log("notif.id:", notif.notification_id)
          const res = await userApi.markNotificationAsRead(notif.notification_id);
          console.log(res);
          
          if (res.success) {
            // Cập nhật local state của notifications
            setNotifications(prev =>
              prev.map(n => n.notification_id === notif.notification_id ? { ...n, is_read: 1 } : n)
            );
          }
        }
        if (notif.order_id) {
          navigate(`/order-tracking/${notif.order_id}`, { state: { order: notif.order } });
        } else {
          console.warn("Notification không có order_id:", notif);
        }
      } catch (error) {
        console.error("Lỗi khi đánh dấu notification:", error);
      }
    };
    const handleMarkAllAsRead = async () => {
        if (!user?.id) return;
        try {
          const res = await userApi.markAllNotificationsAsRead(user?.id);
          console.log(res);

          if (res.success) {
            // Cập nhật trạng thái local
            setNotifications(prev =>
              prev.map(n => ({ ...n, is_read: 1 }))
            );
          }
        } catch (err) {
          console.error("Lỗi khi đánh dấu tất cả notification:", err);
        }
      };

    // update trạng thái realtime
    
useEffect(() => {
  const handleOrderUpdate = (data) => {
    console.log("📦 Cập nhật trạng thái đơn hàng:", data);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === Number(data.orderId)
          ? { ...order, status: data.status }
          : order
      )
    );
  };

  socket.on("orderUpdate", handleOrderUpdate);

  return () => {
    socket.off("orderUpdate", handleOrderUpdate);
  };
}, []);
    const filterOrders = (key) => {
      if (key === "all") return orders;
      if (key === "pending") return orders.filter(o => o.status === "Chờ xử lý");
      if (key === "shipping") return orders.filter(o => o.status === "Đang giao");
      if (key === "completed") return orders.filter(o => o.status === "Đã giao");
      if (key === "cancelled") return orders.filter(o => o.status === "Đã hủy");
      return orders;
    };
    // Ảnh đại diện
    const handleUpdateImg = async () => {
          showSuccessToast("Thông báo","Tính năng này chưa phát triển!");
        
    };
    // update pass
    const handlePasswordChange = async () => {
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
          return showSuccessToast("Thông báo","Mật khẩu mới không khớp");
        }
        try {
          const res = await userApi.changePassword(passwordForm);
          showSuccessToast("Thông báo",res.message);
          setShowPasswordModal(false);
        } catch (err) {
          showSuccessToast("Thông báo",err.response?.data?.message || "Đổi mật khẩu thất bại");
        }
    };
      const handleUpdateProfile = async () => {
        try {
          const res = await userApi.updateProfile(updateForm);
          showSuccessToast("Thông báo",res.message || "Cập nhật thành công");
          // Gọi lại API để lấy thông tin mới nhất
          const updatedUser = await userApi.getProfile();
          setUser(updatedUser);
    
          setShowUpdateModal(false);
        } catch (err) {
          showSuccessToast("Thông báo",err.response?.data?.message || "Cập nhật thất bại");
        }
    };
    // mua lại
    const handleReBuy = async () => {
      showSuccessToast("Thông báo", "Chức năng này chưa phát triển");

        
    };
    //gộp sp
  const mergeItems = (items) => {
    const merged = {};

    items.forEach((item) => {
      if (!merged[item.product_id]) {
        // Lần đầu xuất hiện -> thêm vào merged
        merged[item.product_id] = { ...item, count: 1 };
      } else {
        // Nếu đã có rồi thì chỉ tăng số lần xuất hiện (count)
        merged[item.product_id].count += 1;
      }
    });

    return Object.values(merged);
    };
     // lọc danh sách theo searchTerm
  const filteredCoupons = Array.isArray(AllVoucher.coupons)
    ? AllVoucher.coupons.filter((v) =>
        v.code.toLowerCase().includes(searchTerm.toLowerCase().trim())
      )
    : [];
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4 }}
        className="d-flex justify-content-center align-items-center"
        style={{ height: 800 }}
      >
        <Loading />
      </motion.div>
    );
    }

    return (
      <Container className="profile" style={{ height: "800px" }}>
        <Row>
          <Col md={3}>
            <div className="bg-white p-3 shadow-sm" style={{ width: '100%', maxHeight: '100%' }}>
            {/* Phần Thông tin người dùng */}
            <motion.h3
                    className="mb-4 text-primary fw-bold"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
            >
                    <div className="d-flex align-items-center pb-3 border-bottom mb-3">
                <div className="bg-light text-secondary rounded-circle d-flex justify-content-center align-items-center" style={{ width: '50px', height: '50px' }}>
                  <FaUser size={25} />
                </div>
                <div className="ms-3">
                  <div className="fw-bold fs-6">{user.full_name}</div>
                </div>
              </div>
              </motion.h3>
      

              {/* Phần Menu */}
              <Nav className="flex-column">
                <ListGroup variant="flush">
                  <ListGroup.Item
                  as={motion.div}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    style={{cursor:'pointer'}}
                    action className={`d-flex align-items-center border-0 px-0 py-2 ${activeSection === "noti" ? 'text-danger fw-bold' : ''}`} onClick={() => setActiveSection("noti")}>
                    <FaBell color="#FFC107" className="me-3" />
                    Thông Báo
                  </ListGroup.Item>
                  <ListGroup.Item
                      as={motion.div}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{cursor:'pointer'}}
                    transition={{ duration: 0.3 }}
                    action className={`d-flex align-items-center border-0 px-0 py-2 ${activeSection === "profile" ? 'text-danger fw-bold' : ''}`} onClick={() => setActiveSection("profile")}>
                    <FaUser color="#007bff" className="me-3" />
                    Tài Khoản Của Tôi
                  </ListGroup.Item>
                  <ListGroup.Item
                      as={motion.div}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    style={{cursor:'pointer'}}
                    transition={{ duration: 0.3 }}
                    action className={`d-flex align-items-center border-0 px-0 py-2 ${activeSection === "orders" ? 'text-danger fw-bold' : ''}`} onClick={() => setActiveSection("orders")}>
                    <FaShoppingCart color="#dc3545" className="me-3" />
                    Đơn Mua
                  </ListGroup.Item>
                  <ListGroup.Item
                      as={motion.div}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, x: -20 }}
                    style={{cursor:'pointer'}}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    action className={`d-flex align-items-center border-0 px-0 py-2 ${activeSection === "voucher" ? 'text-danger fw-bold' : ''}`} onClick={() => setActiveSection("voucher")}>
                    <FaTags color="#ffc107" className="me-3" />
                    Kho Voucher
                  </ListGroup.Item>
                </ListGroup>
              </Nav>
                </div>
          </Col>
          <Col md={9} style={{ height: '100%' }}>
            <div className="bg-light p-3">
              {activeSection === "noti" && (
  <Container className="my-5">
    {/* Header với nút đánh dấu tất cả đã đọc */}
    <div className="d-flex justify-content-end mb-4">
      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={handleMarkAllAsRead}
      >
        Đánh dấu đã đọc tất cả
      </button>
    </div>

    {/* Danh sách thông báo */}
    <div
      className="notification-list-container"
      style={{
        maxHeight: "600px",
        overflowY: "auto",
        paddingRight: "8px",
      }}
    >
      <AnimatePresence>
        {Array.isArray(notifications) && notifications.length > 0 ? (
          notifications.map((notif) => (
            <motion.div
              key={notif.notification_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              className={`notification-item d-flex p-3 border rounded-3 mb-3 shadow-sm align-items-start ${
                notif.is_read === 0 ? "bg-primary-light" : "bg-white"
              }`}
              style={{
                cursor: "pointer",
                transition: "all 0.3s",
              }}
              whileHover={{ scale: 1.02, boxShadow: "0 8px 20px rgba(0,0,0,0.12)" }}
              onClick={() => markNotificationReadAndNavigate(notif)}
            >
              <Row className="w-100 g-3 align-items-center">
                {/* Ảnh sản phẩm đầu tiên */}
                <Col xs={3} sm={2}>
                  <img
                    src={`${URL}/uploads/${notif.products?.[0]?.product_image}`}
                    alt={notif.products?.[0]?.product_name || "Sản phẩm"}
                    className="rounded-2 border"
                    style={{ width: "70px", height: "70px", objectFit: "cover" }}
                  />
                </Col>

                {/* Nội dung thông báo */}
                <Col xs={6} sm={7}>
                  <h6 className="mb-1 fw-semibold">{notif.title}</h6>
                  <p className="mb-1 text-muted small">{notif.message}</p>
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted small">
                      {notif.products?.length} sản phẩm • Tổng:{" "}
                      {Number(notif.total).toLocaleString("vi-VN")}₫
                    </span>
                    <span className={`badge ${notif.is_read === 0 ? "bg-primary" : "bg-secondary"}`}>
                      {notif.order_status}
                    </span>
                  </div>
                  <p className="text-secondary small mb-0">
                    {new Date(notif.created_at).toLocaleString("vi-VN")}
                  </p>
                </Col>

                {/* Nút hành động */}
                <Col xs={3} sm={3} className="d-flex justify-content-end">
                  <button
                    className="btn btn-sm btn-outline-primary fw-semibold rounded-pill"
                    style={{ width: "140px" }}
                  >
                    Xem chi tiết
                  </button>
                </Col>
              </Row>
            </motion.div>
          ))
        ) : (
          <p className="text-center text-muted mt-5">Chưa có thông tin mới</p>
        )}
      </AnimatePresence>
    </div>
  </Container>
                  )}


            {activeSection === "orders" && ( 
                <div>
                  {/* Tab Header giống giao diện */}
                      <AnimatePresence mode="wait">
                      <motion.div
                        key={activeTab} // mỗi lần đổi tab sẽ re-render motion
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                      >
                  <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    variant="unstyled"
                    className="d-flex justify-content-between border-bottom-0 pb-0"
                  >
                
                    {statusTabs.map(tab => (
                      <Tab
                        eventKey={tab.key}
                        title={
                          <span
                            style={{
                              color: activeTab === tab.key ? '#FFC107' : '#6c757d',
                              borderBottom: activeTab === tab.key ? '2px solid #FFC107' : 'none',
                              paddingBottom: '10px',
                              fontWeight: 'bold',
                            }}
                          >
                            {tab.label}
                          </span>
                        }
                        key={tab.key}
                        className="flex-fill text-center"
                      >
                      </Tab>
                    ))}
                    
                  </Tabs>
                      </motion.div>
                    </AnimatePresence>
                  {/* Nội dung đơn hàng với scroll */}
                  <div className="mt-3" style={{ maxHeight: "767px", overflowY: "auto" }}>
                    <AnimatePresence>
                    {filterOrders(activeTab).length === 0 ? (
                      <motion.p
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="text-muted text-center mt-5"
                      >Không có đơn hàng nào trong mục này!  </motion.p>
                    ) : (
                          <div>
                            <motion.div
                              key="orders"
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.4 }}
                            >
                        {filterOrders(activeTab).map(order => (
                          <Card className="mb-3" key={order.id}>
                            <Card.Body>
                              {/* Nội dung đơn hàng */}
                              <Row className="mb-3 align-items-center">
                                <Col>
                                  <div className="d-flex align-items-center">
                                    <FaStore className="me-2 text-secondary" />
                                    <Button onClick={handleReBuy} variant="outline-secondary" size="sm">Mua Lại</Button>
                                    
                                  </div>
                                </Col>
                                <Col xs="auto" className="text-success fw-bold">
                                  <p className={`${getStatusColor(order.status)} text-uppercase fw-bold`} style={{fontSize:'11px'}}>
                                    {order.status}
                                  </p>
                                </Col>
                              </Row>

                            {mergeItems(order.items).map((item, i) => (
                                <Row key={i} className="align-items-center border-top pt-3 border-bottom p-3">
                                  <Col xs="auto">
                                    <img src={`${URL}/uploads/${item.image}`} alt={item.name} style={{ width: '80px' }} />
                                  </Col>
                                  <Col>
                                    <p 
                                      className="mb-0" 
                                      style={{ cursor: 'pointer' }}  
                                    >
                                      {item.name}
                                    </p>
                                    <p className="mb-0 text-muted small">Phân loại hàng: {item.size}</p>
                                    <p className="mb-0 text-muted small">x{item.quantity}</p>
                                  </Col>
                                  <Col xs="auto" className="text-end">
                                    {item.originalPrice && (
                                      <span className="text-muted text-decoration-line-through small me-2">
                                        ₫{Number(item.originalPrice).toLocaleString("vi-VN")}
                                      </span>
                                    )}
                                    <span className="text-danger">
                                      ₫{Number(item.price).toLocaleString("vi-VN")}
                                    </span>
                                  </Col>
                                </Row>
                              ))}



                              <Row className="mt-3 align-items-center">
                                <Col className="text-end">
                                  <p className="mb-0">
                                    Thành tiền: <span className="text-danger fw-bold fs-5">₫{Number(order.final_total).toLocaleString("vi-VN")}</span>
                                  </p>
                                </Col>
                              </Row>

                              <Row className="mt-3">
                                <Col className="text-end">
                                    <Button  onClick={() => navigate(`/order-tracking/${order.id}`, { state: { order } })} variant="danger" className="me-2">Xem Chi tiết</Button>
                                  
                                </Col>
                              </Row>
                            </Card.Body>
                          </Card>
                        ))}
                              </motion.div>
                      </div>
                      )}
                      </AnimatePresence>
                  </div>
                </div>
              )}

            {activeSection === "profile" && (
              <Container className="my-5">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <h4 className="fw-bold mb-1">Hồ Sơ Của Tôi</h4>
                  <p className="text-muted small border-bottom pb-3 mb-4">
                    Quản lý thông tin hồ sơ để bảo mật tài khoản
                  </p>

                  <Row>
                    {/* Cột trái: Form thông tin */}
                    <Col md={8}>
                      <motion.form
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ staggerChildren: 0.2 }}
                      >
                        {[
                          { label: "Tên đăng nhập", value: user.full_name, readOnly: true, type: "text", note: "Tên Đăng nhập chỉ có thể thay đổi một lần." },
                          { label: "Email", value: user.email },
                          { label: "Số điện thoại", value: user.phone },
                          { label: "Địa chỉ", value: user.address },
                          { label: "Ngày sinh", value: "**/**/2000", isDob: true }
                        ].map((field, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-3"
                          >
                            <Form.Group as={Row} className="align-items-center">
                              <Form.Label column sm="3" className="text-end text-muted">{field.label}</Form.Label>
                              <Col sm="9">
                                {field.readOnly ? (
                                  <Form.Control type={field.type} value={field.value} readOnly plaintext className="fw-bold" />
                                ) : field.isDob ? (
                                  <div className="d-flex align-items-center">
                                    <span>{field.value}</span>
                                    <a href="#change-dob" className="ms-3 text-decoration-none">Thay Đổi</a>
                                  </div>
                                ) : (
                                  <span className="me-2">{field.value}</span>
                                )}
                                {field.note && <Form.Text className="text-muted">{field.note}</Form.Text>}
                              </Col>
                            </Form.Group>
                          </motion.div>
                        ))}

                        {/* Nút hành động */}
                        <Form.Group as={Row} className="mt-4">
                          <Col sm={{ span: 9, offset: 3 }}>
                            <motion.div
                              className="d-flex flex-wrap gap-2 mt-3"
                              initial="hidden"
                              animate="visible"
                              variants={{
                                hidden: {},
                                visible: { transition: { staggerChildren: 0.1 } }
                              }}
                            >
                              {[
                                { label: "Cập nhật thông tin", variant: "outline-info", onClick: () => setShowUpdateModal(true) },
                                { label: "Đổi mật khẩu", variant: "outline-warning", onClick: () => setShowPasswordModal(true) },
                                { label: "Đăng xuất", variant: "outline-danger", onClick: logout }
                              ].map((btn, idx) => (
                                <motion.div key={idx} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                  <Button variant={btn.variant} onClick={btn.onClick}>
                                    {btn.label}
                                  </Button>
                                </motion.div>
                              ))}
                            </motion.div>
                          </Col>
                        </Form.Group>
                      </motion.form>
                    </Col>

                    {/* Cột phải: Avatar */}
                    <Col md={4} className="d-flex flex-column align-items-center justify-content-center border-start py-5">
                      <motion.div
                        className="text-center"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 200 }}
                      >
                        <div className="bg-light rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                          style={{ width: '100px', height: '100px' }}>
                          <FaUser size={60} color="#bbb" />
                        </div>
                        <Button variant="outline-secondary" className="mb-2" onClick={handleUpdateImg}>
                          Chọn Ảnh
                        </Button>
                        <div className="text-muted small">
                          <p className="mb-0">Dung lượng file tối đa 1 MB</p>
                          <p className="mb-0">Định dạng: .JPEG, .PNG</p>
                        </div>
                      </motion.div>
                    </Col>
                  </Row>
                </motion.div>
              </Container>
            )}

            {activeSection === "voucher" && (
                <Container className="fluid py-3">
                  {/* Header */}
                  <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap">
                    <h4 className="fw-bold m-0">Kho Voucher</h4>
                    <div className="header-links mt-2 mt-md-0">
                      <a href="#" onClick={handleReBuy} className="me-3">Tìm thêm voucher</a>
                      <a href="#" onClick={handleReBuy} className="me-3">Xem lịch sử voucher</a>
                      <a href="#" onClick={handleReBuy}>Tìm hiểu</a>
                    </div>
                  </div>

                  {/* Search input */}
                  <div className="voucher-input-group"> <label>Mã Voucher</label> <input type="text" placeholder="Nhập mã voucher tại đây" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /> <button onClick={() => setSearchTerm("")}>Xóa</button> </div>

                  {/* Tabs */}
                  <ul className="nav nav-tabs mb-4">
                    <li className="nav-item">
                      <a className="nav-link active" href="#">Tất cả ({filteredCoupons.length})</a>
                    </li>
                  </ul>

                  {/* Voucher list */}
                <div className="row g-4">
                  {filteredCoupons.map((v) => (
                    Number(v.description) === 0 && (
                      <motion.div
                        key={v.id}
                        className="col-12 col-md-6"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.4 }}
                      >
                        <div
                          className="voucher-card d-flex p-3 position-relative border rounded shadow-sm"
                          style={{ background: "#fff", cursor: "pointer" }}
                        >
                          {/* Logo + code */}
                          <div className="d-flex flex-column justify-content-center align-items-center me-3">
                            <RiCoupon2Line size={36} style={{color:'#ff9900'}} />
                            <span className="fw-bold mt-1">{v.code}</span>
                          </div>

                          {/* Thông tin voucher */}
                          <div className="flex-grow-1 d-flex flex-column justify-content-between">
                            <div>
                              <h5 className="mb-1">
                                Giảm {v.discount_type === 'percent' 
                                  ? `${Number(v.discount_value)}%` 
                                  : `${Number(v.discount_value).toLocaleString("vi-VN")} VND`}
                              </h5>
                              <div className="d-flex justify-content-between text-muted small">
                                <span>Đơn Tối Thiểu: {Number(v.min_order_total).toLocaleString("vi-VN")} VND</span>
                                <span>HSD: {new Date(v.end_date).toLocaleDateString()}</span>
                              </div>
                              <span style={{background:'#ff9900'}} className="badge bg-primary text-white mt-1">Áp dụng cho hóa đơn</span>
                            </div>
                          </div>

                          {/* Nút dùng ngay */}
                          <div className="d-flex flex-column justify-content-center ms-3 voucher-actions">
                            <button onClick={handleReBuy} className="btn-use">Dùng Ngay</button>
                          </div>

                          {/* Tag Mới */}
                          <span className="position-absolute top-0 end-0 badge bg-danger">Mới!</span>
                        </div>
                      </motion.div>
                    )
                  ))}
                </div>





                  {filteredCoupons.length === 0 && (
                    <p className="text-center text-muted mt-5">Không có voucher phù hợp</p>
                  )}
                </Container>
              )}

          </div>
          </Col>
        </Row>
          <AnimatePresence>
                    <motion.div
                  key="update-modal"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                    >
                                  <Modal
                    show={showUpdateModal}
                    onHide={() => setShowUpdateModal(false)}
                    centered
                  >
                    <Modal.Header closeButton>
                      <Modal.Title>Cập nhật thông tin</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                      <Form>
                        <Form.Group className="mb-3">
                          <Form.Label>Họ tên</Form.Label>
                          <Form.Control
                            type="text"
                            value={updateForm.full_name}
                            onChange={(e) =>
                              setUpdateForm({ ...updateForm, full_name: e.target.value })
                            }
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Số điện thoại</Form.Label>
                          <Form.Control
                            type="text"
                            value={updateForm.phone}
                            onChange={(e) =>
                              setUpdateForm({ ...updateForm, phone: e.target.value })
                            }
                          />
                        </Form.Group>
                        <Form.Group className="mb-3">
                          <Form.Label>Địa chỉ</Form.Label>
                          <Form.Control
                            type="text"
                            value={updateForm.address}
                            onChange={(e) =>
                              setUpdateForm({ ...updateForm, address: e.target.value })
                            }
                          />
                        </Form.Group>
                      </Form>
                    </Modal.Body>
                    <Modal.Footer>
                      <Button variant="secondary" onClick={() => setShowUpdateModal(false)}>
                        Hủy
                      </Button>
                      <Button variant="primary" onClick={handleUpdateProfile}>
                        Lưu thay đổi
                      </Button>
                    </Modal.Footer>
                  </Modal>
                </motion.div>
            </AnimatePresence>
        <AnimatePresence>
            <motion.div
        key="update-modal"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.3 }}
          >
            <Modal
          show={showPasswordModal}
          onHide={() => setShowPasswordModal(false)}
          centered
        >
          <Modal.Header closeButton>
            <Modal.Title>Đổi mật khẩu</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu hiện tại</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordForm.oldPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      oldPassword: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Nhập lại mật khẩu mới</Form.Label>
                <Form.Control
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      confirmPassword: e.target.value,
                    })
                  }
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="secondary"
              onClick={() => setShowPasswordModal(false)}
            >
              Hủy
            </Button>
            <Button variant="primary" onClick={handlePasswordChange}>
              Cập nhật
            </Button>
          </Modal.Footer>
        </Modal>
      </motion.div>
    </AnimatePresence>
        
      </Container>
    );
  };
  const getStatusColor = (status) => {
    switch(status) {
      case "Chờ xử lý":
        return "text-warning"; // màu vàng
      case "Đang giao":
        return "text-primary"; // màu xanh dương
      case "Đã giao":
        return "text-success"; // màu xanh lá
      case "Đã hủy":
        return "text-danger"; // màu đỏ
      default:
        return "text-secondary"; // màu xám
    }
  };
  export default ProfileOrders;
