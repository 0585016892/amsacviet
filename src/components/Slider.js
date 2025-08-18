import React, { useEffect, useState } from "react";
import { Carousel, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { getSlidesByArea } from "../api/slideApi";
import slide404 from "../img/Slide404.png";
import { socket } from "../api/socket";  // 👈 import socket
const Slider = () => {
  const URL = process.env.REACT_APP_WEB_URL; // Cập nhật URL nếu khác

  const [slides, setSlides] = useState([]);
  const [hasError, setHasError] = useState(false);
  const [loadingImages, setLoadingImages] = useState({});
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
// 👇 Lắng nghe realtime slide update
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
    setLoadingImages((prev) => ({ ...prev, [id]: false }));
  };

  const handleImageError = (id) => {
    setLoadingImages((prev) => ({ ...prev, [id]: false }));
  };

  const renderSlideImage = (slide) => {
    const isLoading = loadingImages[slide.id] !== false;

    return (
      <div style={{ position: "relative" }}>
        {isLoading && (
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
            }}
          >
            <Spinner animation="border" variant="warning" />
          </div>
        )}
        <img
          className="d-block w-100"
          src={
            slide.image
              ? `${URL}/uploads/${slide.image}`
              : slide404
          }
          alt="Slide"
          style={isLoading ? { opacity: 0 } : { transition: "opacity 0.3s" }}
          onLoad={() => handleImageLoad(slide.id)}
          onError={() => handleImageError(slide.id)}
        />
      </div>
    );
  };

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
    <Carousel fade interval={2000} controls indicators>
      {slides?.map((slide) =>
        slide.status === "active" ? (
          <Carousel.Item key={slide.id}>
            {renderSlideImage(slide)}
          </Carousel.Item>
        ) : null
      )}
    </Carousel>
  );
};

export default Slider;
