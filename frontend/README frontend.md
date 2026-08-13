# Frontend — Othello (ft_transcendence)

Frontend React/TypeScript pour le jeu Othello. Développé et exécuté entièrement dans un conteneur Docker — aucune installation Node.js/npm requise sur la machine hôte. Se connecte à l'API du backend Othello (voir `backend/README.md`).

## Stack technique

- **Runtime** : Node.js 20 (Alpine)
- **Langage** : TypeScript
- **Librairie UI** : React 18
- **Outil de build/dev** : Vite (serveur de dev avec rechargement instantané, bundler pour la prod)
- **Conteneurisation** : Docker + docker-compose, intégré au réseau `ft_transcendence_network` partagé avec `nginx` et `backend`

## Démarrage

Depuis la racine du projet :

```sh
docker-compose up --build
```

Le `Dockerfile` installe les dépendances et lance `npm run dev` automatiquement au démarrage du conteneur — aucune commande manuelle nécessaire.

Le serveur écoute sur `http://localhost:5173`.

Pour vérifier que le serveur a bien démarré sans entrer dans le conteneur :
```sh
docker-compose logs frontend
```

## Structure du projet

```
frontend/
├── Dockerfile
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .dockerignore
├── index.html
└── src/
    ├── main.tsx                     # Point d'entrée : monte React dans le DOM
    ├── App.tsx                      # Composant racine : état de la partie + orchestration
    ├── types/
    │   └── othello.types.ts         # Types partagés (Board, Cell, Move...)
    ├── api/
    │   └── gameApi.ts               # Fonctions fetch vers l'API backend
    └── components/
        ├── Board.tsx                # Affiche la grille 8x8
        ├── Cell.tsx                 # Affiche une case (vide/noir/blanc), cliquable
        └── ScoreBoard.tsx           # Affiche le score et le joueur courant
```

### Pourquoi cette séparation ?

- **`api/`** centralise tous les appels réseau vers le backend. Si l'URL ou le format de l'API change, une seule modification suffit ici plutôt que de chercher dans chaque composant.
- **`components/`** contient des blocs d'affichage réutilisables et indépendants : `Cell` ne connaît rien du plateau entier, `Board` ne connaît rien du score. Chacun reçoit ses données via des `props` (paramètres d'entrée) et ne gère que son propre affichage.
- **`App.tsx`** est le seul endroit qui détient l'état de la partie (`useState`) et qui décide quand aller chercher de nouvelles données (`useEffect`). Les composants enfants sont "bêtes" : ils affichent ce qu'on leur donne et remontent les clics via des fonctions (`onClick`, `onCellClick`).
- **`types/`** duplique volontairement les types du backend. Tant que front et back restent indépendants (pas de monorepo/package partagé), cette duplication est acceptable et attendue à ce stade du projet.

## Fonctionnement général

1. Au premier affichage (`useEffect` dans `App.tsx`), le front appelle `GET /api/game` pour récupérer l'état initial de la partie.
2. Le plateau reçu est stocké dans le `state` React (`useState`) et affiché via `Board`.
3. Un clic sur une case appelle `POST /api/game/move` avec les coordonnées jouées.
4. Le backend valide le coup, calcule les pions à retourner, et renvoie le nouvel état complet.
5. Le front remplace simplement son `state` par cette réponse — **il ne recalcule jamais lui-même les règles du jeu**. Le backend est l'unique source de vérité.

Ce choix est volontaire : garder toute la logique de jeu (validité des coups, retournement, score, fin de partie) côté backend évite les incohérences entre deux implémentations différentes des règles.

## Composants

### `Cell.tsx`
Composant le plus simple : reçoit une valeur (`empty`/`black`/`white`) et une fonction `onClick`. Affiche un pion coloré ou rien. Ne contient aucune logique de jeu.

### `Board.tsx`
Affiche la grille 8x8 en parcourant le tableau `board` reçu en props. Pour chaque case, transmet la coordonnée `(row, col)` cliquée au composant parent via `onCellClick`.

### `ScoreBoard.tsx`
Affichage pur des scores et du joueur courant, sans état ni logique propre.

### `App.tsx`
Le "cerveau" de l'interface :
- `useState<GameState | null>` : stocke l'état complet de la partie (`null` tant que l'API n'a pas encore répondu).
- `useEffect(() => {...}, [])` : déclenche l'appel `GET /api/game` une seule fois, au montage du composant.
- `handleCellClick` : appelle `POST /api/game/move`, met à jour le `state` avec la réponse, ou affiche une erreur si le coup est invalide (`400`).
- `handleReset` : appelle `POST /api/game/reset` pour recommencer une partie.

## Connexion à l'API backend (CORS)

Le front (`localhost:5173`) et le back (`localhost:3000`) sont deux origines différentes du point de vue du navigateur. Sans configuration particulière, les requêtes `fetch` seraient bloquées par la politique CORS du navigateur.

Le backend autorise explicitement les requêtes venant du frontend via le middleware `cors` (voir `backend/src/app.ts`) :
```typescript
app.use(cors({ origin: 'http://localhost:5173' }));
```

**Vérification** : dans les outils de développement du navigateur (onglet Réseau), les requêtes vers `localhost:3000` doivent apparaître avec un statut `200`, et aucune erreur CORS ne doit apparaître dans l'onglet Console.

## Tester manuellement

1. Lancer `docker-compose up --build`.
2. Ouvrir `http://localhost:5173`.
3. Cliquer sur une case adjacente aux 4 pions centraux (ex : ligne 2, colonne 3) pour jouer un premier coup valide.
4. Vérifier dans l'onglet Réseau du navigateur qu'une requête `POST /api/game/move` est bien envoyée et reçoit une réponse JSON.
5. Cliquer sur "Recommencer" pour vérifier l'appel à `POST /api/game/reset`.

## Pistes d'évolution (non implémentées)

- Surligner visuellement les cases jouables (nécessiterait un endpoint `GET /api/game/valid-moves` côté backend).
- Gérer explicitement l'affichage d'un message "vous devez passer votre tour" si le joueur courant n'a aucun coup valide.
- Écran de fin de partie plus visible (actuellement un simple texte `isGameOver`).
- Gestion des erreurs réseau (backend éteint, timeout) — actuellement seules les erreurs `400` sont gérées.
- Tests de composants (ex: avec Vitest + React Testing Library).
