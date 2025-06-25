import React, { useEffect, useState } from "react";

import { Row, Col } from "react-bootstrap";
import { FaPhoneAlt } from "react-icons/fa";
import { IoMail } from "react-icons/io5";
import { MdAddLocation } from "react-icons/md";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import { getActiveFooters } from "../api/footerApi";
import { getSlidesByArea } from "../api/slideApi";

const Footer = () => {
  const [footer, setFooter] = useState([]);
  const [hasError, setHasError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const result = await getSlidesByArea("footer");
      setFooter(result);
      } catch (error) {
        setHasError(true);
        navigate("/server-down");
      }
    };

    fetchSlides();
  }, [navigate]);
 

  const [footerItems, setFooterItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const result = await getActiveFooters();
      setFooterItems(result);
    };
    fetchData();
  }, []);
  const [openIndexes, setOpenIndexes] = useState({});

  const handleClick = (index, e) => {
    e.preventDefault();
    setOpenIndexes((prev) => ({
      ...prev,
      [index]: !prev[index], // mở/đóng đúng dòng
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
        return null; // hoặc icon mặc định
    }
  };
  return (
    <div style={{ background: "#111928", marginTop: "60px" }}>
      <div className="d-flex justify-content-center footer-a ">
        <div className="d-flex justify-content-center contact_b">
          <Row>
            <Col xs={12} md={6}>
              {footerItems?.map((section, idx) => {
                if (section.type === "hi") {
                  return (
                    <div
                      key={section.id}
                      className="d-flex"
                      style={{ flexDirection: "column", color: "white" }}
                    >
                      <p className="text-label-lg text-theme-surface">
                        {section.title}
                      </p>
                    </div>
                  );
                }
                return null;
              })}
            </Col>
            <Col xs={12} md={6}>
              <div
                className="d-flex"
                style={{ flexDirection: "column", color: "white" }}
              >
                <div className="d-flex footer-lienhe">
                  <div className="contact">
                    {footerItems?.map((section2, idx) => {
                      if (section2.type === "lienhe") {
                        return (
                          <div
                            key={section2.id}
                            className="d-flex align-items-center contact_phone m-2"
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
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  <div></div>
                </div>
              </div>
            </Col>
          </Row>
        </div>
        <div
          style={{ flexDirection: "column", color: "white" }}
          className="d-flex justify-content-start contact_a"
        >
          <Row>
            <Col xs={12} md={4} className="mb-3">
              <div>
                {footerItems
                  ?.filter((item) => item.type === "group")
                  ?.map((menuItem, index) => (
                    <div key={menuItem.id}>
                      <a
                        style={{ cursor: "pointer" }}
                        onClick={(e) => handleClick(index, e)}
                      >
                        <h5>{menuItem.title.toUpperCase()}</h5>
                      </a>
                      {openIndexes[index] && (
                        <ul>
                          {menuItem.children?.map((branch) => (
                            <li style={{ margin: "15px 0" }} key={branch.id}>
                              <Link to={`/category${branch.label}`}>
                                {branch.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
              </div>
            </Col>
          </Row>
        </div>
        <div className="d-flex justify-content-between m-4">
          <Row className="w-100">
            <Col xs={12} md={6} className="footer-banner">
              <div
                className="d-flex"
                style={{ flexDirection: "column", color: "white" }}
              >
                {footer?.map((footer) =>
                  footer.status === "active" ? (
                    <img
                      key={footer.id}
                      src={`http://localhost:5000/uploads/${footer.image}`}
                      height={150}
                      width={150}
                      alt=""
                    />
                  ) : null
                )}
              </div>
            </Col>
            <Col md={6} xs={12}>
              {footerItems?.map((section3, idx) => {
                if (section3.type === "@") {
                  return (
                    <div
                      className="d-flex"
                      key={section3.id}
                      style={{ flexDirection: "column", color: "white" }}
                    >
                      {renderIcon(section3.value)}
                      <div>
                        <p className="text-label-lg text-theme-surface">
                          {section3.title.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  );
                }
              })}
            </Col>
          </Row>
        </div>
      </div>
    </div>
  );
};

export default Footer;
