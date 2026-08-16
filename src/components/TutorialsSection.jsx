import React, { useState } from 'react';
import { PlayCircle, Clock, Tag, X, Sparkles, Video } from 'lucide-react';
import tutosData from '../data/tutos.json';

export default function TutorialsSection() {
  const [selectedTutorial, setSelectedTutorial] = useState(null);

  return (
    <section id="tutoriels" className="py-16 sm:py-24 bg-white/70 border-b-2 border-[#4a2e1b]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#8b4513] text-[#fdf6e7] text-xs font-bold uppercase tracking-wider rounded">
            <Video className="w-3.5 h-3.5" />
            Apprendre en Vidéo
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-[#4a2e1b] font-cordel">
            Démos Vidéo & Tutoriels
          </h2>
          <p className="text-sm sm:text-base text-[#8b4513] font-medium">
            Découvrez pas à pas comment maîtriser le Séquenceur, administrer votre Bloco et naviguer dans le Hub Écosystème.
          </p>
        </div>

        {/* Categories list */}
        <div className="space-y-12">
          {tutosData.categories.map((cat) => (
            <div key={cat.id} className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-[#8b4513]/30 pb-3">
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-[#4a2e1b] font-cordel">
                    {cat.appName}
                  </h3>
                  <p className="text-xs text-gray-600">{cat.description}</p>
                </div>
                <span className="text-xs bg-[#8b4513] text-[#fdf6e7] px-3 py-1 rounded font-bold uppercase">
                  {cat.tutorials.length} tutoriels
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cat.tutorials.map((tut) => (
                  <div
                    key={tut.id}
                    onClick={() => setSelectedTutorial(tut)}
                    className="bg-[#fdf6e7] border-2 border-[#4a2e1b] rounded-xl p-4 flex flex-col justify-between hover:shadow-xl transition-all cursor-pointer group hover:-translate-y-1"
                  >
                    <div>
                      {/* Fake Thumbnail / Play Overlay */}
                      <div className="w-full h-36 bg-[#4a2e1b] rounded-lg mb-3 flex items-center justify-center relative overflow-hidden group-hover:bg-[#8b4513] transition-colors">
                        <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white group-hover:scale-110 transition-transform">
                          <PlayCircle className="w-8 h-8 text-amber-300" />
                        </div>
                        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded font-mono">
                          {tut.duration}
                        </span>
                      </div>

                      <h4 className="font-bold text-[#4a2e1b] text-sm font-cordel mb-2 line-clamp-2 group-hover:text-[#8b4513] transition-colors">
                        {tut.title}
                      </h4>
                      <p className="text-xs text-gray-700 line-clamp-3 mb-4 leading-relaxed">
                        {tut.summary}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#8b4513]/20 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-[#8b4513]">{tut.level}</span>
                      <span className="text-[#8b4513] group-hover:underline font-bold flex items-center gap-1">
                        Regarder →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* Video Modal Player */}
      {selectedTutorial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#fdf6e7] xilo-border rounded-xl max-w-2xl w-full p-6 relative shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedTutorial(null)}
              className="absolute top-4 right-4 text-[#8b4513] hover:text-[#4a2e1b] p-1 bg-[#f4e8cf] rounded-full cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold font-cordel text-[#4a2e1b]">
              {selectedTutorial.title}
            </h3>
            <p className="text-xs text-gray-700">{selectedTutorial.summary}</p>

            <div className="aspect-video bg-black rounded-lg flex items-center justify-center text-white relative">
              <div className="text-center space-y-2">
                <PlayCircle className="w-16 h-16 text-amber-400 mx-auto animate-pulse" />
                <p className="text-xs font-mono text-gray-300">
                  Démo Vidéo : {selectedTutorial.title} ({selectedTutorial.duration})
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {selectedTutorial.tags?.map((t, i) => (
                <span key={i} className="text-[10px] bg-[#8b4513] text-[#fdf6e7] px-2 py-0.5 rounded font-semibold">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
