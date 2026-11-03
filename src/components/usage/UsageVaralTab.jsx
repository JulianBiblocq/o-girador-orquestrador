import React from 'react';

function formatDocDate(ms) {
  if (!ms || ms <= 0) return 'Date inconnue';
  try {
    return new Date(ms).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return 'Date inconnue';
  }
}

export default function UsageVaralTab({ usageData }) {
  const topDocuments = usageData?.topDocuments || [];
  const zeroViewDocuments = usageData?.zeroViewDocuments || [];
  const totalViews = Number(usageData?.varalTotalViews || 0);
  const zeroCount = Number(usageData?.varalZeroViewDocsCount ?? zeroViewDocuments.length);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[#fdf6e7] border border-[#d4b895] rounded-xl p-3 text-xs">
        <div className="font-bold text-[#4a2e1b]">
          🪢 Total consultations du Varal : <span className="text-[#8b4513] font-black">{totalViews} vue(s)</span>
        </div>
        <div className={`font-bold ${zeroCount > 0 ? 'text-amber-800' : 'text-emerald-800'}`}>
          {zeroCount > 0 ? `⚠️ ${zeroCount} contenu(s) jamais ouvert(s) (0 vue)` : '✅ Tous les documents ont été consultés au moins une fois'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Colonne A : Top des contenus les plus regardés */}
        <div className="bg-white border border-[#d4b895] rounded-xl p-3.5 flex flex-col">
          <h4 className="text-xs font-extrabold uppercase text-[#4a2e1b] mb-3 flex items-center justify-between">
            <span>🏆 Top des contenus les plus regardés</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#f4e8cf] text-[#8b4513]">Top 10</span>
          </h4>
          {topDocuments.length === 0 ? (
            <div className="text-xs text-gray-400 italic py-6 text-center">Aucun document enregistré dans le Varal.</div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {topDocuments.map((docItem, idx) => (
                <div
                  key={docItem.id || idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-[#fdf6e7]/60 border border-[#e8d5b5] text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-[#4a2e1b] truncate">
                      {idx + 1}. {docItem.title}
                    </div>
                    <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-[#f4e8cf] text-[#8b4513] font-semibold">
                      {docItem.category}
                    </span>
                  </div>
                  <span className="shrink-0 px-2 py-1 rounded bg-emerald-100 text-emerald-900 border border-emerald-300 font-black text-[11px]">
                    👁️ {docItem.viewsCount} vue{docItem.viewsCount > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Colonne B : Contenus jamais ouverts (0 vue) */}
        <div className="bg-white border border-amber-300 rounded-xl p-3.5 flex flex-col">
          <h4 className="text-xs font-extrabold uppercase text-amber-900 mb-3 flex items-center justify-between">
            <span>⚠️ Contenus jamais ouverts (0 vue)</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">{zeroViewDocuments.length}</span>
          </h4>
          {zeroViewDocuments.length === 0 ? (
            <div className="text-xs text-emerald-700 font-medium py-6 text-center">
              🎉 Aucun angle mort : tous les contenus du Varal ont été ouverts !
            </div>
          ) : (
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {zeroViewDocuments.map((docItem, idx) => (
                <div
                  key={docItem.id || idx}
                  className="flex items-center justify-between gap-2 p-2 rounded-lg bg-amber-50/70 border border-amber-200 text-xs"
                >
                  <div className="min-w-0">
                    <div className="font-bold text-[#4a2e1b] truncate">{docItem.title}</div>
                    <span className="inline-block mt-0.5 text-[10px] px-1.5 py-0.5 rounded bg-white text-amber-900 border border-amber-200 font-semibold">
                      {docItem.category}
                    </span>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[10px] font-bold text-red-700">0 vue</div>
                    <div className="text-[10px] text-gray-500">Déposé : {formatDocDate(docItem.createdAtMs)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

