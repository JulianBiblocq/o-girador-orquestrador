import React, { useState } from 'react';
import { db, storage } from '../../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { UploadCloud, CheckCircle2, Loader2, Image as ImageIcon, Save, MapPin, Share2, Facebook, Instagram, Youtube, Globe } from 'lucide-react';

export default function TabIdentity({ associationData, groupId }) {
  
  // Lecture depuis le theme public pour les réseaux, avec fallback sur l'ancien format
  const publicTheme = associationData?.publicTheme || {};
  const rootSocials = associationData?.socialLinks || {};
  
  const [formData, setFormData] = useState({
    name: associationData?.name || associationData?.nom || '',
    slogan: publicTheme?.publicCatchphrase || associationData?.slogan || '',
    email: associationData?.email || associationData?.emailOfficiel || '',
    phone: associationData?.phone || associationData?.telephone || publicTheme?.publicContactPhone || associationData?.publicContactPhone || '',
    adresseLocal: associationData?.adresseLocal || associationData?.lieuxImportants?.[0]?.adresse || '',
    facebook: publicTheme?.socialLinks?.facebook || rootSocials?.facebook || '',
    instagram: publicTheme?.socialLinks?.instagram || rootSocials?.instagram || '',
    youtube: publicTheme?.socialLinks?.youtube || rootSocials?.youtube || '',
    website: publicTheme?.socialLinks?.website || rootSocials?.website || '',
    customDomain: associationData?.customDomain || ''
  });
  
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(
    associationData?.logoUrl || associationData?.branding?.logoUrl || null
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSuccess('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setError("L'image est trop volumineuse (max 2Mo).");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setError('');
      setSuccess('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!formData.name) {
      setError("Le nom de l'association est obligatoire.");
      return;
    }

    setIsSubmitting(true);
    
    try {
      let logoUrl = associationData?.logoUrl || null;

      // 1. Upload du nouveau logo si présent
      if (logoFile) {
        const extension = logoFile.name.split('.').pop();
        const logoRef = ref(storage, `associations/${groupId}/logo.${extension}`);
        const snapshot = await uploadBytes(logoRef, logoFile);
        logoUrl = await getDownloadURL(snapshot.ref);
      }

      // 2. Mise à jour de Firestore
      const groupRef = doc(db, 'associations', groupId);
      
      const lieux = associationData?.lieuxImportants || [];
      if (formData.adresseLocal) {
        if (lieux.length > 0) {
          lieux[0].adresse = formData.adresseLocal;
        } else {
          lieux.push({ adresse: formData.adresseLocal, googleMapsUrl: '' });
        }
      }

      // Mettre à jour publicTheme existant
      const updatedPublicTheme = {
        ...publicTheme,
        publicContactPhone: formData.phone,
        publicCatchphrase: formData.slogan,
        socialLinks: {
          ...(publicTheme.socialLinks || {}),
          facebook: formData.facebook,
          instagram: formData.instagram,
          youtube: formData.youtube,
          website: formData.website
        },
        customDomain: formData.customDomain
      };

      const updatePayload = {
        name: formData.name,
        nom: formData.name,
        slogan: formData.slogan,
        email: formData.email,
        emailOfficiel: formData.email,
        phone: formData.phone,
        telephone: formData.phone,
        adresseLocal: formData.adresseLocal,
        lieuxImportants: lieux,
        publicTheme: updatedPublicTheme,
        // Sauvegarde de secours à la racine aussi
        socialLinks: updatedPublicTheme.socialLinks
      };
      
      if (logoUrl) {
        updatePayload.logoUrl = logoUrl;
      }

      await updateDoc(groupRef, updatePayload);
      
      setSuccess("Vos informations ont été enregistrées avec succès !");
      setLogoFile(null);
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      setError("Une erreur est survenue lors de l'enregistrement de vos données.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500 space-y-8">
      
      {/* 1. CARTE DE VISITE (APERÇU EN DIRECT) */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-[#4a2e1b] font-cordel">
          Aperçu de votre identité
        </h2>
        
        {success && (
          <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 text-sm font-medium flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            {success}
          </div>
        )}

        {/* Hero Card */}
        <div className="bg-gradient-to-br from-[#8b4513] to-[#5c2e0b] rounded-2xl p-8 shadow-xl text-white relative overflow-hidden flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl"></div>
          
          {/* Logo */}
          <div className="w-32 h-32 rounded-full border-4 border-white/20 shadow-xl overflow-hidden bg-white shrink-0">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ImageIcon className="w-12 h-12" />
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left relative z-10">
            <h2 className="text-4xl font-black font-cordel mb-2">{formData.name || 'Nom de l\'association'}</h2>
            {formData.slogan && (
              <p className="text-amber-200/90 text-lg font-medium italic mb-4">« {formData.slogan} »</p>
            )}
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6">
              {formData.email && <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium">{formData.email}</span>}
              {formData.phone && <span className="bg-white/10 px-3 py-1 rounded-full text-sm font-medium">{formData.phone}</span>}
            </div>

            {/* Social Links Icons */}
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4">
              {formData.facebook && <a href={formData.facebook} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Facebook className="w-4 h-4" /></a>}
              {formData.instagram && <a href={formData.instagram} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Instagram className="w-4 h-4" /></a>}
              {formData.youtube && <a href={formData.youtube} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Youtube className="w-4 h-4" /></a>}
              {formData.website && <a href={formData.website} target="_blank" rel="noreferrer" className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"><Globe className="w-4 h-4" /></a>}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* 2. FORMULAIRE D'ÉDITION */}
        <div className="bg-[#fdf6e7] p-8 rounded-2xl border border-amber-900/10 shadow-sm">
          <h3 className="text-xl font-bold text-[#4a2e1b] mb-6 flex items-center gap-2 border-b border-amber-900/10 pb-3">
            Modifier les informations
          </h3>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-700 p-4 rounded-xl border border-red-200 text-sm font-medium">
                {error}
              </div>
            )}
            
            {/* Section: Informations de base */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Nom de l'association *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-[#8b4513] focus:ring-0 transition-colors shadow-sm"
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
                  className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-[#8b4513] focus:ring-0 transition-colors shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">E-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-[#8b4513] focus:ring-0 transition-colors shadow-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-[#8b4513] focus:ring-0 transition-colors shadow-sm"
                  />
                </div>
              </div>
            </div>

            {/* Section: Lieu et Logo */}
            <div className="space-y-4 pt-4 border-t border-amber-900/10">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" /> Adresse de répétition
                </label>
                <textarea
                  name="adresseLocal"
                  value={formData.adresseLocal}
                  onChange={handleInputChange}
                  placeholder="Ex: 12 rue de la Paix, 75000 Paris"
                  className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-[#8b4513] focus:ring-0 transition-colors resize-none h-16 shadow-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-gray-500" /> Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label 
                  htmlFor="logo-upload"
                  className="cursor-pointer flex items-center gap-2 text-amber-700 hover:text-amber-900 font-medium text-sm transition-colors p-2 border-2 border-dashed border-amber-700/30 rounded-xl justify-center bg-white"
                >
                  <UploadCloud className="w-4 h-4" /> Importer une nouvelle image
                </label>
              </div>
            </div>

            {/* Section: Réseaux Sociaux */}
            <div className="space-y-4 pt-4 border-t border-amber-900/10">
              <label className="block text-sm font-bold text-gray-700 mb-1 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-gray-500" /> Réseaux Sociaux
              </label>
              
              <div className="mb-4">
                <label className="block text-xs font-bold text-[#4a2e1b] uppercase tracking-wider mb-2">
                  Domaine Personnalisé (Vitrine)
                </label>
                <input
                  type="text" name="customDomain" placeholder="ex: www.mon-groupe.fr"
                  value={formData.customDomain} onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-[#8b4513] focus:ring-0 text-sm shadow-sm"
                />
                <p className="text-xs text-amber-700 mt-1">Si renseigné, la carte du monde redirigera vers ce domaine public au lieu de Mostrador.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="url" name="facebook" placeholder="Facebook"
                  value={formData.facebook} onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-[#8b4513] focus:ring-0 text-sm shadow-sm"
                />
                <input
                  type="url" name="instagram" placeholder="Instagram"
                  value={formData.instagram} onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-[#8b4513] focus:ring-0 text-sm shadow-sm"
                />
                <input
                  type="url" name="youtube" placeholder="YouTube"
                  value={formData.youtube} onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-[#8b4513] focus:ring-0 text-sm shadow-sm"
                />
                <input
                  type="url" name="website" placeholder="Site Web / Autre"
                  value={formData.website} onChange={handleInputChange}
                  className="w-full px-4 py-2 rounded-xl border-2 border-white focus:border-[#8b4513] focus:ring-0 text-sm shadow-sm"
                />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-amber-900/10 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex items-center justify-center gap-2 px-6 py-3 bg-[#8b4513] text-white rounded-xl font-bold hover:bg-[#6e370f] transition-all shadow-md hover:shadow-lg w-full sm:w-auto ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-105'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 3. CARTE MAPS */}
        <div className="h-full">
          {formData.adresseLocal ? (
            <div className="bg-white rounded-2xl border border-amber-900/10 shadow-sm overflow-hidden p-6 h-full flex flex-col">
              <h3 className="text-xl font-bold text-[#4a2e1b] mb-4 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-amber-600" />
                Lieu de répétition
              </h3>
              <p className="text-gray-600 mb-4 font-medium">{formData.adresseLocal}</p>
              <div className="w-full flex-1 min-h-[300px] rounded-xl overflow-hidden border border-gray-200">
                <iframe
                  title="Lieu de répétition"
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.adresseLocal)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-300 p-8 h-full flex flex-col items-center justify-center text-gray-400 text-center min-h-[300px]">
              <MapPin className="w-12 h-12 mb-3 opacity-50" />
              <p>Renseignez une adresse de répétition pour afficher la carte interactive.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
