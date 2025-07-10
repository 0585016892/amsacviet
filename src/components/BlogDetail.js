import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import postApi from "../api/postApi";
import { Container, Row, Col, Accordion, Card } from "react-bootstrap";
import {  Spinner } from "react-bootstrap";

const BlogDetail = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const data = await postApi.getBySlug(slug);
        setPost(data);
      } catch (error) {
        console.error("Không tìm thấy bài viết");
      }
    };
    fetchPost();
  }, [slug]);

  // 🛑 Đưa xử lý này xuống sau khi post != null
  if (!post) return <p className="text-center mt-5"> <Spinner animation="border" variant="warning" /></p>;

  // ✅ Đặt sau khi post đã có dữ liệu
  const contentParagraphs = post.content
    .split("\r\n")
    .filter((p) => p.trim() !== "");



    return (
        <div style={{ marginTop: "72px" }}>
              <div className="category-header">
        <ol
          className="breadcrumb"
          style={{ padding: "0 16px", marginBottom: "1rem" }}
        >
          <li className="breadcrumb-item">
            <a href="/" style={{ textDecoration: "none" }}>
              Trang chủ
            </a>
          </li>
                    <li className="breadcrumb-item active" aria-current="page">
                    <a href="/blog" style={{ textDecoration: "none" }}>
              Blog
            </a>
          
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            Chi tiết bài viết
          </li>
        </ol>
      </div>
            <Container className="my-5">
          
      <Row>
        {/* LEFT CONTENT */}
        <Col md={8}>
          <h2 className="fw-bold mb-2">{post.title}</h2>
          <p className="text-muted mb-4">
            Về YODY • Ngày đăng: {new Date(post.created_at).toLocaleDateString()}
          </p>

          <img
            src={`https://finlyapi-production.up.railway.app${post.image}`}
            alt={post.title}
            className="img-fluid rounded mb-4"
          />

              {contentParagraphs.map((paragraph, index) => (
                <React.Fragment key={index}>
                  <p>{paragraph}</p>

                  {/* Hiển thị ảnh sau đoạn 1 và 2 nếu có */}
                  {post.images[index] && (
                    <img
                      src={`https://finlyapi-production.up.railway.app${post.images[index]}`}
                      alt={`ảnh ${index}`}
                      style={{ width: "100%", maxWidth: "600px", display: "block", margin: "1rem auto" }}
                    />
                  )}
                </React.Fragment>
              ))}

        </Col>

        {/* RIGHT SIDEBAR */}
        <Col md={4}>
          <div
            className="bg-light rounded p-3"
            style={{ border: "1px solid #e0e0e0" }}
          >
            <h5 className="fw-bold mb-3">Danh mục</h5>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  Tại sao {post.title.split(":")[0]} lại khiến mọi người mê mẩn?
                </Accordion.Header>
                <Accordion.Body>
                  <ul style={{ paddingLeft: "1rem", marginBottom: 0 }}>
                    <li>Phom dáng thông minh – Tôn dáng cực đỉnh</li>
                    <li>Chất vải thoáng mát – Mặc cả ngày vẫn dễ chịu</li>
                    <li>Dễ phối – Chuẩn “chân ái” mùa hè</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </div>
        </Col>
      </Row>
    </Container>
      </div>
 
  );
};

export default BlogDetail;
