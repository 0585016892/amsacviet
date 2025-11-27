import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const RelatedProducts = ({ categoryId, productId }) => {
  const URL = process.env.REACT_APP_WEB_URL;

  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!categoryId || !productId) return;

    const fetchRelated = async () => {
      try {
        setLoading(true);
        const res = await axios.get(
          `http://localhost:5000/api/products/related/${categoryId}/${productId}`
        );
        setRelatedProducts(res.data.data);
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm liên quan:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelated();
  }, [categoryId, productId]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const width = scrollRef.current.offsetWidth * 0.8;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -width : width,
        behavior: "smooth",
      });
    }
  };

  if (loading) return <p>Đang tải sản phẩm liên quan...</p>;
  if (relatedProducts.length === 0) return <p>Không có sản phẩm liên quan</p>;

  return (
    <div style={{ position: "relative", marginTop: "30px" }}>
      <h3 style={{ marginBottom: "15px", fontSize: "20px", fontWeight: "600" }}>
        Sản phẩm liên quan
      </h3>

      {/* Nút scroll */}
      <button
        onClick={() => scroll("left")}
        style={{
          position: "absolute",
          left: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          fontSize: "20px",
        }}
      >
        &#8249;
      </button>
      <button
        onClick={() => scroll("right")}
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          background: "#fff",
          border: "none",
          borderRadius: "50%",
          width: "40px",
          height: "40px",
          cursor: "pointer",
          boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
          fontSize: "20px",
        }}
      >
        &#8250;
      </button>

      <div
        ref={scrollRef}
        style={{
          display: "flex",
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          gap: "20px",
          padding: "10px 50px",
        }}
      >
        {relatedProducts.map((product) => {
          const price = Number(product.price);
          let finalPrice = price;

          if (product.discount_type === "percent") {
            finalPrice = price * (1 - Number(product.discount_value) / 100);
          } else if (product.discount_type === "fixed") {
            finalPrice = price - Number(product.discount_value);
          }

          return (
            <div
              key={product.id}
              style={{
                minWidth: "200px",
                borderRadius: "10px",
                textAlign: "center",
                scrollSnapAlign: "start",
                flexShrink: 0,
                padding: "10px",
                background: "#fff",
                boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
                position: "relative",
                transition: "transform 0.3s, box-shadow 0.3s",
              }}
              className="related-item"
            >
              {product.discount_value && (
                <span
                  style={{
                    position: "absolute",
                    top: "10px",
                    left: "10px",
                    background: "#ff4d4f",
                    color: "#fff",
                    padding: "5px 8px",
                    borderRadius: "5px",
                    fontSize: "12px",
                    fontWeight: "500",
                  }}
                >
                  {product.discount_type === "percent"
                    ? `Giảm ${parseInt(product.discount_value)}%`
                    : `Giảm ${product.discount_value.toLocaleString("vi-VN")}₫`}
                </span>
              )}
              <Link
                to={`/product/${product.slug}`}
                style={{ textDecoration: "none", color: "#333" }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "160px",
                    overflow: "hidden",
                    borderRadius: "8px",
                  }}
                >
                  <img
                    src={`${URL}/uploads/${product.image}`}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.3s",
                    }}
                    className="related-img"
                  />
                </div>
                <h5
                  style={{
                    margin: "10px 0 5px",
                    fontSize: "15px",
                    fontWeight: "500",
                  }}
                >
                  {product.name}
                </h5>
              </Link>
              <p style={{ fontWeight: "600", color: "#ff4d4f", margin: 0 }}>
                {Math.max(0, Math.round(finalPrice)).toLocaleString("vi-VN")}₫
              </p>
              {product.discount_value && (
                <p
                  style={{
                    textDecoration: "line-through",
                    color: "#999",
                    fontSize: "13px",
                    marginTop: "2px",
                  }}
                >
                  {price.toLocaleString("vi-VN")}₫
                </p>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        .related-item:hover {
          transform: translateY(-5px);
          box-shadow: 0 6px 18px rgba(0,0,0,0.15);
        }
        .related-item:hover .related-img {
          transform: scale(1.05);
        }
        ::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default RelatedProducts;
