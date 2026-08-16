import { useState } from 'react';
import universData from '../data/univers.json';

/**
 * Hook personnalisé de gestion des univers culturels et modales teasers (SOC)
 */
export function useUnivers(defaultUniverseId = 'maracatu') {
  const [activeUniverse, setActiveUniverse] = useState(defaultUniverseId);
  const [teaserUniverse, setTeaserUniverse] = useState(null);

  const currentUniverseObj = universData.universes.find(u => u.id === activeUniverse) || universData.universes[0];

  const selectUniverse = (universeId) => {
    const target = universData.universes.find(u => u.id === universeId);
    if (target && target.status === 'active') {
      setActiveUniverse(universeId);
      return true;
    } else if (target) {
      setTeaserUniverse(target);
      return false;
    }
    return false;
  };

  const closeTeaser = () => {
    setTeaserUniverse(null);
  };

  return {
    activeUniverse,
    currentUniverseObj,
    teaserUniverse,
    universesList: universData.universes,
    selectUniverse,
    openTeaser: (universeObj) => setTeaserUniverse(universeObj),
    closeTeaser
  };
}
