import React, { useEffect, useState } from "react";
import { Spinner } from "react-bootstrap"; // Thêm Spinner
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation, Autoplay } from "swiper/modules";
import { getSlidesByArea } from "../api/slideApi";
import slide404 from "../img/Slide404.png";

const Collection = ({ area, title }) => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true); // trạng thái loading
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
        setLoading(false); // kết thúc loading dù thành công hay lỗi
      }
    };

    fetchSlides();
  }, [area]);
  const handleTitleClick = (index) => {
    setActiveIndex(index);
    swiperRef?.slideToLoop(index); // slideToLoop để hoạt động đúng với loop
  };

  return (
    <div className="collection">
      <div className="d-flex justify-content-start flex-wrap collection-title mb-3">
      {slides?.map((slide, index) =>
        slide.status === "active" && (
          <button
            key={index}
            onClick={() => handleTitleClick(index)}
            className={`collection-tab-button ${activeIndex === index ? "active" : ""}`}
          >
            {slide.title || `Slide ${index + 1}`}
          </button>
        )
      )}
      </div>

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
              {slides?.map((img, index) => (
                img.status === 'active' && (
                  <SwiperSlide key={index}>
                  <a key={img.id || index} href={img.link || "#"}>
                    <img
                      src={
                        img.image
                          ? `https://finlyapi-production.up.railway.app/uploads/${img.image}`
                          : slide404
                      }
                      alt={`Slide ${index}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        borderRadius: "10px",
                      }}
                      onError={(e) => (e.target.src = slide404)}
                    />
                  </a>
                </SwiperSlide>
                )
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

export default Collection;
