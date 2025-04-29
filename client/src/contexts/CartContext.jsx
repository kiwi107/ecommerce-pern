import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(
        i => i.product_id === item.product_id &&
             i.size === item.size &&
             i.color === item.color
      );

      if (existing) {
        return prev.map(i =>
          i === existing
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }

      return [...prev, item];
    });
  };

  const updateQuantity = (product_id, color, size, quantity) => {
    setCartItems(prev =>
      prev.map(item =>
        item.product_id === product_id &&
        item.color === color &&
        item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const removeFromCart = (product_id, color, size) => {
    setCartItems(prev =>
      prev.filter(
        item =>
          item.product_id !== product_id ||
          item.color !== color ||
          item.size !== size
      )
    );
  };

  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ cartItems, totalQuantity, addToCart, updateQuantity, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};
