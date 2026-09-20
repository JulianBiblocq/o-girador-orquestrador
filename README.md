# O Girador — Orquestrador

Hub central de gouvernance, d'onboarding et de sécurité pour l'écosystème **O Girador**.

## Source Unique de Vérité (SSOT) Firebase

Ce dépôt est l'**unique autorité de déploiement** pour toutes les règles de sécurité Firestore et Storage de l'écosystème :
- [`firestore.rules`](./firestore.rules) : Règles globales de contrôle d'accès, permissions étendues et étanchéité multi-tenants.
- [`storage.rules`](./storage.rules) : Règles de stockage Cloud Storage (isolation, anti-shadowing et suppression sécurisée).

Consultez le guide complet d'architecture : **[ARCHITECTURE.md](./ARCHITECTURE.md)**.

## Commandes Principales

```bash
# Installation des dépendances
npm ci

# Contrôle anti-régression des satellites (Garde-Fou SSOT)
npm run test:ssot

# Exécution des tests de sécurité sous émulateurs Firebase
npm run test:rules

# Déploiement en production des règles
npx firebase deploy --only firestore:rules,storage

# Lancement de l'application en développement
npm run dev
```

## Intégration Continue (CI)

Le workflow GitHub Actions [`.github/workflows/rules-guard.yml`](./.github/workflows/rules-guard.yml) valide automatiquement à chaque Pull Request :
1. L'intégrité du désarmement des configurations satellites (`test:ssot`).
2. La réussite intégrale des tests de règles sous émulateurs locaux (`test:rules`).
