import React, { useState } from 'react';
import { createSubscription } from '../../services/subscriptionService';
import { Loader2, ShieldCheck, CheckCircle } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

export default function SubscriptionForm({ plan, onSuccess }) {
  const [formData, setFormData] = useState({
    associationName: '',
    firstName: '',
    lastName: '',
    billingEmail: '',
    planType: 'annual' // 'annual' or 'trial'
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currency } = useCurrency();

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Create subscription in Firestore
      const result = await createSubscription({
        ...formData,
        planId: plan?.id || 'unknown',
        status: formData.planType === 'trial' ? 'trialing' : 'active',
        currency: currency
      });
      
      onSuccess({ ...formData, ...result });
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de l'inscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold font-cordel text-[#4a2e1b] mb-2">
        Inscription Hub Écosystème
      </h2>
      <p className="text-sm text-[#8b4513] mb-8 font-medium">
        Vous avez choisi la formule <span className="font-bold uppercase bg-[#f4e8cf] px-1 rounded">{plan?.name}</span>. Veuillez remplir vos informations.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Plan Type Selection */}
        <div className="flex gap-4 mb-6">
          <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            formData.planType === 'annual' ? 'border-[#8b4513] bg-[#fdf6e7] shadow-sm' : 'border-gray-200 hover:border-[#8b4513]/50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <input 
                type="radio" 
                name="planType" 
                value="annual" 
                checked={formData.planType === 'annual'} 
                onChange={handleChange}
                className="text-[#8b4513] focus:ring-[#8b4513]" 
              />
              <span className="font-bold text-[#4a2e1b]">Abonnement Annuel</span>
            </div>
            <p className="text-xs text-gray-500 ml-6">Paiement immédiat, accès complet.</p>
          </label>
          
          <label className={`flex-1 p-4 rounded-xl border-2 cursor-pointer transition-all ${
            formData.planType === 'trial' ? 'border-[#8b4513] bg-[#fdf6e7] shadow-sm' : 'border-gray-200 hover:border-[#8b4513]/50'
          }`}>
            <div className="flex items-center gap-2 mb-1">
              <input 
                type="radio" 
                name="planType" 
                value="trial" 
                checked={formData.planType === 'trial'} 
                onChange={handleChange}
                className="text-[#8b4513] focus:ring-[#8b4513]" 
              />
              <span className="font-bold text-[#4a2e1b]">Essai gratuit (14 jours)</span>
            </div>
            <p className="text-xs text-gray-500 ml-6">Sans engagement. Testez toutes les fonctionnalités.</p>
          </label>
        </div>

        {/* Association Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8b4513] mb-1">
            Nom de l'Association
          </label>
          <input
            type="text"
            name="associationName"
            value={formData.associationName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-[#8b4513]/30 focus:border-[#8b4513] focus:ring-1 focus:ring-[#8b4513] bg-white text-[#2c1d11]"
            placeholder="Ex: Maracatu Nação O Girador"
          />
        </div>

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8b4513] mb-1">
              Prénom
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-[#8b4513]/30 focus:border-[#8b4513] focus:ring-1 focus:ring-[#8b4513] bg-white text-[#2c1d11]"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#8b4513] mb-1">
              Nom
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 rounded-lg border border-[#8b4513]/30 focus:border-[#8b4513] focus:ring-1 focus:ring-[#8b4513] bg-white text-[#2c1d11]"
            />
          </div>
        </div>

        {/* Email Field */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-[#8b4513] mb-1">
            Email de Facturation / Contact
          </label>
          <input
            type="email"
            name="billingEmail"
            value={formData.billingEmail}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 rounded-lg border border-[#8b4513]/30 focus:border-[#8b4513] focus:ring-1 focus:ring-[#8b4513] bg-white text-[#2c1d11]"
          />
        </div>

        {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

        {/* Action Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 mt-4 bg-gradient-to-r from-[#8b4513] to-[#4a2e1b] text-[#fdf6e7] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : formData.planType === 'annual' ? (
            <>
              <ShieldCheck className="w-5 h-5" />
              Valider et Procéder au Paiement Sécurisé
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5" />
              Démarrer mon essai de 14 jours
            </>
          )}
        </button>
      </form>
    </div>
  );
}
