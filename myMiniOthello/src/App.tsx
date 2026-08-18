/**
 * Jeu Othello (Reversi) en React avec TypeScript
 * Ce fichier contient toute la logique du jeu :
 * - Composant Square : une case du plateau
 * - Composant Board : le plateau de jeu avec la logique des règles
 * - Composant Game : gestion de l'historique et de l'interface
 */

import React, { useState, ReactElement } from "react";

// Import des types JSX pour les éléments HTML
// Cela résout l'erreur "JSX element implicitly has type 'any'"
/// <reference types="react" />
/// <reference types="react-dom" />

// ===== TYPES =====

/** Type pour représenter un pion ou une case vide */
export type Pawn = 'X' | 'O' | null;

/** Type pour représenter un plateau (tableau de 64 cases) */
export type BoardState = Pawn[];

/** Type pour représenter une direction (délta ligne, déltra colonne) */
export type Direction = [number, number];

/** Type pour représenter un joueur */
export type Player = 'X' | 'O';

// ===== INTERFACES =====

/** Props pour le composant Square */
interface SquareProps {
    /** Valeur de la case : 'X' (noir), 'O' (blanc) ou null (vide) */
    value: Pawn;
    /** Fonction appelée lors du clic sur la case */
    onSquareClick: () => void;
    /** Indique si un coup est possible à cette position */
    isPossibleMove: boolean;
}

/** Props pour le composant Board */
interface BoardProps {
    /** Indique si c'est au tour des noirs (X) */
    xIsNext: boolean;
    /** État actuel du plateau */
    squares: BoardState;
    /** Fonction appelée après un coup valide */
    onPlay: (squares: BoardState) => void;
}

/**
 * Composant Square
 * Représente une case du plateau de jeu.
 * 
 * Affichage :
 * - Un pion noir ou blanc si la case est occupée
 * - Un indicateur lumineux si la case est un coup valide
 */
function Square({ value, onSquareClick, isPossibleMove }: SquareProps): React.ReactElement {
    const hasPawn = value === 'X' || value === 'O';
    const pawnClass = value === 'X' ? 'black-pawn' : value === 'O' ? 'white-pawn' : '';

    return (
        <button
            className={`square ${isPossibleMove ? 'possible-move' : ''}`}
            onClick={onSquareClick}
            aria-label={value === 'X' ? 'black pawn' : value === 'O' ? 'white pawn' : isPossibleMove ? 'possible move' : 'empty square'}
        >
            {hasPawn ? (
                <span className={`pawn ${pawnClass}`.trim()} />
            ) : isPossibleMove && (
                <span className="possible-move-indicator" />
            )}
        </button>
    );
}

/**
 * Composant Board
 * Gère le plateau de jeu et la logique des règles Othello.
 * 
 * Règles implémentées :
 * - Un coup est valide s'il encercle au moins un pion adverse
 * - Les pions encerclés sont retournés
 * - Si un joueur ne peut pas jouer, il peut passer son tour
 * - Le jeu se termine quand aucun joueur ne peut plus jouer
 */
