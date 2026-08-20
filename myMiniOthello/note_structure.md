# 📚 Réorganisation du code Othello - Guide complet

*Date : 18 août 2026*  
*Projet : myMiniOthello*  
*Objectif : Découper `App.tsx`/`App2.tsx` en plusieurs fichiers modulaires*

---

## 📌 Sommaire

1. [Principes de découpage](#-principes-de-découpage)
2. [Méthodologie de réflexion](#-méthodologie-de-réflexion)
3. [Structure de fichiers proposée](#-structure-de-fichiers-proposée)
4. [Contenu de chaque fichier](#-contenu-de-chaque-fichier)
5. [Avantages de la réorganisation](#-avantages-de-la-réorganisation)
6. [Prochaines étapes](#-prochaines-étapes)
7. [Bonus : Améliorations possibles](#-bonus-améliorations-possibles)

---

## 📌 Principes de découpage

### 1. Principe de Responsabilité Unique (SRP)
> *"Un module/fichier ne doit avoir qu'une seule raison de changer"*

**→ Application :**
- Un fichier = **une seule responsabilité claire**
- Exemples :
  - `types.ts` → Définir les types et interfaces
  - `gameLogic.ts` → Logique métier (règles du jeu)
  - `Square.tsx` → Affichage d'une case
  - `Board.tsx` → Gestion du plateau

---

### 2. Séparation des Préoccupations (SoC)
> *"Séparer la logique métier, la présentation et les données"*

**3 couches distinctes :**

| Couche | Contenu | Exemples |
|--------|---------|----------|
| **Données/Types** | Types, interfaces, constants | `Pawn`, `BoardState`, `SquareProps` |
| **Logique Métier** | Fonctions pures, algorithmes | `isValidMove`, `getFlippedPawns` |
| **Présentation** | Composants React, UI | `Square`, `Board`, `Layout` |
| **Orchestration** | Gestion d'état, coordination | `App.tsx` (historique, navigation) |

---

### 3. Critères pour identifier un nouveau fichier

| **Indice** | **Action** | **Exemple dans ton code** |
|------------|------------|---------------------------|
| **Trop long** | > 300-400 lignes → Découper | `App2.tsx` fait ~250 lignes, mais avec plusieurs composants |
| **Plusieurs composants** | 1 composant = 1 fichier | `Square`, `Board`, `Layout` sont dans le même fichier |
| **Fonctions réutilisables** | Extraire dans un module | `getFlippedPawns`, `isValidMove` (utilisables hors React) |
| **Types partagés** | Centraliser dans `types.ts` | `Pawn`, `BoardState`, `Player` |
| **Logique complexe** | Isoler dans des services | Règles Othello (8 directions, retournement de pions) |

---

### 4. Règles pratiques pour React/TypeScript

✅ **DOIT** :
- Un composant React = **1 fichier** (même s'il est petit)
- Les **types/Interfaces** partagés → dans `types/` ou à la racine
- La **logique pure** (sans React) → dans des fichiers `.ts` (pas `.tsx`)
- Les **constantes** (ex: `initialBoard`) → dans `constants.ts`

❌ **ÉVITER** :
- Des fichiers de plus de **400-500 lignes**
- Mélanger **UI + logique métier** dans le même composant
- Dupliquer des types ou fonctions entre fichiers

---

---

## 🧠 Méthodologie de réflexion

### Comment choisir le découpage ?

1. **Identifier les responsabilités**
   - Quels sont les **rôles** dans ton code ?
     - Affichage d'une case → `Square`
     - Gestion du plateau → `Board`
     - Logique des règles → `gameLogic`
     - Gestion de l'historique → `App`

2. **Repérer les dépendances**
   - Quels fichiers **importent** quoi ?
     - `Board` dépend de `Square` et de `gameLogic`
     - `App` dépend de `Board` et de `GameInfo`

3. **Séparer le pur du non-pur**
   - **Fonctions pures** (pas de `useState`, pas de React) → dans `.ts`
   - **Composants React** → dans `.tsx`

4. **Centraliser ce qui est partagé**
   - Types utilisés par plusieurs fichiers → dans `types/`
   - Constantes → dans `constants/`

5. **Valider la granularité**
   - Un fichier doit être **assez petit** pour être lu en 1-2 minutes
   - Mais **assez gros** pour avoir du sens seul

---

---

## 📁 Structure de fichiers proposée

Voici l'arborescence recommandée pour ton projet Othello :

```
src/
├── types/
│   └── gameTypes.ts          # Tous les types et interfaces
├── logic/
│   └── gameLogic.ts          # Fonctions pures (règles du jeu)
├── constants/
│   └── gameConstants.ts      # initialBoard, directions, etc.
├── components/
│   ├── Layout.tsx            # Structure header/main/footer
│   ├── Square.tsx            # Une case du plateau
│   ├── Board.tsx             # Plateau de jeu (utilise gameLogic)
│   ├── GameInfo.tsx          # Historique des coups
│   └── StatusBar.tsx         # Barre d'état (score, tour)
└── App.tsx                   # Composant racine (orchestration)
```

---

---

## 📄 Contenu de chaque fichier

---

### 1. `src/types/gameTypes.ts`
*Tous les types et interfaces partagés par l'application.*

```typescript
/**
 * Types pour le jeu Othello (Reversi)
 */

/** Représente un pion ou une case vide */
export type Pawn = 'X' | 'O' | null;

/** État du plateau (64 cases) */
export type BoardState = Pawn[];

/** Direction (délta ligne, déltra colonne) pour vérifier les pions adjacents */
export type Direction = [number, number];

/** Joueur actuel */
export type Player = 'X' | 'O';

// ===== INTERFACES =====

/** Props pour le composant Square */
export interface SquareProps {
    /** Valeur de la case : 'X' (noir), 'O' (blanc) ou null (vide) */
    value: Pawn;
    /** Fonction appelée lors du clic sur la case */
    onSquareClick: () => void;
    /** Indique si un coup est possible à cette position */
    isPossibleMove: boolean;
}

/** Props pour le composant Board */
export interface BoardProps {
    /** Indique si c'est au tour des noirs (X) */
    xIsNext: boolean;
    /** État actuel du plateau */
    squares: BoardState;
    /** Fonction appelée après un coup valide */
    onPlay: (squares: BoardState) => void;
}

/** Props pour le composant GameInfo */
export interface GameInfoProps {
    history: BoardState[];
    currentMove: number;
    ascending: boolean;
    onReverse: () => void;
    onJumpTo: (move: number) => void;
}
```

---

### 2. `src/constants/gameConstants.ts`
*Les données statiques qui ne changent pas pendant l'exécution.*

```typescript
import { BoardState, Direction } from "../types/gameTypes";

/** Toutes les directions possibles pour vérifier les pions (8 directions) */
export const DIRECTIONS: Direction[] = [
    [-1, -1], [-1, 0], [-1, 1],
    [0, 1],           [0, -1],
    [1, -1],  [1, 0], [1, 1]
];

/** Plateau initial avec les 4 pions au centre */
export const INITIAL_BOARD: BoardState = (() => {
    const board: BoardState = Array(64).fill(null);
    board[27] = 'X'; // Ligne 3, Colonne 3 (0-indexed)
    board[28] = 'O'; // Ligne 3, Colonne 4
    board[35] = 'O'; // Ligne 4, Colonne 3
    board[36] = 'X'; // Ligne 4, Colonne 4
    return board;
})();
```

---

### 3. `src/logic/gameLogic.ts`
*Toute la logique métier du jeu. Ces fonctions sont **pures** (pas d'effets de bord, pas de dépendance à React).*

```typescript
import { BoardState, Direction, Player, Pawn } from "../types/gameTypes";
import { DIRECTIONS } from "../constants/gameConstants";

/**
 * Compte le nombre de pions d'un type donné sur le plateau
 */
export function getPawnCount(squares: BoardState, pawn: Player): number {
    return squares.filter((s: Pawn) => s === pawn).length;
}

/**
 * Vérifie si une position (ligne, colonne) est sur le plateau (8x8)
 */
export function isOnBoard(row: number, col: number): boolean {
    return row >= 0 && row < 8 && col >= 0 && col < 8;
}

/**
 * Trouve tous les pions qui seraient retournés si on joue à la position i
 */
export function getFlippedPawns(
    squares: BoardState,
    i: number,
    currentPlayer: Player
): number[] {
    const flipped: number[] = [];
    const row = Math.floor(i / 8);
    const col = i % 8;
    const opponent: Player = currentPlayer === 'X' ? 'O' : 'X';

    for (const [dr, dc] of DIRECTIONS) {
        let r = row + dr;
        let c = col + dc;
        let toFlipInDirection: number[] = [];

        while (isOnBoard(r, c) && squares[r * 8 + c] === opponent) {
            toFlipInDirection.push(r * 8 + c);
            r += dr;
            c += dc;
        }

        if (isOnBoard(r, c) && squares[r * 8 + c] === currentPlayer) {
            flipped.push(...toFlipInDirection);
        }
    }

    return flipped;
}

/**
 * Vérifie si un coup est valide à la position i
 */
export function isValidMove(
    squares: BoardState,
    i: number,
    currentPlayer: Player
): boolean {
    if (squares[i] !== null) return false;
    return getFlippedPawns(squares, i, currentPlayer).length > 0;
}

/**
 * Vérifie si le joueur a au moins un coup valide
 */
export function hasValidMoves(
    squares: BoardState,
    currentPlayer: Player
): boolean {
    for (let i = 0; i < squares.length; i++) {
        if (isValidMove(squares, i, currentPlayer)) {
            return true;
        }
    }
    return false;
}

/**
 * Retourne les pions après un coup valide (modifie le tableau en place)
 * @returns true si des pions ont été retournés
 */
export function flipPawns(
    nextSquares: BoardState,
    i: number,
    currentPlayer: Player
): boolean {
    const flipped = getFlippedPawns(nextSquares, i, currentPlayer);
    for (const index of flipped) {
        nextSquares[index] = currentPlayer;
    }
    return flipped.length > 0;
}

/**
 * Calcule tous les coups valides pour un joueur donné
 */
export function getAllValidMoves(
    squares: BoardState,
    currentPlayer: Player
): number[] {
    const validMoves: number[] = [];
    for (let i = 0; i < squares.length; i++) {
        if (isValidMove(squares, i, currentPlayer)) {
            validMoves.push(i);
        }
    }
    return validMoves;
}

/**
 * Génère une description textuelle pour un coup dans l'historique
 */
export function getMoveDescription(
    history: BoardState[],
    move: number
): string {
    if (move <= 0) {
        return "Go to game start";
    }

    const squares = history[move];
    const prevSquares = history[move - 1];

    // Trouve la case modifiée
    let squareIndex = -1;
    for (let i = 0; i < squares.length; i++) {
        if (squares[i] !== prevSquares[i]) {
            squareIndex = i;
            break;
        }
    }

    const rowIndex = Math.floor(squareIndex / 8) + 1; // 1-indexed
    const colIndex = squareIndex % 8 + 1;          // 1-indexed
    const player = move % 2 === 0 ? "Black" : "White";

    return `#${move} ${player} played [${rowIndex}, ${colIndex}]`;
}

/**
 * Calcule le texte de statut à afficher
 */
export function getStatusText(
    squares: BoardState,
    xIsNext: boolean,
    currentPlayerHasMoves: boolean,
    opponentHasMoves: boolean
): string {
    const blackCount = getPawnCount(squares, 'X');
    const whiteCount = getPawnCount(squares, 'O');

    if (!currentPlayerHasMoves) {
        if (!opponentHasMoves) {
            // Fin de partie
            if (blackCount > whiteCount) return `Game Over! Black: ${blackCount} | White: ${whiteCount} | Black wins!`;
            if (whiteCount > blackCount) return `Game Over! Black: ${blackCount} | White: ${whiteCount} | White wins!`;
            return `Game Over! Black: ${blackCount} | White: ${whiteCount} | Draw!`;
        } else {
            // Le joueur actuel ne peut pas jouer
            return `Black: ${blackCount} | White: ${whiteCount} | ${xIsNext ? 'Black' : 'White'} has no valid moves.`;
        }
    }

    // Jeu en cours
    return `Black: ${blackCount} | White: ${whiteCount} | Next: ${xIsNext ? 'Black (X)' : 'White (O)'}`;
}
```

---

### 4. `src/components/Layout.tsx`
*Composant de mise en page (header, main, footer).*

```typescript
import React, { ReactNode } from "react";

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-800 text-gray-100 flex flex-col">
            {/* Header */}
            <header className="bg-green-800/80 backdrop-blur-md border-b border-green-500/20 rounded-b-xl mx-4 mt-4 px-6 py-4">
                <h1 className="text-2xl font-bold text-center text-green-300">Othello</h1>
                <p className="text-center text-sm text-gray-300 mt-1">Jeu de stratégie Reversi</p>
            </header>

            {/* Main Content */}
            <main className="flex-1 px-4 pb-4">{children}</main>

            {/* Footer */}
            <footer className="bg-green-800/80 backdrop-blur-md border-t border-green-500/20 rounded-t-xl mx-4 mb-4 px-6 py-4">
                <p className="text-center text-sm text-gray-300">
                    My Mini Othello © {new Date().getFullYear()}
                </p>
            </footer>
        </div>
    );
}
```

---

### 5. `src/components/Square.tsx`
*Composant représentant une seule case du plateau.*

```typescript
import React from "react";
import { SquareProps, Pawn } from "../types/gameTypes";

export default function Square({
    value,
    onSquareClick,
    isPossibleMove
}: SquareProps): React.ReactElement {
    const hasPawn = value === 'X' || value === 'O';
    const pawnClass = value === 'X'
        ? 'bg-gradient-to-br from-gray-900 to-gray-700'
        : 'bg-gradient-to-br from-gray-100 to-gray-300';

    return (
        <button
            className={`
                square relative float-left w-[12.5%] aspect-square
                bg-gradient-to-br from-green-800 to-green-700
                border-r border-b border-green-900/50
                transition-all duration-200 ease-in-out
                hover:bg-gradient-to-br hover:from-green-600 hover:to-green-500
                hover:scale-105 hover:z-10 hover:shadow-lg
                ${isPossibleMove ? 'bg-gradient-to-br from-green-600 to-green-500 border-2 border-green-400' : ''}
                ${hasPawn ? 'cursor-default' : 'cursor-pointer'}
                rounded-sm
            `}
            onClick={onSquareClick}
            aria-label={
                value === 'X' ? 'black pawn' :
                value === 'O' ? 'white pawn' :
                isPossibleMove ? 'possible move' : 'empty square'
            }
        >
            {hasPawn ? (
                <span
                    className={`
                        pawn absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[70%] aspect-square rounded-full
                        shadow-lg shadow-black/50
                        ${pawnClass}
                        ${value === 'X' ? 'border border-gray-900' : 'border border-gray-300'}
                    `}
                />
            ) : isPossibleMove && (
                <span
                    className="
                        possible-move-indicator absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[24%] aspect-square rounded-full
                        bg-gradient-to-r from-green-400 to-green-500
                        shadow-md shadow-green-400 animate-pulse
                    "
                />
            )}
        </button>
    );
}
```

---

### 6. `src/components/StatusBar.tsx`
*Composant affichant le score et le statut du jeu.*

```typescript
import React from "react";
import { BoardState } from "../types/gameTypes";
import { getPawnCount } from "../logic/gameLogic";

interface StatusBarProps {
    squares: BoardState;
    xIsNext: boolean;
    currentPlayerHasMoves: boolean;
    opponentHasMoves: boolean;
}

export default function StatusBar({
    squares,
    xIsNext,
    currentPlayerHasMoves,
    opponentHasMoves
}: StatusBarProps): React.ReactElement {
    const blackCount = getPawnCount(squares, 'X');
    const whiteCount = getPawnCount(squares, 'O');

    let statusText: string;
    if (!currentPlayerHasMoves) {
        if (!opponentHasMoves) {
            statusText = `Game Over! Black: ${blackCount} | White: ${whiteCount} | ${
                blackCount > whiteCount ? 'Black wins!' :
                whiteCount > blackCount ? 'White wins!' : 'Draw!'
            }`;
        } else {
            statusText = `Black: ${blackCount} | White: ${whiteCount} | ${
                xIsNext ? 'Black' : 'White'
            } has no valid moves.`;
        }
    } else {
        statusText = `Black: ${blackCount} | White: ${whiteCount} | Next: ${
            xIsNext ? 'Black (X)' : 'White (O)'
        }`;
    }

    return (
        <div className="status mx-auto px-2.5 py-2 bg-black/30 rounded-lg font-semibold text-center text-sm text-gray-200 border border-white/10 max-w-[600px] w-full">
            {statusText}
        </div>
    );
}
```

---

### 7. `src/components/Board.tsx`
*Composant du plateau de jeu. Utilise la logique métier de `gameLogic.ts`.*

```typescript
import React from "react";
import { BoardProps, Player, BoardState } from "../types/gameTypes";
import Square from "./Square";
import StatusBar from "./StatusBar";
import {
    getPawnCount,
    hasValidMoves,
    getAllValidMoves,
    isValidMove,
    flipPawns
} from "../logic/gameLogic";

export default function Board({ xIsNext, squares, onPlay }: BoardProps): React.ReactElement {
    const currentPlayer: Player = xIsNext ? 'X' : 'O';
    const validMoves = getAllValidMoves(squares, currentPlayer);
    const currentPlayerHasMoves = validMoves.length > 0;
    const opponent: Player = xIsNext ? 'O' : 'X';
    const opponentHasMoves = hasValidMoves(squares, opponent);

    /**
     * Gère le clic sur une case du plateau
     */
    function handleClick(i: number): void {
        if (squares[i] !== null) return;
        if (!isValidMove(squares, i, currentPlayer)) return;

        const nextSquares: BoardState = squares.slice();
        nextSquares[i] = currentPlayer;
        const flipped = flipPawns(nextSquares, i, currentPlayer);
        if (!flipped) return;
        onPlay(nextSquares);
    }

    /**
     * Génère la structure JSX du plateau 8x8
     */
    const renderBoard = (): JSX.Element => {
        return (
            <>
                {Array(8).fill(null).map((_, rowIndex: number) => (
                    <div className="board-row clear-both" key={rowIndex}>
                        {Array(8).fill(null).map((_, colIndex: number) => {
                            const squareIndex = rowIndex * 8 + colIndex;
                            return (
                                <Square
                                    key={squareIndex}
                                    value={squares[squareIndex]}
                                    onSquareClick={() => handleClick(squareIndex)}
                                    isPossibleMove={validMoves.includes(squareIndex)}
                                />
                            );
                        })}
                    </div>
                ))}
            </>
        );
    };

    return (
        <div className="board-container flex flex-col items-center gap-2.5 flex-1">
            {/* Barre de statut */}
            <StatusBar
                squares={squares}
                xIsNext={xIsNext}
                currentPlayerHasMoves={currentPlayerHasMoves}
                opponentHasMoves={opponentHasMoves}
            />

            {/* Bouton Pass */}
            {!currentPlayerHasMoves && opponentHasMoves && (
                <button
                    className="pass-button block mx-auto bg-gradient-to-br from-green-700 to-green-600 text-gray-100 border border-green-400 rounded-md px-4 py-2.5 font-semibold transition-all hover:from-green-600 hover:to-green-500 hover:border-green-300 hover:shadow-green-400/30"
                    onClick={() => {
                        const nextSquares: BoardState = squares.slice();
                        onPlay(nextSquares);
                    }}
                >
                    Pass Turn
                </button>
            )}

            {/* Plateau de jeu 8x8 */}
            <div className="board w-full max-w-[900px] aspect-square rounded-lg overflow-hidden shadow-inner shadow-black/50 relative">
                {renderBoard()}
            </div>
        </div>
    );
}
```

---

### 8. `src/components/GameInfo.tsx`
*Composant affichant l'historique des coups.*

```typescript
import React from "react";
import { BoardState } from "../types/gameTypes";
import { getMoveDescription } from "../logic/gameLogic";

interface GameInfoProps {
    history: BoardState[];
    currentMove: number;
    ascending: boolean;
    onReverse: () => void;
    onJumpTo: (move: number) => void;
}

export default function GameInfo({
    history,
    currentMove,
    ascending,
    onReverse,
    onJumpTo
}: GameInfoProps): React.ReactElement {
    const moves = history.map((squares: BoardState, move: number) => {
        const description = getMoveDescription(history, move);
        return (
            <li key={move} className="mb-2">
                <button
                    className="w-full text-left px-3 py-2.5 bg-green-800/50 text-gray-300 rounded-md border border-white/10 hover:bg-green-700/70 hover:text-white hover:border-green-400 transition-all"
                    onClick={() => onJumpTo(move)}
                >
                    {description}
                </button>
            </li>
        );
    });

    return (
        <div className="game-info bg-green-800/70 backdrop-blur-md rounded-xl p-3.5 min-w-[200px] max-h-full overflow-y-auto flex flex-col">
            {/* Bouton pour inverser l'ordre */}
            <button
                className="toggle-button bg-gradient-to-br from-green-700 to-green-600 text-gray-100 border border-green-400 rounded-md px-3 py-1.5 text-xs font-semibold mb-2.5 sticky top-0 z-10 self-start transition-all hover:from-green-600 hover:to-green-500 hover:border-green-300 hover:shadow-green-400/30"
                onClick={onReverse}
            >
                Reverse
            </button>

            {/* Liste des coups */}
            <ol className="list-none m-0 p-0 max-h-[calc(100%-40px)] overflow-y-auto">
                {ascending ? moves.reverse() : moves}
            </ol>
        </div>
    );
}
```

---

### 9. `src/App.tsx` (fichier principal)
*Orchestration de l'application. Gère l'état global et la coordination entre composants.*

```typescript
import React, { useState } from "react";
import Layout from "./components/Layout";
import Board from "./components/Board";
import GameInfo from "./components/GameInfo";
import { BoardState } from "./types/gameTypes";
import { INITIAL_BOARD } from "./constants/gameConstants";

/**
 * Composant principal de l'application Othello
 * Gère :
 * - L'historique des coups
 * - La navigation dans l'historique
 * - L'affichage du plateau et de l'historique
 */
export default function App(): React.ReactElement {
    // État pour l'ordre d'affichage de l'historique
    const [ascending, setAscending] = useState<boolean>(false);

    // Historique des états du plateau
    const [history, setHistory] = useState<BoardState[]>([INITIAL_BOARD]);
    // Index du coup actuel dans l'historique
    const [currentMove, setCurrentMove] = useState<number>(0);

    const xIsNext: boolean = currentMove % 2 === 0;
    const currentSquares: BoardState = history[currentMove];

    /**
     * Gère un nouveau coup joué
     */
    function handlePlay(nextSquares: BoardState): void {
        const nextHistory: BoardState[] = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    /**
     * Permet de revenir à un coup précédent dans l'historique
     */
    function jumpTo(nextMove: number): void {
        setCurrentMove(nextMove);
    }

    return (
        <Layout>
            <div className="game flex flex-row gap-5 flex-wrap h-full">
                {/* Partie gauche : plateau de jeu */}
                <div className="game-board bg-gradient-to-br from-green-600 to-green-800 rounded-xl p-3.5 shadow-xl shadow-black/50 flex-1 min-w-[320px] max-w-full max-h-full overflow-y-auto flex flex-col">
                    <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
                    <span className="move-info block text-center mt-2.5 text-sm text-gray-400">
                        You are at move #{currentMove}
                    </span>
                </div>

                {/* Partie droite : historique des coups */}
                <GameInfo
                    history={history}
                    currentMove={currentMove}
                    ascending={ascending}
                    onReverse={() => setAscending(!ascending)}
                    onJumpTo={jumpTo}
                />
            </div>
        </Layout>
    );
}
```

---

---

## ✅ Avantages de cette réorganisation

| **Avantage** | **Explication** | **Impact** |
|--------------|----------------|------------|
| **📦 Meilleure lisibilité** | Chaque fichier fait **< 100 lignes** | Plus facile à comprendre et maintenir |
| **🧪 Testabilité** | `gameLogic.ts` est **100% pur** → testable avec Jest/Vitest | Tests unitaires possibles sans React |
| **🔄 Réutilisabilité** | Les fonctions de logique peuvent être utilisées dans d'autres contextes (ex: IA, simulateur) | Code plus flexible |
| **👥 Collaboration** | Plusieurs développeurs peuvent travailler sur des fichiers différents en parallèle | Moins de conflits Git |
| **⚡ Performances** | Les composants sont plus légers → React peut optimiser le rendu | Meilleure réactivité |
| **🛠️ Maintenance** | Une modification dans les règles du jeu ne touche que `gameLogic.ts` | Moins de risques de bugs |
| **📚 Documentation** | Chaque fichier a un **but clair** → plus facile à documenter | Meilleure onboarding |

---

---

## 🚀 Prochaines étapes

### 1. Créer les dossiers
Ouvre un terminal dans ton projet et exécute :
```bash
cd /home/mael_gu/PrepTranscendance/myMiniOthello
mkdir -p src/{types,logic,constants,components}
```

### 2. Créer les fichiers
Copie le contenu de chaque section ci-dessus dans les fichiers correspondants.

### 3. Supprimer l'ancien fichier
```bash
rm src/App.tsx src/App2.tsx  # (si tu veux garder une copie, renomme-les d'abord)
```

### 4. Vérifier les imports
Assure-toi que tous les chemins d'import sont corrects. Si tu utilises **Vite**, tu peux configurer des alias dans `vite.config.ts` pour simplifier les imports (voir section Bonus).

### 5. Tester l'application
```bash
npm run dev
```
→ L'application devrait fonctionner **exactement comme avant**, mais avec une meilleure structure.

---

---

## 💡 Bonus : Améliorations possibles

---

### 1. Utiliser des alias d'imports
Pour éviter les `../../../`, configure des alias dans `tsconfig.json` :

```json
{
  "compilerOptions": {
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@types/*": ["types/*"],
      "@logic/*": ["logic/*"],
      "@components/*": ["components/*"],
      "@constants/*": ["constants/*"]
    }
  }
}
```

Puis dans les fichiers :
```typescript
import { SquareProps } from "@types/gameTypes";
import { getFlippedPawns } from "@logic/gameLogic";
import Layout from "@components/Layout";
```

> **Note** : Si tu utilises Vite, il faut aussi configurer les alias dans `vite.config.ts` :
> ```typescript
> import { defineConfig } from 'vite';
> import react from '@vitejs/plugin-react';
> import path from 'path';
> 
> export default defineConfig({
>   plugins: [react()],
>   resolve: {
>     alias: {
>       '@': path.resolve(__dirname, './src'),
>       '@types': path.resolve(__dirname, './src/types'),
>       '@logic': path.resolve(__dirname, './src/logic'),
>       '@components': path.resolve(__dirname, './src/components'),
>       '@constants': path.resolve(__dirname, './src/constants'),
>     },
>   },
> });
> ```

---

### 2. Ajouter des tests unitaires
Crée un fichier `src/logic/gameLogic.test.ts` avec **Vitest** ou **Jest** :

```typescript
import { describe, it, expect } from "vitest";
import { isValidMove, getFlippedPawns, INITIAL_BOARD } from "./gameLogic";

describe("Othello Game Logic", () => {
    it("should return true for valid move at position 19 (D3)", () => {
        // X en (3,3)=27, O en (3,4)=28, O en (4,3)=35, X en (4,4)=36
        // Le coup en (2,3)=19 devrait être valide pour X (noir)
        const isValid = isValidMove(INITIAL_BOARD, 19, 'X');
        expect(isValid).toBe(true);
    });

    it("should return flipped pawns for move at position 19", () => {
        const flipped = getFlippedPawns(INITIAL_BOARD, 19, 'X');
        expect(flipped).toContain(28); // Le pion O en (3,4) doit être retourné
    });

    it("should return false for invalid move on occupied square", () => {
        const isValid = isValidMove(INITIAL_BOARD, 27, 'X'); // Case déjà occupée
        expect(isValid).toBe(false);
    });
});
```

> **Installation de Vitest** (si ce n'est pas déjà fait) :
> ```bash
> npm install -D vitest @vitejs/plugin-react @testing-library/react @testing-library/jest-dom jsdom
> ```
> Puis ajoute dans `vite.config.ts` :
> ```typescript
> /// <reference types="vitest" />
> ```

---

### 3. Extraire les styles Tailwind
Pour éviter la duplication des classes Tailwind, tu peux créer un fichier `src/styles/boardStyles.ts` :

```typescript
// src/styles/boardStyles.ts
export const squareBase = `
    relative float-left w-[12.5%] aspect-square
    bg-gradient-to-br from-green-800 to-green-700
    border-r border-b border-green-900/50
    transition-all duration-200 ease-in-out
    rounded-sm
`;

export const squareHover = `
    hover:bg-gradient-to-br hover:from-green-600 hover:to-green-500
    hover:scale-105 hover:z-10 hover:shadow-lg
`;

export const possibleMoveStyle = `
    bg-gradient-to-br from-green-600 to-green-500 border-2 border-green-400
`;

export const pawnStyle = (isBlack: boolean) => `
    pawn absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
    w-[70%] aspect-square rounded-full
    shadow-lg shadow-black/50
    ${isBlack 
        ? 'bg-gradient-to-br from-gray-900 to-gray-700 border border-gray-900' 
        : 'bg-gradient-to-br from-gray-100 to-gray-300 border border-gray-300'
    }
`;
```

> **Utilisation dans `Square.tsx`** :
> ```typescript
> import { squareBase, squareHover, possibleMoveStyle, pawnStyle } from "../styles/boardStyles";
> 
> // Dans le JSX :
> className={`${squareBase} ${squareHover} ${isPossibleMove ? possibleMoveStyle : ''} ${hasPawn ? 'cursor-default' : 'cursor-pointer'}`}
> ```

---

### 4. Utiliser un contexte React pour le jeu
Si tu veux partager l'état du jeu entre plusieurs composants sans prop drilling, tu peux créer un contexte :

```typescript
// src/context/GameContext.tsx
import React, { createContext, useContext, ReactNode } from "react";
import { BoardState, Player } from "../types/gameTypes";
import { INITIAL_BOARD } from "../constants/gameConstants";

interface GameContextType {
    history: BoardState[];
    currentMove: number;
    xIsNext: boolean;
    squares: BoardState;
    handlePlay: (squares: BoardState) => void;
    jumpTo: (move: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

interface GameProviderProps {
    children: ReactNode;
}

export function GameProvider({ children }: GameProviderProps) {
    const [history, setHistory] = React.useState<BoardState[]>([INITIAL_BOARD]);
    const [currentMove, setCurrentMove] = React.useState<number>(0);
    const xIsNext = currentMove % 2 === 0;
    const squares = history[currentMove];

    const handlePlay = (nextSquares: BoardState) => {
        const nextHistory = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    };

    const jumpTo = (nextMove: number) => {
        setCurrentMove(nextMove);
    };

    return (
        <GameContext.Provider value={{ history, currentMove, xIsNext, squares, handlePlay, jumpTo }}>
            {children}
        </GameContext.Provider>
    );
}

export function useGame() {
    const context = useContext(GameContext);
    if (context === undefined) {
        throw new Error("useGame must be used within a GameProvider");
    }
    return context;
}
```

> **Utilisation dans `App.tsx`** :
> ```typescript
> import { GameProvider } from "./context/GameContext";
> 
> function App() {
>     return (
>         <Layout>
>             <GameProvider>
>                 <div className="game flex flex-row gap-5 flex-wrap h-full">
>                     <GameBoard />
>                     <GameInfo />
>                 </div>
>             </GameProvider>
>         </Layout>
>     );
> }
> ```

---

---

## 🔚 Résumé

| **Ancienne structure** | **Nouvelle structure** | **Bénéfice** |
|------------------------|------------------------|--------------|
| 1 fichier `App.tsx` (~300 lignes) | 9 fichiers (< 100 lignes chacun) | ✅ Lisibilité |
| Logique + UI mélangées | Séparation claire des couches | ✅ Maintenabilité |
| Fonctions non testables | Fonctions pures dans `gameLogic.ts` | ✅ Testabilité |
| Types dupliqués | Types centralisés dans `types/` | ✅ Cohérence |
| Difficile à étendre | Architecture modulaire | ✅ Évolutivité |

---

---

## 📌 Checklist avant de commencer

- [ ] J'ai sauvegardé mon projet actuel (`git commit` ou copie de sécurité)
- [ ] J'ai créé les dossiers (`src/types/`, `src/logic/`, `src/constants/`, `src/components/`)
- [ ] J'ai copié le contenu de chaque section dans les bons fichiers
- [ ] J'ai vérifié que tous les imports sont corrects
- [ ] J'ai testé que l'application fonctionne toujours (`npm run dev`)
- [ ] J'ai supprimé l'ancien `App.tsx` ou `App2.tsx`

---

---

## 💬 Besoin d'aide ?

Si tu bloques sur une étape ou si tu veux que je t'aide à :
1. **Créer les fichiers** directement dans ton projet
2. **Configurer les alias** ou les tests
3. **Adapter la structure** à tes besoins spécifiques
4. **Ajouter de nouvelles fonctionnalités** (ex: IA, multi-joueur)

→ **Dis-le-moi !** Je peux générer les fichiers directement ou t'expliquer en détail.

---

*Bon courage pour la réorganisation ! 🚀*  
*Ton code sera bien plus propre et maintenable après cette refactorisation.*
