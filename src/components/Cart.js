import React, { useState, useEffect } from "react";
import { Container, Row, Col, Image, Button, Form } from "react-bootstrap";
import { BsTrash } from "react-icons/bs";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { MdOutlineLocalShipping } from "react-icons/md";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState(null);
  const [isHiding, setIsHiding] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [showFreeShip, setshowFreeShip] = useState(false);
  const { removeItem } = useCart();
  const allSelected =
    selectedItems.length === cartItems.length && cartItems.length > 0;
  useEffect(() => {
    // Load cart data from localStorage when the component mounts
    const stored = localStorage.getItem("cart");
    let storedCart = [];

    try {
      storedCart = JSON.parse(stored);
      if (!Array.isArray(storedCart)) storedCart = [];
    } catch (err) {
      storedCart = [];
    }

    const totalQuantity = storedCart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
    setshowFreeShip(totalQuantity >= 2);

    setCartItems(storedCart);
  }, []);

  const calculateTotalPrice = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.slug))
      .reduce((total, item) => {
        const price = Number(item.price);
        const quantity = item.quantity;
        let finalItemPrice = price;

        // Tính giá sau giảm nếu có discount
        if (item.discount_type === "percent") {
          finalItemPrice = price * (1 - Number(item.discount_value) / 100);
        } else if (item.discount_type === "fixed") {
          finalItemPrice = price - Number(item.discount_value);
        }

        // Đảm bảo không âm giá
        finalItemPrice = Math.max(0, finalItemPrice);

        return total + finalItemPrice * quantity;
      }, 0);
  };

  const totalPrice = calculateTotalPrice();
  const discount = 0; // vẫn giữ nguyên logic giảm giá
  const finalPrice = totalPrice - discount;

  // xóa item
  const handleRemoveItem = (itemId) => {
    const index = cartItems.findIndex((item) => item.slug === itemId);
    if (index !== -1) {
      const updatedCart = [...cartItems];
      updatedCart.splice(index, 1); // Xóa đúng 1 item tại vị trí index
      setCartItems(updatedCart);
      //   localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
    removeItem(itemId);
  };
  const handleQuantityChange = (itemId, newQuantity) => {
    const updatedCart = cartItems?.map((item) =>
      item.slug === itemId
        ? { ...item, quantity: Math.max(1, parseInt(newQuantity)) }
        : item
    );
    setCartItems(updatedCart);
    localStorage.setItem("cart", JSON.stringify(updatedCart));
  };

  // select all cart
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = cartItems?.map((item) => item.slug);
      setSelectedItems(allIds);
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (slug) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(slug)
        ? prevSelected.filter((id) => id !== slug)
        : [...prevSelected, slug]
    );
  };
  // order
  const navigate = useNavigate();
  const handleOrder = () => {
    // Lọc sản phẩm đã chọn
    const selectedProducts = cartItems.filter((item) =>
      selectedItems.includes(item.slug)
    );

    // Lưu sản phẩm đã chọn vào localStorage cho trang order
    localStorage.setItem("order", JSON.stringify(selectedProducts));

    // Lọc lại giỏ hàng còn những sản phẩm chưa được chọn
    const remainingCartItems = cartItems.filter(
      (item) => !selectedItems.includes(item.slug)
    );

    // Cập nhật localStorage và state
    localStorage.setItem("cart", JSON.stringify(remainingCartItems));
    setCartItems(remainingCartItems);

    // Chuyển hướng sang trang đặt hàng
    navigate("/order");
  };

  return (
    <div style={{ marginTop: "90px", height: "900px" }}>
      <Container className="mt-4">
        <div
          style={{ width: "100%" }}
          className="d-flex justify-content-center"
        >
          <h2 style={{ fontSize: "26px" }} className="mb-4">
            Giỏ hàng
          </h2>
        </div>
        <Row>
          <Col md={8} xs={12}>
            <div
              className="border rounded p-3 mb-3 hide-scrollbar"
              style={{ maxHeight: "820px", overflowY: "auto" }}
            >
              <div className="d-flex align-items-center mb-3">
                <input
                  type="checkbox"
                  className="me-2"
                  checked={allSelected}
                  onChange={handleSelectAll}
                />
                <h6 className="mb-0">Chọn tất cả</h6>
              </div>
              {cartItems?.map((item) => (
                <div
                  key={item.slug}
                  className="d-flex align-items-center mb-3 border-bottom pb-3"
                >
                  <Row>
                    <Col md={1} xs={1}>
                      <input
                        type="checkbox"
                        className="me-2"
                        checked={selectedItems.includes(item.slug)}
                        onChange={() => handleSelectItem(item.slug)}
                      />
                    </Col>
                    <Col md={3} xs={4}>
                      {item.image && (
                        <Image
                          src={`https://your-api.up.railway.app/uploads/${item.image}`}
                          alt={item.name}
                          className="rounded cart__img"
                        />
                      )}
                    </Col>
                    <Col md={8} xs={7}>
                      <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ height: "100%", flexDirection: "column" }}
                      >
                        <div
                          style={{ width: "100%" }}
                          className="justify-content-center"
                        >
                          <Row>
                            <Col xs={10}>
                              {" "}
                              <h6 style={{}} className="mb-1 cart__name">
                                {item.name}
                              </h6>{" "}
                              <div
                                className="d-flex justify-content-center align-items-center cart__size"
                                style={{}}
                              >
                                {item.size} , {item.color}
                              </div>
                            </Col>
                            <Col xs={2}>
                              <Button
                                style={{
                                  color: "red",
                                  background: "transparent",
                                  border: "none",
                                }}
                                size="sm"
                                className="ms-auto d-flex"
                                onClick={() => {
                                  setSelectedSlug(item.slug);
                                  setShowConfirm(true);
                                }}
                              >
                                <BsTrash size={18} />
                              </Button>
                            </Col>
                          </Row>
                        </div>
                        <div
                          style={{ width: "100%" }}
                          className="cart__bottom "
                        >
                          <div className="quantity-selector">
                            <div className="quantity-controlsrp quantity-controls">
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.slug,
                                    Math.max(1, item.quantity - 1)
                                  )
                                }
                              >
                                -
                              </button>
                              <Form.Control
                                type="number"
                                value={item.quantity}
                                readOnly // Make it read-only as the buttons control the value
                                min="1"
                                onChange={(e) =>
                                  handleQuantityChange(
                                    item.slug,
                                    e.target.value
                                  )
                                }
                              />
                              <button
                                onClick={() =>
                                  handleQuantityChange(
                                    item.slug,
                                    item.quantity + 1
                                  )
                                }
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div>
                            <p
                              style={{
                                color: "black",
                                fontSize: "17px",
                                fontWeight: "700",
                              }}
                              className=""
                            >
                              {Number(item.price).toLocaleString("vi-VN")} đ
                            </p>
                            {item.discount_value && (
                              <span className="text-danger">
                                -
                                {item.discount_type === "percent"
                                  ? `${parseFloat(item.discount_value)}%`
                                  : `${Number(
                                      item.discount_value
                                    ).toLocaleString("vi-VN")}đ`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
              {cartItems.length === 0 && <p>Giỏ hàng của bạn đang trống.</p>}
            </div>
          </Col>
          <Col md={4}>
            <div className="border rounded p-3">
              <h6 className="mb-3">Chi tiết đơn hàng</h6>
              <div className="d-flex justify-content-between mb-2">
                <span>Tổng tiền:</span>
                <span>{totalPrice?.toLocaleString()}đ</span>
              </div>
              <hr />
              <div className="d-flex justify-content-between mb-3">
                <span className="fw-bold">Thành tiền:</span>
                <span className="fw-bold text-danger">
                  {finalPrice?.toLocaleString()}đ
                </span>
              </div>
              {showFreeShip ? (
                <div className="p-2 mb-3">
                  <MdOutlineLocalShipping
                    size={20}
                    style={{ marginRight: "5px", color: "green" }}
                  />
                  Đơn được miễn phí vận chuyển !
                </div>
              ) : (
                <div className="p-2 mb-3 text-muted">
                  <MdOutlineLocalShipping
                    size={20}
                    style={{ marginRight: "5px", color: "gray" }}
                  />
                  Phí vận chuyển 20.000đ
                </div>
              )}
              <Button
                variant="warning"
                className="w-100"
                disabled={selectedItems.length === 0}
                onClick={handleOrder}
              >
                Đặt hàng <i className="bi bi-arrow-right"></i>
              </Button>
            </div>
          </Col>
        </Row>
        {showConfirm && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 99999999999999,
            }}
          >
            <div
              className={`confirm-popup ${isHiding ? "hidden" : ""}`}
              style={{
                background: "white",
                borderRadius: "8px",
                textAlign: "center",
                minWidth: "420px",
              }}
            >
              <div
                style={{ borderBottom: "1px solid #cdc0c0", padding: "16px" }}
                className="d-flex justify-content-between align-items-center"
              >
                <h6 style={{ fontSize: "18px" }}>Xóa sản phẩm</h6>
                <Button
                  style={{
                    color: "black",
                    background: "transparent",
                    border: "none",
                  }}
                  onClick={() => {
                    setIsHiding(true);
                    setTimeout(() => {
                      setShowConfirm(false);
                      setIsHiding(false);
                    }, 300);
                  }}
                >
                  <IoIosCloseCircleOutline size={35} />
                </Button>
              </div>
              <div
                style={{ borderBottom: "1px solid #cdc0c0", padding: "16px" }}
              >
                <BsTrash size={45} style={{ color: "red", margin: "5px 0" }} />
                <p>Bạn có chắc chắn muốn xóa sản phẩm này không?</p>
              </div>
              <div style={{ padding: "16px" }}>
                <Row
                  style={{
                    marginTop: "20px",
                    display: "flex",
                    justifyContent: "space-around",
                  }}
                >
                  <Col>
                    {" "}
                    <Button
                      className="delete_off"
                      onClick={() => {
                        setIsHiding(true);
                        setTimeout(() => {
                          setShowConfirm(false);
                          setIsHiding(false);
                        }, 300);
                      }}
                    >
                      Không
                    </Button>
                  </Col>
                  <Col>
                    {" "}
                    <Button
                      className="delete_ok"
                      variant="danger"
                      onClick={() => {
                        handleRemoveItem(selectedSlug);
                        setShowConfirm(false);
                      }}
                    >
                      Xóa
                    </Button>
                  </Col>
                </Row>
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  );
};

export default Cart;
