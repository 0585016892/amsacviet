import React, { useEffect, useState, useRef, useCallback } from "react";
import io from "socket.io-client";
import { Button, Card, Form, InputGroup, Badge } from "react-bootstrap";
import { BsChatDotsFill } from "react-icons/bs";
import { MdHorizontalRule } from "react-icons/md";
import logoAdmin from "../img/logoadmin.png";

const ChatBox = ({ userId }) => {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState(null);

  const socketRef = useRef();
  const chatBoxRef = useRef();

  useEffect(() => {
    if (!userId) return;

    const socket = io("http://localhost:5000", {
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

    fetch(`http://localhost:5000/api/chat/conversation/${userId}`)
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

  const sendMessage = useCallback(() => {
    const trimmed = message.trim();
    if (!trimmed || !socketRef.current) return;

    const data = {
      sender: userId,
      receiver: "admin",
      content: trimmed,
      timestamp: Date.now(),
    };

    socketRef.current.emit("send_private_message", data, (ack) => {
      if (ack?.success) {
        setMessage(""); // ❌ Không push vào state ở đây
      } else {
        console.error("Gửi tin nhắn thất bại:", ack?.error);
      }
    });
  }, [message, userId]);

  const formatTime = (timestamp) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
            bottom: 20,
            right: 20,
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
            bottom: 90,
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
                    {msg.content}
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
                  </div>
                </div>
              ))
            )}
          </Card.Body>

          <Card.Footer style={{ padding: "10px", backgroundColor: "#f8f9fa" }}>
            <InputGroup>
              <Form.Control
                placeholder="Nhập tin nhắn..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    sendMessage();
                  }
                }}
              />
              <Button onClick={sendMessage} disabled={!message.trim()}>
                Gửi
              </Button>
            </InputGroup>
          </Card.Footer>
        </Card>
      )}
    </>
  );
};

export default ChatBox;
