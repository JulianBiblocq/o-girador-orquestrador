import React, { useState } from 'react';
import { db, storage } from '../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UploadCloud, CheckCircle2, Loader2, Image as ImageIcon, MapPin, Share2 } from 'lucide-react';

export default function OnboardingWizard({ groupId, onComplete }) {
  const [formData, setFormData] = useState({
    name: '',
    slogan: '',
    email: '',
    phone: '',
    adresseLocal: '',
    facebook: '',
    instagram: '',
    youtube: '',
    website: ''
  });
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Limite à 2Mo
        setError("L'image est trop volumineuse (max 2Mo).");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.name) {
      setError("Le nom de l'association est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let logoUrl = null;

      // 1. Upload du logo si présent
      if (logoFile) {
        const extension = logoFile.name.split('.').pop();
        const logoRef = ref(storage, `associations/${groupId}/logo.${extension}`);
        const snapshot = await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Mise à jour de Firestore
      const groupRef = doc(db, 'associations', groupId);
      const updatePayload = {
        name: formData.name,
        nom: formData.name, // Rétrocompatibilité
        email: formData.email,
        emailOfficiel: formData.email,
        phone: formData.phone,
        telephone: formData.phone,
        adresseLocal: formData.adresseLocal,
        lieuxImportants: formData.adresseLocal ? [{ adresse: formData.adresseLocal, googleMapsUrl: '' }] : [],
        publicTheme: {
          publicCatchphrase: formData.slogan,
          socialLinks: {
            facebook: formData.facebook,
            instagram: formData.instagram,
            youtube: formData.youtube,
            website: formData.website
          }
        },
        socialLinks: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          youtube: formData.youtube,
          website: formData.website
        },
        onboardingCompleted: true
      };
      
      if (logoUrl) {
        updatePayload.logoUrl = logoUrl;
      }

      await updateDoc(groupRef, updatePayload);
      
      // 3. Retour au parent
      onComplete();

    } catch (err) {
      console.error("Erreur lors de l'onboarding:", err);
      setError("Une erreur est survenue lors de l'enregistrement de vos données.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-amber-900/10 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#fdf6e7] px-8 py-10 text-center border-b border-[#e8c39e]">
          <span className="inline-block px-3 py-1 bg-[#8b4513] text-white text-xs font-bold uppercase tracking-widest rounded-full mb-4">
            Étape 1 sur 1
          </span>
          <h2 className="text-3xl font-black text-[#4a2e1b] font-cordel mb-3">
            Personnalisons votre espace
          </h2>
          <p className="text-[#8b4513] max-w-lg mx-auto">
            Pour finaliser la création de votre Hub, définissez l'identité de votre association. Ces éléments seront visibles par tous vos membres.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-8 py-8 space-y-8">
          
          {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-medium">
              {error}
            </div>
          )}

          {/* Section: Informations de base */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#4a2e1b] border-b border-gray-100 pb-2">
              Informations de base
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nom de l'association *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Maracatu Nação O Girador"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8b4513] focus:ring-0 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Slogan</label>
                <input
                  type="text"
                  name="slogan"
                  value={formData.slogan}
                  onChange={handleInputChange}
                  placeholder="Ex: Le rythme qui nous rassemble"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8b4513] focus:ring-0 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">E-mail de contact</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@association.fr"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8b4513] focus:ring-0 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="06 12 34 56 78"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8b4513] focus:ring-0 transition-colors"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Section: Lieu */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#4a2e1b] border-b border-gray-100 pb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                Lieu de répétition
              </h3>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Adresse complète</label>
                <textarea
                  name="adresseLocal"
                  value={formData.adresseLocal}
                  onChange={handleInputChange}
                  placeholder="12 rue de la Paix, 75000 Paris"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8b4513] focus:ring-0 transition-colors resize-none h-24"
                />
              </div>
            </div>

            {/* Logo */}
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-[#4a2e1b] border-b border-gray-100 pb-2 flex items-center gap-2">
                <ImageIcon className="w-5 h-5 text-gray-500" />
                Logo de l'association
              </h3>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload"
                  className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors h-24"
                >
                  {logoPreview ? (
                    <div className="relative group h-full w-full flex justify-center">
                      <img src={logoPreview} alt="Aperçu logo" className="h-full object-contain" />
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded">
                        <UploadCloud className="text-white w-6 h-6" />
                      </div>
                    </div>
                  ) : (
                    <div className="text-center text-gray-500">
                      <UploadCloud className="w-6 h-6 mx-auto mb-1 text-gray-400" />
                      <span className="text-xs">Uploader un logo</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>

          {/* Section: Réseaux Sociaux */}
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-[#4a2e1b] border-b border-gray-100 pb-2 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-gray-500" />
              Réseaux Sociaux
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Facebook</label>
                <input
                  type="url"
                  name="facebook"
                  value={formData.facebook}
                  onChange={handleInputChange}
                  placeholder="Lien vers la page"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8b4513] focus:ring-0 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Instagram</label>
                <input
                  type="url"
                  name="instagram"
                  value={formData.instagram}
                  onChange={handleInputChange}
                  placeholder="Lien vers le profil"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8b4513] focus:ring-0 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">YouTube</label>
                <input
                  type="url"
                  name="youtube"
                  value={formData.youtube}
                  onChange={handleInputChange}
                  placeholder="Lien vers la chaîne"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8b4513] focus:ring-0 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Autre / Site Web</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="Lien du site"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#8b4513] focus:ring-0 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 px-8 py-4 bg-[#8b4513] text-white rounded-xl font-bold text-lg hover:bg-[#6e370f] transition-all shadow-xl hover:shadow-2xl ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sauvegarde en cours...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  Terminer la configuration
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
