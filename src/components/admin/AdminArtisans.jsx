import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Save, X, Tag } from 'lucide-react';
import artisansData from '../../data/artisans.json';

const UNIVERSES = [
  { id: 'maracatu', label: 'Maracatu' },
  { id: 'samba', label: 'Samba' },
  { id: 'capoeira', label: 'Capoeira' },
  { id: 'universal', label: 'Universel (Tous)' }
];

export default function AdminArtisans() {
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingArtisan, setEditingArtisan] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Mock loading
    setTimeout(() => {
      setArtisans(artisansData.artisans || []);
      setLoading(false);
    }, 400);
  }, []);

  const handleEdit = (artisan) => {
    setEditingArtisan({ ...artisan });
  };

  const handleAddNew = () => {
    setEditingArtisan({
      id: '',
      name: '',
      description: '',
      universeId: 'maracatu',
      isUniversal: false,
      promoCode: '',
      discount: '',
      website: '',
      tags: []
    });
  };

  const handleSave = () => {
    setSaving(true);
    // Mock Save
    setTimeout(() => {
      if (editingArtisan.id) {
        setArtisans(artisans.map(a => a.id === editingArtisan.id ? editingArtisan : a));
      } else {
        const newArtisan = {
          ...editingArtisan,
          id: `art-${Date.now()}`
        };
        setArtisans([...artisans, newArtisan]);
      }
      setEditingArtisan(null);
      setSaving(false);
      alert("Artisan sauvegardé avec succès ! (Simulation)");
    }, 600);
  };

  const handleDelete = (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce partenaire ?")) {
      setArtisans(artisans.filter(a => a.id !== id));
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-[#8b4513]">Chargement des artisans...</div>;
  }

  // --- VUE FORMULAIRE ---
  if (editingArtisan) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black font-cordel text-[#4a2e1b]">
            {editingArtisan.id ? "Modifier l'artisan" : "Ajouter un artisan"}
          </h2>
          <button 
            onClick={() => setEditingArtisan(null)}
            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-5 border border-[#8b4513]/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8b4513] uppercase">Nom du partenaire</label>
              <input 
                type="text" 
                value={editingArtisan.name}
                onChange={e => setEditingArtisan({...editingArtisan, name: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8b4513] uppercase">Univers</label>
              <select 
                value={editingArtisan.universeId}
                onChange={e => {
                  const val = e.target.value;
                  setEditingArtisan({
                    ...editingArtisan, 
                    universeId: val,
                    isUniversal: val === 'universal'
                  });
                }}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold"
              >
                {UNIVERSES.map(uni => (
                  <option key={uni.id} value={uni.id}>{uni.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#8b4513] uppercase">Description</label>
            <textarea 
              value={editingArtisan.description}
              onChange={e => setEditingArtisan({...editingArtisan, description: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8b4513] uppercase flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Code Promo
              </label>
              <input 
                type="text" 
                value={editingArtisan.promoCode}
                onChange={e => setEditingArtisan({...editingArtisan, promoCode: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-bold text-amber-700"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8b4513] uppercase">Remise affichée</label>
              <input 
                type="text" 
                value={editingArtisan.discount}
                onChange={e => setEditingArtisan({...editingArtisan, discount: e.target.value})}
                placeholder="Ex: -15% ou Frais de port offerts"
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#8b4513] uppercase">Site Web (URL)</label>
            <input 
              type="text" 
              value={editingArtisan.website}
              onChange={e => setEditingArtisan({...editingArtisan, website: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-blue-600"
            />
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button 
              onClick={() => setEditingArtisan(null)}
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
              {saving ? 'Enregistrement...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VUE LISTE ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black font-cordel text-[#4a2e1b]">Marché des Artisans</h2>
          <p className="text-sm text-[#8b4513]">Gérez les partenaires affichés dans le Terreiro.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-[#8b4513] hover:bg-[#6b3410] text-[#fdf6e7] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" /> Nouvel Artisan
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#8b4513]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4e8cf] text-[#8b4513] text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-[#8b4513]/20">Artisan</th>
                <th className="p-4 font-bold border-b border-[#8b4513]/20">Univers</th>
                <th className="p-4 font-bold border-b border-[#8b4513]/20">Avantage</th>
                <th className="p-4 font-bold border-b border-[#8b4513]/20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {artisans.length === 0 ? (
                <tr>
                  <td colSpan="4" className="p-8 text-center text-gray-500">Aucun artisan.</td>
                </tr>
              ) : (
                artisans.map(art => (
                  <tr key={art.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#4a2e1b]">{art.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{art.description}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded ${
                        art.isUniversal ? 'bg-purple-100 text-purple-700' : 'bg-[#f4e8cf] text-[#8b4513]'
                      }`}>
                        {art.isUniversal ? 'Universel' : art.universeId}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-amber-700">{art.discount}</div>
                      <div className="text-[10px] font-mono text-gray-500">{art.promoCode}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(art)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(art.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
