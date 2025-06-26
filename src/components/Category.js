import React, { useState, useEffect } from "react";
import { Container, Spinner } from "react-bootstrap";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getCategoryData } from "../api/sanphamWebApi";
import { FaArrowUpShortWide, FaArrowUpWideShort } from "react-icons/fa6";
import { getAllColors } from "../api/colorApi";
const Category = () => {
  const { slug } = useParams();
  const [categoryData, setCategoryData] = useState(null);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState("discount"); // "discount" | "newest" | "priceAsc" | "priceDesc"
  const [loading, setLoading] = useState(true);
  const [colors, setColors] = useState([]);
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
        <Spinner animation="border" />
      </Container>
    );
  }
  const renderProductItem = (product) => (
    <div key={product.id} className="product-item">
      <div className="product-image">
        <Link to={`/product/${product.slug}`}>
          <img
            src={`https://finlyapi-production.up.railway.app/uploads/${product.image}`}
            alt={product.name}
          />
        </Link>
        {product.discount_value && (
          <div className="discount-badge">
            {product.discount_type === "percent"
              ? `${parseInt(product.discount_value)}%`
              : `-${product.discount_value.toLocaleString("vi-VN")}₫`}
          </div>
        )}
      </div>
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <div className="product-price">
          <span className="current-price">
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
            <span className="original-price">
              {product.originalPrice.toLocaleString()}₫
            </span>
          )}
        </div>
        <div className="product-colors">
          {product.color.split(",")?.map((colorName) => {
            const matchedColor = colors.find(
              (color) =>
                color.name.toLowerCase().trim() ===
                colorName.toLowerCase().trim()
            );
            const colorCode = matchedColor ? matchedColor.code : "#000000"; // fallback màu đen nếu không có
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
        {categoryData?.products
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

export default Category;