function Board({ xIsNext, squares, onPlay }: BoardProps): React.ReactElement {

    // Toutes les directions possibles pour vérifier les pions à retourner (8 directions : diagonales, horizontal, vertical)
    const directions: Direction[] = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, 1],           [0, -1],
        [1, -1],  [1, 0], [1, 1]
    ];

    /**
     * Compte le nombre de pions d'un type donné sur le plateau
     * @param squares - État actuel du plateau
     * @param pawn - 'X' pour les noirs ou 'O' pour les blancs
     * @returns Nombre de pions
     */
    function getPawnCount(squares: BoardState, pawn: Player): number {
        return squares.filter((s: Pawn) => s === pawn).length;
    }

    /**
     * Vérifie si une position (ligne, colonne) est sur le plateau (8x8)
     * @param row - Index de la ligne (0-7)
     * @param col - Index de la colonne (0-7)
     * @returns true si la position est valide
     */
    function isOnBoard(row: number, col: number): boolean {
        return row >= 0 && row < 8 && col >= 0 && col < 8;
    }

    /**
     * Trouve tous les pions qui seraient retournés si on joue à la position i
     * 
     * Algorithme :
     * Pour chaque direction, on avance tant qu'on trouve des pions adverses.
     * Si on trouve un pion du joueur actuel à la fin, tous les pions adverses
     * intermédiaires sont retournés.
     * 
     * @param squares - État actuel du plateau
     * @param i - Index de la case où on veut jouer (0-63)
     * @param currentPlayer - 'X' ou 'O', le joueur qui veut jouer
     * @returns Tableau des index des pions à retourner
     */
    function getFlippedPawns(squares: BoardState, i: number, currentPlayer: Player): number[] {
        const flipped: number[] = [];
        const row = Math.floor(i / 8);
        const col = i % 8;
        const opponent: Player = currentPlayer === 'X' ? 'O' : 'X';

        // Vérifie chaque direction pour trouver des pions à retourner
        for (const [dr, dc] of directions) {
            let r = row + dr;
            let c = col + dc;
            let toFlipInDirection: number[] = [];

            // Avance dans la direction tant qu'on trouve des pions adverses
            while (isOnBoard(r, c) && squares[r * 8 + c] === opponent) {
                toFlipInDirection.push(r * 8 + c);
                r += dr;
                c += dc;
            }

            // Si on trouve un pion du joueur actuel à la fin, les pions intermédiaires sont retournables
            if (isOnBoard(r, c) && squares[r * 8 + c] === currentPlayer) {
                flipped.push(...toFlipInDirection);
            }
        }

        return flipped;
    }

    /**
     * Vérifie si un coup est valide à la position i
     * Un coup est valide si :
     * - La case est vide
     * - Elle permet de retourner au moins un pion adverse
     * 
     * @param squares - État actuel du plateau
     * @param i - Index de la case à vérifier
     * @param currentPlayer - Joueur actuel
     * @returns true si le coup est valide
     */
    function isValidMove(squares: BoardState, i: number, currentPlayer: Player): boolean {
        if (squares[i] !== null) return false;
        return getFlippedPawns(squares, i, currentPlayer).length > 0;
    }

    /**
     * Vérifie si le joueur a au moins un coup valide
     * @param squares - État actuel du plateau
     * @param currentPlayer - Joueur à vérifier
     * @returns true si le joueur peut jouer
     */
    function hasValidMoves(squares: BoardState, currentPlayer: Player): boolean {
        for (let i = 0; i < squares.length; i++) {
            if (isValidMove(squares, i, currentPlayer)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Retourne les pions adverses après un coup valide
     * @param nextSquares - Nouvelle état du plateau (sera modifié)
     * @param i - Position où le coup a été joué
     * @param currentPlayer - Joueur qui a joué
     * @returns true si des pions ont été retournés
     */
    function flipPawn(nextSquares: BoardState, i: number, currentPlayer: Player): boolean {
        const flipped = getFlippedPawns(nextSquares, i, currentPlayer);
        for (const index of flipped) {
            nextSquares[index] = currentPlayer;
        }
        return flipped.length > 0;
    }

    /**
     * Gère le clic sur une case du plateau
     * 
     * Actions :
     * - Vérifie que la case est vide
     * - Vérifie que le coup est valide pour le joueur actuel
     * - Met à jour le plateau avec le nouveau pion et les pions retournés
     * - Appelle onPlay pour notifier le parent
     * 
     * @param i - Index de la case cliquée
     */
    function handleClick(i: number): void {
        if (squares[i] !== null) return;  // Case déjà occupée

        const currentPlayer: Player = xIsNext ? 'X' : 'O';
        if (!isValidMove(squares, i, currentPlayer)) return;  // Coup invalide

        const nextSquares: BoardState = squares.slice();
        nextSquares[i] = currentPlayer;
        const flipped = flipPawn(nextSquares, i, currentPlayer);
        if (!flipped) return;  // Aucun pion retourné, coup invalide
        onPlay(nextSquares);
    }

    // Compte les pions de chaque couleur
    const blackCount = getPawnCount(squares, 'X');
    const whiteCount = getPawnCount(squares, 'O');
    const currentPlayer: Player = xIsNext ? 'X' : 'O';

    // Calcule tous les coups valides pour le joueur actuel (pour la mise en surbrillance)
    const validMoves: number[] = [];
    for (let i = 0; i < squares.length; i++) {
        if (isValidMove(squares, i, currentPlayer)) {
            validMoves.push(i);
        }
    }

    // Vérifie si le joueur actuel peut jouer
    const currentPlayerHasMoves = validMoves.length > 0;
    const opponent: Player = xIsNext ? 'O' : 'X';
    const opponentHasMoves = hasValidMoves(squares, opponent);

    // Gestion du texte de statut
    // Affichage normal : compte des pions + joueur suivant
    // Si le joueur actuel ne peut pas jouer :
    //   - Si l'adversaire ne peut pas jouer non plus : fin de partie avec résultat
    //   - Sinon : indication que le joueur actuel ne peut pas jouer (il devra passer)
    let statusText: string = `Black: ${blackCount} | White: ${whiteCount} | Next: ${xIsNext ? 'Black (X)' : 'White (O)'}`;
    if (!currentPlayerHasMoves) {
        if (!opponentHasMoves) {
            // Fin de partie : aucun joueur ne peut jouer
            statusText = `Game Over! Black: ${blackCount} | White: ${whiteCount} | ${blackCount > whiteCount ? 'Black wins!' : whiteCount > blackCount ? 'White wins!' : 'Draw!'}`;
        } else {
            // Le joueur actuel ne peut pas jouer, mais l'adversaire peut
            statusText = `Black: ${blackCount} | White: ${whiteCount} | ${xIsNext ? 'Black' : 'White'} has no valid moves.`;
        }
    }

    /**
     * Génère la structure JSX du plateau 8x8
     * Crée une grille de 8 lignes (board-row) contenant chacune 8 cases (Square)
     * 
     * @returns Le plateau complet
     */
    const initializeBoard = (): JSX.Element => {
        return (
            <>
            {Array(8)
            .fill(null)
            .map((_, rowIndex: number) => (
                <div className="board-row" key={rowIndex}>
                    {
                        Array(8)
                        .fill(null)
                        .map((_, colIndex: number) => {
                            // Calcule l'index linéaire (0-63) à partir des coordonnées 2D
                            const squareIndex = rowIndex * 8 + colIndex;
                            return (
                                <Square
                                    key={squareIndex}
                                    value={squares[squareIndex]}
                                    onSquareClick={() => handleClick(squareIndex)}
                                    // Met en surbrillance les cases où un coup est valide
                                    isPossibleMove={validMoves.includes(squareIndex)}
                                />
                            );
                        })
                    }
                </div>
            ))}
            </>
        );
    };

    return ( 
        <div className="board-container">
            {/* Barre de statut affichant le score et le tour actuel */}
            <div className="status">{statusText}</div>
            {/* Bouton Pass : permet de passer son tour si le joueur ne peut pas jouer
                 mais que l'adversaire peut encore jouer */}
            {!currentPlayerHasMoves && opponentHasMoves && (
                <button 
                    className="pass-button" 
                    onClick={() => {
                        // Passer son tour : on appelle onPlay avec le même plateau
                        // Cela change simplement le joueur actuel sans modifier le plateau
                        const nextSquares: BoardState = squares.slice();
                        onPlay(nextSquares);
                    }}
                >
                    Pass Turn
                </button>
            )}
            {/* Plateau de jeu 8x8 */}
            <div className="board">
                {initializeBoard()}
            </div>
        </div>
    );
}

/**
 * Composant Game (principal)
 * Gère l'état global du jeu :
 * - Historique des coups (pour permettre l'annulation)
 * - Navigation dans l'historique
 * - Affichage du plateau et de la liste des coups
 */
export default function Game(): React.ReactElement {

    // État pour l'ordre d'affichage de l'historique (croissant/décroissant)
    const [ascending, setAscending] = useState<boolean>(false);

    // Configuration initiale du plateau : 4 pions au centre
    // Position :
    //   27 = ligne 3, colonne 3 (0-indexé : 3*8+3 = 27)
    //   28 = ligne 3, colonne 4
    //   35 = ligne 4, colonne 3
    //   36 = ligne 4, colonne 4
    //   X (noir) en haut à gauche et bas à droite
    //   O (blanc) en haut à droite et bas à gauche
    const initialBoard: BoardState = Array(64).fill(null);
    initialBoard[27] = 'X';
    initialBoard[28] = 'O';
    initialBoard[35] = 'O';
    initialBoard[36] = 'X';

    // Historique des états du plateau
    const [history, setHistory] = useState<BoardState[]>([initialBoard]);
    // Index du coup actuel dans l'historique
    const [currentMove, setCurrentMove] = useState<number>(0);
    // Détermine quel joueur doit jouer (X = noir, O = blanc)
    const xIsNext: boolean = currentMove % 2 === 0;
    // État actuel du plateau
    const currentSquares: BoardState = history[currentMove];

    /**
     * Gère un nouveau coup joué
     * Met à jour l'historique en conservant les coups jusqu'au coup actuel
     * puis ajoute le nouveau plateau.
     * 
     * @param nextSquares - Nouveau état du plateau après le coup
     */
    function handlePlay(nextSquares: BoardState): void {
        // Conserve l'historique jusqu'au coup actuel et ajoute le nouveau plateau
        // Cela permet d'annuler les coups futurs si on revient en arrière
        const nextHistory: BoardState[] = [...history.slice(0, currentMove + 1), nextSquares];
        setHistory(nextHistory);
        setCurrentMove(nextHistory.length - 1);
    }

    /**
     * Permet de revenir à un coup précédent dans l'historique
     * @param nextMove - Index du coup vers lequel revenir
     */
    function jumpTo(nextMove: number): void {
        setCurrentMove(nextMove);
    }

    /**
     * Génère la liste des coups pour l'historique
     * Chaque élément permet de revenir à un état précédent du jeu
     */
    const moves = history.map((squares: BoardState, move: number) => {
        let description: string;
        if (move > 0) {
            // Trouve la différence entre ce coup et le précédent
            const prevSquares: BoardState = history[move - 1];
            let squareIndex: number = -1;
            for (let i = 0; i < squares.length; i++) {
                if (squares[i] !== prevSquares[i]) {
                    squareIndex = i;
                    break;
                }
            }
            // Convertit l'index linéaire en coordonnées 1-indexées pour l'affichage
            const rowIndex: number = Math.floor(squareIndex / 8) + 1;
            const colIndex: number = squareIndex % 8 + 1;
            // Détermine quel joueur a joué (pair = Black/X, impair = White/O)
            description = `#${move} ${move % 2 === 0 ? "Black" : "White"} played [${rowIndex}, ${colIndex}]`;
        } else {
            // Premier élément : retour au début du jeu
            description = "Go to game start";
        }
        return (
            <li key={move}>
                <button onClick={() => jumpTo(move)}>{description}</button>
            </li>
        );
    });

    return (
        <div className="game">
            {/* Partie gauche : plateau de jeu */}
            <div className="game-board">
                <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
                {/* Indicateur du coup actuel */}
                <span className="move-info">You are at move #{currentMove}</span>
            </div>
            {/* Partie droite : historique des coups */}
            <div className="game-info">
                {/* Bouton pour inverser l'ordre de l'historique */}
                <button className="toggle-button" onClick={() => setAscending(!ascending)}>
                    Reverse
                </button>
                {/* Liste des coups avec navigation */}
                <ol>{ascending ? moves.reverse() : moves}</ol>
            </div>
        </div>
    );
}
