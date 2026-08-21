import React, { useState, useEffect } from 'react';
import { ArrowLeft, Scale, ShieldCheck, FileText } from 'lucide-react';

export default function LegalView({ onNavigateHome }) {
  const [activeTab, setActiveTab] = useState('mentions');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeTab]);

  const tabs = [
    { id: 'mentions', label: 'Mentions Légales', icon: <Scale className="w-5 h-5" /> },
    { id: 'cgu', label: 'Conditions Générales (CGU)', icon: <FileText className="w-5 h-5" /> },
    { id: 'privacy', label: 'Politique de Confidentialité', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#fdf6e7] pt-24 pb-12">
      <div className="max-w-6xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-10">
          <button 
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-gray-500 hover:text-[#8b4513] font-bold text-sm transition-colors w-max mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </button>
          
          <h1 className="text-4xl md:text-5xl font-black font-cordel text-[#4a2e1b]">Cadre Légal & RGPD</h1>
          <p className="text-lg text-[#8b4513] mt-2">Dernière mise à jour : [Date du jour]</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8 items-start">
          
          {/* Sidebar */}
          <div className="w-full md:w-64 shrink-0 bg-white rounded-2xl shadow-sm border border-[#e6d5c3] overflow-hidden sticky top-24">
            <div className="flex flex-col">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 font-bold text-sm transition-colors text-left border-b border-gray-100 last:border-0 ${
                    activeTab === tab.id 
                      ? 'bg-[#fdf6e7] text-[#8b4513] border-l-4 border-l-[#8b4513]' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-l-transparent'
                  }`}
                >
                  <span className={activeTab === tab.id ? 'text-[#8b4513]' : 'text-gray-400'}>
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-white rounded-2xl shadow-sm border border-[#e6d5c3] p-8 md:p-12">
            <div className="max-w-prose mx-auto text-gray-700 leading-relaxed space-y-6">
              
              {activeTab === 'mentions' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-3xl font-black text-[#4a2e1b] mb-8 font-cordel">Mentions Légales</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">1. Éditeur du site</h3>
                  <p>
                    Le site <strong>O Girador</strong> est édité par <strong>[Nom de l'association/entreprise]</strong>, 
                    [Statut juridique] au capital de [Montant] €, immatriculée au Registre du Commerce et des Sociétés sous le numéro [Numéro SIRET/RCS].
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Siège social :</strong> [Adresse complète]</li>
                    <li><strong>Directeur de la publication :</strong> [Nom du responsable]</li>
                    <li><strong>Email de contact :</strong> <a href="mailto:[Email de contact]" className="text-[#8b4513] hover:underline">[Email de contact]</a></li>
                    <li><strong>Numéro de téléphone :</strong> [Numéro de téléphone]</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Hébergement</h3>
                  <p>
                    L'hébergement du site est assuré par <strong>[Nom de l'hébergeur, ex: Vercel / GitHub Pages]</strong>.
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Adresse de l'hébergeur :</strong> [Adresse postale de l'hébergeur]</li>
                    <li><strong>Contact de l'hébergeur :</strong> [Site web ou email de l'hébergeur]</li>
                  </ul>
                  
                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Base de données et Serveur Backend</h3>
                  <p>
                    L'infrastructure backend (authentification, base de données Firestore, Cloud Functions) est opérée par <strong>Google Firebase</strong> (Google Ireland Limited).
                  </p>
                </div>
              )}

              {activeTab === 'cgu' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-3xl font-black text-[#4a2e1b] mb-8 font-cordel">Conditions Générales d'Utilisation</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">1. Objet du Service</h3>
                  <p>
                    La plateforme O Girador fournit un ensemble d'outils numériques (Hub, Séquenceur, Dançador, Organizador) 
                    dédiés à la gestion et la pratique musicale pour les groupes et associations (notamment de Maracatu). 
                    L'utilisation de ces services implique l'acceptation sans réserve des présentes conditions.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Accès et Compte Utilisateur</h3>
                  <p>
                    L'accès à l'Espace Mestre nécessite la création d'un compte gratuit via authentification Google. 
                    L'utilisateur s'engage à fournir des informations exactes concernant son identité ou celle de son association. 
                    Le compte est strictement personnel à l'association désignée.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Modération et Contenu Public</h3>
                  <p>
                    En publiant des rythmes ou chorégraphies dans le <strong>Catalogue Public</strong> ou des messages sur le <strong>Terreiro</strong>, 
                    l'utilisateur s'engage à ne pas diffuser de contenus illicites, haineux, ou contraires aux bonnes mœurs. 
                    L'éditeur se réserve le droit exclusif de modérer, masquer ou supprimer tout contenu jugé inapproprié 
                    sans préavis (retrait du domaine public, déduction de points de karma).
                  </p>
                  
                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Propriété Intellectuelle des Créations</h3>
                  <p>
                    L'utilisateur garantit détenir les droits ou autorisations nécessaires pour partager des séquences 
                    musicales ou chorégraphiques sur la plateforme. Les créations importées depuis le catalogue vers un 
                    espace personnel sont automatiquement créditées de leur auteur original, dont la mention ne doit pas être altérée de mauvaise foi.
                  </p>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-3xl font-black text-[#4a2e1b] mb-8 font-cordel">Politique de Confidentialité (RGPD)</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">1. Données collectées</h3>
                  <p>
                    Dans le cadre de l'utilisation de la plateforme, nous sommes amenés à collecter les données suivantes :
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Adresse email (via Google Auth)</li>
                    <li>Identifiant unique Google (UID)</li>
                    <li>Nom, prénom, ou nom de l'association</li>
                    <li>Localisation (si renseignée sur la carte du Terreiro)</li>
                    <li>Données d'utilisation (rythmes créés, chorégraphies, historique d'importation)</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Finalité du traitement</h3>
                  <p>
                    Ces données sont strictement nécessaires pour :
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Assurer le fonctionnement des outils (sauvegarde Cloud des créations).</li>
                    <li>Sécuriser l'accès à votre espace (Hub).</li>
                    <li>Permettre les interactions communautaires (Catalogue public, Forum, Partage privé).</li>
                  </ul>
                  <p className="mt-2 text-sm italic text-gray-500">Nous ne revendons aucune de vos données personnelles à des tiers.</p>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Utilisation des Cookies</h3>
                  <p>
                    La plateforme utilise principalement des cookies techniques dits "strictement nécessaires" pour 
                    maintenir la session utilisateur ouverte (Firebase Auth). Aucun cookie de ciblage publicitaire intrusif n'est utilisé.
                  </p>
                  
                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Vos droits (Accès, Rectification, Suppression)</h3>
                  <p>
                    Conformément au Règlement Général sur la Protection des Données (RGPD), vous disposez d'un droit 
                    d'accès, de rectification, de portabilité et d'effacement de vos données. Pour exercer ce droit, 
                    vous pouvez nous contacter à l'adresse suivante : 
                    <a href="mailto:[Email de contact]" className="text-[#8b4513] hover:underline ml-1">[Email de contact]</a>.
                  </p>
                </div>
              )}

            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}
