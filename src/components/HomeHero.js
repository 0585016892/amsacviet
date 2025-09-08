import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, Button, Spinner, Form, Pagination} from "react-bootstrap";
import { Link } from "react-router-dom";
const API_URL = process.env.REACT_APP_API_URL;
const WEB_URL = process.env.REACT_APP_WEB_URL;
function HomeHero() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

  useEffect(() => {
    fetch(`${API_URL}/products`)
      .then((res) => res.json())
      .then((data) => {
        console.log("API data:", data);
        setProducts(Array.isArray(data) ? data : data.products || []); // ✅ fix
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setLoading(false);
      });
  }, []);

  // --- Filter logic ---
  const filteredProducts = products.filter((p) => {
    const sizes = p.size ? p.size.split(",").map((s) => s.trim()) : [];
    const matchSize = selectedSize ? sizes.includes(selectedSize) : true;

    const matchColor = selectedColor
      ? p.color?.toLowerCase().includes(selectedColor.toLowerCase())
      : true;

    return matchSize && matchColor;
  });

  // --- Pagination logic ---
  const indexOfLast = currentPage * productsPerPage;
  const indexOfFirst = indexOfLast - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4 fw-bold">✨ Tất cả sản phẩm ✨</h2>

      {/* Filter */}
      <div className="d-flex gap-3 mb-4 justify-content-center flex-wrap">
        <Form.Select
          value={selectedSize}
          onChange={(e) => {
            setSelectedSize(e.target.value);
            setCurrentPage(1);
          }}
          style={{ maxWidth: "200px" }}
        >
          <option value="">-- Chọn size --</option>
          <option value="D">D</option>
          <option value="A khuyết">A khuyết</option>
        </Form.Select>

        <Form.Select
          value={selectedColor}
          onChange={(e) => {
            setSelectedColor(e.target.value);
            setCurrentPage(1);
          }}
          style={{ maxWidth: "200px" }}
        >
          <option value="">-- Chọn màu --</option>
          <option value="Trắng">Trắng</option>
          <option value="Đen">Đen</option>
          <option value="Xanh">Xanh</option>
          <option value="Đỏ">Đỏ</option>
        </Form.Select>
      </div>

      {/* Products grid */}
      <div className="row g-4">
      {currentProducts.length > 0 ? (
  currentProducts.map((product, index) => (
    <motion.div
      key={product.id}
      className="col-md-3 col-sm-6"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }} // ✅ chỉ animate khi scroll tới
      viewport={{ once: true, amount: 0.2 }} // chỉ chạy 1 lần, 20% element vào view
      transition={{ duration: 0.6, delay: index * 0.1 }}
      whileHover={{ scale: 1.05 }}
    >
      <Card className="shadow-sm rounded-4 border-0 h-100">
        <motion.div whileHover={{ scale: 1.1 }}>
          <Card.Img
            variant="top"
            src={`${WEB_URL}/uploads/${product.image}`}
            alt={product.name}
            style={{
              height: "300px",
              objectFit: "cover",
              borderTopLeftRadius: "1rem",
              borderTopRightRadius: "1rem",
            }}
          />
        </motion.div>
        <Card.Body className="d-flex flex-column">
          <Card.Title className="fw-bold">{product.name}</Card.Title>
          <Card.Text className="text-muted flex-grow-1">
            {product.description?.slice(0, 60)}...
          </Card.Text>
          <h5 style={{ fontSize: "16px",
              fontWeight: 700,
              background: "linear-gradient(90deg,#ff512f,#dd2476)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",}} className="text-danger fw-bold mb-3">
            {Number(product.price).toLocaleString("vi-VN")} đ
          </h5>
                  <motion.button
                                            className="add-to-cart-button"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                          >
                                            <Link to={`/product/${product.slug}`}>🛒 Mua ngay</Link>
                                          </motion.button>
        </Card.Body>
      </Card>
    </motion.div>
  ))
) : (
  <p className="text-center text-muted">Không tìm thấy sản phẩm</p>
)}

      </div>

      {/* Pagination */}
     {totalPages > 1 && (
  <div className="d-flex justify-content-center mt-4">
    <Pagination className="shadow-sm rounded">
      {/* Nút Previous */}
      <Pagination.Prev
        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      />
      
      {/* Các số trang */}
      {[...Array(totalPages).keys()].map((num) => (
        <Pagination.Item
          key={num + 1}
          active={num + 1 === currentPage}
          onClick={() => setCurrentPage(num + 1)}
          style={{
            minWidth: "40px",
            textAlign: "center",
            margin: "0 3px",
            borderRadius: "50%",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
          className="bg-light border-0"
        >
          {num + 1}
        </Pagination.Item>
      ))}

      {/* Nút Next */}
      <Pagination.Next
        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
      />
    </Pagination>
  </div>
)}

    </div>
  );
}

export default HomeHero;
