import React, { useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";

import { getSlidesByArea } from "../api/slideApi";
const Slider = () => {
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    const fetchSlides = async () => {
      const result = await getSlidesByArea("sidebar");
      setSlides(result);
    };

    fetchSlides();
  }, []);

  return (
    <div>
      <Carousel
        fade
        interval={2000}
        controls={true} // 👉 bật nút prev/next
        indicators={true} // 👉 bật chấm dots bên dưới
      >
        {slides?.map((slide) =>
          slide.status === "active" ? (
            <Carousel.Item key={slide.id}>
              <img
                className="d-block w-100"
                src={`http://localhost:5000/uploads/${slide.image}`}
                alt="Second slide"
              />
            </Carousel.Item>
          ) : null
        )}
      </Carousel>
    </div>
  );
};

export default Slider;
