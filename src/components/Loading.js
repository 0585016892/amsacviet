import React from "react";
import { FaTshirt } from "react-icons/fa";

const Loading = () => {
  return (
    <div className="shirt-loader-container">
      <div className="shirt-icon-text">👕</div>
      <div className="loading-text">
        {"Đang tải sản phẩm...".split("").map((char, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.05}s` }}>
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

export default Loading;
