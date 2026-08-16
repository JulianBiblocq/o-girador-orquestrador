import React, { useState, useEffect } from 'react';
import { X, Save, Shield, Calendar, ToggleLeft, ToggleRight, Sparkles, Building2 } from 'lucide-react';

export default function AssociationModal({ isOpen, initialData, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    contactName: '',
    contactEmail: '',
    planType: 'annual',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    membersCount: 20,
    appAccess: {
      sequenceur: true,
      manager: true,
      vitrine: true
    },
    universeAccess: {
      maracatu: true,
      capoeira: false,
      samba: false
    }
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id || '',
        name: initialData.name || initialData.nom || '',
        city: initialData.city || '',
        contactName: initialData.contactName || '',
        contactEmail: initialData.contactEmail || '',
        planType: initialData.planType || 'annual',
        startDate: initialData.startDate || new Date().toISOString().split('T')[0],
        endDate: initialData.endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        membersCount: initialData.membersCount ?? 20,
        appAccess: {
          sequenceur: Boolean(initialData.appAccess?.sequenceur ?? true),
          manager: Boolean(initialData.appAccess?.manager ?? true),
          vitrine: Boolean(initialData.appAccess?.vitrine ?? true)
        },
        universeAccess: {
          maracatu: Boolean(initialData.universeAccess?.maracatu ?? true),
          capoeira: Boolean(initialData.universeAccess?.capoeira ?? false),
          samba: Boolean(initialData.universeAccess?.samba ?? false)
        }
      });
    } else {
      setFormData({
        name: '',
        city: '',
        contactName: '',
        contactEmail: '',
        planType: 'annual',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        membersCount: 20,
        appAccess: {
          sequenceur: true,
          manager: true,
          vitrine: true
        },
        universeAccess: {
          maracatu: true,
          capoeira: false,
          samba: false
        }
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#fdf6e7] xilo-border rounded-xl max-w-2xl w-full p-6 sm:p-8 relative shadow-2xl space-y-6 my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b-2 border-[#4a2e1b]/20 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-[#8b4513]" />
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#4a2e1b] font-cordel">
              {initialData ? 'Éditer la Structure' : 'Créer un Nouveau Bloco / Association'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#8b4513] hover:text-[#4a2e1b] p-1 bg-[#f4e8cf] rounded-full border border-[#8b4513]/30 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
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
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="ex: Maracatu Estrela de Ouro"
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
          </div>

          {/* Subscription Dates & Plan */}
          <div className="bg-white/80 p-4 rounded-lg border-2 border-[#8b4513]/20 space-y-4">
            <h3 className="text-xs font-bold text-[#4a2e1b] uppercase flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#8b4513]" />
              Abonnement & Échéance
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                  Type de Forfait
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
                  <span className="font-semibold text-gray-800">🥁 Séquenceur</span>
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
                  <span className="font-semibold text-gray-800">📋 Manager Bloco</span>
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
                  <span className="font-semibold text-gray-800">🌐 Vitrine Publique</span>
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

                <div className="flex items-center justify-between p-2 bg-[#fdf6e7] rounded border border-gray-200">
                  <span className="font-semibold text-gray-800">Samba de Enredo & Batucada</span>
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
              </div>
            </div>

          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-3 border-t border-[#8b4513]/20">
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
