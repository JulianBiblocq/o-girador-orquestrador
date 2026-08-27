const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, query, where } = require('firebase/firestore');
const fs = require('fs');

const firebaseConfig = {
  projectId: "o-girador-7828c",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function dump() {
  const sectionsSnap = await getDocs(collection(db, 'sections'));
  let sections = [];
  sectionsSnap.forEach(doc => {
    const data = doc.data();
    sections.push({ id: doc.id, title: data.title || data.name || doc.id, type: 'section' });
  });

  const rhythmsSnap = await getDocs(collection(db, 'rhythms'));
  let rhythms = [];
  rhythmsSnap.forEach(doc => {
    const data = doc.data();
    rhythms.push({ id: doc.id, title: data.title || data.name || doc.id, type: 'rhythm' });
  });
  
  const presetsSnap = await getDocs(collection(db, 'presets'));
  let presets = [];
  presetsSnap.forEach(doc => {
    const data = doc.data();
    presets.push({ id: doc.id, title: data.title || data.name || doc.id, type: 'preset' });
  });

  fs.writeFileSync('db_dump.json', JSON.stringify({ sections, rhythms, presets }, null, 2));
  console.log("Dump written to db_dump.json");
}

dump().catch(console.error);
