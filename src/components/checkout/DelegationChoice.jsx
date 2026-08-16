import React, { useState } from 'react';
import { delegateConfiguration } from '../../services/subscriptionService';
import { User, Users, Loader2, Send } from 'lucide-react';

export default function DelegationChoice({ subscription, onComplete }) {
  const [choice, setChoice] = useState(null); // 'self' or 'delegate'
  const [mestreEmail, setMestreEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSelfSetup = () => {
    // Redirect to manager setup with the secure token
    const setupUrl = `https://app.ogirador.fr/setup?token=${subscription.token}&asso=${encodeURIComponent(subscription.associationName)}&email=${encodeURIComponent(subscription.billingEmail)}`;
    window.location.href = setupUrl;
  };

  const handleDelegateSubmit = async (e) => {
    e.preventDefault();
    if (!mestreEmail) return;

    setLoading(true);
    setError('');

    try {
      await delegateConfiguration(subscription.id, mestreEmail, subscription.token);
      onComplete();
    } catch (err) {
      console.error(err);
      setError("Impossible d'envoyer l'invitation. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-3xl font-bold font-cordel text-[#4a2e1b] mb-2">
        Configuration de l'Espace
      </h2>
      <p className="text-sm text-[#8b4513] mb-8 font-medium">
        Votre paiement est validé ! Qui va configurer l'application Manager pour l'association <strong>{subscription.associationName}</strong> ?
      </p>

      {!choice && (
        <div className="grid sm:grid-cols-2 gap-6">
          <button
            onClick={() => setChoice('self')}
            className="flex flex-col items-center justify-center p-8 border-2 border-[#8b4513]/30 rounded-2xl bg-[#fdf6e7] hover:border-[#8b4513] hover:shadow-xl transition-all group"
          >
            <User className="w-12 h-12 text-[#8b4513] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-[#4a2e1b] mb-2 text-center">C'est moi !</h3>
            <p className="text-xs text-[#8b4513] text-center">
              Je vais configurer l'application Manager immédiatement.
            </p>
          </button>

          <button
            onClick={() => setChoice('delegate')}
            className="flex flex-col items-center justify-center p-8 border-2 border-[#8b4513]/30 rounded-2xl bg-[#fdf6e7] hover:border-[#8b4513] hover:shadow-xl transition-all group"
          >
            <Users className="w-12 h-12 text-[#8b4513] mb-4 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg font-bold text-[#4a2e1b] mb-2 text-center">Je délègue</h3>
            <p className="text-xs text-[#8b4513] text-center">
              À notre Mestre ou Responsable technique.
            </p>
          </button>
        </div>
      )}

      {choice === 'self' && (
        <div className="text-center py-8">
          <Loader2 className="w-12 h-12 animate-spin text-[#8b4513] mx-auto mb-4" />
          <p className="text-[#8b4513] font-bold">Redirection vers votre espace Manager...</p>
          {/* Automatically redirect after a slight delay to feel natural */}
          {setTimeout(handleSelfSetup, 1500) && null}
        </div>
      )}

      {choice === 'delegate' && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="bg-[#f4e8cf] p-6 rounded-xl border border-[#8b4513]/20">
            <h3 className="font-bold text-[#4a2e1b] mb-2 flex items-center gap-2">
              <Send className="w-5 h-5 text-[#8b4513]" />
              Inviter le Responsable
            </h3>
            <p className="text-xs text-[#8b4513] mb-6">
              Nous allons lui envoyer un lien magique sécurisé pour qu'il puisse finaliser la configuration.
            </p>

            <form onSubmit={handleDelegateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#8b4513] mb-1">
                  Email du Mestre
                </label>
                <input
                  type="email"
                  value={mestreEmail}
                  onChange={(e) => setMestreEmail(e.target.value)}
                  required
                  placeholder="mestre@mon-asso.fr"
                  className="w-full px-4 py-3 rounded-lg border border-[#8b4513]/30 focus:border-[#8b4513] focus:ring-1 focus:ring-[#8b4513] bg-white text-[#2c1d11]"
                />
              </div>

              {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setChoice(null)}
                  className="px-6 py-3 rounded-lg font-bold text-[#8b4513] border border-[#8b4513]/30 hover:bg-[#ebd8b3] transition-colors"
                >
                  Retour
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-3 bg-[#8b4513] text-[#fdf6e7] font-bold rounded-lg shadow-md hover:bg-[#6e370f] transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Envoyer l'invitation"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
