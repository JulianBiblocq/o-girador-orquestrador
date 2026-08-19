import React from 'react';
import { Search, Edit3, Trash2 } from 'lucide-react';
import { calculateSubscriptionStatus, getAccessRights } from '../../utils/subscriptionRights';

export default function AssociationTable({ 
  associations, 
  searchTerm, 
  onSearchChange, 
  onEdit, 
  onDelete 
}) {
  return (
    <div className="bg-white/90 xilo-border rounded-xl p-6 space-y-6 shadow-xl">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, ville ou email..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-[#fdf6e7] text-xs text-[#2c1d11] rounded border border-[#8b4513]"
          />
        </div>
        <div className="text-xs text-gray-500">
          Affichage de {associations.length} structure(s)
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#4a2e1b] text-[#fdf6e7] font-cordel uppercase text-[11px]">
              <th className="p-3">Structure / Bloco</th>
              <th className="p-3">Contact & Ville</th>
              <th className="p-3">Forfait</th>
              <th className="p-3">Expiration</th>
              <th className="p-3">Statut Soft Lock</th>
              <th className="p-3 text-center">Accès Apps</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {associations.map((assoc) => {
              const statusInfo = calculateSubscriptionStatus(assoc.endDate, assoc.planType);
              const rights = getAccessRights(assoc);

              return (
                <tr key={assoc.id} className="hover:bg-[#fdf6e7]/80 transition-colors">
                  <td className="p-3">
                    <div className="font-bold text-[#4a2e1b] text-sm font-cordel">{assoc.name || assoc.nom || 'Sans nom'}</div>
                    <div className="text-[10px] text-gray-500">{assoc.membersCount || 0} membres</div>
                  </td>

                  <td className="p-3">
                    <div className="font-semibold text-gray-800">{assoc.contactName || 'Non spécifié'}</div>
                    <div className="text-[10px] text-[#8b4513] font-mono">{assoc.contactEmail}</div>
                    <div className="text-[10px] text-gray-500">{assoc.city || 'Non renseignée'}</div>
                  </td>

                  <td className="p-3">
                    <span className="font-bold uppercase text-[10px] bg-gray-100 px-2 py-0.5 rounded border border-gray-300">
                      {assoc.planType || 'annuel'}
                    </span>
                  </td>

                  <td className="p-3 font-mono font-semibold">
                    {assoc.endDate || 'N/A'}
                  </td>

                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold inline-block ${statusInfo.badgeClass}`}>
                      {statusInfo.label}
                    </span>
                    {rights.isReadOnlyManager && (
                      <span className="block text-[9px] text-red-700 font-bold mt-0.5">
                        🔒 Lecture seule Manager
                      </span>
                    )}
                  </td>

                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${assoc.appAccess?.sequenceur ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-400'}`}>SEQ</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${assoc.appAccess?.manager ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-400'}`}>ORG</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${assoc.appAccess?.dancador ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-400'}`}>DAN</span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${assoc.appAccess?.vitrine ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-400'}`}>MOS</span>
                    </div>
                  </td>

                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => onEdit(assoc)} className="p-1.5 bg-[#f4e8cf] hover:bg-[#ebd8b3] text-[#4a2e1b] rounded border border-[#8b4513]/40 cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => onDelete(assoc.id)} className="p-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded border border-red-300 cursor-pointer">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
