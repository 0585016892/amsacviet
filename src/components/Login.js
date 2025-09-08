import React, { useState } from "react";
import {
  Form,
  Button,
  Alert,
  Spinner,
  Card,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../api/userApi";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { FaMusic } from "react-icons/fa";

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
      login(user);
      navigate("/");
    } catch (error) {
      setErrorMsg(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-bg">
      {/* Visualizer background */}
      <div className="visualizer">
        {[...Array(20)].map((_, i) => (
          <span key={i} style={{ animationDelay: `${i * 0.1}s` }}></span>
        ))}
      </div>

      {/* Login Card */}
      <motion.div
        initial={{ opacity: 0, y: -40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: "400px", zIndex: 10 }}
      >
        <Card
          className="shadow-lg p-4 text-light"
          style={{
            background: "rgba(30,30,50,0.6)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "20px",
            backdropFilter: "blur(16px)",
            boxShadow: "0 0 25px rgba(255,75,95,0.4)",
          }}
        >
          <motion.div
            className="d-flex justify-content-center mb-3"
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <FaMusic size={55} color="#ff4d6d" />
          </motion.div>

          <motion.h2
            className="text-center mb-4 fw-bold"
            style={{
              letterSpacing: "1px",
              background: "linear-gradient(90deg, #ff4d6d, #ff758c)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Đăng nhập
          </motion.h2>

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
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="shadow-sm"
                style={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                }}
              />
            </Form.Group>

            <Form.Group controlId="formPassword" className="mb-4">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="shadow-sm"
                style={{
                  borderRadius: "12px",
                  border: "1px solid rgba(255,255,255,0.2)",
                  background: "rgba(255,255,255,0.05)",
                  color: "#fff",
                }}
              />
            </Form.Group>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                className="w-100 fw-bold"
                style={{
                  background: "linear-gradient(90deg,#ff4d6d,#ff758c)",
                  border: "none",
                  borderRadius: "12px",
                  padding: "10px",
                  fontSize: "16px",
                  boxShadow: "0 4px 15px rgba(255,75,95,0.4)",
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Signing in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </motion.div>
          </Form>

          <div className="text-center mt-3">
            <small className="text-muted" style={{color:'rgb(255 255 255 / 75%)'}}>
              Don’t have an account?{" "}
              <a
                href="/register"
                style={{
                  color: "#ff758c",
                  fontWeight: "bold",
                  textDecoration: "none",
                }}
              >
                Sign up
              </a>
            </small>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default Login;
