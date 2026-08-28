import React, { useState, useEffect } from 'react';
import { Star, Quote, Loader2, MessageSquareHeart } from 'lucide-react';
import { getPublishedReviews } from '../services/telemetryService';

export default function PublicReviewsSection({ onNavigate }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const data = await getPublishedReviews();
      setReviews(data);
      setLoading(false);
    };
    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <section id="avis" className="py-20 bg-[#fdf6e7] border-y border-[#4a2e1b]/10 flex justify-center">
        <Loader2 className="w-8 h-8 text-[#8b4513] animate-spin" />
      </section>
    );
  }

  return (
    <section id="avis" className="py-20 bg-[#fdf6e7] border-y border-[#4a2e1b]/10 relative overflow-hidden">
      {/* Background Texture */}
      <div className="absolute inset-0 opacity-5 bg-[url('/assets/texture.png')] mix-blend-overlay pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black text-[#4a2e1b] font-cordel mb-6 drop-shadow-sm">
            Ils utilisent <span className="text-[#d2691e]">O Girador</span>
          </h2>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto">
            Découvrez ce que les autres mestres et membres pensent de la plateforme.
          </p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl shadow-[#4a2e1b]/5 border-2 border-[#4a2e1b]/10">
            <MessageSquareHeart className="w-16 h-16 text-[#d99f4d] mx-auto mb-4 opacity-50" />
            <h3 className="text-2xl font-bold text-[#4a2e1b] mb-2">Aucun avis publié pour le moment</h3>
            <p className="text-gray-600 mb-6">Soyez le premier à partager votre expérience avec la communauté !</p>
            <button 
              onClick={() => onNavigate && onNavigate('espace-client')}
              className="inline-flex items-center gap-2 bg-[#d2691e] hover:bg-[#b05819] text-white px-6 py-3 rounded-xl font-bold shadow-md transition-all cursor-pointer"
            >
              <Star className="w-5 h-5 fill-current" />
              Donner mon avis depuis mon Espace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {reviews.slice(0, 6).map((review) => (
              <div key={review.id} className="bg-white p-8 rounded-2xl shadow-xl shadow-[#4a2e1b]/5 flex flex-col justify-between border border-[#4a2e1b]/10 relative">
              <Quote className="absolute top-6 right-6 w-12 h-12 text-[#f4e8cf] opacity-50" />
              <div>
                <div className="flex flex-col mb-6 gap-2">
                  <div className="text-xl tracking-widest text-[#d99f4d]">
                    {renderStars(review.rating || 5)}
                  </div>
                  {review.targetApp && review.targetApp !== 'Plateforme Globale' && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8b4513] bg-[#fdf6e7] px-2 py-1 rounded w-fit border border-[#8b4513]/20">
                      Sur : {review.targetApp}
                    </span>
                  )}
                </div>
                <p className="text-gray-700 leading-relaxed italic relative z-10">
                  "{review.comment}"
                </p>
              </div>    
                  <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="font-bold text-[#4a2e1b]">
                        {review.userEmail ? review.userEmail.split('@')[0] : 'Anonyme'}
                      </div>
                      <div className="text-sm text-gray-500 uppercase tracking-wider mt-1">
                        {review.appSource || 'Utilisateur'}
                      </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
