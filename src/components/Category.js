import React, { useState, useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import { getCategoryData } from "../api/sanphamWebApi";
import { FaArrowUpShortWide, FaArrowUpWideShort } from "react-icons/fa6";
import { Loading } from "../components";
import { getAllColors } from "../api/colorApi";
import { motion } from "framer-motion"; // 👈 thêm framer-motion
import { io } from "socket.io-client"; 


const Category = () => {
  const URL = process.env.REACT_APP_WEB_URL; 
  const { slug } = useParams();
  const [categoryData, setCategoryData] = useState(null);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState("discount"); 
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
const [visibleCount, setVisibleCount] = useState(4); // 👈 Load 8 sp đầu
  useEffect(() => {
    const fetchColors = async () => {
      const data = await getAllColors();
      setColors(data);
    };
    fetchColors();
  }, []);

  useEffect(() => {
    const fetchCategoryData = async () => {
      try {
        const data = await getCategoryData(slug);
        setCategoryData(data);
      } catch (err) {
        setError("Không thể tải dữ liệu danh mục.");
        setLoading(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCategoryData();
  }, [slug]);
 // 👇 kết nối socket
  useEffect(() => {
    const socket = io(URL); // URL backend

    // Lắng nghe sự kiện thêm sản phẩm
    socket.on("addProductTrue", (data) => {
      // chỉ thêm nếu sản phẩm thuộc danh mục hiện tại
      if (data.categoryId === categoryData?.id) {
        setCategoryData((prev) => ({
          ...prev,
          products: [...prev.products, {
            id: data.productId,
            name: data.name,
            slug: data.slug,
            image: data.image,
            price: data.price,
            status: data.status,
            color: data.color || "",
            discount_type: data.discount_type || null,
            discount_value: data.discount_value || null,
            created_at: new Date().toISOString()
          }]
        }));
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [URL, categoryData?.id]);
  useEffect(() => {
  const socket = io(URL);

  // 👂 Lắng nghe xoá sản phẩm
  socket.on("deleteProductTrue", ({ productId }) => {
    setCategoryData((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.id !== Number(productId))
    }));
  });

  return () => {
    socket.disconnect();
  };
}, [URL]);
  if (error) {
    return (
      <Container
        className="text-center mt-5 d-flex justify-content-center align-items-center"
        style={{ height: 800 }}
      >
        {error}
      </Container>
    );
  }
  if (loading) {
    return (
      <Container
        className="text-center mt-5 d-flex justify-content-center align-items-center"
        style={{ height: 800 }}
      >
        <Loading />
      </Container>
    );
  }

const renderProductItem = (product, index) => (
  <motion.div
    key={product.id}
    initial={{ opacity: 0, y: 40 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay: index * 0.1 }}
    className="p-2"
  >
    <div
      className="product-card h-100 d-flex flex-column"
      style={{
        borderRadius: "16px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
        overflow: "hidden",
        transition: "all 0.3s ease",
        background: "#fff",
      }}
      onMouseOver={(e) =>
        (e.currentTarget.style.transform = "translateY(-6px)")
      }
      onMouseOut={(e) => (e.currentTarget.style.transform = "translateY(0)")}
    >
      {/* Ảnh */}
      <div className="position-relative">
        <Link to={`/product/${product.slug}`}>
          <img
            src={`${URL}/uploads/${product.image}`}
            alt={product.name}
            className="w-100"
            style={{
              height: "100%",
              objectFit: "cover",
            }}
          />
        </Link>
        {product.discount_value && (
          <span
            className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded"
            style={{
              background: "linear-gradient(135deg,#ff4e50,#f9d423)",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 600,
            }}
          >
            {product.discount_type === "percent"
              ? `-${parseInt(product.discount_value)}%`
              : `-${product.discount_value.toLocaleString("vi-VN")}₫`}
          </span>
        )}
      </div>

      {/* Nội dung */}
      <div className="p-3 flex-grow-1 d-flex flex-column">
        {/* Tên */}
        <h6
          className="fw-semibold text-truncate mb-2"
          style={{ fontSize: "15px" }}
          title={product.name}
        >
          {product.name}
        </h6>

        {/* Giá */}
        <div className="mb-2">
          <span
            style={{
              fontSize: "16px",
              fontWeight: 700,
              background: "linear-gradient(90deg,#ff512f,#dd2476)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {(() => {
              const price = Number(product.price);
              let finalPrice = price;
              if (product.discount_type === "percent") {
                finalPrice = price * (1 - Number(product.discount_value) / 100);
              } else if (product.discount_type === "fixed") {
                finalPrice = price - Number(product.discount_value);
              }
              return `${Math.max(0, Math.round(finalPrice)).toLocaleString(
                "vi-VN"
              )}đ`;
            })()}
          </span>
          {product.originalPrice && (
            <span
              className="ms-2 text-muted"
              style={{
                textDecoration: "line-through",
                fontSize: "13px",
              }}
            >
              {product.originalPrice.toLocaleString()}₫
            </span>
          )}
        </div>

        {/* Màu */}
        <div className="d-flex gap-2 mt-auto">
          {product.color.split(",")?.map((colorName, i) => {
            const matchedColor = colors.find(
              (color) =>
                color.name.toLowerCase().trim() ===
                colorName.toLowerCase().trim()
            );
            const colorCode = matchedColor ? matchedColor.code : "#000000";
            return (
              <span
                key={i}
                title={colorName}
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: colorCode,
                  border: "2px solid #fff",
                  boxShadow: "0 0 3px rgba(0,0,0,0.3)",
                  cursor: "pointer",
                  transition: "transform 0.2s ease",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.transform = "scale(1.2)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              ></span>
            );
          })}
        </div>
      </div>
    </div>
  </motion.div>
);
 // Sắp xếp sản phẩm
  const sortedProducts = categoryData?.products
    ?.filter((p) => Number(p.quantity) > 0)
    ?.sort((a, b) => {
      switch (sortType) {
        case "discount":
          return (b.discount || 0) - (a.discount || 0);
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "priceAsc":
          return a.price - b.price;
        case "priceDesc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

  return (
    <div className="category-page">
      <div className="category-header">
        <ol
          className="breadcrumb"
          style={{ padding: "0 16px", marginBottom: "1rem" }}
        >
          <li className="breadcrumb-item">
            <a href="/" style={{ textDecoration: "none" }}>
              Trang chủ
            </a>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {categoryData.categoryTitle}
          </li>
        </ol>
        <div className="filter-sort">
          <div className="sort-options">
            <button
              className={`sort-button ${
                sortType === "discount" ? "active" : ""
              }`}
              onClick={() => setSortType("discount")}
            >
              Ưu đãi
            </button>
            <button
              className={`sort-button ${sortType === "newest" ? "active" : ""}`}
              onClick={() => setSortType("newest")}
            >
              Mới nhất
            </button>
            <select
              className="sort-select"
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
            >
              <option value="">-- Sắp xếp theo giá --</option>
              <option value="priceAsc">
                Giá tăng dần <FaArrowUpShortWide />
              </option>
              <option value="priceDesc">
                Giá giảm dần <FaArrowUpWideShort />
              </option>
            </select>
          </div>
        </div>
      </div>
      <div className="product-list" style={{ padding: "0 16px" }}>
        {sortedProducts?.length > 0 ? (
          sortedProducts.slice(0, visibleCount).map((p, i) =>
            renderProductItem(p, i)
          )
        ) : (
          <div
            className="d-flex flex-column align-items-center justify-content-center text-muted mt-5"
            style={{ fontStyle: "italic", minHeight: "300px" }}
          >
            <img
              src="https://cdn-icons-png.flaticon.com/512/4076/4076549.png"
              alt="No products"
              style={{ width: "120px", opacity: 0.6, marginBottom: "16px" }}
            />
            <h5 className="fw-semibold">Không có sản phẩm nào phù hợp</h5>
            <p style={{ fontSize: "14px" }}>
              Vui lòng thử lại với danh mục khác hoặc quay về{" "}
              <Link to="/" className="text-decoration-underline text-primary">
                Trang chủ
              </Link>
              .
            </p>
          </div>
        )}
      
      </div>
         {/* Load More */}
      {sortedProducts?.length > visibleCount && (
        <div className="text-center my-4">
          <button
            className="btn btn-outline-primary rounded-pill px-4"
            onClick={() => setVisibleCount((prev) => prev + 8)}
          >
            Xem thêm
          </button>
        </div>
      )}
    </div>
  );
};

export default Category;
