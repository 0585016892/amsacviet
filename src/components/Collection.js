import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import { Navigation } from "swiper/modules";
import { getSlidesByArea } from "../api/slideApi";

import b1 from "../img/b1.webp";
import b2 from "../img/b2.webp";
import b3 from "../img/b3.webp";

const images = [b1, b2, b3];

const Collection = () => {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchSlides = async () => {
      const result = await getSlidesByArea("popup");
      setSlides(result);
    };

    fetchSlides();
  }, []);
  return (
    <div className="collection">
      <div className="d-flex justify-content-start collection-title">
        <h2>BST POLO COOL 2025</h2>
      </div>
      <div className="collection-content">
        <Swiper
          modules={[Navigation]}
          navigation
          centeredSlides
          slidesPerView={1}
          loop={true}
          spaceBetween={20}
          autoplay={{
            delay: 2000, // Chuyển đổi mỗi 2 giây
            disableOnInteraction: false, // Tự động quay lại sau khi người dùng tương tác
          }}
        >
          {slides?.map((img, index) => (
            <SwiperSlide key={index}>
              <a key={img.id} href={img.link}>
                <img
                  src={`http://localhost:5000/uploads/${img.image}`}
                  alt={`Slide ${index}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    borderRadius: "10px",
                  }}
                />
              </a>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
};

export default Collection;
