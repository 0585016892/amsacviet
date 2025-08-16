import React, { useState } from "react";
import { Form, Button, Container, Alert, Spinner, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion"; // 👉 Thêm

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const { token, user } = await loginUser(email, password);
      localStorage.setItem("token", token);
      login(user); // <== cập nhật context
      navigate("/");
    } catch (error) {
      setErrorMsg(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      className="d-flex justify-content-center align-items-center"
      style={{ minHeight: "100vh" }}
    >
      {/* 👉 Card có animation khi vào */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "400px" }}
      >
        <Card className="shadow-lg p-4 rounded">
          <motion.h3
            className="text-center mb-4 text-primary"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            Đăng nhập
          </motion.h3>

          {/* 👉 Hiện lỗi có hiệu ứng */}
          <AnimatePresence>
            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="danger">{errorMsg}</Alert>
              </motion.div>
            )}
          </AnimatePresence>

          <Form onSubmit={handleLogin}>
            <Form.Group controlId="formEmail" className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Nhập email của bạn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="shadow-sm"
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-4">
              <Form.Label>Mật khẩu</Form.Label>
              <Form.Control
                type="password"
                placeholder="Nhập mật khẩu"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="shadow-sm"
              />
            </Form.Group>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Đang đăng nhập...
                  </>
                ) : (
                  "Đăng nhập"
                )}
              </Button>
            </motion.div>
          </Form>

          <div className="text-center mt-3">
            <small className="text-muted">
              Chưa có tài khoản? <a href="/register">Đăng ký</a>
            </small>
          </div>
        </Card>
      </motion.div>
    </Container>
  );
};

export default Login;
