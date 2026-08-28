import React, { useState, useEffect } from 'react';
import { getReviews, updateReviewStatus } from '../../services/telemetryService';

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  const fetchReviews = async () => {
    setLoading(true);
    const data = await getReviews();
    setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    setUpdatingId(id);
    try {
      await updateReviewStatus(id, newStatus);
      // Update local state
      setReviews(prev => prev.map(r => r.id === id ? { ...r, status: newStatus } : r));
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la mise à jour");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published': return <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">Publié</span>;
      case 'hidden': return <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">Masqué</span>;
      default: return <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold">En attente</span>;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-[#fdf6e7] p-4 rounded-lg shadow border border-[#4a2e1b]/10">
        <h2 className="text-xl font-bold text-[#4a2e1b]">🌟 Avis & Témoignages</h2>
        <button onClick={fetchReviews} className="text-sm bg-white border border-[#4a2e1b]/20 px-3 py-1 rounded hover:bg-gray-50 transition-colors">Rafraîchir</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-[#8b4513] font-bold animate-pulse">Chargement des avis...</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 italic">Aucun avis trouvé.</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className={`bg-white p-6 rounded-xl shadow-lg border-2 ${review.status === 'published' ? 'border-green-400' : review.status === 'hidden' ? 'border-red-200 opacity-70' : 'border-[#4a2e1b]/10'} flex flex-col justify-between transition-all`}>
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <div className="text-xl tracking-widest text-[#d99f4d] mb-2" title={`Note globale: ${review.rating}/5`}>
                      {renderStars(review.rating || 5)}
                    </div>
                    {(review.featuresRating || review.designRating || review.usabilityRating) && (
                      <div className="flex flex-col gap-1 text-[10px] text-gray-500 font-medium">
                        {review.featuresRating && <div>🚀 Fonctions: {review.featuresRating}/5</div>}
                        {review.designRating && <div>🎨 Design: {review.designRating}/5</div>}
                        {review.usabilityRating && <div>💡 Facilité: {review.usabilityRating}/5</div>}
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className="text-xs bg-[#fdf6e7] border border-[#8b4513]/20 text-[#8b4513] px-2 py-1 rounded-full font-bold">
                      {review.targetApp || review.appSource || 'Global'}
                    </span>
                    {getStatusBadge(review.status)}
                  </div>
                </div>
                <p className="text-gray-800 italic mb-4">"{review.comment}"</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <div className="text-sm font-bold text-[#4a2e1b] truncate w-40">{review.userEmail || review.userId || 'Anonyme'}</div>
                    <div className="text-xs text-gray-400">{review.createdAt?.toLocaleDateString()} à {review.createdAt?.toLocaleTimeString()}</div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateStatus(review.id, 'published')}
                    disabled={updatingId === review.id || review.status === 'published'}
                    className="flex-1 text-xs font-bold py-2 rounded bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition-colors"
                  >
                    {updatingId === review.id ? '...' : '✅ Publier'}
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(review.id, 'hidden')}
                    disabled={updatingId === review.id || review.status === 'hidden'}
                    className="flex-1 text-xs font-bold py-2 rounded bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 transition-colors"
                  >
                    {updatingId === review.id ? '...' : '❌ Masquer'}
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
