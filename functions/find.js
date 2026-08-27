const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

async function findOpanije() {
  const collections = await db.listCollections();
  console.log("Checking collections...");
  for (let collection of collections) {
    const snapshot = await collection.get();
    snapshot.forEach(doc => {
      const data = doc.data();
      const jsonStr = JSON.stringify(data).toLowerCase();
      if (jsonStr.includes('opanij')) {
        console.log(`Found in collection: ${collection.id}, doc: ${doc.id}`);
        console.log(JSON.stringify(data, null, 2));
      }
    });
  }
  console.log("Done.");
}

findOpanije().catch(console.error);
