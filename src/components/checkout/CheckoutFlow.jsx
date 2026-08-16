import React, { useState } from 'react';
import SubscriptionForm from './SubscriptionForm';
import DelegationChoice from './DelegationChoice';
import { useLanguage } from '../../hooks/useLanguage';
import { ArrowLeft } from 'lucide-react';

export default function CheckoutFlow({ plan, onCancel }) {
  const { t } = useLanguage();
  
  // Steps: 'form' -> 'delegation' -> 'success'
  const [currentStep, setCurrentStep] = useState('form');
  const [subscriptionData, setSubscriptionData] = useState(null);

  const handleSubscriptionSuccess = (data) => {
    setSubscriptionData(data);
    setCurrentStep('delegation');
  };

  const handleDelegationComplete = () => {
    setCurrentStep('success');
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 sm:px-6 lg:px-8 paper-texture">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={onCancel}
          className="mb-6 flex items-center gap-2 text-[#8b4513] hover:text-[#4a2e1b] transition-colors font-bold text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour aux tarifs
        </button>

        <div className="bg-white/90 rounded-2xl p-6 sm:p-10 shadow-xl border border-[#4a2e1b]/20">
          
          {/* Header Progress */}
          {currentStep !== 'success' && (
            <div className="mb-8 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-[#8b4513]">
              <span className={currentStep === 'form' ? 'text-[#4a2e1b]' : 'opacity-50'}>
                1. Paiement / Inscription
              </span>
              <span className="opacity-30">&gt;</span>
              <span className={currentStep === 'delegation' ? 'text-[#4a2e1b]' : 'opacity-50'}>
                2. Configuration
              </span>
            </div>
          )}

          {/* Content */}
          {currentStep === 'form' && (
            <SubscriptionForm
              plan={plan}
              onSuccess={handleSubscriptionSuccess}
            />
          )}

          {currentStep === 'delegation' && subscriptionData && (
            <DelegationChoice
              subscription={subscriptionData}
              onComplete={handleDelegationComplete}
            />
          )}

          {currentStep === 'success' && (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-green-600 text-3xl">
                🎉
              </div>
              <h2 className="text-3xl font-bold font-cordel text-[#4a2e1b]">
                Félicitations !
              </h2>
              <p className="text-[#8b4513] font-medium">
                Votre inscription a bien été finalisée. L'invitation a été envoyée.
              </p>
              <button
                onClick={onCancel}
                className="mt-6 px-6 py-3 bg-[#8b4513] text-[#fdf6e7] rounded-lg font-bold hover:bg-[#6e370f] transition-colors shadow"
              >
                Retour à l'accueil
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
