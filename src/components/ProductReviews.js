import React, { useEffect, useState } from "react";
import { Form, Button, Card, Badge, Row, Col, Pagination, Image } from "react-bootstrap";
import { FaStar, FaRegStar, FaRegThumbsUp, FaUpload } from "react-icons/fa";
import productApi from "../api/productApi";
import { io } from "socket.io-client";
function ProductReviews({ productId, user }) {
  const [reviews, setReviews] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 5 });
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [content, setContent] = useState("");
  const [images, setImages] = useState([]);
  const URL = process.env.REACT_APP_WEB_URL;
  const URL_WEB = process.env.REACT_APP_WEB_URL;
  const socket = io(URL_WEB);
  useEffect(() => {
    loadReviews(1);
    // eslint-disable-next-line
    // Lắng nghe socket khi review được duyệt
  
    socket.on("reviewApproved", (data) => {
      console.log("Review đã được duyệt:", data);
      // gọi lại API để cập nhật danh sách
      loadReviews(pagination.page);
    });
      socket.on("reviewDeleted", (data) => {
      console.log("Review đã được duyệt:", data);
      // gọi lại API để cập nhật danh sách
      loadReviews(pagination.page);
    });
    return () => {
      socket.off("reviewApproved");
    };
  }, [productId]);

  const loadReviews = async (page) => {
    const backendData = await productApi.getReviews(productId, { page, limit: pagination.limit });

    const parsedReviews = backendData.data.map((r) => {
      let imgs = [];
      try {
        imgs = r.images && r.images !== "null" && r.images !== "" ? JSON.parse(r.images) : [];
      } catch (e) {
        imgs = [];
      }
      return { ...r, images: imgs };
    });

    setReviews(parsedReviews);
    setPagination({
      page: backendData.pagination.page,
      totalPages: backendData.pagination.totalPages,
      total: backendData.pagination.total,
      limit: backendData.pagination.limit,
    });
  };

  const handleUpload = async (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      const uploaded = await productApi.uploadReviewImages(files);
      setImages((prev) => [...prev, ...uploaded]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Bạn cần đăng nhập để đánh giá!");
      return;
    }
    await productApi.createReview({
      product_id: productId,
      user_id: user.id,
      rating,
      content,
      images: images.length > 0 ? JSON.stringify(images) : null,
    });
    setContent("");
    setImages([]);
    setRating(5);
    loadReviews(1);
  };

  const handleLike = async (reviewId) => {
    await productApi.likeReview(reviewId);
    loadReviews(pagination.page);
  };
console.log(reviews);

  return (
    <div className="mt-5">
      <h4 className="fw-bold mb-4 text-primary">Đánh giá sản phẩm</h4>

      {/* Form đánh giá */}
      {user ? (
        <Card className="mb-5 shadow-sm border-0 rounded-3">
          <Card.Body>
            <h5 className="fw-bold mb-3">Chia sẻ trải nghiệm của bạn</h5>
            <Form onSubmit={handleSubmit}>
              {/* Rating */}
              <div className="mb-3 d-flex align-items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      cursor: "pointer",
                      fontSize: "1.8rem",
                      color: star <= (hoverRating || rating) ? "#ffc107" : "#ccc",
                      marginRight: 5,
                      transition: "color 0.2s",
                    }}
                  >
                    {star <= (hoverRating || rating) ? <FaStar /> : <FaRegStar />}
                  </span>
                ))}
                <span className="ms-2 text-muted">{rating} sao</span>
              </div>

              {/* Nội dung */}
              <Form.Group className="mb-3">
                <Form.Control
                  as="textarea"
                  rows={3}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                  required
                  className="border-2 rounded-3"
                />
              </Form.Group>

              {/* Upload ảnh */}
              <div className="mb-3 d-flex flex-wrap align-items-center gap-2">
                <Form.Label
                  className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2 mb-2"
                  style={{ cursor: "pointer" }}
                >
                  <FaUpload /> Thêm ảnh
                  <Form.Control
                    type="file"
                    multiple
                    onChange={handleUpload}
                    className="d-none"
                  />
                </Form.Label>

                {images.map((img, i) => (
                  <Image
                    key={i}
                    src={`${URL}/uploads/reviews/${img}`}
                    rounded
                    thumbnail
                    style={{ width: "80px", height: "80px", objectFit: "cover" }}
                  />
                ))}
              </div>

              <Button type="submit" variant="primary" className="rounded-3">
                Gửi đánh giá
              </Button>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <p className="text-muted">Vui lòng đăng nhập để viết đánh giá.</p>
      )}

      {/* Danh sách đánh giá */}
      {reviews.length === 0 ? (
        <p className="text-muted">Chưa có đánh giá nào.</p>
      ) : (
     <>
    {reviews
      .filter(r => r.is_verified) // Chỉ lấy đánh giá đã duyệt
      .map((r) => (
        <Card className="shadow-sm border-0 rounded-3 p-3">
    <h5 className="fw-bold mb-3">Đánh giá từ khách hàng</h5>
    {reviews
      .filter(r => r.is_verified) // Chỉ lấy đánh giá đã duyệt
      .map((r) => (
        <Card key={r.id} className="mb-3 shadow-sm border-0 rounded-3 hover-shadow p-2">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-1">
            <div>
              <strong>{r.full_name}</strong>
              <div className="d-flex align-items-center mt-1">
                {[1,2,3,4,5].map(star =>
                  star <= r.rating ? <FaStar key={star} color="#ffc107" /> : <FaRegStar key={star} color="#ccc" />
                )}
                <span className="ms-2 text-muted small">{r.rating} sao</span>
              </div>
            </div>
            <small className="text-muted">{new Date(r.created_at).toLocaleDateString("vi-VN")}</small>
          </div>

          {/* Nội dung */}
          <Card.Text style={{ whiteSpace: "pre-line", marginTop: "5px" }}>{r.content}</Card.Text>

          {/* Hình ảnh review */}
          {Array.isArray(r.images) && r.images.length > 0 && (
            <Row className="mb-2 g-2">
              {r.images.map((img, i) => (
                <Col xs={4} sm={3} md={2} key={i}>
                  <Image
                    src={`${URL}/uploads/reviews/${img}`}
                    rounded
                    thumbnail
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Col>
              ))}
            </Row>
          )}

          {/* Footer */}
          <div className="d-flex align-items-center gap-3 mt-1">
            <Button
              size="sm"
              variant="outline-secondary"
              onClick={() => handleLike(r.id)}
              className="d-flex align-items-center gap-1"
            >
              <FaRegThumbsUp /> {r.helpful_count || 0}
            </Button>
            {r.is_verified && <Badge bg="success">Đã mua hàng</Badge>}
          </div>
        </Card>
      ))}
  </Card>
      ))}
  </>
      )}

      <style jsx>{`
        .hover-shadow:hover {
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
          transition: box-shadow 0.3s;
        }
      `}</style>
    </div>
  );
}

export default ProductReviews;
