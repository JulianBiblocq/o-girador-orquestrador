import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { functions } from '../../services/firebase';
import { httpsCallable } from 'firebase/functions';

export default function CartDrawer() {
  const { cartItems, cartTotal, removeFromCart, isCartOpen, setIsCartOpen } = useCart();
  const { user } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setIsProcessing(true);
    try {
      const createStripeCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');
      
      const response = await createStripeCheckoutSession({
        cartItems: cartItems,
        groupId: user?.groupId,
        origin: window.location.origin
      });

      const { url } = response.data;
      if (url) {
        // Redirection vers Stripe
        window.location.href = url;
      } else {
        throw new Error("URL de session non reçue.");
      }
    } catch (error) {
      console.error("Erreur lors de la création de la session Stripe:", error);
      alert("Une erreur est survenue lors de la préparation du paiement. Veuillez réessayer.");
      setIsProcessing(false);
    }
  };

  if (!isCartOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/50 z-50 transition-opacity"
        onClick={() => !isProcessing && setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[#fdf6e7] shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-in-out border-l border-[#e8c39e]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e8c39e] bg-white">
          <div className="flex items-center gap-2 text-[#8b4513]">
            <ShoppingBag className="w-5 h-5" />
            <h2 className="font-black uppercase tracking-wider">Votre Panier</h2>
          </div>
          <button 
            onClick={() => !isProcessing && setIsCartOpen(false)}
            disabled={isProcessing}
            className="p-1 hover:bg-[#f5e6d3] rounded-full text-[#5c4033] transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cartItems.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-[#5c4033] space-y-4">
              <ShoppingBag className="w-12 h-12 opacity-20" />
              <p className="font-medium text-sm text-center">Votre panier est vide.</p>
            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-lg border border-[#e8c39e] flex justify-between items-center shadow-sm">
                <div>
                  <h4 className="font-bold text-[#2c1d11] text-sm leading-tight">{item.name}</h4>
                  <p className="text-xs text-[#8b4513] uppercase tracking-wider font-bold mt-1">{item.type}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-black text-[#2c1d11]">{item.price}€</span>
                  <button 
                    onClick={() => removeFromCart(item.id)}
                    disabled={isProcessing}
                    className="text-[#ef4444] hover:bg-red-50 p-1.5 rounded transition-colors disabled:opacity-50"
                    title="Retirer l'article"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout */}
        <div className="p-4 bg-white border-t border-[#e8c39e]">
          <div className="flex justify-between items-center mb-4">
            <span className="font-bold text-[#5c4033] uppercase tracking-wider text-sm">Total</span>
            <span className="font-black text-2xl text-[#8b4513]">{cartTotal.toFixed(2)}€</span>
          </div>
          <button 
            disabled={cartItems.length === 0 || isProcessing}
            onClick={handleCheckout}
            className="w-full bg-[#8b4513] text-white font-black uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#5c2e0b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Préparation...
              </>
            ) : (
              'Procéder au paiement'
            )}
          </button>
        </div>
      </div>
    </>
  );
}
