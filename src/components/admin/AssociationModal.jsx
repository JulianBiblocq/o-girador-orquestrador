import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Calendar, ToggleLeft, ToggleRight, Sparkles, Building2, HardDrive, Crown, KeyRound, Lock } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { slugifyAssociationId } from '../../utils/slugUtils';

const formatBytes = (bytes) => {
  if (bytes == null) return '0 Go';
  if (bytes === 0) return '0 Octets';
  const k = 1024;
  const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export default function AssociationModal({ isOpen, initialData, onClose, onSave, onCreateMestre }) {
  const [technicalId, setTechnicalId] = useState('');
  const [isIdManuallyEdited, setIsIdManuallyEdited] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    contactName: '',
    contactEmail: '',
    planType: 'annual',
    formule: 'decouverte',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    membersCount: 20,
    universeId: 'maracatu',
    appAccess: {
      sequenceur: true,
      manager: true,
      vitrine: true,
      dancador: false
    },
    universeAccess: {
      maracatu: true,
      capoeira: false,
      samba: false
    },
    quotas: {
      sequenciador: null,
      dansador: null,
      orchestrador: null
    },
    storage: {
      usedBytes: 0,
      quotaBytes: null
    }
  });

  useEffect(() => {
    if (initialData) {
      const existingId = initialData.id || initialData.groupId || '';
      setTechnicalId(existingId);
      setIsIdManuallyEdited(true);
      setFormData({
        id: existingId,
        name: initialData.name || initialData.nom || '',
        city: initialData.city || '',
        contactName: initialData.contactName || '',
        contactEmail: initialData.contactEmail || '',
        planType: initialData.planType || 'annual',
        formule: (() => {
          const unlockedIdsRaw = initialData.unlockedPacks || [];
          const unlockedIds = unlockedIdsRaw.map(id => id.replace('-monthly', '').replace('-annual', ''));
          const planOrder = ['decouverte', 'createur', 'gestion', 'integrale'];
          return [...planOrder].reverse().find(id => unlockedIds.includes(id)) || 'decouverte';
        })(),
        unlockedPacks: initialData.unlockedPacks || [],
        startDate: initialData.startDate || new Date().toISOString().split('T')[0],
        endDate: initialData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        membersCount: initialData.membersCount ?? 20,
        universeId: initialData.universeId || 'maracatu',
        appAccess: {
          sequenceur: Boolean(initialData.appAccess?.sequenceur ?? true),
          manager: Boolean(initialData.appAccess?.manager ?? true),
          vitrine: Boolean(initialData.appAccess?.vitrine ?? true),
          dancador: Boolean(initialData.appAccess?.dancador ?? false)
        },
        universeAccess: {
          maracatu: Boolean(initialData.universeAccess?.maracatu ?? true),
          batucada: Boolean(initialData.universeAccess?.batucada ?? false),
          sambareggae: Boolean(initialData.universeAccess?.sambareggae ?? false),
          samba: Boolean(initialData.universeAccess?.samba ?? false),
          capoeira: Boolean(initialData.universeAccess?.capoeira ?? false)
        },
        quotas: {
          sequenciador: initialData.quotas?.sequenciador ?? null,
          dansador: initialData.quotas?.dansador ?? null,
          orchestrador: initialData.quotas?.orchestrador ?? null
        },
        storage: {
          usedBytes: initialData.storage?.usedBytes ?? 0,
          quotaBytes: initialData.storage?.quotaBytes ?? null
        }
      });
    } else {
      setTechnicalId('');
      setIsIdManuallyEdited(false);
      setFormData({
        id: '',
        name: '',
        city: '',
        contactName: '',
        contactEmail: '',
        planType: 'annual',
        formule: 'decouverte',
        unlockedPacks: [],
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        membersCount: 20,
        universeId: 'maracatu',
        appAccess: {
          sequenceur: true,
          manager: true,
          vitrine: true,
          dancador: false
        },
        universeAccess: {
          maracatu: true,
          batucada: false,
          sambareggae: false,
          samba: false,
          capoeira: false
        },
        quotas: {
          sequenciador: null,
          dansador: null,
          orchestrador: null
        },
        storage: {
          usedBytes: 0,
          quotaBytes: null
        }
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleNameChange = (newName) => {
    setFormData(prev => ({ ...prev, name: newName }));
    if (!initialData && !isIdManuallyEdited) {
      setTechnicalId(slugifyAssociationId(newName));
    }
  };

  const handleTechnicalIdChange = (val) => {
    setIsIdManuallyEdited(true);
    setTechnicalId(slugifyAssociationId(val));
  };

  const toggleApp = (appKey) => {
    setFormData(prev => ({
      ...prev,
      appAccess: {
        ...prev.appAccess,
        [appKey]: !prev.appAccess[appKey]
      }
    }));
  };

  const toggleUniverse = (uniKey) => {
    setFormData(prev => ({
      ...prev,
      universeAccess: {
        ...prev.universeAccess,
        [uniKey]: !prev.universeAccess[uniKey]
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Nettoyer les anciennes formules principales
    const mainFormulas = ['decouverte', 'createur', 'gestion', 'integrale'];
    let newPacks = (formData.unlockedPacks || []).filter(p => !mainFormulas.includes(p));
    
    // Ajouter la nouvelle formule
    if (formData.formule !== 'decouverte') {
      newPacks.push(formData.formule);
    }
    
    const finalSlugId = (
      technicalId || 
      formData.id || 
      slugifyAssociationId(formData.name) || 
      `asso-${Date.now()}`
    ).trim().toLowerCase();

    const finalData = { 
      ...formData, 
      id: finalSlugId,
      groupId: finalSlugId,
      unlockedPacks: newPacks 
    };
    delete finalData.formule;

    try {
      const docRef = doc(db, 'associations', finalSlugId);
      await setDoc(docRef, {
        ...finalData,
        id: finalSlugId,
        groupId: finalSlugId,
        updatedAt: serverTimestamp(),
        ...(!initialData && { createdAt: serverTimestamp() })
      }, { merge: true });
    } catch (err) {
      console.warn("Firestore setDoc fallback in AssociationModal:", err);
    }

    if (onSave) {
      await onSave(finalData);
    }
  };

  const activeTechnicalId = technicalId || initialData?.groupId || initialData?.id || formData?.id || '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-start justify-center p-4 sm:py-8 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#fdf6e7] xilo-border rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col p-6 sm:p-8 relative shadow-2xl">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-[#4a2e1b]/20 pb-3 shrink-0">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#8b4513]" />
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#4a2e1b] font-cordel">
                {initialData ? 'Éditer la Structure' : 'Créer un Nouveau Bloco / Association'}
              </h2>
              {activeTechnicalId && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] uppercase font-bold text-gray-500">ID Technique :</span>
                  <span className="text-xs font-mono font-bold text-[#8b4513] bg-[#f4e8cf] px-2 py-0.5 rounded border border-[#8b4513]/20">
                    {activeTechnicalId}
                  </span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {initialData && (
              <button
                type="button"
                onClick={() => onCreateMestre?.(initialData)}
                title="Générer un compte Mestre officiel"
                className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-md border border-amber-400/60 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Crown className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden sm:inline">Créer accès Mestre</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#8b4513] hover:text-[#4a2e1b] p-1 bg-[#f4e8cf] rounded-full border border-[#8b4513]/30 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 pt-4">
          <div className="flex-1 overflow-y-auto pr-2 space-y-6">
          
          {/* General info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1">
                Nom du Bloco / Structure *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => handleNameChange(e.target.value)}
                placeholder="ex: Samb'à Bulles"
                className="w-full px-3 py-2 bg-white text-[#2c1d11] text-xs rounded border border-[#4a2e1b]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1">
                Ville / Région
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="ex: Nantes / Recife"
                className="w-full px-3 py-2 bg-white text-[#2c1d11] text-xs rounded border border-[#4a2e1b]"
              />
            </div>

            {/* Identifiant Technique Firestore (Slug normalisé avec vérification visuelle) */}
            <div className="sm:col-span-2 bg-[#f4e8cf]/70 p-3 rounded-lg border-2 border-[#8b4513]/20">
              <div className="flex flex-wrap items-center justify-between gap-1 mb-1.5">
                <label className="text-xs font-bold text-[#8b4513] uppercase flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#8b4513]" />
                  <span>Identifiant Technique Firestore (Slug) *</span>
                </label>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500 font-semibold">Chemin :</span>
                  <span className="text-xs font-mono font-bold text-[#8b4513] bg-white px-2 py-0.5 rounded border border-[#8b4513]/30">
                    associations/{activeTechnicalId || '...'}
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="text"
                  required
                  disabled={Boolean(initialData)}
                  value={activeTechnicalId}
                  onChange={e => handleTechnicalIdChange(e.target.value)}
                  placeholder="ex: sambabulles"
                  className={`w-full px-3 py-2 font-mono text-xs rounded border outline-none transition-colors ${
                    initialData
                      ? 'bg-gray-100 text-gray-600 border-gray-300 cursor-not-allowed select-all'
                      : 'bg-white text-[#4a2e1b] border-[#4a2e1b] focus:border-[#8b4513] focus:ring-1 focus:ring-[#8b4513]'
                  }`}
                />
                {initialData && (
                  <span className="absolute right-3 top-2.5 text-gray-400 flex items-center gap-1 text-[11px]">
                    <Lock className="w-3.5 h-3.5" />
                    <span>Fixe</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-gray-600 mt-1.5 flex items-center justify-between">
                <span>
                  {initialData
                    ? "Identifiant permanent scellé pour sécuriser les liaisons membres et profils."
                    : "Minuscules sans accents ni espaces (ex: \"Samb'à Bulles\" ➔ \"sambabulles\"). Vérifiez-le avant création."}
                </span>
                {!initialData && isIdManuallyEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsIdManuallyEdited(false);
                      setTechnicalId(slugifyAssociationId(formData.name));
                    }}
                    className="text-[#8b4513] hover:underline font-semibold cursor-pointer ml-2 text-[10px]"
                  >
                    Réinitialiser depuis le nom
                  </button>
                )}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1">
                Nom du Contact Principal
              </label>
              <input
                type="text"
                value={formData.contactName}
                onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                placeholder="Mestre / Président"
                className="w-full px-3 py-2 bg-white text-[#2c1d11] text-xs rounded border border-[#4a2e1b]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1">
                Email de Contact *
              </label>
              <input
                type="email"
                required
                value={formData.contactEmail}
                onChange={e => setFormData({ ...formData, contactEmail: e.target.value })}
                placeholder="contact@bloco.org"
                className="w-full px-3 py-2 bg-white text-[#2c1d11] text-xs rounded border border-[#4a2e1b]"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#8b4513] uppercase mb-1">
                Univers Principal
              </label>
              <select
                value={formData.universeId}
                onChange={e => setFormData({ ...formData, universeId: e.target.value })}
                className="w-full px-3 py-2 bg-[#fdf6e7] text-xs font-bold text-[#4a2e1b] rounded border border-[#8b4513]"
              >
                <option value="maracatu">Maracatu de Baque Virado</option>
                <option value="batucada">Batucada</option>
                <option value="sambareggae">Samba-Reggae & Blocos Afro</option>
                <option value="samba">Bateria & Samba</option>
                <option value="capoeira">Capoeira Regional & Angola</option>
              </select>
            </div>
          </div>

          {/* Subscription Dates & Plan */}
          <div className="bg-white/80 p-4 rounded-lg border-2 border-[#8b4513]/20 space-y-4">
            <h3 className="text-xs font-bold text-[#4a2e1b] uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#8b4513]" />
              Abonnement & Échéance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Formule Principale
                </label>
                <select
                  value={formData.formule}
                  onChange={e => setFormData({ ...formData, formule: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fdf6e7] text-xs font-bold text-[#4a2e1b] rounded border border-[#8b4513]"
                >
                  <option value="decouverte">Découverte (Gratuit)</option>
                  <option value="createur">Créateur</option>
                  <option value="gestion">Gestion</option>
                  <option value="integrale">Intégrale</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Facturation
                </label>
                <select
                  value={formData.planType}
                  onChange={e => setFormData({ ...formData, planType: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fdf6e7] text-xs font-bold text-[#4a2e1b] rounded border border-[#8b4513]"
                >
                  <option value="annual">Annuel (Par défaut)</option>
                  <option value="monthly">Mensuel</option>
                  <option value="test">Essai / Test (30j)</option>
                  <option value="permanent">Permanent / Mestre</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Date de Début
                </label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fdf6e7] text-xs font-mono rounded border border-[#8b4513]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Date d'Expiration (Fin)
                </label>
                <input
                  type="date"
                  value={formData.endDate}
                  onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                  className="w-full px-3 py-2 bg-[#fdf6e7] text-xs font-mono rounded border border-[#8b4513]"
                />
              </div>
            </div>
          </div>

          {/* Access Matrix (Toggles) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Apps Matrix */}
            <div className="bg-white/80 p-4 rounded-lg border-2 border-[#8b4513]/20 space-y-3">
              <h3 className="text-xs font-bold text-[#4a2e1b] uppercase">
                Droits Applications (Cartes UI)
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-[#fdf6e7] rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <img src="/logos/sequenciador.png" alt="Sequenciador" className="w-5 h-5 object-contain drop-shadow-sm" />
                    <span className="font-semibold text-gray-800">Sequenciador</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleApp('sequenceur')}
                    className="cursor-pointer"
                  >
                    {formData.appAccess.sequenceur ? (
                      <ToggleRight className="w-7 h-7 text-green-700" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#fdf6e7] rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <img src="/logos/organizador.png" alt="Organizador" className="w-5 h-5 object-contain drop-shadow-sm" />
                    <span className="font-semibold text-gray-800">Organizador</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleApp('manager')}
                    className="cursor-pointer"
                  >
                    {formData.appAccess.manager ? (
                      <ToggleRight className="w-7 h-7 text-green-700" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#fdf6e7] rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <img src="/logos/mostrador.png" alt="Mostrador" className="w-5 h-5 object-contain drop-shadow-sm" />
                    <span className="font-semibold text-gray-800">Mostrador</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleApp('vitrine')}
                    className="cursor-pointer"
                  >
                    {formData.appAccess.vitrine ? (
                      <ToggleRight className="w-7 h-7 text-green-700" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#fdf6e7] rounded border border-gray-200">
                  <div className="flex items-center gap-2">
                    <img src="/logos/dancador.png" alt="Dançador" className="w-5 h-5 object-contain drop-shadow-sm" />
                    <span className="font-semibold text-gray-800">Dançador</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleApp('dancador')}
                    className="cursor-pointer"
                  >
                    {formData.appAccess.dancador ? (
                      <ToggleRight className="w-7 h-7 text-green-700" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Universes Matrix */}
            <div className="bg-white/80 p-4 rounded-lg border-2 border-[#8b4513]/20 space-y-3">
              <h3 className="text-xs font-bold text-[#4a2e1b] uppercase">
                Droits Univers Culturels
              </h3>
              
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 bg-[#fdf6e7] rounded border border-gray-200">
                  <span className="font-semibold text-gray-800">Maracatu de Baque Virado</span>
                  <button
                    type="button"
                    onClick={() => toggleUniverse('maracatu')}
                    className="cursor-pointer"
                  >
                    {formData.universeAccess.maracatu ? (
                      <ToggleRight className="w-7 h-7 text-emerald-700" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#fdf6e7] rounded border border-gray-200">
                  <span className="font-semibold text-gray-800">Batucada</span>
                  <button
                    type="button"
                    onClick={() => toggleUniverse('batucada')}
                    className="cursor-pointer"
                  >
                    {formData.universeAccess.batucada ? (
                      <ToggleRight className="w-7 h-7 text-emerald-700" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#fdf6e7] rounded border border-gray-200">
                  <span className="font-semibold text-gray-800">Samba-Reggae & Blocos Afro</span>
                  <button
                    type="button"
                    onClick={() => toggleUniverse('sambareggae')}
                    className="cursor-pointer"
                  >
                    {formData.universeAccess.sambareggae ? (
                      <ToggleRight className="w-7 h-7 text-emerald-700" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#fdf6e7] rounded border border-gray-200">
                  <span className="font-semibold text-gray-800">Bateria & Samba</span>
                  <button
                    type="button"
                    onClick={() => toggleUniverse('samba')}
                    className="cursor-pointer"
                  >
                    {formData.universeAccess.samba ? (
                      <ToggleRight className="w-7 h-7 text-emerald-700" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between p-2 bg-[#fdf6e7] rounded border border-gray-200">
                  <span className="font-semibold text-gray-800">Capoeira Regional & Angola</span>
                  <button
                    type="button"
                    onClick={() => toggleUniverse('capoeira')}
                    className="cursor-pointer"
                  >
                    {formData.universeAccess.capoeira ? (
                      <ToggleRight className="w-7 h-7 text-emerald-700" />
                    ) : (
                      <ToggleLeft className="w-7 h-7 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quotas Matrix */}
          <div className="bg-white/80 p-4 rounded-lg border-2 border-[#8b4513]/20 space-y-4">
            <h3 className="text-xs font-bold text-[#4a2e1b] uppercase flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#8b4513]" />
              Quotas Badges Administrateur
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Mestre Sequenciador
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quotas?.sequenciador === null || formData.quotas?.sequenciador === undefined ? '' : formData.quotas?.sequenciador}
                  onChange={e => setFormData({ 
                    ...formData, 
                    quotas: { ...formData.quotas, sequenciador: e.target.value === '' ? null : parseInt(e.target.value, 10) }
                  })}
                  placeholder="Illimité"
                  className="w-full px-3 py-2 bg-[#fdf6e7] text-xs font-mono rounded border border-[#8b4513]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Mestre Dançador
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quotas?.dansador === null || formData.quotas?.dansador === undefined ? '' : formData.quotas?.dansador}
                  onChange={e => setFormData({ 
                    ...formData, 
                    quotas: { ...formData.quotas, dansador: e.target.value === '' ? null : parseInt(e.target.value, 10) }
                  })}
                  placeholder="Illimité"
                  className="w-full px-3 py-2 bg-[#fdf6e7] text-xs font-mono rounded border border-[#8b4513]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Mestre Orchestrador
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.quotas?.orchestrador === null || formData.quotas?.orchestrador === undefined ? '' : formData.quotas?.orchestrador}
                  onChange={e => setFormData({ 
                    ...formData, 
                    quotas: { ...formData.quotas, orchestrador: e.target.value === '' ? null : parseInt(e.target.value, 10) }
                  })}
                  placeholder="Illimité"
                  className="w-full px-3 py-2 bg-[#fdf6e7] text-xs font-mono rounded border border-[#8b4513]"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 italic">Laissez vide pour un accès "Illimité". Mettez 0 pour bloquer l'accès.</p>
          </div>

          {/* Cloud Storage */}
          <div className="bg-white/80 p-4 rounded-lg border-2 border-[#8b4513]/20 space-y-4">
            <h3 className="text-xs font-bold text-[#4a2e1b] uppercase flex items-center gap-1.5">
              <HardDrive className="w-4 h-4 text-[#8b4513]" />
              Stockage Cloud
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Espace Utilisé
                </label>
                <div className="w-full px-3 py-2 bg-gray-100 text-xs text-gray-600 font-mono rounded border border-gray-300">
                  {formatBytes(formData.storage?.usedBytes)}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Quota alloué (en Go)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.storage?.quotaBytes ? formData.storage.quotaBytes / (1024 ** 3) : ''}
                  onChange={e => setFormData({ 
                    ...formData, 
                    storage: { 
                      ...formData.storage, 
                      quotaBytes: e.target.value === '' ? null : parseFloat(e.target.value) * (1024 ** 3) 
                    }
                  })}
                  placeholder="Ex: 30"
                  className="w-full px-3 py-2 bg-[#fdf6e7] text-xs font-mono rounded border border-[#8b4513]"
                />
              </div>
            </div>
            <p className="text-[10px] text-gray-500 italic">Laissez vide pour aucun quota (illimité ou géré ailleurs).</p>
          </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#8b4513]/20 shrink-0 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold text-xs rounded transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#8b4513] hover:bg-[#6e370f] text-[#fdf6e7] font-bold text-xs rounded transition-all shadow flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer la Structure</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
