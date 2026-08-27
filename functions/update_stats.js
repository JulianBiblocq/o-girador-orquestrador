const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'src', 'components', 'espace-client', 'dashboard', 'GlobalHealthStats.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Add new states
content = content.replace(
  'const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);',
  `const [isEventsModalOpen, setIsEventsModalOpen] = useState(false);
  const [isSubscribersModalOpen, setIsSubscribersModalOpen] = useState(false);
  const [isRhythmsModalOpen, setIsRhythmsModalOpen] = useState(false);
  const [isChoreosModalOpen, setIsChoreosModalOpen] = useState(false);`
);

// 2. Add arrays to initial stats
content = content.replace(
  'newsletterSubscribers: 0,',
  `newsletterSubscribers: 0,
    latestSubscribers: [],
    latestRhythms: [],
    latestChoreos: [],`
);

// 3. Replace fetch logic for Rhythms, Choreos, Subscribers
const fetchReplacement = `
        // 3. Fetch Rhythms from Storage (Catalogue Séquenceur) & Firestore
        let rhythmsList = [];
        try {
          const { ref, listAll } = await import('firebase/storage');
          const { storage } = await import('../../../services/firebase');
          const folderRef = ref(storage, \`documents/\${userData.groupId}/sequencer\`);
          const res = await listAll(folderRef);
          res.items.forEach(item => {
             rhythmsList.push({ id: item.name, label: item.name.replace(/^\\d+_/, '').replace(/\\.(json|mp3|wav|ogg|m4a|aac)$/i, ''), date: parseInt(item.name.split('_')[0]) || 0 });
          });
          
          const patternsSnap = await safeGetDocs(query(collection(db, 'patterns')));
          const sectionsSnap = await safeGetDocs(query(collection(db, 'sections')));
          const rhythmsSnap = await safeGetDocs(query(collection(db, 'rhythms')));
          
          const addFirestoreItems = (snap) => {
             if (snap) snap.forEach(doc => {
               const data = doc.data();
               rhythmsList.push({ id: doc.id, label: data.title || data.name || 'Sans titre', date: data.createdAt?.toMillis?.() || 0 });
             });
          };
          addFirestoreItems(patternsSnap);
          addFirestoreItems(sectionsSnap);
          addFirestoreItems(rhythmsSnap);
          rhythmsList.sort((a, b) => b.date - a.date);
        } catch (e) {
          console.warn("Rhythms fetch error:", e.message);
        }

        // 4. Fetch Choreographies
        let choreosList = [];
        const choreoRef = collection(db, 'choreographies');
        const qChoreo = query(choreoRef, where('groupId', '==', userData.groupId));
        const choreoSnap = await safeGetDocs(qChoreo);
        if (choreoSnap) {
           choreoSnap.forEach(doc => {
             const data = doc.data();
             choreosList.push({ id: doc.id, label: data.title || data.name || 'Chorégraphie', date: data.createdAt?.toMillis?.() || 0 });
           });
           choreosList.sort((a, b) => b.date - a.date);
        }

        // 5. Fetch Newsletter Subscribers
        let subscribersList = [];
        const newsletterRef = collection(db, 'newsletter_subscribers');
        const qNewsletter = query(newsletterRef, where('groupId', '==', userData.groupId));
        const newsletterSnap = await safeGetDocs(qNewsletter);
        if (newsletterSnap) {
           newsletterSnap.forEach(doc => {
             const data = doc.data();
             subscribersList.push({ id: doc.id, label: data.email || data.name || 'Abonné', date: data.createdAt?.toMillis?.() || 0 });
           });
           subscribersList.sort((a, b) => b.date - a.date);
        }

        setStats({
          activeMembers: activeMembersCount,
          pupitres: pupitresArray,
          upcomingEvents: upcomingEventsCount,
          nextEventName: nextEvent,
          totalRhythms: rhythmsList.length,
          totalChoreos: choreosList.length,
          newsletterSubscribers: subscribersList.length,
          latestRhythms: rhythmsList,
          latestChoreos: choreosList,
          latestSubscribers: subscribersList,
          vitrineViews: 142
        });
`;
content = content.replace(/\/\/ 3\. Fetch Rhythms[\s\S]*?setStats\(\{[\s\S]*?vitrineViews: 142 \/\/ Hardcoded as per legacy TabAnalytics\n\s*\}\);/m, fetchReplacement.trim());

