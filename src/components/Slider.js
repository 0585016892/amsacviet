import React, { useEffect, useState } from "react";
import { Carousel, Spin, Empty, ConfigProvider } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { getSlidesByArea } from "../api/slideApi";
import slide404 from "../img/Slide404.png";
import { socket } from "../api/socket";
import { motion, AnimatePresence } from "framer-motion";

const Slider = () => {
  const URL = process.env.REACT_APP_WEB_URL;
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imageStates, setImageStates] = useState({}); // Quản lý loading từng ảnh

  const fetchSlides = async () => {
    try {
      const result = await getSlidesByArea("sidebar");
      setSlides(result);
    } catch (error) {
      console.error("Lỗi fetch slide:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  // Realtime update qua Socket
  useEffect(() => {
    socket.on("slideStatusUpdated", (data) => {
      setSlides((prev) =>
        prev.map((s) =>
          s.id === Number(data.id) ? { ...s, status: data.status } : s
        )
      );
    });

    return () => {
      socket.off("slideStatusUpdated");
    };
  }, []);

  const handleImageLoad = (id) => {
    setImageStates((prev) => ({ ...prev, [id]: "loaded" }));
  };

  const handleImageError = (id) => {
    setImageStates((prev) => ({ ...prev, [id]: "error" }));
  };

  // Lọc các slide đang active
  const activeSlides = slides.filter((s) => s.status === "active");

  if (loading) {
    return (
      <div style={{ height: 400, display: "flex", justifyContent: "center", alignItems: "center", background: "#f5f5f5", borderRadius: 16 }}>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 40 }} spin />} tip="Đang tải ưu đãi..." />
      </div>
    );
  }

  if (activeSlides.length === 0) {
    return (
      <div className="w-100 rounded-4 overflow-hidden shadow-sm">
        <img src={slide404} alt="No Slide" className="w-100 d-block" style={{ objectFit: 'cover' }} />
      </div>
    );
  }

  return (
    <ConfigProvider
      theme={{
        components: {
          Carousel: {
            dotWidth: 8,
            dotActiveWidth: 24,
            colorBgContainer: "#ff4d6d", // Màu dots đồng bộ với theme Âm Sắc Màu
          },
        },
      }}
    >
      <div className="slider-wrapper" style={{ borderRadius: 20, overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
        <Carousel autoplay effect="fade" speed={800} autoplaySpeed={4000} pauseOnHover={false}>
          {activeSlides.map((slide) => (
            <div key={slide.id} style={{ position: "relative", outline: 'none' }}>
              <div style={{ position: "relative", height: 'auto', minHeight: '200px', background: '#ececec' }}>
                
                {/* Spinner loading cho từng ảnh */}
                {imageStates[slide.id] !== "loaded" && imageStates[slide.id] !== "error" && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1 }}>
                    <Spin size="large" />
                  </div>
                )}

                <motion.img
                  initial={{ opacity: 0 }}
                  animate={{ opacity: imageStates[slide.id] === "loaded" ? 1 : 0 }}
                  transition={{ duration: 0.5 }}
                  src={slide.image ? `${URL}/uploads/${slide.image}` : slide404}
                  alt="Promotion Slide"
                  style={{
                    width: "100%",
                    display: "block",
                    cursor: "pointer",
                    aspectRatio: '16/7', // Giữ tỷ lệ ảnh chuẩn landing page
                    objectFit: 'cover'
                  }}
                  onLoad={() => handleImageLoad(slide.id)}
                  onError={() => handleImageError(slide.id)}
                />
              </div>
            </div>
          ))}
        </Carousel>
      </div>

      <style>{`
        .ant-carousel .slick-dots li button {
          background: #ccc !important;
          height: 6px !important;
          border-radius: 3px !important;
        }
        .ant-carousel .slick-dots li.slick-active button {
          background: #ff4d6d !important;
        }
        .ant-carousel .slick-slide {
          line-height: 0 !important;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default Slider;