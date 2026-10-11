import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  CreditCard, 
  ShoppingBag, 
  PlayCircle, 
  Save, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff, 
  Sparkles, 
  RotateCcw,
  ExternalLink
} from 'lucide-react';
import { 
  getHubDisplaySettings, 
  updateHubDisplaySettings, 
  DEFAULT_HUB_DISPLAY_SETTINGS 
} from '../../services/hubSettingsService';

export default function HubDisplaySettingsTab() {
  const [settings, setSettings] = useState(DEFAULT_HUB_DISPLAY_SETTINGS);
  const [initialSettings, setInitialSettings] = useState(DEFAULT_HUB_DISPLAY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null); // { type: 'success' | 'error', message: string }

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const data = await getHubDisplaySettings();
      setSettings(data);
      setInitialSettings(data);
    } catch (err) {
      console.error("Erreur chargement paramètres vitrine :", err);
      setFeedback({
        type: 'error',
        message: "Impossible de charger les paramètres depuis Firestore."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (key) => {
    setSettings((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleResetToDefault = () => {
    if (window.confirm("Voulez-vous réinitialiser tous les toggles aux valeurs par défaut (tout masqué) ?")) {
      setSettings(DEFAULT_HUB_DISPLAY_SETTINGS);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      await updateHubDisplaySettings(settings);
      setInitialSettings(settings);
      setFeedback({
        type: 'success',
        message: "Paramètres vitrine enregistrés avec succès ! La page d'accueil est immédiatement synchronisée."
      });
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error("Erreur enregistrement paramètres vitrine :", err);
      setFeedback({
        type: 'error',
        message: "Une erreur est survenue lors de l'enregistrement dans Firestore."
      });
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = 
    settings.showPricing !== initialSettings.showPricing ||
    settings.showAddons !== initialSettings.showAddons ||
    settings.showTutorials !== initialSettings.showTutorials;

  const togglesConfig = [
    {
      id: 'showPricing',
      title: 'Grille Tarifaire & Abonnements',
      componentName: '<PricingSynergySection />',
      description: 'Affiche la section des offres d\'adhésion / forfaits sur la page d\'accueil publique, ainsi que les liens et boutons "Tarifs" dans le Hero et le Header.',
      icon: CreditCard,
      color: 'amber'
    },
    {
      id: 'showAddons',
      title: 'Boutique d\'Add-ons & Packs',
      componentName: '<AddonsStore />',
      description: 'Affiche la boutique de packs additionnels (rythmes, répertoires, chorégraphies, varal de cordel) sur la page d\'accueil et le raccourci "Boutique" dans la barre de navigation.',
      icon: ShoppingBag,
      color: 'emerald'
    },
    {
      id: 'showTutorials',
      title: 'Tutoriels & Démonstrations Vidéo',
      componentName: '<TutorialsSection />',
      description: 'Affiche la section de vidéos pédagogiques et tutoriels sur la page d\'accueil, la vue /tutos et les icônes de démonstration dans le Hero et le Header.',
      icon: PlayCircle,
      color: 'blue'
    }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-[#8b4513]" />
        <p className="font-bold text-sm text-[#4a2e1b] uppercase tracking-wider font-cordel">
          Chargement de la configuration vitrine...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header du panneau */}
      <div className="bg-[#fdf6e7] border-2 border-[#8b4513] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-[#8b4513] text-[#fdf6e7] rounded-xl shadow-xs">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black font-cordel text-[#4a2e1b]">
                Paramètres d'Affichage de la Vitrine (Hub)
              </h2>
              <span className="text-xs font-mono bg-[#8b4513]/10 text-[#8b4513] px-2 py-0.5 rounded font-bold">
                Firestore: settings/hub_display
              </span>
            </div>
          </div>
          <p className="text-xs sm:text-sm text-[#8b4513] mt-2 max-w-2xl leading-relaxed">
            Activez ou désactivez les sections publiques du Hub d'accueil selon l'avancement des déploiements.
            Idéal pour lancer une première association en masquant les briques non finalisées.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleResetToDefault}
            disabled={saving}
            className="px-3.5 py-2.5 rounded-xl border border-[#8b4513]/30 text-[#4a2e1b] hover:bg-[#f4e8cf] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Désactiver toutes les sections"
          >
            <RotateCcw className="w-4 h-4 text-[#8b4513]" />
            <span>Tout masquer</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || !hasChanges}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-md cursor-pointer ${
              hasChanges 
                ? 'bg-[#8b4513] hover:bg-[#6e370f] text-[#fdf6e7] scale-102 ring-2 ring-[#8b4513]/40' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
            }`}
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{hasChanges ? 'Enregistrer les modifications' : 'À jour'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Notifications Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm animate-fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-red-50 border-red-300 text-red-800'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-semibold">{feedback.message}</span>
        </div>
      )}

      {/* Carte Résumé en direct */}
      <div className="bg-gradient-to-r from-[#f7eed9] to-[#faebd7] border-2 border-[#8b4513]/30 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-[#4a2e1b] font-cordel">
            <Sparkles className="w-4 h-4 text-[#e67e22]" />
            <span>Aperçu de la visibilité publique actuelle</span>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-bold text-[#8b4513] hover:text-[#4a2e1b] flex items-center gap-1 hover:underline cursor-pointer"
          >
            <span>Voir la page d'accueil</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {togglesConfig.map((item) => {
            const isVisible = !!settings[item.id];
            return (
              <div 
                key={item.id} 
                className={`p-3.5 rounded-xl border-2 transition-all flex items-center justify-between ${
                  isVisible 
                    ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900 shadow-xs' 
                    : 'bg-white/60 border-gray-200 text-gray-500'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  {isVisible ? (
                    <Eye className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-gray-400 shrink-0" />
                  )}
                  <span className="text-xs font-bold truncate">{item.title}</span>
                </div>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${
                  isVisible ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {isVisible ? 'Visible' : 'Masqué'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Liste des 3 Toggles Tailwind */}
      <div className="space-y-4">
        {togglesConfig.map((item) => {
          const isEnabled = !!settings[item.id];
          const IconComponent = item.icon;

          return (
            <div
              key={item.id}
              className={`p-5 rounded-2xl border-2 transition-all duration-200 bg-white ${
                isEnabled
                  ? 'border-[#8b4513] shadow-md'
                  : 'border-gray-200 hover:border-[#8b4513]/40'
              }`}
            >
              <div className="flex items-start sm:items-center justify-between gap-4">
                
                {/* Info & Titre */}
                <div className="flex items-start gap-3.5">
                  <div className={`p-3 rounded-xl shrink-0 mt-0.5 sm:mt-0 ${
                    isEnabled 
                      ? 'bg-[#8b4513] text-[#fdf6e7]' 
                      : 'bg-gray-100 text-gray-400'
                  }`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-extrabold text-base text-[#4a2e1b] font-cordel">
                        {item.title}
                      </h3>
                      <span className="text-[11px] font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">
                        {item.componentName}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isEnabled
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}>
                        {isEnabled ? '● Activé sur la Vitrine' : '○ Masqué pour le public'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed max-w-2xl">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Interrupteur Toggle Tailwind */}
                <div className="shrink-0 flex items-center pt-1 sm:pt-0">
                  <label 
                    htmlFor={`toggle-${item.id}`} 
                    className="relative inline-flex items-center cursor-pointer select-none"
                  >
                    <input
                      id={`toggle-${item.id}`}
                      type="checkbox"
                      checked={isEnabled}
                      onChange={() => handleToggle(item.id)}
                      className="sr-only peer"
                      aria-label={item.title}
                    />
                    <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all after:shadow-sm peer-checked:bg-[#8b4513] hover:after:scale-105"></div>
                  </label>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Note d'information de bas de page */}
      <div className="p-4 rounded-xl bg-[#fdf6e7] border border-[#8b4513]/20 text-xs text-[#8b4513] leading-relaxed flex items-start gap-2.5">
        <Sparkles className="w-4 h-4 text-[#e67e22] shrink-0 mt-0.5" />
        <div>
          <strong>Architecture SSOT & Anti-Flash :</strong> Les modifications apportées ici écrivent directement dans le document Firestore <code className="bg-white/80 px-1 py-0.5 rounded font-mono">settings/hub_display</code>. La page d'accueil applique immédiatement ces options sans rechargement de page nécessaire pour les utilisateurs connectés ou visiteurs en direct.
        </div>
      </div>

    </div>
  );
}
