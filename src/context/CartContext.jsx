"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const CartContext = createContext(null);
const STORAGE_KEY = "gifterra-cart";
const ORDERS_KEY = "gifterra-orders";

export function parsePrice(value) {
  if (typeof value === "number") return value;
  if (!value) return 0;

  const numericValue = Number(String(value).replace(/[^\d.]/g, ""));
  return Number.isFinite(numericValue) ? numericValue : 0;
}

export function formatPrice(value) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const savedCart = window.localStorage.getItem(STORAGE_KEY);
    const savedOrders = window.localStorage.getItem(ORDERS_KEY);

    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        if (Array.isArray(parsedCart)) {
          setCart(parsedCart);
        }
      } catch (error) {
        console.error("Unable to parse saved cart", error);
      }
    }

    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        if (Array.isArray(parsedOrders)) {
          setOrders(parsedOrders);
        }
      } catch (error) {
        console.error("Unable to parse saved orders", error);
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const addToCart = (product) => {
    setCart((currentCart) => {
      const existingItem = currentCart.find((item) => item.id === product.id);

      if (existingItem) {
        return currentCart.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [
        ...currentCart,
        {
          ...product,
          quantity: 1,
          unitPrice: parsePrice(product.price),
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== productId)
    );
  };

  const clearCart = () => setCart([]);

  const saveOrder = (order) => {
    const finalizedOrder = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      createdAt: new Date().toISOString(),
      ...order,
    };

    setOrders((currentOrders) => [finalizedOrder, ...currentOrders]);
  };

  const updateQuantity = (productId, change) => {
    setCart((currentCart) =>
      currentCart.flatMap((item) => {
        if (item.id !== productId) {
          return [item];
        }

        const nextQuantity = item.quantity + change;
        return nextQuantity > 0 ? [{ ...item, quantity: nextQuantity }] : [];
      })
    );
  };

  const isInCart = (productId) =>
    cart.some((item) => item.id === productId);

  const cartCount = useMemo(
    () => cart.reduce((total, item) => total + item.quantity, 0),
    [cart]
  );

  const subtotal = useMemo(
    () => cart.reduce((total, item) => total + item.unitPrice * item.quantity, 0),
    [cart]
  );

  const deliveryCharge = cart.length > 0 ? 99 : 0;
  const gstAmount = subtotal * 0.18;
  const totalPayable = subtotal + deliveryCharge + gstAmount;

  const value = {
    cart,
    orders,
    cartCount,
    subtotal,
    deliveryCharge,
    gstAmount,
    totalPayable,
    addToCart,
    removeFromCart,
    clearCart,
    saveOrder,
    updateQuantity,
    isInCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
