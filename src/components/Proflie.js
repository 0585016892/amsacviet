import React, { useState, useEffect } from "react";
import {
  Container,
  Tab,
  Tabs,
  Card,
  Table,
  Spinner,
  Accordion,
  Badge,
  Row,
  Col,
  Modal,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import userApi from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { Loading } from "../components";
import { motion, AnimatePresence } from "framer-motion";
const Profile = () => {
  const { logout } = useAuth();

  const [user, setUser] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({
    full_name: "",
    phone: "",
    address: "",
  });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passMsg, setPassMsg] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userData = await userApi.getProfile();
        setUser(userData);
        setUpdateForm({
          full_name: userData.full_name,
          phone: userData.phone,
          address: userData.address,
        });
        const history = await userApi.getOrderHistory();
        setOrderHistory(history);
        const pending = await userApi.getPendingOrders();
        setPendingOrders(pending);
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      return setPassMsg("Mật khẩu mới không khớp");
    }
    try {
      const res = await userApi.changePassword(passwordForm);
      setPassMsg(res.message);
      setShowPasswordModal(false);
    } catch (err) {
      setPassMsg(err.response?.data?.message || "Đổi mật khẩu thất bại");
    }
  };

  const handleUpdateProfile = async () => {
    try {
      const res = await userApi.updateProfile(updateForm);
      setPassMsg(res.message || "Cập nhật thành công");
      // Gọi lại API để lấy thông tin mới nhất
      const updatedUser = await userApi.getProfile();
      setUser(updatedUser);

      setShowUpdateModal(false);
    } catch (err) {
      setPassMsg(err.response?.data?.message || "Cập nhật thất bại");
    }
  };
  useEffect(() => {
    if (passMsg) {
      const timer = setTimeout(() => {
        setPassMsg("");
      }, 2000); // 2 giây

      return () => clearTimeout(timer);
    }
  }, [passMsg]);
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
      <motion.h3
        className="mb-4 text-primary fw-bold"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Thông tin cá nhân
      </motion.h3>
      <AnimatePresence>
        {passMsg && (
           <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
            <Alert
                  variant={
                    passMsg.toLowerCase().includes("không") ? "danger" : "success"
                  }
                  className="py-2 px-3"
                >
                  {passMsg}
                </Alert>
    </motion.div>
                
              )}
      </AnimatePresence>
      
      <Tabs defaultActiveKey="info" id="profile-tabs" className="mb-4">
        <Tab eventKey="info" title="Thông tin chi tiết">
          <motion.div
              key="info-tab"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.4 }}
                    >
                      <Card className="shadow-sm p-3 border-primary">
                      <Card.Body>
                        <Row className="mb-3">
                          <Col md={6} className="m-2 m-md-0">
                            <strong>Họ tên:</strong> {user?.full_name}
                          </Col>
                          <Col md={6} className="m-2 m-md-0">
                            <strong>Email:</strong> {user?.email}
                          </Col>
                        </Row>
                        <Row className="mb-3">
                          <Col md={6} className="m-2 m-md-0">
                            <strong>Số điện thoại:</strong> {user?.phone}
                          </Col>
                          <Col md={6} className="m-2 m-md-0">
                            <strong>Địa chỉ:</strong> {user?.address}
                          </Col>
                        </Row>
                        <hr />
                       <motion.div
                          className="d-flex flex-wrap gap-2 mt-3"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ staggerChildren: 0.2 }}
                        >
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline-info" onClick={() => setShowUpdateModal(true)}>
                              Cập nhật thông tin
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline-warning" onClick={() => setShowPasswordModal(true)}>
                              Đổi mật khẩu
                            </Button>
                          </motion.div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button variant="outline-danger" className="ms-md-auto" onClick={logout}>
                              Đăng xuất
                            </Button>
                          </motion.div>
                        </motion.div>
                      </Card.Body>
                    </Card>
                    </motion.div>
                  </Tab>
                  <Tab eventKey="history" title="Lịch sử mua hàng">
                    <OrderList orders={orderHistory} />
                  </Tab>
                  <Tab eventKey="pending" title="Đơn hàng đang đặt">
                    <OrderList
                      orders={pendingOrders.filter((o) =>
                        ["Đang giao", "Chờ xử lý"].includes(o.status)
                      )}
                    />
                  </Tab>
                </Tabs>
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

const OrderList = ({ orders }) => {
  if (!orders || orders.length === 0) {
    return <p className="text-muted">Không có đơn hàng nào.</p>;
  }
  return (
    <Accordion alwaysOpen>
      {orders?.map((order, index) => (
         <motion.div
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
                >
              <Accordion.Item eventKey={index.toString()}>
          <Accordion.Header>
            <div className="w-100 d-flex justify-content-between flex-wrap align-items-center gap-2">
              <span className="fw-bold text-dark">Mã đơn: #{order.id}</span>
              <span className="text-muted">
                Ngày: {new Date(order.created_at).toLocaleDateString("vi-VN")}
              </span>
              <span>
                Ship:{" "}
                <span className="text-primary">
                  {Number(order.shipping || 0).toLocaleString("vi-VN")}₫
                </span>
              </span>
              <span>
                Tổng:{" "}
                <span className="text-success fw-bold">
                  {Number(order.final_total || 0).toLocaleString("vi-VN")}₫
                </span>
              </span>
              <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Badge bg={getStatusColor(order.status)} className="text-uppercase">
                    {order.status}
                  </Badge>
                </motion.span>
            </div>
          </Accordion.Header>
          <Accordion.Body>
            <Table bordered hover responsive size="sm" className="text-center">
              <thead className="table-primary">
                <tr>
                  <th>Tên sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Size</th>
                  <th>Màu</th>
                </tr>
              </thead>
             <tbody>
                    {order.items?.map((item, i) => (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <td>{item.name}</td>
                        <td>{item.quantity}</td>
                        <td>{Number(item.price).toLocaleString("vi-VN")}₫</td>
                        <td>{item.size || "-"}</td>
                        <td>{item.color || "-"}</td>
                      </motion.tr>
                    ))}
                  </tbody>
            </Table>
          </Accordion.Body>
        </Accordion.Item>
    </motion.div>
   
      ))}
    </Accordion>
  );
};

const getStatusColor = (status) => {
  switch (status.toLowerCase()) {
    case "pending":
      return "secondary";
    case "processing":
      return "info";
    case "shipping":
    case "đang giao":
      return "warning";
    case "delivered":
    case "đã giao":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "dark";
  }
};

export default Profile;
