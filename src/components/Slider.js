import React, { useEffect, useState } from "react";
import { Carousel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getSlidesByArea } from "../api/slideApi";
import slide404 from "../img/Slide404.png";

const Slider = () => {
  const [slides, setSlides] = useState([]);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const result = await getSlidesByArea("sidebar");
        setSlides(result);
      } catch (error) {
        setHasError(true);
        navigate("/server-down");
      }
    };

    fetchSlides();
  }, [navigate]);

  // Nếu muốn fallback ảnh khi lỗi, không dùng navigate()
  if (hasError) {
    return (
      <Carousel fade interval={2000} controls indicators>
        <Carousel.Item>
          <img className="d-block w-100" src={slide404} alt="Fallback Slide" />
        </Carousel.Item>
      </Carousel>
    );
  }

  return (
    <div>
      <Carousel fade interval={2000} controls indicators>
        {slides?.map((slide) =>
          slide.status === "active" ? (
            <Carousel.Item key={slide.id}>
              <img
                className="d-block w-100"
                src={
                  slide.image
                    ? `https://finlyapi-production.up.railway.app/uploads/${slide.image}`
                    : slide404
                }
                alt="Slide"
              />
            </Carousel.Item>
          ) : null
        )}
      </Carousel>
    </div>
  );
};

export default Slider;
