import React, { useState, useEffect } from 'react';
import { getSystemErrors, updateErrorStatus } from '../../services/telemetryService';
import { useLanguage } from '../../hooks/useLanguage';

const BugDetailModal = ({ bug, onClose }) => {
  if (!bug) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#fcf8f2] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#4a2e1b]/20">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <h3 className="text-xl font-bold text-[#4a2e1b]">Détail du Bug</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold">✕</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><span className="font-bold text-gray-700">App:</span> {bug.appId} v{bug.appVersion}</div>
            <div><span className="font-bold text-gray-700">Groupe:</span> {bug.groupId}</div>
            <div><span className="font-bold text-gray-700">Type:</span> {bug.type}</div>
            <div><span className="font-bold text-gray-700">Route:</span> {bug.route}</div>
            <div className="col-span-2"><span className="font-bold text-gray-700">User Agent:</span> {bug.userAgent}</div>
            <div className="col-span-2"><span className="font-bold text-gray-700">Date de création:</span> {bug.timestamp?.toLocaleString() || bug.createdAt?.toLocaleString()}</div>
            {bug.occurrencesCount && (
              <>
                <div className="col-span-2"><span className="font-bold text-gray-700">Occurrences:</span> <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">{bug.occurrencesCount}</span></div>
                <div className="col-span-2"><span className="font-bold text-gray-700">Dernière vue:</span> {bug.lastSeenAt?.toDate?.().toLocaleString() || bug.lastSeenAt?.toLocaleString()}</div>
              </>
            )}
          </div>
          
          <div>
            <span className="font-bold text-red-600 block mb-2">Message d'Erreur:</span>
            <div className="bg-red-50 p-3 rounded border border-red-200 text-red-800 font-mono text-sm break-words">
              {bug.errorMessage}
            </div>
          </div>

          {bug.stackTrace && (
            <div>
              <span className="font-bold text-gray-700 block mb-2">Stacktrace complète:</span>
              <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs font-mono leading-relaxed max-h-64">
                {bug.stackTrace}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function BugTrackerTab() {
  const { t } = useLanguage();
  const [bugs, setBugs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBug, setSelectedBug] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBugs = async () => {
    setLoading(true);
    const data = await getSystemErrors(statusFilter ? { status: statusFilter } : {});
    setBugs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchBugs();
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    await updateErrorStatus(id, newStatus);
    setBugs(bugs.map(b => b.id === id ? { ...b, status: newStatus } : b));
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#fdf6e7] p-4 rounded-lg shadow border border-[#4a2e1b]/10">
        <h2 className="text-xl font-bold text-[#4a2e1b]">🐞 Rapport de Bugs & Stabilité</h2>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[#4a2e1b]/20 bg-white shadow-sm focus:ring-[#8b4513] focus:border-[#8b4513]"
        >
          <option value="">Tous les statuts</option>
          <option value="new">Nouveaux</option>
          <option value="investigating">En cours</option>
          <option value="resolved">Résolus</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-[#4a2e1b]/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f4e8cf]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">Date (Création)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">Occurrences</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">App / Groupe</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">Erreur</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Chargement...</td></tr>
              ) : bugs.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Aucun bug trouvé.</td></tr>
              ) : bugs.map((bug) => (
                <tr key={bug.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bug.timestamp?.toLocaleString() || bug.createdAt?.toLocaleString()}
                    {bug.lastSeenAt && <div className="text-xs text-gray-400 mt-1">Dernier: {bug.lastSeenAt?.toDate?.().toLocaleString() || bug.lastSeenAt?.toLocaleString()}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bug.occurrencesCount > 1 ? (
                      <span className="bg-red-100 text-red-800 font-bold px-2.5 py-1 rounded-full text-xs">x{bug.occurrencesCount}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 capitalize">{bug.appId}</div>
                    <div className="text-xs text-gray-500">{bug.groupId}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 font-medium truncate max-w-xs">{bug.type}</div>
                    <div className="text-xs text-red-600 truncate max-w-xs">{bug.errorMessage}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bug.status)}`}>
                      {bug.status || 'new'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => setSelectedBug(bug)} className="text-[#8b4513] hover:text-[#4a2e1b]">Détails</button>
                    {bug.status !== 'resolved' && (
                      <button onClick={() => handleStatusChange(bug.id, 'resolved')} className="text-green-600 hover:text-green-900">✔ Résoudre</button>
                    )}
                    {bug.status === 'new' && (
                      <button onClick={() => handleStatusChange(bug.id, 'investigating')} className="text-yellow-600 hover:text-yellow-900">👀 En cours</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <BugDetailModal bug={selectedBug} onClose={() => setSelectedBug(null)} />
    </div>
  );
}
