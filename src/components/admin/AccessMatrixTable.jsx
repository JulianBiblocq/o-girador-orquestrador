import React from 'react';
import { ToggleRight, ToggleLeft } from 'lucide-react';

export default function AccessMatrixTable({ associations, onToggleApp, onToggleUniverse }) {
  return (
    <div className="bg-white/90 xilo-border rounded-xl p-6 space-y-6 shadow-xl">
      <div className="space-y-1">
        <h2 className="text-xl font-bold font-cordel text-[#4a2e1b]">
          Matrice d'Accès Directe (Interrupteurs)
        </h2>
        <p className="text-xs text-gray-600">
          Activez ou désactivez les cartes d'applications et les univers culturels pour chaque structure en un clic.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#8b4513] text-[#fdf6e7] font-cordel uppercase text-[11px]">
              <th className="p-3">Structure</th>
              <th className="p-3 text-center bg-[#6e370f]">🥁 Séquenceur</th>
              <th className="p-3 text-center bg-[#6e370f]">📋 Manager</th>
              <th className="p-3 text-center bg-[#6e370f]">🌐 Vitrine</th>
              <th className="p-3 text-center bg-[#6e370f]">👣 Dançador</th>
              <th className="p-3 text-center border-l-2 border-[#fdf6e7]">Maracatu</th>
              <th className="p-3 text-center">Capoeira</th>
              <th className="p-3 text-center">Samba</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {associations.map((assoc) => (
              <tr key={assoc.id} className="hover:bg-[#fdf6e7]/80 transition-colors">
                <td className="p-3">
                  <div className="font-bold text-[#4a2e1b]">{assoc.name || assoc.nom || 'Sans nom'}</div>
                  <div className="text-[10px] text-gray-500">{assoc.city || 'Non renseignée'}</div>
                </td>

                <td className="p-3 text-center bg-amber-50/50">
                  <button onClick={() => onToggleApp(assoc, 'sequenceur')} className="cursor-pointer inline-block">
                    {assoc.appAccess?.sequenceur ? <ToggleRight className="w-7 h-7 text-green-700" /> : <ToggleLeft className="w-7 h-7 text-gray-400" />}
                  </button>
                </td>

                <td className="p-3 text-center bg-amber-50/50">
                  <button onClick={() => onToggleApp(assoc, 'manager')} className="cursor-pointer inline-block">
                    {assoc.appAccess?.manager ? <ToggleRight className="w-7 h-7 text-green-700" /> : <ToggleLeft className="w-7 h-7 text-gray-400" />}
                  </button>
                </td>

                <td className="p-3 text-center bg-amber-50/50">
                  <button onClick={() => onToggleApp(assoc, 'vitrine')} className="cursor-pointer inline-block">
                    {assoc.appAccess?.vitrine ? <ToggleRight className="w-7 h-7 text-green-700" /> : <ToggleLeft className="w-7 h-7 text-gray-400" />}
                  </button>
                </td>

                <td className="p-3 text-center bg-amber-50/50">
                  <button onClick={() => onToggleApp(assoc, 'dancador')} className="cursor-pointer inline-block">
                    {assoc.appAccess?.dancador ? <ToggleRight className="w-7 h-7 text-green-700" /> : <ToggleLeft className="w-7 h-7 text-gray-400" />}
                  </button>
                </td>

                <td className="p-3 text-center border-l-2 border-gray-200">
                  <button onClick={() => onToggleUniverse(assoc, 'maracatu')} className="cursor-pointer inline-block">
                    {assoc.universeAccess?.maracatu ? <ToggleRight className="w-7 h-7 text-emerald-700" /> : <ToggleLeft className="w-7 h-7 text-gray-400" />}
                  </button>
                </td>

                <td className="p-3 text-center">
                  <button onClick={() => onToggleUniverse(assoc, 'capoeira')} className="cursor-pointer inline-block">
                    {assoc.universeAccess?.capoeira ? <ToggleRight className="w-7 h-7 text-emerald-700" /> : <ToggleLeft className="w-7 h-7 text-gray-400" />}
                  </button>
                </td>

                <td className="p-3 text-center">
                  <button onClick={() => onToggleUniverse(assoc, 'samba')} className="cursor-pointer inline-block">
                    {assoc.universeAccess?.samba ? <ToggleRight className="w-7 h-7 text-emerald-700" /> : <ToggleLeft className="w-7 h-7 text-gray-400" />}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
