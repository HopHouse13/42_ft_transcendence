# Backend — Othello (ft_transcendence)

Backend TypeScript/Express pour le jeu Othello. Développé et exécuté entièrement dans un conteneur Docker — aucune installation Node.js/npm requise sur la machine hôte.

## Stack technique

- **Runtime** : Node.js 20 (Alpine)
- **Langage** : TypeScript
- **Framework HTTP** : Express
- **Exécution en dev** : `tsx watch` (exécute le TypeScript directement, avec rechargement automatique à chaque sauvegarde)
- **Conteneurisation** : Docker + docker-compose, intégré au réseau `ft_transcendence_network` partagé avec le service `nginx`

## Démarrage

Depuis la racine du projet :

```sh
docker-compose up --build
```

Puis, pour installer les dépendances et lancer le serveur (première fois, ou après ajout d'une dépendance) :

```sh
docker-compose exec backend sh
npm install
npm run dev
```

Le serveur écoute sur `http://localhost:3000`.

## Structure du projet

```
backend/
├── Dockerfile
├── package.json
├── package-lock.json
├── .dockerignore
└── src/
    ├── app.ts                       # Point d'entrée : config Express + démarrage serveur
    ├── types/
    │   └── othello.types.ts         # Types partagés (Board, Cell, Move, GameState...)
    ├── game/
    │   └── othello.logic.ts         # Règles pures du jeu Othello (aucune dépendance HTTP)
    ├── controllers/
    │   └── game.controller.ts       # Pont entre HTTP et logique de jeu
    └── routes/
        └── game.routes.ts           # Déclaration des endpoints /api/game/*
```

### Pourquoi cette séparation ?

- **`game/`** contient uniquement de la logique métier pure (calcul de plateau, validité des coups, retournement de pions). Elle ne connaît rien d'Express ou du HTTP — elle est donc testable indépendamment et réutilisable si le framework change un jour.
- **`controllers/`** traduit les requêtes HTTP en appels à la logique de jeu, et renvoie des réponses JSON.
- **`routes/`** ne fait que déclarer quelles URL existent et vers quel controller elles pointent.
- **`types/`** centralise le vocabulaire commun (formes de données) utilisé par tous les autres fichiers.

## État de la partie

L'état du plateau et du joueur courant est actuellement stocké **en mémoire** (variables dans `game.controller.ts`), pas en base de données. C'est un choix volontaire à ce stade du projet : la partie base de données est développée séparément par un autre membre de l'équipe. Conséquence : redémarrer le serveur réinitialise la partie.

## API

Toutes les routes sont préfixées par `/api`.

### `GET /api/game`

Renvoie l'état actuel de la partie.

**Réponse :**
```json
{
  "board": [["empty", "empty", ...], ...],
  "currentPlayer": "black",
  "isGameOver": false,
  "scores": { "black": 2, "white": 2 }
}
```

### `POST /api/game/move`

Joue un coup pour le joueur courant.

**Corps de la requête :**
```json
{ "row": 2, "col": 3 }
```

**Réponse (succès)** : le nouvel état de la partie, au même format que `GET /api/game`.

**Réponse (erreur, coup invalide)** : statut `400`
```json
{ "error": "Coup invalide" }
```

Un coup n'est valide que s'il capture au moins un pion adverse (règle standard d'Othello). Si le joueur courant n'a aucun coup possible après le coup joué, le tour passe automatiquement au joueur suivant qui a un coup disponible.

### `POST /api/game/reset`

Réinitialise la partie au plateau de départ (4 pions centraux, `black` commence).

**Réponse :** l'état initial, au même format que `GET /api/game`.

## Logique du jeu (`othello.logic.ts`)

Fonctions principales, dans l'ordre logique d'utilisation :

| Fonction | Rôle |
|---|---|
| `createInitialBoard()` | Crée un plateau 8x8 vide avec les 4 pions de départ placés au centre |
| `validateMove(board, move, player)` | Vérifie si un coup est jouable, en testant les 8 directions autour de la case ; renvoie aussi la liste des pions qui seraient capturés |
| `applyMove(board, move, player, cellsToFlip)` | Place le pion et retourne les pions capturés ; ne fait aucune vérification (rôle de `validateMove`) |
| `getValidMoves(board, player)` | Liste tous les coups valides pour un joueur — utile pour détecter qu'un joueur doit passer son tour |
| `calculateScores(board)` | Compte les pions de chaque couleur |
| `isGameOver(board)` | Vraie si aucun des deux joueurs n'a de coup valide |
| `buildGameState(board, currentPlayer)` | Assemble l'état complet renvoyé au front-end |

Le plateau est traité de manière **immuable** : `applyMove` renvoie un nouveau plateau plutôt que de modifier celui reçu en paramètre, pour éviter des effets de bord si une autre partie du code garde une référence vers l'ancien état.

## Tester manuellement l'API

```sh
# État actuel
curl http://localhost:3000/api/game

# Jouer un coup
curl -X POST http://localhost:3000/api/game/move \
  -H "Content-Type: application/json" \
  -d '{"row":2,"col":3}'

# Recommencer une partie
curl -X POST http://localhost:3000/api/game/reset
```

## Pistes d'évolution (non implémentées)

- Endpoint `GET /api/game/valid-moves` pour exposer la liste des coups jouables au front-end (surlignage des cases).
- Champ explicite type `lastActionWasPass` quand un joueur est automatiquement passé faute de coup possible.
- Tests unitaires sur `othello.logic.ts` (logique pure, donc facilement testable sans serveur).
- Persistance en base de données (actuellement en mémoire uniquement).
