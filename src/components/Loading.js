import React from "react";

const Loading = () => {
   return (
    <div className="piano-mini-container">
      <div className="piano-keys">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`mini-key ${i % 2 === 0 ? "white" : "black"}`}
            style={{ animationDelay: `${i * 0.1}s` }}
          ></div>
        ))}
      </div>
      <p className="piano-loading-text">Đang tải sản phẩm...</p>
    </div>
  );
};

export default Loading;
