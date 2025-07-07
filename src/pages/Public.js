import React from "react";
import { Outlet } from "react-router-dom";
import { Header, Footer, ChatBox } from "../components";
const Public = () => {
  let userId = null;
  const storedUser = localStorage.getItem("user");

  try {
    if (storedUser) {
      const user = JSON.parse(storedUser);
      userId = user.id;
    }
  } catch (error) {
    console.error("Lỗi khi parse user từ localStorage:", error);
  }
  return (
    <div
      className="d-flex flex-column min-vh-100 bg-main-300"
      style={{ width: "100%" }}
    >
      <div className="position-absolute" style={{ zIndex: "9999999999999" }}>
        <ChatBox userId={userId} />
      </div>

      {/* Header */}
      <div className="container-fluid" style={{ background: "transparent" }}>
        <Header />
      </div>

      {/* Content chính */}
      <div className="flex-grow-1">
        <Outlet />
      </div>

      {/* Footer luôn nằm dưới */}
      <Footer />
    </div>
  );
};

export default Public;
