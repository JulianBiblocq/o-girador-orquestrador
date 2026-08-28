import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCurrency } from './CurrencyContext';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartTotal, setCartTotal] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { currency } = useCurrency();

  // Recalculer le total dès que les items changent
  useEffect(() => {
    const total = cartItems.reduce((sum, item) => sum + (item.prices?.[currency] || 0), 0);
    setCartTotal(total);
  }, [cartItems, currency]);

  const addToCart = (product) => {
    setCartItems((prevItems) => {
      // Éviter les doublons basés sur l'ID (on ne peut acheter qu'une fois un pack/abonnement)
      if (prevItems.find((item) => item.id === product.id)) {
        return prevItems;
      }
      return [...prevItems, product];
    });
    // Ouvre le panier quand on ajoute un produit
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const toggleCart = () => {
    setIsCartOpen((prev) => !prev);
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      clearCart,
      toggleCart,
      cartTotal,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart doit être utilisé au sein d\'un CartProvider');
  }
  return context;
}
