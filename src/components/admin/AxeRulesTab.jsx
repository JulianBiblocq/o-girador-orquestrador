import React, { useState, useEffect } from 'react';
import { getAxeRules, updateAxeRules } from '../../services/gamificationService';
import { Save, Loader2, Award, Zap, Edit, ShieldCheck, CreditCard } from 'lucide-react';

export default function AxeRulesTab() {
  const [rules, setRules] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const actionLabels = {
    account_creation: { label: "Création de compte (Association)", icon: <ShieldCheck className="w-5 h-5 text-green-500" /> },
    complete_profile: { label: "Compléter son profil (Equipe / Lieu)", icon: <Edit className="w-5 h-5 text-blue-500" /> },
    submit_review: { label: "Laisser un avis (Plateforme)", icon: <Award className="w-5 h-5 text-yellow-500" /> },
    create_sequence: { label: "Créer un rythme (Séquenceur)", icon: <Zap className="w-5 h-5 text-purple-500" /> },
    create_choreography: { label: "Créer une chorégraphie (Dançador)", icon: <Zap className="w-5 h-5 text-pink-500" /> },
    purchase_pack: { label: "Achat d'un Add-on", icon: <CreditCard className="w-5 h-5 text-emerald-500" /> },
    upgrade_plan: { label: "Upgrade de forfait (ex: vers Intégrale)", icon: <CreditCard className="w-5 h-5 text-emerald-600" /> }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    setLoading(true);
    const data = await getAxeRules();
    // Merge missing keys just in case
    const merged = { ...data };
    Object.keys(actionLabels).forEach(key => {
      if (merged[key] === undefined) merged[key] = 0;
    });
    setRules(merged);
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Ensure all values are numbers
      const numericRules = {};
      Object.keys(rules).forEach(key => {
        numericRules[key] = Number(rules[key]) || 0;
      });
      await updateAxeRules(numericRules);
      setToastMessage("Règles sauvegardées avec succès !");
      setTimeout(() => setToastMessage(''), 3000);
    } catch (error) {
      console.error(error);
      setToastMessage("Erreur lors de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#8b4513]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black font-cordel text-[#4a2e1b] flex items-center gap-2">
            <Award className="w-6 h-6 text-[#d2691e]" />
            Règles d'attribution des Points d'Axé
          </h2>
          <p className="text-sm text-[#8b4513]">Définissez combien de points gagnent les utilisateurs pour chaque action.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-[#8b4513] hover:bg-[#6b3410] text-[#fdf6e7] px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 transition-colors shadow-md disabled:opacity-70 disabled:cursor-wait"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Enregistrer les règles
        </button>
      </div>

      {toastMessage && (
        <div className="bg-green-100 border border-green-200 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{toastMessage}</span>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-[#8b4513]/20 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f4e8cf] text-[#8b4513] text-xs uppercase tracking-wider">
              <th className="p-4 font-bold border-b border-[#8b4513]/20">Action de l'utilisateur</th>
              <th className="p-4 font-bold border-b border-[#8b4513]/20 w-48 text-right">Points d'Axé</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {Object.keys(actionLabels).map(key => (
              <tr key={key} className="hover:bg-gray-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg border border-gray-100">
                      {actionLabels[key].icon}
                    </div>
                    <div>
                      <div className="font-bold text-[#4a2e1b]">{actionLabels[key].label}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{key}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-sm font-bold text-[#d2691e]">+</span>
                    <input 
                      type="number" 
                      min="0"
                      value={rules[key] ?? 0}
                      onChange={(e) => setRules({ ...rules, [key]: e.target.value })}
                      className="w-24 p-2 text-right bg-white border border-[#4a2e1b]/20 rounded-lg text-sm font-bold text-[#4a2e1b] focus:outline-none focus:ring-2 focus:ring-[#8b4513]"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
