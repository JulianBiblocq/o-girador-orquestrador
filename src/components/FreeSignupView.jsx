import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { MapPin, Globe2, Music, Loader2, ArrowLeft } from 'lucide-react';
import universData from '../data/univers.json';

export default function FreeSignupView({ onNavigateHome, onNavigateToClient }) {
  const { loginWithGoogle, userData, isProvisioning } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    universeId: 'maracatu',
    address: ''
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [waitingForProvision, setWaitingForProvision] = useState(false);

  // Écoute de la fin du provisioning
  useEffect(() => {
    if (waitingForProvision && userData?.groupId && !isProvisioning) {
      finalizeSignup(userData.groupId);
    }
  }, [userData, isProvisioning, waitingForProvision]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (formData.name.trim() && formData.address.trim()) {
      setStep(2);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setIsProcessing(true);
      setWaitingForProvision(true); // Active l'attente du useEffect
      await loginWithGoogle();
      // Le reste sera géré par onAuthStateChanged dans AuthContext + le useEffect ci-dessus
    } catch (error) {
      console.error("Erreur lors de la connexion Google:", error);
      setIsProcessing(false);
      setWaitingForProvision(false);
    }
  };

  const finalizeSignup = async (groupId) => {
    try {
      let location = null;
      // Géocodage de l'adresse
      if (formData.address && formData.address.trim() !== '') {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(formData.address)}`);
          const data = await response.json();
          if (data && data.length > 0) {
            location = {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon)
            };
          }
        } catch (err) {
          console.error("Erreur de géocodage:", err);
        }
      }

      // Mise à jour du document provisionné
      const docRef = doc(db, 'associations', groupId);
      await updateDoc(docRef, {
        name: formData.name,
        nom: formData.name,
        universeId: formData.universeId,
        address: formData.address,
        adresseLocal: formData.address,
        location: location,
        isPublicInTerreiro: true,
        unlockedPacks: []
      });

      // Redirection vers le dashboard
      onNavigateToClient();
    } catch (error) {
      console.error("Erreur lors de la finalisation:", error);
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf6e7] pt-24 pb-12 flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full">
        
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-gray-500 hover:text-[#8b4513] font-bold text-sm transition-colors w-max mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour à la carte
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-[#e6d5c3] p-8 md:p-12">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-amber-500/20 rounded-full mb-4">
              <Globe2 className="w-10 h-10 text-[#8b4513]" />
            </div>
            <h1 className="text-3xl font-black font-cordel text-[#4a2e1b] mb-2">
              Rejoignez la Carte Mondiale
            </h1>
            <p className="text-gray-500">
              Inscription gratuite. Ajoutez votre groupe en 1 minute.
            </p>
          </div>

          {isProcessing || isProvisioning ? (
            <div className="flex flex-col items-center justify-center py-12 space-y-4">
              <Loader2 className="w-12 h-12 text-[#8b4513] animate-spin" />
              <p className="font-bold text-[#8b4513] animate-pulse">
                Création de votre espace et géocodage...
              </p>
            </div>
          ) : step === 1 ? (
            <form onSubmit={handleNextStep} className="space-y-6 animate-in fade-in duration-300">
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">Nom de votre groupe</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none transition-all"
                  placeholder="Ex: Maracatu O Girador"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <Music className="w-4 h-4 text-gray-400" /> Univers culturel
                </label>
                <select
                  name="universeId"
                  value={formData.universeId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none transition-all bg-white"
                >
                  {universData.universes.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" /> Adresse de répétition (Ville & Pays)
                </label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none transition-all"
                  placeholder="Ex: Nantes, France"
                />
                <p className="text-xs text-gray-400">Cette adresse sera utilisée pour placer votre point sur la carte.</p>
              </div>

              <button
                type="submit"
                disabled={!formData.name.trim() || !formData.address.trim()}
                className="w-full bg-[#d2691e] hover:bg-[#b05819] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-md transition-all disabled:opacity-50 mt-4"
              >
                Continuer
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300 text-center">
              
              <div className="bg-amber-50 border border-amber-200 text-[#8b4513] p-4 rounded-xl shadow-sm mb-6 text-left">
                <h3 className="font-bold text-lg mb-1 flex items-center gap-2">
                  <MapPin className="w-5 h-5" /> Presque terminé !
                </h3>
                <p className="text-sm">
                  Nous allons placer <strong>{formData.name}</strong> à <strong>{formData.address}</strong>.
                  Connectez-vous pour finaliser l'inscription.
                </p>
              </div>

              <button 
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                S'inscrire avec Google
              </button>

              <button 
                onClick={() => setStep(1)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold mt-4"
              >
                Retour pour modifier mes infos
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
