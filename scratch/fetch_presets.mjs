import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCTvRPj2p3zdIfEjftXoSvRJ43Uy0EfPMY",
  authDomain: "o-girador-7828c.firebaseapp.com",
  projectId: "o-girador-7828c",
  storageBucket: "o-girador-7828c.firebasestorage.app",
  messagingSenderId: "488703864701",
  appId: "1:488703864701:web:50b8cbcd1ca4038e15e614"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  console.log("Fetching presets...");
  try {
    const snap = await getDocs(collection(db, 'presets'));
    console.log(`Found ${snap.size} presets in total.`);
    snap.forEach(doc => {
      const data = doc.data();
      console.log(`- ${doc.id}: ownerId=${data.ownerId}, visibility=${data.visibility}, name=${data.name}`);
    });
  } catch (err) {
    console.error("Error fetching presets:", err);
  }
}

run();