// 4. Replace items in statGroups
content = content.replace(
  /label: "Abonnés Vitrine",[\s\S]*?\} \]/m,
  `label: "Abonnés Vitrine",
          value: stats.newsletterSubscribers,
          icon: <Mail className="w-5 h-5 text-indigo-600" />,
          bgColor: hasPack('essentiel') ? "bg-indigo-100" : "bg-gray-100",
          borderColor: hasPack('essentiel') ? "border-indigo-200" : "border-gray-200",
          isLocked: !hasPack('essentiel'),
          interactive: hasPack('essentiel'),
          onClick: () => setIsSubscribersModalOpen(true),
          secondary: stats.latestSubscribers?.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {stats.latestSubscribers.slice(0, 3).map((s, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 truncate mr-2 flex-1">{s.label}</span>
                </div>
              ))}
              {stats.latestSubscribers.length > 3 && (
                <div className="text-[9px] text-gray-400 text-center pt-1 italic">
                  + {stats.latestSubscribers.length - 3} autres (cliquer pour voir tout)
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] text-gray-400 block">Aucun abonné</span>
              {!hasPack('essentiel') && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          )
        }
      ]`
);

content = content.replace(
  /label: "Rythmes Audio",[\s\S]*?\} \]/m,
  `label: "Rythmes Audio",
          value: stats.totalRhythms,
          icon: <Music className="w-5 h-5 text-purple-600" />,
          bgColor: hasPack('association') ? "bg-purple-100" : "bg-gray-100",
          borderColor: hasPack('association') ? "border-purple-200" : "border-gray-200",
          isLocked: !hasPack('association'),
          interactive: hasPack('association'),
          onClick: () => setIsRhythmsModalOpen(true),
          secondary: stats.latestRhythms?.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {stats.latestRhythms.slice(0, 3).map((r, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 truncate mr-2 flex-1">{r.label}</span>
                </div>
              ))}
              {stats.latestRhythms.length > 3 && (
                <div className="text-[9px] text-gray-400 text-center pt-1 italic">
                  + {stats.latestRhythms.length - 3} autres (cliquer pour voir tout)
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-purple-500/80 uppercase tracking-wider block">App Séquenceur</span>
              {!hasPack('association') && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          )
        },
        {
          label: "Chorégraphies",
          value: stats.totalChoreos,
          icon: <Activity className="w-5 h-5 text-pink-600" />,
          bgColor: hasPack('ecosysteme') ? "bg-pink-100" : "bg-gray-100",
          borderColor: hasPack('ecosysteme') ? "border-pink-200" : "border-gray-200",
          isLocked: !hasPack('ecosysteme'),
          interactive: hasPack('ecosysteme'),
          onClick: () => setIsChoreosModalOpen(true),
          secondary: stats.latestChoreos?.length > 0 ? (
            <div className="mt-3 space-y-1.5">
              {stats.latestChoreos.slice(0, 3).map((c, idx) => (
                <div key={idx} className="flex items-center justify-between text-[10px]">
                  <span className="text-gray-500 truncate mr-2 flex-1">{c.label}</span>
                </div>
              ))}
              {stats.latestChoreos.length > 3 && (
                <div className="text-[9px] text-gray-400 text-center pt-1 italic">
                  + {stats.latestChoreos.length - 3} autres (cliquer pour voir tout)
                </div>
              )}
            </div>
          ) : (
            <div className="mt-3 flex items-center justify-between">
              <span className="text-[10px] font-bold text-pink-500/80 uppercase tracking-wider block">App Dançador</span>
              {!hasPack('ecosysteme') && <Lock className="w-4 h-4 text-gray-400" />}
            </div>
          )
        }
      ]`
);

// 5. Add Modals
const generateModal = (isOpenVar, setOpenVar, title, iconStr, items, emptyMsg) => \`
      {/* Modal \${title} */}
      {\${isOpenVar} && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#4a2e1b] flex items-center gap-2">
                \${iconStr}
                \${title}
              </h3>
              <button 
                onClick={() => \${setOpenVar}(false)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              {\${items}.length > 0 ? (
                <div className="space-y-3">
                  {\${items}.map((item, idx) => (
                    <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-between">
                      <span className="font-medium text-gray-800 line-clamp-1 flex-1">{item.label}</span>
                      {item.date > 0 && <span className="text-xs text-gray-400 ml-2 shrink-0">{new Date(item.date).toLocaleDateString()}</span>}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  \${emptyMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}\`;

const modals = \`
\${generateModal('isSubscribersModalOpen', 'setIsSubscribersModalOpen', 'Abonnés Vitrine', '<Mail className="w-5 h-5 text-indigo-600" />', 'stats.latestSubscribers', 'Aucun abonné à la vitrine pour le moment.')}
\${generateModal('isRhythmsModalOpen', 'setIsRhythmsModalOpen', 'Rythmes Audio', '<Music className="w-5 h-5 text-purple-600" />', 'stats.latestRhythms', 'Aucun rythme audio créé pour le moment.')}
\${generateModal('isChoreosModalOpen', 'setIsChoreosModalOpen', 'Chorégraphies', '<Activity className="w-5 h-5 text-pink-600" />', 'stats.latestChoreos', 'Aucune chorégraphie créée pour le moment.')}
\`;

content = content.replace('</div>\n  );\n}\n', \`\${modals}    </div>\n  );\n}\n\`);

fs.writeFileSync(filePath, content);
console.log('Successfully updated GlobalHealthStats.jsx');
