// scripts/verify-ssot-guard.js — Audit SSOT Firebase exécuté depuis Orquestrador & CI
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SATELLITE_REPOS = [
  'o-girador-sequenciador',
  'o-girador-organizador',
  'o-girador-vocal-lab',
  'o-girador-dancador'
];

const IGNORE_DIRS = new Set(['node_modules', '.git', 'dist', 'build', '.firebase', 'coverage']);
const RULES_FILE_RE = /^[^/]*(?:firestore|storage)[^/]*\.rules(?:\..+)?$/i;

function walkSatelliteFiles(dir, onFile) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkSatelliteFiles(full, onFile);
    else onFile(full, entry.name);
  }
}

let hasErrors = false;
console.log('🔍 Audit SSOT des applications satellites (firebase.json & scan récursif *.rules*)...\n');

const candidateRoots = [
  process.env.SATELLITES_ROOT,
  path.resolve(process.cwd(), '..'),
  path.resolve(__dirname, '..', '..'),
  process.cwd()
].filter(Boolean);

const rootDir =
  candidateRoots.find((root) => SATELLITE_REPOS.some((repo) => fs.existsSync(path.resolve(root, repo)))) ||
  path.resolve(__dirname, '..', '..');

// 0. Vérification de l'autorité SSOT locale d'Orquestrador
const ssotDir = path.resolve(__dirname, '..');
for (const masterRule of ['firestore.rules', 'storage.rules', 'firebase.json']) {
  const masterPath = path.join(ssotDir, masterRule);
  if (!fs.existsSync(masterPath)) {
    console.error(`❌ [ERREUR SSOT] Fichier maître manquant dans Orquestrador : ${masterRule}`);
    hasErrors = true;
  }
}

// 1. Audit récursif de chaque dépôt satellite présent
for (const repo of SATELLITE_REPOS) {
  const repoDir = path.resolve(rootDir, repo);
  if (!fs.existsSync(repoDir)) {
    console.warn(`⚠️ [SKIP] Dépôt non extrait dans l'espace courant : ${repo}`);
    continue;
  }

  let rulesFound = 0;
  walkSatelliteFiles(repoDir, (fullPath, fileName) => {
    const relPath = path.relative(rootDir, fullPath).replace(/\\/g, '/');

    if (fileName.toLowerCase() === 'firebase.json') {
      try {
        const config = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        const forbiddenKeys = ['firestore', 'storage'].filter((k) => k in config);
        if (forbiddenKeys.length > 0) {
          console.error(`❌ [VIOLATION SSOT] ${relPath} contient des sections interdites : ${forbiddenKeys.join(', ')}`);
          hasErrors = true;
        } else {
          console.log(`✅ [OK] ${relPath} désarmé (sections actives : ${Object.keys(config).join(', ') || 'aucune'})`);
        }
      } catch (err) {
        console.error(`❌ [ERREUR] Impossible d'analyser ${relPath} :`, err.message);
        hasErrors = true;
      }
    }

    if (RULES_FILE_RE.test(fileName)) {
      rulesFound++;
      console.error(`❌ [VIOLATION SSOT] Fichier de règle fantôme ou déprécié détecté : ${relPath}`);
      hasErrors = true;
    }
  });

  if (rulesFound === 0) {
    console.log(`✅ [CLEAN] ${repo} : aucun fichier *.rules* résiduel.`);
  }
}

if (hasErrors) {
  console.error('\n🚨 Échec : Une application satellite risque d\'écraser ou concurrencer les règles SSOT.');
  process.exit(1);
} else {
  console.log('\n✨ Contrôle validé : Orquestrador demeure l\'unique SSOT.');
  process.exit(0);
}
