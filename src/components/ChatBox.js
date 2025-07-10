import React, { useEffect, useState, useRef, useCallback } from "react";
import io from "socket.io-client";
import { Button, Card, Form, InputGroup, Badge, Modal } from "react-bootstrap";
import { BsChatDotsFill } from "react-icons/bs";
import { MdHorizontalRule } from "react-icons/md";
import logoAdmin from "../img/logoadmin.png";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";
const API_URL = process.env.REACT_APP_API_URL;

const ChatBox = ({ userId }) => {
  const { addToCart } = useCart();

  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [addedProduct, setAddedProduct] = useState(null);
  const socketRef = useRef();
  const chatBoxRef = useRef();

  useEffect(() => {
    if (!userId) return;

    const socket = io("https://finlyapi-production.up.railway.app", {
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socketRef.current.on("connect", () => {
      socketRef.current.emit("register", userId.toString());
    });

    socketRef.current
      .off("receive_private_message")
      .on("receive_private_message", (data) => {
        setChat((prev) => [...prev, data]);

        if (!isOpen) {
          setHasNewMessage(true);
          setPopupMessage(data.content);
          setShowPopup(true);
          setTimeout(() => setShowPopup(false), 5000);
        }
      });

    socket.on("update_online_users", (users) => {
      setOnlineUsers(users);
    });

    fetch(`${API_URL}/chat/conversation/${userId}`)
      .then((res) => res.json())
      .then((data) => setChat(data))
      .catch(console.error);

    return () => {
      socket.disconnect();
    };
  }, [userId]);

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chat]);

  const toggleChatBox = () => {
    setIsOpen((prev) => {
      if (!prev) {
        setHasNewMessage(false);
        setShowPopup(false);
      }
      return !prev;
    });
  };

  // const sendMessage = useCallback(() => {
  //   const trimmed = message.trim();
  //   if (!trimmed || !socketRef.current) return;

  //   const data = {
  //     sender: userId,
  //     receiver: "admin",
  //     content: trimmed,
  //     timestamp: Date.now(),
  //   };

  //   socketRef.current.emit("send_private_message", data, (ack) => {
  //     if (ack?.success) {
  //       setMessage(""); // ❌ Không push vào state ở đây
  //     } else {
  //       console.error("Gửi tin nhắn thất bại:", ack?.error);
  //     }
  //   });
  // }, [message, userId]);
  const handleSend = async () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("sender", userId);

      try {
        const res = await fetch(`${API_URL}/chat/upload-image`, {
          method: "POST",
          body: formData,
        });
        const result = await res.json();

        if (result.success) {
          setMessage("");
          setSelectedImage(null);
          // KHÔNG emit lại - server đã gửi rồi
        }
      } catch (err) {
        console.error("Lỗi gửi ảnh:", err);
      }
    } else if (message.trim()) {
      const data = {
        sender: userId,
        receiver: "admin",
        content: message.trim(),
        timestamp: Date.now(),
      };

      socketRef.current.emit("send_private_message", data, (ack) => {
        if (ack?.success) {
          setMessage("");
        } else {
          console.error("Gửi tin nhắn thất bại:", ack?.error);
        }
      });
    }
  };
  // chọn size
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const handleBuyProduct = (product) => {
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0] || "");
    setSelectedColor(product.colors[0] || "");
    setShowBuyModal(true);
  };

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  function formatMessage(content) {
    // Tự động phát hiện URL và tạo thẻ <a> có màu xanh
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const linkedText = content.replace(
      urlRegex,
      (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: #007bff; text-decoration: underline;">${url}</a>`
    );

    // Đổi xuống dòng nếu có \n
    return linkedText.replace(/\n/g, "<br/>");
  }
  //kh gửi ảnh
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file); // chỉ lưu vào state
    }
  };

  return (
    <>
      {/* Nút mở chat */}
      {!isOpen && (
        <Button
          variant="primary"
          onClick={toggleChatBox}
          style={{
            position: "fixed",
            bottom: 115,
            right: 51,
            borderRadius: "50%",
            width: 60,
            height: 60,
            boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
            zIndex: 10001,
          }}
        >
          <BsChatDotsFill size={28} />
          {onlineUsers.includes("admin") && (
            <Badge
              bg="success"
              pill
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 14,
                height: 14,
              }}
            />
          )}
          {hasNewMessage && (
            <Badge
              bg="danger"
              pill
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 14,
                height: 14,
                border: "2px solid white",
              }}
            />
          )}
        </Button>
      )}

      {/* Popup thông báo */}
      {showPopup && (
        <div
          onClick={toggleChatBox}
          style={{
            position: "fixed",
            top: 90,
            right: 20,
            width: 260,
            padding: "10px 14px",
            backgroundColor: "#007bff",
            color: "white",
            borderRadius: 8,
            cursor: "pointer",
            zIndex: 10002,
            fontWeight: 600,
          }}
        >
          Tin nhắn mới: {popupMessage}
        </div>
      )}

      {/* Hộp chat */}
      {isOpen && (
        <Card
          style={{
            position: "fixed",
            bottom: 20,
            right: 20,
            width: 320,
            height: 420,
            zIndex: 10000,
            display: "flex",
            flexDirection: "column",
            borderRadius: "12px",
            boxShadow: "0 6px 20px rgba(0,0,0,0.25)",
          }}
        >
          <Card.Header
            className="d-flex justify-content-between align-items-center"
            style={{ backgroundColor: "#007bff", color: "white" }}
          >
            💬 Chat với shop
            <Button variant="light" size="sm" onClick={toggleChatBox}>
              <MdHorizontalRule />
            </Button>
          </Card.Header>

          <div
            style={{
              backgroundColor: "#e9f7ef",
              padding: "8px 12px",
              fontWeight: 500,
              color: "#2f855a",
            }}
          >
            Xin chào! Bạn cần hỗ trợ gì hôm nay?
          </div>

          <Card.Body
            ref={chatBoxRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "10px",
              backgroundColor: "#f0f2f5",
            }}
          >
            {chat.length === 0 ? (
              <div className="text-center text-muted mt-4">
                Chưa có tin nhắn nào
              </div>
            ) : (
              chat?.map((msg, i) => (
                <div
                  key={i}
                  className={`d-flex mb-3 ${
                    msg.sender?.toString() === userId?.toString()
                      ? "justify-content-end"
                      : "justify-content-start"
                  }`}
                >
                  {msg.sender !== userId && (
                    <img
                      src={logoAdmin}
                      alt="Admin"
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        marginRight: 8,
                      }}
                    />
                  )}
                  <div
                    style={{
                      backgroundColor:
                        msg.sender?.toString() === userId?.toString()
                          ? "#d1e7dd"
                          : "#e2e3e5",
                      padding: "10px 14px",
                      borderRadius: 20,
                      maxWidth: "75%",
                      boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
                    }}
                    title={formatTime(msg.timestamp)}
                  >
                    <div
                      dangerouslySetInnerHTML={{
                        __html: formatMessage(msg.content),
                      }}
                    />
                    <div
                      style={{
                        fontSize: "0.65rem",
                        color: "#555",
                        textAlign: "right",
                        marginTop: 4,
                      }}
                    >
                      {formatTime(msg.timestamp)}
                    </div>
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Product"
                        style={{
                          width: "50%",
                          borderRadius: "10px",
                          marginTop: "5px",
                        }}
                      />
                    )}
                    {msg.product && (
                      <div className="mt-2 text-end">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleBuyProduct(msg.product)}
                        >
                          🛒 Mua ngay
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </Card.Body>

          <Card.Footer style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
            {selectedImage && (
              <div style={{ paddingTop: 6 }}>
                <img
                  src={URL.createObjectURL(selectedImage)}
                  alt="preview"
                  style={{ width: "20%", borderRadius: 5 }}
                />
              </div>
            )}
            <InputGroup>
              <Form.Control
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSend();
                  }
                }}
              />
              <Button
                variant="outline-secondary"
                onClick={() =>
                  document.getElementById("chatImageInput").click()
                }
              >
                📎
              </Button>
              <Form.Control
                type="file"
                accept="image/*"
                id="chatImageInput"
                style={{ display: "none" }}
                onChange={handleImageChange} // ✅ Lưu vào state để chờ ấn nút Gửi
              />
              <Button
                onClick={handleSend}
                disabled={!message.trim() && !selectedImage}
              >
                Gửi
              </Button>
            </InputGroup>
          </Card.Footer>
        </Card>
      )}
      <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Chọn size và màu</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Size:</Form.Label>
            <Form.Select
              value={selectedSize}
              onChange={(e) => setSelectedSize(e.target.value)}
            >
              {selectedProduct?.sizes.map((size, i) => (
                <option key={i} value={size}>
                  {size}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mt-3">
            <Form.Label>Màu:</Form.Label>
            <Form.Select
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
            >
              {selectedProduct?.colors.map((color, i) => (
                <option key={i} value={color}>
                  {color}
                </option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="success"
            onClick={() => {
              // 👉 Thêm vào giỏ hàng ở đây
              const cartItem = {
                productId: selectedProduct.id,
                name: selectedProduct.name,
                size: selectedSize,
                color: selectedColor,
                price: selectedProduct.price,
                quantity: 1,
                image: selectedProduct.image,
              };
              // Ví dụ: localStorage
              addToCart(cartItem);
              setAddedProduct(cartItem);
              // Hiển thị thông báo
              setShowNotification(true);

              // // Tắt thông báo sau 3 giây
              setTimeout(() => {
                setShowNotification(false);
              }, 3000);
              setShowBuyModal(false);
            }}
          >
            Thêm vào giỏ
          </Button>
        </Modal.Footer>
      </Modal>
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
                src={`https://finlyapi-production.up.railway.app/uploads/${addedProduct.image}`}
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
    </>
  );
};

export default ChatBox;
