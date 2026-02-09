import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Typography, Button, Space, Skeleton, Tag, ConfigProvider } from "antd";
import { LeftOutlined, RightOutlined, ShoppingOutlined } from "@ant-design/icons";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const RelatedProducts = ({ categoryId, productId }) => {
  const URL = process.env.REACT_APP_WEB_URL;
  const URL_API = process.env.REACT_APP_API_URL;

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!categoryId || !productId) return;

    const fetchRelated = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${URL_API}/products/related/${categoryId}/${productId}`);
        setRelatedProducts(res.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm liên quan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [categoryId, productId, URL_API]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === "left" ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: "smooth" });
    }
  };

  const getFinalPrice = (product) => {
    const price = Number(product.price);
    if (product.discount_type === "percent") return price * (1 - Number(product.discount_value) / 100);
    if (product.discount_type === "fixed") return price - Number(product.discount_value);
    return price;
  };

  if (loading) return (
    <div style={{ padding: "40px 0" }}>
      <Skeleton active paragraph={{ rows: 4 }} />
    </div>
  );
  
  if (relatedProducts.length === 0) return null;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#ff4d6d" } }}>
      <div style={{ marginTop: "60px", marginBottom: "40px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "25px" }}>
          <div>
            <Title level={3} style={{ margin: 0, fontWeight: 800 }}>Sản phẩm tương tự</Title>
            <Text type="secondary">Có thể bạn cũng sẽ thích những món nhạc cụ này</Text>
          </div>
          <Space>
            <Button 
              shape="circle" 
              icon={<LeftOutlined />} 
              onClick={() => scroll("left")} 
              style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}
            />
            <Button 
              shape="circle" 
              icon={<RightOutlined />} 
              onClick={() => scroll("right")} 
              style={{ boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}
            />
          </Space>
        </div>

        <div
          ref={scrollRef}
          style={{
            display: "flex",
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            gap: "24px",
            padding: "10px 5px 30px",
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
          className="hide-scrollbar"
        >
          {relatedProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              style={{
                minWidth: "260px",
                maxWidth: "260px",
                scrollSnapAlign: "start",
                flexShrink: 0,
              }}
            >
              <div className="related-card">
                <Link to={`/product/${product.slug}`} style={{ display: "block", overflow: "hidden", borderRadius: "20px" }}>
                  <div className="image-container">
                    <img
                      src={`${URL}/uploads/${product.image}`}
                      alt={product.name}
                      className="product-img"
                    />
                    {product.discount_value > 0 && (
                      <Tag color="#ff4d6d" className="discount-tag">
                        -{product.discount_type === "percent" ? `${Math.round(product.discount_value)}%` : `${product.discount_value/1000}k`}
                      </Tag>
                    )}
                  </div>
                </Link>

                <div style={{ padding: "15px" }}>
                  <Link to={`/product/${product.slug}`}>
                    <Text strong ellipsis style={{ display: "block", fontSize: "15px", marginBottom: "8px", color: "#2d3436" }}>
                      {product.name}
                    </Text>
                  </Link>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Text style={{ color: "#ff4d6d", fontWeight: 800, fontSize: "17px" }}>
                        {Math.round(getFinalPrice(product)).toLocaleString()}đ
                      </Text>
                      {product.discount_value > 0 && (
                        <div style={{ height: "14px" }}>
                          <Text delete type="secondary" style={{ fontSize: "12px" }}>
                            {Number(product.price).toLocaleString()}đ
                          </Text>
                        </div>
                      )}
                    </div>
                    <Button 
                      type="primary" 
                      shape="circle" 
                      size="small" 
                      icon={<ShoppingOutlined />} 
                      style={{ background: "#2d3436", border: "none" }}
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .hide-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .related-card {
            background: #fff;
            border-radius: 20px;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            border: 1px solid #f0f0f0;
          }
          .related-card:hover {
            box-shadow: 0 15px 35px rgba(0,0,0,0.1);
            transform: translateY(-10px);
            border-color: #ff4d6d50;
          }
          .image-container {
            position: relative;
            padding-top: 100%;
            overflow: hidden;
            background: #f9f9f9;
          }
          .product-img {
            position: absolute;
            top: 0; left: 0; width: 100%; height: 100%;
            object-fit: cover;
            transition: transform 0.6s ease;
          }
          .related-card:hover .product-img {
            transform: scale(1.15);
          }
          .discount-tag {
            position: absolute;
            top: 12px;
            left: 12px;
            border: none;
            font-weight: 700;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(255, 77, 109, 0.3);
          }
        `}} />
      </div>
    </ConfigProvider>
  );
};

export default RelatedProducts;