# 🗺️ Roadmap : Création de l'Espace Client SaaS (O Girador)

## Phase 1 : Fondations & Inscription (Le Provisioning)
**Objectif :** Permettre à un visiteur de créer son compte de manière autonome.

- [x] **Démasquer l'accès :** Rendre visible le bouton "Profil" (ou créer un bouton "Créer mon espace") sur le Hub public.
- [x] **Authentification :** Connecter ce bouton au flux d'inscription via Firebase Auth.
- [x] **Provisioning Firestore :** Créer l'automatisme qui, dès l'inscription, génère un `groupId` unique dans Firestore et attribue le rôle de "Mestre" à ce nouvel utilisateur.

## Phase 2 : La Boutique & Le Panier Dynamique
**Objectif :** Permettre au Mestre de faire son marché parmi tes offres.

- [ ] **Fichiers de données :** Configurer la lecture des offres depuis tes fichiers locaux (les forfaits dans `tarifs.json` et les futurs add-ons dans `packs.json`).
- [ ] **Interface Boutique :** Créer l'interface où le client peut sélectionner ses modules (ex: Séquenceur + Vitrine + Pack Rythmes).
- [ ] **Panier Latéral :** Développer le système de panier (tiroir latéral ou page dédiée) qui additionne dynamiquement le total des achats avant paiement.

## Phase 3 : L'Intégration Stripe & Le Back-End (Le Cœur du SaaS)
**Objectif :** Sécuriser les paiements et débloquer les accès automatiquement.

- [ ] **Initialisation Backend :** Configurer le projet pour utiliser les Firebase Cloud Functions (en s'appuyant sur ton plan Blaze existant).
- [ ] **Session de paiement :** Créer la Cloud Function qui génère une session "Stripe Checkout" dynamique à la validation du panier.
- [ ] **Le Webhook (L'écouteur) :** Créer la Cloud Function qui écoute les serveurs de Stripe pour capter le signal de "Paiement Réussi".
- [ ] **Déblocage Automatique :** Connecter ce Webhook à Firestore pour qu'il mette à jour instantanément les droits de l'association (ex: ajout des achats dans le tableau `unlockedPacks`).

## Phase 4 : Le Mini-Wizard d'Onboarding (L'Effet Waouh)
**Objectif :** Personnaliser l'expérience dès le retour du paiement.

- [ ] **Interface d'Accueil :** Créer un mini-formulaire de bienvenue qui s'affiche automatiquement lorsque le client est redirigé vers le Hub après son paiement Stripe.
- [ ] **Collecte des données clés :** Intégrer les 5 champs essentiels : Nom de l'association, Logo (téléchargement), Couleur principale, Numéro de téléphone, et E-mail de contact.
- [ ] **Injection Firestore :** Sauvegarder ces données dans le profil de l'association pour que le Manager et la Vitrine soient pré-configurés et personnalisés avant même leur première ouverture.

## Phase 5 : Le Tableau de Bord Client (L'Espace Mestre)
**Objectif :** Afficher un résumé valorisant et l'état des abonnements.

- [ ] **Vue d'ensemble :** Créer l'interface de l'espace client listant les abonnements actifs de l'association et leurs dates d'échéance.
- [ ] **Métriques de Valorisation (Analytics) :** Intégrer des statistiques gratifiantes remontées depuis Firestore (en excluant les métriques de "temps passé") :
  - **Le rayonnement :** Nombre de vues cumulées sur leur G-Rador Vitrine.
  - **La force du groupe :** Nombre de membres actifs inscrits.
  - **Le dynamisme :** Nombre d'événements créés.
  - **Le contenu :** Nombre de séquences ou chorégraphies débloquées.
