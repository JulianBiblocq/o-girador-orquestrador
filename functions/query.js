const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

async function queryPatterns() {
  console.log("Querying patterns...");
  const patternsSnap = await db.collection('patterns').get();
  const results = [];
  
  patternsSnap.forEach(doc => {
    const data = doc.data();
    if (JSON.stringify(data).toLowerCase().includes('opanij')) {
      results.push({ id: doc.id, _collection: 'patterns', ...data });
    }
  });

  const sectionsSnap = await db.collection('sections').get();
  sectionsSnap.forEach(doc => {
    const data = doc.data();
    if (JSON.stringify(data).toLowerCase().includes('opanij')) {
      results.push({ id: doc.id, _collection: 'sections', ...data });
    }
  });

  const rhythmsSnap = await db.collection('rhythms').get();
  rhythmsSnap.forEach(doc => {
    const data = doc.data();
    if (JSON.stringify(data).toLowerCase().includes('opanij')) {
      results.push({ id: doc.id, _collection: 'rhythms', ...data });
    }
  });

  console.log("Found:", results.length, "items.");
  require('fs').writeFileSync('query_results.json', JSON.stringify(results, null, 2));
  console.log("Saved to query_results.json");
}

queryPatterns().catch(console.error);
