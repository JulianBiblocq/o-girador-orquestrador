# Architecture de Sécurité Firebase : Orquestrador SSOT

Ce document consigne la gouvernance de sécurité centralisée pour l'écosystème applicatif **O Girador** (Orquestrador, Séquenciad'Or, Organizad'Or, Dançad'Or).

---

## 1. Gouvernance & Source Unique de Vérité (SSOT)

Pour éradiquer les régressions de permissions causées par des déploiements concurrents ou indépendants depuis les applications satellites, **`o-girador-orquestrador` est établi comme l'unique autorité et la Source Unique de Vérité (SSOT)** pour l'ensemble des règles Firebase distantes :
- **Règles Firestore** : [`firestore.rules`](./firestore.rules)
- **Règles Cloud Storage** : [`storage.rules`](./storage.rules)

Toute modification structurelle ou d'accès aux données doit être rédigée, testée sous émulateur et déployée **exclusivement depuis ce dépôt**.

---

## 2. Règle d'Or d'Écosystème

> **⚠️ RÈGLE D'OR ABSOLUE**  
> Il est **strictement interdit** de réintroduire les sections `"firestore"` ou `"storage"` dans les fichiers `firebase.json` des projets satellites (`o-girador-sequenciador`, `o-girador-organizador`, `o-girador-dancador`).

Les satellites sont configurés exclusivement pour leurs déploiements applicatifs :
- **Séquenciad'Or** : `hosting`
- **Organizad'Or** : `hosting`, `functions` (SSR)
- **Dançad'Or** : `hosting`

Toute tentative de réintroduction déclenche l'échec immédiat de la suite de tests et bloque la pipeline CI.

---

## 3. Archivage des Règles Fantômes Satellites

Afin d'éviter que les extensions d'IDE (Firebase Toolkit, ESLint, Linters) ou les assistants IA ne ciblent par inadvertance des fichiers de sécurité obsolètes, tous les fichiers de règles résiduels dans les satellites ont été renommés en extension non exécutable :
- `o-girador-sequenciador/firestore.rules.DEPRECATED`
- `o-girador-sequenciador/storage.rules.DEPRECATED`
- `o-girador-organizador/storage.rules.DEPRECATED`
- `o-girador-organizador/ogirador-backend/firestore.rules.DEPRECATED`

L'unique couple de fichiers `.rules` actif de tout l'écosystème réside à la racine d'`o-girador-orquestrador`.

---

## 4. Commandes Maîtresses

Toutes les opérations de contrôle et de déploiement s'exécutent depuis le répertoire racine d'`o-girador-orquestrador` :

### A. Contrôle Anti-Régression des Satellites
```bash
npm run test:ssot
```
Vérifie que :
1. Aucun `firebase.json` satellite ne comporte de section `firestore` ou `storage`.
2. Aucun fichier de règle actif résiduel n'est présent hors d'Orquestrador.

### B. Tests Unitaires sous Émulateurs Firebase
```bash
npm run test:rules
```
Démarre les émulateurs locaux Firestore (port 8080) et Storage (port 9199) en mode headless et exécute la suite de tests unitaires Vitest (`__tests__/security-rules.test.js`) validant :
- L'isolation multi-tenant stricte par `groupId`.
- L'anti-shadowing et la confidentialité des justificatifs de notes de frais (`expenses`).
- Le découpage sûr des permissions de suppression (`safe delete`).

### C. Déploiement en Production
```bash
npx firebase deploy --only firestore:rules,storage
```
Publie les règles unifiées sur le projet Firebase partagé `o-girador-7828c`.

---

## 5. Automatisation CI / CD (GitHub Actions)

Le workflow [`.github/workflows/rules-guard.yml`](./.github/workflows/rules-guard.yml) s'exécute automatiquement sur chaque `push` et `pull_request` ciblant `main` ou `master` :
1. **Extraction multi-dépôts** d'Orquestrador et des satellites.
2. **Environnement Java 21 & Node.js 20 LTS** pour l'exécution headless.
3. **Exécution du garde-fou** `npm run test:ssot` (bloquant en cas de dérive).
4. **Exécution de la suite de tests** `npm run test:rules` sous émulateurs Firebase.
