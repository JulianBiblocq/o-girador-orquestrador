# Directives d'Agent — Orquestrador (Hub Central & Maître SSOT)

Ces directives définissent l'autorité centrale et les règles d'ingénierie pour le projet maître **Orquestrador**.

## 0. RÈGLE STRICTE DE NOMMAGE DES APPLICATIONS O GIRADOR
Utiliser exclusivement l'orthographe brésilienne pure (zéro apostrophe, zéro accent français parasite, zéro majuscule interne avant `-or`, zéro francisation `ch`, cédille obligatoire sur **Dançador**) :
- **O Girador** | **Orquestrador** | **Organizador** | **Sequenciador** | **Cantador** | **Dançador** | **Mostrador** | **Afinador** *(en conception, réservé sous `enabled: false` — aucun lien actif dans les menus utilisateurs)*

---
### 🏛️ Gouvernance Centralisée des Règles Firebase & Sécurité (Source Unique de Vérité — SSOT)
- **Autorité unique et exclusive :** Ce projet (**Orquestrador**) est l'**unique source de vérité (SSOT)** pour l'ensemble de l'écosystème **O Girador** (**Organizador**, **Mostrador**, **Sequenciador**, **Cantador**, **Dançador**, **Orquestrador**).
- **Fichiers maîtres sous gouvernance :**
  * `firestore.rules`
  * `storage.rules`
- **Responsabilité du déploiement des règles & Cloud Functions :**
  * Les règles de sécurité sont exclusivement pilotées, testées, modifiées et déployées depuis ce répertoire :
    ```bash
    firebase deploy --only firestore:rules
    firebase deploy --only storage
    ```
  * Les Cloud Functions de ce dépôt sont isolées sous `"codebase": "orquestrador"` :
    ```bash
    firebase deploy --only functions:orquestrador
    ```
- **Règles pour les agents & développeurs :**
  * Ne jamais déléguer ni autoriser la création ou le déploiement de règles `firestore.rules` ou `storage.rules` dans les applications satellites (`o-girador-organizador`, `o-girador-sequenciador`, `o-girador-vocal-lab`, `o-girador-dancador`).
  * Toute évolution des modèles de données ou droits d'accès requise par une application satellite doit être intégrée, testée et déployée depuis ce dépôt maître.
  * Préserver impérativement l'étanchéité multi-tenant et des rôles (`visiteur`, `eleve`/`membre`, `mestre`, `admin`, `super-admin`) ainsi que le verrouillage anti-escalade sur `users/{userId}`.

---
### 📐 Plafond Strict `< 145 Lignes` (`src/`) & Lexique Métier
- **Plafond strict `< 145 lignes` réelles** (`content.replace(/\r\n/g, '\n').replace(/\n$/, '').split('\n').length < 145`) pour tout fichier neuf ou déjà conforme dans `src/`, et **Mode Cliquet** (`newLines <= oldLines`) sur les fichiers legacy `>= 145` lignes (hors purs dictionnaires `src/locales/*`).
- **Lexique** : Interdiction du mot `Bateria` en contexte Maracatu (toujours `Batuque` / `Baque`) et interdiction du mot `IA` dans l'interface utilisateur.

---
## RÈGLE STRICTE DES PORTS LOCAUX (ÉCOSYSTÈME O GIRADOR)
- Cet agent doit respecter la cartographie des ports :
  * **Orquestrador** : `5170`
  * **Sequenciador** : `5174`
  * **Organizador** / **Mostrador** : `5175`
  * **Dançador** : `5176`
  * **Cantador** : `5177`
  * **Afinador** *(réservé, inactif)* : `5178`
- Interdiction de modifier le port local sans instruction explicite.
- `strictPort: true` est obligatoire : si le port est occupé, tuer les processus résiduels au lieu de changer de port.
- Les tests E2E et les liens de navigation locale doivent pointer rigoureusement vers ces ports dédiés.
