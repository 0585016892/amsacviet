import { Container, Row, Col, Card, Image, Form, Button, Spinner } from 'react-bootstrap';
import { FaShareAlt, FaCommentAlt, FaHeart, FaSearch } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import postApi from '../api/postApi';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion"; // 👉 Thêm motion
import { socket } from "../api/socket";  // 👈 import socket
import { useLocation } from "react-router-dom";
import {
  FaShippingFast,
  FaUndoAlt,
  FaHeadset,
  FaShieldAlt,
  FaGift,
} from "react-icons/fa";
const BlogLayout = () => {
  const location = useLocation();
  const [posts, setPosts] = useState([]);
  const URL = process.env.REACT_APP_WEB_URL;


  const isBlog = location.pathname === "/blog";
  const isPolicy = location.pathname === "/chinh-sach";

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await postApi.getAll();
      setPosts(res.posts || []);
    };

    fetchPosts();
  }, []);
// 👇 Lắng nghe realtime slide update
  useEffect(() => {
    socket.on("postStatusUpdated", (data) => {
      setPosts((prev) =>
        prev.map((s) =>
          s.id === Number(data.postId) ? { ...s, status: data.status } : s
        )
      );
    });

    return () => {
      socket.off("postStatusUpdated");
    };
  }, []);
  const latestPost = posts[0];
  const recommendedPosts = posts.slice(1);
  const policies = [
  {
    id: 1,
    icon: <FaShippingFast size={50} color="#fff" />,
    title: "Giao hàng nhanh chóng",
    shortDesc: "Cam kết giao hàng 24-48 giờ an toàn.",
    longDesc:
      "Chúng tôi đảm bảo sản phẩm được giao đến tay khách hàng nhanh nhất, an toàn và đúng hẹn. Có hỗ trợ theo dõi đơn hàng trực tuyến.",
    bg: "linear-gradient(135deg, #1e3c72, #2a5298)",
  },
  {
    id: 2,
    icon: <FaUndoAlt size={50} color="#fff" />,
    title: "Đổi trả dễ dàng",
    shortDesc: "Hỗ trợ đổi trả trong vòng 7 ngày.",
    longDesc:
      "Nếu sản phẩm gặp vấn đề về chất lượng hoặc không đúng mô tả, bạn có thể dễ dàng đổi trả trong 7 ngày mà không mất phí.",
     bg: "linear-gradient(135deg, #11998e, #38ef7d)",
  },
  {
    id: 3,
    icon: <FaHeadset size={50} color="#fff" />,
    title: "Hỗ trợ 24/7",
    shortDesc: "Đội ngũ CSKH luôn sẵn sàng.",
    longDesc:
      "Chúng tôi hỗ trợ khách hàng mọi lúc, giải đáp thắc mắc, khiếu nại và hướng dẫn mua hàng mọi ngày, 24/7.",
    bg: "linear-gradient(135deg, #f7971e, #ffd200)",
  },
  {
    id: 4,
    icon: <FaShieldAlt size={50} color="#fff" />,
    title: "Bảo mật tuyệt đối",
    shortDesc: "Thông tin khách hàng được bảo mật.",
    longDesc:
      "Mọi thông tin khách hàng được lưu trữ an toàn và bảo mật tuyệt đối theo các tiêu chuẩn bảo mật quốc tế.",
    bg: "linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)",
  },
  {
    id: 5,
    icon: <FaGift size={50} color="#fff" />,
    title: "Ưu đãi & Quà tặng",
    shortDesc: "Chương trình quà tặng hấp dẫn.",
    longDesc:
      "Khách hàng thân thiết sẽ nhận được nhiều ưu đãi, voucher và quà tặng đặc biệt từ cửa hàng.",
    bg: "linear-gradient(135deg, #ff6a00, #ee0979)",
  },
];

  return (
    <div style={{ marginTop: "72px" }}>
      <Container className="my-4">
        {/* 🔍 Search Bar */}
        {isBlog && (
          <>
          
           <Row className="mb-4">
          <Col className="d-flex justify-content-center">
            <div className="search-form" style={{ width: "50%" }}>
              <form className="search-form d-flex align-items-center">
                <Form.Control
                  type="search"
                  placeholder="Tìm kiếm"
                  className="me-2 rounded-lg search"
                />
                <button
                  className='position-absolute'
                  type="submit"
                  style={{ background: "none", border: "none", right: 18 }}
                >
                  <FaSearch size={20} />
                </button>
              </form>
            </div>
          </Col>
        </Row>

        <Row>
          {/* 📄 Left Column: Latest Article */}
          <Col md={8} className="mb-4">
            <h2 className="mb-3">Bài viết mới nhất</h2>
            {latestPost && latestPost.status === 'published' && (
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="shadow-sm border-0">
                  <Card.Img
                    variant="top"
                    src={`${URL}${latestPost.image}`}
                    alt={latestPost.title}
                    style={{ height: 'auto', objectFit: 'cover' }}
                  />
                  <Card.Body>
                    <Card.Subtitle className="mb-2 text-muted">{latestPost.category}</Card.Subtitle>
                    <Link
                      to={`/blog/${latestPost.slug}`}
                      className="d-flex text-decoration-none text-dark"
                    >
                      <Card.Title
                        as="h3"
                        className="text-primary fw-bold mb-2"
                        style={{ fontSize: '2rem' }}
                      >
                        {latestPost.title}
                      </Card.Title>
                    </Link>
                    <div className="mb-3 text-secondary">
                      <FaShareAlt className="me-3" />
                      <FaCommentAlt className="me-3" />
                      <FaHeart />
                    </div>
                    <Card.Text>
                      {latestPost.content?.slice(0, 300)}...
                    </Card.Text>
                  </Card.Body>
                  <Card.Footer
                    className="text-end bg-white border-top-0 pt-0 pb-3 pe-3 text-muted"
                    style={{ fontSize: '0.85rem' }}
                  >
                    FINLY | Ngày đăng: {new Date(latestPost.created_at).toLocaleDateString()}
                  </Card.Footer>
                </Card>
              </motion.div>
            )}
          </Col>

          {/* 🎯 Right Column: Recommended Articles */}
          <Col md={4} className="mb-4">
            <h2 className="mb-3">Đề xuất cho bạn</h2>
            {recommendedPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Card
                  className="d-flex flex-row align-items-start border-0 shadow-sm mb-3"
                  style={{ cursor: 'pointer' }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="d-flex text-decoration-none text-dark"
                  >
                    <Image
                      src={`${URL}${post.images[0]}`}
                      rounded
                      thumbnail
                      className="me-3"
                      style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                    <Card.Body className="p-0">
                      <Card.Subtitle className="text-muted" style={{ fontSize: '0.75rem' }}>
                        FINLY | Ngày đăng: {new Date(post.created_at).toLocaleDateString()}
                      </Card.Subtitle>
                      <Card.Title as="h5" className="mb-0 lh-base">
                        {post.title}
                      </Card.Title>
                    </Card.Body>
                  </Link>
                </Card>
              </motion.div>
            ))}
          </Col>
            </Row>
          </>
        )}
        {isPolicy && (
          <>
         <div style={{
        background: "linear-gradient(180deg, #f0f4f8 0%, #ffffff 100%)",
        paddingBottom: "80px",
      }}>
      <div
         style={{
          background: "url('/banner-policy.jpg') center/cover no-repeat",
          height: "280px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
                color: 'rgb(68 54 175)',
            fontSize: "3rem",
            textShadow: "2px 2px 8px rgba(0,0,0,0.5)",
            fontWeight: "700",
          }}
        >
          Chính sách khách hàng
        </h1>
      </div>

      <Container style={{ marginTop: "-60px" }}>
        <p
          className="text-center text-muted mb-5" style={{ fontSize: "1.1rem" }}
        >
          Chúng tôi cam kết mang đến trải nghiệm mua sắm an toàn, nhanh chóng và thuận tiện.
        </p>

        <Row className="g-4">
          {policies.map((policy, index) => (
            <Col key={policy.id} xs={12} md={6} lg={4}>
              <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="flip-card" style={{ perspective: "1000px" }}>
                  <div
                    className="flip-card-inner"
                    style={{
                      position: "relative",
                      width: "100%",
                      height: "300px",
                      textAlign: "center",
                      transition: "transform 0.8s",
                      transformStyle: "preserve-3d",
                      cursor: "pointer",
                    }}
                  >
                    {/* Front */}
                    <div
                      className="flip-card-front"
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        borderRadius: "20px",
                        background: policy.bg,
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "20px",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                      }}
                    >
                      <div className="mb-3">{policy.icon}</div>
                      <h4 className="fw-bold mb-2">{policy.title}</h4>
                      <p style={{ fontSize: "0.95rem" }}>{policy.shortDesc}</p>
                    </div>

                    {/* Back */}
                    <div
                      className="flip-card-back"
                      style={{
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        backfaceVisibility: "hidden",
                        borderRadius: "20px",
                        background: policy.bg,
                        color: "white",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "20px",
                        transform: "rotateY(180deg)",
                        boxShadow: "0 10px 30px rgba(0,0,0,0.4)",
                      }}
                    >
                      <h5 className="fw-bold mb-3">Chi tiết</h5>
                      <p style={{ fontSize: "0.9rem", lineHeight: "1.5" }}>
                        {policy.longDesc}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Flip effect bằng JS */}
      <style>
        {`
          .flip-card:hover .flip-card-inner {
            transform: rotateY(180deg);
          }
        `}
      </style>
    </div>
          </>
        )}
      </Container>
    </div>
  );
};

export default BlogLayout;
