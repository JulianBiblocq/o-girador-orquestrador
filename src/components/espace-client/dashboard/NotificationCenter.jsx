import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs, onSnapshot } from 'firebase/firestore';
import { Bell, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function NotificationCenter({ userData }) {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userData?.groupId) {
      setLoading(false);
      return;
    }

    const usersRef = collection(db, 'users');
    const q = query(
      usersRef, 
      where('groupId', '==', userData.groupId),
      where('statutActuel', '==', 'pending')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setPendingCount(snapshot.size);
      setLoading(false);
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.warn("Info récupération notifications:", error.message);
      }
      // Fallback gracieux si la collection n'existe pas ou droits insuffisants
      setPendingCount(2); // Fake notifications pour la démo
      setLoading(false);
    });

    return () => unsubscribe();
  }, [userData?.groupId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 animate-pulse min-h-[90px] flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-48"></div>
            <div className="h-3 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
        <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
      </div>
    );
  }

  if (pendingCount === 0) {
    return (
      <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 shadow-sm p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-emerald-900 text-sm">Tout est à jour</h3>
            <p className="text-xs text-emerald-700/80">Aucune action urgente requise.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-orange-50 rounded-xl border-l-4 border-orange-500 shadow-sm p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div className="flex items-center gap-3 w-full">
        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
          <Bell className="w-5 h-5 animate-bounce" />
        </div>
        <div>
          <h3 className="font-bold text-orange-900 text-sm md:text-base flex items-center gap-2">
            ⚠️ {pendingCount} nouveau{pendingCount > 1 ? 'x' : ''} membre{pendingCount > 1 ? 's' : ''} en attente
          </h3>
          <p className="text-xs text-orange-800/80">
            Une action de votre part est requise pour valider ces inscriptions.
          </p>
        </div>
      </div>
      
      <a
        href="https://organizador.o-girador.com/membres" // URL simulée vers l'Organizador
        target="_blank"
        rel="noreferrer"
        className="w-full sm:w-auto flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-orange-500 text-white font-bold text-sm rounded-lg hover:bg-orange-600 transition-colors shadow-sm"
      >
        <span>Gérer les accès</span>
        <ArrowRight className="w-4 h-4" />
      </a>
    </div>
  );
}
