import React, { createContext, useContext, useEffect, useState } from "react";

// Tạo context
const CartContext = createContext();

// Hook để sử dụng CartContext dễ dàng
export const useCart = () => useContext(CartContext);

// Provider
export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load giỏ hàng từ localStorage khi app khởi động
  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart")) || [];
    setCart(storedCart);
  }, []);

  // Đồng bộ cart -> localStorage khi có thay đổi
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Hàm thêm vào giỏ hàng
  const addToCart = (newItem) => {
    setCart((prevCart) => {
      const index = prevCart.findIndex(
        (item) =>
          item.slug === newItem.slug &&
          item.color === newItem.color &&
          item.size === newItem.size
      );

      const updatedCart = [...prevCart];

      if (index !== -1) {
        updatedCart[index].quantity += newItem.quantity;
      } else {
        updatedCart.push(newItem);
      }

      return updatedCart;
    });
  };

  // Hàm xóa 1 sản phẩm khỏi giỏ
  const removeFromCart = (slug, color, size) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) =>
          !(item.slug === slug && item.color === color && item.size === size)
      )
    );
  };
  const removeItem = (slug) => {
    const updated = cart.filter((item) => item.slug !== slug);
    setCart(updated);
  };
  // Hàm cập nhật số lượng
  const updateQuantity = (slug, color, size, quantity) => {
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.slug === slug && item.color === color && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Hàm xóa toàn bộ giỏ
  const clearCart = () => setCart([]);
  const clearOrder = () => {
    setCart([]);
    localStorage.removeItem("order");
  };
  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeItem,
        updateQuantity,
        clearCart,
        clearOrder,
        totalItems: cart.reduce((sum, item) => sum + item.quantity, 0),
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
