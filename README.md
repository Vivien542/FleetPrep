# FleetPrep — Gestion de flotte Europcar / Goldcar

Application React interne pour les préparateurs de véhicules à Toulouse Aéroport.

## Lancer le projet

```bash
npm install
npm run dev
```

Ouvrir : **http://localhost:5173**

## Comptes de démonstration

| Identifiant | Mot de passe | Rôle |
|-------------|-------------|------|
| Martin | admin123 | Chef d'équipe / Admin |
| Vivien | vivien123 | Préparateur |
| Damien | damien123 | Préparateur |
| Adrien | adrien123 | Préparateur |

## Stack

- React 19 + TypeScript + Vite
- React Router v7 (routes protégées)
- Zustand (état global : auth, flotte)
- Tailwind CSS v4
- qrcode.react, lucide-react, date-fns

## Architecture

```
src/
  app/            → Router (routes + gardes)
  components/
    ui/           → Badge, Button, Card, Input, Modal, Toast
    layout/       → Navbar, Layout
    vehicle/      → VehicleStatusBadges, AutonomieIndicator
  pages/          → Une page par route
  features/
    auth/         → authStore (Zustand)
    fleet/        → fleetStore (Zustand)
  repositories/   → vehicleRepository, userRepository, dayRepository
  types/          → Interfaces TypeScript centralisées
  data/           → seed.ts (données de démonstration)
  utils/          → format.ts (immat, dates, km)
  lib/            → cn.ts
```

## Persistance

Toutes les données sont en **localStorage** via les repositories.
Pour passer à un backend : remplacer uniquement les repositories, l'interface reste identique.

## Routes

```
/connexion            Connexion
/                     Dashboard accueil
/planning             Planning hebdomadaire
/flotte               Liste flotte + filtres
/flotte/ajouter       Ajout véhicule
/flotte/:id           Fiche véhicule
/flotte/:id/modifier  Modification véhicule
/preparation          Lancer une préparation
/preparation/:id      Préparation véhicule direct
/profil               Profil utilisateur
/admin                Administration (admin uniquement)
```

## Hypothèses de conception

1. Immatriculation stockée sans tirets (`AB123CD`), affichée avec tirets (`AB-123-CD`).
2. QR code encode `fleetprep://vehicle/:id` — à adapter avec l'URL de déploiement.
3. Autonomie : électrique = 0-100%, thermique = 0-8 (jauge graphique).
4. Auth locale MVP (nom + mot de passe) — remplacer par JWT en production.
5. Historique préparations : le plus récent est en index `[0]`.

## Pistes d'évolution

- Remplacer localStorage par une API REST (modifier uniquement les repositories)
- Authentification JWT
- Module dommages avec photos
- Planning éditable
- Statistiques avancées
- Application mobile native
