import React, { useState, useEffect } from 'react';
import { getTickets, updateTicketStatus } from '../../services/telemetryService';
import { useLanguage } from '../../hooks/useLanguage';

const TicketDetailModal = ({ ticket, onClose, onStatusChange }) => {
  if (!ticket) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-[#fcf8f2] rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[#4a2e1b]/20">
        <div className="p-6 space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-[#4a2e1b]">{ticket.subject || 'Sans objet'}</h3>
              <p className="text-sm text-gray-500">Ticket ID: {ticket.id}</p>
            </div>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 font-bold">✕</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm bg-white p-4 rounded-lg border border-[#4a2e1b]/10">
            <div><span className="font-bold text-gray-700">Type:</span> <span className="uppercase">{ticket.type || 'N/A'}</span></div>
            <div><span className="font-bold text-gray-700">App Source:</span> {ticket.appSource}</div>
            <div><span className="font-bold text-gray-700">Utilisateur:</span> {ticket.userEmail || 'Anonyme'}</div>
            <div><span className="font-bold text-gray-700">Rôle:</span> {ticket.userRole || 'N/A'}</div>
            <div><span className="font-bold text-gray-700">Association:</span> {ticket.associationName || ticket.groupId}</div>
            <div><span className="font-bold text-gray-700">Date:</span> {ticket.createdAt?.toLocaleString()}</div>
            <div className="col-span-2"><span className="font-bold text-gray-700">URL / Page:</span> <a href={ticket.pageUrl} target="_blank" rel="noreferrer" className="text-blue-600 underline">{ticket.pageUrl}</a></div>
          </div>
          
          <div>
            <span className="font-bold text-[#4a2e1b] block mb-2">Description:</span>
            <div className="bg-white p-4 rounded border border-[#4a2e1b]/10 text-gray-800 whitespace-pre-wrap">
              {ticket.description || 'Aucune description fournie.'}
            </div>
          </div>

          {ticket.screenshotUrl && (
            <div>
              <span className="font-bold text-[#4a2e1b] block mb-2">Capture d'écran attachée:</span>
              <img src={ticket.screenshotUrl} alt="Screenshot ticket" className="max-w-full rounded border border-gray-300" />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4 border-t border-[#4a2e1b]/10">
            <button onClick={() => onStatusChange(ticket.id, 'archived')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Archiver</button>
            <button onClick={() => onStatusChange(ticket.id, 'in_progress')} className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200">En cours</button>
            <button onClick={() => onStatusChange(ticket.id, 'resolved')} className="px-4 py-2 bg-green-100 text-green-800 rounded hover:bg-green-200">Résolu</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TicketsTab() {
  const { t } = useLanguage();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchTickets = async () => {
    setLoading(true);
    const data = await getTickets(statusFilter ? { status: statusFilter } : {});
    setTickets(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    await updateTicketStatus(id, newStatus);
    setTickets(tickets.map(t => t.id === id ? { ...t, status: newStatus } : t));
    if (selectedTicket && selectedTicket.id === id) {
      setSelectedTicket(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-red-100 text-red-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'archived': return 'bg-gray-100 text-gray-600';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'bug': return '🐛';
      case 'feature': return '💡';
      case 'help': return '❓';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-[#fdf6e7] p-4 rounded-lg shadow border border-[#4a2e1b]/10">
        <h2 className="text-xl font-bold text-[#4a2e1b]">📬 Tickets & Retours Utilisateurs</h2>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-[#4a2e1b]/20 bg-white shadow-sm focus:ring-[#8b4513] focus:border-[#8b4513]"
        >
          <option value="">Tous les statuts</option>
          <option value="new">Nouveaux</option>
          <option value="in_progress">En cours</option>
          <option value="resolved">Résolus</option>
          <option value="archived">Archivés</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-[#4a2e1b]/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-[#f4e8cf]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">Sujet</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">App / Asso</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-[#4a2e1b] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Chargement...</td></tr>
              ) : tickets.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">Aucun ticket trouvé.</td></tr>
              ) : tickets.map((ticket) => (
                <tr key={ticket.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.createdAt?.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-lg" title={ticket.type}>{getTypeIcon(ticket.type)}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{ticket.subject}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 capitalize">{ticket.appSource}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{ticket.associationName || ticket.groupId}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(ticket.status)}`}>
                      {ticket.status || 'new'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button onClick={() => setSelectedTicket(ticket)} className="text-[#8b4513] hover:text-[#4a2e1b]">Détails</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TicketDetailModal 
        ticket={selectedTicket} 
        onClose={() => setSelectedTicket(null)} 
        onStatusChange={handleStatusChange} 
      />
    </div>
  );
}
