import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { getSlidesByArea } from "../api/slideApi";
import slide404 from "../img/Slide404.png";
import { motion } from "framer-motion"; // 👉 Thêm motion

const Collection = ({ area, title }) => {
  const URL = process.env.REACT_APP_WEB_URL; 
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [swiperRef, setSwiperRef] = useState(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const result = await getSlidesByArea(area);
        setSlides(result);
      } catch (error) {
        console.error("Lỗi khi tải slide:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSlides();
  }, [area]);

  const handleTitleClick = (index) => {
    setActiveIndex(index);
    swiperRef?.slideToLoop(index);
  };

  return (
    <div className="collection">
      {/* Tabs */}
      <div className="d-flex justify-content-start flex-wrap collection-title mb-3">
        {slides?.map(
          (slide, index) =>
            slide.status === "active" && (
              <motion.button
                key={index}
                onClick={() => handleTitleClick(index)}
                className={`collection-tab-button ${
                  activeIndex === index ? "active" : ""
                }`}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {slide.title || `Slide ${index + 1}`}
              </motion.button>
            )
        )}
      </div>

      {/* Slide Content */}
      <div
        className="collection-content position-relative"
        style={{ minHeight: "200px" }}
      >
        {loading ? (
          <div
            className="d-flex justify-content-center align-items-center"
            style={{ height: 200 }}
          >
            <Spinner animation="border" variant="warning" />
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Autoplay]}
            navigation
            centeredSlides
            slidesPerView={1}
            loop={true}
            spaceBetween={20}
            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
            onSwiper={(swiper) => setSwiperRef(swiper)}
            autoplay={{
              delay: 4000,
              disableOnInteraction: false,
            }}
          >
            {slides?.map(
              (img, index) =>
                img.status === "active" && (
                  <SwiperSlide key={index}>
                    <a key={img.id || index} href={img.link || "#"}>
                      <motion.img
                        src={img.image ? `${URL}/uploads/${img.image}` : slide404}
                        alt={`Slide ${index}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          borderRadius: "10px",
                        }}
                        onError={(e) => (e.target.src = slide404)}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6 }}
                        whileHover={{ scale: 1.02 }}
                      />
                    </a>
                  </SwiperSlide>
                )
            )}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default Collection;
