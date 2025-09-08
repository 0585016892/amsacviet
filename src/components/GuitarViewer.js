import React, { Suspense, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage, useGLTF } from "@react-three/drei";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

function GuitarModel(props) {
  const { scene } = useGLTF("/models/a.glb");
  const ref = useRef();
  const [hovered, setHovered] = useState(false);

  return (
    <primitive
      ref={ref}
      object={scene}
      {...props}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
}

const GuitarViewer = () => {
  return (
    <div className="guitar-viewer">
      {/* Left: Text & Button */}
      <motion.div
        className="guitar-text"
        initial={{ opacity: 0, x: -100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1 }}
      >
        <motion.h2
          className="guitar-title"
          initial={{ y: -30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Piano Collection 2025
        </motion.h2>

        <motion.p
          className="guitar-desc"
          initial={{ y: 30, opacity: 0 }}
          whileInView={{ y: 0, opacity: 0.9 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Khám phá bộ sưu tập đàn piano mới với thiết kế tinh tế, âm thanh sống động.
        </motion.p>

        <motion.button
          className="guitar-button"
          whileHover={{ scale: 1.1, backgroundColor: "#9b59b6", color: "#fff" }}
          whileTap={{ scale: 0.95 }}
        >
          <Link to="/category/dan-piano-co" style={{ color: "inherit", textDecoration: "none" }}>
            Xem thêm
          </Link>
        </motion.button>
      </motion.div>

      {/* Right: 3D Model */}
      <motion.div
        className="guitar-3d"
        initial={{ opacity: 0, x: 100 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 1 }}
      >
        <Canvas shadows camera={{ position: [0, 2, 5], fov: 45 }}>
          <ambientLight intensity={0.6} />
          <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
          <spotLight position={[-5, 5, 5]} angle={0.3} intensity={0.8} penumbra={1} castShadow />

          <Suspense fallback={null}>
            <Stage environment="city" intensity={0.7}>
              <GuitarModel scale={1.2} position={[0, 0, 0]} />
            </Stage>
          </Suspense>

          <OrbitControls enableZoom autoRotate autoRotateSpeed={1} />
        </Canvas>
      </motion.div>
    </div>
  );
};

export default GuitarViewer;
