import React from "react";
import { Outlet } from "react-router-dom";
import { Layout, ConfigProvider } from "antd";
import { Header as AppHeader, Footer as AppFooter, ChatBox, ZaloChat } from "../components";
import { motion, AnimatePresence } from "framer-motion";

const { Content } = Layout;

const Public = () => {
  let userId = null;
  const storedUser = localStorage.getItem("user");

  try {
    if (storedUser) {
      const user = JSON.parse(storedUser);
      userId = user?.id;
    }
  } catch (error) {
    console.error("Lỗi khi parse user từ localStorage:", error);
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#ff4d6d", // Đồng bộ với màu chủ đạo của Login/Header
        },
      }}
    >
      <Layout 
        style={{ 
          minHeight: "100vh", 
          display: "flex", 
          flexDirection: "column",
          backgroundColor: "#fff" // Hoặc tông màu bg-main-300 cũ của bạn
        }}
      >
        {/* Chat Widgets - Được đặt cố định trên toàn trang */}
        <AnimatePresence>
          {userId && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ 
                position: "fixed", 
                bottom: 20, 
                right: 20, 
                zIndex: 10000 
              }}
            >
              <ChatBox userId={userId} />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Zalo Chat Widget (Nếu có) */}
        <div style={{ position: "fixed", bottom: 100, right: 20, zIndex: 10000 }}>
            <ZaloChat />
        </div>

        {/* Header Section */}
        <div style={{ width: "100%", zIndex: 1001 }}>
          <AppHeader />
        </div>

        {/* Main Content */}
        <Content 
          style={{ 
            flex: "1 0 auto", // Giúp content tự giãn để đẩy footer xuống
            display: "flex",
            flexDirection: "column"
          }}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            style={{ flex: 1 }}
          >
            <Outlet />
          </motion.div>
        </Content>

        {/* Footer Section */}
        <AppFooter />
      </Layout>

      {/* Global CSS để xử lý layout */}
      <style dangerouslySetInnerHTML={{ __html: `
        .ant-layout {
          background: transparent !important;
        }
        /* Đảm bảo Outlet không bị dính sát vào Header nếu cần */
        main.ant-layout-content {
          min-height: calc(100vh - 80px); /* Điều chỉnh theo chiều cao Header */
        }
      `}} />
    </ConfigProvider>
  );
};

export default Public;