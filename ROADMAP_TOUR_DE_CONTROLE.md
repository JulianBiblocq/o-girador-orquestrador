# 🗺️ CARTE D'INTENTION GLOBALE : O GIRADOR - TOUR DE CONTRÔLE SAAS

## VISION ARCHITECTURALE (MULTI-UNIVERS NATIVE)
Toutes les nouvelles structures de données (Packs, Concours, Fiches) doivent systématiquement inclure une clé `universeId` (ex: "maracatu", "capoeira", "samba") ou `isUniversal: true`. Le code doit permettre de cloisonner les affichages et les thèmes CSS selon l'univers de l'association connectée, sans dette technique.

## PHASE 1 : LE COCKPIT DU MESTRE (NAVIGATION & ACCUEIL)
- **L'App Switcher (Top Bar) :** Barre de navigation massive avec 4 gros boutons pour les applications (Organizador, Séquenceur, Dançador, Vitrine). Les applications non possédées restent visibles mais sont grisées (cadenas).
- **Le Dashboard Principal :** - *Zone d'Alertes* (ex: "Nouveaux membres à valider").
  - *Zone Santé* (effectifs, statistiques globales).
  - *Zone Abonnement* (gestion de la formule actuelle).

## PHASE 2 : LES VUES PAR APPLICATION (BIBLIOTHÈQUES & DEEP LINKS)
Pour chaque application possédée, affichage d'un panneau centralisé :
- **Top 3 & Catalogue :** Les 3 dernières créations (rythmes, événements, chorégraphies) affichées en belles cartes + bouton "Voir tout le catalogue".
- **Quick Actions (Deep Links) :** Raccourcis ouvrant directement la bonne application pré-chargée (ex: "Composer un rythme", "Créer un événement", "Rédiger la newsletter").

## PHASE 3 : LA BOUTIQUE OUVERTE (CROSS-SELLING & UPSELL)
- **Catalogue Global :** Tous les packs (Sons, Thèmes, QCM) de tous les univers sont visibles par tout le monde pour montrer la richesse de la plateforme.
- **Filtres & Modale d'Avertissement :** Mise en avant des packs compatibles avec l'univers de l'utilisateur. Si un utilisateur tente d'acheter un pack d'un autre univers (ex: Un groupe Maracatu achète un pack Samba), une modale l'avertit de la non-compatibilité et lui propose d'upgrader son abonnement (Upsell).

## PHASE 4 : L'ESPACE "TERREIRO" (COMMUNAUTÉ & RÉSEAU)
- **Réseau :** Annuaire des Vitrines des autres associations O Girador (filtré par univers).
- **Le Marché des Artisans :** Espace Partenaires mettant en avant les luthiers et créateurs avec des codes promos exclusifs pour les abonnés.
- **Partage & Gamification :** Partage privé ou public de rythmes/fiches culture. Système de concours mensuels créés par l'éditeur avec déblocage de thèmes visuels (ex: Mode Sombre, Mode Carnaval) à gagner.

## PHASE 5 : LE BACK-OFFICE ADMINISTRATEur (/admin)
Évolution du panneau d'administration de l'éditeur :
- Création et activation des concours thématiques (avec suivi du nombre d'associations actives pour définir le lancement).
- Modération de la bibliothèque communautaire.
- Ajout de fiches pour les Artisans/Partenaires.
- Attribution et gestion globale des Packs d'Add-ons par association.
