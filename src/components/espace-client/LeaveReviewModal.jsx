import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Star, Send, Loader2 } from 'lucide-react';
import { submitReview } from '../../services/telemetryService';

export default function LeaveReviewModal({ isOpen, onClose, userEmail, groupId, appSource = 'Orchestrador' }) {
  const [targetApp, setTargetApp] = useState('Plateforme Globale');
  const [featuresRating, setFeaturesRating] = useState(5);
  const [designRating, setDesignRating] = useState(5);
  const [usabilityRating, setUsabilityRating] = useState(5);
  const [comment, setComment] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const appOptions = [
    'Plateforme Globale',
    'Organizador (Gestion)',
    'Sequenciador (Audio)',
    'Dançador (Chorégraphie)',
    'Mostrador (Vitrine)'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (featuresRating === 0 || designRating === 0 || usabilityRating === 0) return;
    
    setIsSubmitting(true);
    try {
      // Calculate global average rating, rounded to nearest whole number
      const globalRating = Math.round((featuresRating + designRating + usabilityRating) / 3);

      await submitReview({
        rating: globalRating, // Keep for backward compatibility with existing simple reviews
        featuresRating,
        designRating,
        usabilityRating,
        targetApp,
        comment,
        userEmail: userEmail || 'Anonyme',
        appSource
      }, groupId);
      setIsSuccess(true);
      setTimeout(() => {
        onClose();
        setIsSuccess(false);
        setFeaturesRating(5);
        setDesignRating(5);
        setUsabilityRating(5);
        setTargetApp('Plateforme Globale');
        setComment('');
      }, 2000);
    } catch (error) {
      alert("Erreur lors de l'envoi de votre avis. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarSelector = (label, value, setValue) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
      <span className="text-sm font-bold text-[#4a2e1b]">{label}</span>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setValue(star)}
            className={`transition-all duration-200 hover:scale-110 p-1 ${
              star <= value ? 'text-[#d99f4d]' : 'text-gray-200'
            }`}
          >
            <Star className="w-6 h-6" fill={star <= value ? 'currentColor' : 'none'} />
          </button>
        ))}
      </div>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#fdf6e7] rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 border border-[#4a2e1b]/20 max-h-[90vh]">
        
        <div className="bg-[#4a2e1b] relative p-5 text-center text-white shrink-0">
          <div className="absolute inset-0 opacity-10 bg-[url('/assets/texture.png')] mix-blend-overlay pointer-events-none"></div>
          <button 
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors z-[110] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-black font-cordel relative z-10 tracking-wide text-[#d99f4d]">
            Votre Avis
          </h2>
          <p className="text-sm opacity-90 relative z-10 mt-1">
            Aidez-nous à améliorer les outils !
          </p>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {isSuccess ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4 relative">
                <Send className="w-8 h-8" />
                {groupId && (
                  <span className="absolute -top-2 -right-6 bg-[#f4e8cf] text-[#d2691e] text-xs font-bold px-2 py-1 rounded-full border border-[#d2691e]/30 shadow-sm animate-bounce">
                    +10 Axé
                  </span>
                )}
              </div>
              <h3 className="text-xl font-bold text-[#4a2e1b] mb-2">Merci pour votre retour !</h3>
              <p className="text-gray-600">Votre {globalRating <= 2 ? 'suggestion a bien été envoyée' : 'avis a bien été envoyé'} à notre équipe.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              <div>
                <label className="block text-sm font-bold text-[#4a2e1b] mb-2">
                  De quelle application parlez-vous ?
                </label>
                <select 
                  value={targetApp}
                  onChange={(e) => setTargetApp(e.target.value)}
                  className="w-full bg-white border border-[#4a2e1b]/20 rounded-lg px-4 py-2 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
                >
                  {appOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-[#4a2e1b]/10 space-y-4">
                {renderStarSelector("🚀 Fonctionnalités", featuresRating, setFeaturesRating)}
                {renderStarSelector("🎨 Design & Interface", designRating, setDesignRating)}
                {renderStarSelector("💡 Facilité d'utilisation", usabilityRating, setUsabilityRating)}
              </div>

              {(() => {
                const globalRating = Math.round((featuresRating + designRating + usabilityRating) / 3);
                const isNegative = globalRating <= 2;
                
                return (
                  <div>
                    <label className="block text-sm font-bold text-[#4a2e1b] mb-2">
                      {isNegative ? "Dites-nous ce qui n'a pas fonctionné" : "Commentaire / Suggestions"}
                    </label>
                    <textarea
                      required
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder={isNegative ? "Aidez-nous à comprendre le problème..." : "Qu'avez-vous le plus aimé ? Qu'est-ce qui pourrait être amélioré ?"}
                      className="w-full bg-white border border-[#4a2e1b]/20 rounded-xl px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8b4513] focus:border-transparent resize-none min-h-[100px]"
                    ></textarea>
                  </div>
                );
              })()}

              <button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="w-full flex items-center justify-center gap-2 bg-[#d2691e] hover:bg-[#b05819] text-white px-6 py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5" />
                    {Math.round((featuresRating + designRating + usabilityRating) / 3) <= 2 ? 'Envoyer ma suggestion' : 'Envoyer mon avis'}
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
