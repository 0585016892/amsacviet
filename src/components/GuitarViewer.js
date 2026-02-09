import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF, Float, ContactShadows } from "@react-three/drei";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Typography, Button, Space, ConfigProvider } from "antd";
import { ArrowRightOutlined, ExpandOutlined } from "@ant-design/icons";

const { Title, Paragraph, Text } = Typography;

function PianoModel(props) {
  const { scene } = useGLTF("/models/a.glb");
  const ref = useRef();
  
  // Hiệu ứng tự quay nhẹ nhàng và bồng bềnh
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.y = Math.sin(t / 4) * 0.2;
    ref.current.position.y = Math.sin(t / 1.5) * 0.1;
  });

  return (
    <primitive
      ref={ref}
      object={scene}
      {...props}
      castShadow
      receiveShadow
    />
  );
}

const PianoViewer = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#ff4d6d",
        },
      }}
    >
      <div className="piano-viewer-container" style={{
        position: 'relative',
        minHeight: '80vh',
        background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
        borderRadius: '40px',
        margin: '20px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center'
      }}>
        
        <div className="container" style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          width: '100%', 
          display: 'flex', 
          flexWrap: 'wrap',
          padding: '40px'
        }}>
          
          {/* Left: Content Area */}
          <div style={{ flex: '1 1 450px', zIndex: 10 }}>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <Space direction="vertical" size="large">
                <div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Text strong style={{ color: '#ff4d6d', letterSpacing: 4, textTransform: 'uppercase' }}>
                      Premium Sound
                    </Text>
                  </motion.div>
                  
                  <Title style={{ fontSize: '64px', fontWeight: 800, margin: '10px 0', lineHeight: 1.1 }}>
                    Piano <br /> <span style={{ color: '#ff4d6d' }}>Collection</span>
                  </Title>
                </div>

                <Paragraph style={{ fontSize: '18px', color: '#595959', maxWidth: 400, lineHeight: 1.6 }}>
                  Đánh thức đam mê âm nhạc với những phím đàn tinh xảo. 
                  Trải nghiệm công nghệ âm thanh đa chiều 3D ngay tại không gian của bạn.
                </Paragraph>

                <Space size="middle" style={{ marginTop: 20 }}>
                  <Button 
                    type="primary" 
                    size="large" 
                    icon={<ArrowRightOutlined />}
                    style={{ 
                      height: 56, 
                      padding: '0 35px', 
                      borderRadius: 18, 
                      fontSize: 16, 
                      fontWeight: 600,
                      boxShadow: '0 10px 25px rgba(255, 77, 109, 0.3)' 
                    }}
                  >
                    <Link to="/category/dan-piano-co" style={{ color: 'inherit' }}>Khám phá ngay</Link>
                  </Button>
                  
                  <Button 
                    type="text" 
                    size="large" 
                    icon={<ExpandOutlined />}
                    style={{ height: 56, fontSize: 16, fontWeight: 600 }}
                  >
                    Xoay 360°
                  </Button>
                </Space>
                
                <div style={{ marginTop: 40, display: 'flex', gap: 40 }}>
                   <div>
                      <Title level={3} style={{ margin: 0 }}>88</Title>
                      <Text type="secondary">Phím chuẩn</Text>
                   </div>
                   <div style={{ width: 1, background: '#d9d9d9' }} />
                   <div>
                      <Title level={3} style={{ margin: 0 }}>Hi-Res</Title>
                      <Text type="secondary">Âm thanh</Text>
                   </div>
                </div>
              </Space>
            </motion.div>
          </div>

          {/* Right: 3D Canvas Area */}
          <div style={{ flex: '1 1 500px', height: '600px', position: 'relative' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1 }}
              style={{ width: '100%', height: '100%' }}
            >
              <Canvas shadows camera={{ position: [0, 0, 5], fov: 40 }}>
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <pointLight position={[-10, -10, -10]} intensity={0.5} />
                
                <Suspense fallback={null}>
                  <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <Stage environment="studio" intensity={0.5} contactShadow={false}>
                      <PianoModel scale={1.5} />
                    </Stage>
                  </Float>
                  <ContactShadows 
                    position={[0, -1.5, 0]} 
                    opacity={0.4} 
                    scale={10} 
                    blur={2.5} 
                    far={4} 
                  />
                </Suspense>

                <OrbitControls 
                  enableZoom={false} 
                  autoRotate={true} 
                  autoRotateSpeed={0.5}
                  makeDefault 
                />
              </Canvas>
            </motion.div>
            
            {/* Hint Badge */}
            <div style={{
              position: 'absolute',
              bottom: '20%',
              right: '10%',
              background: 'rgba(255,255,255,0.6)',
              backdropFilter: 'blur(10px)',
              padding: '10px 20px',
              borderRadius: '100px',
              border: '1px solid #fff',
              fontSize: '12px',
              fontWeight: 600,
              pointerEvents: 'none'
            }}>
              🖱️ Giữ chuột để xoay mô hình
            </div>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,77,109,0.1) 0%, transparent 70%)',
          zIndex: 1
        }} />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) {
          .piano-viewer-container { border-radius: 0; margin: 0; }
          .piano-viewer-container h1 { font-size: 40px !important; }
        }
      `}} />
    </ConfigProvider>
  );
};

export default PianoViewer;