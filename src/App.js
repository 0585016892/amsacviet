import "./App.css";
import React, { useContext } from "react";import {
  BlogDetail,
  BlogLayout,
  Cart,
  Category,
  Loading,
  Login,
  Order,
  Product,
  Search,
  ServerDown,ProfileOrders,OrderTracking,ScrollToTop 
} from "./components";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route, usePaRams } from "react-router-dom";
import Public from "./pages/Public";
import Home from "./pages/Home";
import VnpayReturn from "./pages/VnpayReturn";
import { CartProvider } from "./context/CartContext";
import { Toaster } from 'react-hot-toast';
import { SettingsContext } from "./context/SettingsContext";
import { Spinner} from "react-bootstrap";

function App() {
  const { maintenanceMode, loading } = useContext(SettingsContext);

  if (loading) {
      return (
        <div
            style={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 2,
            }}
          >
            <Spinner animation="border" variant="warning" />
          </div>
      );
    }
  if (maintenanceMode) {
    return <ServerDown/>;
  }

  return (
    <div>
      <div> <Toaster position="bpttom-left"  reverseOrder={false} /></div>

      <CartProvider>
        <ScrollToTop />
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
