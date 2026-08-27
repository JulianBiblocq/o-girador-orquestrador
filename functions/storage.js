const admin = require('firebase-admin');
admin.initializeApp({
  storageBucket: "o-girador-7828c.firebasestorage.app"
});

async function listStorage() {
  const bucket = admin.storage().bucket();
  const [files] = await bucket.getFiles({ prefix: 'documents/' });
  
  const sequencerFiles = files.filter(f => f.name.includes('sequencer') || f.name.toLowerCase().includes('opanij'));
  console.log("Found files:");
  sequencerFiles.forEach(f => console.log(f.name));
  
  if (sequencerFiles.length === 0) {
     const [allFiles] = await bucket.getFiles();
     console.log("All files containing Opanij:");
     allFiles.forEach(f => {
       if (f.name.toLowerCase().includes('opanij')) console.log(f.name);
     });
  }
}

listStorage().catch(console.error);
