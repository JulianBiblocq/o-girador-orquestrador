import React from 'react';
import { User, Music, Code, Heart, Sparkles, Github, Mail, Globe, ArrowLeft, Disc } from 'lucide-react';

export default function CreatorSection({ onNavigateHome }) {
  const projects = [
    {
      title: "O Girador — Séquenceur de Maracatu",
      category: "Musique & Web Audio",
      description: "Le premier séquenceur interactif dédié au Baque Virado sur le web avec Roda circulaire et micro-timing.",
      tech: ["React", "Tone.js", "Web Audio API", "Cordel Theme"],
      link: "https://github.com/julianbiblocq/o-girador",
      icon: "🥁"
    },
    {
      title: "O Girador — Manager & Vitrine Bloco",
      category: "Gestion & Communauté",
      description: "Plateforme web complète de gestion d'association pour les blocos (agenda, trésorerie, forum Varal et vitrine).",
      tech: ["React", "Firebase", "Tailwind CSS", "TipTap"],
      link: "https://github.com/JulianBiblocq/O-Girador-manager",
      icon: "📋"
    },
    {
      title: "Roda de Maracatu & Ateliers Percussifs",
      category: "Pratique & Transmission",
      description: "Animation d'ateliers de percussions brésiliennes, étude des baques traditionnels (Luanda, Imalê, Porto Rico, Estrela Brilhante).",
      tech: ["Alfaia", "Caixa", "Gonguê", "Agbê"],
      icon: "🪘"
    },
    {
      title: "Arrangements & Partitions Rhythmiques",
      category: "Composition",
      description: "Écriture et modélisation numérique de convenções, rampes de tempo et toadas pour la transmission pédagogique.",
      tech: ["JSON Schemas", "Mangue Beat", "Audio Sync"],
      icon: "🎶"
    }
  ];

  return (
    <div className="min-h-screen paper-texture py-12 sm:py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Back navigation button */}
        {onNavigateHome && (
          <button
            onClick={onNavigateHome}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#8b4513] hover:text-[#4a2e1b] bg-[#f4e8cf] px-3.5 py-2 rounded-lg border border-[#8b4513]/30 transition-all cursor-pointer shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retour au Hub Écosystème</span>
          </button>
        )}

        {/* Hero Creator Header */}
        <div className="bg-[#fdf6e7] xilo-border rounded-xl p-6 sm:p-10 space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Avatar Placeholder / Graphic */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-[#8b4513] text-[#fdf6e7] flex items-center justify-center font-bold text-5xl shadow-xl shrink-0 border-4 border-[#4a2e1b]">
              🥁
            </div>

            <div className="space-y-3 text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8b4513] text-[#fdf6e7] text-xs font-bold uppercase tracking-wider rounded">
                <User className="w-3.5 h-3.5" />
                Créateur & Concepteur
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold text-[#4a2e1b] font-cordel">
                Julian Biblocq
              </h1>
              <p className="text-sm sm:text-base font-semibold text-[#8b4513]">
                Passionné de Maracatu de Baque Virado, Percussionniste & Développeur Web
              </p>
              <p className="text-xs sm:text-sm text-gray-700 leading-relaxed max-w-2xl">
                Bienvenue ! Ce projet est né de la passion d'unir la richesse culturelle du Nordeste brésilien (le <strong>Maracatu de Baque Virado</strong> et l'art du <strong>Cordel</strong>) avec les technologies modernes du Web Audio et du génie logiciel.
              </p>

              {/* Social Links */}
              <div className="pt-2 flex flex-wrap justify-center sm:justify-start gap-3">
                <a
                  href="https://github.com/julianbiblocq"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-[#4a2e1b] text-white text-xs font-bold rounded-md flex items-center gap-1.5 hover:bg-[#8b4513] transition-colors"
                >
                  <Github className="w-4 h-4" /> GitHub Main
                </a>
                <a
                  href="https://github.com/JulianBiblocq"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-1.5 bg-[#8b4513] text-white text-xs font-bold rounded-md flex items-center gap-1.5 hover:bg-[#6e370f] transition-colors"
                >
                  <Github className="w-4 h-4" /> GitHub Manager
                </a>
              </div>
            </div>

          </div>
        </div>

        {/* Projects Showcase Section */}
        <div className="space-y-6">
          <div className="text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#4a2e1b] font-cordel">
              Projets Personnels & Musicaux
            </h2>
            <p className="text-xs sm:text-sm text-[#8b4513]">
              Une vue d'ensemble des réalisations en cours dans l'univers O Girador et au-delà.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((proj, index) => (
              <div
                key={index}
                className="bg-white/80 border-2 border-[#4a2e1b] p-6 rounded-xl shadow-md hover:shadow-lg transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-2xl">{proj.icon}</span>
                    <span className="text-[10px] uppercase font-bold bg-[#f4e8cf] text-[#8b4513] px-2.5 py-1 rounded border border-[#8b4513]/30">
                      {proj.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#4a2e1b] text-lg font-cordel mb-2">
                    {proj.title}
                  </h3>
                  <p className="text-xs text-gray-700 mb-4 leading-relaxed">
                    {proj.description}
                  </p>
                </div>

                <div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {proj.tech.map((t, idx) => (
                      <span key={idx} className="text-[10px] bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono border border-gray-200">
                        {t}
                      </span>
                    ))}
                  </div>

                  {proj.link && (
                    <a
                      href={proj.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-bold text-[#8b4513] hover:text-[#4a2e1b] inline-flex items-center gap-1"
                    >
                      <span>Voir le dépôt sur GitHub</span> →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Philosophical / Cultural Note */}
        <div className="bg-[#f4e8cf] border-2 border-[#8b4513] p-6 sm:p-8 rounded-xl text-center space-y-3">
          <div className="w-10 h-10 rounded-full bg-[#8b4513] text-[#fdf6e7] flex items-center justify-center mx-auto text-xl font-bold">
            💛
          </div>
          <h3 className="text-xl font-bold text-[#4a2e1b] font-cordel">
            Transmettre la Passion du Baque Virado
          </h3>
          <p className="text-xs sm:text-sm text-[#8b4513] max-w-2xl mx-auto leading-relaxed">
            "Le Maracatu n'est pas seulement un rythme, c'est une histoire collective, une force vivante qui unit les individus au sein du Bloco. L'objectif de l'écosystème O Girador est d'offrir des outils numériques respectueux de cette tradition orale pour en faciliter la transmission, la pratique et l'organisation administrative."
          </p>
        </div>

      </div>
    </div>
  );
}
