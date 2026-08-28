import React, { useState } from 'react';
import { db, storage } from '../../../services/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ArrowLeft, Save, Building2, Globe, MapPin, Mail, Instagram, Facebook, Link as LinkIcon, Shield, Eye, EyeOff, CheckCircle2, Phone, UploadCloud, Image as ImageIcon } from 'lucide-react';

export default function ProfileView({ associationData, userData, onBack }) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Initialisation de l'état avec les données existantes
  const [formData, setFormData] = useState({
    name: associationData?.name || associationData?.nom || '',
    logoUrl: associationData?.logoUrl || associationData?.branding?.logoUrl || '',
    slogan: associationData?.slogan || associationData?.publicTheme?.publicCatchphrase || '',
    email: associationData?.email || associationData?.emailOfficiel || '',
    phone: associationData?.phone || associationData?.telephone || '',
    facebook: associationData?.facebook || associationData?.socialLinks?.facebook || associationData?.publicTheme?.socialLinks?.facebook || '',
    instagram: associationData?.instagram || associationData?.socialLinks?.instagram || associationData?.publicTheme?.socialLinks?.instagram || '',
    address: associationData?.address || associationData?.adresseLocal || '',
    customDomain: (associationData?.customDomains && associationData.customDomains.length > 0) ? associationData.customDomains[0] : (associationData?.customDomain || ''),
  });

  // Par défaut, s'il n'y a pas de réglage, on considère que c'est public (true)
  const [isPublicInTerreiro, setIsPublicInTerreiro] = useState(
    associationData?.isPublicInTerreiro !== undefined ? associationData.isPublicInTerreiro : true
  );

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(associationData?.logoUrl || associationData?.branding?.logoUrl || null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("L'image est trop volumineuse (max 2Mo).");
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!userData?.groupId) return;
    
    setLoading(true);
    setSuccess(false);
    
    let location = associationData?.location || null;
    
    // Géocodage si une adresse est fournie
    if (formData.address && formData.address.trim() !== '') {
      // Détection de coordonnées directes (ex: "47.65, -2.98")
      const coordMatch = formData.address.match(/^([-+]?\d{1,2}(?:\.\d+)?)\s*,\s*([-+]?\d{1,3}(?:\.\d+)?)$/);
      
      if (coordMatch) {
        location = {
          lat: parseFloat(coordMatch[1]),
          lng: parseFloat(coordMatch[2])
        };
      } else {
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(formData.address)}`);
          const data = await response.json();
          if (data && data.length > 0) {
            location = {
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon)
            };
          }
        } catch (err) {
          console.error("Erreur de géocodage:", err);
        }
      }
    } else {
      location = null;
    }
    
    let finalLogoUrl = formData.logoUrl;
    if (logoFile) {
      try {
        const extension = logoFile.name.split('.').pop();
        const logoRef = ref(storage, `associations/${userData.groupId}/logo_profile.${extension}`);
        const snapshot = await uploadBytes(logoRef, logoFile);
        finalLogoUrl = await getDownloadURL(snapshot.ref);
      } catch (err) {
        console.error("Erreur upload logo:", err);
      }
    }
    
    try {
      const docRef = doc(db, 'associations', userData.groupId);
      await updateDoc(docRef, {
        ...formData,
        nom: formData.name,
        emailOfficiel: formData.email,
        telephone: formData.phone,
        adresseLocal: formData.address,
        'publicTheme.publicCatchphrase': formData.slogan,
        'publicTheme.socialLinks.facebook': formData.facebook,
        'publicTheme.socialLinks.instagram': formData.instagram,
        'socialLinks.facebook': formData.facebook,
        'socialLinks.instagram': formData.instagram,
        'branding.logoUrl': finalLogoUrl,
        logoUrl: finalLogoUrl,
        isPublicInTerreiro,
        location,
        customDomain: formData.customDomain,
        customDomains: formData.customDomain ? [formData.customDomain] : []
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du profil:", error);
      alert("Erreur lors de la sauvegarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12 max-w-4xl mx-auto">
      
      {/* Header avec bouton retour */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-bold text-sm transition-colors w-max bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg border border-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </button>
      </div>

      <div className="mb-8">
        <h2 className="text-3xl font-black text-gray-900 mb-2">Réglages de l'Association</h2>
        <p className="text-gray-500">Gérez votre identité visuelle, vos contacts et vos préférences de confidentialité.</p>
      </div>

      {/* Section 1 : Identité & Contact */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-800">Identité & Contact</h3>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Nom */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Nom de l'association</label>
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none transition-all"
                placeholder="Ex: Maracatu O Girador"
              />
            </div>
            
            {/* Slogan */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">Slogan / Phrase d'accroche</label>
              <input 
                type="text" 
                name="slogan"
                value={formData.slogan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none transition-all"
                placeholder="Ex: Le rythme dans la peau"
              />
            </div>
            
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" /> Email public
              </label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none transition-all"
                placeholder="contact@association.com"
              />
            </div>

            {/* Téléphone */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" /> Téléphone de contact
              </label>
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none transition-all"
                placeholder="06 12 34 56 78"
              />
            </div>
            
            {/* Facebook */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Facebook className="w-4 h-4 text-gray-400" /> Facebook
              </label>
              <input 
                type="text" 
                name="facebook"
                value={formData.facebook}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none transition-all"
                placeholder="Lien de la page"
              />
            </div>
            
            {/* Instagram */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Instagram className="w-4 h-4 text-gray-400" /> Instagram
              </label>
              <input 
                type="text" 
                name="instagram"
                value={formData.instagram}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none transition-all"
                placeholder="@votre_compte"
              />
            </div>

            {/* Domaine Personnalisé */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <Globe className="w-4 h-4 text-gray-400" /> Domaine Personnalisé (Vitrine)
              </label>
              <input 
                type="text" 
                name="customDomain"
                value={formData.customDomain}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none transition-all"
                placeholder="ex: www.mon-groupe.fr"
              />
              <p className="text-xs text-gray-500 mt-1">Si renseigné, la carte du monde redirigera vers ce domaine public au lieu de l'URL par défaut Mostrador.</p>
            </div>
          </div>

          <hr className="border-gray-100" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Adresse & GMap */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-400" /> Adresse de Répétition
                </label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#8b4513] focus:border-[#8b4513] outline-none transition-all"
                  placeholder="Adresse complète (pour affichage sur la carte)"
                />
              </div>
              
              {formData.address && formData.address.trim().length > 5 && (
                <div className="w-full h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    scrolling="no" 
                    marginHeight="0" 
                    marginWidth="0" 
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(formData.address)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    title="Carte Google Maps"
                  ></iframe>
                </div>
              )}
            </div>

            {/* Upload du Logo */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-gray-400" /> Logo de l'association
              </label>
              
              <div className="relative h-48">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="profile-logo-upload"
                />
                <label 
                  htmlFor="profile-logo-upload"
                  className="flex flex-col items-center justify-center w-full h-full border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden bg-white"
                >
                  {logoPreview ? (
                    <div className="relative group w-full h-full flex items-center justify-center p-2">
                      <img src={logoPreview} alt="Aperçu logo" className="max-h-full max-w-full object-contain" />
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <UploadCloud className="text-white w-8 h-8 mb-2" />
                        <span className="text-white text-xs font-bold">Modifier le logo</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-500 p-6 text-center">
                      <UploadCloud className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                      <span className="text-sm font-bold mb-1">Cliquer pour uploader</span>
                      <span className="text-xs text-gray-400">PNG, JPG (Max 2Mo)</span>
                    </div>
                  )}
                </label>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 : Paramètres & Confidentialité */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-100 bg-gray-50/50 p-6 flex items-center gap-3">
          <Shield className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-800">Paramètres & Confidentialité</h3>
        </div>
        
        <div className="p-6">
          <div className="flex items-start justify-between gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
            <div>
              <h4 className="font-bold text-gray-900 flex items-center gap-2 mb-1">
                {isPublicInTerreiro ? <Eye className="w-4 h-4 text-green-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                Apparaître dans l'annuaire du Terreiro
              </h4>
              <p className="text-sm text-gray-500 leading-relaxed">
                Si activé, votre association sera visible par les autres groupes de votre univers dans l'onglet Terreiro (Communauté). Si désactivé, vous serez invisible dans l'annuaire.
              </p>
            </div>
            
            {/* Toggle Switch (Design SaaS) */}
            <button 
              type="button"
              onClick={() => setIsPublicInTerreiro(!isPublicInTerreiro)}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#8b4513] focus:ring-offset-2 ${
                isPublicInTerreiro ? 'bg-green-500' : 'bg-gray-200'
              }`}
              role="switch"
              aria-checked={isPublicInTerreiro}
            >
              <span className="sr-only">Utiliser le paramètre</span>
              <span
                aria-hidden="true"
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isPublicInTerreiro ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </section>

      {/* Action de sauvegarde */}
      <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
        {success && (
          <span className="text-green-600 font-bold text-sm flex items-center gap-2 animate-in fade-in zoom-in duration-300">
            <CheckCircle2 className="w-4 h-4" /> Enregistré !
          </span>
        )}
        
        <button 
          onClick={handleSave}
          disabled={loading}
          className={`flex items-center justify-center gap-2 px-8 py-3 rounded-xl font-black text-sm uppercase tracking-wide transition-all shadow-md ${
            loading 
              ? 'bg-gray-300 text-gray-500 cursor-wait shadow-none' 
              : 'bg-[#d2691e] hover:bg-[#b05819] hover:shadow-lg text-white'
          }`}
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              Sauvegarde...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Enregistrer les modifications
            </>
          )}
        </button>
      </div>

    </div>
  );
}
