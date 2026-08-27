const admin = require('firebase-admin');

// Ensure you run this with GOOGLE_APPLICATION_CREDENTIALS set or firebase functions:shell
admin.initializeApp({
    projectId: 'o-girador-7828c'
});

async function findOpanije() {
  const bucket = admin.storage().bucket('o-girador-7828c.firebasestorage.app');
  console.log("Searching in bucket...", bucket.name);
  
  const [files] = await bucket.getFiles();
  let found = false;
  files.forEach(file => {
    if (file.name.toLowerCase().includes('opanij')) {
      console.log('FOUND:', file.name);
      found = true;
    }
  });
  
  if (!found) {
    console.log("Not found in Storage.");
  }
}

findOpanije().catch(console.error);
