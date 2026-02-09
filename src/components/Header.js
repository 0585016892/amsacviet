import React, { useState, useEffect } from "react";
import { 
  Layout, 
  Button, 
  Input, 
  Badge, 
  Row, 
  Col, 
  Drawer, 
  Space, 
  Typography, 
  Card, 
  Tabs,
  ConfigProvider
} from "antd";
import { 
  SearchOutlined, 
  MenuOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  LoginOutlined,
  CloseOutlined,
  ArrowRightOutlined
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import categoryService from "../api/danhmucWebApi";
import { getSettingsAPI } from "../api/settingsApi";

const { Header } = Layout;
const { Title, Text } = Typography;

const CustomerHeader = () => {
  const URL_WEB = process.env.REACT_APP_WEB_URL;
  const { user } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();

  // States
  const [scrolled, setScrolled] = useState(false);
  const [settings, setSettings] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [categoryData, setCategoryData] = useState([]);
  const [collections, setCollectionsData] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [keyword, setKeyword] = useState("");

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [settingsRes, categoriesRes, collectionsRes] = await Promise.all([
          getSettingsAPI(),
          categoryService.getCategories(),
          categoryService.getCollection()
        ]);
        setSettings(settingsRes);
        setCategoryData(categoriesRes);
        setCollectionsData(collectionsRes.data);
        if (categoriesRes.length > 0) setActiveTab(categoriesRes[0].id);
      } catch (err) {
        console.error("Lỗi fetch data:", err);
      }
    };
    fetchData();
  }, []);

  // Handle Scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Đóng menu khi đổi trang
  useEffect(() => setIsMenuOpen(false), [location]);

  const handleSearch = (value) => {
    if (value.trim()) {
      navigate(`/search?keyword=${encodeURIComponent(value.trim())}`);
      setIsMenuOpen(false);
    }
  };

  const activeCategory = categoryData.find(cat => cat.id === activeTab);

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#000",
          borderRadius: 8,
        },
      }}
    >
      <Header
        style={{
          position: "fixed",
          zIndex: 1000,
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: scrolled ? "0 40px" : "10px 40px",
          background: scrolled ? "rgba(255, 255, 255, 0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(10px)" : "none",
          boxShadow: scrolled ? "0 2px 10px rgba(0,0,0,0.05)" : "none",
          transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
          height: scrolled ? 64 : 80,
        }}
      >
        <Space size="large">
          <Button 
            type="text" 
            icon={<MenuOutlined style={{ fontSize: 20 }} />} 
            onClick={() => setIsMenuOpen(true)}
          />
        </Space>

        <div className="logo" style={{ cursor: 'pointer' }} onClick={() => navigate("/")}>
          <img 
            src={settings ? `${URL_WEB}${settings.site_logo}` : ""} 
            height={scrolled ? 40 : 50} 
            alt="Logo"
            style={{ transition: 'all 0.3s' }}
          />
        </div>

        <Space size="middle">
          <Input
            placeholder="Tìm kiếm..."
            prefix={<SearchOutlined />}
            onPressEnter={(e) => handleSearch(e.target.value)}
            className="d-none d-md-flex"
            style={{ borderRadius: 20, width: 200, background: 'rgba(0,0,0,0.03)', border: 'none' }}
          />
          
          <Badge count={totalItems} size="small" offset={[-5, 5]} color="#000">
            <Button 
              type="text" 
              icon={<ShoppingCartOutlined style={{ fontSize: 22 }} />} 
              onClick={() => navigate("/cart")}
            />
          </Badge>

          {user ? (
            <Button 
              type="text" 
              icon={<UserOutlined style={{ fontSize: 22 }} />} 
              onClick={() => navigate("/profile")}
            />
          ) : (
            <Button 
              type="primary" 
              shape="round" 
              icon={<LoginOutlined />}
              onClick={() => navigate("/login")}
            >
              Đăng nhập
            </Button>
          )}
        </Space>
      </Header>

      {/* Mega Menu Drawer */}
      <Drawer
        placement="top"
        onClose={() => setIsMenuOpen(false)}
        open={isMenuOpen}
        height="100vh"
        closable={false}
        bodyStyle={{ padding: '20px 50px' }}
      >
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header trong Menu */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <Title level={3} style={{ margin: 0 }}>Khám phá</Title>
            <Space>
               <Input.Search
                placeholder="Bạn đang tìm gì?"
                allowClear
                enterButton="Tìm"
                size="large"
                onSearch={handleSearch}
                style={{ width: 400 }}
              />
              <Button 
                type="text" 
                icon={<CloseOutlined style={{ fontSize: 20 }} />} 
                onClick={() => setIsMenuOpen(false)} 
              />
            </Space>
          </div>

          <Row gutter={48}>
            {/* Cột danh mục */}
            <Col span={14}>
              <Title level={5} type="secondary" style={{ marginBottom: 24, letterSpacing: 1 }}>DANH MỤC SẢN PHẨM</Title>
              <Tabs
                tabPosition="left"
                activeKey={activeTab}
                onChange={setActiveTab}
                items={categoryData.map(cat => ({
                  key: cat.id,
                  label: cat.name,
                  children: (
                    <motion.div 
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="d-grid"
                      style={{ 
                        gridTemplateColumns: 'repeat(2, 1fr)', 
                        gap: '15px', 
                        paddingLeft: 40 
                      }}
                    >
                      {cat.dmCon?.map(sub => (
                        <Link 
                          key={sub.child_id} 
                          to={`/category/${sub.child_slug}`}
                          style={{ 
                            padding: '12px 20px', 
                            background: '#f5f5f5', 
                            borderRadius: 12,
                            color: '#333',
                            fontWeight: 500,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                          className="sub-cat-item"
                        >
                          {sub.child_name}
                          <ArrowRightOutlined style={{ fontSize: 12, opacity: 0 }} className="arrow-icon" />
                        </Link>
                      ))}
                    </motion.div>
                  )
                }))}
              />
            </Col>

            {/* Cột Bộ sưu tập (Collections) */}
            <Col span={10}>
              <Title level={5} type="secondary" style={{ marginBottom: 24, letterSpacing: 1 }}>BỘ SƯU TẬP MỚI</Title>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {collections?.slice(0, 2).map((col) => (
                  <motion.div key={col.id} whileHover={{ y: -5 }}>
                    <Card
                      hoverable
                      cover={
                        <img 
                          alt={col.name} 
                          src={col.image?.startsWith("http") ? col.image : `${URL_WEB}/uploads/${col.image}`} 
                          style={{ height: 180, objectFit: 'cover' }}
                        />
                      }
                      bodyStyle={{ padding: 15 }}
                    >
                      <Card.Meta 
                        title={col.name} 
                        description={col.description?.slice(0, 60) + '...'} 
                      />
                    </Card>
                  </motion.div>
                ))}
              </div>
            </Col>
          </Row>
        </div>
      </Drawer>

      <style>{`
        .ant-tabs-left > .ant-tabs-content-holder {
          border-left: 1px solid #f0f0f0;
        }
        .ant-tabs-tab {
          font-size: 18px !important;
          padding: 15px 0 !important;
          font-weight: 600 !important;
        }
        .sub-cat-item:hover {
          background: #000 !important;
          color: #fff !important;
        }
        .sub-cat-item:hover .arrow-icon {
          opacity: 1 !important;
          transform: translateX(5px);
        }
        .arrow-icon {
          transition: all 0.3s;
        }
      `}</style>
    </ConfigProvider>
  );
};

export default CustomerHeader;