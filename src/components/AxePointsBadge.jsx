import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';

export default function AxePointsBadge() {
  const { currentUser, userData } = useAuth();
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Si pas connecté ou pas de groupId, on ne charge rien.
    if (!currentUser || !userData?.groupId) {
      setLoading(false);
      return;
    }

    const groupRef = doc(db, 'associations', userData.groupId);
    const unsubscribe = onSnapshot(groupRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const newPoints = data.contributionPoints || 0;
        
        setPoints(prevPoints => {
          if (prevPoints !== undefined && prevPoints !== newPoints && !loading) {
            // Déclencher une animation si les points augmentent
            setAnimate(true);
            setTimeout(() => setAnimate(false), 2000);
          }
          return newPoints;
        });
      }
      setLoading(false);
    }, (error) => {
      console.error("AxePointsBadge - Erreur onSnapshot :", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser, userData?.groupId]);

  if (!currentUser || !userData?.groupId || loading) {
    return null;
  }

  return (
    <div 
      className={`flex items-center gap-1.5 px-3 py-1.5 bg-[#f4e8cf] text-[#4a2e1b] border border-[#8b4513]/30 rounded-full text-xs font-bold shadow-sm transition-all duration-300 ${animate ? 'scale-110 bg-[#ebd8b3] border-[#e67e22]' : 'hover:bg-[#ebd8b3]'}`}
      title="Points d'Axé cumulés par l'association"
    >
      <Sparkles className={`w-3.5 h-3.5 ${animate ? 'text-[#e67e22] animate-spin' : 'text-[#8b4513]'}`} />
      <span className={animate ? 'text-[#e67e22]' : ''}>
        {points} <span className="hidden sm:inline">Axé</span>
      </span>
    </div>
  );
}
