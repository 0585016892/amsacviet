import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import postApi from "../api/postApi";
import { 
  Typography, Row, Col, Breadcrumb, 
  Avatar, Divider, Tag, Space, 
  ConfigProvider, Skeleton, Anchor,Card ,Button
} from "antd";
import { 
  CalendarOutlined, UserOutlined, 
  ArrowLeftOutlined, ShareAltOutlined,
  ClockCircleOutlined
} from "@ant-design/icons";
import { motion, useScroll, useSpring } from "framer-motion";

const { Title, Text, Paragraph } = Typography;

const BlogDetail = () => {
  const URL = process.env.REACT_APP_WEB_URL;
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  // Thanh tiến trình đọc bài viết
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      try {
        const data = await postApi.getBySlug(slug);
        setPost(data);
      } catch (error) {
        console.error("Không tìm thấy bài viết");
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return (
    <div style={{ padding: "150px 0", maxWidth: 800, margin: "0 auto" }}>
      <Skeleton active title={{ width: '80%' }} paragraph={{ rows: 15 }} />
    </div>
  );

  if (!post) return null;

  const contentParagraphs = post.content.split("\r\n").filter((p) => p.trim() !== "");

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#ff4d6d" } }}>
      {/* Reading Progress Bar */}
      <motion.div style={{ 
        scaleX, 
        position: "fixed", top: 0, left: 0, right: 0, 
        height: 4, background: "#ff4d6d", 
        transformOrigin: "0%", zIndex: 9999 
      }} />

      <div style={{ background: "#fff", minHeight: "100vh", paddingTop: "100px" }}>
        
        {/* Header Section: Tiêu đề & Thông tin */}
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 20px" }}>
          <Breadcrumb style={{ marginBottom: 30 }}>
            <Breadcrumb.Item><Link to="/">Trang chủ</Link></Breadcrumb.Item>
            <Breadcrumb.Item><Link to="/blog">Blog</Link></Breadcrumb.Item>
            <Breadcrumb.Item>{post.title}</Breadcrumb.Item>
          </Breadcrumb>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Tag color="magenta" style={{ marginBottom: 15, borderRadius: 4, fontWeight: 600 }}>
              KIẾN THỨC ÂM NHẠC
            </Tag>
            <Title level={1} style={{ fontSize: "2.8rem", fontWeight: 800, lineHeight: 1.2, marginBottom: 25 }}>
              {post.title}
            </Title>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
              <Space size="middle">
                <Avatar size={48} icon={<UserOutlined />} src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <Text strong style={{ fontSize: 16 }}>Âm Sắc Việt Editor</Text>
                  <Space split={<Divider type="vertical" />} style={{ fontSize: 13, color: "#8c8c8c" }}>
                    <span><CalendarOutlined /> {new Date(post.created_at).toLocaleDateString('vi-VN')}</span>
                    <span><ClockCircleOutlined /> 5 phút đọc</span>
                  </Space>
                </div>
              </Space>
              <Button type="text" icon={<ShareAltOutlined />} size="large" shape="circle" />
            </div>
          </motion.div>
        </div>

        {/* Featured Image */}
        <div className="container" style={{ maxWidth: 1100, margin: "0 auto 60px", padding: "0 20px" }}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8 }}>
            <img 
              src={`${URL}${post.image}`} 
              alt="featured" 
              style={{ width: "100%", borderRadius: 32, boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15)" }} 
            />
          </motion.div>
        </div>

        {/* Content Section */}
        <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
          <Row gutter={[60, 40]}>
            <Col xs={24} lg={16}>
              <div style={{ fontSize: 18, lineHeight: "1.8", color: "#333" }}>
                {contentParagraphs.map((paragraph, index) => (
                  <motion.div 
                    key={index}
                    initial={{ opacity: 0, y: 20 }} 
                    whileInView={{ opacity: 1, y: 0 }} 
                    viewport={{ once: true, margin: "-100px" }}
                  >
                    <Paragraph style={{ marginBottom: 30, fontSize: 18 }}>
                      {paragraph}
                    </Paragraph>

                    {/* Chèn ảnh giữa các đoạn văn nếu có */}
                    {post.images && post.images[index] && (
                      <figure style={{ margin: "40px 0", textAlign: "center" }}>
                        <img 
                          src={`${URL}${post.images[index]}`} 
                          alt={`illustration-${index}`}
                          style={{ width: "100%", borderRadius: 20, cursor: "zoom-in" }}
                        />
                        <figcaption style={{ marginTop: 12, fontStyle: "italic", color: "#8c8c8c", fontSize: 14 }}>
                          Hình {index + 1}: Mô tả chi tiết về sản phẩm Âm Sắc Việt
                        </figcaption>
                      </figure>
                    )}
                  </motion.div>
                ))}
              </div>

              <Divider style={{ margin: "60px 0" }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Link to="/blog">
                  <Button icon={<ArrowLeftOutlined />} type="link" size="large">Quay lại Blog</Button>
                </Link>
                <Space>
                  <Text type="secondary">Chia sẻ:</Text>
                  <Button shape="circle" icon={<ShareAltOutlined />} />
                </Space>
              </div>
            </Col>

            {/* Sidebar: Table of Content & Featured */}
            <Col xs={24} lg={8}>
              <div style={{ position: "sticky", top: 120 }}>
                <Card bordered={false} style={{ borderRadius: 24, background: "#f9f9f9", marginBottom: 30 }}>
                  <Title level={4} style={{ marginBottom: 20 }}>Mục lục bài viết</Title>
                  <Anchor
                    targetOffset={150}
                    items={[
                      { key: 'part1', href: '#intro', title: '1. Giới thiệu chung' },
                      { key: 'part2', href: '#detail', title: '2. Đặc điểm nổi bật' },
                      { key: 'part3', href: '#conclusion', title: '3. Kết luận' },
                    ]}
                  />
                </Card>

                <Card 
                  bordered={false} 
                  style={{ 
                    borderRadius: 24, 
                    background: "linear-gradient(135deg, #ff4d6d 0%, #ff85a1 100%)",
                    color: "#fff"
                  }}
                >
                  <Title level={4} style={{ color: "#fff", marginBottom: 15 }}>🎁 Ưu đãi đặc biệt</Title>
                  <Paragraph style={{ color: "#fff" }}>
                    Đăng ký nhận tin để không bỏ lỡ các kiến thức nhạc cụ và voucher giảm giá 10% cho đơn hàng đầu tiên.
                  </Paragraph>
                  <Button block size="large" style={{ borderRadius: 12, fontWeight: 700, border: "none" }}>
                    Đăng ký ngay
                  </Button>
                </Card>
              </div>
            </Col>
          </Row>
        </div>
        
        {/* Padding bottom */}
        <div style={{ height: 100 }} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .ant-typography p { margin-bottom: 24px; }
        .ant-anchor-link-title { font-size: 15px !important; }
        .ant-anchor-wrapper { background: transparent !important; }
        @media (max-width: 768px) {
          h1.ant-typography { font-size: 2rem !important; }
        }
      `}} />
    </ConfigProvider>
  );
};

export default BlogDetail;