import React, { useState } from 'react';
import { Save, Plus, X, BarChart3, Trophy, Globe, Flame } from 'lucide-react';

const UNIVERSES = [
  { id: 'maracatu', label: 'Maracatu', color: 'bg-amber-100 text-amber-800' },
  { id: 'samba', label: 'Samba', color: 'bg-emerald-100 text-emerald-800' },
  { id: 'capoeira', label: 'Capoeira', color: 'bg-orange-100 text-orange-800' },
  { id: 'universal', label: 'Universel', color: 'bg-purple-100 text-purple-800' }
];

export default function AdminConcours({ associations = [] }) {
  // KPI Calculation
  const universeCounts = associations.reduce((acc, assoc) => {
    if (assoc && assoc.universeId) {
      acc[assoc.universeId] = (acc[assoc.universeId] || 0) + 1;
    }
    return acc;
  }, {});

  const [concours, setConcours] = useState([
    {
      id: 'c-1',
      title: 'Composition Libre - Maracatu Lent',
      description: 'Créez la meilleure composition de Maracatu Lent dans le Séquenceur.',
      universeId: 'maracatu',
      deadline: '2026-09-30',
      isActive: true
    }
  ]);

  const [editingConcours, setEditingConcours] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleEdit = (c) => setEditingConcours({ ...c });
  const handleAddNew = () => setEditingConcours({
    id: '',
    title: '',
    description: '',
    universeId: 'maracatu',
    deadline: '',
    isActive: false
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      if (editingConcours.id) {
        setConcours(concours.map(c => c.id === editingConcours.id ? editingConcours : c));
      } else {
        setConcours([...concours, { ...editingConcours, id: `c-${Date.now()}` }]);
      }
      setEditingConcours(null);
      setSaving(false);
      alert("Concours sauvegardé ! (Simulation)");
    }, 500);
  };

  const toggleStatus = (id) => {
    setConcours(concours.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c));
  };

  // --- VUE FORMULAIRE ---
  if (editingConcours) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black font-cordel text-[#4a2e1b]">
            {editingConcours.id ? "Modifier le Défi" : "Nouveau Défi du Mois"}
          </h2>
          <button 
            onClick={() => setEditingConcours(null)}
            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-5 border border-[#8b4513]/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8b4513] uppercase">Titre du Défi</label>
              <input 
                type="text" 
                value={editingConcours.title}
                onChange={e => setEditingConcours({...editingConcours, title: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                placeholder="Ex: Concours de Composition"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8b4513] uppercase">Cible (Univers)</label>
              <select 
                value={editingConcours.universeId}
                onChange={e => setEditingConcours({...editingConcours, universeId: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold"
              >
                {UNIVERSES.map(uni => (
                  <option key={uni.id} value={uni.id}>{uni.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#8b4513] uppercase">Description des règles</label>
            <textarea 
              value={editingConcours.description}
              onChange={e => setEditingConcours({...editingConcours, description: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8b4513] uppercase">Date de fin</label>
              <input 
                type="date" 
                value={editingConcours.deadline}
                onChange={e => setEditingConcours({...editingConcours, deadline: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold"
              />
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input 
                type="checkbox"
                id="activeToggle"
                checked={editingConcours.isActive}
                onChange={e => setEditingConcours({...editingConcours, isActive: e.target.checked})}
                className="w-5 h-5 rounded text-[#8b4513] focus:ring-[#8b4513]"
              />
              <label htmlFor="activeToggle" className="text-sm font-bold text-[#4a2e1b] cursor-pointer">
                Publier ce défi immédiatement
              </label>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3 border-t border-gray-100">
            <button 
              onClick={() => setEditingConcours(null)}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
              disabled={saving}
            >
              Annuler
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-bold bg-[#8b4513] text-[#fdf6e7] hover:bg-[#6b3410] flex items-center gap-2 transition-colors shadow-md disabled:opacity-70 disabled:cursor-wait"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Enregistrement...' : 'Sauvegarder le défi'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VUE PRINCIPALE ---
  return (
    <div className="space-y-8">
      
      {/* Header & KPI */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black font-cordel text-[#4a2e1b] flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-500" />
              Gamification & Défis
            </h2>
            <p className="text-sm text-[#8b4513]">Animez la communauté en lançant des concours mensuels.</p>
          </div>
          <button 
            onClick={handleAddNew}
            className="bg-[#8b4513] hover:bg-[#6b3410] text-[#fdf6e7] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" /> Nouveau Défi
          </button>
        </div>

        {/* KPI Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-[#8b4513]/20 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Groupes actifs par univers
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {UNIVERSES.filter(u => u.id !== 'universal').map(uni => (
              <div key={uni.id} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                <div className="text-[10px] uppercase font-bold text-gray-500 mb-1">{uni.label}</div>
                <div className="text-2xl font-black text-[#4a2e1b]">
                  {universeCounts[uni.id] || 0} <span className="text-sm font-normal text-gray-500">groupe(s)</span>
                </div>
              </div>
            ))}
            <div className="bg-[#fdf6e7] rounded-lg p-4 border border-[#d4b895]">
              <div className="text-[10px] uppercase font-bold text-[#8b4513] mb-1">Total Réseau</div>
              <div className="text-2xl font-black text-[#8b4513]">
                {associations.length} <span className="text-sm font-normal text-[#8b4513]/70">groupe(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des Concours */}
      <div className="bg-white rounded-xl shadow-sm border border-[#8b4513]/20 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f4e8cf] text-[#8b4513] text-xs uppercase tracking-wider">
              <th className="p-4 font-bold border-b border-[#8b4513]/20">Statut</th>
              <th className="p-4 font-bold border-b border-[#8b4513]/20">Défi du Mois</th>
              <th className="p-4 font-bold border-b border-[#8b4513]/20">Univers Cible</th>
              <th className="p-4 font-bold border-b border-[#8b4513]/20">Date de fin</th>
              <th className="p-4 font-bold border-b border-[#8b4513]/20 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {concours.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">Aucun concours créé.</td>
              </tr>
            ) : (
              concours.map(c => {
                const uni = UNIVERSES.find(u => u.id === c.universeId) || UNIVERSES[0];
                return (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <button 
                        onClick={() => toggleStatus(c.id)}
                        className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border transition-colors ${
                          c.isActive 
                            ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200' 
                            : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'
                        }`}
                      >
                        {c.isActive ? 'Publié' : 'Brouillon'}
                      </button>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-[#4a2e1b] flex items-center gap-2">
                        {c.isActive && <Flame className="w-4 h-4 text-orange-500" />}
                        {c.title}
                      </div>
                      <div className="text-xs text-gray-500 line-clamp-1">{c.description}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${uni.color}`}>
                        {uni.label}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-bold text-gray-700">
                      {c.deadline ? new Date(c.deadline).toLocaleDateString() : 'Non définie'}
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => handleEdit(c)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Éditer
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}
