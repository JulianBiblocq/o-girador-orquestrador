import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, PackageOpen } from 'lucide-react';
import packsData from '../../data/packs.json';

export default function PacksManagerTab({ associations, onTogglePack }) {
  const [searchTerm, setSearchTerm] = useState('');

  const validAssociations = (associations || []).filter(Boolean);
  const filteredAssociations = validAssociations.filter(a => {
    const term = String(searchTerm || '').toLowerCase().trim();
    if (!term) return true;
    return (
      String(a?.name || a?.nom || '').toLowerCase().includes(term) ||
      String(a?.city || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="bg-white rounded-lg shadow border border-[#4a2e1b]/20 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-[#fdf6e7] flex justify-between items-center">
        <h3 className="font-bold text-[#8b4513] flex items-center gap-2">
          <PackageOpen className="w-5 h-5" />
          Gestion des Packs / Add-ons
        </h3>
        <input
          type="text"
          placeholder="Rechercher une association..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513]"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-[#8b4513] text-[#fdf6e7]">
            <tr>
              <th className="p-3">Association</th>
              {packsData.packs.map(pack => (
                <th key={pack.id} className="p-3 text-center border-l border-white/20">
                  {pack.name} <br/>
                  <span className="text-[10px] text-[#f4e8cf] capitalize">({pack.targetApp})</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredAssociations.map((assoc, idx) => (
              <tr key={assoc.id || idx} className="border-b border-gray-100 hover:bg-[#fdf6e7]/50">
                <td className="p-3 font-medium text-[#4a2e1b]">
                  {assoc.name || assoc.nom}
                  <div className="text-[10px] text-gray-500 font-normal">{assoc.id}</div>
                </td>
                {packsData.packs.map(pack => {
                  const hasPack = (assoc.unlockedPacks || []).includes(pack.id);
                  return (
                    <td key={pack.id} className="p-3 text-center border-l border-gray-100">
                      <button 
                        onClick={() => onTogglePack(assoc, pack.id)} 
                        className="cursor-pointer inline-block hover:scale-110 transition-transform"
                      >
                        {hasPack ? (
                          <ToggleRight className="w-7 h-7 text-emerald-600" />
                        ) : (
                          <ToggleLeft className="w-7 h-7 text-gray-400" />
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
            {filteredAssociations.length === 0 && (
              <tr>
                <td colSpan={packsData.packs.length + 1} className="p-8 text-center text-gray-500">
                  Aucune association trouvée.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
