import { useEffect } from "react";

const ZaloChat = () => {
  useEffect(() => {
    // Kiểm tra script đã có chưa để tránh thêm trùng
    const existingScript = document.querySelector(
      'script[src="https://sp.zalo.me/plugins/sdk.js"]'
    );
    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://sp.zalo.me/plugins/sdk.js";
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div
      className="zalo-chat-widget"
      data-oaid="514073000691036025"
      data-welcome-message="Xin chào! Shop có thể hỗ trợ gì cho bạn?"
      data-autopopup="0"
      data-width="350"
      data-height="420"
    ></div>
  );
};

export default ZaloChat;
    