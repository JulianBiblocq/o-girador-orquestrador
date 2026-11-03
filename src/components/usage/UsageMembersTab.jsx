import React, { useState } from 'react';

export function formatRelativeActivity(lastActiveMs, nowMs = Date.now()) {
  if (!lastActiveMs || lastActiveMs <= 0) return 'Jamais';
  const diffMs = Math.max(0, nowMs - lastActiveMs);
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin}min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  const diffDays = Math.floor(diffHours / 24);
  return `Il y a ${diffDays}j`;
}

export default function UsageMembersTab({ usageData }) {
  const [filter, setFilter] = useState('all'); // 'all' | 'no_push' | 'inactive' | 'reachable'
  const members = usageData?.members || [];
  const total = Number(usageData?.totalActiveMembers || members.length || 0);
  const active7d = Number(usageData?.activeMembers7d || 0);
  const active30d = Number(usageData?.activeMembers30d || 0);
  const inactiveCount = Number(usageData?.inactiveMembersCount ?? Math.max(0, total - active30d));

  const pct = (val) => (total > 0 ? Math.min(100, Math.round((val / total) * 100)) : 0);

  const filteredMembers = members.filter((m) => {
    if (filter === 'no_push') return !m.isPushReachable;
    if (filter === 'inactive') return m.activityBucket === 'inactive';
    if (filter === 'reachable') return m.isPushReachable;
    return true;
  });

  const filters = [
    { id: 'all', label: `Tous (${members.length})` },
    { id: 'no_push', label: `🔕 Sans Notifications Push (${members.filter((m) => !m.isPushReachable).length})` },
    { id: 'inactive', label: `💤 Inactifs > 30j (${inactiveCount})` },
    { id: 'reachable', label: `🔔 Joignables (${members.filter((m) => m.isPushReachable).length})` }
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
          <div className="text-[11px] font-bold text-emerald-900">Actifs cette semaine (7j)</div>
          <div className="text-xl font-black text-emerald-800 mt-0.5">{active7d} <span className="text-xs font-normal">/ {total} ({pct(active7d)}%)</span></div>
          <div className="w-full bg-emerald-200/60 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${pct(active7d)}%` }} />
          </div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="text-[11px] font-bold text-amber-900">Actifs ce mois (30j)</div>
          <div className="text-xl font-black text-amber-800 mt-0.5">{active30d} <span className="text-xs font-normal">/ {total} ({pct(active30d)}%)</span></div>
          <div className="w-full bg-amber-200/60 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-amber-600 h-full rounded-full" style={{ width: `${pct(active30d)}%` }} />
          </div>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-xl p-3">
          <div className="text-[11px] font-bold text-red-900">Inactifs / Jamais vus (&gt; 30j)</div>
          <div className="text-xl font-black text-red-800 mt-0.5">{inactiveCount} <span className="text-xs font-normal">/ {total} ({pct(inactiveCount)}%)</span></div>
          <div className="w-full bg-red-200/60 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-red-600 h-full rounded-full" style={{ width: `${pct(inactiveCount)}%` }} />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
              filter === f.id ? 'bg-[#8b4513] text-[#fdf6e7] shadow' : 'bg-[#f4e8cf] text-[#4a2e1b] hover:bg-[#e8d5b5]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="border border-[#d4b895] rounded-xl overflow-hidden bg-white max-h-80 overflow-y-auto">
        {filteredMembers.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-500 italic">Aucun membre ne correspond à ce filtre.</div>
        ) : (
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#4a2e1b] text-[#fdf6e7] text-[10px] uppercase">
              <tr>
                <th className="p-2.5">Membre</th>
                <th className="p-2.5">Instrument / Rôle</th>
                <th className="p-2.5">Dernière activité</th>
                <th className="p-2.5 text-right">Statut Push</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredMembers.map((m) => (
                <tr key={m.id} className="hover:bg-[#fdf6e7]/60">
                  <td className="p-2.5 font-bold text-[#4a2e1b]">
                    {m.displayName}
                    {m.email && <div className="text-[10px] font-normal text-gray-500">{m.email}</div>}
                  </td>
                  <td className="p-2.5 text-gray-700">
                    <span className="font-semibold">{m.instrumentPrincipal}</span>
                    <span className="ml-1.5 px-1.5 py-0.5 text-[9px] uppercase rounded bg-[#f4e8cf] text-[#8b4513] font-bold">{m.role}</span>
                  </td>
                  <td className="p-2.5 font-medium text-gray-700">{formatRelativeActivity(m.lastActiveMs)}</td>
                  <td className="p-2.5 text-right">
                    {m.isPushReachable ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px]">
                        🔔 {m.devicesCount} appareil(s)
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 font-bold text-[10px]">
                        🔕 Aucun appareil
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

