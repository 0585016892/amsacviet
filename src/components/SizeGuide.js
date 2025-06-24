import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../assets/SizeGuide.css";
import sizeNam from "../img/sizenam.png";
import sizeNu from "../img/sizenu.png";
import sizeTreEm from "../img/sizetreem.png";
const SizeGuide = () => {
  const [showGuide, setShowGuide] = useState(false);
  const [selectedTab, setSelectedTab] = useState("men"); // 'men' | 'women' | 'kids'

  const toggleGuide = () => setShowGuide(!showGuide);

  const renderContent = () => {
    switch (selectedTab) {
      case "men":
        return <img src={sizeNam} alt="Nam" className="size-image" />;
      case "women":
        return <img src={sizeNu} alt="Nữ" className="size-image" />;
      case "kids":
        return <img src={sizeTreEm} alt="Trẻ em" className="size-image" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Link to="#" className="size-guide" onClick={toggleGuide}>
        Hướng dẫn chọn size
      </Link>

      {showGuide && (
        <div className="modal-overlay" onClick={toggleGuide}>
          <div
            className="modal-content slide-up"
            style={{ background: "white" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Bảng kích thước</h3>

            <div className="tab-buttons">
              <button
                className={selectedTab === "men" ? "active" : ""}
                onClick={() => setSelectedTab("men")}
              >
                Nam
              </button>
              <button
                className={selectedTab === "women" ? "active" : ""}
                onClick={() => setSelectedTab("women")}
              >
                Nữ
              </button>
              <button
                className={selectedTab === "kids" ? "active" : ""}
                onClick={() => setSelectedTab("kids")}
              >
                Trẻ em
              </button>
            </div>

            <div className="image-container">{renderContent()}</div>

            <button onClick={toggleGuide} className="close-btn">
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default SizeGuide;
