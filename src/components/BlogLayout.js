import { Container, Row, Col, Card, Image, Form, Button, Spinner } from 'react-bootstrap';
import { FaShareAlt, FaCommentAlt, FaHeart, FaSearch } from 'react-icons/fa';
import React, { useEffect, useState } from 'react';
import postApi from '../api/postApi';
import { Link } from 'react-router-dom';
import { motion } from "framer-motion"; // 👉 Thêm motion

const BlogLayout = () => {
  const [posts, setPosts] = useState([]);
  const URL = process.env.REACT_APP_WEB_URL;

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await postApi.getAll();
      setPosts(res.posts || []);
    };

    fetchPosts();
  }, []);

  const latestPost = posts[0];
  const recommendedPosts = posts.slice(1);

  return (
    <div style={{ marginTop: "72px" }}>
      <Container className="my-4">
        {/* 🔍 Search Bar */}
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
      </Container>
    </div>
  );
};

export default BlogLayout;
