---
trigger: always_on
---
# Déploiement — Orquestrador (Maître SSOT)

Ce projet est hébergé sur deux plateformes simultanément :
1. **GitHub Pages** (via le paquet `gh-pages`)
2. **Firebase Hosting** (`site: "o-girador"`)

## Instructions de déploiement
Lorsque l'utilisateur demande de compiler et déployer le projet, déployez sur **les deux environnements** :
1. Exécutez `npm run deploy` (build + GitHub Pages + Firebase Hosting).
2. Pour déployer uniquement le frontend Firebase : `firebase deploy --only hosting`.
3. Pour déployer les Cloud Functions isolées d'**Orquestrador** : `firebase deploy --only functions:orquestrador` (ne jamais lancer `firebase deploy --only functions` sans qualifier la codebase).

## Règles de Sécurité Firebase — Unique Source de Vérité (SSOT)
Ce projet (**Orquestrador**) est l'**unique source de vérité (SSOT)** pour les règles de sécurité de l'ensemble de l'écosystème **O Girador** :
- `firestore.rules`
- `storage.rules`

Le déploiement des règles s'effectue exclusivement depuis ce répertoire :
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```
*(Interdiction formelle pour les applications satellites **Organizador**, **Mostrador**, **Sequenciador**, **Cantador** et **Dançador** de détenir, modifier ou déployer des règles).*
