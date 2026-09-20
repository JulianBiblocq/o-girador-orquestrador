import React, { useState } from 'react';
import { X, UserPlus, AlertCircle } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../../services/firebase';
import AdminGuestForm from './AdminGuestForm';
import AdminGuestSuccessView from './AdminGuestSuccessView';

/**
 * Modale Super-Admin pour l'invitation et la création rapide d'accès Pros / Testeurs.
 * Appelle la Cloud Function adminCreateGuestUser pour ne pas déconnecter le Super-Admin.
 */
export default function AdminGuestModal({ isOpen, onClose }) {
  const [email, setEmail] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [groupId, setGroupId] = useState('guest-pro');
  const [customGroupId, setCustomGroupId] = useState('');
  const [isAutoPassword, setIsAutoPassword] = useState(true);
  const [manualPassword, setManualPassword] = useState('');
  const [canWrite, setCanWrite] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  if (!isOpen) return null;

  const handleReset = () => {
    setEmail('');
    setDisplayName('');
    setGroupId('guest-pro');
    setCustomGroupId('');
    setIsAutoPassword(true);
    setManualPassword('');
    setCanWrite(true);
    setError(null);
    setResult(null);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const effectiveGroupId = (groupId === 'custom' ? customGroupId : groupId).trim().toLowerCase();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const createGuestFn = httpsCallable(functions, 'adminCreateGuestUser');
      const response = await createGuestFn({
        email: email.trim().toLowerCase(),
        displayName: displayName.trim() || 'Invité Pro',
        groupId: effectiveGroupId || 'guest-pro',
        manualPassword: isAutoPassword ? null : manualPassword.trim(),
        canWrite
      });

      setResult(response.data);
    } catch (err) {
      console.error('[AdminGuestModal] Erreur lors de la création :', err);
      setError(err.message || 'Une erreur est survenue lors de la création du compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-[#fdf6e7] xilo-border rounded-xl max-w-lg w-full p-6 sm:p-7 relative shadow-2xl space-y-5 my-8">
        
        {/* En-tête de la modale */}
        <div className="flex justify-between items-center border-b-2 border-[#4a2e1b]/20 pb-3">
          <div className="flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-[#8b4513]" />
            <h2 className="text-xl font-extrabold text-[#4a2e1b] font-cordel">
              {result ? 'Accès Invité Prêt !' : 'Inviter un Pro / Créer un Accès'}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[#8b4513] hover:text-[#4a2e1b] p-1 bg-[#f4e8cf] rounded-full border border-[#8b4513]/30 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-800 rounded-lg text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {result ? (
          <AdminGuestSuccessView
            result={result}
            onReset={handleReset}
            onClose={handleClose}
          />
        ) : (
          <AdminGuestForm
            email={email}
            setEmail={setEmail}
            displayName={displayName}
            setDisplayName={setDisplayName}
            groupId={groupId}
            setGroupId={setGroupId}
            customGroupId={customGroupId}
            setCustomGroupId={setCustomGroupId}
            isAutoPassword={isAutoPassword}
            setIsAutoPassword={setIsAutoPassword}
            manualPassword={manualPassword}
            setManualPassword={setManualPassword}
            canWrite={canWrite}
            setCanWrite={setCanWrite}
            loading={loading}
            onSubmit={handleSubmit}
          />
        )}
      </div>
    </div>
  );
}
