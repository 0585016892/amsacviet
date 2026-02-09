import React, { useEffect, useState } from "react";
import { Row, Col, Typography, Space, Divider, ConfigProvider, Collapse } from "antd";
import { 
  PhoneFilled, 
  MailFilled, 
  EnvironmentFilled, 
  RightOutlined 
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { getActiveFooters } from "../api/footerApi";
import { getSlidesByArea } from "../api/slideApi";
import { motion, AnimatePresence } from "framer-motion";
import { io } from "socket.io-client";

const { Title, Text } = Typography;
const { Panel } = Collapse;

const Footer = () => {
  const URL = process.env.REACT_APP_WEB_URL;
  const [footerBanner, setFooterBanner] = useState([]);
  const [footerItems, setFooterItems] = useState([]);
  const navigate = useNavigate();

  // Fetch Banners (Logo/Certificates)
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const result = await getSlidesByArea("footer");
        setFooterBanner(result);
      } catch (error) {
        console.error("Footer banner error");
      }
    };
    fetchBanners();
  }, []);

  // Fetch Footer Content
  useEffect(() => {
    const fetchData = async () => {
      const result = await getActiveFooters();
      setFooterItems(result);
    };
    fetchData();
  }, []);

  // Socket Realtime
  useEffect(() => {
    const socket = io(process.env.REACT_APP_WEB_URL);
    socket.on("updateFooterStatus", ({ id, status }) => {
      setFooterItems((prev) =>
        prev.map((f) => (f.id === Number(id) ? { ...f, status } : f))
      );
    });
    return () => socket.disconnect();
  }, []);

  const renderIcon = (type) => {
    const iconStyle = { color: "#ff4d6d", fontSize: 20 };
    switch (type) {
      case "phone": return <PhoneFilled style={iconStyle} />;
      case "email": return <MailFilled style={iconStyle} />;
      case "address": return <EnvironmentFilled style={iconStyle} />;
      default: return null;
    }
  };

  return (
    <ConfigProvider theme={{ token: { colorText: "#ffffff", colorTextSecondary: "rgba(255,255,255,0.65)" } }}>
      <footer style={{ background: "#0a0a0f", padding: "80px 0 30px 0", overflow: "hidden", position: "relative" }}>
        
        {/* Trang trí background */}
        <div style={{ position: "absolute", top: 0, left: "10%", width: "300px", height: "300px", background: "radial-gradient(circle, rgba(255,77,109,0.05) 0%, transparent 70%)", pointerEvents: "none" }} />

        <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <Row gutter={[40, 40]}>
            
            {/* CỘT 1: Giới thiệu & Liên hệ */}
            <Col xs={24} lg={10}>
              <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                {footerItems?.filter(i => i.type === "hi").map(item => (
                  <Title level={3} key={item.id} style={{ color: "#fff", marginBottom: 25, fontWeight: 700 }}>
                    {item.title}
                  </Title>
                ))}
                
                <Space direction="vertical" size={20} style={{ width: "100%" }}>
                  {footerItems?.filter(item => item.type === "lienhe").map((contact) => (
                    <motion.div key={contact.id} whileHover={{ x: 5 }} style={{ display: "flex", alignItems: "center", gap: 15 }}>
                      <div style={{ width: 45, height: 45, borderRadius: 12, background: "rgba(255,77,109,0.1)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {renderIcon(contact.value)}
                      </div>
                      <div>
                        <Text type="secondary" style={{ fontSize: 12, display: "block", textTransform: "uppercase", letterSpacing: 1 }}>{contact.title}</Text>
                        <Text strong style={{ fontSize: 15 }}>{contact.label}</Text>
                      </div>
                    </motion.div>
                  ))}
                </Space>
              </motion.div>
            </Col>

            {/* CỘT 2: Menu Link (Group) */}
            <Col xs={24} sm={12} lg={7}>
              <Title level={4} style={{ color: "#fff", marginBottom: 30 }}>KHÁM PHÁ</Title>
              <Row>
                {footerItems?.filter(i => i.type === "group").map((group) => (
                  <Col span={24} key={group.id} style={{ marginBottom: 15 }}>
                    <Text strong style={{ color: "#ff4d6d", display: "block", marginBottom: 10 }}>{group.title.toUpperCase()}</Text>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {group.children?.map(child => (
                        <li key={child.id} style={{ marginBottom: 8 }}>
                          <Link to={child.label} className="footer-link">
                            <RightOutlined style={{ fontSize: 10, marginRight: 8 }} />
                            {child.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </Col>
                ))}
              </Row>
            </Col>

            {/* CỘT 3: Banners & Social */}
            <Col xs={24} sm={12} lg={7}>
              <Title level={4} style={{ color: "#fff", marginBottom: 30 }}>CHỨNG NHẬN</Title>
              <Space wrap size={20}>
                {footerBanner?.filter(b => b.status === "active").map((banner) => (
                  <motion.img
                    key={banner.id}
                    src={`${URL}/uploads/${banner.image}`}
                    alt="Certificate"
                    style={{ height: 60, filter: "grayscale(1) brightness(2)", transition: "0.3s" }}
                    whileHover={{ filter: "grayscale(0) brightness(1)", scale: 1.1 }}
                  />
                ))}
              </Space>

              <div style={{ marginTop: 40 }}>
                {footerItems?.filter(i => i.type === "@").map(copy => (
                  <div key={copy.id} style={{ padding: "15px", borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}>
                    <Text style={{ fontSize: 13 }}>{copy.title}</Text>
                  </div>
                ))}
              </div>
            </Col>
          </Row>

          <Divider style={{ borderColor: "rgba(255,255,255,0.08)", margin: "50px 0 30px 0" }} />
          
          <div style={{ textAlign: "center" }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              © {new Date().getFullYear()} Âm Sắc Màu - Tinh hoa âm nhạc Việt. All rights reserved.
            </Text>
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .footer-link {
            color: rgba(255,255,255,0.6) !important;
            transition: all 0.3s ease;
            font-size: 14px;
            text-decoration: none;
          }
          .footer-link:hover {
            color: #ff4d6d !important;
            padding-left: 5px;
          }
        `}} />
      </footer>
    </ConfigProvider>
  );
};

export default Footer;