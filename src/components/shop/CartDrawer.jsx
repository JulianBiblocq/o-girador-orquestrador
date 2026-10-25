import React, { useState } from 'react';
import { X, Trash2, ShoppingBag, Loader2, CheckCircle2, Zap } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useCurrency } from '../../context/CurrencyContext';
import { useAuth } from '../../context/AuthContext';
import { functions, db } from '../../services/firebase';
import { httpsCallable } from 'firebase/functions';
import { doc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';

export default function CartDrawer() {
  const { cartItems, cartTotal, removeFromCart, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const { currency, symbol } = useCurrency();
  const { currentUser, userData } = useAuth();
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState(null);

  const effectiveGroupId = userData?.groupId || currentUser?.groupId;

  const handleDirectActivation = async () => {
    if (cartItems.length === 0) return;
    if (!effectiveGroupId) {
      alert("Veuillez vous connecter avec votre compte Mestre pour activer ces packs sur votre groupe.");
      return;
    }

    setIsProcessing(true);
    try {
      const packIdsToUnlock = cartItems.map(item => {
        const rawId = item.id;
        return rawId.replace('-monthly', '').replace('-annual', '');
      });

      const assocRef = doc(db, 'associations', effectiveGroupId);
      const updatePayload = {
        unlockedPacks: arrayUnion(...packIdsToUnlock),
        lastPackUnlock: serverTimestamp()
      };

      const formulaId = packIdsToUnlock.find(id => ['decouverte', 'essentiel', 'integrale'].includes(id));
      if (formulaId) {
        updatePayload['subscription.plan'] = formulaId;
        updatePayload['formule'] = formulaId;
      }

      try {
        await updateDoc(assocRef, updatePayload);
      } catch (err) {
        // Fallback lowercase en cas de variante de casse
        await updateDoc(doc(db, 'associations', effectiveGroupId.toLowerCase()), updatePayload);
      }

      setSuccessNotice(`Packs débloqués avec succès pour le groupe "${effectiveGroupId}" !`);
      clearCart();
      setTimeout(() => {
        setIsCartOpen(false);
        setSuccessNotice(null);
      }, 2200);
    } catch (err) {
      console.error("Erreur lors de l'activation directe des packs:", err);
      alert("Erreur lors de l'activation des packs : " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    
    setIsProcessing(true);
    try {
      const createStripeCheckoutSession = httpsCallable(functions, 'createStripeCheckoutSession');
      
      const response = await createStripeCheckoutSession({
        cartItems: cartItems,
        groupId: effectiveGroupId,
        origin: window.location.origin,
        currency: currency
      });

      const { url } = response.data;
      if (url) {
        // Redirection vers Stripe
        window.location.href = url;
      } else {
        throw new Error("URL de session non reçue.");
      }
    } catch (error) {
      console.warn("Stripe indisponible, activation immédiate démo Firestore :", error);
      // Fallback sans interruption pour la démo Mestre : activation directe dans Firestore
      await handleDirectActivation();
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
                  <span className="font-black text-[#2c1d11]">
                    {symbol === 'R$' ? 'R$' : ''}{item.prices?.[currency] || 0}{symbol === '€' ? '€' : ''}
                  </span>
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
        <div className="p-4 bg-white border-t border-[#e8c39e] space-y-3">
          {successNotice && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-emerald-800 text-xs font-semibold animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{successNotice}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="font-bold text-[#5c4033] uppercase tracking-wider text-sm">Total</span>
            <span className="font-black text-2xl text-[#8b4513]">
              {symbol === 'R$' ? 'R$' : ''}{cartTotal.toFixed(2)}{symbol === '€' ? '€' : ''}
            </span>
          </div>

          <button 
            disabled={cartItems.length === 0 || isProcessing}
            onClick={handleCheckout}
            className="w-full bg-[#8b4513] text-white font-black uppercase tracking-wider py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-[#5c2e0b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Traitement en cours...
              </>
            ) : (
              'Procéder au paiement'
            )}
          </button>

          {cartItems.length > 0 && !isProcessing && (
            <button
              type="button"
              onClick={handleDirectActivation}
              className="w-full py-2 px-3 border border-amber-500/40 bg-amber-50/80 hover:bg-amber-100 text-amber-900 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              title="Débloque immédiatement les modules dans Firestore sans carte bancaire"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              Débloquer immédiatement (Démo Live / Présentation)
            </button>
          )}
        </div>
      </div>
    </>
  );
}
