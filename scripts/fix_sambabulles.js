/**
 * Script de migration et nettoyage pour l'association Samb'à Bulles
 * 1. Lit associations/ZIXsP8VhgoGPqeGt2Syv
 * 2. Écrit les données complètes dans associations/sambabulles (universeId: 'batucada', id: 'sambabulles')
 * 3. Met à jour le profil de Sandra (users/Yt00xGmtG1X3oDmeJ97ieFm1BZr2) avec groupId: 'sambabulles'
 * 4. Supprime associations/ZIXsP8VhgoGPqeGt2Syv et associations/zixsp8vhgogpqegt2syv
 */

import fs from 'fs';
import path from 'path';

const PROJECT_ID = 'o-girador-7828c';
const BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

function getAccessToken() {
  const configPath = path.join(process.env.USERPROFILE || process.env.HOME || '', '.config', 'configstore', 'firebase-tools.json');
  if (!fs.existsSync(configPath)) {
    throw new Error(`Fichier firebase-tools.json introuvable à : ${configPath}`);
  }
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const token = config.tokens?.access_token;
  if (!token) {
    throw new Error("Aucun access_token trouvé dans firebase-tools.json. Veuillez exécuter 'firebase login'.");
  }
  return token;
}

async function runMigration() {
  const token = getAccessToken();
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  console.log('🚀 Démarrage de la migration Samb\'à Bulles...');

  // 1. Lire associations/ZIXsP8VhgoGPqeGt2Syv
  console.log('📖 Lecture de associations/ZIXsP8VhgoGPqeGt2Syv...');
  const oldDocRes = await fetch(`${BASE_URL}/associations/ZIXsP8VhgoGPqeGt2Syv`, { headers });
  if (!oldDocRes.ok) {
    throw new Error(`Impossible de lire ZIXsP8VhgoGPqeGt2Syv: ${oldDocRes.status} ${await oldDocRes.text()}`);
  }
  const oldDoc = await oldDocRes.json();
  const fields = oldDoc.fields || {};

  console.log(`✅ Document source récupéré : "${fields.name?.stringValue}" (${fields.contactEmail?.stringValue})`);

  // 2. Mettre à jour les champs pour la nouvelle association canonique 'sambabulles'
  fields.id = { stringValue: 'sambabulles' };
  fields.groupId = { stringValue: 'sambabulles' };
  fields.universeId = { stringValue: 'batucada' };

  // Vérifier et s'assurer que universeAccess.batucada est à true
  if (fields.universeAccess?.mapValue?.fields) {
    fields.universeAccess.mapValue.fields.batucada = { booleanValue: true };
  }

  // 3. Écrire dans associations/sambabulles via PATCH (create or update)
  console.log('✍️ Écriture dans associations/sambabulles...');
  const createNewRes = await fetch(`${BASE_URL}/associations/sambabulles`, {
    method: 'PATCH',
    headers,
    body: JSON.stringify({ fields })
  });
  if (!createNewRes.ok) {
    throw new Error(`Erreur lors de la création de associations/sambabulles: ${createNewRes.status} ${await createNewRes.text()}`);
  }
  console.log('✅ Document associations/sambabulles créé avec succès !');

  // 4. Mettre à jour le profil de Sandra
  // Chercher d'abord par UID Yt00xGmtG1X3oDmeJ97ieFm1BZr2 (avec zéros) ou par email
  const sandraUids = ['Yt00xGmtG1X3oDmeJ97ieFm1BZr2', 'YtO0xGmtG1X3oDmeJ97ieFm1BZr2'];
  let sandraUpdated = false;

  for (const uid of sandraUids) {
    const userRes = await fetch(`${BASE_URL}/users/${uid}`, { headers });
    if (userRes.ok) {
      console.log(`👤 Profil Sandra trouvé sous l'UID: ${uid}. Mise à jour de groupId -> 'sambabulles'...`);
      const patchRes = await fetch(`${BASE_URL}/users/${uid}?updateMask.fieldPaths=groupId`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          fields: {
            groupId: { stringValue: 'sambabulles' }
          }
        })
      });
      if (patchRes.ok) {
        console.log(`✅ Profil utilisateur ${uid} mis à jour avec groupId='sambabulles'.`);
        sandraUpdated = true;
      } else {
        console.error(`❌ Échec de mise à jour pour ${uid}: ${await patchRes.text()}`);
      }
    }
  }

  if (!sandraUpdated) {
    console.log('🔍 Recherche alternative de Sandra par email: sambabulles@yahoo.fr...');
    const queryRes = await fetch(`${BASE_URL}:runQuery`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: 'users' }],
          where: {
            fieldFilter: {
              field: { fieldPath: 'email' },
              op: 'EQUAL',
              value: { stringValue: 'sambabulles@yahoo.fr' }
            }
          }
        }
      })
    });
    if (queryRes.ok) {
      const results = await queryRes.json();
      for (const item of results) {
        if (item.document?.name) {
          const docPath = item.document.name.split('/documents/')[1];
          console.log(`👤 Mise à jour de ${docPath} avec groupId='sambabulles'...`);
          await fetch(`${BASE_URL}/${docPath}?updateMask.fieldPaths=groupId`, {
            method: 'PATCH',
            headers,
            body: JSON.stringify({ fields: { groupId: { stringValue: 'sambabulles' } } })
          });
          sandraUpdated = true;
        }
      }
    }
  }

  // 5. Supprimer les deux documents obsolètes
  const docsToDelete = ['ZIXsP8VhgoGPqeGt2Syv', 'zixsp8vhgogpqegt2syv'];
  for (const docId of docsToDelete) {
    console.log(`🗑️ Suppression de associations/${docId}...`);
    const delRes = await fetch(`${BASE_URL}/associations/${docId}`, {
      method: 'DELETE',
      headers
    });
    if (delRes.ok) {
      console.log(`✅ associations/${docId} supprimé avec succès.`);
    } else if (delRes.status === 404) {
      console.log(`ℹ️ associations/${docId} n'existait pas ou déjà supprimé.`);
    } else {
      console.warn(`⚠️ Avertissement lors de la suppression de associations/${docId}: ${delRes.status} ${await delRes.text()}`);
    }
  }

  console.log('🎉 Migration Samb\'à Bulles terminée avec succès !');
}

runMigration().catch(err => {
  console.error('💥 Erreur fatale durant la migration :', err);
  process.exit(1);
});
