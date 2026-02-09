// src/utils/toastUtils.js
import { toast } from "react-hot-toast";
import { AiOutlineCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import React from "react";

/**
 * Hiệu ứng CSS cho Toast (Bạn có thể bỏ đoạn này vào file CSS chung hoặc giữ nguyên style inline)
 */
const toastStyles = {
  container: (visible, color) => ({
    background: "#fff",
    color: "#333",
    padding: "12px 16px",
    borderRadius: "10px",
    width: "340px",
    display: "flex",
    gap: "12px",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
    borderLeft: `5px solid ${color}`,
    transform: visible ? "translateX(0)" : "translateX(100%)",
    opacity: visible ? 1 : 0,
    transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
  }),
  progress: (color) => ({
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "3px",
    backgroundColor: color,
    width: "100%",
    animation: "progressSlide 3s linear forwards",
  })
};

export const showSuccessToast = (title, message) => {
  toast.custom((t) => (
    <div style={toastStyles.container(t.visible, "#22c55e")}>
      <AiOutlineCheckCircle size={28} color="#22c55e" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: "700", fontSize: "0.95rem", color: "#1a1a1a" }}>
          {title}
        </span>
        <span style={{ fontSize: "0.85rem", color: "#666", marginTop: "2px" }}>
          {message}
        </span>
      </div>
      
      {/* Thanh tiến trình trượt */}
      <div style={toastStyles.progress("#22c55e")} />
      
      <style>{`
        @keyframes progressSlide {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  ), { duration: 3000 });
};

export const showErrorToast = (title, message) => {
  toast.custom((t) => (
    <div style={toastStyles.container(t.visible, "#ef4444")}>
      <AiOutlineCloseCircle size={28} color="#ef4444" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <span style={{ fontWeight: "700", fontSize: "0.95rem", color: "#1a1a1a" }}>
          {title}
        </span>
        <span style={{ fontSize: "0.85rem", color: "#666", marginTop: "2px" }}>
          {message}
        </span>
      </div>

      <div style={toastStyles.progress("#ef4444")} />
    </div>
  ), { duration: 3000 });
};