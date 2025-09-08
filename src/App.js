import "./App.css";
import React from "react";
import {
  BlogDetail,
  BlogLayout,
  Cart,
  Category,
  Loading,
  Login,
  Order,
  Product,
  Search,
  ServerDown,ProfileOrders,OrderTracking
} from "./components";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, usePaRams } from "react-router-dom";
import Public from "./pages/Public";
import Home from "./pages/Home";
import VnpayReturn from "./pages/VnpayReturn";
import { CartProvider } from "./context/CartContext";
import { Toaster } from 'react-hot-toast';
function App() {
  return (
    <div>
      <div> <Toaster position="bpttom-left"  reverseOrder={false} /></div>

      <CartProvider>
        <Routes>
          <Route path="/" element={<Public />}>
            <Route path="" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/product/:slug" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order" element={<Order />} />
            <Route path="/search" element={<Search />} />
            <Route path="/vnpay-return" element={<VnpayReturn />} />
            <Route path="/server-down" element={<ServerDown />} />
            <Route path="/blog" element={<BlogLayout />} />
            <Route path="/chinh-sach" element={<BlogLayout />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/profile" element={<ProfileOrders />} />
            <Route path="/order-tracking/:id" element={<OrderTracking />} />
          </Route>
        </Routes>
      </CartProvider>
    </div>
  );
}

export default App;
