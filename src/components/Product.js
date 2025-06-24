import React, { useState, useEffect, useMemo } from "react";

import { useParams, Link } from "react-router-dom";
import { Container, Row, Col, Image, Spinner } from "react-bootstrap";
import "../assets/product.css";
import { getProductBySlug } from "../api/sanphamWebApi";
import SizeGuide from "./SizeGuide";
import "../assets/AddToCartButton.css";
import { MdOutlineLocalShipping, MdAddCircleOutline } from "react-icons/md";
import { TfiReload } from "react-icons/tfi";
import { AiOutlineFileProtect } from "react-icons/ai";
import { getAllColors } from "../api/colorApi";
import { useCart } from "../context/CartContext";
const Product = () => {
  const { addToCart } = useCart();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [showColorWarning, setShowColorWarning] = useState(false);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [showDes, setShowDes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductBySlug(slug);
        setSelectedImage(productData.image);

        // Gắn thêm các field cần thiết cho frontend
        setProduct({
          ...productData,
          selectedColor: productData.colors ? productData.colors[0] : "",
          selectedSize: productData.sizes ? productData.sizes[0] : "",
          currentImageUrlIndex: 0,
          quantity: 1,
          yodyCamKet: [
            {
              text: "Giao trong 3-5 ngày và freeship từ 2 đơn",
              icon: <MdOutlineLocalShipping size={25} />,
            },
            {
              icon: <TfiReload eft size={25} />,
              text: "Miễn phí đổi trả tận nhà 60 ngày",
            },
            {
              icon: <AiOutlineFileProtect size={25} />,
              text: "Cam kết bảo mật thông tin khách hàng",
            },
          ],
        });
      } catch (error) {
        console.error("Error loading product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);
  const [colors, setColors] = useState([]);
  useEffect(() => {
    const fetchColors = async () => {
      const data = await getAllColors();
      setColors(data);
    };

    fetchColors();
  }, []);

  const handleColorSelect = (color) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      selectedColor: color, // Lưu tên màu, ví dụ "Đen"
    }));
  };

  const handleSizeSelect = (size) => {
    setProduct((prevProduct) => ({
      ...prevProduct,
      selectedSize: size, // Cập nhật kích thước đã chọn
    }));
  };
  const handleQuantityChange = (type) => {
    setProduct((prev) => {
      let newQuantity = prev.quantity;
      if (type === "decrease" && newQuantity > 1) newQuantity--;
      if (type === "increase") newQuantity++;
      return { ...prev, quantity: newQuantity };
    });
  };

  const handleAddToCart = () => {
    const {
      id,
      slug,
      name,
      selectedColor,
      selectedSize,
      quantity,
      price,
      image,
      discount_value,
      discount_type,
    } = product;
    const cartItem = {
      id,
      slug,
      name,
      color: selectedColor,
      size: selectedSize,
      quantity,
      price,
      image,
      discount_value,
      discount_type,
    };
    if (!product.selectedColor) {
      setShowColorWarning(true);
      setTimeout(() => setShowColorWarning(false), 2000);
      return;
    }
    if (!product.selectedSize) {
      setShowSizeWarning(true);
      setTimeout(() => setShowSizeWarning(false), 2000);
      return;
    }
    addToCart(cartItem);
    // Lưu thông tin sản phẩm đã thêm vào state
    setAddedProduct(cartItem);
    // Hiển thị thông báo
    setShowNotification(true);

    // // Tắt thông báo sau 3 giây
    setTimeout(() => {
      setShowNotification(false);
    }, 3000);
  };

  // const handlePrevImage = () => {
  //   setProduct((prevProduct) => ({
  //     ...prevProduct,
  //     currentImageUrlIndex:
  //       (prevProduct.currentImageUrlIndex - 1 + prevProduct.imageUrls.length) %
  //       prevProduct.imageUrls.length,
  //   }));
  // };

  // const handleNextImage = () => {
  //   setProduct((prevProduct) => ({
  //     ...prevProduct,
  //     currentImageUrlIndex:
  //       (prevProduct.currentImageUrlIndex + 1) % prevProduct.imageUrls.length,
  //   }));
  // };
  console.log(product);

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

  return (
    <div style={{ marginTop: "72px" }}>
      {showColorWarning && (
        <div className="slide-notification warning">
          <p>⚠️ Vui lòng chọn màu sắc !</p>
        </div>
      )}
      {showSizeWarning && (
        <div className="slide-notification warning">
          <p>⚠️ Vui lòng chọn kích thước !</p>
        </div>
      )}
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
            {product.name}
          </li>
        </ol>
      </div>
      <Container>
        <Row>
          <div className="product-detail-container">
            <Col md={6} xs={12}>
              {" "}
              <div className="product-images">
                <div
                  style={{ flexDirection: "column", marginRight: 15 }}
                  className="d-md-flex d-none flex-wrap gap-2  justify-content-center"
                >
                  {[product.image, ...(product.subImages || [])]?.map(
                    (img, idx) => (
                      <Image
                        key={idx}
                        src={`http://localhost:5000/uploads/${img}`}
                        thumbnail
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          cursor: "pointer",
                          border:
                            selectedImage === img
                              ? "2px solid #0d6efd"
                              : "1px solid #ddd",
                          borderRadius: "8px",
                        }}
                        onClick={() => setSelectedImage(img)}
                      />
                    )
                  )}
                </div>
                <div className="main-image">
                  <img
                    src={`http://localhost:5000/uploads/${selectedImage}`}
                    alt={product.name}
                  />
                </div>
              </div>
            </Col>
            <Col md={6} xs={12}>
              {" "}
              <div className="product-info">
                <h1
                  style={{ marginBottom: "20px", fontSize: "25px" }}
                  className="product-name product-name-rp"
                >
                  {product.name}
                </h1>
                {product.discount_value && (
                  <div>
                    <span className="discount">
                      {product.discount_type === "percent"
                        ? `Giảm giá : ${parseInt(product.discount_value)}%`
                        : `Giảm giá : ${product.discount_value.toLocaleString(
                            "vi-VN"
                          )}₫`}
                    </span>
                  </div>
                )}
                <div className="product-price">
                  <span className="current-price">
                    {(() => {
                      const price = Number(product.price);
                      let finalPrice = price;

                      if (product.discount_type === "percent") {
                        finalPrice =
                          price * (1 - Number(product.discount_value) / 100);
                      } else if (product.discount_type === "fixed") {
                        finalPrice = price - Number(product.discount_value);
                      }

                      return `${Math.max(
                        0,
                        Math.round(finalPrice)
                      ).toLocaleString("vi-VN")}đ`;
                    })()}
                  </span>
                </div>

                <div className="product-options">
                  <div
                    style={{ marginBottom: "40px" }}
                    className="color-options"
                  >
                    <label style={{ marginBottom: "20px" }}>
                      Màu sắc: {product.selectedColor || "Chọn màu"}
                    </label>
                    <div className="color-swatches">
                      {product.color?.split(",")?.map((colorName) => {
                        const matchedColor = colors.find(
                          (color) =>
                            color.name.toLowerCase().trim() ===
                            colorName.toLowerCase().trim()
                        );
                        const colorCode = matchedColor
                          ? matchedColor.code
                          : "#ccc"; // fallback màu xám nếu không khớp
                        return (
                          <div
                            key={colorName}
                            className={`swatch-container ${
                              product.selectedColor === colorName
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => handleColorSelect(colorName)}
                          >
                            <div
                              className="swatch"
                              style={{ backgroundColor: colorCode }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div
                    style={{ marginBottom: "40px" }}
                    className="size-options"
                  >
                    <label style={{ marginBottom: "20px" }}>
                      Kích thước: {product.selectedSize || "Chọn size"}
                    </label>
                    <div className="size-options__a">
                      <div className="size-buttons">
                        {product.size?.split(",")?.map((size) => (
                          <button
                            key={size}
                            className={`size-button ${
                              product.selectedSize === size ? "selected" : ""
                            }`}
                            onClick={() => handleSizeSelect(size)}
                          >
                            {size}
                          </button>
                        ))}
                      </div>
                      <SizeGuide />
                    </div>
                  </div>

                  <div
                    style={{ marginBottom: "40px" }}
                    className="quantity-selector"
                  >
                    <Row>
                      <Col md={3} xs={4}>
                        {" "}
                        <div className="quantity-controls">
                          <button
                            onClick={() => handleQuantityChange("decrease")}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={product.quantity}
                            min="1"
                            readOnly // Make it read-only as the buttons control the value
                          />
                          <button
                            onClick={() => handleQuantityChange("increase")}
                          >
                            +
                          </button>
                        </div>
                      </Col>
                      <Col md={9} xs={8}>
                        <button
                          className="add-to-cart-button"
                          onClick={handleAddToCart}
                        >
                          Thêm vào giỏ
                        </button>
                      </Col>
                    </Row>
                  </div>
                </div>

                <div className="yody-camket">
                  <h2>Finly cam kết</h2>
                  <ul>
                    {product.yodyCamKet?.map((item, index) => (
                      <li
                        style={{
                          border: "1px solid #e5d5d5",
                          borderRadius: "5px",
                          padding: "15px 10px",
                          fontSize: "16px",
                          display: "flex",
                        }}
                        key={index}
                      >
                        <div
                          className="d-flex "
                          style={{
                            margin: "0 10px",
                            background: "#e5d5d5",
                            alignItems: "center",
                            padding: "0 10px",
                            borderRadius: "10px",
                          }}
                        >
                          {item.icon}
                        </div>
                        <p> {item.text}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Col>
          </div>
          <Col md={12}>
            <div className="m-2 product-mota" style={{}}>
              <button
                onClick={() => setShowDes(!showDes)}
                style={{ width: "100%", border: "none", background: "white" }}
                className="d-flex justify-content-between align-items-center"
              >
                <p style={{ fontSize: "20px", fontWeight: "600" }}>
                  Mô tả sản phẩm
                </p>
                <MdAddCircleOutline />
              </button>

              <div className={`toggle-description ${showDes ? "show" : ""}`}>
                <div>{product.description}</div>
                <img
                  style={{ objectFit: "cover", width: "100%" }}
                  src={`http://localhost:5000/uploads/${product.image}`}
                  alt={product.name}
                />
              </div>
            </div>
          </Col>
        </Row>
        {showNotification && addedProduct && (
          <div className="notification show">
            <div className="card-header bg-white border-bottom-0 d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Đã thêm vào giỏ hàng</h6>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={() => setShowNotification(false)}
              ></button>
            </div>
            <hr />
            <div className="card-body d-flex align-items-center">
              <div className="me-3">
                <img
                  src={`http://localhost:5000/uploads/${product.image}`}
                  alt="Product Image"
                  className="rounded"
                  style={{ width: "100%", height: "80px", objectFit: "cover" }}
                />
              </div>
              <div className="info">
                <div>
                  {" "}
                  <h6
                    className="card-title mb-1 fw-bold"
                    style={{ fontSize: "0.9rem" }}
                  >
                    {addedProduct.name}
                  </h6>
                  <p
                    className="card-text mb-0"
                    style={{ fontSize: "0.8rem", color: "#6c757d" }}
                  >
                    x{addedProduct.quantity} {addedProduct.color}{" "}
                    {addedProduct.size}
                  </p>
                </div>
                <div className="price__a">
                  <h5 className="card-title mb-0">
                    {" "}
                    {Number(addedProduct.price)?.toLocaleString("vi-VN")} đ
                  </h5>
                </div>
              </div>
            </div>
            <div className="card-footer bg-white border-top-0 d-grid">
              <Link to="/cart" className="btn btn-light rounded">
                Xem giỏ hàng
              </Link>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Product;
