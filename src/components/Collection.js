import React, { useEffect, useState, useRef } from "react";
import { Spin, ConfigProvider, Empty, Button, Typography } from "antd";
import { Carousel } from "antd";
import { getSlidesByArea } from "../api/slideApi";
import slide404 from "../img/Slide404.png";
import { motion, AnimatePresence } from "framer-motion";
import { socket } from "../api/socket";
import { LeftOutlined, RightOutlined, ArrowRightOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Collection = ({ area, title }) => {
  const URL = process.env.REACT_APP_WEB_URL;
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(0);
  const carouselRef = useRef(null);

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

  useEffect(() => {
    socket.on("slideStatusUpdated", (data) => {
      setSlides((prev) =>
        prev.map((s) => (s.id === Number(data.id) ? { ...s, status: data.status } : s))
      );
    });
    return () => socket.off("slideStatusUpdated");
  }, []);

  const activeSlides = slides.filter((s) => s.status === "active");

  const handleTabChange = (index) => {
    setActiveKey(index);
    carouselRef.current.goTo(index);
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#000" } }}>
      <div className="collection-premium" style={{ padding: "60px 0", maxWidth: "1400px", margin: "0 auto" }}>
        
        {/* Header Section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40, padding: '0 20px' }}>
          <div style={{ flex: 1 }}>
            <Text strong style={{ letterSpacing: 2, color: '#ff4d6d', textTransform: 'uppercase', fontSize: 12 }}>Bộ sưu tập đặc biệt</Text>
            <Title level={2} style={{ margin: '8px 0 0 0', fontWeight: 800, fontSize: 36 }}>{title || "Âm Sắc Màu"}</Title>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button shape="circle" icon={<LeftOutlined />} onClick={() => carouselRef.current.prev()} />
            <Button shape="circle" icon={<RightOutlined />} onClick={() => carouselRef.current.next()} />
          </div>
        </div>

        {activeSlides.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 30 }}>
            
            {/* Left Side: Custom Tab Control (Thumbnails) */}
            <div style={{ flex: '0 0 300px', display: 'flex', flexDirection: 'column', gap: 15, padding: '0 20px' }}>
              {activeSlides.map((slide, index) => (
                <motion.div
                  key={index}
                  onClick={() => handleTabChange(index)}
                  style={{
                    cursor: 'pointer',
                    padding: '15px',
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 15,
                    background: activeKey === index ? '#fff' : 'transparent',
                    boxShadow: activeKey === index ? '0 10px 30px rgba(0,0,0,0.08)' : 'none',
                    border: activeKey === index ? '1px solid #f0f0f0' : '1px solid transparent',
                    transition: 'all 0.3s'
                  }}
                  whileHover={{ x: 10 }}
                >
                  <img 
                    src={slide.image ? `${URL}/uploads/${slide.image}` : slide404} 
                    style={{ width: 60, height: 60, borderRadius: 12, objectFit: 'cover' }} 
                  />
                  <div>
                    <Title level={5} style={{ margin: 0, fontSize: 14, color: activeKey === index ? '#000' : '#8c8c8c' }}>
                      {slide.title || `BST ${index + 1}`}
                    </Title>
                    <Text style={{ fontSize: 11, color: '#bfbfbf' }}>Khám phá ngay</Text>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Right Side: Main Display (Carousel) */}
            <div style={{ flex: 1, position: 'relative', borderRadius: 30, overflow: 'hidden' }}>
              <Carousel
                ref={carouselRef}
                afterChange={(current) => setActiveKey(current)}
                effect="fade"
                dots={false}
              >
                {activeSlides.map((slide, index) => (
                  <div key={index}>
                    <div style={{ position: 'relative', height: 550, width: '100%' }}>
                      <img
                        src={slide.image ? `${URL}/uploads/${slide.image}` : slide404}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => (e.target.src = slide404)}
                      />
                      
                      {/* Floating Content Card */}
                      <AnimatePresence mode="wait">
                        {activeKey === index && (
                          <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            style={{
                              position: 'absolute',
                              bottom: 40,
                              left: 40,
                              background: 'rgba(255, 255, 255, 0.85)',
                              backdropFilter: 'blur(15px)',
                              padding: '35px',
                              borderRadius: 24,
                              maxWidth: 380,
                              boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
                            }}
                          >
                            <Title level={3} style={{ margin: 0, fontWeight: 700 }}>{slide.title}</Title>
                            <Text type="secondary" style={{ display: 'block', margin: '15px 0' }}>
                              Cảm nhận âm thanh chân thực và sắc sảo trong từng bộ sưu tập được thiết kế riêng cho bạn.
                            </Text>
                            <Button 
                              type="primary" 
                              size="large" 
                              href={slide.link}
                              style={{ 
                                borderRadius: 12, 
                                height: 50, 
                                background: '#000', 
                                border: 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: 10
                              }}
                            >
                              XEM CHI TIẾT <ArrowRightOutlined />
                            </Button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                ))}
              </Carousel>
            </div>
          </div>
        ) : (
          <Empty description="Trống" />
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .collection-premium .ant-btn-circle {
          border: 1px solid #f0f0f0;
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .collection-premium .ant-btn-circle:hover {
          background: #ff4d6d !important;
          color: #fff !important;
          border-color: #ff4d6d !important;
        }
      `}} />
    </ConfigProvider>
  );
};

export default Collection;