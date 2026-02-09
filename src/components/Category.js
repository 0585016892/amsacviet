import React, { useState, useEffect } from "react";
import { 
  Row, Col, Typography, Select, 
  Button, Breadcrumb, Space, 
  ConfigProvider, Empty, Badge 
} from "antd";
import { 
  FireOutlined, 
  RocketOutlined, 
  SortAscendingOutlined, 
  PlusOutlined 
} from "@ant-design/icons";
import { useParams, Link } from "react-router-dom";
import { getCategoryData } from "../api/sanphamWebApi";
import { getAllColors } from "../api/colorApi";
import { Loading } from "../components";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

const { Title, Text } = Typography;
const { Option } = Select;

const Category = () => {
  const URL = process.env.REACT_APP_WEB_URL;
  const { slug } = useParams();
  const [categoryData, setCategoryData] = useState(null);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState("discount");
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
  const [visibleCount, setVisibleCount] = useState(8);

  // Fetch Colors
  useEffect(() => {
    getAllColors().then(setColors);
  }, []);

  // Fetch Category Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const data = await getCategoryData(slug);
        setCategoryData(data);
      } catch (err) {
        setError("Không thể tải dữ liệu danh mục.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [slug]);

  // Socket Realtime
  useEffect(() => {
    const socket = io(URL);
    socket.on("addProductTrue", (data) => {
      if (data.categoryId === categoryData?.id) {
        setCategoryData(prev => ({
          ...prev,
          products: [...prev.products, { ...data, created_at: new Date().toISOString() }]
        }));
      }
    });
    socket.on("deleteProductTrue", ({ productId }) => {
      setCategoryData(prev => ({
        ...prev,
        products: prev.products.filter(p => p.id !== Number(productId))
      }));
    });
    return () => socket.disconnect();
  }, [URL, categoryData?.id]);

  const getFinalPrice = (p) => {
    const price = Number(p.price);
    if (p.discount_type === "percent") return price * (1 - Number(p.discount_value) / 100);
    if (p.discount_type === "fixed") return price - Number(p.discount_value);
    return price;
  };

  const sortedProducts = categoryData?.products
    ?.filter(p => Number(p.quantity) > 0)
    ?.sort((a, b) => {
      if (sortType === "discount") return (b.discount_value || 0) - (a.discount_value || 0);
      if (sortType === "newest") return new Date(b.created_at) - new Date(a.created_at);
      if (sortType === "priceAsc") return getFinalPrice(a) - getFinalPrice(b);
      if (sortType === "priceDesc") return getFinalPrice(b) - getFinalPrice(a);
      return 0;
    });

  if (loading) return <div style={{ height: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loading /></div>;
  if (error) return <div style={{ textAlign: 'center', padding: '100px' }}><Text danger>{error}</Text></div>;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#ff4d6d", borderRadius: 12 } }}>
      <div style={{ background: "#fdfcfc", minHeight: "100vh", padding: "100px 0 60px" }}>
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          
          {/* Top Bar: Breadcrumb & Title */}
          <div style={{ marginBottom: 40 }}>
            <Breadcrumb style={{ marginBottom: 16 }}>
              <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
              <Breadcrumb.Item>{categoryData?.categoryTitle}</Breadcrumb.Item>
            </Breadcrumb>
            <Title level={1} style={{ fontWeight: 800, marginBottom: 8 }}>{categoryData?.categoryTitle}</Title>
            <Text type="secondary">Khám phá bộ sưu tập {categoryData?.categoryTitle} chất lượng cao tại Âm Sắc Việt</Text>
          </div>

          {/* Filter Bar */}
          <div style={{ 
            background: "#fff", 
            padding: "15px 25px", 
            borderRadius: "20px", 
            boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "15px",
            marginBottom: 30
          }}>
            <Space size="middle" wrap>
              <Button 
                type={sortType === "discount" ? "primary" : "text"} 
                icon={<FireOutlined />} 
                onClick={() => setSortType("discount")}
                shape="round"
              >
                Ưu đãi tốt nhất
              </Button>
              <Button 
                type={sortType === "newest" ? "primary" : "text"} 
                icon={<RocketOutlined />} 
                onClick={() => setSortType("newest")}
                shape="round"
              >
                Mới về
              </Button>
            </Space>

            <Select 
              defaultValue="discount" 
              style={{ width: 220 }} 
              onChange={setSortType}
              suffixIcon={<SortAscendingOutlined />}
              bordered={false}
              className="custom-select"
            >
              <Option value="priceAsc">Giá: Thấp đến Cao</Option>
              <Option value="priceDesc">Giá: Cao đến Thấp</Option>
            </Select>
          </div>

          {/* Product Grid */}
          <Row gutter={[24, 32]}>
            <AnimatePresence>
              {sortedProducts?.length > 0 ? (
                sortedProducts.slice(0, visibleCount).map((product, index) => (
                  <Col xs={12} sm={12} md={8} lg={6} key={product.id}>
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: (index % 4) * 0.1 }}
                    >
                      <div className="modern-card">
                        <Link to={`/product/${product.slug}`} className="card-image-wrapper">
                          <img src={`${URL}/uploads/${product.image}`} alt={product.name} />
                          {product.discount_value > 0 && (
                            <div className="discount-badge">
                              {product.discount_type === "percent" ? `-${Math.round(product.discount_value)}%` : `-${(product.discount_value/1000)}k`}
                            </div>
                          )}
                        </Link>
                        
                        <div className="card-info">
                          <Title level={5} ellipsis={{ rows: 1 }} style={{ marginBottom: 8, fontSize: 16 }}>
                            {product.name}
                          </Title>
                          
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 12 }}>
                            <Text className="current-price">
                              {Math.round(getFinalPrice(product)).toLocaleString()}đ
                            </Text>
                            {product.discount_value > 0 && (
                              <Text delete type="secondary" style={{ fontSize: 12 }}>
                                {Number(product.price).toLocaleString()}đ
                              </Text>
                            )}
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div style={{ display: "flex", gap: 5 }}>
                              {product.color?.split(",").slice(0, 3).map((c, i) => {
                                const found = colors.find(color => color.name.trim().toLowerCase() === c.trim().toLowerCase());
                                return (
                                  <div 
                                    key={i} 
                                    className="color-circle" 
                                    style={{ background: found?.code || "#ccc" }} 
                                    title={c}
                                  />
                                );
                              })}
                              {product.color?.split(",").length > 3 && <Text type="secondary" style={{ fontSize: 10 }}>+...</Text>}
                            </div>
                            <Button type="primary" size="small" shape="circle" icon={<PlusOutlined />} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </Col>
                ))
              ) : (
                <Col span={24}>
                  <Empty description="Không có sản phẩm nào trong danh mục này" />
                </Col>
              )}
            </AnimatePresence>
          </Row>

          {/* Load More */}
          {sortedProducts?.length > visibleCount && (
            <div style={{ textAlign: "center", marginTop: 60 }}>
              <Button 
                size="large" 
                shape="round" 
                onClick={() => setVisibleCount(prev => prev + 4)}
                style={{ padding: "0 40px", height: 50, fontWeight: 600 }}
              >
                XEM THÊM SẢN PHẨM
              </Button>
            </div>
          )}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .modern-card {
          background: #fff;
          border-radius: 24px;
          overflow: hidden;
          transition: all 0.3s ease;
          border: 1px solid #f0f0f0;
          height: 100%;
        }
        .modern-card:hover {
          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
          transform: translateY(-8px);
        }
        .card-image-wrapper {
          position: relative;
          display: block;
          padding-top: 110%;
          overflow: hidden;
        }
        .card-image-wrapper img {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          object-fit: cover;
          transition: 0.5s;
        }
        .modern-card:hover .card-image-wrapper img {
          transform: scale(1.1);
        }
        .discount-badge {
          position: absolute;
          top: 15px; left: 15px;
          background: #ff4d6d;
          color: #fff;
          padding: 4px 12px;
          border-radius: 10px;
          font-weight: 700;
          font-size: 12px;
          box-shadow: 0 4px 10px rgba(255,77,109,0.3);
        }
        .card-info { padding: 20px; }
        .current-price {
          color: #ff4d6d;
          font-size: 18px;
          font-weight: 800;
        }
        .color-circle {
          width: 14px; height: 14px;
          border-radius: 50%;
          border: 1px solid rgba(0,0,0,0.05);
        }
        .custom-select .ant-select-selector {
          font-weight: 600 !important;
          color: #555 !important;
        }
      `}} />
    </ConfigProvider>
  );
};

export default Category;