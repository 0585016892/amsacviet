import React from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import serverErrorImg from "../img/Slide404.png"; // ảnh làm nền

const ServerDown = () => {
  const navigate = useNavigate();

  return (
    <div
     className="server_down">
      <div
        className="server_down_a d-none
        d-md-block"
      >
        <h2 style={{ fontSize: "clamp(1.5rem, 5vw, 2.5rem)" }}>
          🚫 Máy chủ không phản hồi
        </h2>
        <p style={{ fontSize: "clamp(1rem, 3vw, 1.25rem)" }}>
          Hệ thống đang bảo trì hoặc chưa được bật. Vui lòng thử lại sau.
        </p>
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem", flexWrap: "wrap", justifyContent: "center" }}>
          <Button variant="dark" onClick={() => window.location.reload()}>
            🔄 Thử lại
          </Button>
          <Button variant="outline-dark" onClick={() => navigate("/")}>
            🏠 Trang chủ
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ServerDown;
