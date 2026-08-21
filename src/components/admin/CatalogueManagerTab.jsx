import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, Plus, Save, X, UploadCloud, FileJson, Image as ImageIcon } from 'lucide-react';
import { fetchPacks, savePack, deletePack } from '../../services/packsService';

const APP_TARGETS = [
  { id: 'sequenceur', label: 'Sequenciador (Audio)' },
  { id: 'manager', label: 'Organizador' },
  { id: 'dancador', label: 'Dançador (Chorégraphie)' },
  { id: 'vitrine', label: 'Mostrador (Vitrine)' }
];

const UNIVERSES = [
  { id: 'maracatu', label: 'Maracatu' },
  { id: 'samba', label: 'Samba' },
  { id: 'capoeira', label: 'Capoeira' },
  { id: 'universal', label: 'Universel' }
];

export default function CatalogueManagerTab() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingPack, setEditingPack] = useState(null);

  // Charger les packs
  const loadPacks = async () => {
    setLoading(true);
    const data = await fetchPacks();
    // Tri par application
    const sorted = [...data].sort((a, b) => a.targetApp.localeCompare(b.targetApp));
    setPacks(sorted);
    setLoading(false);
  };

  useEffect(() => {
    loadPacks();
  }, []);

  const handleEdit = (pack) => {
    setEditingPack({ ...pack, features: pack.features ? [...pack.features] : [] });
  };

  const handleAddNew = () => {
    setEditingPack({
      id: '',
      name: '',
      description: '',
      price: 0,
      targetApp: 'sequenceur',
      universeId: 'universal',
      isUniversal: true,
      features: [''],
      jsonData: null,
      imageUrl: ''
    });
  };

  const handleSave = async () => {
    if (!editingPack.name) return alert("Le nom est requis");
    
    // Nettoyer les features vides
    const cleanFeatures = editingPack.features.filter(f => f.trim() !== '');
    
    const packToSave = {
      ...editingPack,
      features: cleanFeatures
    };
    
    await savePack(packToSave);
    await loadPacks();
    setEditingPack(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce pack du catalogue ?")) {
      await deletePack(id);
      await loadPacks();
    }
  };

  const handleFeatureChange = (index, value) => {
    const newFeatures = [...editingPack.features];
    newFeatures[index] = value;
    setEditingPack({ ...editingPack, features: newFeatures });
  };

  const addFeatureRow = () => {
    setEditingPack({ ...editingPack, features: [...editingPack.features, ''] });
  };

  const removeFeatureRow = (index) => {
    const newFeatures = editingPack.features.filter((_, i) => i !== index);
    setEditingPack({ ...editingPack, features: newFeatures });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const jsonContent = JSON.parse(event.target.result);
        setEditingPack({
          ...editingPack,
          jsonData: JSON.stringify(jsonContent) // On le stocke en string pour éviter les problèmes de structure complexe
        });
        alert("Fichier JSON chargé avec succès !");
      } catch (error) {
        alert("Erreur: Le fichier n'est pas un JSON valide.");
      }
    };
    reader.readAsText(file);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 800000) {
      alert("L'image est trop lourde. Veuillez choisir une image de moins de 800 Ko.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setEditingPack({
        ...editingPack,
        imageUrl: event.target.result
      });
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div className="p-8 text-center text-[#8b4513]">Chargement du catalogue...</div>;
  }

  // --- VUE FORMULAIRE (ÉDITION) ---
  if (editingPack) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black font-cordel text-[#4a2e1b]">
            {editingPack.id ? "Modifier le Pack" : "Créer un nouveau Pack"}
          </h2>
          <button 
            onClick={() => setEditingPack(null)}
            className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-white rounded-xl shadow p-6 space-y-5 border border-[#8b4513]/20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <div className="space-y-1.5 lg:col-span-1">
              <label className="text-xs font-bold text-[#8b4513] uppercase">Nom du pack</label>
              <input 
                type="text" 
                value={editingPack.name}
                onChange={e => setEditingPack({...editingPack, name: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                placeholder="Ex: Pack Maracatu Nação"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8b4513] uppercase">Application Cible</label>
              <select 
                value={editingPack.targetApp}
                onChange={e => setEditingPack({...editingPack, targetApp: e.target.value})}
                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-semibold"
              >
                {APP_TARGETS.map(app => (
                  <option key={app.id} value={app.id}>{app.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#8b4513] uppercase">Univers Cible</label>
              <select 
                value={editingPack.universeId || 'universal'}
                onChange={e => {
                  const val = e.target.value;
                  setEditingPack({
                    ...editingPack, 
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
              value={editingPack.description}
              onChange={e => setEditingPack({...editingPack, description: e.target.value})}
              className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm"
              rows={3}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#8b4513] uppercase">Prix (€)</label>
            <input 
              type="number" 
              step="0.01"
              value={editingPack.price}
              onChange={e => setEditingPack({...editingPack, price: parseFloat(e.target.value) || 0})}
              className="w-full md:w-1/3 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold"
            />
          </div>

          {/* Points forts */}
          <div className="space-y-2 pt-4 border-t border-gray-100">
            <label className="text-xs font-bold text-[#8b4513] uppercase">Points forts (Features)</label>
            {editingPack.features.map((feat, index) => (
              <div key={index} className="flex items-center gap-2">
                <input 
                  type="text" 
                  value={feat}
                  onChange={e => handleFeatureChange(index, e.target.value)}
                  className="flex-1 p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm"
                  placeholder="Ex: 10 rythmes interactifs"
                />
                <button 
                  onClick={() => removeFeatureRow(index)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button 
              onClick={addFeatureRow}
              className="text-xs font-bold text-[#8b4513] flex items-center gap-1 hover:underline mt-2"
            >
              <Plus className="w-3 h-3" /> Ajouter un point fort
            </button>
          </div>

          {/* Upload JSON & Image */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
            {/* Upload JSON */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8b4513] uppercase flex items-center gap-2">
                <FileJson className="w-4 h-4" /> 
                Contenu du Pack (JSON)
              </label>
              <p className="text-[10px] text-gray-500 leading-tight">
                Uploadez le fichier de données qui sera débloqué à l'achat.
              </p>
              
              <div className="flex flex-col gap-2">
                <label className="cursor-pointer bg-[#f4e8cf] hover:bg-[#ebd8b3] text-[#4a2e1b] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-[#8b4513]/30 w-max">
                  <UploadCloud className="w-4 h-4" />
                  Sélectionner un .json
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                </label>
                
                {editingPack.jsonData && (
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded w-max">
                    <CheckCircle2 className="w-3 h-3" />
                    Fichier JSON attaché
                  </span>
                )}
              </div>
            </div>

            {/* Upload Image Aperçu */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#8b4513] uppercase flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> 
                Aperçu visuel (Image)
              </label>
              <p className="text-[10px] text-gray-500 leading-tight">
                Image illustrant le pack pour la page des détails.
              </p>
              
              <div className="flex gap-4 items-start">
                <div className="flex flex-col gap-2">
                  <label className="cursor-pointer bg-[#f4e8cf] hover:bg-[#ebd8b3] text-[#4a2e1b] px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors border border-[#8b4513]/30 w-max">
                    <UploadCloud className="w-4 h-4" />
                    Uploader une image
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                    />
                  </label>
                  
                  <input 
                    type="text" 
                    placeholder="Ou coller une URL d'image"
                    value={editingPack.imageUrl || ''}
                    onChange={e => setEditingPack({...editingPack, imageUrl: e.target.value})}
                    className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                
                {editingPack.imageUrl && (
                  <div className="w-16 h-16 rounded-lg border border-gray-200 overflow-hidden shrink-0">
                    <img src={editingPack.imageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-6 flex justify-end gap-3">
            <button 
              onClick={() => setEditingPack(null)}
              className="px-5 py-2.5 rounded-xl font-bold text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Annuler
            </button>
            <button 
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl font-bold bg-[#8b4513] text-[#fdf6e7] hover:bg-[#6b3410] flex items-center gap-2 transition-colors shadow-md"
            >
              <Save className="w-4 h-4" />
              Sauvegarder le pack
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- VUE LISTE (TABLEAU) ---
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black font-cordel text-[#4a2e1b]">Catalogue Boutique</h2>
          <p className="text-sm text-[#8b4513]">Gérez les packs additionnels proposés aux associations.</p>
        </div>
        <button 
          onClick={handleAddNew}
          className="bg-[#8b4513] hover:bg-[#6b3410] text-[#fdf6e7] px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-md"
        >
          <Plus className="w-4 h-4" /> Nouveau Pack
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#8b4513]/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f4e8cf] text-[#8b4513] text-xs uppercase tracking-wider">
                <th className="p-4 font-bold border-b border-[#8b4513]/20">Pack</th>
                <th className="p-4 font-bold border-b border-[#8b4513]/20">Cibles</th>
                <th className="p-4 font-bold border-b border-[#8b4513]/20">Prix</th>
                <th className="p-4 font-bold border-b border-[#8b4513]/20">Contenu</th>
                <th className="p-4 font-bold border-b border-[#8b4513]/20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {packs.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500">Aucun pack dans le catalogue.</td>
                </tr>
              ) : (
                packs.map(pack => (
                  <tr key={pack.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-[#4a2e1b]">{pack.name}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{pack.description}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-1">
                        <span className="text-[10px] uppercase font-bold px-2 py-1 rounded bg-[#f4e8cf] text-[#8b4513]">
                          {pack.targetApp}
                        </span>
                        <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded ${pack.isUniversal || pack.universeId === 'universal' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600'}`}>
                          {pack.isUniversal ? 'Universel' : (pack.universeId || 'N/A')}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-emerald-700">
                      {pack.price} €
                    </td>
                    <td className="p-4">
                      {pack.jsonData ? (
                        <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <FileJson className="w-3 h-3" /> Inclus
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 italic">Vide</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleEdit(pack)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                          title="Modifier"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(pack.id)}
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
