import React from 'react';
import { Heart, Github, Globe, Compass, ArrowUp, Lock, ShieldCheck } from 'lucide-react';
import universData from '../data/univers.json';
import { useAuth } from '../hooks/useAuth';

export default function Footer({ onNavigate, onOpenAdminModal }) {
  const { currentUser } = useAuth();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-[#1c140d] text-[#fdf6e7] border-t-4 border-[#8b4513] pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand col */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-[#8b4513] text-[#fdf6e7] rounded-lg flex items-center justify-center font-bold text-lg border border-amber-500">
                🥁
              </div>
              <span className="font-extrabold text-lg text-white font-cordel">
                O GIRADOR
              </span>
            </div>
            <p className="text-xs text-amber-200/70 leading-relaxed">
              Le Hub Central de convergence entre le Séquenceur, le Manager d'Association, la Vitrine Publique et la culture populaire brésilienne.
            </p>
          </div>

          {/* Navigation Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-cordel">
              Écosystème
            </h4>
            <ul className="space-y-2 text-xs text-amber-100/80">
              <li>
                <a href="#triptyque" className="hover:text-white transition-colors">
                  Le Séquenceur (BaqueMix)
                </a>
              </li>
              <li>
                <a href="#triptyque" className="hover:text-white transition-colors">
                  O Girador Manager
                </a>
              </li>
              <li>
                <a href="#triptyque" className="hover:text-white transition-colors">
                  Vitrine Publique Bloco
                </a>
              </li>
              <li>
                <a href="#tarifs" className="hover:text-white transition-colors">
                  Grille Tarifaire & HelloAsso
                </a>
              </li>
            </ul>
          </div>

          {/* Universes */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-cordel">
              Univers Culturels
            </h4>
            <ul className="space-y-2 text-xs text-amber-100/80">
              {universData.universes.map(u => (
                <li key={u.id} className="flex items-center justify-between">
                  <span>{u.name}</span>
                  <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-bold ${
                    u.status === 'active' ? 'bg-green-800 text-green-200' : 'bg-amber-800 text-amber-200'
                  }`}>
                    {u.badge}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Open Source & Creator */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-cordel">
              Ressources & Créateur
            </h4>
            <div className="space-y-2 text-xs text-amber-100/80">
              <button
                onClick={() => onNavigate('a-propos')}
                className="hover:text-white transition-colors font-bold text-left block cursor-pointer"
              >
                À propos du Créateur (/a-propos)
              </button>
              <a
                href="https://github.com/julianbiblocq/o-girador"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Github className="w-3.5 h-3.5" /> Dépôt GitHub Séquenceur
              </a>
              <a
                href="https://github.com/JulianBiblocq/O-Girador-manager"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 hover:text-white transition-colors"
              >
                <Github className="w-3.5 h-3.5" /> Dépôt GitHub Manager
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="border-t border-amber-900/60 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-amber-300/60">
          <div>
            © {new Date().getFullYear()} O Girador Écosystème — Conçu pour la culture du Maracatu de Baque Virado.
          </div>

          <div className="flex items-center gap-4">
            {/* Lien Admin discret 🔒 */}
            <button
              onClick={() => currentUser ? onNavigate('admin') : onOpenAdminModal()}
              className="text-amber-400/40 hover:text-amber-300 transition-colors flex items-center gap-1.5 text-xs cursor-pointer opacity-60 hover:opacity-100"
              title="Espace Administration"
            >
              {currentUser ? <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5" />}
              <span>{currentUser ? 'Back-Office Admin' : 'Espace Admin 🔒'}</span>
            </button>

            <button
              onClick={scrollToTop}
              className="p-2 bg-amber-950 hover:bg-[#8b4513] text-amber-300 rounded-lg border border-amber-800 transition-colors flex items-center gap-1 text-xs cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" /> Haut de page
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}
