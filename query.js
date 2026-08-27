import { db } from './src/services/firebase.js';
import { collection, getDocs } from 'firebase/firestore';
import fs from 'fs';

async function queryPatterns() {
  console.log("Querying patterns...");
  const patternsSnap = await getDocs(collection(db, 'patterns'));
  const results = [];
  
  patternsSnap.forEach(doc => {
    const data = doc.data();
    if (JSON.stringify(data).toLowerCase().includes('opanij')) {
      results.push({ id: doc.id, ...data });
    }
  });

  const sectionsSnap = await getDocs(collection(db, 'sections'));
  sectionsSnap.forEach(doc => {
    const data = doc.data();
    if (JSON.stringify(data).toLowerCase().includes('opanij')) {
      results.push({ id: doc.id, _collection: 'sections', ...data });
    }
  });

  const rhythmsSnap = await getDocs(collection(db, 'rhythms'));
  rhythmsSnap.forEach(doc => {
    const data = doc.data();
    if (JSON.stringify(data).toLowerCase().includes('opanij')) {
      results.push({ id: doc.id, _collection: 'rhythms', ...data });
    }
  });

  console.log("Found:", results.length, "items.");
  fs.writeFileSync('query_results.json', JSON.stringify(results, null, 2));
  console.log("Saved to query_results.json");
  process.exit(0);
}

queryPatterns().catch(err => {
  console.error(err);
  process.exit(1);
});
