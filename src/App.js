import "./App.css";
import React from "react";
import {
  Cart,
  Category,
  Header,
  Login,
  Order,
  Product,
  Proflie,
  Search,
} from "./components";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, usePaRams } from "react-router-dom";
import Public from "./pages/Public";
import Home from "./pages/Home";
import VnpayReturn from "./pages/VnpayReturn";
import { CartProvider } from "./context/CartContext";
function App() {
  return (
    <div>
      <CartProvider>
        <Routes>
          <Route path="/" element={<Public />}>
            <Route path="" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/product/:slug" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Proflie />} />
            <Route path="/order" element={<Order />} />
            <Route path="/search" element={<Search />} />
            <Route path="/vnpay-return" element={<VnpayReturn />} />
            {/* <Route path="/san-pham/danh-sach" element={<DanhSachSanPham />} />
          <Route path="/san-pham/them" element={<DanhSachSanPhamAdd />} />
          <Route path="/san-pham/sua/:id" element={<SuaSanPham />} />
          <Route path="/danh-muc/danh-sach" element={<DsDanhMuc />} />
          <Route path="/danh-muc/them" element={<DanhMucAdd />} />
          <Route path="/danh-muc/sua/:id" element={<SuaDanhMuc />} />
          <Route path="/khach-hang/danh-sach" element={<DanhSachKhachhang />} /> */}
            {/* <Route path="/danh-muc/them" element={<DanhMucAdd />} />
          <Route path="/danh-muc/sua/:id" element={<SuaDanhMuc />} /> */}
          </Route>
        </Routes>
      </CartProvider>
    </div>
  );
}

export default App;
