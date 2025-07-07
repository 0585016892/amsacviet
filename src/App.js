import "./App.css";
import React from "react";
import {
  Cart,
  Category,
  Loading,
  Login,
  Order,
  Product,
  Proflie,
  Search,
  ServerDown,
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
            <Route path="/server-down" element={<ServerDown />} />
          </Route>
        </Routes>
      </CartProvider>
    </div>
  );
}

export default App;
