import React from 'react';

export function getPushCoverageBadgeStyle(pushReachableCount, totalActiveMembers) {
  const total = Number(totalActiveMembers || 0);
  const reachable = Number(pushReachableCount || 0);
  const pct = total > 0 ? Math.round((reachable / total) * 100) : 0;
  if (pct >= 75) {
    return { pct, className: 'bg-emerald-100 text-emerald-900 border-emerald-400' };
  }
  if (pct >= 40) {
    return { pct, className: 'bg-amber-100 text-amber-900 border-amber-400' };
  }
  return { pct, className: 'bg-red-100 text-red-900 border-red-400' };
}

export default function TenantUsageSummaryBadge({ association, onOpenDetail }) {
  const stats = association?.usageStats || null;

  if (!stats) {
    return (
      <div className="flex flex-col items-start gap-1.5 min-w-[190px]">
        <span className="text-[10px] italic text-gray-400 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
          Usage non synchronisé
        </span>
        <button
          type="button"
          onClick={() => onOpenDetail?.(association)}
          className="px-2.5 py-1 bg-[#4a2e1b] hover:bg-[#8b4513] text-[#fdf6e7] rounded text-[10px] font-bold transition-colors cursor-pointer shadow-sm"
        >
          📊 Analyse détaillée
        </button>
      </div>
    );
  }

  const totalMembers = Number(stats.totalActiveMembers || 0);
  const pushCount = Number(stats.pushReachableCount || 0);
  const active7d = Number(stats.activeMembers7d || 0);
  const active30d = Number(stats.activeMembers30d || 0);
  const varalViews = Number(stats.varalTotalViews || 0);
  const zeroViews = Number(stats.varalZeroViewDocsCount || 0);
  const megaphoneRate = stats.megaphoneAvgReadRate != null ? Number(stats.megaphoneAvgReadRate) : null;
  const pushBadge = getPushCoverageBadgeStyle(pushCount, totalMembers);

  return (
    <div className="flex flex-col gap-1.5 min-w-[215px] text-[10px]">
      <div className="flex flex-wrap items-center gap-1">
        <span
          className={`px-1.5 py-0.5 rounded border font-bold inline-flex items-center gap-1 ${pushBadge.className}`}
          title={`Couverture Notifications Push : ${pushBadge.pct}%`}
        >
          🔔 Push : {pushCount}/{totalMembers} ({pushBadge.pct}%)
        </span>
        <span
          className="px-1.5 py-0.5 rounded border border-[#d4b895] bg-[#fdf6e7] text-[#4a2e1b] font-semibold inline-flex items-center gap-1"
          title="Membres actifs sur 7 jours et 30 jours"
        >
          👥 {active7d} (7j) · {active30d} (30j) / {totalMembers}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-1">
        <span className="px-1.5 py-0.5 rounded border border-gray-200 bg-white text-gray-700 font-semibold">
          🪢 Varal : {varalViews} vue{varalViews > 1 ? 's' : ''}
        </span>
        {zeroViews > 0 && (
          <span className="px-1.5 py-0.5 rounded border border-amber-300 bg-amber-50 text-amber-900 font-bold">
            ⚠️ {zeroViews} doc(s) à 0 vue
          </span>
        )}
        {megaphoneRate !== null && (
          <span className="px-1.5 py-0.5 rounded border border-indigo-200 bg-indigo-50 text-indigo-900 font-semibold">
            📢 {megaphoneRate}%
          </span>
        )}
      </div>

      <div>
        <button
          type="button"
          onClick={() => onOpenDetail?.(association)}
          className="px-2.5 py-1 bg-[#4a2e1b] hover:bg-[#8b4513] text-[#fdf6e7] rounded text-[10px] font-bold transition-colors cursor-pointer shadow-sm"
        >
          📊 Analyse détaillée
        </button>
      </div>
    </div>
  );
}

