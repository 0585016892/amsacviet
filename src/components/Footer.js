import React, { useEffect, useState } from "react";
import { Row, Col } from "react-bootstrap";
import { FaPhoneAlt } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { MdAddLocation } from "react-icons/md";
import { Link, useNavigate } from "react-router-dom";
import { getActiveFooters } from "../api/footerApi";
import { getSlidesByArea } from "../api/slideApi";
import { motion, AnimatePresence } from "framer-motion";

const Footer = () => {
  const URL = process.env.REACT_APP_WEB_URL;
  const [footer, setFooter] = useState([]);
  const [footerItems, setFooterItems] = useState([]);
  const [openIndexes, setOpenIndexes] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const result = await getSlidesByArea("footer");
        setFooter(result);
      } catch (error) {
        navigate("/server-down");
      }
    };
    fetchSlides();
  }, [navigate]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getActiveFooters();
      setFooterItems(result);
    };
    fetchData();
  }, []);

  const handleClick = (index, e) => {
    e.preventDefault();
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const renderIcon = (type) => {
    switch (type) {
      case "phone":
        return <FaPhoneAlt size={25} style={{ marginRight: "15px" }} />;
      case "email":
        return <IoMail size={25} style={{ marginRight: "15px" }} />;
      case "address":
        return <MdAddLocation size={25} style={{ marginRight: "15px" }} />;
      default:
        return null;
    }
  };

  const motionProps = {
    initial: { opacity: 0, y: 20 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.2 },
    transition: { duration: 0.6 },
  };

  return (
    <div style={{ background: "#111928", marginTop: "60px" }}>
      <div className="d-flex justify-content-center footer-a ">
        <div className="d-flex justify-space-beetween contact_b">
          <Row className="w-100">
            {/* HI Section */}
            <Col xs={12} md={6}>
              {footerItems
                ?.filter((item) => item.type === "hi")
                ?.map((section, idx) => (
                  <motion.div key={section.id} {...motionProps}>
                    <p className="text-white ">
                      {section.title}
                    </p>
                  </motion.div>
                ))}
            </Col>

            {/* Lien He Section */}
            <Col xs={12} md={6}>
              <div className="d-flex flex-column text-white">
                <div className="d-flex footer-lienhe">
                  {footerItems
                    ?.filter((item) => item.type === "lienhe")
                    ?.map((section2, idx) => (
                      <motion.div
                        key={section2.id}
                        className="d-flex align-items-center contact_phone m-2"
                        whileInView={{ opacity: 1, x: 0 }}
                        initial={{ opacity: 0, x: 20 }}
                        viewport={{ once: true, amount: 0.3 }}
                        transition={{ duration: 0.6, delay: idx * 0.2 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        {renderIcon(section2.value)}
                        <div>
                          <p className="text-body-md text-theme-surface-secondary">
                            {section2.title}
                          </p>
                          <p className="text-label-lg break-words text-theme-surface">
                            {section2.label}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Menu Group */}
        <div className="d-flex justify-content-start contact_a flex-column text-white">
          <Row>
            <Col xs={12} md={4} className="mb-3">
              {footerItems
                ?.filter((item) => item.type === "group")
                ?.map((menuItem, index) => (
                  <div key={menuItem.id}>
                    <motion.h5
                      style={{ cursor: "pointer" }}
                      onClick={(e) => handleClick(index, e)}
                      whileInView={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 20 }}
                      viewport={{ once: true, amount: 0.3 }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      whileHover={{ scale: 1.05, color: "#facc15" }}
                    >
                      {menuItem.title.toUpperCase()}
                    </motion.h5>
                    <AnimatePresence>
                      {openIndexes[index] && (
                        <motion.ul
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          {menuItem.children?.map((branch) => (
                            <motion.li
                              style={{ margin: "15px 0" }}
                              key={branch.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Link to={`/category${branch.label}`}>
                                {branch.title}
                              </Link>
                            </motion.li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
            </Col>
          </Row>
        </div>

        {/* Footer Banner */}
        <div className="d-flex justify-content-between m-4">
          <Row className="w-100">
            <Col xs={12} md={6} className="footer-banner">
              {footer
                ?.filter((item) => item.status === "active")
                ?.map((footerItem, idx) => (
                  <motion.img
                    key={footerItem.id}
                    src={`${URL}/uploads/${footerItem.image}`}
                    height={150}
                    width={150}
                    alt=""
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: idx * 0.2 }}
                  />
                ))}
            </Col>

            {/* Extra section */}
            <Col md={6} xs={12}>
              {footerItems
                ?.filter((item) => item.type === "@")
                ?.map((section3, idx) => (
                  <motion.div
                    key={section3.id}
                    className="d-flex flex-column text-white"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, delay: idx * 0.2 }}
                  >
                    {renderIcon(section3.value)}
                    <p className="text-label-lg text-theme-surface">
                      {section3.title.toUpperCase()}
                    </p>
                  </motion.div>
                ))}
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Footer;
