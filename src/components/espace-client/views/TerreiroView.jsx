import React, { useState, useEffect } from 'react';
import { db } from '../../../services/firebase';
import { collection, query, where, getDocs, orderBy, limit, addDoc, deleteDoc, doc, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, Users, Store, Flame, MapPin, Tag, Search, Compass, Award, Sparkles, Trophy, Medal, Globe2, MessageSquare, Send, Trash2, Loader2 } from 'lucide-react';
import artisansData from '../../../data/artisans.json';
import WorldMapNetwork from '../../ui/WorldMapNetwork';
import TerreiroSharedBank from './TerreiroSharedBank';

export default function TerreiroView({ associationData, userData, onBack }) {
  const [baterias, setBaterias] = useState([]);
  const [loadingBaterias, setLoadingBaterias] = useState(true);
  const [artisans, setArtisans] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  
  const [forumPosts, setForumPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [newPostText, setNewPostText] = useState('');
  const [posting, setPosting] = useState(false);
  
  const userUniverse = associationData?.universeId || 'maracatu';

  useEffect(() => {
    // 1. Fetch ALL Baterias (tous les univers)
    const fetchBaterias = async () => {
      try {
        const ref = collection(db, 'associations');
        const snap = await getDocs(ref);
        
        let docs = [];
        snap.forEach(doc => {
          const data = doc.data();
          // Garder soi-même sur la carte, vérifier juste le paramètre de confidentialité
          if (data.isPublicInTerreiro !== false) {
            docs.push({ id: doc.id, ...data });
          }
        });
        
        setBaterias(docs);
      } catch (error) {
        console.error("Erreur fetch baterias:", error);
      } finally {
        setLoadingBaterias(false);
      }
    };
    
    fetchBaterias();
    
    // 2. Load Artisans from JSON (filtered)
    const filteredArtisans = artisansData.artisans.filter(
      art => art.universeId === userUniverse || art.isUniversal
    );
    setArtisans(filteredArtisans);
    
    // 3. Fetch Leaderboard (Top 5 Associations)
    const fetchLeaderboard = async () => {
      try {
        const ref = collection(db, 'associations');
        const q = query(ref, orderBy('contributionPoints', 'desc'), limit(5));
        const snap = await getDocs(q);
        
        let docs = [];
        snap.forEach(doc => {
          // Filtrer ceux qui ont vraiment des points > 0 pour le leaderboard
          const data = doc.data();
          if (data.contributionPoints > 0) {
            docs.push({ id: doc.id, ...data });
          }
        });
        
        setLeaderboard(docs);
      } catch (error) {
        console.error("Erreur fetch leaderboard:", error);
      }
    };
    
    fetchLeaderboard();
    
    // 4. Fetch Forum Posts
    const postsRef = collection(db, 'forum_posts');
    const qPosts = query(postsRef, where('universeId', '==', userUniverse));
    
    const unsubscribe = onSnapshot(qPosts, (snap) => {
      let docs = [];
      snap.forEach(d => docs.push({ id: d.id, ...d.data() }));
      // Tri en mémoire pour éviter les erreurs d'index composite Firebase
      docs.sort((a, b) => {
        const dateA = a.createdAt?.toMillis?.() || Date.now();
        const dateB = b.createdAt?.toMillis?.() || Date.now();
        return dateB - dateA;
      });
      setForumPosts(docs.slice(0, 20));
      setLoadingPosts(false);
    }, (error) => {
      console.error("Erreur fetch forum:", error);
      setLoadingPosts(false);
    });

    return () => unsubscribe();
    
  }, [userUniverse, userData?.groupId]);

  const handlePostMessage = async (e) => {
    e.preventDefault();
    if (!newPostText.trim()) return;
    
    setPosting(true);
    try {
      await addDoc(collection(db, 'forum_posts'), {
        text: newPostText.trim(),
        authorName: associationData?.name || associationData?.nom || 'Association',
        universeId: userUniverse,
        groupId: userData?.groupId,
        createdAt: serverTimestamp()
      });
      setNewPostText('');
    } catch (error) {
      console.error("Erreur publication forum:", error);
    } finally {
      setPosting(false);
    }
  };

  const handleDeletePost = async (id) => {
    if (window.confirm("Supprimer ce message ?")) {
      try {
        await deleteDoc(doc(db, 'forum_posts', id));
      } catch (error) {
        console.error("Erreur suppression message:", error);
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      
      {/* Header avec bouton retour */}
      <div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-amber-800 hover:text-amber-600 font-bold text-sm transition-colors w-max bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#8b4513] text-white rounded-xl p-8 shadow-xl relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[url('/assets/texture.png')] mix-blend-overlay pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#b05819] rounded-full mix-blend-multiply filter blur-3xl opacity-50 translate-x-1/3 -translate-y-1/3 pointer-events-none"></div>
          
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-3xl font-black font-cordel mb-2 flex items-center gap-3 text-[#fdf6e7]">
              <div className="w-10 h-10 rounded-full border-2 border-white/20 shadow-md bg-amber-500/20 flex items-center justify-center shrink-0">
                <Flame className="w-6 h-6 text-white" />
              </div>
              Le Terreiro
            </h2>
            <p className="text-amber-100 text-sm md:text-base leading-relaxed">
              L'espace de rencontre de votre écosystème. Découvrez les autres groupes de votre univers, trouvez des artisans partenaires et participez aux défis de la communauté.
            </p>
          </div>
        </div>
      </div>

      {/* Section 1 : Annuaire des Baterias */}
      <section className="bg-white rounded-xl border border-[#e6d5c3] shadow-sm p-6 relative overflow-hidden">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-xl text-[#4a2e1b] flex items-center gap-2">
            <Globe2 className="w-5 h-5 text-[#8b4513]" />
            Le réseau des groupes
          </h3>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-3 py-1 rounded-full">
            Monde Entier
          </span>
        </div>

        {!loadingBaterias && (
          <div className="mb-8">
            <WorldMapNetwork associations={baterias} />
          </div>
        )}

        {loadingBaterias ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-amber-50/50 rounded-xl border border-amber-100 animate-pulse"></div>
            ))}
          </div>
        ) : baterias.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {baterias.map(bateria => (
              <div key={bateria.id} className="bg-[#fdf6e7] border border-[#d4b895] rounded-xl p-5 flex flex-col justify-between hover:shadow-md transition-all group">
                <div>
                  <h4 className="font-bold text-[#4a2e1b] text-lg leading-tight mb-1">{bateria.name || 'Association sans nom'}</h4>
                  {bateria.city && (
                    <p className="text-sm text-[#8b4513] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {bateria.city}
                    </p>
                  )}
                </div>
                <a 
                  href={
                    (bateria.customDomains && bateria.customDomains.length > 0) ? (bateria.customDomains[0].startsWith('http') ? bateria.customDomains[0] : `https://${bateria.customDomains[0]}`) :
                    bateria.customDomain ? (bateria.customDomain.startsWith('http') ? bateria.customDomain : `https://${bateria.customDomain}`) :
                    bateria.website ? (bateria.website.startsWith('http') ? bateria.website : `https://${bateria.website}`) :
                    `https://mostrador.o-girador.com/${bateria.id}`
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 flex items-center justify-center gap-2 w-full py-2 bg-white border border-[#d4b895] rounded-lg text-sm font-bold text-[#8b4513] group-hover:bg-[#8b4513] group-hover:text-white transition-colors"
                >
                  <Search className="w-4 h-4" />
                  Visiter la vitrine
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-[#fdf6e7]/50 rounded-xl border border-dashed border-[#d4b895]">
            <Compass className="w-12 h-12 text-[#d4b895] mx-auto mb-4" />
            <p className="text-[#8b4513] font-bold text-lg mb-2">Vous êtes les pionniers !</p>
            <p className="text-[#8b4513]/70 max-w-md mx-auto text-sm">
              Il n'y a pas encore d'autres groupes inscrits dans l'univers "{userUniverse}". La communauté ne demande qu'à grandir.
            </p>
          </div>
        )}
      </section>

      {/* Section 2 : Le Marché des Artisans */}
      <section className="bg-white rounded-xl border border-[#e6d5c3] shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h3 className="font-bold text-xl text-[#4a2e1b] flex items-center gap-2 mb-1">
              <Store className="w-5 h-5 text-[#8b4513]" />
              Le Marché des Artisans
            </h3>
            <p className="text-sm text-gray-500">
              Des partenaires soigneusement sélectionnés pour votre association.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {artisans.map(artisan => (
            <div key={artisan.id} className="flex flex-col border border-gray-200 rounded-xl overflow-hidden hover:border-[#8b4513]/30 transition-colors">
              <div className="bg-gray-50 p-5 flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {artisan.tags.map((tag, idx) => (
                    <span key={idx} className="text-[10px] font-bold uppercase tracking-wider bg-white text-gray-500 border border-gray-200 px-2 py-1 rounded">
                      {tag}
                    </span>
                  ))}
                  {artisan.isUniversal && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      Universel
                    </span>
                  )}
                </div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">{artisan.name}</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{artisan.description}</p>
              </div>
              
              <div className="border-t border-gray-100 bg-[#fdf6e7] p-4 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[#8b4513] font-bold uppercase tracking-widest mb-0.5">Avantage Membre</p>
                  <p className="font-black text-amber-700">{artisan.discount}</p>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-[10px] text-gray-500 mb-1">Code Promo :</p>
                  <span className="flex items-center gap-1.5 bg-white border border-[#d4b895] text-[#8b4513] px-3 py-1.5 rounded font-mono font-bold text-sm select-all">
                    <Tag className="w-3.5 h-3.5" />
                    {artisan.promoCode}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2.25 : La Banque de Partage */}
      <TerreiroSharedBank userData={userData} />

      {/* Section 2.5 : Le Mur d'Échanges */}
      <section className="bg-[#fdf6e7] rounded-xl border border-[#e6d5c3] shadow-sm p-6">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-[#8b4513]" />
          <h3 className="font-bold text-xl text-[#4a2e1b]">Mur d'Échanges</h3>
        </div>
        
        {/* Input */}
        <form onSubmit={handlePostMessage} className="mb-8">
          <div className="relative">
            <textarea
              value={newPostText}
              onChange={(e) => setNewPostText(e.target.value)}
              placeholder={`Partager une idée avec l'univers ${userUniverse}...`}
              className="w-full bg-white border border-[#d4b895] rounded-xl p-4 pr-16 resize-none focus:outline-none focus:border-[#8b4513] focus:ring-1 focus:ring-[#8b4513] min-h-[100px]"
              disabled={posting}
            />
            <button
              type="submit"
              disabled={!newPostText.trim() || posting}
              className="absolute bottom-4 right-4 p-2 bg-[#8b4513] text-white rounded-lg hover:bg-[#6e370f] disabled:opacity-50 transition-colors"
            >
              {posting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
        </form>

        {/* Feed */}
        <div className="space-y-4">
          {loadingPosts ? (
            [1, 2, 3].map(i => (
              <div key={i} className="bg-white p-4 rounded-xl border border-[#e6d5c3] flex gap-4 animate-pulse">
                <div className="w-10 h-10 bg-[#e6d5c3] rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-[#e6d5c3] rounded w-1/4"></div>
                  <div className="h-3 bg-[#e6d5c3] rounded w-3/4"></div>
                  <div className="h-3 bg-[#e6d5c3] rounded w-1/2"></div>
                </div>
              </div>
            ))
          ) : forumPosts.length > 0 ? (
            forumPosts.map(post => (
              <div key={post.id} className="bg-white p-4 rounded-xl border border-[#e6d5c3] flex gap-4 hover:shadow-sm transition-shadow">
                <div className="w-10 h-10 bg-[#8b4513] text-white rounded-full flex items-center justify-center font-bold shrink-0">
                  {post.authorName?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-[#4a2e1b] text-sm">{post.authorName}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">
                        {post.createdAt ? new Date(post.createdAt.toMillis ? post.createdAt.toMillis() : Date.now()).toLocaleDateString() : 'À l\'instant'}
                      </span>
                      {post.groupId === userData?.groupId && (
                        <button 
                          onClick={() => handleDeletePost(post.id)}
                          className="text-gray-300 hover:text-red-500 transition-colors ml-2"
                          title="Supprimer mon message"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{post.text}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8 bg-white/50 rounded-xl border border-dashed border-[#d4b895]">
              <p className="text-[#8b4513]/70">Soyez le premier à lancer une discussion dans cet univers !</p>
            </div>
          )}
        </div>
      </section>

      {/* Section 3 : Défis & Gamification (Classement des Mécènes) */}
      <section className="bg-gradient-to-br from-[#8b4513] to-[#4a2e1b] rounded-xl shadow-lg p-1 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/assets/texture.png')] mix-blend-overlay opacity-20 pointer-events-none"></div>
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 relative z-10 border border-white/10">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 border-b border-white/10 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-xl flex items-center justify-center shadow-lg transform -rotate-3">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-2xl text-white font-cordel">Le Mur des Mécènes</h3>
                <p className="text-amber-200 text-sm">Les associations qui partagent le plus leurs créations avec le réseau.</p>
              </div>
            </div>
            
            <div className="bg-black/20 rounded-lg px-4 py-2 text-center shrink-0">
              <p className="text-[10px] text-amber-200/70 font-bold uppercase tracking-widest mb-1">Vos points d'Axé</p>
              <div className="text-2xl font-black text-amber-400 font-cordel flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5" />
                {associationData?.contributionPoints || 0}
              </div>
            </div>
          </div>

          {leaderboard.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {leaderboard.map((assoc, index) => (
                <div key={assoc.id} className="bg-white/10 hover:bg-white/20 transition-colors rounded-xl p-4 flex items-center gap-4 border border-white/5">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shrink-0 shadow-inner ${
                    index === 0 ? 'bg-gradient-to-br from-yellow-300 to-yellow-600 text-yellow-900' :
                    index === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-gray-900' :
                    index === 2 ? 'bg-gradient-to-br from-orange-300 to-orange-700 text-orange-900' :
                    'bg-white/20 text-amber-100'
                  }`}>
                    {index < 3 ? <Medal className="w-5 h-5" /> : `#${index + 1}`}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-white truncate">{assoc.name || 'Association'}</p>
                    <p className="text-xs text-amber-200/80 truncate flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> {assoc.contributionPoints} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Sparkles className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-amber-100/70">Aucune association n'a encore cumulé de points de contribution.</p>
              <p className="text-sm font-bold text-amber-400 mt-2">Soyez le premier ! Partagez un rythme ou une chorégraphie.</p>
            </div>
          )}

        </div>
      </section>

    </div>
  );
}
