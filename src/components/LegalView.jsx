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
          <p className="text-lg text-[#8b4513] mt-2">Dernière mise à jour : 23 octobre 2026</p>
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
                    La plateforme <strong>O Girador</strong> (Hub Orquestrad'Or, Séquenciad'Or, Organizad'Or, Dançad'Or) est conçue, développée et éditée par <strong>Julian Biblocq</strong>.
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li><strong>Responsable de publication :</strong> Julian Biblocq</li>
                    <li><strong>Email de contact :</strong> <a href="mailto:contact@o-girador.com" className="text-[#8b4513] hover:underline">contact@o-girador.com</a></li>
                    <li><strong>Site officiel :</strong> <a href="https://www.o-girador.com" className="text-[#8b4513] hover:underline">https://www.o-girador.com</a></li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Hébergement & Infrastructure</h3>
                  <p>
                    L'hébergement statique, l'authentification et l'infrastructure de base de données temps réel sont assurés par <strong>Google Firebase / Google Cloud</strong> (Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlande).
                  </p>
                </div>
              )}

              {activeTab === 'cgu' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-3xl font-black text-[#4a2e1b] mb-8 font-cordel">Conditions Générales d'Utilisation</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">1. Objet du Service & Licence du Logiciel</h3>
                  <p>
                    La plateforme O Girador fournit un ensemble d'outils numériques dédiés à la transmission, l'apprentissage et la pratique du Maracatu de Baque Virado. Le code source (licence UNLICENSED - Tous droits réservés), l'architecture de la Roda circulaire 360°, les algorithmes de micro-timing (Balanço), l'identité graphique Cordel et les 143 échantillons acoustiques enregistrés (/Mixdown/) sont la propriété intellectuelle exclusive de l'éditeur. Le web scraping, la redistribution des banques sonores et l'entraînement de modèles d'IA sans accord écrit sont formellement interdits.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Propriété des Œuvres, Toadas & Statut d'Hébergeur</h3>
                  <p>
                    Les Mestres, compositeurs, batuqueiros et nations de Maracatu conservent <strong>100 % de leurs droits d'auteur</strong> sur leurs rythmes, paroles de toadas et voix enregistrées. O Girador intervient exclusivement en qualité d'hébergeur technique et de carnet de notes musical pour faciliter l'étude et la mémoire collective au sein des groupes autorisés.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Procédure Amiable de Paternité & Retrait (« Notice & Take Action »)</h3>
                  <p>
                    Tout auteur ou Mestre reconnaissant une toada dans le catalogue peut à tout moment demander l'attribution de son nom ou le retrait immédiat du contenu via le bouton dédié (« C'est votre texte ? ») ou par email à <a href="mailto:contact@o-girador.com" className="text-[#8b4513] hover:underline">contact@o-girador.com</a>. Le traitement est effectué sous 48 heures ouvrées sur simple justification.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Comptes, Formules & Rétention des Données (Usage Équitable)</h3>
                  <p>
                    L'accès gratuit permet l'écoute et l'entraînement. Les formules payantes et la licence pérenne sont soumises à un usage équitable (Fair Use) du stockage cloud. En cas de fin d'abonnement, les créations et presets personnels restent préservés en mode consultation pendant au moins 12 mois.
                  </p>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="animate-in fade-in duration-300">
                  <h2 className="text-3xl font-black text-[#4a2e1b] mb-8 font-cordel">Politique de Confidentialité (RGPD & LGPD)</h2>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">1. Données collectées</h3>
                  <p>
                    Dans le cadre de l'utilisation de la plateforme, nous collectons exclusivement les données strictement nécessaires au service :
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1">
                    <li>Adresse email et nom (via Google Authentication)</li>
                    <li>Identifiant unique Google (UID)</li>
                    <li>Localisation géographique facultative pour la cartographie mondiale des groupes</li>
                    <li>Presets, arrangements et données musicales créés par l'utilisateur</li>
                  </ul>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">2. Finalité du traitement & Zéro Revente</h3>
                  <p>
                    Ces données servent uniquement à assurer la synchronisation cloud de vos projets et la gestion de votre espace client. Nous ne vendons ni ne cédons aucune donnée personnelle à des tiers.
                  </p>

                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">3. Cookies techniques</h3>
                  <p>
                    La plateforme utilise exclusivement des cookies techniques nécessaires à l'authentification et au maintien de session (Firebase Auth). Aucun traceur publicitaire n'est exploité.
                  </p>
                  
                  <h3 className="text-xl font-bold text-gray-900 mt-8 mb-3">4. Vos droits (Accès, Rectification, Suppression)</h3>
                  <p>
                    Conformément au RGPD européen et à la LGPD brésilienne, vous disposez d'un droit d'accès, d'exportation, de rectification et d'effacement complet de vos données sur simple demande par email à : 
                    <a href="mailto:contact@o-girador.com" className="text-[#8b4513] hover:underline ml-1">contact@o-girador.com</a>.
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
