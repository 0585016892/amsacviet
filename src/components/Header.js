import React, { useState, useEffect } from "react";
import { Row, Col, Form, Button, Navbar,Card,Badge } from "react-bootstrap";
import { FaSearch, FaBars } from "react-icons/fa";
import Logo from "../img/logo.png";
import a from "../img/1.webp";
import { IoMdClose, IoIosArrowDown, IoIosLogIn } from "react-icons/io";
import { GoArrowUpRight } from "react-icons/go";
import { FaHouseChimney } from "react-icons/fa6";
import { CiShoppingCart, CiUser } from "react-icons/ci";
import { Link, useLocation } from "react-router-dom";
import { FaBlog } from "react-icons/fa";
import categoryService from "../api/danhmucWebApi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const { user } = useAuth();
  const { totalItems } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      if (offset > 0) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Lắng nghe sự thay đổi của location (URL)
  useEffect(() => {
    // Khi URL thay đổi, đóng menu
    setIsMenuOpen(false);
  }, [location]); // Mỗi khi location thay đổi, chạy lại useEffect

  // Toggle menu khi click vào button
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  const [categoryData, setCategoryData] = useState([]);
  const [collections, setCollectionsData] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await categoryService.getCategories();
        setCategoryData(data);
      } catch (error) {
      }
    };

    fetchCategories();
  }, []);
   useEffect(() => {
    const  fetchCollections = async () => {
      try {
        const data = await categoryService.getCollection();
        setCollectionsData(data.data);
      } catch (error) {
      }
    };

     fetchCollections();
   }, []);
  
  // tìm kiếm
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(keyword.trim())}`);
    }
  };
  const [cartCount, setCartCount] = useState(0);

  const updateCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    setCartCount(cart.length);
  };
    const categoryVariants = {
      hidden: { opacity: 0, y: 20 },
      visible: (i) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.3 }
      })
    };

  useEffect(() => {
    updateCartCount(); // load ban đầu

    // lắng nghe sự kiện cartUpdated
    window.addEventListener("cartUpdated", updateCartCount);

    // cleanup khi unmount
    return () => {
      window.removeEventListener("cartUpdated", updateCartCount);
    };
  }, []);

  return (
    <div>
      {!isMenuOpen && (
        <div
          style={{
            position: "fixed",
            left: "0",
            top: "0",
            zIndex: "9999999999",
            width: "100%",
          }}
        >
          <Navbar
            bg=""
            expand="lg"
            className={`py-3 ${scrolled ? "bg-white shadow-sm" : ""}`}
            style={{
              transition: "all 0.3s ease", // để chuyển mượt
              backgroundColor: scrolled ? "white" : "transparent",
            }}
          >
            <div className="container-fluid">
              <Row className="w-100 align-items-center">
                <Col md={6} xs={4} className="d-flex justify-content-start">
                  <FaBars
                    size={24}
                    onClick={toggleMenu}
                    style={{ cursor: "pointer" }}
                  />
                </Col>
                <Col md={3} xs={4} className="text-left">
                  <Navbar.Brand href="/">
                    <img src={Logo} height={70} alt="" />
                  </Navbar.Brand>
                </Col>

                <Col md={3} xs={4} className="d-flex justify-content-end">
                  <div className="search-form d-none d-md-block">
                    <Form.Control
                      type="search"
                      placeholder="Tìm kiếm"
                      className="me-2 rounded-lg search "
                      onClick={toggleMenu}
                    />
                    <span>
                      <FaSearch size={20} />
                    </span>
                  </div>
                  <Button
                    className="cart-btn"
                    variant="light"
                    style={{
                      position: "relative",
                      border: "none",
                      background: "transparent",
                    }}
                  >
                    <a
                      href="/cart"
                      style={{
                        position: "relative",
                        display: "inline-block",
                      }}
                    >
                      <CiShoppingCart size={25} style={{ color: "black" }} />
                      {totalItems > 0 && (
                        <span className="total__cart">{totalItems}</span>
                      )}
                    </a>
                  </Button>
                  {user ? (
                    <Button
                      className="cart-btn"
                      variant="light"
                      style={{
                        position: "relative",
                        border: "none",
                        background: "transparent",
                      }}
                    >
                      <a
                        href="/profile"
                        style={{
                          position: "relative",
                          display: "inline-block",
                        }}
                      >
                        <CiUser size={25} style={{ color: "black" }} />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      variant=""
                      href="/login"
                      style={{
                        borderRadius: "20px",
                        fontWeight: "bold",
                        padding: "5px ",
                      }}
                    >
                      <IoIosLogIn size={25} style={{ color: "black" }} />
                    </Button>
                  )}
                </Col>
              </Row>
            </div>
          </Navbar>
        </div>
      )}
       {isMenuOpen && (
        <div className="">
          <div
              className="menu-overlay slide-down"
            style={{
              position: "fixed",
              top: "0", // Điều chỉnh cho phù hợp với chiều cao của Navbar
              left: "0",
              width: "100%",
              maxHeight: "95%",
              height: "100%", // Hoặc một chiều cao cố định tùy ý
              backgroundColor: "white",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
              zIndex: "9999999998", // Đảm bảo ở dưới header nhưng trên các nội dung khác
              padding: "20px",
            }}
          >
            <div className="menu-overlay__icon">
              <div className="menu_header d-flex justify-content-between">
                <div className="logo">
                  <img src={Logo} height={35} alt="" />
                </div>
                <div className="search-form" style={{ width: "50%" }}>
                  <form
                    className="search-form d-flex align-items-center"
                    onSubmit={handleSearch}
                  >
                    <Form.Control
                      type="search"
                      placeholder="Tìm kiếm"
                      className="me-2 rounded-lg search"
                      value={keyword}
                      onChange={(e) => setKeyword(e.target.value)}
                    />
                    <button
                      type="submit"
                      style={{ background: "none", border: "none" }}
                    >
                      <FaSearch size={20} />
                    </button>
                  </form>
                </div>
                <Button
                  className="cart-btn "
                  variant="light"
                  style={{
                    position: "relative",
                    border: "none",
                    background: "transparent",
                  }}
                >
                  <a
                    href="/cart"
                    style={{
                      position: "relative",
                      display: "inline-block",
                    }}
                  >
                    <CiShoppingCart size={25} style={{ color: "black" }} />
                    {cartCount > 0 && (
                      <span className="total__cart">{cartCount}</span>
                    )}
                  </a>
                </Button>
              </div>
            </div>
            {/* Nội dung menu của bạn sẽ được đặt ở đây */}
            <div className="m-md-4 m-5">
              <div className="category_blog d-none d-md-flex justify-content-center gap-4">
                <a
                  href="/he-thong-cua-hang"
                  className="d-flex align-items-center gap-2 justify-content-center"
                >
                  <p>CỬA HÀNG</p>
                  <FaHouseChimney size={25} />
                </a>
                <a
                  href="/blog"
                  className="d-flex align-items-center gap-2 justify-content-center"
                >
                  <p>TIN TỨC</p>
                  <FaBlog size={25} />
                </a>
              </div>
              <Row>
                  <Col md={9} className="d-flex" >

                {categoryData?.map((categoryItem) => (
                  <div key={categoryItem.id}>
                    <div className="d-flex align-items-center">
                      <h3 style={{ margin: "0 10px" }}>{categoryItem.name}</h3>
                      <GoArrowUpRight size={25} />
                    </div>
                    <motion.ul
                      initial="hidden"
                      animate="visible"
                      className="category-list">
                      {categoryItem.dmCon?.map((subCategory) => (
                        <motion.li  variants={categoryVariants} key={subCategory.child_id}>
                          <div className="d-flex justify-content-between">
                            <div className="category_item d-flex align-items-center justify-content-center">
                              {/* Hiển thị ảnh nếu có */}
                              {subCategory.child_img && (
                                <img
                                  src={a}
                                  height={45}
                                  alt={subCategory.child_name}
                                />
                              )}
                              <Link to={`/category/${subCategory.child_slug}`}>
                                {subCategory.child_name}
                              </Link>
                            </div>
                            {/* Thêm điều kiện để hiển thị icon IoIosArrowDown nếu cần */}
                            {subCategory.hasSubmenu && (
                              <div>
                                <IoIosArrowDown />
                              </div>
                            )}
                          </div>
                        </motion.li>
                      ))}
                    </motion.ul>
                    </div>
                ))}
                  </Col>
                  
                <Col md={3}>
                  {Array.isArray(collections) && collections.length > 0 ? (
                      collections.map((col) => (
                        <Col md={12} key={col.id} className="mb-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}     // bắt đầu mờ và trượt xuống
        animate={{ opacity: 1, y: 0 }}      // hiện rõ và về đúng vị trí
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{ scale: 1.03 }}        // khi hover thì phóng to nhẹ
      >
        <Card className="border-0 shadow-sm h-90">
          <Card.Img
            variant="top"
            src={
              col.image?.startsWith("http")
                ? col.image
                : `${process.env.REACT_APP_WEB_URL}/uploads/${col.image}`
            }
            style={{ height: "200px", objectFit: "cover" }}
          />
          <Card.Body>
            <div className="d-flex justify-content-between align-items-center mb-2">
              <Card.Title className="mb-0 fs-5">{col.name}</Card.Title>
            </div>
            <Card.Text className="text-muted" style={{ minHeight: "60px" }}>
              {col.description?.slice(0, 100)}...
            </Card.Text>
          </Card.Body>
        </Card>
      </motion.div>
    </Col>
                      ))
                    ) : (
                      <p></p>
                    )}
                 
                </Col>
              </Row>
            </div>
            <div
              className="d-flex justify-content-center position-absolute btn_close_ac"
              style={{ width: "100%", bottom: "-50px" }}
            >
              <Button
                onClick={toggleMenu}
                className=" d-flex align-items-center m-1 btn_close"
                style={{ background: "rgb(248 251 26)" }}
              >
                <IoMdClose className="m-1" />
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Header;
