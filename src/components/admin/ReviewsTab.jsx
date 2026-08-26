import React, { useState, useEffect } from 'react';
import { getReviews } from '../../services/telemetryService';

export default function ReviewsTab() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      const data = await getReviews();
      setReviews(data);
      setLoading(false);
    };

    fetchReviews();
  }, []);

  const renderStars = (rating) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#fdf6e7] p-4 rounded-lg shadow border border-[#4a2e1b]/10">
        <h2 className="text-xl font-bold text-[#4a2e1b]">🌟 Avis & Témoignages</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-500">Chargement des avis...</div>
        ) : reviews.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 italic">Aucun avis trouvé.</div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white p-6 rounded-xl shadow-lg border border-[#4a2e1b]/10 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div className="text-xl tracking-widest text-[#d99f4d]">{renderStars(review.rating)}</div>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full uppercase">{review.appSource}</span>
                </div>
                <p className="text-gray-800 italic mb-4">"{review.comment}"</p>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-end">
                <div>
                  <div className="text-sm font-bold text-[#4a2e1b]">{review.userEmail || 'Anonyme'}</div>
                  <div className="text-xs text-gray-400">{review.createdAt?.toLocaleDateString()}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
