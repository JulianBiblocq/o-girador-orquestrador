const admin = require('firebase-admin');

// Ensure you run this with GOOGLE_APPLICATION_CREDENTIALS set or firebase functions:shell
admin.initializeApp({
    projectId: 'o-girador-7828c'
});

async function findOpanije() {
  const db = admin.firestore();
  
  const checkCollection = async (collName) => {
    const snap = await db.collection(collName).get();
    let found = [];
    snap.forEach(doc => {
      const data = doc.data();
      const title = data.title || data.name || doc.id;
      if (title.toLowerCase().includes('opanij')) {
        found.push({ id: doc.id, title, collection: collName });
      }
    });
    return found;
  };
  
  const fromPatterns = await checkCollection('patterns');
  const fromSections = await checkCollection('sections');
  const fromRhythms = await checkCollection('rhythms');
  
  console.log("Patterns:", fromPatterns);
  console.log("Sections:", fromSections);
  console.log("Rhythms:", fromRhythms);
}

findOpanije().catch(console.error);
