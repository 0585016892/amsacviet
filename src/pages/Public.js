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
      className=" position-relative h-screen bg-main-300"
      style={{ width: "100%" }}
    >
      <div className="position-absolute" style={{ zIndex: "9999999999999" }}>
        <ChatBox userId={userId} />
      </div>
      <div className="container-fluid " style={{ background: "transparent" }}>
        <Header />
      </div>
      <div>
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default Public;
