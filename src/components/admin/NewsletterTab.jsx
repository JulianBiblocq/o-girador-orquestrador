import React, { useState, useEffect } from 'react';
import { Mail, Download, Loader2, Users } from 'lucide-react';
import { getProspects } from '../../services/telemetryService';

export default function NewsletterTab() {
  const [prospects, setProspects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProspects = async () => {
      setLoading(true);
      const data = await getProspects();
      setProspects(data);
      setLoading(false);
    };
    fetchProspects();
  }, []);

  const handleExportCSV = () => {
    if (prospects.length === 0) return;

    // Définir les en-têtes
    const headers = ['Email', 'Date d\'inscription', 'Source', 'Univers', 'Statut'];
    
    // Formater les lignes
    const rows = prospects.map(p => [
      p.email,
      p.createdAt.toLocaleDateString('fr-FR') + ' ' + p.createdAt.toLocaleTimeString('fr-FR'),
      p.source || 'N/A',
      p.universe || 'N/A',
      p.status || 'active'
    ]);

    // Combiner le tout en CSV avec séparateur point-virgule pour Excel fr
    const csvContent = [
      headers.join(';'),
      ...rows.map(e => e.join(';'))
    ].join('\n');

    // Créer le fichier
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Téléchargement
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `newsletter_contacts_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-[#8b4513] animate-spin" />
        <p className="text-[#8b4513] font-bold">Chargement des abonnés...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-xl shadow-sm border border-[#4a2e1b]/10">
        <div>
          <h2 className="text-2xl font-black text-[#4a2e1b] font-cordel flex items-center gap-2">
            <Mail className="w-6 h-6 text-[#d2691e]" />
            Abonnés Newsletter
          </h2>
          <p className="text-gray-500 mt-1">
            Gérez votre liste de diffusion et exportez vos contacts.
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-[#fdf6e7] px-4 py-2 rounded-lg border border-[#8b4513]/20 flex items-center gap-2">
            <Users className="w-5 h-5 text-[#8b4513]" />
            <span className="font-bold text-[#4a2e1b] text-lg">{prospects.length}</span>
            <span className="text-sm text-gray-600">inscrits</span>
          </div>

          <button
            onClick={handleExportCSV}
            disabled={prospects.length === 0}
            className="flex items-center gap-2 bg-[#2c1d11] hover:bg-[#4a2e1b] text-white px-4 py-2.5 rounded-lg font-bold shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Exporter (CSV)</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-[#4a2e1b]/10 overflow-hidden">
        {prospects.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <Mail className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p>Aucun abonné pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#f4e8cf] text-[#4a2e1b] text-sm uppercase tracking-wider">
                  <th className="p-4 font-bold">Email</th>
                  <th className="p-4 font-bold">Date d'inscription</th>
                  <th className="p-4 font-bold">Univers</th>
                  <th className="p-4 font-bold">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#4a2e1b]/10 text-sm">
                {prospects.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-semibold text-gray-900">{p.email}</td>
                    <td className="p-4 text-gray-600">
                      {p.createdAt.toLocaleDateString('fr-FR')} à {p.createdAt.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-4">
                      <span className="bg-[#fdf6e7] text-[#8b4513] border border-[#8b4513]/20 px-2 py-1 rounded text-xs font-bold capitalize">
                        {p.universe || 'Général'}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">
                      {p.source}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
