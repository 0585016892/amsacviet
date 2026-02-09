import React, { useEffect, useState } from "react";
import { 
  Row, Col, Button, Tag, 
  Empty, Pagination, Spin, 
  Typography, ConfigProvider, Select 
} from "antd";
import { 
  ShoppingCartOutlined, 
  FilterOutlined, 
  ArrowRightOutlined 
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import productApi from "../api/productApi";

const { Title, Text } = Typography;
const WEB_URL = process.env.REACT_APP_WEB_URL;

const HomeHero = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await productApi.getProducts();
        setProducts(data);
      } catch (err) {
        console.error("Failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter Logic
  const filteredProducts = products.filter((p) => {
    const sizes = p.size ? p.size.split(",").map((s) => s.trim()) : [];
    const matchSize = selectedSize ? sizes.includes(selectedSize) : true;
    const matchColor = selectedColor ? p.color?.includes(selectedColor) : true;
    return matchSize && matchColor;
  });

  const currentProducts = filteredProducts.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#ff4d6d", borderRadius: 16 } }}>
      <div style={{ padding: "80px 0", backgroundColor: "#fff" }}>
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          
          {/* Header & Filter Section */}
          <div style={{ textAlign: 'center', marginBottom: 50 }}>
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
              <Text strong style={{ color: '#ff4d6d', letterSpacing: 2, textTransform: 'uppercase' }}>
                Danh mục nổi bật
              </Text>
              <Title level={2} style={{ fontWeight: 800, fontSize: 42, marginTop: 10 }}>
                Sản Phẩm Tốt Nhất
              </Title>
            </motion.div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 15, marginTop: 30, flexWrap: 'wrap' }}>
              <Select 
                placeholder="Chọn Kích Thước"
                style={{ width: 180 }}
                allowClear
                onChange={(v) => { setSelectedSize(v); setCurrentPage(1); }}
                options={[{ value: 'D', label: 'Size D' }, { value: 'A khuyết', label: 'A khuyết' }]}
              />
              <Select 
                placeholder="Chọn Màu Sắc"
                style={{ width: 180 }}
                allowClear
                onChange={(v) => { setSelectedColor(v); setCurrentPage(1); }}
                options={['Trắng', 'Đen', 'Xanh', 'Đỏ'].map(c => ({ value: c, label: c }))}
              />
            </div>
          </div>

          {/* Product Grid */}
          <Row gutter={[32, 40]}>
            <AnimatePresence mode="popLayout">
              {currentProducts.length > 0 ? (
                currentProducts.map((product, index) => (
                  <Col xs={24} sm={12} md={6} key={product.id}>
                    <motion.div
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link to={`/product/${product.slug}`} style={{ textDecoration: 'none' }}>
                        <div className="product-card-premium">
                          {/* Image Wrapper */}
                          <div className="image-container">
                            <img
                              src={`${WEB_URL}/uploads/${product.image}`}
                              alt={product.name}
                            />
                            <div className="overlay-btn">
                              <Button type="primary" icon={<ShoppingCartOutlined />} shape="circle" size="large" />
                            </div>
                          </div>

                          {/* Info Wrapper */}
                          <div style={{ paddingTop: 20 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <Title level={5} style={{ margin: 0, fontSize: 16, flex: 1 }}>{product.name}</Title>
                              <Text strong style={{ color: '#ff4d6d', marginLeft: 10 }}>
                                {Number(product.price).toLocaleString("vi-VN")}đ
                              </Text>
                            </div>
                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 8 }}>
                              {product.description?.slice(0, 50)}...
                            </Text>
                            
                            <div style={{ marginTop: 12 }}>
                               {product.size && product.size.split(',').map(s => (
                                 <Tag key={s} style={{ borderRadius: 4, fontSize: 10 }}>{s}</Tag>
                               ))}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </Col>
                ))
              ) : (
                <Col span={24}><Empty description="Không tìm thấy sản phẩm" /></Col>
              )}
            </AnimatePresence>
          </Row>

          {/* Pagination */}
          {filteredProducts.length > productsPerPage && (
            <div style={{ marginTop: 60, textAlign: 'center' }}>
              <Pagination
                current={currentPage}
                total={filteredProducts.length}
                pageSize={productsPerPage}
                onChange={(p) => setCurrentPage(p)}
                showSizeChanger={false}
              />
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .product-card-premium {
          position: relative;
          transition: all 0.3s ease;
        }
        .image-container {
          position: relative;
          width: 100%;
          padding-top: 125%; /* Tỷ lệ 4:5 chuyên nghiệp */
          overflow: hidden;
          border-radius: 20px;
          background: #f9f9f9;
        }
        .image-container img {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.165, 0.84, 0.44, 1);
        }
        .overlay-btn {
          position: absolute;
          bottom: 20px;
          right: 20px;
          opacity: 0;
          transform: translateY(10px);
          transition: all 0.3s ease;
        }
        .product-card-premium:hover .image-container img {
          transform: scale(1.1);
        }
        .product-card-premium:hover .overlay-btn {
          opacity: 1;
          transform: translateY(0);
        }
        .ant-pagination-item-active {
          border-color: #ff4d6d !important;
        }
        .ant-pagination-item-active a {
          color: #ff4d6d !important;
        }
      `}} />
    </ConfigProvider>
  );
};

export default HomeHero;