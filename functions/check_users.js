const admin = require('firebase-admin');

// Ensure you run this with GOOGLE_APPLICATION_CREDENTIALS set or firebase functions:shell
admin.initializeApp({
    projectId: 'o-girador-7828c'
});

async function findUserAndGroup() {
  const db = admin.firestore();
  const usersSnap = await db.collection('users').get();
  
  usersSnap.forEach(doc => {
    const data = doc.data();
    console.log(`User ${doc.id}: email=${data.email}, groupId=${data.groupId}, role=${data.role}`);
  });
}

findUserAndGroup().catch(console.error);
