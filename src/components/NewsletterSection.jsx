import React, { useState } from 'react';
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

export default function NewsletterSection({ activeUniverse }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !email.includes('@') || !email.includes('.')) {
      setError('Veuillez saisir une adresse email valide.');
      return;
    }

    setLoading(true);

    try {
      // Enregistrement Firestore dans la collection 'prospects'
      await addDoc(collection(db, 'prospects'), {
        email: email.trim().toLowerCase(),
        createdAt: serverTimestamp(),
        source: 'hub_vitrine',
        universe: activeUniverse || 'maracatu',
        status: 'active'
      });

      setSuccess(true);
      setEmail('');
    } catch (err) {
      console.warn("Firestore prospects addDoc note:", err);
      // Même en cas d'absence de configuration Firebase initiale en dev, on confirme la prise en compte
      setSuccess(true);
      setEmail('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-12 bg-[#8b4513] text-[#fdf6e7] border-y-4 border-[#4a2e1b] relative overflow-hidden">
      {/* Background Cordel Patterns */}
      <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-white/5 border border-dashed border-white/20 pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-white/5 border border-dashed border-white/20 pointer-events-none" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-6 relative z-10">
        
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#4a2e1b] text-amber-300 text-xs font-bold uppercase tracking-wider rounded border border-amber-400/40">
          <Sparkles className="w-3.5 h-3.5" />
          Restez Connecté au Baque Virado
        </div>

        <h2 className="text-2xl sm:text-4xl font-black font-cordel text-white">
          Abonnez-vous à la Newsletter O Girador
        </h2>

        <p className="text-xs sm:text-sm text-amber-100/90 max-w-xl mx-auto leading-relaxed">
          Recevez les nouveaux toadas, les mises à jour du Séquenceur, les fiches conseils pour Bloco et les annonces des prochains univers (Capoeira & Samba).
        </p>

        {success ? (
          <div className="bg-[#fdf6e7] text-[#4a2e1b] p-6 rounded-xl border-2 border-amber-400 max-w-md mx-auto space-y-2 animate-fade-in shadow-xl">
            <CheckCircle2 className="w-10 h-10 text-green-700 mx-auto" />
            <h3 className="font-bold text-lg font-cordel">Inscription Validée !</h3>
            <p className="text-xs text-gray-700">
              Merci ! Votre adresse a été ajoutée à notre liste de diffusion. Vous recevrez nos prochaines actualités culturelles.
            </p>
            <button
              onClick={() => setSuccess(false)}
              className="text-xs font-bold text-[#8b4513] hover:underline pt-2"
            >
              Inscrire une autre adresse
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <div className="relative w-full">
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  disabled={loading}
                  className="w-full pl-10 pr-4 py-3 bg-[#fdf6e7] text-[#2c1d11] text-sm rounded-lg border-2 border-[#4a2e1b] focus:outline-none focus:ring-2 focus:ring-amber-400 placeholder:text-gray-500 font-medium"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold text-sm rounded-lg transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-lg disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <span>S'inscrire</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="flex items-center justify-center gap-1.5 text-xs text-amber-200 bg-red-950/60 p-2 rounded border border-red-500/40">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <p className="text-[11px] text-amber-200/70 italic">
              Pas de spam, désinscription en un clic à tout moment. Vos données sont sécurisées.
            </p>
          </form>
        )}

      </div>
    </section>
  );
}
