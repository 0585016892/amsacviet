import React, { useEffect, useState } from "react";
import { 
  Typography, Rate, Progress, Button, Input, Upload, 
  Avatar, List, Space, Badge, Image as AntImage, 
  Empty, ConfigProvider, message, Divider ,Col , Row
} from "antd";
import { 
  StarFilled, CameraOutlined, LikeOutlined, 
  CheckCircleFilled, LoadingOutlined, PlusOutlined 
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import productApi from "../api/productApi";
import { io } from "socket.io-client";

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const ProductReviews = ({ productId, user }) => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);

  const URL = process.env.REACT_APP_WEB_URL;
  const URL_WEB = process.env.REACT_APP_WEB_URL;

  useEffect(() => {
    loadReviews();
    const socket = io(URL_WEB);
    
    socket.on("reviewApproved", () => loadReviews());
    socket.on("reviewDeleted", () => loadReviews());

    return () => socket.disconnect();
  }, [productId]);

  const loadReviews = async () => {
    setLoading(true);
    try {
      const res = await productApi.getReviews(productId);
      const parsedData = res.data.map(r => ({
        ...r,
        images: r.images ? JSON.parse(r.images) : []
      }));
      setReviews(parsedData);
    } catch (err) {
      message.error("Không thể tải đánh giá");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!user) return message.warning("Vui lòng đăng nhập để đánh giá");
    if (!content.trim()) return message.warning("Vui lòng nhập nội dung");

    try {
      const uploadedImages = fileList.map(f => f.response || f.name); // Giả sử API upload trả về tên file
      await productApi.createReview({
        product_id: productId,
        user_id: user.id,
        rating,
        content,
        images: JSON.stringify(uploadedImages),
      });
      message.success("Đánh giá của bạn đã được gửi và đang chờ duyệt!");
      setContent("");
      setFileList([]);
      setRating(5);
    } catch (err) {
      message.error("Gửi đánh giá thất bại");
    }
  };

  // Tính toán số liệu thống kê
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <ConfigProvider theme={{ token: { colorPrimary: "#ff4d6d" } }}>
      <div style={{ marginTop: 60, paddingBottom: 40 }}>
        <Title level={3} style={{ marginBottom: 30, fontWeight: 800 }}>
          Khách hàng đánh giá <span style={{ color: "#ff4d6d" }}>({reviews.length})</span>
        </Title>

        <div className="review-container">
          {/* --- PHẦN TỔNG QUAN RATING --- */}
          <div className="rating-overview-card">
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} md={8} style={{ textAlign: 'center', borderRight: '1px solid #f0f0f0' }}>
                <Title level={1} style={{ margin: 0, color: "#ff4d6d", fontSize: "3.5rem" }}>{averageRating}</Title>
                <Rate disabled allowHalf defaultValue={Number(averageRating)} style={{ fontSize: 20 }} />
                <div style={{ marginTop: 10 }}>
                  <Text type="secondary">Xếp hạng trung bình</Text>
                </div>
              </Col>
              <Col xs={24} md={16}>
                {[5, 4, 3, 2, 1].map(star => {
                  const count = reviews.filter(r => Math.round(r.rating) === star).length;
                  const percent = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                  return (
                    <div key={star} style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <Text style={{ width: 60 }}>{star} sao</Text>
                      <Progress 
                        percent={percent} 
                        showInfo={false} 
                        strokeColor="#ff4d6d" 
                        style={{ flex: 1, margin: '0 15px' }} 
                      />
                      <Text type="secondary" style={{ width: 40 }}>{count}</Text>
                    </div>
                  );
                })}
              </Col>
            </Row>
          </div>

          {/* --- FORM GỬI ĐÁNH GIÁ --- */}
          {user && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="write-review-section">
              <Title level={4}>Viết đánh giá của bạn</Title>
              <div style={{ background: "#fcfcfc", padding: 25, borderRadius: 20, border: "1px solid #f0f0f0" }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                    <Text strong>Chất lượng sản phẩm:</Text>
                    <Rate value={rating} onChange={setRating} style={{ fontSize: 28 }} />
                    <Text type="warning" strong>{rating === 5 ? "Rất hài lòng" : "Hài lòng"}</Text>
                  </div>

                  <TextArea 
                    rows={4} 
                    placeholder="Sản phẩm dùng tốt không? Âm thanh như thế nào? Hãy chia sẻ cho mọi người nhé..." 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    style={{ borderRadius: 12, padding: 15 }}
                  />

                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 10 }}>Thêm hình ảnh thực tế:</Text>
                    <Upload
                      listType="picture-card"
                      fileList={fileList}
                      onChange={({ fileList }) => setFileList(fileList)}
                      beforeUpload={() => false} // Chặn upload tự động để xử lý tay
                    >
                      {fileList.length >= 5 ? null : (
                        <div>
                          <PlusOutlined />
                          <div style={{ marginTop: 8 }}>Tải lên</div>
                        </div>
                      )}
                    </Upload>
                  </div>

                  <Button 
                    type="primary" 
                    size="large" 
                    onClick={handleSubmit}
                    style={{ height: 50, padding: '0 40px', borderRadius: 25, fontWeight: 700 }}
                  >
                    Gửi đánh giá ngay
                  </Button>
                </Space>
              </div>
            </motion.div>
          )}

          {/* --- DANH SÁCH REVIEW --- */}
          <Divider orientation="left" style={{ marginTop: 50 }}>Tất cả đánh giá</Divider>
          
          <div className="reviews-list-wrapper">
            {loading ? (
              <div style={{ textAlign: 'center', padding: 50 }}><LoadingOutlined style={{ fontSize: 40, color: "#ff4d6d" }} /></div>
            ) : reviews.length === 0 ? (
              <Empty description="Chưa có đánh giá nào cho sản phẩm này" />
            ) : (
              <List
                itemLayout="vertical"
                dataSource={reviews.filter(r => r.is_verified || r.status === 'approved')}
                renderItem={(item) => (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="review-item">
                    <List.Item
                      key={item.id}
                      actions={[
                        <Button type="link" icon={<LikeOutlined />}>Hữu ích ({item.helpful_count || 0})</Button>,
                        <Text type="secondary" style={{ fontSize: 12 }}>Đã đánh giá vào {new Date(item.created_at).toLocaleDateString('vi-VN')}</Text>
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<Avatar src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.full_name}`} size={50} />}
                        title={
                          <Space>
                            <Text strong style={{ fontSize: 16 }}>{item.full_name}</Text>
                            <Badge status="success" text={<Text type="success" style={{ fontSize: 12 }}><CheckCircleFilled /> Đã mua hàng</Text>} />
                          </Space>
                        }
                        description={<Rate disabled defaultValue={item.rating} style={{ fontSize: 12 }} />}
                      />
                      <Paragraph style={{ fontSize: 15, color: "#444", marginTop: 10 }}>{item.content}</Paragraph>
                      
                      {item.images && item.images.length > 0 && (
                        <div className="review-images-grid">
                          <AntImage.PreviewGroup>
                            {item.images.map((img, idx) => (
                              <AntImage 
                                key={idx} 
                                src={`${URL}/uploads/reviews/${img}`} 
                                className="review-img"
                              />
                            ))}
                          </AntImage.PreviewGroup>
                        </div>
                      )}
                    </List.Item>
                  </motion.div>
                )}
              />
            )}
          </div>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .review-container { max-width: 1000px; margin: 0 auto; }
          .rating-overview-card { background: #fff; padding: 40px; border-radius: 24px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); margin-bottom: 40px; border: 1px solid #f0f0f0; }
          .write-review-section { margin-bottom: 50px; }
          .review-item { background: #fff; padding: 25px; border-radius: 20px; margin-bottom: 20px; border-bottom: 1px solid #f0f0f0; transition: 0.3s; }
          .review-item:hover { background: #fafafa; }
          .review-images-grid { display: flex; gap: 12px; flex-wrap: wrap; margin-top: 15px; }
          .review-img { width: 100px !important; height: 100px !important; object-fit: cover; border-radius: 12px; border: 1px solid #eee; }
          .ant-rate { color: #ff4d6d; }
          .ant-progress-bg { height: 10px !important; }
        `}} />
      </div>
    </ConfigProvider>
  );
};

export default ProductReviews;