// scripts/verify-ssot-guard.js
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SATELLITES = [
  { name: 'o-girador-sequenciador', relPath: 'o-girador-sequenciador/firebase.json' },
  { name: 'o-girador-organizador', relPath: 'o-girador-organizador/firebase.json' },
  { name: 'o-girador-organizador (backend)', relPath: 'o-girador-organizador/ogirador-backend/firebase.json' },
  { name: 'o-girador-dancador', relPath: 'o-girador-dancador/firebase.json' }
];

let hasErrors = false;
console.log('🔍 Audit des fichiers de configuration satellites...\n');

// Résolution de la racine contenant les satellites
const candidateRoots = [
  process.env.SATELLITES_ROOT,
  path.resolve(process.cwd(), '..'),
  path.resolve(__dirname, '..', '..'),
  process.cwd()
].filter(Boolean);

const rootDir = candidateRoots.find(root => 
  SATELLITES.some(s => fs.existsSync(path.resolve(root, s.relPath)))
) || path.resolve(__dirname, '..', '..');

// 1. Audit des sections interdites dans les firebase.json satellites
SATELLITES.forEach(({ name, relPath }) => {
  const firebaseJsonPath = path.resolve(rootDir, relPath);

  if (!fs.existsSync(firebaseJsonPath)) {
    console.warn(`⚠️ [SKIP] Introuvable : ${relPath}`);
    return;
  }

  try {
    const raw = fs.readFileSync(firebaseJsonPath, 'utf-8');
    const config = JSON.parse(raw);
    const forbiddenKeys = ['firestore', 'storage'].filter((k) => k in config);

    if (forbiddenKeys.length > 0) {
      console.error(`❌ [VIOLATION SSOT] ${relPath} contient des sections interdites : ${forbiddenKeys.join(', ')}`);
      hasErrors = true;
    } else {
      console.log(`✅ [OK] ${name} est correctement désarmé (sections actives : ${Object.keys(config).join(', ') || 'aucune'})`);
    }
  } catch (err) {
    console.error(`❌ [ERREUR] Impossible d'analyser ${relPath} :`, err.message);
    hasErrors = true;
  }
});

// 2. Audit anti-règles fantômes (vérifier qu'aucun fichier physique actif n'a été réintroduit)
console.log('\n🔍 Audit anti-règles fantômes actives dans les satellites...');
const ghostRules = [
  'o-girador-sequenciador/firestore.rules',
  'o-girador-sequenciador/storage.rules',
  'o-girador-organizador/storage.rules',
  'o-girador-organizador/ogirador-backend/firestore.rules'
];

ghostRules.forEach((ruleRelPath) => {
  const fullPath = path.resolve(rootDir, ruleRelPath);
  if (fs.existsSync(fullPath)) {
    console.error(`❌ [VIOLATION SSOT] Fichier de règle actif résiduel : ${ruleRelPath}`);
    console.error(`   Ce fichier doit être renommé en ${ruleRelPath}.DEPRECATED pour éviter tout ciblage IDE/IA.`);
    hasErrors = true;
  } else {
    const deprecatedPath = `${fullPath}.DEPRECATED`;
    if (fs.existsSync(deprecatedPath)) {
      console.log(`✅ [ARCHIVÉ] ${ruleRelPath} est bien archivé sous .DEPRECATED`);
    }
  }
});

if (hasErrors) {
  console.error('\n🚨 Échec : Une application satellite risque d\'écraser les règles distantes.');
  process.exit(1);
} else {
  console.log('\n✨ Contrôle validé : Orquestrador demeure l\'unique SSOT.');
  process.exit(0);
}
