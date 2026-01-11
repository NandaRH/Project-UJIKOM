import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    setItems((prev) => {
      const existing = prev.find((p) => p.key === item.key);
      if (existing)
        return prev.map((p) =>
          p.key === item.key ? { ...p, qty: p.qty + item.qty } : p
        );
      return [...prev, item];
    });
  };

  const updateQty = (key, qty) => {
    setItems((prev) =>
      prev.map((p) => (p.key === key ? { ...p, qty } : p))
    );
  };

  const removeItem = (key) => setItems((prev) => prev.filter((p) => p.key !== key));
  const clear = () => setItems([]);

  return (
    <CartContext.Provider value={{ items, addItem, updateQty, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
