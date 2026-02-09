import React, { useState, useEffect } from "react";
import { 
  Row, Col, Button, Checkbox, 
  InputNumber, Typography, Empty, 
  Modal, Space, Divider, Tag, ConfigProvider 
} from "antd";
import { 
  DeleteOutlined, 
  ShoppingCartOutlined, 
  ArrowRightOutlined, 
  InfoCircleOutlined,
  TruckOutlined
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { getSettingsAPI } from "../api/settingsApi";

const { Title, Text } = Typography;

const Cart = () => {
  const URL = process.env.REACT_APP_WEB_URL;
  const [cartItems, setCartItems] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFreeShip, setshowFreeShip] = useState(false);
  const [shippingFee, setShippingFee] = useState(0);
  const { removeItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem("cart");
    let storedCart = JSON.parse(stored) || [];
    const totalQuantity = storedCart.reduce((sum, item) => sum + item.quantity, 0);
    setshowFreeShip(totalQuantity >= 2);
    setCartItems(storedCart);

    // Fetch Shipping Fee
    getSettingsAPI().then(data => setShippingFee(Number(data.shipping_fee)));
  }, []);

  const calculateFinalPrice = (item) => {
    const price = Number(item.price);
    if (item.discount_type === "percent") return price * (1 - Number(item.discount_value) / 100);
    if (item.discount_type === "fixed") return price - Number(item.discount_value);
    return price;
  };

  const totalPrice = cartItems
    .filter((item) => selectedItems.includes(item.slug))
    .reduce((total, item) => total + calculateFinalPrice(item) * item.quantity, 0);

  const handleRemoveItem = () => {
    const updatedCart = cartItems.filter(item => item.slug !== selectedSlug);
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
    removeItem(selectedSlug);
    setShowConfirm(false);
  };

  const updateQuantity = (slug, val) => {
    const updated = cartItems.map(item => item.slug === slug ? { ...item, quantity: val } : item);
    setCartItems(updated);
    localStorage.setItem("cart", JSON.stringify(updated));
    setshowFreeShip(updated.reduce((sum, i) => sum + i.quantity, 0) >= 2);
  };

  const handleOrder = () => {
    const selected = cartItems.filter(i => selectedItems.includes(i.slug));
    const remaining = cartItems.filter(i => !selectedItems.includes(i.slug));
    localStorage.setItem("order", JSON.stringify(selected));
    localStorage.setItem("cart", JSON.stringify(remaining));
    navigate("/order");
  };

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#ff4d6d", borderRadius: 12 } }}>
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", padding: "120px 0 60px" }}>
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} style={{ marginBottom: 30 }}>
            <Title level={2} style={{ fontWeight: 800, margin: 0 }}>Giỏ hàng của bạn</Title>
            <Text type="secondary">Quản lý các sản phẩm bạn đã chọn trước khi thanh toán</Text>
          </motion.div>

          {cartItems.length > 0 ? (
            <Row gutter={[30, 30]}>
              {/* Cột trái: Danh sách sản phẩm */}
              <Col xs={24} lg={16}>
                <div style={{ backgroundColor: "#fff", borderRadius: 24, padding: "25px", boxShadow: "0 10px 30px rgba(0,0,0,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
                    <Checkbox 
                      onChange={(e) => setSelectedItems(e.target.checked ? cartItems.map(i => i.slug) : [])}
                      checked={selectedItems.length === cartItems.length}
                    >
                      Chọn tất cả ({cartItems.length})
                    </Checkbox>
                    <Button type="text" danger icon={<DeleteOutlined />} disabled={selectedItems.length === 0}>
                      Xóa mục đã chọn
                    </Button>
                  </div>

                  <Divider style={{ margin: "10px 0 25px" }} />

                  <AnimatePresence mode="popLayout">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.slug}
                        layout
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={{ marginBottom: 25 }}
                      >
                        <Row gutter={[20, 20]} align="middle">
                          <Col span={1}>
                            <Checkbox 
                              checked={selectedItems.includes(item.slug)} 
                              onChange={() => setSelectedItems(prev => prev.includes(item.slug) ? prev.filter(s => s !== item.slug) : [...prev, item.slug])}
                            />
                          </Col>
                          <Col xs={8} sm={5}>
                            <img 
                              src={`${URL}/uploads/${item.image}`} 
                              alt={item.name} 
                              style={{ width: "100%", borderRadius: 16, objectFit: "cover", aspectRatio: "1/1" }} 
                            />
                          </Col>
                          <Col xs={15} sm={18}>
                            <div style={{ display: "flex", justifyContent: "space-between" }}>
                              <div>
                                <Title level={5} style={{ margin: 0 }}>{item.name}</Title>
                                <Space style={{ marginTop: 4 }}>
                                  <Tag color="blue">{item.size}</Tag>
                                  <Tag color="magenta">{item.color}</Tag>
                                </Space>
                              </div>
                              <Button 
                                type="text" 
                                shape="circle" 
                                icon={<DeleteOutlined />} 
                                onClick={() => { setSelectedSlug(item.slug); setShowConfirm(true); }} 
                              />
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 20 }}>
                              <InputNumber 
                                min={1} 
                                value={item.quantity} 
                                onChange={(val) => updateQuantity(item.slug, val)} 
                                style={{ borderRadius: 8 }}
                              />
                              <div style={{ textAlign: "right" }}>
                                {item.discount_value > 0 && (
                                  <Text delete type="secondary" style={{ display: "block", fontSize: 13 }}>
                                    {Number(item.price).toLocaleString()}đ
                                  </Text>
                                )}
                                <Text strong style={{ fontSize: 18, color: "#ff4d6d" }}>
                                  {calculateFinalPrice(item).toLocaleString()}đ
                                </Text>
                              </div>
                            </div>
                          </Col>
                        </Row>
                        <Divider style={{ margin: "20px 0 0" }} />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </Col>

              {/* Cột phải: Thanh toán */}
              <Col xs={24} lg={8}>
                <div style={{ position: "sticky", top: 110 }}>
                  <div style={{ backgroundColor: "#fff", borderRadius: 24, padding: "30px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                    <Title level={4} style={{ marginBottom: 25 }}>Tóm tắt đơn hàng</Title>
                    
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                      <Text type="secondary">Tạm tính ({selectedItems.length} sản phẩm)</Text>
                      <Text strong>{totalPrice.toLocaleString()}đ</Text>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 15 }}>
                      <Text type="secondary">Phí vận chuyển</Text>
                      <Text strong>{showFreeShip ? <Tag color="green">Miễn phí</Tag> : `${shippingFee.toLocaleString()}đ`}</Text>
                    </div>

                    {showFreeShip && (
                      <div style={{ backgroundColor: "#f6ffed", padding: "12px", borderRadius: 12, border: "1px solid #b7eb8f", marginBottom: 20 }}>
                        <Space style={{ color: "#52c41a" }}>
                          <TruckOutlined />
                          <Text style={{ color: "#52c41a", fontSize: 13 }}>Đã đủ điều kiện miễn phí ship!</Text>
                        </Space>
                      </div>
                    )}

                    <Divider />

                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 30 }}>
                      <Title level={4} style={{ margin: 0 }}>Tổng cộng</Title>
                      <Title level={3} style={{ margin: 0, color: "#ff4d6d" }}>
                        {(totalPrice + (showFreeShip ? 0 : shippingFee)).toLocaleString()}đ
                      </Title>
                    </div>

                    <Button 
                      type="primary" 
                      size="large" 
                      block 
                      onClick={handleOrder}
                      disabled={selectedItems.length === 0}
                      style={{ height: 56, fontSize: 16, fontWeight: 700, borderRadius: 16 }}
                    >
                      TIẾP TỤC THANH TOÁN <ArrowRightOutlined />
                    </Button>

                    <div style={{ marginTop: 20, textAlign: "center" }}>
                      <Space type="secondary" style={{ fontSize: 12 }}>
                        <InfoCircleOutlined /> Bảo mật thanh toán 100%
                      </Space>
                    </div>
                  </div>
                </div>
              </Col>
            </Row>
          ) : (
            <div style={{ padding: "100px 0", textAlign: "center", backgroundColor: "#fff", borderRadius: 30 }}>
              <Empty 
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={<Title level={4} type="secondary">Giỏ hàng đang trống</Title>}
              >
                <Button type="primary" size="large" onClick={() => navigate("/")} shape="round">
                  Tiếp tục mua sắm
                </Button>
              </Empty>
            </div>
          )}
        </div>

        {/* Modal xác nhận xóa */}
        <Modal
          title="Xác nhận xóa"
          open={showConfirm}
          onOk={handleRemoveItem}
          onCancel={() => setShowConfirm(false)}
          okText="Xóa ngay"
          cancelText="Hủy"
          okButtonProps={{ danger: true, shape: "round" }}
          cancelButtonProps={{ shape: "round" }}
        >
          <Text>Bạn có chắc chắn muốn loại bỏ sản phẩm này khỏi giỏ hàng?</Text>
        </Modal>
      </div>
    </ConfigProvider>
  );
};

export default Cart;