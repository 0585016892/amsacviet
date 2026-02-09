import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { 
  Row, Col, Button, Tag, Space, 
  Typography, InputNumber, Tabs, 
  Breadcrumb, Image as AntImage, 
  ConfigProvider, Card, Badge, Alert,Divider
} from "antd";
import { 
  ShoppingCartOutlined, 
  SafetyCertificateOutlined, 
  ReloadOutlined, 
  TruckOutlined,
  CheckCircleFilled,
  HeartOutlined
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../context/CartContext";
import { getProductBySlug } from "../api/sanphamWebApi";
import { getAllColors } from "../api/colorApi";
import { Loading } from "../components";
import ProductReviews from "./ProductReviews";
import RelatedProducts from './RelatedProducts';

const { Title, Text, Paragraph } = Typography;

const Product = () => {
  const URL = process.env.REACT_APP_WEB_URL;
  const navigate = useNavigate();
  const { slug } = useParams();
  const { addToCart } = useCart();
  const user = JSON.parse(localStorage.getItem("user"));

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const [productData, colorData] = await Promise.all([
          getProductBySlug(slug),
          getAllColors()
        ]);
        setProduct(productData);
        setColors(colorData);
        setSelectedImage(productData.image);
        // Tự động chọn màu/size đầu tiên nếu có
        if (productData.color) setSelectedColor(productData.color.split(",")[0].trim());
        if (productData.size) setSelectedSize(productData.size.split(",")[0].trim());
      } catch (error) {
        console.error("Lỗi tải dữ liệu", error);
      } finally {
        setLoading(false);
      }
    };
    init();
    window.scrollTo(0, 0);
  }, [slug]);

  const finalPrice = product ? (() => {
    const price = Number(product.price);
    if (product.discount_type === "percent") return price * (1 - Number(product.discount_value) / 100);
    if (product.discount_type === "fixed") return price - Number(product.discount_value);
    return price;
  })() : 0;

  const handleAddToCart = () => {
    if (quantity > product.quantity) return;
    
    const cartItem = {
      ...product,
      color: selectedColor,
      size: selectedSize,
      quantity,
    };

    addToCart(cartItem);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 4000);
  };

  if (loading) return <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loading /></div>;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#ff4d6d", borderRadius: 12 } }}>
      <div style={{ background: "#fdfcfc", padding: "120px 0 60px" }}>
        <div className="container" style={{ maxWidth: 1240, margin: "0 auto", padding: "0 20px" }}>
          
          {/* Breadcrumb */}
          <Breadcrumb style={{ marginBottom: 30 }}>
            <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/category">Sản phẩm</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{product.name}</Breadcrumb.Item>
          </Breadcrumb>

          <Row gutter={[40, 40]}>
            {/* Cột trái: Hình ảnh */}
            <Col xs={24} md={12}>
              <div style={{ position: "sticky", top: 120 }}>
                <div style={{ borderRadius: 24, overflow: "hidden", background: "#fff", boxShadow: "0 10px 30px rgba(0,0,0,0.05)" }}>
                  <AntImage
                    src={`${URL}/uploads/${selectedImage}`}
                    alt={product.name}
                    width="100%"
                    preview={false}
                  />
                </div>
                
                <div style={{ display: "flex", gap: 12, marginTop: 20, overflowX: "auto", paddingBottom: 10 }}>
                  {[product.image, ...(product.subImages || [])].map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      style={{
                        width: 80, height: 80, borderRadius: 12, overflow: "hidden", cursor: "pointer",
                        border: selectedImage === img ? "2px solid #ff4d6d" : "2px solid transparent",
                        transition: "0.3s"
                      }}
                    >
                      <img src={`${URL}/uploads/${img}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ))}
                </div>
              </div>
            </Col>

            {/* Cột phải: Thông tin */}
            <Col xs={24} md={12}>
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <Space direction="vertical" size="small">
                  <Tag color="volcano" style={{ borderRadius: 6 }}>ÂM SẮC VIỆT EXCLUSIVE</Tag>
                  <Title level={1} style={{ margin: "8px 0", fontSize: 32, fontWeight: 800 }}>{product.name}</Title>
                  <Space align="center" style={{ marginBottom: 15 }}>
                    <Badge status="success" text="Còn hàng" />
                    <Divider type="vertical" />
                    <Text type="secondary">Mã sản phẩm: ASV-{product.id}</Text>
                  </Space>
                </Space>

                <div style={{ background: "#fff5f6", padding: "20px", borderRadius: 20, marginBottom: 30 }}>
                  <Space align="baseline" size="large">
                    <Title level={2} style={{ color: "#ff4d6d", margin: 0, fontWeight: 800 }}>
                      {Math.round(finalPrice).toLocaleString()}đ
                    </Title>
                    {product.discount_value > 0 && (
                      <Text delete type="secondary" style={{ fontSize: 18 }}>
                        {Number(product.price).toLocaleString()}đ
                      </Text>
                    )}
                    {product.discount_value > 0 && (
                      <Tag color="#ff4d6d" style={{ border: "none", fontWeight: 700 }}>
                         TIẾT KIỆM {product.discount_type === 'percent' ? `${product.discount_value}%` : `${(product.discount_value/1000)}k`}
                      </Tag>
                    )}
                  </Space>
                </div>

                {/* Tùy chọn Màu sắc */}
                <div style={{ marginBottom: 25 }}>
                  <Text strong>Màu sắc: </Text> <Text type="secondary">{selectedColor}</Text>
                  <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                    {product.color?.split(",").map((c) => {
                      const colorObj = colors.find(item => item.name.trim().toLowerCase() === c.trim().toLowerCase());
                      return (
                        <div 
                          key={c}
                          className={`color-swatch ${selectedColor === c.trim() ? 'active' : ''}`}
                          onClick={() => setSelectedColor(c.trim())}
                          style={{ backgroundColor: colorObj?.code || '#ccc' }}
                          title={c}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Tùy chọn Size */}
                <div style={{ marginBottom: 30 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <Text strong>Hình dáng / Kích cỡ:</Text>
                    <Text type="primary" style={{ cursor: "pointer", fontSize: 12 }}>Bảng quy đổi kích cỡ</Text>
                  </div>
                  <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                    {product.size?.split(",").map((s) => (
                      <Button 
                        key={s}
                        type={selectedSize === s.trim() ? "primary" : "default"}
                        onClick={() => setSelectedSize(s.trim())}
                        style={{ minWidth: 60, height: 45, borderRadius: 10 }}
                      >
                        {s}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Số lượng & Mua hàng */}
                <div style={{ display: "flex", gap: 15, marginBottom: 40 }}>
                  <InputNumber 
                    min={1} 
                    max={product.quantity} 
                    value={quantity} 
                    onChange={setQuantity}
                    style={{ height: 50, width: 100, display: "flex", alignItems: "center", borderRadius: 12 }}
                  />
                  <Button 
                    type="primary" 
                    icon={<ShoppingCartOutlined />} 
                    onClick={handleAddToCart}
                    style={{ flex: 1, height: 50, fontWeight: 700, fontSize: 16 }}
                  >
                    THÊM VÀO GIỎ HÀNG
                  </Button>
                  <Button icon={<HeartOutlined />} style={{ height: 50, width: 50, borderRadius: 12 }} />
                </div>

                {/* Cam kết thương hiệu */}
                <Row gutter={[15, 15]}>
                  {[
                    { icon: <TruckOutlined />, title: "Giao hàng nhanh", desc: "Từ 2-4 ngày toàn quốc" },
                    { icon: <ReloadOutlined />, title: "60 ngày đổi trả", desc: "Miễn phí tận nơi" },
                    { icon: <SafetyCertificateOutlined />, title: "Bảo hành 12 tháng", desc: "Chính hãng Âm Sắc Việt" },
                  ].map((item, i) => (
                    <Col span={8} key={i}>
                      <Card bodyStyle={{ padding: "12px", textAlign: "center" }} bordered={false} style={{ background: "#f8f9fa", borderRadius: 16 }}>
                        <div style={{ color: "#ff4d6d", fontSize: 20, marginBottom: 5 }}>{item.icon}</div>
                        <div style={{ fontSize: 11, fontWeight: 700 }}>{item.title}</div>
                        <div style={{ fontSize: 10, color: "#888" }}>{item.desc}</div>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </motion.div>
            </Col>
          </Row>

          {/* Chi tiết & Đánh giá */}
          <div style={{ marginTop: 80, background: "#fff", padding: "40px", borderRadius: 30, boxShadow: "0 10px 40px rgba(0,0,0,0.02)" }}>
            <Tabs defaultActiveKey="1" centered size="large">
              <Tabs.TabPane tab="Mô tả chi tiết" key="1">
                <div style={{ maxWidth: 800, margin: "0 auto", padding: "20px 0" }}>
                  <Paragraph style={{ fontSize: 16, lineHeight: "1.8", color: "#444", whiteSpace: "pre-line" }}>
                    {product.description}
                  </Paragraph>
                  <img src={`${URL}/uploads/${product.image}`} style={{ width: "100%", borderRadius: 20, marginTop: 30 }} />
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab={`Đánh giá khách hàng`} key="2">
                <ProductReviews productId={product.id} user={user} />
              </Tabs.TabPane>
            </Tabs>
          </div>

          <RelatedProducts categoryId={product.categoryId} productId={product.id} />
        </div>

        {/* Thông báo thêm vào giỏ hàng (Pop-up) */}
        <AnimatePresence>
          {showNotification && (
            <motion.div 
              initial={{ opacity: 0, y: 50 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: 50 }}
              style={{ position: "fixed", bottom: 40, right: 40, zIndex: 1000, width: 350 }}
            >
              <Card className="notification-card">
                <Space align="start">
                  <CheckCircleFilled style={{ color: "#52c41a", fontSize: 24, marginTop: 4 }} />
                  <div>
                    <Text strong>Thêm thành công!</Text>
                    <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                      <img src={`${URL}/uploads/${product.image}`} style={{ width: 50, borderRadius: 8 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600 }}>{product.name}</div>
                        <div style={{ fontSize: 11, color: "#888" }}>SL: {quantity} | {selectedColor}</div>
                      </div>
                    </div>
                    <Button type="primary" block size="small" style={{ marginTop: 15 }} onClick={() => navigate("/cart")}>
                      XEM GIỎ HÀNG
                    </Button>
                  </div>
                </Space>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .color-swatch {
          width: 32px; height: 32px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
          box-shadow: inset 0 0 0 2px #fff;
          transition: 0.3s;
        }
        .color-swatch.active {
          border-color: #ff4d6d;
          transform: scale(1.1);
        }
        .notification-card {
          border-radius: 20px;
          box-shadow: 0 15px 50px rgba(0,0,0,0.15);
          border: none;
        }
        .ant-tabs-ink-bar { background: #ff4d6d !important; }
        .ant-tabs-tab.ant-tabs-tab-active .ant-tabs-tab-btn { color: #ff4d6d !important; }
      `}} />
    </ConfigProvider>
  );
};

export default Product;