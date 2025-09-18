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
import { Loading } from "../components";
import { showSuccessToast, showErrorToast } from "../utils/toastUtils";
import { motion, AnimatePresence } from "framer-motion";
import { FaExclamationTriangle } from "react-icons/fa";
import { useSwipeable } from "react-swipeable";
import ProductReviews from "./ProductReviews";

const Product = () => {
  const URL = process.env.REACT_APP_WEB_URL; 
  const user = JSON.parse(localStorage.getItem("user")); // user đã đăng nhập
  console.log(user);
  
  const { addToCart } = useCart();
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const [showColorWarning, setShowColorWarning] = useState(false);
  const [showSizeWarning, setShowSizeWarning] = useState(false);
  const [showQtyWarning, setShowQtyWarning] = useState(false);
  const [showDes, setShowDes] = useState(false);
  const [loading, setLoading] = useState(true);
const [selectedImage, setSelectedImage] = useState(null);
  const [colors, setColors] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductBySlug(slug);

        setSelectedImage(productData.image);

        // Gắn thêm các field cần thiết cho frontend
        setProduct({
          ...productData,
          totalPto: productData.quantity,
          subImages: productData.subImages || [],
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
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);
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
    if (product.quantity > product.totalPto) {
      setShowQtyWarning(true);
      setTimeout(() => setShowQtyWarning(false), 2000);
      return;
    }
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
const allImages = product ? [product.image, ...(product.subImages || [])] : [];
const handlers = useSwipeable({
  onSwipedLeft: () => {
    if (allImages.length === 0) return;
    const currentIndex = allImages.indexOf(selectedImage);
    const nextIndex = (currentIndex + 1) % allImages.length;
    setSelectedImage(allImages[nextIndex]);
  },
  onSwipedRight: () => {
    if (allImages.length === 0) return;
    const currentIndex = allImages.indexOf(selectedImage);
    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setSelectedImage(allImages[prevIndex]);
  },
});

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
showColorWarning && showSuccessToast("Thông báo", "Vui lòng chọn màu sắc!");
showSizeWarning && showSuccessToast("Thông báo", "Vui lòng chọn hình dáng!");
showQtyWarning && showSuccessToast("Thông báo", "Sản phẩm không đủ số lượng!");
  return (
    <div style={{ marginTop: "72px" }}>
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
              <div className="product-images">
                {/* Desktop thumbnails: d-md-flex */}
                <div
                  style={{ flexDirection: "column", marginRight: 15 }}
                  className="d-none d-md-flex flex-wrap gap-2 justify-content-center"
                >
                  {[product.image, ...(product.subImages || [])].map((img, idx) => (
                    <Image
                      key={idx}
                      src={`${URL}/uploads/${img}`}
                      thumbnail
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        cursor: "pointer",
                        border:
                          selectedImage === img ? "2px solid #0d6efd" : "1px solid #ddd",
                        borderRadius: "8px",
                      }}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>

                {/* Mobile slider: d-md-none
                <div className="d-none d-md-flex overflow-auto gap-2 mb-2">
                  {[product.image, ...(product.subImages || [])].map((img, idx) => (
                    <Image
                      key={idx}
                      src={`${URL}/uploads/${img}`}
                      thumbnail
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                        cursor: "pointer",
                        border:
                          selectedImage === img ? "2px solid #0d6efd" : "1px solid #ddd",
                        borderRadius: "8px",
                        flexShrink: 0,
                      }}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div> */}

                {/* Main image */}
                <div {...handlers} className="main-image position-relative">
                {selectedImage && (
                  <motion.img
                    key={selectedImage}
                    src={`${URL}/uploads/${selectedImage}`}
                    alt={product.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4 }}
                    className="w-100 rounded"
                  />
                )}

                {/* Nút trái */}
                <button
                  className="nav-arrow nav-arrow-left d-md-none d-flex "
                  style={{ zIndex: 10 }}
                  onClick={() => {
                    const currentIndex = allImages.indexOf(selectedImage);
                    const prevIndex = (currentIndex - 1 + allImages.length) % allImages.length;
                    setSelectedImage(allImages[prevIndex]);
                  }}
                >
                  &#8592;
                </button>

                {/* Nút phải */}
                <button
                  className="nav-arrow nav-arrow-right d-md-none d-flex "
                  style={{ zIndex: 10 }}
                  onClick={() => {
                    const currentIndex = allImages.indexOf(selectedImage);
                    const nextIndex = (currentIndex + 1) % allImages.length;
                    setSelectedImage(allImages[nextIndex]);
                  }}
                >
                  &#8594;
                </button>
              </div>
              </div>
            </Col>

            <Col md={6} xs={12}>
              {" "}
              <div className="product-info">
                 {/* Tên sản phẩm */}
                <h1 className="product-name fw-bold mb-3" style={{ fontSize: "28px" }}>
                  {product.name}
                </h1>
                
                {product.discount_value && (
                  <div className="mb-2">
                     <span className="badge bg-danger fs-6 px-3 py-2">
                      {product.discount_type === "percent"
                        ? `Giảm giá : ${parseInt(product.discount_value)}%`
                        : `Giảm giá : ${product.discount_value.toLocaleString(
                            "vi-VN"
                          )}₫`}
                    </span>
                  </div>
                )}
                <div className="product-price mb-4">
                  <span className="current-price text-danger fw-bold fs-3 me-3">
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
                  {product.discount_value > 0 && (
                    <span className="text-muted text-decoration-line-through fs-6">
                      {Number(product.price).toLocaleString("vi-VN")}đ
                    </span>
                  )}
                </div>
                {/* Chọn màu sắc */}
                <div className="product-options">
                  <div
                    style={{ marginBottom: "40px" }}
                    className="color-options"
                  >
                    <label className="fw-semibold d-block mb-2">
                      Màu sắc: 
                      <span className="text-primary">
                        {product.selectedColor || " Chọn màu"}
                      </span>
                    </label>
                    <div className="d-flex flex-wrap gap-2">
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
                                product.selectedColor === colorName ? "selected" : ""
                              }`}
                            onClick={() => handleColorSelect(colorName)}
                            style={{
                                cursor: "pointer",
                                border:
                                  product.selectedColor === colorName
                                    ? "2px solid #000"
                                    : "1px solid #ddd",
                                borderRadius: "50%",
                                padding: "2px",
                              }}
                          >
                            <div
                              className="swatch"
                              style={{
                                backgroundColor: colorCode,
                                width: "32px",
                                height: "32px",
                                borderRadius: "50%",
                              }}
                            ></div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  {/* Chọn hình dáng (size) */}
                  <div
                    style={{ marginBottom: "40px" }}
                    className="size-options"
                  >
                    <label className="fw-semibold d-block mb-2">
                      Hình dáng: 
                       <span className="text-primary">
                          {product.selectedSize || "Chọn hình dáng"}
                        </span>
                    </label>
                    <div className="d-flex flex-wrap gap-2">
                        {product.size?.split(",")?.map((size) => (
                          <button
                            key={size}
                            className={`btn btn-outline-dark rounded-pill px-3 py-2 ${
                              product.selectedSize === size ? "active" : ""
                            }`}
                            onClick={() => handleSizeSelect(size)}
                          >
                            {size}
                          </button>
                        ))}
                    </div>
                  </div>
                        {/* Số lượng + Nút giỏ hàng */}
                  <div
                    style={{ marginBottom: "40px" }}
                    className="quantity-selector"
                  >
                    <Row>
                      <Col xs={12} md={3}>
                        {" "}
                        <div className="quantity-controls">
                          <button
                            className="btn btn-light px-3"
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
                            className="btn btn-light px-3"
                            onClick={() => handleQuantityChange("increase")}
                          >
                            +
                          </button>
                        </div>
                      </Col>
                      <Col xs={12} md={9}>
                       <motion.button
                          className=" add-to-cart-button  rounded-pill"
                          onClick={handleAddToCart}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Thêm vào giỏ
                        </motion.button>
                      </Col>
                    </Row>
                  </div>
                </div>

                {/* Cam kết */}
                <div className="yody-camket mt-4">
                  <h5 className="fw-bold mb-3">🌟 Âm Sắc Việt cam kết</h5>
                  <motion.ul
                    className="list-unstyled"
                    initial="hidden"
                    animate="show"
                    variants={{
                      hidden: { opacity: 0 },
                      show: { opacity: 1, transition: { staggerChildren: 0.2 } },
                    }}
                  >
                    {product.yodyCamKet?.map((item, index) => (
                      <motion.li
                        key={index}
                        className="d-flex align-items-center mb-2 p-3 border rounded-3 bg-white shadow-sm"
                        variants={{ hidden: { y: 20, opacity: 0 }, show: { y: 0, opacity: 1 } }}
                      >
                        <div
                          className="me-3 d-flex align-items-center justify-content-center bg-light rounded-circle"
                          style={{ width: "40px", height: "40px" }}
                        >
                          {item.icon}
                        </div>
                        <p className="mb-0">{item.text}</p>
                      </motion.li>
                    ))}
                  </motion.ul>
                </div>
              </div>
            </Col>
          </div>
          <Col md={12} className="mb-5">
             <div className="mt-2 product-mota shadow-sm rounded-3 border">
               <button
                      onClick={() => setShowDes(!showDes)}
                      className="w-100 d-flex justify-content-between align-items-center px-3 py-3 bg-light border-0 rounded-top"
                      style={{ cursor: "pointer" }}
                    >
                 <span style={{ fontSize: "18px", fontWeight: "600" }}>
                  📖 Mô tả sản phẩm
                </span>
                 <motion.div
                      animate={{ rotate: showDes ? 45 : 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ color: "black"}}
                    >
                      <MdAddCircleOutline size={24} />
                    </motion.div>
              </button>
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={showDes ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden"
                >
              <div className={`toggle-description px-3 py-3 bg-white rounded-bottom ${showDes ? "show" : ""} ` } style={{overflowY:'auto'}}>
                <div
                    style={{
                      fontSize: "15px",
                      lineHeight: "1.6",
                      color: "#333",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {product.description}
                  </div>
                <div className="text-center mt-3">
                    <img
                      src={`${URL}/uploads/${product.image}`}
                      alt={product.name}
                      className="img-fluid rounded shadow-sm"
                      style={{ maxHeight: "400px", objectFit: "cover" }}
                    />
                  </div>
                </div>
                </motion.div>
            </div>
          </Col>
        </Row>
        <AnimatePresence>
        {showNotification && addedProduct && (
            <motion.div
               initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="notification show">
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
                  src={`${URL}/uploads/${product.image}`}
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
          </motion.div>
        )}
        </AnimatePresence>

      </Container>
      <Container>
        <ProductReviews productId={product.id} user={user} />
      </Container>
    </div>
  );
};

export default Product;
