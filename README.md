# Wound – Gestion des blessures et états du corps (outil MJ)

Interface sombre pour gérer les blessures et états physiologiques des personnages en combat.

## Fonctionnalités

- **Compte et gestion** : création de compte MJ, joueurs, personnages, sauvegarde des combats, historique des blessures
- **Interface de combat** : silhouette interactive du corps (tête, torse, bras, avant-bras, mains, jambes, pieds)
- **Types de blessures** : coupures, perforations, contondant, projectiles, brûlures, chimique, articulaires, traumatismes internes
- **États physiologiques** : douleur, saignement, infection
- **Soins** : simples, médicaux, stabilisation
- **Effets visuels** : zone rouge/jaune/sombre, bandage, attelle, membre inutilisable
- **État global** : état général du corps, effets mobilité / combat / cognitifs

## Lancement avec Docker

```bash
docker compose up --build
```

Puis ouvrir **http://localhost:3002**

La base SQLite est persistée dans le volume `wound_data`.

## Développement local

### Prérequis

- Node.js 20+

### Tout lancer d’un seul terminal (recommandé)

À la racine du projet :

```bash
npm install
npm run dev
```

Cela initialise la base, démarre le serveur (port 3001) et le front (port 5173). Ouvrir **http://localhost:5173**.

### Lancer serveur et client séparément

```bash
# Terminal 1 – API
cd server && npm install && npm run init-db && npm run dev

# Terminal 2 – Frontend
cd client && npm install && npm run dev
```

### Tests API

Le serveur doit avoir été initialisé au moins une fois (`npm run init-db` ou `npm run dev`).

```bash
npm run test
```

Ou depuis `server/` : `npm run test`.

## Stack

- **Frontend** : React 18, Vite, React Router
- **Backend** : Node.js, Express
- **Base de données** : SQLite (better-sqlite3)
