import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import serverErrorImg from "../img/Slide404.png"; // ảnh làm nền

const ServerDown = () => {
  const navigate = useNavigate();

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      <img
        src={serverErrorImg}
        alt="Server Down"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          opacity: 0.75,
        }}
      />
      <div
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          top: "50%",
          transform: "translateY(-50%)",
          color: "black",
          textShadow: "2px 2px 4px #000",
        }}
      >
        <h2>🚫 Máy chủ không phản hồi</h2>
        <p>Hệ thống đang bảo trì hoặc chưa bật. Vui lòng thử lại sau.</p>
        <Button variant="dark" onClick={() => window.location.reload()}>
          🔄 Thử lại
        </Button>{" "}
        <Button variant="outline-dark" onClick={() => navigate("/")}>
          🏠 Trang chủ
        </Button>
      </div>
    </div>
  );
};

export default ServerDown;
