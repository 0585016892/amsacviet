import React, { useState } from "react";
import { 
  Form, 
  Input, 
  Button, 
  Typography, 
  Card, 
  message, 
  ConfigProvider, 
  theme 
} from "antd";
import { 
  MailOutlined, 
  LockOutlined, 
  CustomerServiceFilled 
} from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { loginUser } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const { Title, Text } = Typography;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const { email, password } = values;
      const { token, user } = await loginUser(email, password);
      
      localStorage.setItem("token", token);
      login(user);
      message.success("Chào mừng bạn quay trở lại!");
      navigate("/");
    } catch (error) {
      // Hiển thị lỗi từ API bằng message antd
      message.error(error || "Đăng nhập thất bại, vui lòng kiểm tra lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#ff4d6d",
          borderRadius: 12,
        },
      }}
    >
      <div className="login-bg" style={{ 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#0a0a12',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Giữ nguyên Visualizer từ code cũ của bạn */}
        <div className="visualizer">
          {[...Array(20)].map((_, i) => (
            <span key={i} style={{ animationDelay: `${i * 0.1}s` }}></span>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          style={{ width: "100%", maxWidth: 420, zIndex: 10, padding: 20 }}
        >
          <Card
            bordered={false}
            style={{
              background: "rgba(255, 255, 255, 0.05)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              boxShadow: "0 25px 50px rgba(0,0,0,0.5)",
              borderRadius: 24,
            }}
          >
            <div style={{ textAlign: 'center', marginBottom: 30 }}>
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
              >
                <CustomerServiceFilled style={{ fontSize: 50, color: '#ff4d6d' }} />
              </motion.div>
              <Title level={2} style={{ 
                marginTop: 15, 
                marginBottom: 5,
                background: "linear-gradient(90deg, #ff4d6d, #ff758c)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
                Âm Sắc Màu
              </Title>
              <Text type="secondary">Đăng nhập để tiếp tục trải nghiệm</Text>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập Email!' },
                  { type: 'email', message: 'Email không đúng định dạng!' }
                ]}
              >
                <Input 
                  prefix={<MailOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />} 
                  placeholder="Email của bạn"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password 
                  prefix={<LockOutlined style={{ color: 'rgba(255,255,255,0.45)' }} />} 
                  placeholder="Mật khẩu"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
                />
              </Form.Item>

              <Form.Item>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    block
                    style={{
                      height: 50,
                      fontWeight: 'bold',
                      fontSize: 16,
                      background: "linear-gradient(90deg, #ff4d6d, #ff758c)",
                      border: 'none',
                      boxShadow: "0 10px 20px rgba(255, 77, 109, 0.3)"
                    }}
                  >
                    ĐĂNG NHẬP
                  </Button>
                </motion.div>
              </Form.Item>
            </Form>

            <div style={{ textAlign: 'center', marginTop: 10 }}>
              <Text style={{ color: 'rgba(255,255,255,0.65)' }}>
                Chưa có tài khoản?{" "}
                <Link to="/register" style={{ color: '#ff758c', fontWeight: 'bold' }}>
                  Đăng ký ngay
                </Link>
              </Text>
            </div>
          </Card>
        </motion.div>

        {/* CSS cho Visualizer nếu chưa có trong file CSS chung */}
        <style dangerouslySetInnerHTML={{ __html: `
          .visualizer {
            position: absolute;
            bottom: 0;
            display: flex;
            align-items: flex-end;
            gap: 5px;
            opacity: 0.3;
          }
          .visualizer span {
            width: 10px;
            height: 20px;
            background: #ff4d6d;
            animation: bounce 1.5s infinite ease-in-out;
          }
          @keyframes bounce {
            0%, 100% { height: 20px; }
            50% { height: 150px; }
          }
        `}} />
      </div>
    </ConfigProvider>
  );
};

export default Login;