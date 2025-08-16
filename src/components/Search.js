import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FaArrowUpShortWide, FaArrowUpWideShort } from "react-icons/fa6";
import { motion, AnimatePresence } from "framer-motion";
import { searchProducts } from "../api/sanphamWebApi";
import { getAllColors } from "../api/colorApi";
import Loading from "./Loading";

const Search = () => {
  const [error, setError] = useState(null);
  const [visibleCount, setVisibleCount] = useState(8);
  const [sortType, setSortType] = useState("discount");
  const [colors, setColors] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const URL = process.env.REACT_APP_WEB_URL;

  // Lấy màu
  useEffect(() => {
    getAllColors().then(setColors);
  }, []);

  // Search sản phẩm
  useEffect(() => {
    if (keyword) {
      setLoading(true);
      searchProducts(keyword)
        .then((data) => setResults(data))
        .catch((err) => setError(err))
        .finally(() => setLoading(false));
    }
  }, [keyword]);

  // Skeleton loading
  const LoadingSkeleton = () => (
    <div className="row w-100">
      {Array.from({ length: 8 }).map((_, i) => (
        <div className="col-6 col-md-4 col-lg-3 p-2" key={i}>
          <div
            style={{
              height: "300px",
              borderRadius: "16px",
              background:
                "linear-gradient(90deg,#f0f0f0 25%,#e0e0e0 37%,#f0f0f0 63%)",
              backgroundSize: "400% 100%",
              animation: "shimmer 1.5s infinite",
            }}
          />
        </div>
      ))}
    </div>
  );

  // Render sản phẩm
  const renderProductItem = (product, index) => (
    <motion.div
      key={product.id}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ scale: 1.02 }}
      className="h-100"
    >
      <div
        className="h-100 d-flex flex-column"
        style={{
          borderRadius: "16px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          overflow: "hidden",
          background: "#fff",
          transition: "all 0.3s ease",
        }}
      >
        {/* Ảnh */}
        <div className="position-relative overflow-hidden">
          <Link to={`/product/${product.slug}`}>
            <motion.img
              src={`${URL}/uploads/${product.image}`}
              alt={product.name}
              className="w-100"
              style={{ height: "100%", objectFit: "cover" }}
              whileHover={{ scale: 1.1 }}
              transition={{ duration: 0.4 }}
            />
          </Link>
          {product.discount_value && (
            <motion.span
              className="position-absolute top-0 start-0 m-2 px-2 py-1 rounded"
              style={{
                background: "linear-gradient(135deg,#ff4e50,#f9d423)",
                color: "#fff",
                fontSize: "13px",
                fontWeight: 600,
              }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            >
              {product.discount_type === "percent"
                ? `-${parseInt(product.discount_value)}%`
                : `-${product.discount_value.toLocaleString("vi-VN")}₫`}
            </motion.span>
          )}
        </div>

        {/* Nội dung */}
        <div className="p-3 flex-grow-1 d-flex flex-column">
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
                style={{ textDecoration: "line-through", fontSize: "13px" }}
              >
                {product.originalPrice.toLocaleString()}₫
              </span>
            )}
          </div>

          {/* Màu */}
          <div className="d-flex gap-2 mt-auto flex-wrap">
            {product.color.split(",")?.map((colorName, i) => {
              const matchedColor = colors.find(
                (color) =>
                  color.name.toLowerCase().trim() === colorName.toLowerCase().trim()
              );
              const colorCode = matchedColor ? matchedColor.code : "#000000";
              return (
                <motion.span
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
                  }}
                  whileHover={{ scale: 1.3 }}
                  transition={{ type: "spring", stiffness: 300 }}
                />
              );
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );

  // Sort
  const sortedProducts = results
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
      {/* Breadcrumb */}
      <ol className="breadcrumb px-3 mb-3">
        <li className="breadcrumb-item">
          <Link to="/" style={{ textDecoration: "none" }}>
            Trang chủ
          </Link>
        </li>
        <li className="breadcrumb-item active">Tìm kiếm</li>
      </ol>

      {/* Sort */}
      <div className="d-flex justify-content-start align-items-center gap-2 px-3 mb-3">
        <button
          className={`btn btn-sm ${
            sortType === "discount" ? "btn-dark" : "btn-outline-dark"
          }`}
          onClick={() => setSortType("discount")}
        >
          Ưu đãi
        </button>
        <button
          className={`btn btn-sm ${
            sortType === "newest" ? "btn-dark" : "btn-outline-dark"
          }`}
          onClick={() => setSortType("newest")}
        >
          Mới nhất
        </button>
        <select
          className="form-select form-select-sm"
          style={{ width: "180px" }}
          value={sortType}
          onChange={(e) => setSortType(e.target.value)}
        >
          <option value="">-- Sắp xếp theo giá --</option>
          <option value="priceAsc">Giá tăng dần <FaArrowUpShortWide /></option>
          <option value="priceDesc">Giá giảm dần <FaArrowUpWideShort /></option>
        </select>
      </div>

      {/* Danh sách */}
      <div className="row px-3">
        <AnimatePresence>
          {loading ? (
            <Loading />
          ) : sortedProducts?.length > 0 ? (
            sortedProducts.slice(0, visibleCount).map((p, i) => (
              <div className="col-6 col-md-4 col-lg-3 mb-3" key={p.id}>
                {renderProductItem(p, i)}
              </div>
            ))
          ) : (
            <div className="d-flex flex-column align-items-center justify-content-center text-muted mt-5">
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
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Search;
