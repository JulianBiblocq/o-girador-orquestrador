import React, { useState } from 'react';
import { X, Lock, KeyRound, LogOut, CheckCircle2, AlertCircle, Loader2, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLoginModal({ isOpen, onClose }) {
  const { currentUser, isAdmin, login, loginWithGoogle, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      onClose();
    } catch (err) {
      console.error("Erreur de connexion Admin :", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Identifiants administrateur incorrects.');
      } else {
        setError('Impossible de se connecter. Vérifiez vos identifiants Firebase.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error("Erreur Google Auth :", err);
      setError('Erreur lors de la connexion Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      onClose();
    } catch (err) {
      console.error("Erreur déconnexion :", err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fdf6e7] xilo-border rounded-xl max-w-md w-full p-6 sm:p-8 relative shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#8b4513] hover:text-[#4a2e1b] p-1 bg-[#f4e8cf] rounded-full cursor-pointer border border-[#8b4513]/30"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#8b4513] text-[#fdf6e7] rounded-full flex items-center justify-center mx-auto shadow-md border-2 border-[#4a2e1b]">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#4a2e1b] font-cordel">
            Accès Administrateur
          </h2>
          <p className="text-xs text-[#8b4513]">
            Espace réservé à l'administration de l'écosystème O Girador.
          </p>
        </div>

        {/* Already Logged In View */}
        {currentUser ? (
          <div className="bg-white/80 p-4 rounded-lg border-2 border-[#8b4513]/30 space-y-4 text-center">
            <div className="flex items-center justify-center gap-2 text-green-700 font-bold text-sm">
              <ShieldCheck className="w-5 h-5" />
              <span>Connecté en tant qu'Administrateur</span>
            </div>
            <div className="text-xs text-gray-700 font-mono bg-gray-100 p-2 rounded">
              {currentUser.email}
            </div>
            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-red-800 hover:bg-red-900 text-white font-bold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Se Déconnecter</span>
            </button>
          </div>
        ) : (
          /* Login Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#8b4513] uppercase">
                Email Administrateur
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@ogirador.app"
                disabled={loading}
                className="w-full px-3 py-2.5 bg-white text-[#2c1d11] text-sm rounded-lg border-2 border-[#4a2e1b] focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#8b4513] uppercase">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
                className="w-full px-3 py-2.5 bg-white text-[#2c1d11] text-sm rounded-lg border-2 border-[#4a2e1b] focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-xs text-red-700 bg-red-100 p-2 rounded border border-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#8b4513] hover:bg-[#6e370f] text-[#fdf6e7] font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shadow cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-2.5 bg-white border-2 border-[#4a2e1b] text-[#4a2e1b] font-bold text-xs rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Connexion via Google</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}
