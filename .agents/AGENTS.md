# Directives d'Agent — Orchestrad'Or (Hub Central & Maître SSOT)

Ces directives définissent l'autorité centrale et les règles d'ingénierie pour le projet maître **Orchestrad'Or**.

---
### 🏛️ Gouvernance Centralisée des Règles Firebase & Sécurité (Source Unique de Vérité — SSOT)
- **Autorité unique et exclusive :** Ce projet (**Orchestrad'Or**) est l'**unique source de vérité (SSOT)** pour l'ensemble de l'écosystème O Girador (Organizad'Or, Séquenciador, Dançador, Orchestrad'Or).
- **Fichiers maîtres sous gouvernance :**
  * `firestore.rules`
  * `storage.rules`
- **Responsabilité du déploiement des règles :**
  * Les règles de sécurité sont exclusivement pilotées, testées, modifiées et déployées depuis ce répertoire.
  * Déploiement autorisé uniquement ici :
    ```bash
    firebase deploy --only firestore:rules
    firebase deploy --only storage
    ```
- **Règles pour les agents IA & développeurs :**
  * Ne jamais déléguer ni autoriser la création ou le déploiement de règles `firestore.rules` ou `storage.rules` dans les applications satellites (**o-girador-organizador**, **o-girador-sequenciador**, **o-girador-dancador**).
  * Toute évolution des modèles de données ou droits d'accès requise par une application satellite (ex: nouveaux rôles, collections partagées, flags `canWrite*`) doit être intégrée, testée et déployée depuis ce dépôt maître.
  * Préserver impérativement l'étanchéité des rôles (`visiteur`, `eleve`/`membre`, `mestre`, `admin`, `super-admin`) et le verrouillage anti-escalade sur les profils utilisateurs (`users/{userId}`).
