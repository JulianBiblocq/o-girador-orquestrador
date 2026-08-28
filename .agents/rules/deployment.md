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
