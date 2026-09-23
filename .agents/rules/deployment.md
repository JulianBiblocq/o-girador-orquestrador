---
description: Règles pour le déploiement du projet O Girador Mestre
---

# Déploiement

Ce projet est hébergé sur deux plateformes simultanément :
1. **GitHub Pages** (via le paquet `gh-pages`)
2. **Firebase Hosting**

## Instructions de déploiement

Lorsque l'utilisateur demande de compiler et de déployer le projet (ou lorsqu'il demande un "push et deploy"), vous DEVEZ vous assurer de déployer sur **les deux environnements**.

1. Exécutez le script défini dans `package.json` : `npm run deploy` (qui s'occupe du build et de GitHub Pages).
2. Ensuite, vous DEVEZ déployer sur Firebase Hosting via la commande : `firebase deploy --only hosting`. 
*(Note: Si vous utilisez PowerShell et qu'il y a des restrictions d'exécution, utilisez `cmd /c npx firebase-tools deploy --only hosting` ou `cmd /c firebase deploy --only hosting`)*.

Ne présumez jamais qu'un seul déploiement suffit. Vérifiez toujours que les deux environnements sont à jour.

## Règles de Sécurité Firebase — Unique Source de Vérité (SSOT)
Ce projet (**Orchestrad'Or**) est l'**unique source de vérité (SSOT)** pour les règles de sécurité de l'ensemble de l'écosystème O Girador :
- `firestore.rules`
- `storage.rules`

Le déploiement des règles s'effectue exclusivement depuis ce répertoire :
```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
```
*(Interdiction formelle pour les applications satellites Organizad'Or, Séquenciad'Or et Dançador de modifier ou déployer des règles).*

