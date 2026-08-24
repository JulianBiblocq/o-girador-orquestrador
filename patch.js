const fs = require('fs');
const path = require('path');

// 1. Patch MestreTopBar.jsx
let topBarPath = path.join('src', 'components', 'espace-client', 'MestreTopBar.jsx');
let topBar = fs.readFileSync(topBarPath, 'utf8');
topBar = topBar.replace(
  "if (associationData?.isAdmin || associationData?.role === 'admin') return true;",
  "if (associationData?.isAdmin || associationData?.role === 'admin') return true;\n    if (associationData?.appAccess?.[packId] === true) return true;"
);
fs.writeFileSync(topBarPath, topBar);

// 2. Patch AssociationModal.jsx
let modalPath = path.join('src', 'components', 'admin', 'AssociationModal.jsx');
let modal = fs.readFileSync(modalPath, 'utf8');
modal = modal.replace(
  "vitrine: Boolean(initialData.appAccess?.vitrine ?? true)\n        },",
  "vitrine: Boolean(initialData.appAccess?.vitrine ?? true),\n          dancador: Boolean(initialData.appAccess?.dancador ?? false)\n        },"
);
modal = modal.replace(
  "vitrine: true\n        },",
  "vitrine: true,\n          dancador: false\n        },"
);
modal = modal.replace(
  "vitrine: true\n    },",
  "vitrine: true,\n      dancador: false\n    },"
);
fs.writeFileSync(modalPath, modal);

// 3. Patch AssociationTable.jsx
let tablePath = path.join('src', 'components', 'admin', 'AssociationTable.jsx');
let table = fs.readFileSync(tablePath, 'utf8');
if (!table.includes('ActiveMembersCount')) {
  let importBlock = "import React, { useState, useEffect } from 'react';\nimport { Search, Edit3, Trash2 } from 'lucide-react';\nimport { calculateSubscriptionStatus, getAccessRights } from '../../utils/subscriptionRights';\nimport { db } from '../../services/firebase';\nimport { collection, query, where, getDocs } from 'firebase/firestore';\n\nfunction ActiveMembersCount({ groupId, staticCount }) {\n  const [count, setCount] = useState(null);\n  useEffect(() => {\n    let isMounted = true;\n    if (!groupId) return;\n    const fetchCount = async () => {\n      try {\n        const q = query(collection(db, 'users'), where('groupId', '==', groupId), where('statutActuel', '==', 'active'));\n        const snap = await getDocs(q);\n        if (isMounted) setCount(snap.size);\n      } catch (e) { }\n    };\n    fetchCount();\n    return () => { isMounted = false; };\n  }, [groupId]);\n  return <>{count !== null ? count : (staticCount || 0)}</>;\n}\n";
  
  table = table.replace(
    "import React from 'react';\nimport { Search, Edit3, Trash2 } from 'lucide-react';\nimport { calculateSubscriptionStatus, getAccessRights } from '../../utils/subscriptionRights';",
    importBlock
  );
  table = table.replace("{assoc.membersCount || 0} membres", "<ActiveMembersCount groupId={assoc.id} staticCount={assoc.membersCount} /> membres actifs");
  fs.writeFileSync(tablePath, table);
}

console.log('Patch complete.');
