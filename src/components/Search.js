import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { FaArrowUpShortWide, FaArrowUpWideShort } from "react-icons/fa6";
import { Link } from "react-router-dom";
import { searchProducts } from "../api/sanphamWebApi";
const Search = () => {
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState("discount"); // "discount" | "newest" | "priceAsc" | "priceDesc"

  const colorMapping = {
    Đen: "#000000",
    Trắng: "#FFFFFF",
    Đỏ: "#FF0000",
    "Xanh lá": "#008000",
    Xanh: "#0000FF",
    Vàng: "#FFFF00",
    Cam: "#FFA500",
    Tím: "#800080",
    Hồng: "#FFC0CB",
    Xám: "#808080",
    Nâu: "#A52A2A",
    Be: "#F5F5DC",
    "Tím than": "#000080",
    "Than chì": "#cccccc",
    "Xanh dương nhạt": "#ADD8E6",
    "Lục nhạt": "#90EE90",
    "Xanh ngọc": "#d1ffd7",
    "Xanh nhạt": "#1790c8",
    "Xanh lam": "#1E90FF",
    "Xanh biển": "#00008B",
    "Hồng nhạt": "#FFB6C1",
    "Đỏ tươi": "#FF6347",
    "Màu cà phê": "#6F4F37",
    "Lục đậm": "#006400",
    "Xanh lá nhạt": "#32CD32",
    "Xanh dương đậm": "#00008B",
    "Cam nhạt": "#f36b26",
    "Xanh rêu": "#556B2F",
    "Đỏ gạch": "#B22222",
    "Xanh lá mạ": "#98FB98",
    Bạc: "#C0C0C0",
    "Vàng kim": "#FFD700",
    "Bạch kim": "#E5E4E2",
    "Xanh da trời": "#1790c8",
    "Xanh lá cây dưa": "#C2F0C2",
  };
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  const [results, setResults] = useState([]);

  useEffect(() => {
    if (keyword) {
      searchProducts(keyword)
        .then((data) => setResults(data))
        .catch((err) => console.error(err));
    }
  }, [keyword]);
  const renderProductItem = (product) => (
    <div key={product.id} className="product-item">
      <div className="product-image">
        <Link to={`/product/${product.slug}`}>
          <img
            src={`https://finlyapi-production.up.railway.app/uploads/${product.image}`}
            alt={product.name}
          />
        </Link>
        {product.discount && (
          <div className="discount-badge">-{product.discount}%</div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">
          <span className="current-price">
            {Number(product.price).toLocaleString("vi-VN")}đ
          </span>
          {product.originalPrice && (
            <span className="original-price">
              {product.originalPrice.toLocaleString()}₫
            </span>
          )}
        </div>
        <div className="product-colors">
          {product.color.split(",")?.map((colorName) => {
            const colorCode = colorMapping[colorName] || "#000000"; // Nếu không tìm thấy màu, dùng màu mặc định (đen)
            return (
              <span
                key={colorName}
                className="color-swatch"
                style={{ backgroundColor: colorCode }}
              ></span>
            );
          })}
        </div>
      </div>
    </div>
  );

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
            Tìm kiếm
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
        {results
          ?.filter((product) => Number(product.quantity) > 0)
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
          })
          ?.map(renderProductItem)}
      </div>
    </div>
  );
};

export default Search;
