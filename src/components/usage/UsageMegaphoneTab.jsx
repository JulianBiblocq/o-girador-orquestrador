import React from 'react';

function formatAnnouncementDate(ms) {
  if (!ms || ms <= 0) return 'Date non renseignée';
  try {
    return new Date(ms).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return 'Date non renseignée';
  }
}

export default function UsageMegaphoneTab({ usageData }) {
  const announcements = usageData?.recentAnnouncements || [];
  const avgReadRate = Number(usageData?.megaphoneAvgReadRate || 0);
  const totalMembers = Number(usageData?.totalActiveMembers || 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-indigo-50 border border-indigo-200 rounded-xl p-3 text-xs">
        <div className="font-bold text-indigo-950">
          📢 Portée sur les 10 dernières annonces : <span className="font-black text-indigo-800">{avgReadRate}% de taux de lecture moyen</span>
        </div>
        <div className="text-[11px] font-semibold text-indigo-700">
          Base : {totalMembers} membre(s) actif(s)
        </div>
      </div>

      <div className="bg-white border border-[#d4b895] rounded-xl overflow-hidden">
        {announcements.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400 italic">
            Aucune annonce Mégaphone publiée pour cette association.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
            {announcements.map((ann, idx) => (
              <div key={ann.id || idx} className="p-3 hover:bg-[#fdf6e7]/60 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="font-bold text-[#4a2e1b] truncate">{ann.title}</div>
                  <div className="text-[10px] text-gray-500 mt-0.5 flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-[#8b4513]">✍️ {ann.author}</span>
                    <span>•</span>
                    <span>📅 {formatAnnouncementDate(ann.createdAtMs)}</span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-0.5">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold text-[11px]">
                    ✓✓ Lu par {ann.readersCount} membre{ann.readersCount > 1 ? 's' : ''}
                  </span>
                  {totalMembers > 0 && (
                    <span className="text-[10px] font-semibold text-gray-500">
                      {ann.readRate}% de la troupe
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

