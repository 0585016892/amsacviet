import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { Button, Card, Form, InputGroup, Badge, Modal, Image } from "react-bootstrap";
import { BsChatDotsFill, BsSendFill, BsPaperclip, BsXCircleFill } from "react-icons/bs";
import { MdClose, MdMinimize } from "react-icons/md";
import logoAdmin from "../img/logoadmin.png";
import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

const API_URL = process.env.REACT_APP_API_URL;
const WEB_URL = process.env.REACT_APP_WEB_URL;

const ChatBox = ({ userId }) => {
  const { addToCart } = useCart();

  // --- GIỮ NGUYÊN STATES ---
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

  // --- GIỮ NGUYÊN LOGIC SOCKET & FETCH ---
  useEffect(() => {
    if (!userId) return;
    const socket = io(`${WEB_URL}`, { transports: ["websocket"] });
    socketRef.current = socket;

    socketRef.current.on("connect", () => {
      socketRef.current.emit("register", userId.toString());
    });

    socketRef.current.off("receive_private_message").on("receive_private_message", (data) => {
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

    return () => { socket.disconnect(); };
  }, [userId, isOpen]);

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

  const handleSend = async () => {
    if (selectedImage) {
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("sender", userId);
      try {
        const res = await fetch(`${API_URL}/chat/upload-image`, { method: "POST", body: formData });
        const result = await res.json();
        if (result.success) {
          setMessage("");
          setSelectedImage(null);
        }
      } catch (err) { console.error("Lỗi gửi ảnh:", err); }
    } else if (message.trim()) {
      const data = {
        sender: userId,
        receiver: "admin",
        content: message.trim(),
        timestamp: Date.now(),
      };
      socketRef.current.emit("send_private_message", data, (ack) => {
        if (ack?.success) { setMessage(""); }
      });
    }
  };

  // --- LOGIC MUA HÀNG ---
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

  const formatMessage = (content) => {
    if (typeof content !== "string") return "";
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const linkedText = content.replace(urlRegex, (url) =>
      `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color: inherit; text-decoration: underline;">${url}</a>`
    );
    return linkedText.replace(/\n/g, "<br/>");
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setSelectedImage(file);
  };

  return (
    <>
      {/* Nút Floating Chat */}
      {!isOpen && (
        <div className="chat-launcher" onClick={toggleChatBox}>
          <div className={`launcher-icon ${hasNewMessage ? 'pulse' : ''}`}>
            <BsChatDotsFill size={28} />
          </div>
          {onlineUsers.includes("admin") && <span className="online-indicator"></span>}
          {hasNewMessage && <Badge bg="danger" pill className="new-msg-badge">!</Badge>}
        </div>
      )}

      {/* Popup thông báo tin nhắn mới */}
      {showPopup && (
        <div className="chat-popup-notify" onClick={toggleChatBox}>
          <div className="d-flex align-items-center">
            <Image src={logoAdmin} roundedCircle width={30} height={30} className="me-2" />
            <div className="text-truncate" style={{ maxWidth: '180px' }}>
              <strong className="d-block small">Shop Support</strong>
              <span className="extra-small">{popupMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Hộp thoại Chat chính */}
      {isOpen && (
        <Card className="chat-window shadow-lg border-0">
          <Card.Header className="chat-header d-flex justify-content-between align-items-center bg-primary text-white border-0">
            <div className="d-flex align-items-center">
               <div className="position-relative">
                  <Image src={logoAdmin} roundedCircle width={35} height={35} className="border border-white" />
                  {onlineUsers.includes("admin") && <span className="header-online-dot"></span>}
               </div>
               <div className="ms-2">
                  <h6 className="mb-0 fw-bold" style={{ fontSize: '0.9rem' }}>Shop Support</h6>
                  <small className="extra-small opacity-75">
                    {onlineUsers.includes("admin") ? "Đang hoạt động" : "Ngoại tuyến"}
                  </small>
               </div>
            </div>
            <div className="header-actions">
              <MdMinimize className="me-2 action-icon" onClick={toggleChatBox} />
              <MdClose className="action-icon" onClick={toggleChatBox} />
            </div>
          </Card.Header>

          <Card.Body ref={chatBoxRef} className="chat-body scrollbar-styled">
            <div className="chat-welcome-msg">
              <p>Chào bạn! Shop có thể giúp gì cho bạn?</p>
            </div>

            {chat.length === 0 ? (
              <div className="text-center text-muted my-4 extra-small">Bắt đầu cuộc trò chuyện...</div>
            ) : (
              chat.map((msg, i) => {
                const isMe = msg.sender?.toString() === userId?.toString();
                return (
                  <div key={i} className={`chat-bubble-container ${isMe ? 'me' : 'them'}`}>
                    {!isMe && <Image src={logoAdmin} roundedCircle className="bubble-avatar" />}
                    <div className="bubble-content">
                      <div className="bubble-text shadow-sm">
                        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg?.content) }} />
                        {msg.image && (
                          <Image src={msg.image} className="mt-2 rounded chat-img-content" fluid />
                        )}
                        {msg.product && (
                          <div className="chat-product-card mt-2 p-2 rounded bg-white border">
                            <div className="small fw-bold text-dark text-truncate">{msg.product.name}</div>
                            <Button size="sm" variant="primary" className="w-100 mt-1 py-0 extra-small" onClick={() => handleBuyProduct(msg.product)}>
                              🛒 Mua ngay
                            </Button>
                          </div>
                        )}
                      </div>
                      <span className="bubble-time">{formatTime(msg.timestamp)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </Card.Body>

          <Card.Footer className="chat-footer bg-white border-top">
            {selectedImage && (
              <div className="image-preview-container">
                <Image src={URL.createObjectURL(selectedImage)} className="preview-img" />
                <BsXCircleFill className="remove-img-icon" onClick={() => setSelectedImage(null)} />
              </div>
            )}
            <InputGroup className="chat-input-group">
              <Button variant="link" className="text-muted p-1" onClick={() => document.getElementById("chatImageInput").click()}>
                <BsPaperclip size={20} />
              </Button>
              <Form.Control
                className="border-0 shadow-none no-resize"
                placeholder="Nhập tin nhắn..."
                rows={1}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleSend(); } }}
              />
              <Form.Control type="file" accept="image/*" id="chatImageInput" style={{ display: "none" }} onChange={handleImageChange} />
              <Button variant="link" className="text-primary p-1" disabled={!message.trim() && !selectedImage} onClick={handleSend}>
                <BsSendFill size={20} />
              </Button>
            </InputGroup>
          </Card.Footer>
        </Card>
      )}

      {/* --- GIỮ NGUYÊN MODAL VÀ NOTIFICATION --- */}
      <Modal show={showBuyModal} onHide={() => setShowBuyModal(false)} centered size="sm">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fs-6 fw-bold">Tùy chọn sản phẩm</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-2">
            <Form.Label className="extra-small fw-bold">Size:</Form.Label>
            <Form.Select size="sm" value={selectedSize} onChange={(e) => setSelectedSize(e.target.value)}>
              {selectedProduct?.sizes.map((size, i) => <option key={i} value={size}>{size}</option>)}
            </Form.Select>
          </Form.Group>
          <Form.Group>
            <Form.Label className="extra-small fw-bold">Màu:</Form.Label>
            <Form.Select size="sm" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)}>
              {selectedProduct?.colors.map((color, i) => <option key={i} value={color}>{color}</option>)}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="primary" size="sm" className="w-100" onClick={() => {
            const cartItem = { productId: selectedProduct.id, name: selectedProduct.name, size: selectedSize, color: selectedColor, price: selectedProduct.price, quantity: 1, image: selectedProduct.image };
            addToCart(cartItem);
            setAddedProduct(cartItem);
            setShowNotification(true);
            setTimeout(() => setShowNotification(false), 3000);
            setShowBuyModal(false);
          }}>Xác nhận thêm</Button>
        </Modal.Footer>
      </Modal>

      {showNotification && addedProduct && (
        <div className="cart-toast shadow">
          <div className="toast-header">
            <Badge bg="success" className="me-2">Thành công</Badge>
            <strong className="me-auto small">Giỏ hàng</strong>
            <MdClose className="cursor-pointer" onClick={() => setShowNotification(false)} />
          </div>
          <div className="toast-body d-flex align-items-center p-2">
            <Image src={`${WEB_URL}/uploads/${addedProduct.image}`} width={50} height={50} rounded className="me-2 object-fit-cover" />
            <div className="overflow-hidden">
              <div className="text-truncate small fw-bold">{addedProduct.name}</div>
              <div className="extra-small text-muted">{addedProduct.color} - {addedProduct.size}</div>
            </div>
          </div>
          <Link to="/cart" className="btn btn-primary btn-sm mx-2 mb-2">Xem giỏ hàng</Link>
        </div>
      )}

      {/* --- CSS SCOPED --- */}
      <style>{`
        .extra-small { font-size: 0.75rem; }
        .cursor-pointer { cursor: pointer; }
        
        /* Floating Button */
        .chat-launcher {
          position: fixed; bottom: 30px; right: 30px;
          z-index: 10001; cursor: pointer;
        }
        .launcher-icon {
          width: 60px; height: 60px; background: #007bff;
          border-radius: 50%; display: flex; align-items: center; justify-content: center;
          color: white; shadow: 0 4px 15px rgba(0,123,255,0.4);
          transition: transform 0.3s ease;
        }
        .launcher-icon:hover { transform: scale(1.1); }
        .pulse { animation: pulse-animation 2s infinite; }
        @keyframes pulse-animation {
          0% { box-shadow: 0 0 0 0px rgba(220, 53, 69, 0.7); }
          100% { box-shadow: 0 0 0 15px rgba(220, 53, 69, 0); }
        }
        
        .online-indicator {
          position: absolute; top: 5px; right: 5px;
          width: 14px; height: 14px; background: #28a745;
          border: 2px solid white; border-radius: 50%;
        }
        
        /* Chat Window */
        .chat-window {
          position: fixed; bottom: 100px; right: 30px;
          width: 350px; height: 500px; z-index: 10000;
          display: flex; flexDirection: column; overflow: hidden;
          border-radius: 15px;
        }
        .chat-header { padding: 12px 15px; }
        .action-icon { cursor: pointer; font-size: 1.2rem; transition: opacity 0.2s; }
        .action-icon:hover { opacity: 0.7; }
        .header-online-dot {
          position: absolute; bottom: 0; right: 0;
          width: 10px; height: 10px; background: #28a745;
          border: 1.5px solid white; border-radius: 50%;
        }

        .chat-body { background: #f8f9fa; padding: 15px; overflow-y: auto; }
        .chat-welcome-msg { 
          background: #eef2f7; color: #555; padding: 8px 15px;
          border-radius: 10px; font-size: 0.85rem; margin-bottom: 20px; text-align: center;
        }

        /* Bubbles */
        .chat-bubble-container { display: flex; margin-bottom: 15px; max-width: 85%; }
        .chat-bubble-container.me { margin-left: auto; flex-direction: row-reverse; }
        .bubble-avatar { width: 30px; height: 30px; margin-top: auto; margin-right: 8px; }
        .bubble-content { display: flex; flex-direction: column; }
        .chat-bubble-container.me .bubble-content { align-items: flex-end; }
        
        .bubble-text {
          padding: 10px 14px; border-radius: 18px; font-size: 0.9rem;
          word-break: break-word; position: relative;
        }
        .chat-bubble-container.them .bubble-text { background: white; color: #333; border-bottom-left-radius: 4px; }
        .chat-bubble-container.me .bubble-text { background: #007bff; color: white; border-bottom-right-radius: 4px; }
        .bubble-time { font-size: 0.65rem; color: #999; margin-top: 4px; }

        /* Input area */
        .chat-footer { padding: 10px 15px; }
        .image-preview-container { position: relative; padding-bottom: 10px; display: inline-block; }
        .preview-img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; }
        .remove-img-icon { position: absolute; top: -5px; right: -5px; color: #dc3545; cursor: pointer; background: white; border-radius: 50%; }
        .chat-input-group { background: #f1f3f4; border-radius: 20px; padding: 2px 10px; }
        
        /* Toast Notification */
        .cart-toast {
          position: fixed; top: 100px; right: 20px;
          width: 250px; background: white; z-index: 10005;
          border-radius: 12px; overflow: hidden;
        }
        .chat-popup-notify {
          position: fixed; bottom: 105px; right: 30px;
          background: #007bff; color: white; padding: 8px 15px;
          border-radius: 10px 10px 0 10px; z-index: 10002; cursor: pointer;
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </>
  );
};

export default ChatBox;