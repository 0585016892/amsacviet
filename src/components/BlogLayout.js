import React, { useEffect, useState } from "react";
import { 
  Row, Col, Card, Typography, Input, 
  Button, Space, Tag, Divider, 
  ConfigProvider, Avatar, Empty, Badge 
} from "antd";
import { 
  SearchOutlined, 
  ShareAltOutlined, 
  MessageOutlined, 
  HeartOutlined,
  ArrowRightOutlined,
  CalendarOutlined,
  UserOutlined
} from "@ant-design/icons";
import { useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import postApi from "../api/postApi";
import { socket } from "../api/socket";
import { 
  FaShippingFast, FaUndoAlt, FaHeadset, 
  FaShieldAlt, FaGift 
} from "react-icons/fa";

const { Title, Text, Paragraph } = Typography;

const BlogLayout = () => {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const URL = process.env.REACT_APP_WEB_URL;

  const isBlog = location.pathname === "/blog";
  const isPolicy = location.pathname === "/chinh-sach";

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await postApi.getAll();
        setPosts(res.posts || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  useEffect(() => {
    socket.on("postStatusUpdated", (data) => {
      setPosts((prev) =>
        prev.map((s) => (s.id === Number(data.postId) ? { ...s, status: data.status } : s))
      );
    });
    return () => socket.off("postStatusUpdated");
  }, []);

  const latestPost = posts.find(p => p.status === 'published');
  const otherPosts = posts.filter(p => p.id !== latestPost?.id && p.status === 'published');

  const policies = [
    { id: 1, icon: <FaShippingFast />, title: "Giao hàng nhanh", color: "#1890ff", desc: "Cam kết giao hàng 24-48 giờ toàn quốc an toàn." },
    { id: 2, icon: <FaUndoAlt />, title: "Đổi trả 60 ngày", color: "#52c41a", desc: "Hỗ trợ đổi trả tận nhà nếu không hài lòng." },
    { id: 3, icon: <FaHeadset />, title: "Hỗ trợ 24/7", color: "#faad14", desc: "Đội ngũ chuyên gia luôn sẵn sàng giải đáp." },
    { id: 4, icon: <FaShieldAlt />, title: "Bảo mật thông tin", color: "#722ed1", desc: "Mã hóa dữ liệu khách hàng chuẩn SSL quốc tế." },
    { id: 5, icon: <FaGift />, title: "Đặc quyền VIP", color: "#eb2f96", desc: "Tích điểm đổi quà cho mọi đơn hàng nhạc cụ." },
  ];

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#ff4d6d", borderRadius: 16 } }}>
      <div style={{ background: "#fcfcfc", minHeight: "100vh", paddingTop: "100px" }}>
        
        {/* SECTION 1: BLOG DESIGN */}
        {isBlog && (
          <div className="container" style={{ maxWidth: 1200, margin: "0 auto", padding: "0 20px" }}>
            <div style={{ textAlign: "center", marginBottom: 50 }}>
              <Title level={1} style={{ fontWeight: 900, fontSize: "3.5rem", marginBottom: 10 }}>Blog & Tin tức</Title>
              <Text type="secondary" style={{ fontSize: 18 }}>Cập nhật kiến thức âm nhạc và xu hướng nhạc cụ mới nhất</Text>
              <div style={{ maxWidth: 500, margin: "30px auto" }}>
                <Input 
                  placeholder="Tìm kiếm bài viết..." 
                  prefix={<SearchOutlined />} 
                  size="large" 
                  className="modern-search"
                />
              </div>
            </div>

            <Row gutter={[40, 40]}>
              {/* Cột trái: Bài viết tiêu điểm */}
              <Col xs={24} lg={16}>
                {latestPost ? (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                    <Card bordered={false} className="featured-card" cover={
                      <div className="card-image-zoom">
                        <img src={`${URL}${latestPost.image}`} alt="featured" />
                        <Tag color="red" className="category-tag">TIN MỚI NHẤT</Tag>
                      </div>
                    }>
                      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                        <Space split={<Divider type="vertical" />}>
                          <Text type="secondary"><CalendarOutlined /> {new Date(latestPost.created_at).toLocaleDateString('vi-VN')}</Text>
                          <Text type="secondary"><UserOutlined /> Âm Sắc Việt Editor</Text>
                        </Space>
                        <Link to={`/blog/${latestPost.slug}`}>
                          <Title level={2} className="hover-red">{latestPost.title}</Title>
                        </Link>
                        <Paragraph ellipsis={{ rows: 3 }} type="secondary" style={{ fontSize: 16 }}>
                          {latestPost.content?.replace(/<[^>]*>?/gm, '')}
                        </Paragraph>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <Button type="primary" size="large" shape="round" icon={<ArrowRightOutlined />}>Đọc tiếp</Button>
                          <Space size="large" style={{ fontSize: 18, color: "#8c8c8c" }}>
                            <HeartOutlined className="hover-red" />
                            <MessageOutlined className="hover-red" />
                            <ShareAltOutlined className="hover-red" />
                          </Space>
                        </div>
                      </Space>
                    </Card>
                  </motion.div>
                ) : <Empty />}
              </Col>

              {/* Cột phải: Danh sách đề xuất */}
              <Col xs={24} lg={8}>
                <Title level={4} style={{ marginBottom: 25, display: 'flex', alignItems: 'center' }}>
                  <Badge status="processing" color="red" /> Đề xuất cho bạn
                </Title>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  {otherPosts.map((post, idx) => (
                    <motion.div key={post.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                      <Link to={`/blog/${post.slug}`}>
                        <div className="mini-post-card">
                          <img src={`${URL}${post.images?.[0] || post.image}`} alt="mini" />
                          <div className="mini-content">
                            <Text type="secondary" style={{ fontSize: 12 }}>{new Date(post.created_at).toLocaleDateString()}</Text>
                            <Title level={5} style={{ margin: "4px 0", fontSize: 15 }} ellipsis={{ rows: 2 }}>{post.title}</Title>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  ))}
                </Space>
              </Col>
            </Row>
          </div>
        )}

        {/* SECTION 2: POLICY DESIGN */}
        {isPolicy && (
          <div className="policy-page">
            <div className="policy-hero">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                <Title style={{ color: '#fff', fontSize: '4rem', fontWeight: 900 }}>Chính Sách <span style={{ color: '#ff4d6d' }}>Tin Cậy</span></Title>
                <Text style={{ color: '#eee', fontSize: 20 }}>An tâm mua sắm - Trọn vẹn niềm tin tại Âm Sắc Việt</Text>
              </motion.div>
            </div>

            <div className="container" style={{ maxWidth: 1200, margin: "-60px auto 100px" }}>
              <Row gutter={[24, 24]}>
                {policies.map((p, idx) => (
                  <Col xs={24} md={12} lg={8} key={p.id}>
                    <motion.div whileHover={{ y: -10 }} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                      <Card className="policy-card" bordered={false}>
                        <div className="policy-icon" style={{ background: p.color }}>{p.icon}</div>
                        <Title level={4}>{p.title}</Title>
                        <Text type="secondary">{p.desc}</Text>
                        <Divider />
                        <Button type="link" style={{ padding: 0 }}>Xem chi tiết <ArrowRightOutlined /></Button>
                      </Card>
                    </motion.div>
                  </Col>
                ))}
              </Row>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .modern-search { border-radius: 50px !important; padding: 12px 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important; border: none; }
        .featured-card { border-radius: 30px; overflow: hidden; box-shadow: 0 20px 60px rgba(0,0,0,0.05); }
        .card-image-zoom { height: 450px; overflow: hidden; position: relative; }
        .card-image-zoom img { width: 100%; height: 100%; object-fit: cover; transition: 0.6s; }
        .featured-card:hover .card-image-zoom img { transform: scale(1.05); }
        .category-tag { position: absolute; top: 20px; left: 20px; padding: 5px 15px; font-weight: 700; border: none; }
        .hover-red:hover { color: #ff4d6d !important; cursor: pointer; transition: 0.3s; }
        
        .mini-post-card { display: flex; gap: 15px; align-items: center; padding: 10px; border-radius: 20px; transition: 0.3s; }
        .mini-post-card:hover { background: #fff; box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
        .mini-post-card img { width: 90px; height: 90px; border-radius: 15px; object-fit: cover; }
        
        .policy-hero { background: #141414; height: 400px; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; }
        .policy-card { border-radius: 30px; padding: 20px; text-align: center; box-shadow: 0 20px 40px rgba(0,0,0,0.05); height: 100%; }
        .policy-icon { width: 70px; height: 70px; border-radius: 22px; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 30px; color: #fff; }
      `}} />
    </ConfigProvider>
  );
};

export default BlogLayout;