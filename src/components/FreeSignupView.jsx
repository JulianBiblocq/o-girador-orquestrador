import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { 
  MapPin, 
  Globe2, 
  Music, 
  Loader2, 
  ArrowLeft, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import universData from '../data/univers.json';

export default function FreeSignupView({ onNavigateHome, onNavigateToClient }) {
  const { loginWithGoogle, login, signupWithEmail, userData, isProvisioning } = useAuth();
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    universeId: 'maracatu',
    address: ''
  });

  // Mode d'authentification : 'signup' (création) ou 'login' (compte existant)
  const [authMode, setAuthMode] = useState('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [waitingForProvision, setWaitingForProvision] = useState(false);

  // Écoute de la fin du provisioning ou de la connexion
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
      setAuthError('');
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setAuthError('');

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setAuthError("Veuillez saisir votre adresse email.");
      return;
    }

    if (!password || password.length < 6) {
      setAuthError("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    setIsProcessing(true);
    setWaitingForProvision(true);

    try {
      if (authMode === 'signup') {
        await signupWithEmail(cleanEmail, password);
      } else {
        await login(cleanEmail, password);
      }
      // Le reste sera géré par onAuthStateChanged dans AuthContext + le useEffect ci-dessus
    } catch (err) {
      console.error("Erreur d'authentification email:", err);
      setIsProcessing(false);
      setWaitingForProvision(false);

      if (err.code === 'auth/email-already-in-use') {
        setAuthError("Cette adresse email possède déjà un compte. Basculez sur 'Se connecter' ci-dessous.");
      } else if (err.code === 'auth/weak-password') {
        setAuthError("Le mot de passe doit comporter au moins 6 caractères.");
      } else if (err.code === 'auth/invalid-email') {
        setAuthError("L'adresse email n'est pas valide.");
      } else if (
        err.code === 'auth/invalid-credential' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/user-not-found'
      ) {
        setAuthError("Identifiants incorrects (email ou mot de passe erroné).");
      } else {
        setAuthError(err.message || "Une erreur est survenue lors de l'authentification.");
      }
    }
  };

  const handleGoogleSignup = async () => {
    setAuthError('');
    try {
      setIsProcessing(true);
      setWaitingForProvision(true);
      await loginWithGoogle();
    } catch (error) {
      console.error("Erreur lors de la connexion Google:", error);
      setIsProcessing(false);
      setWaitingForProvision(false);
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError("Erreur lors de la connexion Google. Veuillez réessayer.");
      }
    }
  };

  const finalizeSignup = async (groupId) => {
    try {
      let location = null;
      // Géocodage résilient de l'adresse avec timeout de 5 secondes
      if (formData.address && formData.address.trim() !== '') {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(formData.address)}`,
            { signal: controller.signal }
          );
          clearTimeout(timeoutId);
          const data = await response.json();
          if (data && data.length > 0) {
            location = {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon)
            };
          }
        } catch (err) {
          console.warn("Avertissement géocodage OpenStreetMap:", err);
        }
      }

      // Mise à jour ou création du document d'association provisionné
      const docRef = doc(db, 'associations', groupId);
      await setDoc(docRef, {
        name: formData.name,
        nom: formData.name,
        universeId: formData.universeId,
        address: formData.address,
        adresseLocal: formData.address,
        ...(location ? { location } : {}),
        isPublicInTerreiro: true,
        updatedAt: serverTimestamp()
      }, { merge: true });

      // Redirection vers le dashboard client
      onNavigateToClient();
    } catch (error) {
      console.error("Erreur lors de la finalisation:", error);
      setIsProcessing(false);
      setAuthError("Votre compte a été créé mais une erreur est survenue lors de l'enregistrement de l'adresse.");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf6e7] pt-24 pb-12 flex flex-col items-center justify-center px-4">
      <div className="max-w-xl w-full">
        
        <button 
          onClick={onNavigateHome}
          className="flex items-center gap-2 text-gray-500 hover:text-[#8b4513] font-bold text-sm transition-colors w-max mb-8 cursor-pointer"
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
              <p className="font-bold text-[#8b4513] animate-pulse text-center">
                Création de votre espace et géocodage de votre groupe...
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
                className="w-full bg-[#d2691e] hover:bg-[#b05819] text-white px-6 py-4 rounded-xl font-bold text-lg shadow-md transition-all disabled:opacity-50 mt-4 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Continuer</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              
              {/* Récapitulatif du groupe */}
              <div className="bg-amber-50 border border-amber-200 text-[#8b4513] p-4 rounded-xl shadow-sm text-left">
                <h3 className="font-bold text-base mb-1 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-700 shrink-0" />
                  <span>Dernière étape !</span>
                </h3>
                <p className="text-sm text-amber-900 leading-relaxed">
                  Votre groupe <strong>{formData.name}</strong> sera placé à <strong>{formData.address}</strong>. Créez vos accès pour valider la fiche.
                </p>
              </div>

              {/* Message d'erreur éventuel */}
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2 text-left">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Sélecteur de mode : Inscription / Connexion */}
              <div className="flex bg-[#f4e8cf]/50 p-1 rounded-xl border border-[#8b4513]/20">
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setAuthError(''); }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'signup' 
                      ? 'bg-[#8b4513] text-[#fdf6e7] shadow-sm' 
                      : 'text-[#4a2e1b] hover:text-[#8b4513]'
                  }`}
                >
                  Nouveau compte
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setAuthError(''); }}
                  className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    authMode === 'login' 
                      ? 'bg-[#8b4513] text-[#fdf6e7] shadow-sm' 
                      : 'text-[#4a2e1b] hover:text-[#8b4513]'
                  }`}
                >
                  J'ai déjà un compte
                </button>
              </div>

              {/* Formulaire Email + Mot de passe */}
              <form onSubmit={handleEmailAuth} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#8b4513]" />
                    Adresse email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="contact@mon-groupe.org"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none text-sm transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#8b4513]" />
                    Mot de passe
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="Minimum 6 caractères"
                      className="w-full px-4 py-3 pr-11 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none text-sm transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {authMode === 'signup' && (
                    <p className="text-[11px] text-gray-400">
                      Ce mot de passe servira à administrer la fiche de votre groupe.
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!email.trim() || !password || password.length < 6}
                  className="w-full bg-[#8b4513] hover:bg-[#6d360f] text-white px-6 py-3.5 rounded-xl font-bold text-base shadow-md transition-all disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 mt-2"
                >
                  <span>
                    {authMode === 'signup' 
                      ? "Créer mon compte et placer mon groupe" 
                      : "Se connecter et placer mon groupe"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Séparateur */}
              <div className="relative flex items-center justify-center my-4">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="bg-white px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  ou
                </span>
                <div className="border-t border-gray-200 w-full"></div>
              </div>

              {/* Inscription avec Google */}
              <button 
                type="button"
                onClick={handleGoogleSignup}
                className="w-full flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-gray-700 font-bold rounded-xl border-2 border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm cursor-pointer text-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                Continuer avec Google
              </button>

              <div className="text-center pt-2">
                <button 
                  type="button"
                  onClick={() => { setStep(1); setAuthError(''); }}
                  className="text-gray-400 hover:text-gray-600 text-xs font-bold transition-colors cursor-pointer"
                >
                  ← Modifier les informations du groupe
                </button>
              </div>

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
